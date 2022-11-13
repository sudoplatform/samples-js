import React, { useContext } from 'react'
import { Sudo } from '@sudoplatform/sudo-profiles'
import { List } from 'antd'
import { Button } from '@sudoplatform/web-ui'
import useAsyncFn, { AsyncState } from 'react-use/lib/useAsyncFn'
import { AppContext } from '../../containers/AppContext'
import { VirtualCardForSudo } from './virtualCard/VirtualCardForSudo'

interface Props {
  listSudosResult: AsyncState<Sudo[]>
  onSudoDeleted?: (sudo: Sudo) => void
}

export const SudoList: React.FC<Props> = (props) => {
  const { profilesClient } = useContext(AppContext)
  const [deleteSudoResult, deleteSudo] = useAsyncFn(async (sudo: Sudo) => {
    await profilesClient.deleteSudo(sudo)
    props.onSudoDeleted?.(sudo)
  })
  return (
    <List
      dataSource={props.listSudosResult.value}
      loading={props.listSudosResult.loading}
      renderItem={(item) => (
        <>
          <List.Item key={item.id}>
            <List.Item.Meta
              title={`${item.firstName ?? ''} ${item.lastName ?? ''}`}
              description={item.label}
            />
            <Button
              danger={true}
              className="delete-sudo"
              disabled={deleteSudoResult.loading}
              loading={deleteSudoResult.loading}
              onClick={() => deleteSudo(item)}
            >
              Delete
            </Button>
          </List.Item>
          <List.Item key={`${item.id ?? 'orphaned'}_virtual_cards`}>
            <VirtualCardForSudo
              sudoId={item.id ?? ''}
              expanded={true}
              title={`Virtual cards for ${item.label ?? '(unknown sudo)'}`}
            />
          </List.Item>
        </>
      )}
    ></List>
  )
}
