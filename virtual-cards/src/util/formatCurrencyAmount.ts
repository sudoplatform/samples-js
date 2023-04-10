import { CurrencyAmount } from '@sudoplatform/sudo-virtual-cards'

export function formatCurrencyAmount(value: CurrencyAmount): string {
  const amount = value.amount / 100
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: value.currency,
  })
}
