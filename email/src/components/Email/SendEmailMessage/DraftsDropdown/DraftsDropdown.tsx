import React from 'react'
import {
  StyledDropdown,
  StyledButton,
  DropDownContainer,
  VerticalAlign,
} from './DraftsDropdown.styled'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { Space } from 'antd'
import {
  DownOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { DraftEmailMessageMetadata } from '@sudoplatform/sudo-email'
import { MenuLink } from '@components/MenuLink'

interface Props {
  selectedDraftId?: string
  draftsLoading: boolean
  savedDraftSelected: boolean
  draftMessagesMetadataList: DraftEmailMessageMetadata[]
  onChange: (selectedDraftId: string) => void
  deleteDraft: () => Promise<void>
}

export const DraftsDropdown = ({
  selectedDraftId,
  draftsLoading,
  draftMessagesMetadataList,
  savedDraftSelected,
  onChange,
  deleteDraft,
}: Props): React.ReactElement => {
  const draftMetadata = draftMessagesMetadataList.find((draftMessage) => {
    return draftMessage.id === selectedDraftId
  })
  return (
    <DropDownContainer>
      <VerticalAlign style={{ paddingRight: '10px' }}>
        <MenuLink
          linkType="danger"
          text="Delete Draft"
          icon={<DeleteOutlined />}
          disabled={savedDraftSelected}
          onClick={deleteDraft}
        />
      </VerticalAlign>
      <StyledDropdown
        trigger={['click']}
        empty={draftMessagesMetadataList.length === 0}
        disabled={draftsLoading}
        menu={{
          items: draftMessagesMetadataList.map((draft) => ({
            label: 'Draft saved at: ' + draft.updatedAt.toLocaleString(),
            key: draft.updatedAt.toString(),
            onClick: () => {
              onChange(draft.id)
            },
          })) as ItemType[],
        }}
        placement="bottomRight"
      >
        {draftsLoading ? (
          <LoadingOutlined />
        ) : (
          <StyledButton onClick={(e) => e.preventDefault()}>
            <Space>
              <>
                {draftMetadata
                  ? 'Editing draft saved at: ' +
                    draftMetadata.updatedAt.toLocaleString()
                  : 'Saved Drafts'}
                <DownOutlined />
              </>
            </Space>
          </StyledButton>
        )}
      </StyledDropdown>
    </DropDownContainer>
  )
}
