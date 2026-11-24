import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, Modal, Table, Typography, message } from 'antd'
import { SudosContext } from '@contexts/index'
import {
  SudoKeyStatus,
  checkSudoKeys,
  deleteUnreadableSudo,
} from '@services/sudoKeyCheck'
import { loadSudoKeys } from '@services/sudoKeyStore'
import { describeError } from '@util/format'

const { Paragraph, Text } = Typography

/**
 * Shown when the Sudos can't be listed. The Sudo Profiles SDK fails the whole list when any Sudo can't be
 * decrypted, so this finds the Sudos encrypted with a key this browser doesn't have, and offers to delete
 * them or to import a key backup that has the key.
 */
export const UnreadableSudos = (): React.ReactElement | null => {
  const navigate = useNavigate()
  const { sudosError, listSudosHandler } = useContext(SudosContext)
  const [keyCheck, setKeyCheck] = useState<SudoKeyStatus[]>()
  const [keyCheckError, setKeyCheckError] = useState<string>()

  useEffect(() => {
    setKeyCheck(undefined)
    setKeyCheckError(undefined)
    if (!sudosError) return
    let cancelled = false
    const check = async () => {
      try {
        const statuses = await checkSudoKeys()
        if (!cancelled) setKeyCheck(statuses)
      } catch (err) {
        console.error(err)
        if (!cancelled) setKeyCheckError(describeError(err))
      }
    }
    void check()
    return () => {
      cancelled = true
    }
  }, [sudosError])

  if (!sudosError) return null

  const handleDelete = (status: SudoKeyStatus) => {
    Modal.confirm({
      title: 'Delete unreadable Sudo?',
      content: `This browser doesn't have the key to read Sudo ${status.id}, so its label can't be shown. Deleting it also deletes the resources that belong to it, such as its email addresses and their messages. This cannot be undone.`,
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteUnreadableSudo(status)
          void message.success(`Sudo ${status.id} deleted`)
          listSudosHandler()
        } catch (err) {
          console.error(err)
          void message.error(`Failed to delete Sudo: ${describeError(err)}`)
        }
      },
    })
  }

  const unreadableCount =
    keyCheck?.filter((s) => s.missingKeyIds.length > 0).length ?? 0

  return (
    <div style={{ marginBottom: 32 }}>
      <Alert
        type="warning"
        showIcon
        message="Some Sudos can't be read in this browser"
        description={
          <>
            <Paragraph>
              Keys are kept in memory, so after a page reload or a new sign in
              this browser doesn&apos;t have the keys to read your Sudos. Import
              a key backup from Account &gt; Import/Export Keys. The list stays
              unavailable while any Sudo was encrypted with a key that
              isn&apos;t in the backup.
            </Paragraph>
            <Button
              size="small"
              style={{ marginBottom: 12 }}
              onClick={() => void navigate('/account/keys')}
            >
              Import/Export Keys
            </Button>
            {keyCheckError && (
              <Paragraph type="danger">
                Unable to check the Sudos&apos; keys: {keyCheckError}
              </Paragraph>
            )}
            {keyCheck && (
              <>
                <Paragraph strong>
                  {unreadableCount} of {keyCheck.length} Sudos need a key this
                  browser doesn&apos;t have. Keys in this browser:{' '}
                  {loadSudoKeys()
                    ?.keys.map((k) => k.id)
                    .join(', ') ?? 'none'}
                </Paragraph>
                <Table<SudoKeyStatus>
                  size="small"
                  rowKey="id"
                  pagination={false}
                  dataSource={keyCheck}
                  columns={[
                    {
                      title: 'Sudo',
                      dataIndex: 'id',
                      render: (id: string) => <Text code>{id}</Text>,
                    },
                    {
                      title: 'Created',
                      dataIndex: 'createdAt',
                      render: (createdAt: Date) => createdAt.toLocaleString(),
                    },
                    {
                      title: 'Key',
                      dataIndex: 'keyIds',
                      render: (keyIds: string[]) => (
                        <Text code>{keyIds.join(', ')}</Text>
                      ),
                    },
                    {
                      title: 'Readable',
                      key: 'readable',
                      render: (_, status) =>
                        status.missingKeyIds.length === 0 ? 'Yes' : 'No',
                    },
                    {
                      title: '',
                      key: 'actions',
                      align: 'right',
                      render: (_, status) =>
                        status.missingKeyIds.length > 0 && (
                          <Button
                            size="small"
                            danger
                            onClick={() => handleDelete(status)}
                          >
                            Delete
                          </Button>
                        ),
                    },
                  ]}
                />
              </>
            )}
          </>
        }
      />
    </div>
  )
}
