import React, { useMemo } from 'react'
import { StyledDropdown, StyledButton } from './Dropdown.styled'
import { ItemType } from 'antd/lib/menu/hooks/useItems'
import { Space } from 'antd'
import { DownOutlined, LoadingOutlined } from '@ant-design/icons'

interface Item<T> {
  label: string
  id: string
  value: T
}

interface Props<T> {
  id?: string
  emptyItemsLabel: string
  noItemSelectedLabel: string
  selectedItem?: Item<T>
  items?: Item<T>[]
  itemsLoading: boolean
  onChange: (item: Item<T>) => void
  dropdownPlacement?:
    | 'bottomRight'
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'top'
    | 'bottom'
}

/**
 * Generic component to render a dropdown menu with preset styling.
 */
export const Dropdown = <T,>({
  id,
  emptyItemsLabel,
  noItemSelectedLabel,
  selectedItem,
  items,
  itemsLoading,
  dropdownPlacement,
  onChange,
}: Props<T>): React.ReactElement => {
  const disabled = !items || itemsLoading || items.length === 0

  // Based on the value of `disabled`, render dropdown as list of
  // items if exists, otherwise render an empty JSX element.
  // This prevents an empty box on selection with no items.
  const dropdownProps = useMemo(() => {
    return disabled
      ? {
          dropdownRender: () => <></>,
        }
      : {
          menu: {
            items: items.map((item) => ({
              label: item.label,
              key: item.id,
              onClick: () => onChange(item),
            })) as ItemType[],
          },
        }
  }, [disabled, items, onChange])

  return (
    <StyledDropdown placement={dropdownPlacement} {...dropdownProps}>
      {itemsLoading ? (
        <LoadingOutlined />
      ) : (
        <StyledButton id={id} onClick={(e) => e.preventDefault()}>
          <Space>
            {disabled
              ? emptyItemsLabel
              : selectedItem
              ? selectedItem.label
              : noItemSelectedLabel}
            <DownOutlined />
          </Space>
        </StyledButton>
      )}
    </StyledDropdown>
  )
}
