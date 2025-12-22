import React, { useContext, useState } from 'react'
import { EmailFoldersContext } from '@contexts/index'
import { capitaliseFirst } from '@util/capitaliseFirst'
import { Container, ListItem, StyledLoader } from './EmailSidebarList.styled'
import { Tag } from 'antd'
import { EmailBlocklistContext } from '../../../../contexts/EmailBlocklistContext'
import { CloseOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { useEmailFolders } from '../../../../hooks/useEmailFolders'
import { Button } from '@components/Button'
import { CustomFolderInput } from './CustomFolderInput'

/**
 * Component that renders a list of email folders from
 * `<MailboxContext>`, and sets selected folder id on
 * list item press.
 */
export const EmailSidebarList = (): React.ReactElement => {
  const { selectedEmailFolderId, setSelectedEmailFolderId } =
    useContext(EmailFoldersContext)
  const { blocklistLoading, blocklistSelected, setBlocklistSelected } =
    useContext(EmailBlocklistContext)
  const [customFolderNameInput, setCustomFolderNameInput] = useState<string>('')

  const {
    emailFolders,
    createCustomEmailFolderHandler,
    deleteCustomEmailFolderHandler,
    updateCustomEmailFolderHandler,
    creatingCustomFolder,
    setCreatingCustomFolder,
    emailFoldersLoading,
    updatingCustomFolderId,
    setUpdatingCustomFolderId,
  } = useEmailFolders()

  return (
    <Container>
      {emailFoldersLoading || blocklistLoading ? (
        <StyledLoader />
      ) : (
        <>
          {emailFolders
            .filter(({ folderName }) => folderName.toLowerCase() !== 'outbox')
            .map(({ id, folderName, unseenCount, customFolderName }) =>
              customFolderName ? (
                <ListItem
                  key={id}
                  selected={id === selectedEmailFolderId}
                  onClick={() => {
                    setSelectedEmailFolderId(id)
                    setBlocklistSelected(false)
                    setCreatingCustomFolder(false)
                  }}
                  className="custom-folder-item"
                >
                  {updatingCustomFolderId === id ? (
                    <CustomFolderInput
                      onSave={() => {
                        void updateCustomEmailFolderHandler(
                          id,
                          customFolderNameInput,
                        )
                        setCustomFolderNameInput('')
                        setUpdatingCustomFolderId(undefined)
                      }}
                      onCancel={() => {
                        setUpdatingCustomFolderId(undefined)
                      }}
                      onChange={(value) => {
                        setCustomFolderNameInput(value)
                      }}
                      inputValue={customFolderNameInput}
                    />
                  ) : (
                    <>
                      {capitaliseFirst(customFolderName)}
                      <div>
                        <Button
                          onClick={() => {
                            void deleteCustomEmailFolderHandler(id)
                          }}
                        >
                          <CloseOutlined />
                        </Button>
                        <Button
                          onClick={() => {
                            setCustomFolderNameInput(customFolderName)
                            setUpdatingCustomFolderId(id)
                          }}
                        >
                          <EditOutlined />
                        </Button>
                        {unseenCount > 0 && (
                          <Tag color="blue">{unseenCount}</Tag>
                        )}
                      </div>
                    </>
                  )}
                </ListItem>
              ) : (
                <ListItem
                  key={id}
                  selected={id === selectedEmailFolderId}
                  onClick={() => {
                    setSelectedEmailFolderId(id)
                    setBlocklistSelected(false)
                    setCreatingCustomFolder(false)
                  }}
                >
                  {capitaliseFirst(folderName)}
                  {unseenCount > 0 && <Tag color="blue">{unseenCount}</Tag>}
                </ListItem>
              ),
            )}
          <ListItem
            key="new-folder"
            selected={creatingCustomFolder}
            id="new-folder"
            className="custom-folder-item"
          >
            {creatingCustomFolder ? (
              <CustomFolderInput
                onSave={() => {
                  void createCustomEmailFolderHandler(customFolderNameInput)
                  setCustomFolderNameInput('')
                  setCreatingCustomFolder(false)
                }}
                onCancel={() => {
                  setCreatingCustomFolder(false)
                }}
                onChange={(value) => {
                  setCustomFolderNameInput(value)
                }}
                inputValue={customFolderNameInput}
              />
            ) : (
              <div
                onClick={() => {
                  setCreatingCustomFolder(!creatingCustomFolder)
                  setBlocklistSelected(false)
                }}
              >
                <PlusOutlined /> Add Custom Folder
              </div>
            )}
          </ListItem>
          <ListItem
            key="blocklist"
            selected={blocklistSelected}
            onClick={() => {
              setBlocklistSelected(true)
              setSelectedEmailFolderId(null)
              setCreatingCustomFolder(false)
            }}
            id="blocklist"
          >
            Blocked Addresses
          </ListItem>
        </>
      )}
    </Container>
  )
}
