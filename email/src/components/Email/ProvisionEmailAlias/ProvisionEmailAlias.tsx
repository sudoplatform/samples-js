import React, { useEffect, useState, useContext } from 'react'
import { EmailAddressAvailability } from '@components/Email/EmailAddressAvailability'
import { EmailContext } from '@contexts/index'
import { Card } from '@components/Card'
import { Input, Form, FormItem, Select, Spinner } from '@sudoplatform/web-ui'
import { Switch, Flex } from 'antd'
import { Button } from '@components/Button'
import {
  useProvisionEmailAliasForm,
  useSupportedEmailAliasDomains,
} from './ProvisionEmailAlias.hooks'
import {
  StretchForm,
  SubmitButtonContainer,
} from './ProvisionEmailAlias.styled'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { useGetAliasConfiguration } from '@hooks/useGetAliasConfiguration'

interface ProvisionEmailAliasProps {
  showExternal: boolean
  onShowExternalChange: (value: boolean) => void
}

export const ProvisionEmailAlias = ({
  showExternal,
  onShowExternalChange,
}: ProvisionEmailAliasProps): React.ReactElement => {
  const {
    aliasesConfigurationDataLoading,
    aliasesConfigurationDataError,
    internalEmailAliasEnabled,
    externalEmailAliasEnabled,
    aliasesConfigurationDataHandler,
  } = useGetAliasConfiguration()

  const {
    supportedEmailAliasDomainsLoading,
    supportedEmailAliasDomainsError,
    supportedEmailAliasDomains,
  } = useSupportedEmailAliasDomains()

  const { emailAddresses, emailAddressesLoading, emailAddressesError } =
    useContext(EmailContext)

  const {
    form,
    formSubmitHandler,
    provisionEmailAliasLoading,
    provisionEmailAliasError,
  } = useProvisionEmailAliasForm()

  // Use the prop-driven external state
  const isExternal = showExternal

  // Store form values to display 'in-progress' email address text.
  const [aliasLocalPart, setAliasLocalPart] = useState<string>('')
  const [aliasDomain, setAliasDomain] = useState<string>('')
  const [availabilityResult, setAvailabilityResult] = useState<
    boolean | undefined
  >()
  const [selectedEmail, setSelectedEmail] = useState<string | undefined>()
  const [externalEmailAddress, setExternalEmailAddress] = useState<string>('')

  useEffect(() => {
    // Set the 'aliasDomain' input field with value of first aliasDomain in retrieved list.
    if (
      supportedEmailAliasDomains &&
      supportedEmailAliasDomains?.length !== 0
    ) {
      const aliasDomain = supportedEmailAliasDomains[0]
      form.setFieldValue('aliasDomain', aliasDomain)
      setAliasDomain(aliasDomain)
    }

    void aliasesConfigurationDataHandler()
  }, [
    supportedEmailAliasDomains,
    form,
    setAliasDomain,
    aliasesConfigurationDataHandler,
  ])

  const onSwitchChange = (checked: boolean): void => {
    onShowExternalChange(checked)
    // Reset shared state when toggling
    setAliasLocalPart('')
    setExternalEmailAddress('')
    setAvailabilityResult(undefined)
    setSelectedEmail(undefined)
    form.resetFields([
      'aliasLocalPart',
      'internalEmailAddress',
      'externalEmailAddress',
    ])
  }

  const onSubmit = async (): Promise<void> => {
    try {
      await formSubmitHandler()
      setAliasLocalPart('')
      setExternalEmailAddress('')
      setSelectedEmail(undefined)
      setAvailabilityResult(undefined)
    } catch {
      return
    }
  }

  // Determine if the form should be disabled (aliases not enabled)
  const isFormDisabled = internalEmailAliasEnabled === false

  return (
    <Card title="Create Email Alias">
      {aliasesConfigurationDataLoading ? (
        <div>
          <Spinner />
          Loading alias configuration...
        </div>
      ) : aliasesConfigurationDataError ? (
        <ErrorBoundary error={aliasesConfigurationDataError} />
      ) : (
        <ErrorBoundary
          error={
            supportedEmailAliasDomainsError ||
            provisionEmailAliasError ||
            emailAddressesError
          }
        >
          {isFormDisabled && (
            <div style={{ marginBottom: 20 }}>
              Email aliases are not enabled for the current configuration.
            </div>
          )}
          {externalEmailAliasEnabled && (
            <Flex justify="left" style={{ marginBottom: 20 }}>
              <Switch
                unCheckedChildren="Internal Email Alias"
                checkedChildren="External Email Alias"
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
                name="aliasLocalPart"
                label="Alias Local Part"
                rules={[
                  {
                    required: true,
                    message: 'Required',
                  },
                ]}
              >
                <Input
                  type="text"
                  value={aliasLocalPart}
                  disabled={isFormDisabled}
                  onChange={(e) => {
                    e.preventDefault()
                    setAliasLocalPart(e.target.value)
                  }}
                />
              </FormItem>
              <FormItem
                name="aliasDomain"
                label="Alias Domain"
                initialValue={'Getting alias domains...'}
                rules={[
                  {
                    required: true,
                    message: "'Alias Domain' required",
                  },
                ]}
              >
                <Input disabled={true} />
              </FormItem>
            </StretchForm>
            {aliasLocalPart.length !== 0 && aliasDomain.length !== 0 && (
              <EmailAddressAvailability
                localPart={aliasLocalPart}
                domain={aliasDomain}
                onAvailabilityRetrieved={setAvailabilityResult}
              />
            )}
            <SubmitButtonContainer>
              <Button
                className="provision-email-submit-button"
                type="submit"
                loading={provisionEmailAliasLoading}
                disabled={
                  isFormDisabled ||
                  (!isExternal && emailAddressesLoading) ||
                  (!isExternal && !emailAddresses?.length) ||
                  (isExternal && !externalEmailAddress.trim()) ||
                  !aliasLocalPart.trim() ||
                  supportedEmailAliasDomainsLoading ||
                  provisionEmailAliasLoading ||
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
