import React, { useState } from 'react'
import { Input } from '@sudoplatform/web-ui'
import { FormItem } from '../SendEmailMessage.styled'
import { TagsContainer, Tag, ClearIcon } from './EmailAddressesFormItem.styled'
import { FormInstance } from 'antd'

interface EmailAddressTagsProps {
  emailAddresses: string[]
  setEmailAddressesHandler: (emailAddresses: string[]) => void
}

/**
 * View component that renders a list of email as strings as
 * antd `<Tag>` components.
 */
const SelectedEmailAddressesView = ({
  emailAddresses,
  setEmailAddressesHandler,
}: EmailAddressTagsProps): React.ReactElement => {
  return (
    <>
      {emailAddresses.length !== 0 && (
        <TagsContainer>
          {emailAddresses.map((emailAddress) => (
            <Tag color="blue" key={emailAddress}>
              {emailAddress}
              <ClearIcon
                onClick={() => {
                  setEmailAddressesHandler(
                    emailAddresses.filter((iteratedEmailAddress) => {
                      return emailAddress !== iteratedEmailAddress
                    }),
                  )
                }}
              />
            </Tag>
          ))}
        </TagsContainer>
      )}
    </>
  )
}

/**
 * Regex pattern as referenced in the Sudo Email JS documentation:
 * https://sudoplatform.github.io/sudo-email-js/interfaces/SendEmailMessageInput.html
 */
const emailRegExPattern = new RegExp(
  /^[a-zA-Z0-9](\.?[-_a-zA-Z0-9])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/,
)

interface EmailAddressFormItemProps {
  form: FormInstance
  fieldName: string
  fieldLabel: string
  required?: boolean
  emailAddresses: string[]
  setEmailAddresses: (emailAddress: string[]) => void
}

/**
 * An input form item component for submitting email addresses
 * as strings and renders them in a list below the form item.
 *
 * An email address is submitted with the `enter` key and
 * validated against an email regex pattern.
 */
export const EmailAddressesFormItem = ({
  form,
  fieldName,
  fieldLabel,
  required,
  emailAddresses,
  setEmailAddresses,
}: EmailAddressFormItemProps): React.ReactElement => {
  const [inputValidationMessage, setInputValidationMessage] = useState<
    string | undefined
  >()

  /**
   * Handler function called on 'enter' key press and assesses
   * an input value as an email address.
   *
   * If valid, that email address is added to the list and the
   * form input value is reset. If not valid, a form validation
   * error will be shown.
   */
  const validateEmailAddressInput = (inputValue: string): void => {
    // Clear any existing validation messages.
    setInputValidationMessage(undefined)

    // Assess email string matches allowed regex pattern.
    if (emailRegExPattern.test(inputValue)) {
      // Only add to list if not already exists in list.
      if (!emailAddresses.includes(inputValue)) {
        setEmailAddresses([...emailAddresses, inputValue])
      } else {
        setInputValidationMessage('Email address already set')
      }

      // Clear form input value.
      form.setFieldValue(fieldName, '')
    } else {
      // Input string does not match regex email address format.
      setInputValidationMessage('Invalid email address format')
    }
  }

  return (
    <>
      <FormItem
        name={fieldName}
        label={fieldLabel}
        validateStatus={inputValidationMessage ? 'error' : 'success'}
        help={inputValidationMessage}
        requiredMark={required}
        rules={
          required
            ? [
                {
                  validateTrigger: 'onSubmit',
                  required: true,
                  message: 'At least one email address required',
                  validator: (_, value) => {
                    return emailAddresses.length === 0
                      ? Promise.reject()
                      : Promise.resolve()
                  },
                },
              ]
            : undefined
        }
      >
        <Input
          onKeyDown={(e) => {
            // Validate input value on 'enter' key press (if input not empty).
            if (e.key === 'Enter') {
              e.preventDefault()
              validateEmailAddressInput((e.target as HTMLInputElement).value)
            }
          }}
          onBlur={(e) => {
            const { value } = e.target as HTMLInputElement

            if (value.length !== 0) {
              /* Validate input value if user has clicked away from input but
               not confirmed input value (if input not empty). */
              validateEmailAddressInput(value)
            }
          }}
        />
      </FormItem>
      <SelectedEmailAddressesView
        emailAddresses={emailAddresses}
        setEmailAddressesHandler={setEmailAddresses}
      />
    </>
  )
}
