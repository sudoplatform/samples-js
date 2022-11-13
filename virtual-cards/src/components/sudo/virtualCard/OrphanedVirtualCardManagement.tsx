import { Card, VSpace } from '@sudoplatform/web-ui'
import React from 'react'
import { LearnMore } from '../../LearnMore'
import { VirtualCardForSudo } from './VirtualCardForSudo'

export const OrphanedVirtualCardManagement: React.FC = () => {
  return (
    <Card title="Orphaned Virtual Cards" className="orphaned-virtual-cards">
      <VSpace spacing="large">
        <LearnMore
          nameText="Orphaned Virtual Cards"
          helpText="Orphaned Virtual cards are cards for which the owning sudo has been deleted or invalidated."
          helpUrl="https://docs.sudoplatform.com/guides/virtual-cards/manage-virtual-cards#closed-cards"
        />
      </VSpace>
      <VirtualCardForSudo
        sudoId={''}
        expanded={true}
        title={'Orphaned Virtual Cards List'}
      />
    </Card>
  )
}
