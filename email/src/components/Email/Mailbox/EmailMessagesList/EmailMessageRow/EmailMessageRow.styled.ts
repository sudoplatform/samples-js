import styled, { css } from 'styled-components'
import { MailTwoTone } from '@ant-design/icons'
import { ActionLink, DangerLink } from '@components/Table'
import { theme } from '../../../../../theme'

export const StyledRow = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-right: 5px;
  margin: 0;

  &:hover .hover-button {
    margin-left: 5px;
    visibility: visible;
  }

  // Show inner border decoration if row is 'selected'.
  ${({ selected }) =>
    selected &&
    css`
      padding-right: 10px;

      &:after {
        position: absolute;
        content: '';
        top: 0px;
        right: 0px;
        bottom: 0px;
        left: calc(100% - 10px);
        background: ${theme.colors.ocean};
      }
    `}
`

export const MailIcon = styled(MailTwoTone)`
  font-size: 130%;
  top: 2px;
  margin-right: 8px;
`

export const ContentColumn = styled.div`
  padding-left: 25px;
  min-width: 0;
  span {
    font-weight: 600;
  }
`

export const DateColumn = styled.div`
  margin-left: auto;
  padding-left: 15px;
  text-align: right;
  color: #aaaaaa;
  min-width: 80px;
`

export const StyledActionLink = styled(ActionLink)`
  visibility: hidden;
`

export const StyledDangerLink = styled(DangerLink)`
  visibility: hidden;
`

export const SubjectText = styled.div<{ seen?: boolean }>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ seen }) =>
    !seen &&
    css`
      color: ${theme.colors.ocean};
      font-weight: 500;
    `}
`
