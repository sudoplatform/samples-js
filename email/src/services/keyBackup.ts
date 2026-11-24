import {
  InvalidKeyArchiveError,
  KeyArchiveNotImportableError,
  SudoEmailClient,
} from '@sudoplatform/sudo-email'
import { SudoUserClient } from '@sudoplatform/sudo-user'
import { fromBase64, toBase64 } from '@util/format'
import {
  PROFILES_KEY_NAMESPACE,
  emailKeyManager,
  profilesKeyManager,
} from './deviceKeys'
import {
  StoredSudoKey,
  isValidSudoKey,
  loadSudoKeys,
  replaceSudoKeys,
} from './sudoKeyStore'

/**
 * Backs up the keys this device uses to encrypt and decrypt user data, so they can be moved to another device
 * signed in as the same user: the Sudo keys, and the keys that unseal each email address's messages.
 *
 * The backup file follows the Sudo Key Backup Format shared with the other Sudo Platform sample apps: JSON
 * describing how the payload was encrypted (PBKDF2-HMAC-SHA256 and AES-256-GCM), and the encrypted payload.
 * The payload holds the Sudo keys under `sdks.sudoProfiles` and the email SDK's own key archive under
 * `sdks.sudoEmail`.
 */
const FORMAT = 'sudoplatform-sample-key-backup'
const VERSION = 1
const PLATFORM = 'web'
const KDF_ALGORITHM = 'PBKDF2-HMAC-SHA256'
const CIPHER_ALGORITHM = 'AES-256-GCM'
const ITERATIONS = 600_000
const MIN_ITERATIONS = 100_000
const MAX_ITERATIONS = 10_000_000
const SALT_SIZE = 32
const NONCE_SIZE = 12
const TAG_SIZE = 16

/** Informational: the cipher the Sudo Profiles SDK encrypts claims with, on every platform. */
const SUDO_KEY_ALGORITHM = 'AES/CBC/PKCS7Padding'

export const MIN_PASSWORD_LENGTH = 8

export class KeyBackupError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'KeyBackupError'
  }
}

interface KeyBackupFile {
  format: string
  version: number
  createdAt: string
  platform: string
  kdf: { algorithm: string; iterations: number; salt: string }
  cipher: { algorithm: string; nonce: string }
  ciphertext: string
}

interface PayloadSudoKey {
  id: string
  namespace: string
  algorithm: string
  version: number
  /** Base64 encoded raw key bytes. */
  key: string
}

interface KeyBackupPayload {
  sudoProfiles?: { currentKeyId: string; keys: PayloadSudoKey[] }
  /** The email SDK's own key archive, carried unchanged. */
  sudoEmail?: { archive: Uint8Array }
  /** Names of SDK entries in the backup that this app doesn't use. They're skipped on import. */
  unrecognisedSdks: string[]
  /** The subject of the user whose keys these are. */
  userSubject?: string
}

/** A backup file that has been read and checked, but not yet decrypted. */
export interface ReadKeyBackup {
  file: KeyBackupFile
  platform: string
  createdAt: Date
}

export interface KeyBackupImportResult {
  sudoKeyCount: number
  importedEmailKeys: boolean
  /** True if the backup had no shared email key pair, so single key mode had to create a new one. */
  createdSingletonKeys: boolean
  unrecognisedSdks: string[]
}

const KNOWN_SDKS = new Set(['sudoProfiles', 'sudoEmail'])

// Copies into a buffer the Web Crypto API accepts.
const bytes = (data: Uint8Array): Uint8Array<ArrayBuffer> =>
  new Uint8Array(data)

const toArrayBuffer = (data: Uint8Array): ArrayBuffer =>
  data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer

const deriveKey = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
  usage: KeyUsage,
): Promise<CryptoKey> => {
  // Normalised so the same characters typed on different keyboards or platforms give the same key.
  const passwordBytes = new TextEncoder().encode(password.normalize('NFC'))
  const material = await crypto.subtle.importKey(
    'raw',
    bytes(passwordBytes),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: bytes(salt), iterations },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  )
}

const encodePayload = (payload: KeyBackupPayload): Uint8Array => {
  const sdks: Record<string, unknown> = {}
  if (payload.sudoProfiles) sdks.sudoProfiles = payload.sudoProfiles
  if (payload.sudoEmail) {
    sdks.sudoEmail = { archive: toBase64(payload.sudoEmail.archive) }
  }
  const json: Record<string, unknown> = { sdks }
  if (payload.userSubject) json.user = { subject: payload.userSubject }
  return new TextEncoder().encode(JSON.stringify(json))
}

interface RawPayload {
  sdks?: {
    sudoProfiles?: { currentKeyId?: unknown; keys?: unknown }
    sudoEmail?: { archive?: unknown }
    [name: string]: unknown
  }
  user?: { subject?: unknown }
}

const decodePayload = (data: Uint8Array): KeyBackupPayload => {
  const incomplete = new KeyBackupError(
    "This backup's contents are incomplete, so it can't be imported.",
  )
  let json: RawPayload
  try {
    json = JSON.parse(new TextDecoder().decode(data)) as RawPayload
  } catch {
    throw incomplete
  }
  const sdks = json?.sdks
  if (!sdks || typeof sdks !== 'object') throw incomplete
  const { sudoProfiles, sudoEmail } = sdks
  if (
    sudoProfiles &&
    (typeof sudoProfiles.currentKeyId !== 'string' ||
      !Array.isArray(sudoProfiles.keys))
  ) {
    throw incomplete
  }
  let archive: Uint8Array | undefined
  if (sudoEmail) {
    if (typeof sudoEmail.archive !== 'string') throw incomplete
    try {
      archive = fromBase64(sudoEmail.archive)
    } catch {
      throw incomplete
    }
  }
  const subject = json.user?.subject
  return {
    sudoProfiles: sudoProfiles
      ? {
          currentKeyId: sudoProfiles.currentKeyId as string,
          keys: sudoProfiles.keys as PayloadSudoKey[],
        }
      : undefined,
    sudoEmail: archive ? { archive } : undefined,
    unrecognisedSdks: Object.keys(sdks)
      .filter((name) => !KNOWN_SDKS.has(name))
      .sort(),
    userSubject: typeof subject === 'string' ? subject : undefined,
  }
}

/** Checks `data` is a backup this app can decrypt, before asking the user for the password. */
export const readKeyBackup = (data: ArrayBuffer): ReadKeyBackup => {
  let file: KeyBackupFile
  try {
    file = JSON.parse(new TextDecoder().decode(data)) as KeyBackupFile
    if (file.format !== FORMAT) throw new Error('Not a key backup')
    if (!Number.isInteger(file.version) || file.version < 1) {
      throw new Error('No format version')
    }
    fromBase64(file.kdf.salt)
    fromBase64(file.cipher.nonce)
    fromBase64(file.ciphertext)
  } catch {
    throw new KeyBackupError("This file isn't a Sudo key backup.")
  }
  if (file.version > VERSION) {
    throw new KeyBackupError(
      `This backup was made by a newer version of the app (format version ${file.version}). Update the app and try again.`,
    )
  }
  if (
    file.kdf.algorithm !== KDF_ALGORITHM ||
    !(
      file.kdf.iterations >= MIN_ITERATIONS &&
      file.kdf.iterations <= MAX_ITERATIONS
    ) ||
    file.cipher.algorithm !== CIPHER_ALGORITHM ||
    fromBase64(file.cipher.nonce).length !== NONCE_SIZE ||
    fromBase64(file.kdf.salt).length === 0
  ) {
    throw new KeyBackupError(
      "This backup uses encryption settings this app doesn't support.",
    )
  }
  const createdAt = new Date(file.createdAt)
  if (Number.isNaN(createdAt.getTime())) {
    throw new KeyBackupError("This file isn't a Sudo key backup.")
  }
  return { file, platform: file.platform, createdAt }
}

const seal = async (
  payload: KeyBackupPayload,
  password: string,
): Promise<Uint8Array<ArrayBuffer>> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE))
  const nonce = crypto.getRandomValues(new Uint8Array(NONCE_SIZE))
  const key = await deriveKey(password, salt, ITERATIONS, 'encrypt')
  // The output is the ciphertext followed by the tag, the layout the file stores.
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: TAG_SIZE * 8 },
      key,
      bytes(encodePayload(payload)),
    ),
  )
  const file: KeyBackupFile = {
    format: FORMAT,
    version: VERSION,
    // iOS decodes ISO 8601 dates without fractional seconds only.
    createdAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    platform: PLATFORM,
    kdf: {
      algorithm: KDF_ALGORITHM,
      iterations: ITERATIONS,
      salt: toBase64(salt),
    },
    cipher: { algorithm: CIPHER_ALGORITHM, nonce: toBase64(nonce) },
    ciphertext: toBase64(ciphertext),
  }
  return new TextEncoder().encode(JSON.stringify(file, undefined, 2))
}

const open = async (
  { file }: ReadKeyBackup,
  password: string,
): Promise<KeyBackupPayload> => {
  const wrongPassword = new KeyBackupError(
    'The password is wrong or the file is damaged. Check the password and try again.',
  )
  const ciphertext = fromBase64(file.ciphertext)
  if (ciphertext.length < TAG_SIZE) throw wrongPassword
  let plaintext: ArrayBuffer
  try {
    const key = await deriveKey(
      password,
      fromBase64(file.kdf.salt),
      file.kdf.iterations,
      'decrypt',
    )
    plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: bytes(fromBase64(file.cipher.nonce)),
        tagLength: TAG_SIZE * 8,
      },
      key,
      bytes(ciphertext),
    )
  } catch {
    // A wrong password and a modified file both fail the GCM tag check, so they can't be told apart.
    throw wrongPassword
  }
  return decodePayload(new Uint8Array(plaintext))
}

export interface KeyBackupClients {
  emailClient: SudoEmailClient
  sudoUserClient: SudoUserClient
  /** True if every email address shares one key pair. */
  enforceSingletonPublicKey: boolean
}

/**
 * Returns the email key archive, or undefined if this device has no email keys, for example because no
 * address has been provisioned. An empty archive is left out of a backup.
 */
const exportEmailKeys = async (
  emailClient: SudoEmailClient,
): Promise<ArrayBuffer | undefined> => {
  if ((await emailKeyManager.exportKeys()).length === 0) {
    return undefined
  }
  return await emailClient.exportKeys()
}

const toPayloadKey = ({ id, key }: StoredSudoKey): PayloadSudoKey => ({
  id,
  namespace: PROFILES_KEY_NAMESPACE,
  algorithm: SUDO_KEY_ALGORITHM,
  version: 1,
  key: toBase64(key),
})

/** Exports this device's keys as a backup file protected by `password`. */
export const exportKeyBackup = async (
  { emailClient, sudoUserClient }: KeyBackupClients,
  password: string,
): Promise<Uint8Array<ArrayBuffer>> => {
  const sudoKeys = loadSudoKeys()
  if (!sudoKeys || sudoKeys.keys.length === 0) {
    throw new KeyBackupError(
      'There are no keys on this device to export. Sign in and try again.',
    )
  }
  const emailArchive = await exportEmailKeys(emailClient)
  return await seal(
    {
      sudoProfiles: {
        currentKeyId: sudoKeys.currentKeyId,
        keys: sudoKeys.keys.map(toPayloadKey),
      },
      sudoEmail: emailArchive
        ? { archive: new Uint8Array(emailArchive) }
        : undefined,
      unrecognisedSdks: [],
      userSubject: await sudoUserClient.getSubject(),
    },
    password,
  )
}

/** Checks every key before any is imported, so a bad key can't leave the device with only some. */
const validateSudoKeys = (sudoProfiles: {
  currentKeyId: string
  keys: PayloadSudoKey[]
}): StoredSudoKey[] => {
  const invalid = new KeyBackupError(
    "This backup's contents are incomplete, so it can't be imported.",
  )
  const ids = sudoProfiles.keys.map((k) => k?.id)
  if (
    new Set(ids).size !== ids.length ||
    !ids.includes(sudoProfiles.currentKeyId)
  ) {
    throw invalid
  }
  // The namespace, algorithm and version are informational and differ between platforms, so only the id
  // and the raw key bytes are used.
  return sudoProfiles.keys.map(({ id, key }) => {
    let keyBytes: Uint8Array
    try {
      keyBytes = fromBase64(key)
    } catch {
      throw invalid
    }
    if (typeof id !== 'string' || !id || !isValidSudoKey(keyBytes)) {
      throw invalid
    }
    return { id, key: keyBytes }
  })
}

/**
 * Imports an email key archive, turning the errors the email SDK throws before it changes any key into
 * messages for the user.
 */
const importEmailKeys = async (
  emailClient: SudoEmailClient,
  archive: ArrayBuffer,
): Promise<void> => {
  try {
    await emailClient.importKeys(archive)
  } catch (error) {
    if (error instanceof KeyArchiveNotImportableError) {
      throw new KeyBackupError(
        "This backup's email keys were exported under a different key namespace, for example by another app, so this app can't import them. Nothing was imported.",
      )
    }
    if (error instanceof InvalidKeyArchiveError) {
      throw new KeyBackupError(
        "This backup's email keys can't be read, so nothing was imported.",
      )
    }
    throw error
  }
}

/**
 * Decrypts a backup with `password` and imports its keys, unless it was exported by another user. The Sudo
 * keys are merged with this device's, so Sudos made here before the import stay readable, and the backup's
 * current key becomes the one new Sudos are encrypted with. The email keys replace this device's, so email
 * keys created here since the backup was made are lost. If the import fails part way, this device's keys
 * are put back as they were.
 */
export const importKeyBackup = async (
  { emailClient, sudoUserClient, enforceSingletonPublicKey }: KeyBackupClients,
  backup: ReadKeyBackup,
  password: string,
): Promise<KeyBackupImportResult> => {
  const payload = await open(backup, password)
  if (
    payload.userSubject &&
    payload.userSubject !== (await sudoUserClient.getSubject())
  ) {
    throw new KeyBackupError(
      'This backup belongs to a different user. Sign in as that user to import it.',
    )
  }
  if (!payload.sudoProfiles || payload.sudoProfiles.keys.length === 0) {
    throw new KeyBackupError("This backup doesn't contain any Sudo keys.")
  }
  const importedKeys = validateSudoKeys(payload.sudoProfiles)
  const existing = loadSudoKeys()
  const existingEmailArchive = payload.sudoEmail
    ? await exportEmailKeys(emailClient)
    : undefined

  // Keys with the same id should be identical, so which copy wins doesn't matter.
  const merged = new Map<string, StoredSudoKey>()
  existing?.keys.forEach((k) => merged.set(k.id, k))
  importedKeys.forEach((k) => merged.set(k.id, k))

  // The email keys go first: the email SDK checks the archive before it changes any key, so a backup whose
  // email keys can't be imported is rejected with every key on this device untouched.
  let emailKeysChanged = false
  let sudoKeysChanged = false
  try {
    if (payload.sudoEmail && payload.sudoEmail.archive.length > 0) {
      try {
        await importEmailKeys(
          emailClient,
          toArrayBuffer(payload.sudoEmail.archive),
        )
      } catch (error) {
        // The SDK leaves the keys unchanged when it rejects the archive, but not when saving them fails.
        emailKeysChanged = !(error instanceof KeyBackupError)
        throw error
      }
      emailKeysChanged = true
    }
    sudoKeysChanged = true
    await replaceSudoKeys(profilesKeyManager, {
      currentKeyId: payload.sudoProfiles.currentKeyId,
      keys: Array.from(merged.values()),
    })
  } catch (error) {
    // Put this device's keys back rather than leave it with only some of the backup's.
    try {
      if (sudoKeysChanged && existing) {
        await replaceSudoKeys(profilesKeyManager, existing)
      }
      if (emailKeysChanged) {
        await emailKeyManager.removeAllKeys()
        if (existingEmailArchive) {
          await emailClient.importKeys(existingEmailArchive)
        }
      }
      if (enforceSingletonPublicKey) {
        await emailClient.createSingletonKeysIfAbsent()
      }
    } catch (restoreError) {
      console.error(
        'Failed to restore keys after a failed import',
        restoreError,
      )
    }
    throw error
  }
  // Single key mode needs the shared key pair before provisioning. A backup made in single key mode brings
  // it, but one made with a key per address doesn't.
  const createdSingletonKeys = enforceSingletonPublicKey
    ? (await emailClient.createSingletonKeysIfAbsent()).keyPair.created
    : false
  return {
    createdSingletonKeys,
    sudoKeyCount: importedKeys.length,
    importedEmailKeys: payload.sudoEmail !== undefined,
    unrecognisedSdks: payload.unrecognisedSdks,
  }
}
