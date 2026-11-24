import React, { useContext, useRef, useState } from 'react'
import { Alert, Button, Form, Input, Modal, Space, Typography } from 'antd'
import { ProjectContext, SudosContext } from '@contexts/index'
import { Card } from '@components/Card'
import { Page, PageHeading, ContentRow } from '@components/Layout'
import { LearnMore } from '@components/LearnMore'
import {
  KeyBackupError,
  MIN_PASSWORD_LENGTH,
  ReadKeyBackup,
  exportKeyBackup,
  importKeyBackup,
  readKeyBackup,
} from '@services/keyBackup'
import { getUsedFederatedSignIn } from '@services/session'
import { describeError, downloadFile } from '@util/format'

const { Paragraph, Text } = Typography

type Mode = 'export' | 'import'

const describeBackupError = (err: unknown): string =>
  err instanceof KeyBackupError ? err.message : describeError(err)

/**
 * The `Import/Export Keys` page backs up the keys that encrypt Sudos and unseal email messages, and restores
 * them in another browser or after a reload, which loses them.
 */
export const KeyBackupPage = (): React.ReactElement => {
  const { sudoUserClient, sudoEmailClient, enforceSingletonPublicKey } =
    useContext(ProjectContext)
  const { listSudosHandler } = useContext(SudosContext)
  const fileInput = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<Mode>()
  const [backup, setBackup] = useState<ReadKeyBackup>()
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string>()
  const [modalError, setModalError] = useState<string>()
  const canBackUp = getUsedFederatedSignIn()
  const [form] = Form.useForm<{ password: string; confirm?: string }>()
  const [modal, modalContext] = Modal.useModal()

  const clients = {
    sudoUserClient,
    emailClient: sudoEmailClient,
    enforceSingletonPublicKey,
  }

  const close = () => {
    setMode(undefined)
    setBackup(undefined)
    setModalError(undefined)
    form.resetFields()
  }

  const handleFileChosen = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError(undefined)
    try {
      setBackup(readKeyBackup(await file.arrayBuffer()))
      setMode('import')
    } catch (err) {
      setError(describeBackupError(err))
    }
  }

  const doExport = async ({ password }: { password: string }) => {
    setWorking(true)
    setModalError(undefined)
    try {
      const data = await exportKeyBackup(clients, password)
      const date = new Date().toISOString().slice(0, 10)
      downloadFile(`sudo-email-keys-${date}.json`, data, 'application/json')
      close()
      void modal.success({
        title: 'Keys Exported',
        content:
          'Keep the file and its password safe. Anyone with both can read your Sudos and email.',
      })
    } catch (err) {
      console.error(err)
      setModalError(describeBackupError(err))
    } finally {
      setWorking(false)
    }
  }

  const doImport = async ({ password }: { password: string }) => {
    if (!backup) return
    setWorking(true)
    setModalError(undefined)
    try {
      const result = await importKeyBackup(clients, backup, password)
      close()
      // The imported keys may make Sudos readable that weren't.
      listSudosHandler()
      void modal.success({
        title: 'Keys Imported',
        content: (
          <>
            <Paragraph>
              {result.importedEmailKeys
                ? `Imported ${result.sudoKeyCount} Sudo key(s) and the email keys.`
                : `Imported ${result.sudoKeyCount} Sudo key(s). The backup had no email keys.`}
            </Paragraph>
            {result.createdSingletonKeys && (
              <Paragraph>
                The backup had no shared email key, so a new one was created for
                the email addresses you provision. Export a new backup to
                include it.
              </Paragraph>
            )}
            {result.unrecognisedSdks.length > 0 && (
              <Paragraph>
                This backup also contains keys this app doesn&apos;t use (
                {result.unrecognisedSdks.join(', ')}), which were skipped.
              </Paragraph>
            )}
          </>
        ),
      })
    } catch (err) {
      console.error(err)
      setModalError(describeBackupError(err))
    } finally {
      setWorking(false)
    }
  }

  const passwordRules = [
    { required: true, message: 'Enter a password' },
    {
      min: MIN_PASSWORD_LENGTH,
      message: `Use at least ${MIN_PASSWORD_LENGTH} characters.`,
    },
  ]

  return (
    <Page>
      {modalContext}
      <PageHeading>Import/Export Keys</PageHeading>
      <ContentRow>
        <LearnMore
          nameText="Key Backup"
          helpText="Your Sudos are encrypted with keys kept in this browser's memory, and each email address's messages are sealed with keys created when it was provisioned. A page reload or a federated sign in loses them. Back them up to read your Sudos and email after a reload or in another browser signed in to the same account."
          helpUrl="https://docs.sudoplatform.com/guides/email"
        />
      </ContentRow>
      {!canBackUp && (
        <ContentRow>
          <Alert
            type="warning"
            showIcon
            message="Key Backup Needs Federated Sign In"
            description="A TEST registration is tied to this browser, so another browser that registers with a TEST key becomes a different user and can't see these Sudos. Sign in with Federated Sign In to back up your keys."
          />
        </ContentRow>
      )}
      {error && (
        <ContentRow>
          <Alert
            type="error"
            showIcon
            closable
            onClose={() => setError(undefined)}
            message="Key backup failed"
            description={error}
          />
        </ContentRow>
      )}
      <ContentRow>
        <Card title="Export Keys">
          <Space direction="vertical">
            <Text type="secondary">
              Creates a backup file protected by a password you choose. Anyone
              with the file and its password can read your Sudos and email, so
              keep both safe.
            </Text>
            <Button
              id="export-keys-button"
              type="primary"
              disabled={!canBackUp}
              onClick={() => setMode('export')}
            >
              Export Keys
            </Button>
          </Space>
        </Card>
      </ContentRow>
      <ContentRow>
        <Card title="Import Keys">
          <Space direction="vertical">
            <Text type="secondary">
              Adds the Sudo keys in a backup to this browser&apos;s, and
              replaces this browser&apos;s email keys with the backup&apos;s.
              New Sudos are then encrypted with the backup&apos;s current Sudo
              key. Email keys created in this browser since the backup was made
              are removed, so export them first if you need them.
            </Text>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => void handleFileChosen(e)}
            />
            <Button
              id="import-keys-button"
              disabled={!canBackUp}
              onClick={() => fileInput.current?.click()}
            >
              Import Keys
            </Button>
          </Space>
        </Card>
      </ContentRow>
      <Modal
        title={mode === 'export' ? 'Export Keys' : 'Import Keys'}
        open={mode !== undefined}
        okText={mode === 'export' ? 'Export' : 'Import'}
        confirmLoading={working}
        onCancel={close}
        onOk={() => form.submit()}
        destroyOnHidden
        forceRender
      >
        {mode === 'export' ? (
          <Paragraph type="secondary">
            You&apos;ll need this password to import the backup. It can&apos;t
            be recovered if you forget it.
          </Paragraph>
        ) : (
          <Paragraph type="secondary">
            Enter the password used when this backup was exported.{' '}
            {backup && (
              <Text type="secondary">
                Exported from {backup.platform} on{' '}
                {backup.createdAt.toLocaleDateString()}.
              </Text>
            )}
          </Paragraph>
        )}
        {modalError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message={modalError}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            mode === 'export' ? void doExport(values) : void doImport(values)
          }
        >
          <Form.Item
            name="password"
            label="Password"
            rules={
              mode === 'export'
                ? passwordRules
                : [{ required: true, message: 'Enter the password' }]
            }
          >
            <Input.Password autoFocus />
          </Form.Item>
          {mode === 'export' && (
            <Form.Item
              name="confirm"
              label="Confirm password"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirm the password' },
                ({ getFieldValue }) => ({
                  validator: (_, value) =>
                    !value || getFieldValue('password') === value
                      ? Promise.resolve()
                      : Promise.reject(new Error("The passwords don't match.")),
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </Page>
  )
}
