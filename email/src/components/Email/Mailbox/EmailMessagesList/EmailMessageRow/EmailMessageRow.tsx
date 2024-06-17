import React from 'react'
import {
  EmailFolder,
  EmailMessage,
  EncryptionStatus,
} from '@sudoplatform/sudo-email'
import {
  StyledRow,
  ContentColumn,
  MailIcon,
  SubjectText,
  DateColumn,
  StyledDangerLink,
} from './EmailMessageRow.styled'
import { Tag } from 'antd'
import { PaperClipOutlined } from '@ant-design/icons'

const getFormattedDate = (dateObj: Date): string => {
  const comparisonDate = new Date(dateObj)
  const [date, time] = comparisonDate
    .toLocaleDateString('en-AU', {
      hour12: true,
      hour: 'numeric',
      minute: 'numeric',
    })
    .split(', ')

  // If today, return time of day only, otherwise return date only.
  return new Date().toLocaleDateString() === comparisonDate.toLocaleDateString()
    ? time
    : date
}

interface Props {
  emailMessage: EmailMessage
  selected?: boolean
  onClick: () => void
  onDelete: () => void
  emailFolders: EmailFolder[]
}

/**
 * Presentational component that renders a row (intended as one
 * of many in a list) containing data of an email message.
 */
export const EmailMessageRow = ({
  emailMessage,
  selected,
  onClick,
  onDelete,
  emailFolders,
}: Props): React.ReactElement => {
  const { displayName, emailAddress } = emailMessage.from[0]

  const emailFolder = emailFolders.find(
    (folder) => folder.id === emailMessage.folderId,
  )
  const folderName = emailFolder?.folderName

  return (
    <StyledRow onClick={onClick} selected={selected}>
      <ContentColumn style={{ marginLeft: '-20px' }}>
        {emailMessage.hasAttachments && <PaperClipOutlined />}
        {emailMessage.encryptionStatus === EncryptionStatus.ENCRYPTED && '🔒 '}
        {!emailMessage.seen && <MailIcon />}
        <span>{displayName ?? emailAddress}</span>
        <SubjectText seen={emailMessage.seen}>
          {folderName && <Tag color="blue">{folderName}</Tag>}
          {emailMessage.subject}
        </SubjectText>
      </ContentColumn>
      <DateColumn>
        <StyledDangerLink onClick={onDelete} className="delete-message-button">
          Delete
        </StyledDangerLink>
        <div>{getFormattedDate(emailMessage.sortDate)}</div>
      </DateColumn>
    </StyledRow>
  )
}
