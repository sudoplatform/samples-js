import React from 'react'
import { Button as WebUiButton } from '@sudoplatform/web-ui'

// Copied from web-ui repository due to not being exported.
interface WebUiButtonProps {
  className?: string
  kind?: 'primary' | 'default' | 'link' | 'ghost'
  danger?: boolean
  loading?: boolean
  disabled?: boolean
  type?: 'submit' | 'button' | 'reset'
  onClick?: React.MouseEventHandler<HTMLElement>
}

interface Props extends WebUiButtonProps {
  children?: React.ReactNode
}

/**
 * Wrapper component for the `Button` from the `@sudoplatform/web-ui`
 * repository.
 *
 * This is to reduce any Typescript errors from any component that
 * implements the Web UI button to this component only.
 */
export const Button = ({ children, ...props }: Props): React.ReactElement => {
  return <WebUiButton {...props}>{children}</WebUiButton>
}
