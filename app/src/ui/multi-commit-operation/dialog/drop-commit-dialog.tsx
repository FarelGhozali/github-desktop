import * as React from 'react'
import { Repository } from '../../../models/repository'
import { Commit } from '../../../models/commit'
import { Dispatcher } from '../../dispatcher'
import { Dialog, DialogContent, DialogFooter } from '../../dialog'
import { OkCancelButtonGroup } from '../../dialog/ok-cancel-button-group'

interface IDropCommitDialogProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly commit: Commit
  readonly onDismissed: () => void
}

export class DropCommitDialog extends React.Component<IDropCommitDialogProps> {
  private onSubmit = () => {
    this.props.dispatcher.executeDropCommit(
      this.props.repository,
      this.props.commit
    )
    this.props.onDismissed()
  }

  public render() {
    return (
      <Dialog
        id="drop-commit-dialog"
        title="Drop Commit"
        type="warning"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <p>
            Are you sure you want to drop the commit <strong>{this.props.commit.shortSha}</strong>?
          </p>
          <p>
            "{this.props.commit.summary}"
          </p>
          <p>
            This action will permanently remove this commit from your branch. This cannot be undone.
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            destructive={true}
            okButtonText="Drop Commit"
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
