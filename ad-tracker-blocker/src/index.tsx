import * as React from 'react'
import { render } from 'react-dom'
import 'regenerator-runtime/runtime'
import { ErrorBoundary } from 'react-error-boundary'

import { App } from './App'
import { ErrorFeedback } from './components/ErrorFeedback'
import { BrandProvider, configToast } from '@sudoplatform/web-ui'

localStorage.clear()

configToast({ maxCount: 1 })

render(
  <BrandProvider>
    <ErrorBoundary FallbackComponent={ErrorFeedback}>
      <App />
    </ErrorBoundary>
  </BrandProvider>,
  document.getElementById('app'),
)
