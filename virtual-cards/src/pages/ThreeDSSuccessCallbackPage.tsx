import React from 'react'

export const ThreeDSSuccessCallbackPage: React.FC = () => {
  // Initialise event
  const event = new Event('3dsAuthenticationSuccess')

  // Dispatch
  console.log('dispatching event to document')
  window.parent.document.dispatchEvent(event)

  return <>3DS Authentication completed successfully</>
}
