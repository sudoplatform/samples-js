import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { EmailManagementPage } from '@pages/Email/EmailManagementPage'
import { MailboxPage } from '@pages/Email/MailboxPage'
import { useEmailAddresses } from '@hooks/useEmailAddresses'
import { useEmailAliases } from '@hooks/useEmailAliases'
import { EmailContext, EmailAliasContext } from '@contexts/index'
import { ErrorBoundary } from '@components/ErrorBoundary'
import { AliasPage } from '@pages/Email/AliasPage'

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
    emailAliases,
    emailAliasesLoading,
    emailAliasesError,
    listEmailAliasesHandler,
  } = useEmailAliases()

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
        <EmailAliasContext.Provider
          value={{
            emailAliases: emailAliases ?? [],
            emailAliasesLoading,
            emailAliasesError,
            listEmailAliasesHandler,
          }}
        >
          <Routes>
            <Route path="manage" element={<EmailManagementPage />} />
            <Route path="mailbox" element={<MailboxPage />} />
            <Route path="aliases" element={<AliasPage />} />
            <Route path="/" element={<Navigate to="mailbox" />} />
          </Routes>
        </EmailAliasContext.Provider>
      </EmailContext.Provider>
    </ErrorBoundary>
  )
}
