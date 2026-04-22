/**
 * The signature status of a commit.
 */
export enum CommitSignatureStatus {
  /** The signature is valid and the signer is trusted. */
  Verified = 'Verified',
  /** The signature is valid but the signer is not trusted. */
  Unverified = 'Unverified',
  /** The signature is invalid. */
  BadSignature = 'BadSignature',
  /** The commit is not signed. */
  NoSignature = 'NoSignature',
}

/**
 * Information about a commit's signature.
 */
export interface ICommitSignature {
  /** The signature status. */
  readonly status: CommitSignatureStatus
  /** The key ID used for the signature. */
  readonly keyId: string | null
  /** The identity of the signer. */
  readonly signer: string | null
}

/**
 * Parse the Git signature status code into a CommitSignatureStatus.
 *
 * @param status The one-letter status code from Git (%G?).
 */
export function parseSignatureStatus(status: string): CommitSignatureStatus {
  switch (status) {
    case 'G':
      return CommitSignatureStatus.Verified
    case 'U':
    case 'X':
    case 'Y':
    case 'R':
      return CommitSignatureStatus.Unverified
    case 'B':
    case 'E':
      return CommitSignatureStatus.BadSignature
    case 'N':
    default:
      return CommitSignatureStatus.NoSignature
  }
}
