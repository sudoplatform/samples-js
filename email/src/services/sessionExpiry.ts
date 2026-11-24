import { NotAuthorizedError, NotSignedInError } from '@sudoplatform/sudo-common'

/**
 * Lets the signed in pages report that the service rejected the user's tokens, so the app can try to refresh
 * them once and otherwise send the user back to sign in.
 */
const NOT_AUTHORIZED_EVENT = 'email-example:not-authorized'

const isNotAuthorized = (error: unknown): boolean =>
  error instanceof NotAuthorizedError ||
  error instanceof NotSignedInError ||
  (error instanceof Error &&
    (error.name === 'NotAuthorizedError' || error.name === 'NotSignedInError'))

/** Reports `error` if it means the user's session is no longer valid. */
export const reportIfNotAuthorized = (error: unknown): void => {
  if (isNotAuthorized(error)) {
    window.dispatchEvent(new Event(NOT_AUTHORIZED_EVENT))
  }
}

/** Calls `listener` whenever a page reports a rejected session. Returns a function that stops listening. */
export const onNotAuthorized = (listener: () => void): (() => void) => {
  window.addEventListener(NOT_AUTHORIZED_EVENT, listener)
  return () => window.removeEventListener(NOT_AUTHORIZED_EVENT, listener)
}
