import React from 'react'
import styled from 'styled-components'
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
 * The web-ui button renders a disabled button with its borderless `ghost` style, so it looks like plain
 * text. This gives disabled buttons the usual disabled button look instead.
 */
const StyledWebUiButton = styled(WebUiButton)`
  &&[disabled],
  &&[disabled]:hover,
  &&[disabled]:focus,
  &&[disabled]:active {
    color: rgba(0, 0, 0, 0.25);
    background: rgba(0, 0, 0, 0.04);
    border: 1px solid #d9d9d9;
    box-shadow: none;
    cursor: not-allowed;
  }
`

/**
 * Wrapper component for the `Button` from the `@sudoplatform/web-ui`
 * repository.
 *
 * This is to reduce any Typescript errors from any component that
 * implements the Web UI button to this component only.
 */
export const Button = ({ children, ...props }: Props): React.ReactElement => {
  return <StyledWebUiButton {...props}>{children}</StyledWebUiButton>
}
