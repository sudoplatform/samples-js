import styled from 'styled-components'
import { SimplePage, Heading } from '@components/SimplePage'
import { Card } from '@components/Card'

export const PageContainer = styled(SimplePage)``

export const StyledHeading = styled(Heading)`
  margin-bottom: 15px;
  margin-top: -100px;
`

export const ContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const StyledCard = styled(Card)`
  text-align: left;
`
