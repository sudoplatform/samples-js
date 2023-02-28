import styled from 'styled-components'
import { Dropdown } from 'antd'

export const StyledButton = styled.a`
  display: inline;
  line-height: inherit;
  border: 0;
  outline: 0;
  color: currentColor;
  background: transparent;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

export const StyledDropdown = styled(Dropdown)<{ empty: boolean }>`
  padding: 5px 0;
  pointer-events: ${({ empty }) => (empty ? `none` : 'default')};
`

export const VerticalAlign = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  column-gap: 20px;
`

export const DropDownContainer = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  height: 57px;
  padding-right: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
`
