import { SudoAdTrackerBlockerClient } from '@sudoplatform/sudo-ad-tracker-blocker'
import React, { useMemo, useState } from 'react'
import {
  Card,
  Form,
  Feedback,
  VSpace,
  Input,
  FormItem,
  Spinner,
} from '@sudoplatform/web-ui'
import { ErrorFeedback } from './ErrorFeedback'
import { useAsync } from 'react-use'

interface Props {
  atbClient: SudoAdTrackerBlockerClient
  lastClientChange: number
}

export const Filtering: React.FC<Props> = ({ atbClient, lastClientChange }) => {
  const [url, setUrl] = useState('https://example.com/!advert_')
  const [sourceUrl, setSourceUrl] = useState('https://anonyome.com')
  const status = useMemo(() => atbClient.status, [atbClient.status])

  /**
   * Async callback:
   * Checks a url with filter engine to determine if it is blocked based
   * on sourceUrl + the currently loaded rulesets and filtering exceptions.
   */
  const matchedResult = useAsync(async () => {
    try {
      return atbClient.checkUrl(url, sourceUrl)
    } catch (error) {
      console.error(error)
      throw error
    }
  }, [url, sourceUrl, lastClientChange, atbClient])

  return (
    <Card title="Check if URL is blocked">
      <VSpace>
        <Form>
          <FormItem label="URL to check">
            <Input
              value={url}
              onChange={(e) => setUrl(e.currentTarget.value)}
            />
          </FormItem>
          <FormItem label="Source URL">
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.currentTarget.value)}
            />
          </FormItem>
        </Form>

        {matchedResult.error ? (
          <ErrorFeedback
            error={matchedResult.error}
            message="An error occurred checking the URL."
          />
        ) : status === 'needs-update' || matchedResult.value === undefined ? (
          <Feedback type="info">
            <Spinner />
          </Feedback>
        ) : (
          url && (
            <Feedback>
              {matchedResult.value === 'allowed' ? '✅' : '❌'} Url is{' '}
              {matchedResult.value}.
            </Feedback>
          )
        )}
      </VSpace>
    </Card>
  )
}
