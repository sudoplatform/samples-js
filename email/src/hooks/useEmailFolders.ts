import { useCallback, useContext, useEffect, useState } from 'react'
import { EmailFolder } from '@sudoplatform/sudo-email'
import { CachePolicy } from '@sudoplatform/sudo-common'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveEmailAddressUpdate } from '@hooks/useActiveEmailAddressUpdate'
import { EmailContext, ProjectContext } from '@contexts'
import { message } from 'antd'

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
  const [creatingCustomFolder, setCreatingCustomFolder] =
    useState<boolean>(false)
  const [updatingCustomFolderId, setUpdatingCustomFolderId] = useState<
    string | undefined
  >(undefined)

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
        // If there was a token, add result items to the existing state.
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

  const createCustomEmailFolderHandler = useCallback(
    async (customFolderName: string): Promise<void> => {
      if (!activeEmailAddress) {
        return
      }

      if (customFolderName === '') {
        void message.error('Folder name cannot be empty')
        return
      }

      clearError()
      setLoading(true)

      try {
        const newCustomFolder = await sudoEmailClient.createCustomEmailFolder({
          emailAddressId: activeEmailAddress.id,
          customFolderName,
        })
        setEmailFolders([...emailFolders, newCustomFolder])
      } catch (error) {
        setError(error as Error, 'Failed to create folder')
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
      activeEmailAddress,
      sudoEmailClient,
    ],
  )

  const deleteCustomEmailFolderHandler = useCallback(
    async (emailFolderId: string): Promise<void> => {
      if (!activeEmailAddress) {
        return
      }

      if (emailFolderId === '') {
        return
      }

      clearError()
      setLoading(true)

      try {
        const deletedFolder = await sudoEmailClient.deleteCustomEmailFolder({
          emailAddressId: activeEmailAddress.id,
          emailFolderId,
        })

        if (!deletedFolder) {
          return
        }
        setEmailFolders(
          emailFolders.filter((folder) => folder.id !== deletedFolder.id),
        )
      } catch (error) {
        setError(error as Error, 'Failed to delete folder')
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
      activeEmailAddress,
      sudoEmailClient,
    ],
  )

  const updateCustomEmailFolderHandler = useCallback(
    async (emailFolderId: string, customFolderName: string): Promise<void> => {
      if (!activeEmailAddress) {
        return
      }

      if (emailFolderId === '') {
        return
      }

      const existingFolderIndex = emailFolders.findIndex(
        (folder) => folder.id === emailFolderId,
      )

      if (existingFolderIndex < 0) {
        await message.error('Could not find folder to update')
        return
      }

      const existingFolder = emailFolders[existingFolderIndex]

      if (existingFolder.customFolderName === customFolderName) {
        return
      }

      clearError()
      setLoading(true)

      try {
        const updatedFolder = await sudoEmailClient.updateCustomEmailFolder({
          emailAddressId: activeEmailAddress.id,
          emailFolderId,
          values: { customFolderName },
        })
        emailFolders.splice(existingFolderIndex, 1, updatedFolder)
        setEmailFolders(emailFolders)
      } catch (error) {
        setError(error as Error, 'Failed to update folder')
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
    creatingCustomFolder,
    setCreatingCustomFolder,
    createCustomEmailFolderHandler: (customFolderName: string) =>
      createCustomEmailFolderHandler(customFolderName),
    deleteCustomEmailFolderHandler: (emailFolderId: string) =>
      deleteCustomEmailFolderHandler(emailFolderId),
    updateCustomEmailFolderHandler: (
      emailFolderId: string,
      customFolderName: string,
    ) => updateCustomEmailFolderHandler(emailFolderId, customFolderName),
    updatingCustomFolderId,
    setUpdatingCustomFolderId,
  }
}
