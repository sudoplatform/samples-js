import { useState } from 'react'
import { BoundaryErrorObject } from './ErrorBoundary'

/**
 * This hook is to allow a component to set/clear errors, which sets the
 * internal error object container.
 *
 * It's intended that `errorObject` is passed from the component consuming
 * this hook into <ErrorBoundary>, which will assess the values of the error
 * object to conditionally render an error.
 */
export const useErrorBoundary = () => {
  // Error container object to be given to <ErrorBoundary> component.
  const [errorObject, setErrorObject] = useState<
    BoundaryErrorObject | undefined
  >()

  const setter = (error: Error, message: string, fatal?: boolean) => {
    setErrorObject({
      error,
      message,
      fatal,
    })
  }

  return {
    error: errorObject,
    setError: setter,
    clearError: () => setErrorObject(undefined),
  }
}
