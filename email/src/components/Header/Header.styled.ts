import styled from 'styled-components'
import { theme } from '../../theme'

export const HeaderContainer = styled.div`
  background-color: #fff;
  color: ${theme.greys.fjord};
  height: 64px;
  justify-content: space-between;
  padding: 0 24px;

  // Vertically center all child elements
  display: flex;
  align-items: center;
`

export const SignOutButton = styled.a`
  font-size: 14px;
  color: ${theme.colors.sudoBlue};
  float: right;
`
