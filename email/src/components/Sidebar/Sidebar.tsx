import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Image, ImageName } from '@components/Image'
import { StyledMenu } from './Sidebar.styled'

interface MenuItemParent {
  label: string
  icon: ImageName
  path: string
  children?: Omit<MenuItemParent, 'icon' | 'children'>[]
}

interface Props {
  urlPath: string
  menuItems: MenuItemParent[]
}

export const Sidebar = ({ urlPath, menuItems }: Props): React.ReactElement => {
  const rootUrlPath = useMemo(
    () => urlPath.replace(/(?<=.)\/.*/, ''),
    [urlPath],
  )
  const [openKeys, setOpenKeys] = useState([rootUrlPath])

  useEffect(() => {
    setOpenKeys([rootUrlPath])
  }, [rootUrlPath])

  const items = useMemo(() => {
    return menuItems.map(({ label, icon, children, path: rootPath }) => ({
      key: rootPath,
      label,
      icon: <Image name={icon} />,
      children: children?.map(({ label, path: childPath }) => {
        const path = rootPath + childPath
        return {
          key: path,
          label: <Link to={path}>{label}</Link>,
        }
      }),
    }))
  }, [menuItems])

  return (
    <StyledMenu
      selectedKeys={[urlPath]}
      openKeys={openKeys}
      onOpenChange={setOpenKeys}
      mode="inline"
      items={items}
    />
  )
}
