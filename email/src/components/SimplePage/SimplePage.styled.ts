import styled from 'styled-components'
import { theme } from '../../theme'
import platformTilesImg from '../../../public/images/platform_tiles.png'

export const FlexContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #ececf0 url('${platformTilesImg}') no-repeat;
  background-size: cover;
  display: flex;
  flex-direction: column;
  height: 100vh;
  z-index: 100;
  text-align: center;
`

export const ContentContainer = styled.div`
  max-width: 450px;
  padding: 15px;
  margin: auto;
`

export const Heading = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.greys.bluewood};
  line-height: 1.2;
  margin-bottom: 15px;
`

export const SubHeading = styled.p`
  font-size: 24px;
  color: ${theme.greys.fjord};
  margin: 0;
  margin-bottom: 30px;
  line-height: 1.3;
`
