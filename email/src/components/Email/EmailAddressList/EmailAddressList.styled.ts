import styled from 'styled-components'
import { LinkButton } from '@components/Table'
import { Input } from '@sudoplatform/web-ui'

export const StyledText = styled.span`
  color: #999999;
`

export const StyledLinkButton = styled(LinkButton)`
  color: #3770f6;
`

export const ErrorContainer = styled.div`
  margin-bottom: 20px;
`

export const AliasInput = styled(Input)`
  display: inline-block;
  width: 200px;
  margin: 0;
`

export const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  column-gap: 15px;
`
