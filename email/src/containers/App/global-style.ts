import { createGlobalStyle } from 'styled-components'
import { theme } from '../../theme'

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${theme.greys.athens};
  }

  a {
    color: ${theme.colors.sudoBlue};
    transition: color ease 0.25s;
    &:hover {
      text-decoration: underline;
    }
  }

  /**********
  * DropDown
  */

  .ant-dropdown-trigger {
    line-height: normal
  }

  /**********
  * Button
  */

  .ant-btn-primary {
    background-color: ${theme.colors.sudoBlue};
    border-color: ${theme.colors.sudoBlue};
    color: ${theme.greys.alabastor};
  }

  .ant-btn-default {
    background-color: #fff;
    border-color: ${theme.colors.sudoBlue};
    color: ${theme.colors.sudoBlue};
  }

  .ant-btn-danger {
    background-color: ${theme.colors.coral};
  }

  /**********
  * Modal
  */

  .ant-modal {
    .ant-modal-header {
      border-bottom: none;
      padding: 24px 24px 8px;
    }

    .ant-modal-title {
      font-size: 16px;
    }

    .ant-modal-close {
      display: none;
    }
  }

  .ant-modal.ant-modal-confirm {
    .ant-modal-body {
      padding: 24px;

      .ant-modal-confirm-title {
        margin: -8px -24px 0;
        padding: 0 24px 18px;
      }

      .ant-modal-confirm-btns {
        float: none;
        display: flex;
        justify-content: flex-end;
        margin: 0 -24px -8px;
        padding: 18px 24px 0;
      }
    }
  }

  /**********
  * Form
  */

  .ant-form {
    text-align: left;

    legend {
      margin-bottom: 4px;
      border: none;
      color: ${theme.greys.woodsmoke};
      font-size: 14px;
    }
  }

  /**********
  * Descriptions
  */

  .ant-descriptions-item-label.ant-descriptions-item-colon {
    background-color: ${theme.greys.glamdring};
  }

  .ant-descriptions-bordered {
    .ant-descriptions-item-label {
      background-color: ${theme.greys.glamdring};
    }

    .ant-descriptions-item-label, .ant-descriptions-item-content {
      border-right: solid 1px ${theme.greys.geyser};
    }

    .ant-descriptions-item-label, tr:not(:last-child) .ant-descriptions-item-content {
      border-bottom: solid 1px ${theme.greys.geyser};
    }
  }

  .ant-descriptions-bordered .ant-descriptions-view {
    border: solid 1px ${theme.greys.geyser};
  }

  /**********
  * Table
  */

  .ant-table-tbody > tr .ant-table {
    margin: 0;
  }

  .ant-table thead tr th {
    background-color: ${theme.greys.glamdring};
  }

  tr.ant-table-expanded-row {
    background-color: ${theme.greys.glamdring};
  }

  .ant-table-thead tr th {
    box-shadow: inset 0 -1px 0 0 ${theme.greys.geyser};
    background-color: ${theme.greys.glamdring};
  }

  .ant-table-tbody > tr.ant-table-expanded-row > td {
    padding: 16px 24px;
    background-color: ${theme.greys.glamdring};
  }

  tr.ant-table-row {
    box-shadow: inset 0 -1px 0 0 #d4dbe3;
  }

  /**********
  * Tag
  */

  .ant-tag.ant-tag-success, .ant-tag.ant-tag-error, .ant-tag.ant-tag-default {
    border-radius: 4px;
    font-weight: 500;
  }
  .ant-tag.ant-tag-success {
    color: ${theme.colors.sudoBlue};
    border: solid 1px ${theme.colors.sudoBlue};
    background-color: rgba(0, 113, 222, 0.05); 
  }

  .ant-tag.ant-tag-error {
    color: ${theme.colors.coral};
    border: solid 1px ${theme.colors.coral};
    background-color: rgba(255, 67, 74, 0.05); 
  }

  .ant-tag.ant-tag-default {
    color: #8e95a7;
    border: solid 1px #9faab6;
    background-color: #ececf0; 
  }

  /**********
   * Tabs
   */

   .ant-tabs-tabpane {
     outline: none
   }
   
`
