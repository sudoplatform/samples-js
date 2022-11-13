import { FetchOption } from '@sudoplatform/sudo-profiles'
import { Card, VSpace } from '@sudoplatform/web-ui'
import Collapse from 'antd/lib/collapse/Collapse'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import React, { useContext, useEffect } from 'react'
import useAsyncFn from 'react-use/lib/useAsyncFn'
import { AppContext } from '../../containers/AppContext'
import { LearnMore } from '../LearnMore'
import { SudoCreate } from './SudoCreate'
import { SudoList } from './SudoList'

export const SudoManagement: React.FC = () => {
  const { profilesClient } = useContext(AppContext)
  const [listSudosResult, listSudos] = useAsyncFn(async () => {
    console.log('listing sudos')
    const result = await profilesClient.listSudos(FetchOption.RemoteOnly)
    return result
  })

  useEffect(() => {
    void listSudos()
  }, [listSudos])

  return (
    <Card title="Sudo Management">
      <VSpace spacing="large">
        <LearnMore
          nameText="Sudo Management"
          helpText="Virtual cards must belong to a Sudo. A Sudo is a digital identity
          created and owned by a real person."
          helpUrl="https://docs.sudoplatform.com/guides/sudos/managing-sudos"
        />
        <LearnMore
          nameText=" Virtual Card Management"
          helpText="Virtual cards are the cornerstone of the Virtual Cards SDK. 
          Virtual cards can be used as a proxy between a user's personal funding source and online merchants.
          Select a Sudo to see the associated virtual cards."
          helpUrl="https://docs.sudoplatform.com/guides/virtual-cards/manage-virtual-cards"
        />
        <Collapse defaultActiveKey={'create'}>
          <CollapsePanel header="Create Sudo" key="create">
            <SudoCreate onSudoCreated={listSudos} />
          </CollapsePanel>
          <CollapsePanel header="Existing Sudos" key="manage">
            <SudoList
              listSudosResult={listSudosResult}
              onSudoDeleted={listSudos}
            />
          </CollapsePanel>
        </Collapse>
      </VSpace>
    </Card>
  )
}
