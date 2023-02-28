import styled from 'styled-components'
import { Dropdown } from 'antd'
import { theme } from '../../theme'

export const StyledButton = styled.a`
  display: inline;
  line-height: inherit;
  border: 0;
  outline: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;
  font-weight: 700;

  color: ${theme.greys.fjord};
  transition: color ease 0.25s;

  &:hover {
    color: ${theme.greys.fjord};
    text-decoration: underline;
  }
`

export const StyledDropdown = styled(Dropdown)`
  padding: 5px 0;
  height: fit-content;
  width: fit-content;
`
