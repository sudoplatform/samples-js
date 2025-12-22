import styled from 'styled-components'
import { Table } from '@components/Table'
import { theme } from '../../../../theme'

export const MessagesListContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;

  display: flex;
  flex-direction: row;
`

export const ColumnDivider = styled.div`
  border-right: 1px solid ${theme.greys.mystic};
  height: 22px;
`

export const MenuContainer = styled.div`
  position: absolute;
  z-index: 1;
  left: 65px;
  width: calc(100% - 65px);
  height: 55px;
  display: flex;
  flex-direction: row;
  align-items: center;
  column-gap: 15px;
`

export const FixedRightColumn = styled.div`
  position: absolute;
  right: 20px;
`

export const StyledTable = styled(Table).attrs({
  style: {
    height: '100%',
  },
})`
  // Make rows adhere to width condensing and ellipsis text
  .ant-table-content > table {
    table-layout: fixed !important;
  }
`
