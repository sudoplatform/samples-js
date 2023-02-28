export declare interface Header {
  key: string
  value: string
}

export declare interface Entity {
  name: string
  address: string
}

export declare interface Attachment {
  filename?: string
  mimeType: string
  disposition: 'attachment' | 'inline' | null
  related: boolean
  contentId: string
  content: ArrayBuffer
}

export declare interface ParsedMessage {
  headers: Header[]
  from?: Entity
  sender?: Entity
  replyTo?: Entity
  deliveredTo?: string
  returnPath?: string
  to?: Entity[]
  cc?: Entity[]
  bcc?: Entity[]
  subject?: string
  messageId?: string
  inReplyTo?: string
  references?: string
  date?: string
  html?: string
  text?: string
  attachments?: Attachment[]
}

/**
 * Parses an RFC822-formatted message into an object
 * containing message headers and message body.
 */
export declare const parseMessage: (
  message: string | ArrayBuffer | Blob | Buffer,
) => Promise<ParsedMessage>
