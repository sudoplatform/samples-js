/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BillingAddress, VirtualCard } from '@sudoplatform/sudo-virtual-cards'
import { HSpace, Input, VSpace } from '@sudoplatform/web-ui'
import { Modal, Form } from 'antd'
const { Item: FormItem, useForm } = Form
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { AppContext } from '../../../containers/AppContext'

interface Props {
  chosenCard: VirtualCard | undefined
  open: boolean
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  onCardUpdated: (id: string) => void
}

interface UpdateVirtualCardInputs {
  cardHolder: string
  alias: string
  addressLine1: string | undefined
  addressLine2: string | undefined
  city: string | undefined
  state: string | undefined
  country: string | undefined
  postalCode: string | undefined
}

export const UpdateCardModal: React.FC<Props> = ({
  chosenCard,
  open,
  setVisible,
  onCardUpdated,
}) => {
  const { virtualCardsClient } = useContext(AppContext)

  const [form] = useForm<UpdateVirtualCardInputs>()

  const [confirmLoading, setConfirmLoading] = useState(false)

  const handleOk = useCallback(() => {
    setConfirmLoading(true)
    void form
      .validateFields()
      .then((fields) => {
        if (!chosenCard) {
          throw new Error('No chosen card')
        }
        const addressFields = Object.entries(fields).filter(([k]) =>
          [
            'addressLine1',
            'addressLine2',
            'city',
            'state',
            'country',
            'postalCode',
          ].includes(k),
        )
        const anyAddressFieldsSet = addressFields.some(
          ([, v]) => v !== undefined,
        )
        const allAddressFieldsSet = addressFields
          .filter(([k]) => k !== 'addressLine2')
          .every(([, v]) => v !== undefined)
        if (anyAddressFieldsSet && !allAddressFieldsSet) {
          throw new Error('Invalid inputs')
        }
        let billingAddress: BillingAddress | undefined
        if (allAddressFieldsSet) {
          billingAddress = {
            addressLine1: fields.addressLine1!,
            addressLine2: fields.addressLine2,
            city: fields.city!,
            state: fields.state!,
            postalCode: fields.postalCode!,
            country: fields.country!,
          }
        }
        return virtualCardsClient.updateVirtualCard({
          id: chosenCard.id,
          expectedCardVersion: chosenCard.version,
          cardHolder: fields.cardHolder,
          billingAddress,
          metadata: {
            alias: fields.alias,
          },
        })
      })
      .then((card) => {
        setConfirmLoading(false)
        setVisible(false)
        onCardUpdated(card.result.id)
      })
  }, [
    setVisible,
    setConfirmLoading,
    chosenCard,
    form,
    onCardUpdated,
    virtualCardsClient,
  ])

  const handleCancel = useCallback(() => {
    setVisible(false)
  }, [setVisible])

  useEffect(() => {
    form.setFields([
      { name: 'cardHolder', value: chosenCard?.cardHolder },
      { name: 'alias', value: chosenCard?.alias },
      { name: 'addressLine1', value: chosenCard?.billingAddress?.addressLine1 },
      { name: 'addressLine2', value: chosenCard?.billingAddress?.addressLine2 },
      { name: 'city', value: chosenCard?.billingAddress?.city },
      { name: 'state', value: chosenCard?.billingAddress?.state },
      { name: 'postalCode', value: chosenCard?.billingAddress?.postalCode },
    ])
  }, [chosenCard, form])

  return (
    <Modal
      title="Update Card"
      open={open}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={handleCancel}
      getContainer={false}
    >
      <Form requiredMark={true} form={form}>
        <FormItem name="cardHolder" label="Card Holder">
          <Input />
        </FormItem>
        <FormItem name="alias" label="Alias">
          <Input />
        </FormItem>
        <FormItem name="addressLine1" label="Address Line 1">
          <Input />
        </FormItem>
        <FormItem name="addressLine2" label="Address Line 2" required={false}>
          <Input />
        </FormItem>
        <HSpace stretch="all">
          <VSpace>
            <FormItem name="city" label="City">
              <Input />
            </FormItem>
            <FormItem name="state" label="State">
              <Input />
            </FormItem>
          </VSpace>
          <VSpace>
            <FormItem name="postalCode" label="Postal Code">
              <Input />
            </FormItem>
            <FormItem name="country" label="Country">
              <Input />
            </FormItem>
          </VSpace>
        </HSpace>
      </Form>
    </Modal>
  )
}
