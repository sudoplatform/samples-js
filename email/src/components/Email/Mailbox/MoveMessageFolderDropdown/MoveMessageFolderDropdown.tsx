import React from 'react'
import { StyledDropdown } from './MoveMessageFolderDropdown.styled'
import { ItemType } from 'antd/es/menu/interface'
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
          .map(({ id, folderName, customFolderName }) => ({
            label: (
              <span>{capitaliseFirst(customFolderName ?? folderName)}</span>
            ),
            key: `${folderName}_${id}`,
            onClick: () => {
              onChange(id)
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
