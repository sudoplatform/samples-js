import React, { useContext } from 'react'
import { Sudo } from '@sudoplatform/sudo-profiles'
import { SudosContext } from '@contexts/index'
import { TableCard as Card } from '@components/Card'
import { Table, DangerLink } from '@components/Table'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { useSudoDelete } from '@hooks/useSudoDelete'
import { LoadingContainer } from './SudoList.styled'
import { message } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const idColumnPercent = 38
const otherColumnPercent = (100 - idColumnPercent) / 4
const otherColumnPercentStr = `${otherColumnPercent}%`

export const SudoList = (): React.ReactElement => {
  const { sudos, sudosLoading } = useContext(SudosContext)

  const { sudoDeleteLoadingId, sudoDeleteError, deleteSudoHandler } =
    useSudoDelete()

  // Handler function called from UI to delete sudo and
  // display antd messages on success/fail.
  const deleteSudo = async (sudo: Sudo): Promise<void> => {
    try {
      await deleteSudoHandler(sudo)
      void message.success(
        `Sudo '${sudo.label as string}' successfully deleted`,
      )
    } catch {
      void message.error(`Failed to delete Sudo '${sudo.label as string}'`)
    }
  }

  return (
    <Card title="Existing Sudos">
      <ErrorBoundary error={sudoDeleteError}>
        <Table
          columns={[
            {
              title: 'Label',
              dataIndex: 'label',
              key: 'label',
              width: otherColumnPercentStr,
            },
            {
              title: 'First Name',
              dataIndex: 'firstName',
              key: 'firstName',
              width: otherColumnPercentStr,
            },
            {
              title: 'Last Name',
              dataIndex: 'lastName',
              key: 'lastName',
              width: otherColumnPercentStr,
            },
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
              width: `${idColumnPercent}%`,
            },
            {
              key: 'action',
              width: otherColumnPercentStr,
              render: (_: any, rowData: any, index: number) => {
                const sudo = rowData as Sudo

                return sudoDeleteLoadingId === sudo.id ? (
                  <LoadingContainer>
                    <LoadingOutlined />
                  </LoadingContainer>
                ) : (
                  <DangerLink
                    id={`sudo_${index}-delete-button`}
                    onClick={() => deleteSudo(sudo)}
                  >
                    Remove
                  </DangerLink>
                )
              },
            },
          ]}
          rowKey="id"
          dataSource={sudos ?? []}
          loading={sudosLoading}
        />
      </ErrorBoundary>
    </Card>
  )
}
