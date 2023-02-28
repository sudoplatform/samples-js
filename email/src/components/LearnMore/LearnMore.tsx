import React from 'react'

interface Props {
  nameText: string
  helpText: string
  helpUrl: string
}

export const LearnMore = ({
  nameText,
  helpText,
  helpUrl,
}: Props): React.ReactElement => {
  return (
    <>
      <p>
        {helpText}
        <br />
        To learn more about {nameText}, see{' '}
        <a href={helpUrl} target="_blank" rel="noreferrer">
          here
        </a>
        .
      </p>
    </>
  )
}
