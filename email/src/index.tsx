import { BrandProvider, configToast } from '@sudoplatform/web-ui'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorFeedback } from '@components/ErrorFeedback'
import { ErrorBoundary } from 'react-error-boundary'
import { App } from './containers/App/App'

localStorage.clear()
configToast({ maxCount: 1 })

const root = createRoot(document.getElementById('app') as HTMLElement).render(
  <BrandProvider>
    <ErrorBoundary FallbackComponent={ErrorFeedback}>
      <App />
    </ErrorBoundary>
  </BrandProvider>,
)
