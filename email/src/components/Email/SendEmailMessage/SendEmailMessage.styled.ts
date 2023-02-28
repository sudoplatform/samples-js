import styled from 'styled-components'
import { FormItem as _FormItem } from '@sudoplatform/web-ui'

export const SubmitButtonContainer = styled(_FormItem)`
  margin-top: -15px;
  margin-bottom: 0px;
`

export const FormItem = styled(_FormItem)`
  & .ant-form-item-explain-error {
    margin-bottom: 10px;
  }
`
