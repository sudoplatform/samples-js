import styled from 'styled-components'
import { theme } from '../../../../theme'
import { LoadingOutlined } from '@ant-design/icons'

export const Container = styled.div`
  height: 100%;
  width: 100%;
  overflow-y: auto;
  background: #f9f9f9;
`

export const ListItem = styled.div<{ selected?: boolean }>`
  height: 55px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  transition: ease 0.25s;
  padding: 0 20px;

  &.custom-folder-item {
    ${({ selected }) =>
      selected &&
      `
      padding: 0 10px;
    `}

    & button {
      padding: 8px;
    }
  }

  &:hover {
    cursor: pointer;
  }

  &#blocklist {
    border-top: 1px solid #cad3dc;
  }

  ${({ selected }) =>
    selected &&
    `
    background: #f0f0f0;
    border-right: 4px solid ${theme.colors.sudoBlue};
  `}
`

export const StyledLoader = styled(LoadingOutlined)`
  margin: 19px 0 0 20px;
`
