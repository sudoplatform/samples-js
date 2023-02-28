import React from 'react'
import { SimplePage } from '@components/SimplePage'
import { LoadingOutlined } from '@ant-design/icons'

export const LoadingPage = (): React.ReactElement => {
  return (
    <SimplePage>
      <LoadingOutlined />
    </SimplePage>
  )
}
