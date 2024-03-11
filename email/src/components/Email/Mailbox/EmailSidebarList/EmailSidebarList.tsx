import React, { useContext } from 'react'
import { EmailFoldersContext } from '@contexts'
import { capitaliseFirst } from '@util/capitaliseFirst'
import { Container, ListItem, StyledLoader } from './EmailSidebarList.styled'
import { Tag } from 'antd'
import { EmailBlocklistContext } from '../../../../contexts/EmailBlocklistContext'

/**
 * Component that renders a list of email folders from
 * `<MailboxContext>`, and sets selected folder id on
 * list item press.
 */
export const EmailSidebarList = (): React.ReactElement => {
  const {
    emailFolders,
    emailFoldersLoading,
    selectedEmailFolderId,
    setSelectedEmailFolderId,
  } = useContext(EmailFoldersContext)
  const { blocklistLoading, blocklistSelected, setBlocklistSelected } =
    useContext(EmailBlocklistContext)

  return (
    <Container>
      {emailFoldersLoading || blocklistLoading ? (
        <StyledLoader />
      ) : (
        <>
          {emailFolders.map(({ id, folderName, unseenCount }) => (
            <ListItem
              key={id}
              selected={id === selectedEmailFolderId}
              onClick={() => {
                setSelectedEmailFolderId(id)
                setBlocklistSelected(false)
              }}
            >
              {capitaliseFirst(folderName)}
              {unseenCount > 0 && <Tag color="blue">{unseenCount}</Tag>}
            </ListItem>
          ))}
          <ListItem
            key="blocklist"
            selected={blocklistSelected}
            onClick={() => {
              setBlocklistSelected(true)
              setSelectedEmailFolderId(null)
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
