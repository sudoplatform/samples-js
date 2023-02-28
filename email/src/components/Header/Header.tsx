import React from 'react'
import { HeaderContainer, SignOutButton } from './Header.styled'

interface Props {
  children?: React.ReactNode
  onSignOut: () => void
}

export const Header = ({ children, onSignOut }: Props): React.ReactElement => (
  <HeaderContainer id="app-header">
    <>{children}</>
    <SignOutButton onClick={onSignOut}>Sign Out</SignOutButton>
  </HeaderContainer>
)
