import {
  BatchOperationResult,
  DeleteEmailMessageSuccessResult,
  DraftEmailMessage,
  DraftEmailMessageMetadata,
  EmailMessageOperationFailureResult,
  ScheduledDraftMessage,
} from '@sudoplatform/sudo-email'
import React from 'react'

interface DraftEmailMessagesContextState {
  draftMessagesMetadataList: DraftEmailMessageMetadata[]
  setDraftMessagesMetadataList: React.Dispatch<
    React.SetStateAction<DraftEmailMessageMetadata[]>
  >
  draftsLoading: boolean
  listDraftEmailMessagesHandler: () => Promise<void>
  createDraftEmailMessageHandler: (
    rfc822Data: string,
  ) => Promise<DraftEmailMessageMetadata>
  deleteDraftEmailMessagesHandler: (
    ids: string[],
  ) => Promise<
    BatchOperationResult<
      DeleteEmailMessageSuccessResult,
      EmailMessageOperationFailureResult
    >
  >
  getDraftEmailMessageHandler: (
    draftEmailId: string,
  ) => Promise<DraftEmailMessage | undefined>
  scheduledMessages: ScheduledDraftMessage[]
  setScheduledMessages: React.Dispatch<
    React.SetStateAction<ScheduledDraftMessage[]>
  >
  scheduledMessagesLoading: boolean
  scheduleSendMessagesHandler: (id: string, sendAt: Date) => Promise<void>
  cancelScheduledMessageHandler: (id: string) => Promise<void>
  listScheduledMessagesHandler: () => Promise<void>
}

export const DraftEmailMessagesContext =
  React.createContext<DraftEmailMessagesContextState>(undefined as never)
