import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { EmailManagementPage } from '@pages/Email/EmailManagementPage'
import { MailboxPage } from '@pages/Email/MailboxPage'
import { useEmailAddresses } from '@hooks/useEmailAddresses'
import { useEmailMasks } from '@hooks/useEmailMasks'
import { EmailContext, EmailMaskContext } from '@contexts/index'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { MaskPage } from '@pages/Email/MaskPage'

export const EmailContainer = (): React.ReactElement => {
  const {
    emailAddressesLoading,
    emailAddressesError,
    emailAddresses,
    listEmailAddressesHandler,
    activeEmailAddress,
    setActiveEmailAddress,
  } = useEmailAddresses()

  const {
    emailMasks,
    emailMasksLoading,
    emailMasksError,
    listEmailMasksHandler,
  } = useEmailMasks()

  return (
    <ErrorBoundary error={emailAddressesError}>
      <EmailContext.Provider
        value={{
          activeEmailAddress,
          setActiveEmailAddress,
          emailAddresses: emailAddresses ?? [],
          emailAddressesLoading,
          emailAddressesError,
          listEmailAddressesHandler,
        }}
      >
        <EmailMaskContext.Provider
          value={{
            emailMasks: emailMasks ?? [],
            emailMasksLoading,
            emailMasksError,
            listEmailMasksHandler,
          }}
        >
          <Routes>
            <Route path="manage" element={<EmailManagementPage />} />
            <Route path="mailbox" element={<MailboxPage />} />
            <Route path="masks" element={<MaskPage />} />
            <Route path="/" element={<Navigate to="mailbox" />} />
          </Routes>
        </EmailMaskContext.Provider>
      </EmailContext.Provider>
    </ErrorBoundary>
  )
}
