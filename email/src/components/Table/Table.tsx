import { Table as _Table } from 'antd'
import styled, { css } from 'styled-components'
import { theme } from '../../theme'

export type DeleteHandler = (fingerprint: string) => void

export const LinkButton = styled.button`
  display: inline;
  line-height: inherit;
  border: 0;
  outline: 0;
  color: currentColor;
  background: transparent;
  padding: 0;

  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
`

export const ActionLink = styled(LinkButton)`
  ${({ disabled }) =>
    disabled
      ? css`
          color: ${theme.greys.mystic};
          pointer-events: none;
        `
      : css`
          color: ${theme.colors.sudoBlue};
        `}
`

export const DangerLink = styled(LinkButton)`
  ${({ disabled }) =>
    disabled
      ? css`
          color: ${theme.greys.mystic};
          pointer-events: none;
        `
      : css`
          color: ${theme.colors.coral};
        `}
`

export const Table = styled(_Table)`
  // Set background color of headers to white
  .ant-table thead tr th,
  .ant-table-thead > tr > th {
    background-color: white;
  }

  // Left padding on first column
  .ant-table-container table > thead > tr:first-child th:first-child,
  .ant-table-tbody > tr > td:first-child {
    padding-left: 24px;
  }

  // Right padding on last column
  .ant-table-container table > thead > tr:last-child th:last-child,
  .ant-table-tbody > tr > td:last-child {
    padding-right: 24px;
  }

  // Padding for pagination buttons container
  .ant-table-pagination.ant-pagination {
    margin: 24px 0;
    padding-right: 24px;
  }
`
