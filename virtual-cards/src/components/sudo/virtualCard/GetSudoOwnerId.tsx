import { Owner } from '@sudoplatform/sudo-common'

export const getSudoOwnerId = (owners: Owner[]): string => {
  const sudoOwners = owners.filter(
    (o) => o.issuer === 'sudoplatform.sudoservice',
  )
  if (!sudoOwners.length) {
    return ''
  } else if (sudoOwners.length > 1) {
    return ''
  }
  return sudoOwners[0].id
}
