import { useCallback, useContext, useEffect, useState } from 'react'
import { EmailFolder } from '@sudoplatform/sudo-email'
import { CachePolicy } from '@sudoplatform/sudo-common'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveEmailAddressUpdate } from '@hooks/useActiveEmailAddressUpdate'
import { EmailContext, ProjectContext } from '@contexts'

/**
 * Hook to retrieve a list of email folders with the `activeEmailAddress`
 * id.
 *
 * While an `EmailAddress` object will contain a list of email folders,
 * the metadata (such as `unreadCount`) might not be up to date if
 * changes are made.
 */
export const useEmailFolders = () => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { activeEmailAddress } = useContext(EmailContext)
  const [emailFolders, setEmailFolders] = useState<EmailFolder[]>([])
  const [selectedEmailFolderId, setSelectedEmailFolderId] = useState<
    string | null
  >(null)
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()
  const [nextToken, setNextToken] = useState<string | undefined>()

  // Handler function to retrieve email folders attached to the
  // provided active email address.
  const listEmailFoldersHandler = useCallback(
    async (nextToken?: string): Promise<void> => {
      if (!activeEmailAddress) {
        setEmailFolders([])
        return
      }

      clearError()
      setLoading(true)

      try {
        const foldersResult =
          await sudoEmailClient.listEmailFoldersForEmailAddressId({
            emailAddressId: activeEmailAddress.id,
            cachePolicy: CachePolicy.RemoteOnly,
            nextToken,
          })

        // Set email folders state with only the result items if this
        // call wasn't made with a next token.
        // If there was a token, add result items to the exsting state.
        setEmailFolders(
          nextToken
            ? [...foldersResult.items, ...emailFolders]
            : foldersResult.items,
        )
        // nextToken state will be set with the resulting next
        // token, or will be cleared (set as undefined).
        setNextToken(foldersResult.nextToken)
      } catch (error) {
        setError(error as Error, 'Failed to retrieve email folders')
      } finally {
        setLoading(false)
      }
    },
    [
      setError,
      clearError,
      setLoading,
      emailFolders,
      setEmailFolders,
      setNextToken,
      activeEmailAddress,
      sudoEmailClient,
    ],
  )

  // Set selected folder id on initial render and run list folders handler.
  useEffect(() => {
    if (activeEmailAddress) {
      setSelectedEmailFolderId(activeEmailAddress?.folders[0].id ?? null)
    }

    void listEmailFoldersHandler()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Email address has changed -> update selected email folder
  // to the first of that email.
  useActiveEmailAddressUpdate((emailAddress) => {
    setSelectedEmailFolderId(emailAddress?.folders[0].id ?? null)
    void listEmailFoldersHandler()
  })

  // Invokes the list emails handler function each time
  // `nextToken` is updated with a non-falsy value.
  useEffect(() => {
    if (nextToken) {
      void listEmailFoldersHandler(nextToken)
    }
  }, [nextToken, listEmailFoldersHandler])

  return {
    emailFoldersLoading: loading,
    emailFoldersError: error,
    emailFolders,
    selectedEmailFolderId,
    setSelectedEmailFolderId,
    listEmailFoldersHandler: () => listEmailFoldersHandler(),
  }
}
