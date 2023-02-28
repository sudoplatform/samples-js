import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { EmailManagementPage } from '@pages/Email/EmailManagementPage'
import { MailboxPage } from '@pages/Email/MailboxPage'
import { useEmailAddresses } from '@hooks/useEmailAddresses'
import { EmailContext } from '@contexts'
import { ErrorBoundary } from '@components/ErrorBoundary'

export const EmailContainer = (): React.ReactElement => {
  const {
    emailAddressesLoading,
    emailAddressesError,
    emailAddresses,
    listEmailAddressesHandler,
    activeEmailAddress,
    setActiveEmailAddress,
  } = useEmailAddresses()

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
        <Routes>
          <Route path="manage" element={<EmailManagementPage />} />
          <Route path="mailbox" element={<MailboxPage />} />
          <Route path="/" element={<Navigate to="mailbox" />} />
        </Routes>
      </EmailContext.Provider>
    </ErrorBoundary>
  )
}
