import React from 'react'
import styled from 'styled-components'
import { Image, ImageName } from '@components/Image'

const SudoPlatformLogoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const StyledImage = styled(Image)<{ width?: number }>`
  display: block;
  width: ${(props) => (props.width ? `${props.width}px` : 'auto')};
  height: auto;
`

interface Props {
  className?: string
  name: ImageName
  width?: number
}

export const SudoPlatformLogo = (props: Props): JSX.Element => (
  <SudoPlatformLogoContainer className={props.className}>
    <StyledImage name={props.name} width={props.width} />
  </SudoPlatformLogoContainer>
)
