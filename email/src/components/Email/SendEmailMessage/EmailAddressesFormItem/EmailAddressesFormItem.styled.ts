import styled from 'styled-components'
import { Tag as _Tag } from 'antd'
import { CloseSquareFilled } from '@ant-design/icons'

export const TagsContainer = styled.div`
  margin: -10px 0 10px 0;
`

export const Tag = styled(_Tag)`
  margin-bottom: 7px;
`

export const ClearIcon = styled(CloseSquareFilled)`
  position: relative;
  margin-left: 5px;

  // Pseudo element to expand clickable size of icon
  &:after {
    position: absolute;
    content: '';
    top: -4px;
    right: -7px;
    bottom: -4px;
    left: -5px;
  }
`
