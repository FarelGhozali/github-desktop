import * as React from 'react'
import {
  CommitSignatureStatus,
  ICommitSignature,
} from '../../models/commit-signature'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { ToggledtippedContent } from './toggletipped-content'

interface IVerifiedBadgeProps {
  readonly signature: ICommitSignature
}

/**
 * A component which displays a badge indicating the signature status of a commit.
 */
export class VerifiedBadge extends React.Component<IVerifiedBadgeProps> {
  public render() {
    const { signature } = this.props

    if (signature.status === CommitSignatureStatus.NoSignature) {
      return null
    }

    const { icon, className, label, badgeText } = getStatusDetails(
      signature.status
    )

    const tooltip = (
      <div className="verified-badge-details">
        <div className="status-description">{label}</div>
        {signature.signer && (
          <div className="signer">
            Signer: <strong>{signature.signer}</strong>
          </div>
        )}
        {signature.keyId && (
          <div className="key-id">
            Key ID: <code>{signature.keyId}</code>
          </div>
        )}
      </div>
    )

    return (
      <ToggledtippedContent
        className={className}
        tooltip={tooltip}
        ariaLiveMessage={label}
      >
        <Octicon symbol={icon} />
        {badgeText && <span className="badge-label">{badgeText}</span>}
      </ToggledtippedContent>
    )
  }
}

function getStatusDetails(status: CommitSignatureStatus) {
  switch (status) {
    case CommitSignatureStatus.Verified:
      return {
        icon: octicons.verified,
        className: 'verified-badge verified',
        label: 'This commit was signed with a verified signature.',
        badgeText: 'Verified',
      }
    case CommitSignatureStatus.Unverified:
      return {
        icon: octicons.shield,
        className: 'verified-badge unverified',
        label: 'This commit was signed with an unverified signature.',
        badgeText: 'Unverified',
      }
    case CommitSignatureStatus.BadSignature:
      return {
        icon: octicons.shieldX,
        className: 'verified-badge bad',
        label: 'This commit was signed with a bad signature.',
        badgeText: 'Bad Signature',
      }
    default:
      return {
        icon: octicons.shield,
        className: 'verified-badge unknown',
        label: 'Unknown signature status.',
        badgeText: null,
      }
  }
}
