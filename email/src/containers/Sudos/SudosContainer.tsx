import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { SudoManagementPage } from '@pages/Sudos/SudoManagementPage'

export const SudosContainer = (): React.ReactElement => {
  return (
    <Routes>
      <Route path="manage" element={<SudoManagementPage />} />
      <Route path="/" element={<Navigate to="manage" />} />
    </Routes>
  )
}
