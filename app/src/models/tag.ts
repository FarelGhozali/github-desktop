export interface ITag {
  readonly name: string
  readonly commitSha: string
  readonly message?: string
  readonly date: Date
  readonly isRemote: boolean
}

export interface ITagDetails extends ITag {
  readonly signature?: ITagSignature
}

export interface ITagSignature {
  readonly keyid: string
  readonly status: 'valid' | 'invalid' | 'unknown'
}
