import { reportIfNotAuthorized } from '@services/sessionExpiry'

/**
 * The message to show for an error thrown by one of the SDKs. It also reports an error that means the
 * session has expired.
 */
export const describeError = (error: unknown): string => {
  reportIfNotAuthorized(error)
  if (error instanceof Error) {
    return error.message ? `${error.name}: ${error.message}` : error.name
  }
  return String(error)
}

export const formatDateTime = (date: Date | undefined): string =>
  date ? date.toLocaleString() : 'Not available'

export const toBase64 = (data: ArrayBuffer | Uint8Array): string => {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
}

export const fromBase64 = (text: string): Uint8Array => {
  const binary = atob(text)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/** Offers `data` to the user as a file download. */
export const downloadFile = (
  fileName: string,
  data: BlobPart,
  type = 'application/octet-stream',
): void => {
  const url = URL.createObjectURL(new Blob([data], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
