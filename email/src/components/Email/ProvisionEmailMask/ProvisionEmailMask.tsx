import React, { useEffect, useState, useContext } from 'react'
import { EmailAddressAvailability } from '@components/Email/EmailAddressAvailability'
import { EmailContext } from '@contexts/index'
import { Card } from '@components/Card'
import { Input, Form, FormItem, Select, Spinner } from '@sudoplatform/web-ui'
import { Switch, Flex } from 'antd'
import { Button } from '@components/Button'
import {
  useProvisionEmailMaskForm,
  useSupportedEmailMaskDomains,
} from './ProvisionEmailMask.hooks'
import { StretchForm, SubmitButtonContainer } from './ProvisionEmailMask.styled'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { useGetMaskConfiguration } from '@hooks/useGetMaskConfiguration'

interface ProvisionEmailMaskProps {
  showExternal: boolean
  onShowExternalChange: (value: boolean) => void
}

export const ProvisionEmailMask = ({
  showExternal,
  onShowExternalChange,
}: ProvisionEmailMaskProps): React.ReactElement => {
  const {
    masksConfigurationDataLoading,
    masksConfigurationDataError,
    internalEmailMaskEnabled,
    externalEmailMaskEnabled,
    masksConfigurationDataHandler,
  } = useGetMaskConfiguration()

  const {
    supportedEmailMaskDomainsLoading,
    supportedEmailMaskDomainsError,
    supportedEmailMaskDomains,
  } = useSupportedEmailMaskDomains()

  const { emailAddresses, emailAddressesLoading, emailAddressesError } =
    useContext(EmailContext)

  const {
    form,
    formSubmitHandler,
    provisionEmailMaskLoading,
    provisionEmailMaskError,
  } = useProvisionEmailMaskForm()

  // Use the prop-driven external state
  const isExternal = showExternal

  // Store form values to display 'in-progress' email address text.
  const [maskLocalPart, setMaskLocalPart] = useState<string>('')
  const [maskDomain, setMaskDomain] = useState<string>('')
  const [availabilityResult, setAvailabilityResult] = useState<
    boolean | undefined
  >()
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>()
  const [externalEmailAddress, setExternalEmailAddress] = useState<string>('')

  useEffect(() => {
    // Set the 'maskDomain' input field with value of first maskDomain in retrieved list.
    if (supportedEmailMaskDomains && supportedEmailMaskDomains?.length !== 0) {
      const maskDomain = supportedEmailMaskDomains[0]
      form.setFieldValue('maskDomain', maskDomain)
      setMaskDomain(maskDomain)
    }

    void masksConfigurationDataHandler()
  }, [
    supportedEmailMaskDomains,
    form,
    setMaskDomain,
    masksConfigurationDataHandler,
  ])

  const onSwitchChange = (checked: boolean): void => {
    onShowExternalChange(checked)
    // Reset shared state when toggling
    setMaskLocalPart('')
    setExternalEmailAddress('')
    setAvailabilityResult(undefined)
    setSelectedEmail(undefined)
    form.resetFields([
      'maskLocalPart',
      'internalEmailAddress',
      'externalEmailAddress',
    ])
  }

  const onSubmit = async (): Promise<void> => {
    try {
      await formSubmitHandler()
      setMaskLocalPart('')
      setExternalEmailAddress('')
      setSelectedEmail(undefined)
      setAvailabilityResult(undefined)
    } catch {
      return
    }
  }

  // Determine if the form should be disabled (masks not enabled)
  const isFormDisabled = internalEmailMaskEnabled === false

  return (
    <Card title="Create Email Mask">
      {masksConfigurationDataLoading ? (
        <div>
          <Spinner />
          Loading mask configuration...
        </div>
      ) : masksConfigurationDataError ? (
        <ErrorBoundary error={masksConfigurationDataError} />
      ) : (
        <ErrorBoundary
          error={
            supportedEmailMaskDomainsError ||
            provisionEmailMaskError ||
            emailAddressesError
          }
        >
          {isFormDisabled && (
            <div style={{ marginBottom: 20 }}>
              Email masks are not enabled for the current configuration.
            </div>
          )}
          {externalEmailMaskEnabled && (
            <Flex justify="left" style={{ marginBottom: 20 }}>
              <Switch
                unCheckedChildren="Internal Email Mask"
                checkedChildren="External Email Mask"
                checked={isExternal}
                onChange={onSwitchChange}
                disabled={isFormDisabled}
              />
            </Flex>
          )}
          <Form form={form} requiredMark={true}>
            <StretchForm>
              {!isExternal ? (
                <FormItem
                  name="internalEmailAddress"
                  label="Internal Email Address"
                >
                  {emailAddressesLoading ? (
                    <div>
                      <Spinner />
                      Loading...
                    </div>
                  ) : emailAddresses?.length ? (
                    <Select
                      placeholder="Please choose a Internal Email Address..."
                      value={selectedEmail}
                      onChange={(value) => setSelectedEmail(value as string)}
                      disabled={isFormDisabled}
                      options={emailAddresses.map((e) => ({
                        value: e.emailAddress,
                        label: e.emailAddress,
                      }))}
                    ></Select>
                  ) : (
                    <div>Must create email addresses</div>
                  )}
                </FormItem>
              ) : (
                <FormItem
                  name="externalEmailAddress"
                  label="External Email Address"
                  rules={[
                    {
                      required: true,
                      message: "'External Email Address' required",
                    },
                  ]}
                >
                  <Input
                    type="text"
                    placeholder="Enter an external email address..."
                    disabled={isFormDisabled}
                    onChange={(e) => {
                      setExternalEmailAddress(e.target.value)
                    }}
                  />
                </FormItem>
              )}
              <FormItem
                name="maskLocalPart"
                label="Mask Local Part"
                rules={[
                  {
                    required: true,
                    message: 'Required',
                  },
                ]}
              >
                <Input
                  type="text"
                  value={maskLocalPart}
                  disabled={isFormDisabled}
                  onChange={(e) => {
                    e.preventDefault()
                    setMaskLocalPart(e.target.value)
                  }}
                />
              </FormItem>
              <FormItem
                name="maskDomain"
                label="Mask Domain"
                initialValue={'Getting mask domains...'}
                rules={[
                  {
                    required: true,
                    message: "'Mask Domain' required",
                  },
                ]}
              >
                <Input disabled={true} />
              </FormItem>
            </StretchForm>
            {maskLocalPart.length !== 0 && maskDomain.length !== 0 && (
              <EmailAddressAvailability
                localPart={maskLocalPart}
                domain={maskDomain}
                onAvailabilityRetrieved={setAvailabilityResult}
              />
            )}
            <SubmitButtonContainer>
              <Button
                className="provision-email-submit-button"
                type="submit"
                loading={provisionEmailMaskLoading}
                disabled={
                  isFormDisabled ||
                  (!isExternal && emailAddressesLoading) ||
                  (!isExternal && !emailAddresses?.length) ||
                  (isExternal && !externalEmailAddress.trim()) ||
                  !maskLocalPart.trim() ||
                  supportedEmailMaskDomainsLoading ||
                  provisionEmailMaskLoading ||
                  !availabilityResult
                }
                onClick={onSubmit}
              >
                Submit
              </Button>
            </SubmitButtonContainer>
          </Form>
        </ErrorBoundary>
      )}
    </Card>
  )
}
