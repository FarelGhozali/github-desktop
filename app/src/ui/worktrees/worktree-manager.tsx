import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { IWorktree } from '../../lib/git/worktree'
import { List } from '../lib/list'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Button } from '../lib/button'

interface IWorktreeManagerProps {
  readonly repository: Repository
  readonly worktrees: ReadonlyArray<IWorktree>
  readonly dispatcher: Dispatcher
  readonly onDismissed: () => void
}

const RowHeight = 50

export class WorktreeManager extends React.Component<IWorktreeManagerProps, {}> {
  private onRemoveWorktree = (worktree: IWorktree) => {
    this.props.dispatcher.removeWorktree(this.props.repository, worktree.path)
  }

  private onAddWorktree = () => {
    // We'll implement a separate dialog for adding worktrees
    this.props.dispatcher.showPopup({
      type: PopupType.AddWorktree,
      repository: this.props.repository,
    })
  }

  private renderRow = (row: number) => {
    const worktree = this.props.worktrees[row]
    const isMain = worktree.path === this.props.repository.path

    return (
      <div className="worktree-item" key={worktree.path}>
        <div className="worktree-info">
          <div className="worktree-path">
            <Octicon symbol={octicons.fileDirectory} />
            <span>{worktree.path}</span>
            {isMain && <span className="main-badge">Main</span>}
          </div>
          <div className="worktree-meta">
            <Octicon symbol={octicons.gitBranch} />
            <span>{worktree.branch || 'Detached'}</span>
            <span className="worktree-head">{worktree.head.substring(0, 7)}</span>
          </div>
        </div>
        {!isMain && (
          <Button
            onClick={() => this.onRemoveWorktree(worktree)}
            tooltip="Remove this worktree"
          >
            Remove
          </Button>
        )}
      </div>
    )
  }

  public render() {
    return (
      <Dialog
        id="worktree-manager"
        title="Manage Worktrees"
        onDismissed={this.props.onDismissed}
        onSubmit={this.props.onDismissed}
      >
        <DialogContent>
          <div className="worktree-list-container">
            <List
              rowCount={this.props.worktrees.length}
              rowHeight={RowHeight}
              rowRenderer={this.renderRow}
              id="worktree-list"
            />
          </div>
        </DialogContent>
        <DialogFooter>
          <Button onClick={this.onAddWorktree}>Add Worktree...</Button>
          <OkCancelButtonGroup okButtonText="Close" cancelButtonVisible={false} />
        </DialogFooter>
      </Dialog>
    )
  }
}

// Since I haven't added AddWorktree to PopupType yet, I'll need to do that
import { PopupType } from '../../models/popup'
