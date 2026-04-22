import * as React from 'react'
import * as Path from 'path'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { SubmoduleEntry, SubmoduleStatus } from '../../models/submodule'
import {
  listSubmodules,
  initAndUpdateSubmodules,
  syncSubmodules,
} from '../../lib/git/submodule'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Button } from '../lib/button'
import { PopupType } from '../../models/popup'

interface ISubmoduleManagerProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly onDismissed: () => void
}

interface ISubmoduleManagerState {
  readonly submodules: ReadonlyArray<SubmoduleEntry>
  readonly loading: boolean
}

export class SubmoduleManager extends React.Component<
  ISubmoduleManagerProps,
  ISubmoduleManagerState
> {
  public constructor(props: ISubmoduleManagerProps) {
    super(props)
    this.state = {
      submodules: [],
      loading: true,
    }
  }

  public async componentDidMount() {
    await this.loadSubmodules()
  }

  private async loadSubmodules() {
    this.setState({ loading: true })
    const submodules = await listSubmodules(this.props.repository)
    this.setState({ submodules, loading: false })
  }

  public render() {
    return (
      <Dialog
        id="submodule-manager"
        title={__DARWIN__ ? 'Manage Submodules' : 'Manage submodules'}
        onDismissed={this.props.onDismissed}
        loading={this.state.loading}
      >
        <DialogContent>
          <div className="submodule-manager-header">
            <Button onClick={this.onUpdateAll}>Update & Initialize All</Button>
            <Button onClick={this.onSyncAll}>Sync All</Button>
            <Button onClick={this.onAddSubmodule}>Add Submodule</Button>
          </div>
          <div className="submodule-list">
            {this.state.submodules.length === 0 && !this.state.loading ? (
              <div className="no-submodules">No submodules found</div>
            ) : (
              this.state.submodules.map(s => this.renderSubmodule(s))
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="Close"
            onCancel={this.props.onDismissed}
            cancelVisible={false}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private renderSubmodule(submodule: SubmoduleEntry) {
    const { symbol, className } = getStatusIcon(submodule.status)
    return (
      <div key={submodule.path} className="submodule-item">
        <div className="submodule-status">
          <Octicon
            symbol={symbol}
            className={className}
            title={submodule.status}
          />
        </div>
        <div className="submodule-info">
          <div className="submodule-path-row">
            <Octicon symbol={octicons.fileSubmodule} />
            <span className="submodule-path">{submodule.path}</span>
          </div>
          <div className="submodule-url">{submodule.url}</div>
          <div className="submodule-sha-row">
            <span className="submodule-sha-label">Commit:</span>
            <span className="submodule-sha">{submodule.sha.substring(0, 7)}</span>
            {submodule.describe && (
              <span className="submodule-describe">({submodule.describe})</span>
            )}
          </div>
        </div>
        <div className="submodule-actions">
          <Button onClick={() => this.onOpenSubmodule(submodule)}>
            Open
          </Button>
        </div>
      </div>
    )
  }

  private onUpdateAll = async () => {
    this.setState({ loading: true })
    try {
      await initAndUpdateSubmodules(this.props.repository)
    } finally {
      await this.loadSubmodules()
    }
  }

  private onSyncAll = async () => {
    this.setState({ loading: true })
    try {
      await syncSubmodules(this.props.repository)
    } finally {
      await this.loadSubmodules()
    }
  }

  private onAddSubmodule = () => {
    this.props.dispatcher.showPopup({
      type: PopupType.AddSubmodule,
      repository: this.props.repository,
    })
  }

  private onOpenSubmodule = async (submodule: SubmoduleEntry) => {
    const fullPath = Path.join(this.props.repository.path, submodule.path)
    const repositories = await this.props.dispatcher.addRepositories([fullPath])
    if (repositories.length > 0) {
      await this.props.dispatcher.selectRepository(repositories[0])
      this.props.onDismissed()
    }
  }
}

function getStatusIcon(status: SubmoduleStatus) {
  switch (status) {
    case SubmoduleStatus.UpToDate:
      return { symbol: octicons.check, className: 'status-up-to-date' }
    case SubmoduleStatus.NotInitialized:
      return { symbol: octicons.dotFill, className: 'status-not-initialized' }
    case SubmoduleStatus.OutOfSync:
      return { symbol: octicons.alert, className: 'status-out-of-sync' }
    case SubmoduleStatus.Conflict:
      return { symbol: octicons.x, className: 'status-conflict' }
    default:
      return { symbol: octicons.question, className: 'status-unknown' }
  }
}
