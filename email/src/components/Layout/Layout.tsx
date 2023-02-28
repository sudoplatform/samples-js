import styled from 'styled-components'
import { theme } from '../../theme'

export const Page = styled.div`
  padding: 20px 20px 60px 20px;
  margin: auto;
  max-width: 1000px;
  width: 100%;
  height: 100%;
`

export const PageHeading = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${theme.greys.woodsmoke};
`

export const ContentRow = styled.div`
  margin-bottom: 32px;
`
