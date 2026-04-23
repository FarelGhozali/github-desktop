import * as React from 'react'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Repository } from '../../models/repository'

interface ITabProps {
  readonly repository: Repository
  readonly isActive: boolean
  readonly hasUncommittedChanges: boolean
  readonly onSelect: () => void
  readonly onClose: () => void
}

export class Tab extends React.Component<ITabProps, {}> {
  private onClose = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    this.props.onClose()
  }

  public render() {
    const { repository, isActive, hasUncommittedChanges } = this.props
    const className = `repo-tab ${isActive ? 'active' : ''}`

    return (
      <div className={className} onClick={this.props.onSelect}>
        <div className="repo-tab-info">
          <Octicon symbol={octicons.repo} className="repo-icon" />
          <span className="repo-name">{repository.name}</span>
          {hasUncommittedChanges && <div className="uncommitted-indicator" />}
        </div>
        <button className="close-tab-button" onClick={this.onClose} title="Close Tab">
          <Octicon symbol={octicons.x} />
        </button>
      </div>
    )
  }
}
