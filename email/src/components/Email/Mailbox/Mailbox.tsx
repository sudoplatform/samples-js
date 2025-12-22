import React, { useContext, useState } from 'react'
import { EmailMessage } from '@sudoplatform/sudo-email'
import {
  EmailContext,
  MailboxContext,
  EmailFoldersContext,
} from '@contexts/index'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { EmailFoldersList } from './EmailSidebarList'
import { EmailMessagesList } from './EmailMessagesList'
import {
  MailboxContainer,
  MailIcon,
  EmailFoldersContainer,
  EmailMessagesContainer,
  ButtonsRow,
  EmailMessageViewContainer,
  DropdownContainer,
} from './Mailbox.styled'
import { useEmailFolders } from '@hooks/useEmailFolders'
import { EmailAddressDropdown } from '../EmailAddressDropdown'
import { Button } from '@components/Button'
import { SendEmailMessage } from '../SendEmailMessage'
import { EmailMessageView } from './EmailMessageView'
import { Modal } from 'antd'
import { useEmailBlocklist } from '../../../hooks/useEmailBlocklist'
import { EmailBlocklistContext } from '../../../contexts/EmailBlocklistContext'
import { useDraftEmailMessages } from '../../../hooks/useDraftEmailMessages'
import { DraftEmailMessagesContext } from '../../../contexts/DraftEmailMessagesContext'

export const Mailbox = (): React.ReactElement => {
  const { activeEmailAddress } = useContext(EmailContext)
  const [focusedEmailMessage, setFocusedEmailMessage] =
    useState<EmailMessage | null>(null)
  const [sendEmailMessageFormActive, setSendEmailMessageFormActive] =
    useState(false)

  const [replyingToMessage, setReplyingToMessage] = useState<
    EmailMessage | undefined
  >()
  const [forwardingMessage, setForwardingToMessage] = useState<
    EmailMessage | undefined
  >()

  const {
    emailFoldersLoading,
    emailFoldersError,
    emailFolders,
    selectedEmailFolderId,
    setSelectedEmailFolderId,
    listEmailFoldersHandler,
  } = useEmailFolders()

  const {
    blocklistLoading,
    blockEmailAddressesError,
    blockedAddresses,
    blocklistSelected,
    setBlocklistSelected,
    listBlockedAddressesHandler,
  } = useEmailBlocklist()

  const {
    draftMessagesMetadataList,
    draftsLoading,
    listDraftEmailMessagesHandler,
    scheduledMessages,
    scheduledMessagesLoading,
    listScheduledMessagesHandler,
    cancelScheduledMessageHandler,
    createDraftEmailMessageHandler,
    deleteDraftEmailMessagesHandler,
    getDraftEmailMessageHandler,
    scheduleSendMessagesHandler,
    setDraftMessagesMetadataList,
    setScheduledMessages,
  } = useDraftEmailMessages()

  const replyToMessageHandler = (emailMessage: EmailMessage) => {
    setReplyingToMessage(emailMessage)
    setSendEmailMessageFormActive(true)
  }

  const forwardMessageHandler = (emailMessage: EmailMessage) => {
    setForwardingToMessage(emailMessage)
    setSendEmailMessageFormActive(true)
  }

  return (
    <>
      <ButtonsRow>
        <DropdownContainer>
          <MailIcon />
          <EmailAddressDropdown />
        </DropdownContainer>
        {activeEmailAddress && (
          <Button
            type="submit"
            onClick={() => setSendEmailMessageFormActive(true)}
            disabled={activeEmailAddress === undefined}
          >
            New Message
          </Button>
        )}
      </ButtonsRow>
      {activeEmailAddress && (
        <MailboxContainer>
          <MailboxContext.Provider
            value={{
              focusedEmailMessage,
              setFocusedEmailMessage,
            }}
          >
            <DraftEmailMessagesContext.Provider
              value={{
                draftMessagesMetadataList,
                draftsLoading,
                listDraftEmailMessagesHandler,
                scheduledMessages,
                scheduledMessagesLoading,
                listScheduledMessagesHandler,
                cancelScheduledMessageHandler,
                createDraftEmailMessageHandler,
                deleteDraftEmailMessagesHandler,
                getDraftEmailMessageHandler,
                scheduleSendMessagesHandler,
                setDraftMessagesMetadataList,
                setScheduledMessages,
              }}
            >
              {activeEmailAddress && (
                <Modal
                  open={sendEmailMessageFormActive}
                  title={'Send Email Message'}
                  footer={null}
                  width={750}
                >
                  <SendEmailMessage
                    replyingToMessage={replyingToMessage}
                    forwardingMessage={forwardingMessage}
                    onExit={() => {
                      setSendEmailMessageFormActive(false)
                      setReplyingToMessage(undefined)
                      setForwardingToMessage(undefined)
                    }}
                  />
                </Modal>
              )}
              <ErrorBoundary
                error={emailFoldersError || blockEmailAddressesError}
              >
                <EmailBlocklistContext.Provider
                  value={{
                    blockedAddresses,
                    blocklistLoading,
                    blocklistSelected,
                    listBlockedAddressesHandler,
                    setBlocklistSelected,
                  }}
                >
                  <EmailFoldersContext.Provider
                    value={{
                      emailFolders,
                      emailFoldersLoading,
                      listEmailFoldersHandler,
                      selectedEmailFolderId,
                      setSelectedEmailFolderId,
                    }}
                  >
                    <EmailFoldersContainer>
                      <EmailFoldersList />
                    </EmailFoldersContainer>
                    <EmailMessagesContainer>
                      <EmailMessagesList
                        minimized={!!focusedEmailMessage}
                        replyToMessageHandler={replyToMessageHandler}
                        forwardMessageHandler={forwardMessageHandler}
                      />
                    </EmailMessagesContainer>
                    {focusedEmailMessage && (
                      <EmailMessageViewContainer>
                        <EmailMessageView emailMessage={focusedEmailMessage} />
                      </EmailMessageViewContainer>
                    )}
                  </EmailFoldersContext.Provider>
                </EmailBlocklistContext.Provider>
              </ErrorBoundary>
            </DraftEmailMessagesContext.Provider>
          </MailboxContext.Provider>
        </MailboxContainer>
      )}
    </>
  )
}
