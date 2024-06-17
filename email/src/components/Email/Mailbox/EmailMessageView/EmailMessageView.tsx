import React from 'react'
import { EmailMessage } from '@sudoplatform/sudo-email'
import { LoadingOutlined } from '@ant-design/icons'
import { ErrorBoundary } from '@components/ErrorBoundary'
import {
  Container,
  MessageTextBox,
  BoldLabel,
  AttachmentsBox,
  AttachmentDetail,
} from './EmailMessageView.styled'
import { useEmailMessageBody } from '@hooks/useEmailMessageBody'

/**
 * Render a row of JSX elements, prefixed by a `bold` label.
 */
const MetadataRow = ({
  label,
  children,
}: {
  label?: string
  children?: React.ReactNode
}): React.ReactElement => {
  return (
    <div>
      {label && <BoldLabel>{label}</BoldLabel>}
      {children}
    </div>
  )
}

interface EmailMessageViewProps {
  emailMessage: EmailMessage
}

/**
 * Component for rendering the metadata and content of an email message.
 */
export const EmailMessageView = ({
  emailMessage,
}: EmailMessageViewProps): React.ReactElement => {
  const { emailMessageBodyLoading, emailMessageBodyError, emailMessageBody } =
    useEmailMessageBody(emailMessage)

  return (
    <Container>
      <MetadataRow label="From: ">
        {emailMessage.from.map(({ displayName, emailAddress }) => (
          <span key={`from-${emailAddress}`}>
            {displayName ? `${displayName} <${emailAddress}>` : emailAddress}
          </span>
        ))}
      </MetadataRow>
      <MetadataRow label="To: ">
        {emailMessage.to.map(({ emailAddress }) => (
          <span key={`to-${emailAddress}`}>{emailAddress}</span>
        ))}
      </MetadataRow>
      <MetadataRow label="Recieved at: ">
        {emailMessage.sortDate.toUTCString()}
      </MetadataRow>
      <MetadataRow label="Subject: ">{emailMessage.subject ?? ''}</MetadataRow>
      <MessageTextBox>
        <ErrorBoundary error={emailMessageBodyError}>
          {emailMessageBodyLoading ? (
            <LoadingOutlined />
          ) : (
            emailMessageBody && (emailMessageBody.text ?? '')
          )}
        </ErrorBoundary>
      </MessageTextBox>
      <AttachmentsBox>
        {emailMessageBody?.attachments?.map((a, idx) => (
          <AttachmentDetail key={`${a.filename}-${idx}`}>
            <a
              href={`data:application/octet-stream;base64,${a.data}`}
              download={a.filename}
            >
              {a.filename}
            </a>
          </AttachmentDetail>
        ))}
      </AttachmentsBox>
    </Container>
  )
}
