import styled from 'styled-components'
import { LinkButton } from '@components/Table'

export const StyledText = styled.span`
  color: #999999;
`

export const StyledLinkButton = styled(LinkButton)`
  color: #3770f6;
`

export const ErrorContainer = styled.div`
  margin-bottom: 20px;
`

export const ButtonsWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  column-gap: 15px;
`
