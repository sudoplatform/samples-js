import React, { useEffect, useState } from 'react'
import { EmailAddressAvailability } from '@components/Email/EmailAddressAvailability'
import { Card } from '@components/Card'
import { Input, Form, FormItem } from '@sudoplatform/web-ui'
import { Button } from '@components/Button'
import {
  StretchForm,
  SubmitButtonContainer,
} from './ProvisionEmailAddress.styled'
import {
  useProvisionEmailAddressForm,
  useSupportedEmailDomains,
} from './ProvisionEmailAddress.hooks'
import { ErrorBoundary } from '@components/ErrorBoundary'

export const ProvisionEmailAddress = (): React.ReactElement => {
  const {
    supportedEmailDomainsLoading,
    supportedEmailDomainsError,
    supportedEmailDomains,
  } = useSupportedEmailDomains()

  // Store form values to display 'in-progress' email address text.
  const [localPart, setLocalPart] = useState<string>('')
  const [domain, setDomain] = useState<string>('')
  const [availabilityResult, setAvailabilityResult] = useState<
    boolean | undefined
  >()

  const {
    form,
    formSubmitHandler,
    provisionEmailLoading,
    provisionEmailError,
  } = useProvisionEmailAddressForm()

  useEffect(() => {
    // Set the 'domain' input field with value of first domain in retrieved list.
    // (In the case of this sample app, there should only be 1 domain)
    if (supportedEmailDomains && supportedEmailDomains?.length !== 0) {
      const domain = supportedEmailDomains[0]
      form.setFieldValue('domain', domain)
      setDomain(domain)
    }
  }, [supportedEmailDomains, form, setDomain])

  const onSubmit = async (): Promise<void> => {
    try {
      await formSubmitHandler()
      setLocalPart('')
    } catch {
      return
    }
  }

  return (
    <Card title="Provision Email Address">
      <ErrorBoundary error={supportedEmailDomainsError || provisionEmailError}>
        <Form form={form} requiredMark={true}>
          <StretchForm>
            <FormItem
              name="localPart"
              label="Local Part"
              rules={[
                {
                  required: true,
                  message: 'Required',
                },
              ]}
            >
              <Input
                type="text"
                value={localPart}
                onChange={(e) => {
                  e.preventDefault()
                  setLocalPart(e.target.value)
                }}
              />
            </FormItem>
            <FormItem
              name="domain"
              label="Domain"
              initialValue={'Getting domains...'}
              rules={[
                {
                  required: true,
                  message: "'Domain' required",
                },
              ]}
            >
              <Input disabled={true} />
            </FormItem>
            <FormItem name="alias" label="Alias" required={false}>
              <Input type="text" />
            </FormItem>
          </StretchForm>
          {localPart.length !== 0 && domain.length !== 0 && (
            <EmailAddressAvailability
              localPart={localPart}
              domain={domain}
              onAvailabilityRetrieved={setAvailabilityResult}
            />
          )}
          <SubmitButtonContainer>
            <Button
              className="provision-email-submit-button"
              type="submit"
              loading={provisionEmailLoading}
              disabled={
                supportedEmailDomainsLoading ||
                provisionEmailLoading ||
                !availabilityResult
              }
              onClick={onSubmit}
            >
              Submit
            </Button>
          </SubmitButtonContainer>
        </Form>
      </ErrorBoundary>
    </Card>
  )
}
