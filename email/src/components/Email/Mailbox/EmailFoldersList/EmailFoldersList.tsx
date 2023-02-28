import React, { useContext } from 'react'
import { EmailFoldersContext } from '@contexts'
import { capitaliseFirst } from '@util/capitaliseFirst'
import { Container, ListItem, StyledLoader } from './EmailFoldersList.styled'
import { Tag } from 'antd'

/**
 * Component that renders a list of email folders from
 * `<MailboxContext>`, and sets selected folder id on
 * list item press.
 */
export const EmailFoldersList = (): React.ReactElement => {
  const {
    emailFolders,
    emailFoldersLoading,
    selectedEmailFolderId,
    setSelectedEmailFolderId,
  } = useContext(EmailFoldersContext)

  return (
    <Container>
      {emailFoldersLoading ? (
        <StyledLoader />
      ) : (
        emailFolders.map(({ id, folderName, unseenCount }) => (
          <ListItem
            key={id}
            selected={id === selectedEmailFolderId}
            onClick={() => setSelectedEmailFolderId(id)}
          >
            {capitaliseFirst(folderName)}
            {unseenCount > 0 && <Tag color="blue">{unseenCount}</Tag>}
          </ListItem>
        ))
      )}
    </Container>
  )
}
