import styled from 'styled-components'
import { theme } from '../../../theme'
import { ContentRow } from '@components/Layout'
import { MailFilled } from '@ant-design/icons'

const folderContainerWidth = '200px'
const messageViewContainerWidth = '450px'

export const MailboxContainer = styled.div`
  height: 100%;
  width: 100%;
  min-width: 960px;
  position: relative;
  display: flex;
  flex-direction: row;

  // Emulate antd card styling
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.12);
  overflow: hidden;
`

export const ButtonsRow = styled(ContentRow)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

export const DropdownContainer = styled.div`
  display: flex;
  align-items: center;
  column-gap: 10px;
`

export const MailIcon = styled(MailFilled)`
  font-size: 18px;
  font-weight: 700;
  margin-top: 1px;
  color: ${theme.greys.fjord};
`

export const EmailFoldersContainer = styled.div`
  height: 100%;
  width: ${folderContainerWidth};
  border-right: 1px solid ${theme.greys.geyser};
`

export const EmailMessagesContainer = styled.div`
  position: relative;
  flex: 1;
  height: 100%;
`

export const EmailMessageViewContainer = styled.div`
  height: 100%;
  width: ${messageViewContainerWidth};
  border-left: 1px solid ${theme.greys.geyser};
`
