import React, { useCallback, useContext, useEffect, useState } from 'react'
import { IdentityDataProcessingConsentContent } from '@sudoplatform/sudo-secure-id-verification'
import { Button, Input, VSpace } from '@sudoplatform/web-ui'
import { message, Collapse } from 'antd'
import { Input as AntdInput } from 'antd'
import { AppContext } from '../containers/AppContext'

/**
 * Component for handling identity verification consent functionality
 */
export const IdentityVerificationConsent: React.FC = () => {
  const { identityVerificationClient } = useContext(AppContext)
  const [consentRequired, setConsentRequired] = useState<boolean | null>(null)
  const [preferredLanguage, setPreferredLanguage] = useState('en-US')
  const [preferredContentType, setPreferredContentType] = useState('text/plain')
  const [consentContent, setConsentContent] =
    useState<IdentityDataProcessingConsentContent | null>(null)
  const [isFetchingConsentContent, setIsFetchingConsentContent] =
    useState(false)
  const [isProvidingConsent, setIsProvidingConsent] = useState(false)
  const [isCheckingConsentStatus, setIsCheckingConsentStatus] = useState(true)
  const [consentStatus, setConsentStatus] = useState<boolean>(false)
  const [isWithdrawingConsent, setIsWithdrawingConsent] = useState(false)

  const fetchConsentStatus = useCallback(async () => {
    try {
      const status =
        await identityVerificationClient.getIdentityDataProcessingConsentStatus()
      setConsentStatus(status?.consented ?? false)
    } catch (e) {
      setConsentStatus(false)
    } finally {
      setIsCheckingConsentStatus(false)
    }
  }, [identityVerificationClient])

  useEffect(() => {
    // Fetch consent requirement
    const fetchConsentRequired = async () => {
      try {
        const required =
          await identityVerificationClient.isConsentRequiredForVerification()
        setConsentRequired(required)
      } catch (e) {
        setConsentRequired(false)
      }
    }
    void fetchConsentRequired()

    // Fetch consent status
    void fetchConsentStatus()
  }, [fetchConsentStatus, identityVerificationClient])

  const handleFetchConsentContent = async () => {
    setIsFetchingConsentContent(true)
    setConsentContent(null)
    try {
      const content =
        await identityVerificationClient.getIdentityDataProcessingConsentContent(
          {
            preferredLanguage,
            preferredContentType,
          },
        )
      setConsentContent(content ?? null)
    } catch (e) {
      setConsentContent({
        content: 'Failed to fetch consent content.',
        language: preferredLanguage,
        contentType: preferredContentType,
      })
    } finally {
      setIsFetchingConsentContent(false)
    }
  }

  const handleProvideConsent = async () => {
    if (!consentContent) {
      return
    }
    setIsProvidingConsent(true)
    try {
      await identityVerificationClient.provideIdentityDataProcessingConsent({
        content: consentContent.content,
        contentType: consentContent.contentType,
        language: consentContent.language,
      })
      void message.success('Consent provided successfully.')
      await fetchConsentStatus()
    } catch (e) {
      void message.error('Failed to provide consent.')
    } finally {
      setIsProvidingConsent(false)
    }
  }

  const handleWithdrawConsent = async () => {
    setIsWithdrawingConsent(true)
    try {
      await identityVerificationClient.withdrawIdentityDataProcessingConsent()
      void message.success('Consent withdrawn successfully.')
      await fetchConsentStatus()
    } catch (e) {
      void message.error('Failed to withdraw consent.')
    } finally {
      setIsWithdrawingConsent(false)
    }
  }

  return (
    <VSpace>
      <Collapse
        defaultActiveKey={consentRequired === true ? ['1'] : undefined}
        items={[
          {
            key: '1',
            label: 'Consent for Identity Data Processing',
            children: (
              <div>
                <p>
                  To perform identity verification, we may need your consent to
                  use personal data. This is required in some environments to
                  comply with privacy regulations.
                </p>
                <p>
                  Consent Required Status:{' '}
                  <b>
                    {consentRequired === null
                      ? 'Checking...'
                      : consentRequired
                        ? 'Consent Required'
                        : 'Consent Not Required'}
                  </b>{' '}
                  in this environment
                </p>
                <div
                  style={{
                    marginBottom: 8,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {isCheckingConsentStatus ? (
                    <span>Checking consent status...</span>
                  ) : consentStatus ? (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <span
                        style={{
                          border: '2px solid #52c41a',
                          color: '#52c41a',
                          borderRadius: 4,
                          padding: '2px 8px',
                        }}
                      >
                        Consented
                      </span>
                      <Button
                        kind="primary"
                        onClick={handleWithdrawConsent}
                        loading={isWithdrawingConsent}
                        disabled={isWithdrawingConsent}
                      >
                        Withdraw consent
                      </Button>
                    </div>
                  ) : (
                    <span
                      style={{
                        border: '2px solid #ff4d4f',
                        color: '#ff4d4f',
                        borderRadius: 4,
                        padding: '2px 8px',
                      }}
                    >
                      Not Consented
                    </span>
                  )}
                </div>
                <div style={{ marginTop: 16 }}>
                  <label style={{ display: 'block', marginBottom: 8 }}>
                    Preferred Language:
                    <Input
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      style={{ width: 200, marginLeft: 8 }}
                      placeholder="e.g. en-US"
                    />
                  </label>
                  <label style={{ display: 'block', marginBottom: 8 }}>
                    Preferred ContentType:
                    <Input
                      value={preferredContentType}
                      onChange={(e) => setPreferredContentType(e.target.value)}
                      style={{ width: 200, marginLeft: 8 }}
                      placeholder="e.g. text/plain"
                    />
                  </label>
                  <Button
                    kind="primary"
                    onClick={handleFetchConsentContent}
                    disabled={
                      !preferredLanguage ||
                      !preferredContentType ||
                      isFetchingConsentContent
                    }
                    loading={isFetchingConsentContent}
                  >
                    Get Consent Content
                  </Button>
                  {consentContent?.content && (
                    <div style={{ marginTop: 16 }}>
                      <strong>
                        Consent Content
                        {consentContent.language && consentContent.contentType
                          ? ` (${consentContent.language}, ${consentContent.contentType})`
                          : ''}
                        :
                      </strong>
                      <AntdInput.TextArea
                        value={consentContent.content}
                        readOnly
                        autoSize={{ minRows: 3 }}
                        style={{ width: '100%' }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Button
                          kind="primary"
                          onClick={handleProvideConsent}
                          loading={isProvidingConsent}
                          disabled={isProvidingConsent || !consentContent}
                        >
                          I Consent
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </VSpace>
  )
}
