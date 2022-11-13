import React from 'react'

interface Props {
  nameText: string
  helpText: string
  helpUrl: string
}

export const LearnMore: React.FC<Props> = ({
  nameText,
  helpText,
  helpUrl,
}: Props) => {
  return (
    <>
      <p>{helpText}</p>
      <p>
        To learn more about {nameText}, see{' '}
        <a href={helpUrl} target="_blank" rel="noreferrer">
          here
        </a>
        .
      </p>
    </>
  )
}
