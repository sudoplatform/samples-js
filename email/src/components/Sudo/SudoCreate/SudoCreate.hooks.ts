import { useContext, useState } from 'react'
import { Sudo } from '@sudoplatform/sudo-profiles'
import { ProjectContext, SudosContext } from '@contexts'
import { message } from 'antd'
import { useForm } from '@sudoplatform/web-ui'
import { useErrorBoundary } from '@components/ErrorBoundary'
import { useActiveSudoUpdate } from '@hooks/useActiveSudoUpdate'

interface SudoCreateInputs {
  firstName: string
  lastName: string
  label: string
}

export const useCreateSudoForm = () => {
  const { sudoProfilesClient } = useContext(ProjectContext)
  const { listSudosHandler } = useContext(SudosContext)
  const [form] = useForm<SudoCreateInputs>()
  const [createSudoLoading, setCreateSudoLoading] = useState(false)

  const { error, setError, clearError } = useErrorBoundary()

  useActiveSudoUpdate(clearError)

  // Create new Sudo from form input.
  const createSudoHandler = async (
    sudoCreateInputs: SudoCreateInputs,
  ): Promise<Sudo> => {
    const sudo = new Sudo()
    sudo.firstName = sudoCreateInputs.firstName
    sudo.lastName = sudoCreateInputs.lastName
    sudo.label = sudoCreateInputs.label

    return await sudoProfilesClient.createSudo(sudo)
  }

  // Return validated form values (null if not validated).
  const getFormValues = async (): Promise<SudoCreateInputs | null> => {
    try {
      return await form.validateFields()
    } catch {
      // UI library will handle errors on missing fields.
      return null
    }
  }

  // Handler function to be called by component on form submittion.
  const formSubmitHandler = async (): Promise<void> => {
    clearError()
    const formValues = await getFormValues()

    if (formValues !== null) {
      setCreateSudoLoading(true)

      try {
        await createSudoHandler(formValues)
        void message.success('Successfully created Sudo')
        form.resetFields()
        listSudosHandler()
      } catch (error) {
        // Set UI error if creation of Sudo fails.
        setError(error as Error, 'Failed to create Sudo')
      }

      setCreateSudoLoading(false)
    }
  }

  return {
    form,
    formSubmitHandler,
    createSudoLoading,
    createSudoError: error,
  }
}
