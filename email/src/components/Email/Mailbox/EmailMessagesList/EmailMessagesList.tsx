import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ConnectionState, EmailMessage } from '@sudoplatform/sudo-email'
import {
  EmailContext,
  EmailFoldersContext,
  MailboxContext,
  ProjectContext,
} from '@contexts'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { MenuLink } from '@components/MenuLink'
import { EmailMessageRow } from './EmailMessageRow'
import {
  useDeleteEmailMessages,
  useEmailMessages,
  useUpdateEmailMessages,
} from './EmailMessagesList.hooks'
import {
  ColumnDivider,
  FixedRightColumn,
  MenuContainer,
  MessagesListContainer,
  StyledTable,
} from './EmailMessagesList.styled'
import { MoveMessageFolderDropdown } from '@components/Email/Mailbox/MoveMessageFolderDropdown'
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  RedoOutlined,
} from '@ant-design/icons'
import { message } from 'antd'
import { useSelectedEmailFolderUpdate } from '@hooks/useSelectedEmailFolderUpdate'

const messages_refresh_interval = 60

interface Props {
  minimized: boolean
}

export const EmailMessagesList = ({ minimized }: Props): React.ReactElement => {
  const { activeEmailAddress } = useContext(EmailContext)
  const { focusedEmailMessage, setFocusedEmailMessage } =
    useContext(MailboxContext)

  const { emailFolders, selectedEmailFolderId, listEmailFoldersHandler } =
    useContext(EmailFoldersContext)

  const { sudoEmailClient } = useContext(ProjectContext)
  const [selectedEmailMessages, setSelectedEmailMessages] = useState<
    EmailMessage[]
  >([])

  const [
    receivedSubscriptionNotification,
    setReceivedSubscriptionNotification,
  ] = useState<boolean>(false)

  const {
    emailMessagesLoading,
    emailMessagesError,
    emailMessages,
    listEmailMessagesHandler,
  } = useEmailMessages(sudoEmailClient)

  const {
    updateEmailMessagesLoading,
    updateEmailMessagesError,
    updateEmailMessagesHandler,
  } = useUpdateEmailMessages(sudoEmailClient)

  const {
    deleteEmailMessagesLoading,
    deleteEmailMessagesError,
    deleteEmailMessagesHandler,
  } = useDeleteEmailMessages(sudoEmailClient)

  const clearSelectedEmailMessages = () => setSelectedEmailMessages([])

  /**
   * Update email folder and email message data.
   */
  const refreshHandler = useCallback((): void => {
    if (selectedEmailFolderId) {
      listEmailFoldersHandler()
      listEmailMessagesHandler(selectedEmailFolderId)
    }
  }, [selectedEmailFolderId, listEmailFoldersHandler, listEmailMessagesHandler])

  useEffect(() => {
    if (receivedSubscriptionNotification) {
      refreshHandler()
      setReceivedSubscriptionNotification(false)
    }
  }, [receivedSubscriptionNotification, selectedEmailFolderId, refreshHandler])

  /**
   * Update the seen status of the given `emailMessages` list,
   * or the `selectedEmailMessages` list if param is not set.
   */
  const updateEmailMessagesSeenStatus = async (
    seen: boolean,
    emailMessages?: EmailMessage[],
  ): Promise<void> => {
    const messages = emailMessages ?? selectedEmailMessages

    // Update UI immediately while awaiting handler to finish.
    messages.forEach((emailMessage) => {
      emailMessage.seen = seen
    })

    await updateEmailMessagesHandler({
      emailMessages: messages,
      seen,
    })

    void message.success('Email messages updated')
    clearSelectedEmailMessages()
    refreshHandler()
  }

  const updateEmailMessagesFolderId = async (
    folderId: string,
  ): Promise<void> => {
    await updateEmailMessagesHandler({
      emailMessages: selectedEmailMessages,
      folderId,
    })

    void message.success('Email messages updated')
    clearSelectedEmailMessages()
    refreshHandler()
  }

  /**
   * Delete an array of email messages and clear the current
   * focused email message if that message is deleted.
   */
  const deleteEmailMessages = async (
    emailMessages: EmailMessage[],
  ): Promise<void> => {
    // Clear focused message if it will be deleted.
    if (emailMessages.find(({ id }) => focusedEmailMessage?.id === id)) {
      setTimeout(() => setFocusedEmailMessage(null), 0)
    }

    const emailFolder = emailFolders.find(
      (folder) => folder.id === selectedEmailFolderId,
    )
    const folderName = emailFolder?.folderName

    const trashFolder = emailFolders.find(
      (folder) => folder.folderName === 'TRASH',
    )
    const trashFolderId = trashFolder?.id

    // Delete if in Trash folder, otherwise move to Trash
    if (trashFolderId && folderName !== 'TRASH') {
      await updateEmailMessagesFolderId(trashFolderId)
      void message.success('Emails moved to Trash')
      return
    }

    await deleteEmailMessagesHandler(emailMessages)
    void message.success('Email messages deleted')
    clearSelectedEmailMessages()
    void refreshHandler()
  }

  /**
   * Set the given email message as the 'focused' email
   * message and set `seen` status to `true`.
   */
  const focusEmailMessage = (emailMessage: EmailMessage): void => {
    if (!emailMessage.seen) {
      void updateEmailMessagesSeenStatus(true, [emailMessage])
    }

    setFocusedEmailMessage(emailMessage)
  }

  const menuDisabled = useMemo(() => {
    return selectedEmailMessages.length === 0
  }, [selectedEmailMessages])

  // Handle interval for polling messages & folder updates.
  // Interval will run every n = `messages_refresh_interval`
  // seconds and is cleared on component un-mount.
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshHandler()
    }, messages_refresh_interval * 1000)

    return () => {
      clearInterval(intervalId)
    }
  }, [refreshHandler])

  useEffect(() => {
    const subscriber = {
      connectionStatusChanged(state: ConnectionState): void {
        console.log(
          `connection status changed to ${state} (${
            state === ConnectionState.Connected ? 'connected' : 'disconnected'
          })`,
        )
      },
      emailMessageCreated: () => {
        setReceivedSubscriptionNotification(true)
      },
      emailMessageDeleted: () => {
        setReceivedSubscriptionNotification(true)
      },
    }
    void (async () => {
      // Setup a subscription to the email changed notification. We will not use
      // the returned message, instead asking the component to refresh its current folder.
      await sudoEmailClient.subscribeToEmailMessages(
        'EmailMessagesList',
        subscriber,
      )
    })()
    return () => {
      sudoEmailClient.unsubscribeFromEmailMessages('EmailMessagesList')
    }
  }, [sudoEmailClient])

  useSelectedEmailFolderUpdate((folderId) => {
    if (folderId) {
      listEmailMessagesHandler(folderId)
    }
  })

  return (
    <MessagesListContainer>
      <MenuContainer>
        {minimized ? (
          <FixedRightColumn>
            <MenuLink
              linkType="action"
              text="Back"
              icon={<ArrowLeftOutlined />}
              onClick={() => setFocusedEmailMessage(null)}
            />
          </FixedRightColumn>
        ) : (
          <>
            <MenuLink
              linkType="action"
              text="Mark Seen"
              icon={<EyeOutlined />}
              onClick={() => updateEmailMessagesSeenStatus(true)}
              disabled={menuDisabled}
            />
            <ColumnDivider />
            <MenuLink
              linkType="action"
              text="Mark Unseen"
              icon={<EyeInvisibleOutlined />}
              onClick={() => updateEmailMessagesSeenStatus(false)}
              disabled={menuDisabled}
            />
            <ColumnDivider />
            <MoveMessageFolderDropdown
              selectedEmailFolderId={selectedEmailFolderId}
              emailFolders={emailFolders}
              onChange={updateEmailMessagesFolderId}
              disabled={menuDisabled}
            />
            <ColumnDivider />
            <MenuLink
              linkType="danger"
              text="Delete"
              icon={<DeleteOutlined />}
              onClick={() => deleteEmailMessages(selectedEmailMessages)}
              disabled={menuDisabled}
            />
            <FixedRightColumn>
              <MenuLink
                linkType="action"
                text="Refresh"
                icon={<RedoOutlined />}
                onClick={() => refreshHandler()}
                disabled={!activeEmailAddress}
              />
            </FixedRightColumn>
          </>
        )}
      </MenuContainer>
      <ErrorBoundary
        error={
          emailMessagesError ||
          updateEmailMessagesError ||
          deleteEmailMessagesError
        }
      >
        <StyledTable
          className="styled-table"
          dataSource={emailMessages}
          pagination={{ pageSize: 20 }}
          loading={
            emailMessagesLoading ||
            deleteEmailMessagesLoading ||
            updateEmailMessagesLoading
          }
          rowKey="id"
          rowSelection={{
            type: 'checkbox',
            columnWidth: '40px',
            selectedRowKeys: selectedEmailMessages.map(({ id }) => id),
            onChange: (rowKeys, rows) => {
              setSelectedEmailMessages(
                (rows as EmailMessage[]).filter(
                  ({ id }) => rowKeys.indexOf(id) !== -1,
                ),
              )
            },
          }}
          columns={[
            {
              key: 'column',
              render: (_, record) => {
                const emailMessage = record as EmailMessage
                return (
                  <EmailMessageRow
                    emailMessage={emailMessage}
                    key={`${emailMessage.id}`}
                    onClick={() => focusEmailMessage(emailMessage)}
                    onDelete={() => {
                      void deleteEmailMessages([emailMessage])
                    }}
                    selected={emailMessage.id === focusedEmailMessage?.id}
                    emailFolders={activeEmailAddress?.folders ?? []}
                  />
                )
              },
            },
          ]}
        />
      </ErrorBoundary>
    </MessagesListContainer>
  )
}
