import React, { useContext } from 'react'
import { SudosContext } from '@contexts'
import { Dropdown } from '@components/Dropdown'

export const SudosDropdown = (): React.ReactElement => {
  const { sudos, sudosLoading, activeSudo, setActiveSudo } =
    useContext(SudosContext)

  return (
    <Dropdown
      id="sudos-dropdown-selector"
      emptyItemsLabel="No Sudos"
      noItemSelectedLabel="Select Sudo"
      selectedItem={
        activeSudo
          ? {
              label: activeSudo.label as string,
              id: activeSudo.id as string,
              value: activeSudo,
            }
          : undefined
      }
      items={
        sudos
          ? sudos.map((sudo) => ({
              label: sudo.label as string,
              id: sudo.id as string,
              value: sudo,
            }))
          : undefined
      }
      itemsLoading={sudosLoading}
      onChange={(changedItem) =>
        changedItem && setActiveSudo(changedItem.value)
      }
    />
  )
}
