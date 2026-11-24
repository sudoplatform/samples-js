import { DefaultApiClientManager } from '@sudoplatform/sudo-api-client'
import { loadSudoKeys } from './sudoKeyStore'

/**
 * Lists the user's Sudos without decrypting them, to find the ones this device can't read.
 *
 * The Sudo Profiles SDK decrypts every Sudo when it lists them and fails the whole list if any one can't be
 * decrypted, so a single Sudo encrypted with a key that is in no backup hides all of them. This uses the same
 * GraphQL API as the SDK to see which keys the Sudos need.
 */
const LIST_SUDOS = /* GraphQL */ `
  query ListSudosKeyCheck($limit: Int, $nextToken: String) {
    listSudos(limit: $limit, nextToken: $nextToken) {
      nextToken
      items {
        id
        version
        createdAtEpochMs
        claims {
          name
          keyId
        }
      }
    }
  }
`

const DELETE_SUDO = /* GraphQL */ `
  mutation DeleteSudoKeyCheck($input: DeleteSudoInput!) {
    deleteSudo(input: $input) {
      id
    }
  }
`

interface ListSudosResult {
  listSudos?: {
    nextToken?: string | null
    items: {
      id: string
      version: number
      createdAtEpochMs: number
      claims: { name: string; keyId: string }[]
    }[]
  } | null
}

const throwOnErrors = (
  errors: readonly { message: string }[] | undefined,
): void => {
  if (errors && errors.length > 0) {
    throw new Error(errors.map((e) => e.message).join('; '))
  }
}

export interface SudoKeyStatus {
  id: string
  version: number
  createdAt: Date
  /** The keys the Sudo's claims are encrypted with. */
  keyIds: string[]
  /** The keys in `keyIds` this device doesn't have. */
  missingKeyIds: string[]
}

export const checkSudoKeys = async (): Promise<SudoKeyStatus[]> => {
  const client = DefaultApiClientManager.getInstance().getClient()
  const deviceKeyIds = new Set(loadSudoKeys()?.keys.map((k) => k.id) ?? [])
  const statuses: SudoKeyStatus[] = []
  let nextToken: string | undefined
  do {
    const result = await client.query<ListSudosResult>({
      query: LIST_SUDOS,
      variables: { nextToken },
    })
    throwOnErrors(result.errors)
    for (const item of result.data?.listSudos?.items ?? []) {
      const keyIds = Array.from(new Set(item.claims.map((c) => c.keyId)))
      statuses.push({
        id: item.id,
        version: item.version,
        createdAt: new Date(item.createdAtEpochMs),
        keyIds,
        missingKeyIds: keyIds.filter((id) => !deviceKeyIds.has(id)),
      })
    }
    nextToken = result.data?.listSudos?.nextToken ?? undefined
  } while (nextToken)
  return statuses
}

/**
 * Deletes a Sudo this device can't read. The SDK can't do this, as it reads the Sudo back before deleting it.
 */
export const deleteUnreadableSudo = async ({
  id,
  version,
}: Pick<SudoKeyStatus, 'id' | 'version'>): Promise<void> => {
  const client = DefaultApiClientManager.getInstance().getClient()
  const result = await client.mutate({
    mutation: DELETE_SUDO,
    variables: { input: { id, expectedVersion: version } },
  })
  throwOnErrors(result.errors)
}
