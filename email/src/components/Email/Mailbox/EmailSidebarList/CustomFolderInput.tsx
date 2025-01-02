import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import React from 'react'

interface Props {
  inputValue: string
  onChange: (value: string) => void
  onSave: () => void
  onCancel: () => void
}

export const CustomFolderInput = ({
  onSave,
  onCancel,
  onChange,
  inputValue,
}: Props): React.ReactElement => {
  return (
    <>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => {
          e.preventDefault()
          onChange(e.target.value)
        }}
      />
      <Button
        onClick={() => {
          onSave()
          onChange('')
        }}
      >
        <CheckOutlined />
      </Button>
      <Button onClick={onCancel}>
        <CloseOutlined />
      </Button>
    </>
  )
}
