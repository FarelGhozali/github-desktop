import * as React from 'react'
import { Repository } from '../../../models/repository'
import { Commit } from '../../../models/commit'
import { Dispatcher } from '../../dispatcher'
import { Dialog, DialogContent, DialogFooter } from '../../dialog'
import { OkCancelButtonGroup } from '../../dialog/ok-cancel-button-group'

interface IFixupCommitDialogProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly commit: Commit
  readonly onDismissed: () => void
}

export class FixupCommitDialog extends React.Component<IFixupCommitDialogProps> {
  private onSubmit = () => {
    this.props.dispatcher.executeFixupCommit(
      this.props.repository,
      this.props.commit
    )
    this.props.onDismissed()
  }

  public render() {
    return (
      <Dialog
        id="fixup-commit-dialog"
        title="Fixup Commit"
        type="warning"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <p>
            Are you sure you want to fixup the commit <strong>{this.props.commit.shortSha}</strong>?
          </p>
          <p>
            "{this.props.commit.summary}"
          </p>
          <p>
            This action will squash this commit into its parent commit and discard this commit's message.
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            destructive={true}
            okButtonText="Fixup Commit"
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
