import { useContext, useEffect, useState } from 'react'
import { EmailFoldersContext } from '@contexts'

/**
 * Hook that will run the `onChangeCallback` function given if
 * the value of `selectedEmailFolderId` updates.
 */
export const useSelectedEmailFolderUpdate = (
  onChangeCallback?: (emailFolderId: string | null) => void,
): void => {
  const { selectedEmailFolderId } = useContext(EmailFoldersContext)
  const [previousEmailFolderId, setPreviousEmailFolderId] = useState<
    string | null
  >()

  useEffect(() => {
    if (selectedEmailFolderId !== previousEmailFolderId) {
      setPreviousEmailFolderId(selectedEmailFolderId)
      if (onChangeCallback) {
        onChangeCallback(selectedEmailFolderId)
      }
    }
  }, [
    selectedEmailFolderId,
    previousEmailFolderId,
    setPreviousEmailFolderId,
    onChangeCallback,
  ])
}
