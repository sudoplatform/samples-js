import { SudoKeyManager } from '@sudoplatform/sudo-common'

/**
 * Keeps the symmetric keys the Sudo Profiles SDK encrypts Sudo claims with.
 *
 * The Sudo Profiles SDK for the web doesn't list or export the keys it holds, so the app records them here to
 * include them in a key backup.
 *
 * Like the SDKs' own keys, they are kept in memory only, so a page reload removes them. Import a key backup
 * after signing in again to read existing Sudos.
 *
 * A key is 32 raw bytes, used as an AES-256 key, as on Android and iOS. The keys are written straight into the
 * Profiles client's key manager rather than through `pushSymmetricKey`, which only takes a string and uses its
 * UTF-8 bytes as the key, so it can't hold keys created by the mobile apps.
 */
export const KEY_LENGTH_BYTES = 32

/**
 * Name the Sudo Profiles SDK stores the current key's ID under in its key manager. It is the SDK's private
 * `Constants.defaultSymmetricKeyId`, which `pushSymmetricKey` writes.
 */
const CURRENT_KEY_ID_NAME = 'symmetricKeyId'

/**
 * The fixed demo key earlier versions of this app encrypted every Sudo with. It is always kept, but never
 * made current, so Sudos those versions created stay readable.
 */
const LEGACY_DEMO_KEY: StoredSudoKey = {
  id: '1234',
  key: new TextEncoder().encode('14A9B3C3540142A11E70ACBB1BD8969F'),
}

export interface StoredSudoKey {
  id: string
  /** The raw AES-256 key. */
  key: Uint8Array
}

export interface StoredSudoKeys {
  currentKeyId: string
  keys: StoredSudoKey[]
}

const generateKey = (): StoredSudoKey => ({
  id: crypto.randomUUID().toUpperCase(),
  key: crypto.getRandomValues(new Uint8Array(KEY_LENGTH_BYTES)),
})

export const isValidSudoKey = (key: Uint8Array): boolean =>
  key.length === KEY_LENGTH_BYTES

let sudoKeys: StoredSudoKeys | undefined

export const loadSudoKeys = (): StoredSudoKeys | undefined => sudoKeys

const saveSudoKeys = (keys: StoredSudoKeys): void => {
  sudoKeys = keys
}

export const clearSudoKeys = (): void => {
  sudoKeys = undefined
}

const toArrayBuffer = (data: Uint8Array): ArrayBuffer =>
  data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer

const withLegacyDemoKey = (keys: StoredSudoKey[]): StoredSudoKey[] =>
  keys.some((k) => k.id === LEGACY_DEMO_KEY.id)
    ? keys
    : [...keys, LEGACY_DEMO_KEY]

/**
 * Gives the Profiles client's key manager every stored key, and records which is current. This is what
 * `pushSymmetricKey` does, without first turning the key into a string.
 */
const pushSudoKeys = async (
  keyManager: SudoKeyManager,
  { currentKeyId, keys }: StoredSudoKeys,
): Promise<void> => {
  for (const { id, key } of keys) {
    await keyManager.addSymmetricKey(toArrayBuffer(key), id)
  }
  await keyManager.addSymmetricKey(
    toArrayBuffer(new TextEncoder().encode(currentKeyId)),
    CURRENT_KEY_ID_NAME,
  )
}

/**
 * Gives the Profiles client's key manager this device's Sudo keys, creating a current key if the device has
 * none.
 *
 * @param keyManager The key manager the Profiles client was constructed with.
 */
export const ensureSudoKeys = async (
  keyManager: SudoKeyManager,
): Promise<StoredSudoKeys> => {
  let stored = loadSudoKeys()
  if (!stored || stored.keys.length === 0) {
    const key = generateKey()
    stored = { currentKeyId: key.id, keys: [key] }
  }
  stored = { ...stored, keys: withLegacyDemoKey(stored.keys) }
  saveSudoKeys(stored)
  await pushSudoKeys(keyManager, stored)
  return stored
}

/**
 * Replaces this device's Sudo keys with `keys`, which the caller has merged with the existing keys so Sudos
 * created here stay readable.
 *
 * @param keyManager The key manager the Profiles client was constructed with.
 */
export const replaceSudoKeys = async (
  keyManager: SudoKeyManager,
  keys: StoredSudoKeys,
): Promise<void> => {
  const stored = { ...keys, keys: withLegacyDemoKey(keys.keys) }
  saveSudoKeys(stored)
  await pushSudoKeys(keyManager, stored)
}
