import React from 'react'
import { EncryptedIndicatorContainer } from './EncryptedIndicator.styled'
import { Tag } from 'antd'
import { useEncryptionStatus } from '@hooks/useEncryptionStatus'

interface Props {
  emailAddresses: string[]
}

/**
 * Component that conditionally renders a label to indiciate if end-to-end encryption is
 * available.
 *
 * Visibility is determined by the encryption status of the email addresses contained in
 * the `emailAddresses` prop.
 *
 * Either:
 *  - all email addresses are encrypted             -> component is visible
 *  - some/all email addresses are NOT encrypted    -> component is not visible
 */
export const EncryptedIndicator = ({
  emailAddresses,
}: Props): React.ReactElement => {
  const { encrypted } = useEncryptionStatus(emailAddresses)

  return (
    <>
      {encrypted && (
        <EncryptedIndicatorContainer>
          <Tag color="blue" style={{ margin: 0 }}>
            🔒 End-to-end encrypted
          </Tag>
        </EncryptedIndicatorContainer>
      )}
    </>
  )
}
