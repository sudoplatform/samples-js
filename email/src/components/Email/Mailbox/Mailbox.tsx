import React, { useContext, useState } from 'react'
import { EmailMessage } from '@sudoplatform/sudo-email'
import { EmailContext, MailboxContext, EmailFoldersContext } from '@contexts'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { EmailFoldersList } from './EmailFoldersList'
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

export const Mailbox = (): React.ReactElement => {
  const { activeEmailAddress } = useContext(EmailContext)
  const [focusedEmailMessage, setFocusedEmailMessage] =
    useState<EmailMessage | null>(null)
  const [sendEmailMessageFormActive, setSendEmailMessageFormActive] =
    useState(false)

  const {
    emailFoldersLoading,
    emailFoldersError,
    emailFolders,
    selectedEmailFolderId,
    setSelectedEmailFolderId,
    listEmailFoldersHandler,
  } = useEmailFolders()

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
            {activeEmailAddress && (
              <Modal
                open={sendEmailMessageFormActive}
                title={'Send Email Message'}
                footer={null}
                width={750}
              >
                <SendEmailMessage
                  onExit={() => setSendEmailMessageFormActive(false)}
                />
              </Modal>
            )}
            <ErrorBoundary error={emailFoldersError}>
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
                  <EmailMessagesList minimized={!!focusedEmailMessage} />
                </EmailMessagesContainer>
                {focusedEmailMessage && (
                  <EmailMessageViewContainer>
                    <EmailMessageView emailMessage={focusedEmailMessage} />
                  </EmailMessageViewContainer>
                )}
              </EmailFoldersContext.Provider>
            </ErrorBoundary>
          </MailboxContext.Provider>
        </MailboxContainer>
      )}
    </>
  )
}
