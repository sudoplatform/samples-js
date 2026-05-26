import { FormItem } from '@sudoplatform/web-ui'
import styled from 'styled-components'

export const StretchForm = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  > * {
    // margin-bottom: 0;
    width: 32.5%;
  }
`

export const SubmitButtonContainer = styled(FormItem)`
  margin-top: -15px;
  margin-bottom: 0px;
`

export const ErrorContainer = styled.div`
  margin-bottom: 20px;
`
