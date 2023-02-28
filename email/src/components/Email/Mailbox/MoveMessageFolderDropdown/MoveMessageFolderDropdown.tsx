import React from 'react'
import { StyledDropdown } from './MoveMessageFolderDropdown.styled'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { FolderOutlined } from '@ant-design/icons'
import { EmailFolder } from '@sudoplatform/sudo-email'
import { MenuLink } from '@components/MenuLink'
import { capitaliseFirst } from '@util/capitaliseFirst'

interface Props {
  selectedEmailFolderId: string | null
  emailFolders: EmailFolder[]
  onChange: (selectedFolderId: string) => void
  disabled?: boolean
}

export const MoveMessageFolderDropdown = ({
  selectedEmailFolderId,
  emailFolders,
  onChange,
  disabled,
}: Props): React.ReactElement => {
  return (
    <StyledDropdown
      menu={{
        items: emailFolders
          .filter(({ id }) => id !== selectedEmailFolderId)
          .map((folder) => ({
            label: <span>{capitaliseFirst(folder.folderName)}</span>,
            key: `${folder.folderName}_${folder.id}`,
            onClick: () => {
              onChange(folder.id)
            },
          })) as ItemType[],
      }}
      placement="bottomRight"
      disabled={disabled}
    >
      <MenuLink linkType="action" text="Move" icon={<FolderOutlined />} />
    </StyledDropdown>
  )
}
