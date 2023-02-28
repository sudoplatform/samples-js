import React from 'react'
import { Card } from '@components/Card'
import { Input, Form, FormItem } from '@sudoplatform/web-ui'
import { Button } from '@components/Button'
import { StretchForm, SubmitButtonContainer } from './SudoCreate.styled'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { useCreateSudoForm } from './SudoCreate.hooks'

export const SudoCreate = (): React.ReactElement => {
  const { form, formSubmitHandler, createSudoLoading, createSudoError } =
    useCreateSudoForm()

  return (
    <Card title="Create Sudo">
      <ErrorBoundary error={createSudoError}>
        <Form form={form} requiredMark={true}>
          <StretchForm>
            <FormItem
              name="label"
              label="Label"
              rules={[
                {
                  required: true,
                  message: 'Label required',
                },
              ]}
            >
              <Input />
            </FormItem>
            <FormItem
              name="firstName"
              label="First Name"
              rules={[
                {
                  required: true,
                  message: 'First name required',
                },
              ]}
            >
              <Input />
            </FormItem>
            <FormItem
              name="lastName"
              label="Last Name"
              rules={[
                {
                  required: true,
                  message: 'Last name required',
                },
              ]}
            >
              <Input />
            </FormItem>
          </StretchForm>
          <SubmitButtonContainer>
            <Button
              class-name="create-sudo"
              type="submit"
              loading={createSudoLoading}
              disabled={createSudoLoading}
              onClick={formSubmitHandler}
            >
              Submit
            </Button>
          </SubmitButtonContainer>
        </Form>
      </ErrorBoundary>
    </Card>
  )
}
