import styled from 'styled-components'
import { Card as _Card } from 'antd'
import { theme } from '../../theme'

export const Heading = styled.h2``

export const SubHeading = styled.h3`
  font-size: 14px;
  color: ${theme.greys.raven};
  font-weight: normal;
`

export const Card = styled(_Card)`
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.12);
  width: 100%;
`

export const TableCard = styled(Card)`
  overflow: hidden;
  .ant-card-body {
    padding: 0;
  }
`
