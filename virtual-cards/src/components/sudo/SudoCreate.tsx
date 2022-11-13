import { Sudo } from '@sudoplatform/sudo-profiles'
import {
  Button,
  Form,
  FormItem,
  HSpace,
  Input,
  useForm,
  VSpace,
} from '@sudoplatform/web-ui'
import { message } from 'antd'
import React, { useContext } from 'react'
import { useAsyncFn } from 'react-use'
import { AppContext } from '../../containers/AppContext'
import { ErrorFeedback } from '../ErrorFeedback'

interface Props {
  onSudoCreated?: (sudo: Sudo) => void
}

interface SudoCreateInputs {
  firstName: string
  lastName: string
  label: string
}

export const SudoCreate: React.FC<Props> = (props) => {
  const { profilesClient } = useContext(AppContext)
  const [form] = useForm<SudoCreateInputs>()

  const [submitCreateSudoResult, submitCreateSudo] = useAsyncFn(
    async (input: SudoCreateInputs) => {
      const sudo = new Sudo()
      sudo.firstName = input.firstName
      sudo.lastName = input.lastName
      sudo.label = input.label
      try {
        const created = await profilesClient.createSudo(sudo)
        void message.success('Successfully created sudo')
        props.onSudoCreated?.(created)
      } catch (err) {
        void message.error('Failed to create sudo')
        throw err
      }
    },
  )

  return (
    <VSpace>
      <Form requiredMark={true} onFinish={submitCreateSudo} form={form}>
        {' '}
        <HSpace stretch="all">
          <FormItem name="label" label="Label">
            <Input />
          </FormItem>
          <FormItem name="firstName" label="First Name">
            <Input />
          </FormItem>
          <FormItem name="lastName" label="Last Name">
            <Input />
          </FormItem>
        </HSpace>
        <FormItem label={<>&nbsp;</>}>
          <Button
            class-name="create-sudo"
            kind="primary"
            type="submit"
            loading={submitCreateSudoResult.loading}
          >
            Submit
          </Button>
          {submitCreateSudoResult.error && (
            <ErrorFeedback
              message="An error occurred creating the sudo."
              error={submitCreateSudoResult.error}
            />
          )}
        </FormItem>
      </Form>
    </VSpace>
  )
}
