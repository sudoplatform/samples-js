import { useCallback, useContext, useEffect, useState } from 'react'
import { EmailMessage } from '@sudoplatform/sudo-email'
import { EmailContext, ProjectContext } from '@contexts'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { parseMessage } from '@util/MessageParser'

interface MessageBodyResult {
  html?: string
  text?: string
}

/**
 * Hook to retrieve and decode the RFC822 data of an email
 * message and return the message body text as a string.
 *
 * Implements Sudo Email SDK method `getEmailMessageRfc822Data`.
 */
export const useEmailMessageBody = (emailMessage: EmailMessage) => {
  const { sudoEmailClient } = useContext(ProjectContext)
  const { activeEmailAddress } = useContext(EmailContext)
  const [result, setResult] = useState<MessageBodyResult>()
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useErrorBoundary()

  /**
   * Handler function to retrieve the message body of a given email message.
   */
  const getEmailMessageBody = useCallback(
    async (emailMessage: EmailMessage) => {
      if (!activeEmailAddress) {
        return
      }

      clearError()
      setLoading(true)

      try {
        // Retrieve encoded message data with IDs of the current email address and message.
        const result = await sudoEmailClient.getEmailMessageRfc822Data({
          id: emailMessage.id,
          emailAddressId: activeEmailAddress.id,
        })

        if (result) {
          // Convert returned RFC822 message buffer into readable string.
          const decodedText = new TextDecoder().decode(result?.rfc822Data)
          const parsedMessage = await parseMessage(decodedText)

          setResult({
            html: parsedMessage.html,
            text: parsedMessage.text,
          })
        } else {
          throw new Error(
            'Missing result from `getEmailMessageRfc822Data` invocation',
          )
        }
      } catch (error) {
        setError(error as Error, 'Failed to retrieve email message data')
      } finally {
        setLoading(false)
      }
    },
    [clearError, setError, sudoEmailClient, activeEmailAddress],
  )

  // Get message body data on initial render.
  useEffect(() => {
    void getEmailMessageBody(emailMessage)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    emailMessageBodyLoading: loading,
    emailMessageBodyError: error,
    emailMessageBody: result,
  }
}
