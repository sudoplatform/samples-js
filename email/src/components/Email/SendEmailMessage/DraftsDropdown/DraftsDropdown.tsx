import React, { useMemo, useEffect, useContext, useState } from 'react'
import {
  StyledDropdown,
  StyledButton,
  DropDownContainer,
} from './DraftsDropdown.styled'
import type { MenuProps } from 'antd'
import { Space, Modal, DatePicker, message } from 'antd'
import {
  DownOutlined,
  LoadingOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { MenuLink } from '@components/MenuLink'
import dayjs from 'dayjs'
import { DraftEmailMessagesContext } from '../../../../contexts/DraftEmailMessagesContext'

interface Props {
  selectedDraftId?: string
  onChange: (selectedDraftId: string) => void
  deleteDraft: () => Promise<void>
  scheduleSendMessagesHandler: (id: string, sendAt: Date) => Promise<void>
  setError: (err: Error, msg: string) => void
}

export const DraftsDropdown = ({
  selectedDraftId,
  onChange,
  deleteDraft,
  scheduleSendMessagesHandler,
  setError,
}: Props): React.ReactElement => {
  // Properties and states
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false)
  const [scheduleDate, setScheduleDate] = useState<dayjs.Dayjs | null>(null)

  const {
    scheduledMessages,
    draftMessagesMetadataList,
    draftsLoading,
    scheduledMessagesLoading,
    cancelScheduledMessageHandler,
    listScheduledMessagesHandler,
  } = useContext(DraftEmailMessagesContext)

  const loading = draftsLoading || scheduledMessagesLoading

  // Memoize derived values to force rerender when dependencies change
  const draftMetadata = useMemo(
    () =>
      draftMessagesMetadataList.find(
        (draftMessage) => draftMessage.id === selectedDraftId,
      ),
    [draftMessagesMetadataList, selectedDraftId],
  )
  const scheduled = useMemo(
    () => scheduledMessages.find((msg) => msg.id === selectedDraftId),
    [scheduledMessages, selectedDraftId],
  )

  // Handlers
  const handleScheduleSendClick = () => {
    if (!selectedDraftId) {
      void message.error('No draft selected for scheduling')
      return
    }
    setScheduleModalVisible(true)
  }

  const handleScheduleOk = async () => {
    if (!selectedDraftId) {
      void message.error('No draft selected for scheduling')
      return
    }
    if (!scheduleDate) {
      void message.error('Please select a date and time')
      return
    }
    try {
      setScheduleModalVisible(false)
      await scheduleSendMessagesHandler(selectedDraftId, scheduleDate.toDate())
      await listScheduledMessagesHandler()
      setScheduleDate(null)
      void message.success('Email scheduled successfully!')
    } catch (error) {
      setError(error as Error, 'Failed to schedule send email message')
      setScheduleDate(null)
      setScheduleModalVisible(false)
      // eslint-disable-next-line no-console
      console.log(error)
      throw error
    }
  }

  const handleScheduleCancel = () => {
    setScheduleModalVisible(false)
    setScheduleDate(null)
  }

  const handleCancelScheduledSendClick = async (id: string) => {
    try {
      await cancelScheduledMessageHandler(id)
      await listScheduledMessagesHandler()
      void message.success('Scheduled email send canceled successfully!')
    } catch (error) {
      setError(error as Error, 'Failed to cancel scheduled email send')
      console.log(error)
      throw error
    }
  }

  useEffect(() => {
    // For debug: log when these change
    console.debug({
      scheduledMessages,
      draftMessagesMetadataList,
      loading,
      scheduled,
      selectedDraftId,
    })
  }, [
    scheduledMessages,
    draftMessagesMetadataList,
    loading,
    scheduled,
    selectedDraftId,
  ])

  return (
    <DropDownContainer style={{ display: 'flex', alignItems: 'center' }}>
      {selectedDraftId && (
        <>
          {/* First element: Schedule/Cancel */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {!scheduled ? (
              <MenuLink
                linkType="action"
                text="Schedule Send"
                icon={<ClockCircleOutlined />}
                disabled={loading}
                onClick={handleScheduleSendClick}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{ color: '#1890ff', fontWeight: 500, marginRight: 8 }}
                >
                  Sending at:{' '}
                  {new Date(scheduled.sendAt).toLocaleString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <MenuLink
                  linkType="danger"
                  text="Cancel"
                  icon={<ClockCircleOutlined />}
                  disabled={loading}
                  onClick={() => handleCancelScheduledSendClick(scheduled.id)}
                />
              </div>
            )}
          </div>
          {/* Divider 1 */}
          <div
            style={{
              height: 24,
              borderLeft: '1px solid #e0e0e0',
              margin: '0 12px',
            }}
          />
          {/* Second element: Delete Draft */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MenuLink
              linkType="danger"
              text="Delete Draft"
              icon={<DeleteOutlined />}
              onClick={deleteDraft}
            />
          </div>
          {/* Divider 2 */}
          <div
            style={{
              height: 24,
              borderLeft: '1px solid #e0e0e0',
              margin: '0 12px',
            }}
          />
        </>
      )}
      {/* Schedule Modal */}
      <Modal
        title="Schedule Email Send"
        open={scheduleModalVisible}
        onOk={handleScheduleOk}
        onCancel={handleScheduleCancel}
        okText="Schedule"
        cancelText="Cancel"
      >
        <DatePicker
          showTime
          value={scheduleDate}
          onChange={setScheduleDate}
          disabledDate={(current) =>
            current && current < dayjs().startOf('day')
          }
          style={{ width: '100%' }}
          format="YYYY-MM-DD HH:mm"
        />
      </Modal>
      <StyledDropdown
        trigger={['click']}
        empty={draftMessagesMetadataList.length === 0}
        disabled={loading}
        getPopupContainer={(triggerNode) =>
          triggerNode.parentElement || document.body
        }
        menu={{
          items: draftMessagesMetadataList.map((draft) => ({
            label: 'Draft saved at: ' + draft.updatedAt.toLocaleString(),
            key: draft.updatedAt.toString(),
            onClick: () => {
              onChange(draft.id)
            },
          })) as MenuProps['items'],
        }}
        placement="bottomRight"
      >
        {loading ? (
          <LoadingOutlined />
        ) : (
          <StyledButton onClick={(e) => e.preventDefault()}>
            <Space>
              <>
                {draftMetadata ? (
                  <div>
                    <div>Editing draft saved at:</div>
                    <div>{draftMetadata.updatedAt.toLocaleString()}</div>
                  </div>
                ) : (
                  'Saved Drafts'
                )}
                <DownOutlined />
              </>
            </Space>
          </StyledButton>
        )}
      </StyledDropdown>
    </DropDownContainer>
  )
}
