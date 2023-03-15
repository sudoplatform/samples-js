import React from 'react'

export const OAuthSuccessCallbackPage: React.FC = () => {
  // Initialise event
  const event = new Event('OAuthSuccess')

  // Dispatch
  console.log('Dispatching OAuthSuccess event to document')
  window.parent.document.dispatchEvent(event)

  return <>OAuth completed successfully</>
}
