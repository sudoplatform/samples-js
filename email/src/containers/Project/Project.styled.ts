import styled from 'styled-components'
import { Layout } from 'antd'
import { SudoPlatformLogo } from '@components/SudoPlatformLogo'

const { Sider, Header } = Layout

export const PageContainer = styled(Layout)`
  height: 100%;
  width: 100%;
`

export const LayoutContainer = styled(Layout)``

export const SidebarContainer = styled(Sider)``

export const HeaderContainer = styled(Header)`
  padding: 0;
`

export const ContentContainer = styled.div`
  flex: 1;
  flex-direction: column;
  display: flex;
`

export const CenteredContentContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  padding: 20px 20px 60px;
`

export const StyledSudoPlatformLogo = styled(SudoPlatformLogo)`
  padding: 18px 0 12px;
`

export const StyledTitle = styled.span`
  display: inline;
`
