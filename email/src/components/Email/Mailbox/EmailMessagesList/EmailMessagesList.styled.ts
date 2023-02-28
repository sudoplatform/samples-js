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

export const StyledTable = styled(Table)`
  // Make rows adhere to width condensing and ellipsis text
  .ant-table-content > table {
    table-layout: fixed !important;
  }
  // & {
  //   .ant-table-wrapper,
  //   .ant-spin-nested-loading,
  //   .ant-spin-container,
  //   .ant-table,
  //   .ant-table-container,
  //   .ant-table-content,
  //   .ant-table-tbody {
  //     height: 100%;
  //   }

  //   table {
  //     height: calc(100% - 55px);
  //   }
  // }
`
StyledTable.defaultProps = {
  style: {
    height: '100%',
  },
}
