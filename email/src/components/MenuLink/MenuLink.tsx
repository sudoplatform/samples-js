import React from 'react'
import { DangerLink, ActionLink } from '@components/Table'

interface MenuLinkProps {
  linkType: 'action' | 'danger'
  text: string
  icon?: React.ReactNode
  disabled?: boolean
  onClick?: () => void
}

export const MenuLink = ({
  text,
  icon,
  linkType,
  ...props
}: MenuLinkProps): React.ReactElement => {
  const inner = (
    <>
      {text}
      {icon && (
        <div
          style={{
            display: 'inline-block',
            marginLeft: '5px',
          }}
        >
          {icon}
        </div>
      )}
    </>
  )

  return linkType === 'action' ? (
    <ActionLink {...props}>{inner}</ActionLink>
  ) : (
    <DangerLink {...props}>{inner}</DangerLink>
  )
}
