import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { KeyBackupPage } from '@pages/Account/KeyBackupPage'
import { UserDetailsPage } from '@pages/Account/UserDetailsPage'

export const AccountContainer = (): React.ReactElement => {
  return (
    <Routes>
      <Route path="keys" element={<KeyBackupPage />} />
      <Route path="user" element={<UserDetailsPage />} />
      <Route path="/" element={<Navigate to="user" />} />
    </Routes>
  )
}
