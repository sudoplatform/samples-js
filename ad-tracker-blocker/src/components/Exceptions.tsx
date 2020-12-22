import { AdTrackerBlockerClient } from '@sudoplatform/sudo-ad-tracker-blocker'
import React from 'react'
import { useAsync, useAsyncFn } from 'react-use'

import {
  Card,
  Form,
  Button,
  VSpace,
  HSpace,
  Input,
  FormItem,
  Select,
  Option,
  useForm,
} from '@sudoplatform/web-ui'
import { FilterException } from '@sudoplatform/sudo-ad-tracker-blocker/lib/filter-exceptions'
import { ErrorFeedback } from './ErrorFeedback'

interface Props {
  atbClient: AdTrackerBlockerClient
  lastChange: number
  onChange?: () => void
}

export const Exceptions: React.FC<Props> = (props) => {
  const [form] = useForm()

  /**
   * Async effect: Loads a filtering exceptions from client.
   */
  const exceptions = useAsync(async () => {
    return props.atbClient.getExceptions()
  }, [props.lastChange])

  /**
   * Async callback: Adds a filtering exception to client.
   */
  const [addExceptionResult, addException] = useAsyncFn(
    async (exception: FilterException) => {
      await props.atbClient.addExceptions([exception])
      props.onChange?.()
      form.resetFields()
    },
  )

  /**
   * Async callback: Removes a filtering exception from client.
   */
  const [removeExceptionResult, removeException] = useAsyncFn(
    async (exception: FilterException) => {
      await props.atbClient.removeExceptions([exception])
      props.onChange?.()
      form.resetFields()
    },
  )

  return (
    <Card title="Exceptions">
      <VSpace spacing="large">
        <Form
          requiredMark={false}
          initialValues={{ source: '', type: 'host' }}
          onFinish={addException}
          form={form}
        >
          <VSpace spacing="medium">
            <HSpace stretch="first" verticalAlign="top">
              <FormItem name="type" label="Type">
                <Select>
                  <Option value="host">Host</Option>
                  <Option value="page">Page</Option>
                </Select>
              </FormItem>
              <FormItem
                name="source"
                label="Exception"
                rules={[{ required: true }]}
              >
                <Input />
              </FormItem>
              <FormItem name="submit" label={<>&nbsp;</>}>
                <Button
                  kind="primary"
                  type="submit"
                  loading={addExceptionResult.loading}
                >
                  Add
                </Button>
              </FormItem>
            </HSpace>
            {addExceptionResult.error && (
              <ErrorFeedback
                message="An error occurred adding the exception."
                error={addExceptionResult.error}
              />
            )}
          </VSpace>
        </Form>

        <VSpace spacing="medium">
          {exceptions.error ? (
            <ErrorFeedback
              message="An error occurred loading the exceptions."
              error={exceptions.error}
            />
          ) : exceptions.value !== undefined ? (
            exceptions.value.length > 0 ? (
              exceptions.value.map((exception, i) => (
                <HSpace key={i} stretch="first" verticalAlign="center">
                  <span>{exception.source}</span>
                  <Button danger onClick={() => removeException(exception)}>
                    Remove
                  </Button>
                </HSpace>
              ))
            ) : (
              <p>No Exceptions</p>
            )
          ) : null}

          {removeExceptionResult.error && (
            <ErrorFeedback
              message="An error occurred removing the exception."
              error={removeExceptionResult.error}
            />
          )}
        </VSpace>
      </VSpace>
    </Card>
  )
}
