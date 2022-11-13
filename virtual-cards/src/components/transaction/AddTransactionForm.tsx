import { ListOperationResultStatus } from '@sudoplatform/sudo-common'
import React, { useContext } from 'react'
import { useAsync } from 'react-use'
import { AppContext } from '../../containers/AppContext'
import { ErrorFeedback } from '../ErrorFeedback'

interface Props {
  onTransactionAdded: () => void
}

// TODO: Remove once transactions can be simulated from console
export const AddTransactionForm: React.FC<Props> = (props) => {
  const { virtualCardsSimulatorClient, virtualCardsClient } =
    useContext(AppContext)

  const transactionResult = useAsync(async () => {
    const cards = await virtualCardsClient.listVirtualCards()
    if (cards.status === ListOperationResultStatus.Failure) {
      throw new Error('Failed to list cards')
    }
    if (!cards.items.length) {
      throw new Error('No Card available to perform transaction')
    }
    const card = cards.items[0]
    const merchants = await virtualCardsSimulatorClient.listSimulatorMerchants()
    if (!merchants.length) {
      throw new Error('Failed to get list of merchants')
    }
    const merchant = merchants[0]
    const simulatorResult =
      await virtualCardsSimulatorClient.simulateAuthorization({
        pan: card.pan,
        amount: 50,
        merchantId: merchant.id,
        expiry: card.expiry,
        billingAddress: card.billingAddress,
        csc: card.csc,
      })
    console.log({ simulatorResult })
    props.onTransactionAdded()
    return
  })

  return transactionResult.error ? (
    <ErrorFeedback
      message="Failed to create transaction"
      error={transactionResult.error}
    />
  ) : (
    <></>
  )
}
