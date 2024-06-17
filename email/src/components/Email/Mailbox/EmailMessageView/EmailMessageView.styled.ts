import { theme } from '../../../../theme'
import styled from 'styled-components'

export const Container = styled.div`
  height: 100%;
  width: 100%;
  padding: 20px;
  overflow-y: auto;
`

export const MessageTextBox = styled.div`
  min-height: 300px;
  width: 100%;
  margin: 15px auto 10px auto;
  padding-top: 15px;
  border-top: 1px solid ${theme.greys.antdLight};
`

export const BoldLabel = styled.span`
  font-weight: 600;
`

export const CenteredText = styled.div`
  position: relative;
  top: 50%;
  transform: translateY(-50%);
  margin: auto;
  width: 100%;
  text-align: center;
`

export const AttachmentsBox = styled.div`
  border-top: 1px solid ${theme.greys.antdLight};
  padding-top: 8px;
`

export const AttachmentDetail = styled.div`
  width: 100%;
  margin-top: 8px;
  margin-bottom: 8px;
`
