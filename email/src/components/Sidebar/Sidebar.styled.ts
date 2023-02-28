import styled from 'styled-components'
import { Menu } from 'antd'
import { theme } from '../../theme'
import color from 'color'

const activeMenuBackgroundColor = color(theme.greys.midnight)
  .mix(color(theme.colors.sudoBlue), 0.3)
  .hex()

export const StyledMenu = styled(Menu)`
  background-color: ${theme.greys.midnight};

  // Text color for all child text elements
  & * {
    color: white !important;
  }

  &.ant-menu {
    border-right: none;

    // Sizing for menu item containers
    .ant-menu-item,
    .ant-menu-submenu,
    .ant-menu-submenu-title {
      margin-top: 0;
      margin-bottom: 0;
      width: 100%;
      padding-top: 0;
      padding-bottom: 0;
    }

    .ant-menu-submenu {
      .ant-menu-item {
        background-color: ${theme.greys.midnight};
      }

      .ant-menu-submenu-title {
        height: 56px;
      }

      // Remove antd flash effect from theme
      .ant-menu-submenu-title:active {
        background-color: ${activeMenuBackgroundColor};
      }

      .ant-menu-item {
        height: 50px;
      }
    }

    // Menu item <a> links
    a {
      display: block;
      margin-top: 8px;
      margin-bottom: 8px;
      line-height: 40px;
      color: white;
      text-decoration: none;
      cursor: pointer;
    }

    // Menu item hover state
    .ant-menu-submenu-active,
    .ant-menu-submenu-selected,
    .ant-menu-item-active {
      background-color: ${activeMenuBackgroundColor};
    }

    // Styling when a menu item is written without
    // an '<a>' link wrapper and 'icon' property is
    // specified.
    .ant-menu-submenu-title {
      .ant-menu-title-content {
        margin: 0;
      }

      .ant-menu-item-icon {
        margin-top: 1px;
        margin-right: 12px;
      }
    }

    // Menu item selected state
    .ant-menu-item-selected {
      background-color: ${activeMenuBackgroundColor} !important;

      &:after {
        border-right: 4px solid ${theme.colors.sudoBlue};
      }
    }
  }
`
