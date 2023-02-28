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

export const StyledDropdown = styled(Dropdown)`
  padding: 5px 0;
`
