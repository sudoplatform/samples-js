import React from 'react'

const ImageNames = [
  'email',
  'home',
  'img-email',
  'logo_dark',
  'logo_light',
  'sudos',
  'user',
] as const

export type ImageName = (typeof ImageNames)[number]

interface Props {
  name: ImageName
  className?: string
}

export const Image = ({ name, className }: Props): React.ReactElement => {
  return (
    <img
      className={className}
      srcSet={`${name}.png, ${name}@2x.png 2x, ${name}@3x.png 3x`}
      src="default.png"
      alt={`${name} icon`}
    />
  )
}
