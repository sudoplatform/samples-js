import { BrandProvider, configToast } from '@sudoplatform/web-ui'
import * as React from 'react'
import { ErrorFeedback } from './components/ErrorFeedback'
import { ErrorBoundary } from 'react-error-boundary'
import { App } from './App'
import { createRoot } from 'react-dom/client'

localStorage.clear()
configToast({ maxCount: 1 })

const root = createRoot(document.getElementById('app') as HTMLElement)
root.render(
  <BrandProvider>
    <ErrorBoundary FallbackComponent={ErrorFeedback}>
      <App />
    </ErrorBoundary>
  </BrandProvider>,
)
