import * as React from 'react'
import { Repository } from '../../../models/repository'
import { Commit } from '../../../models/commit'
import { Dispatcher } from '../../dispatcher'
import { Dialog, DialogContent, DialogFooter } from '../../dialog'
import { TextBox } from '../../lib/text-box'
import { TextArea } from '../../lib/text-area'
import { OkCancelButtonGroup } from '../../dialog/ok-cancel-button-group'

interface IRewordCommitDialogProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly commit: Commit
  readonly onDismissed: () => void
}

interface IRewordCommitDialogState {
  readonly summary: string
  readonly body: string
}

export class RewordCommitDialog extends React.Component<
  IRewordCommitDialogProps,
  IRewordCommitDialogState
> {
  public constructor(props: IRewordCommitDialogProps) {
    super(props)
    this.state = {
      summary: props.commit.summary,
      body: props.commit.body,
    }
  }

  private onSummaryChanged = (summary: string) => this.setState({ summary })
  private onBodyChanged = (body: string) => this.setState({ body })

  private onSubmit = () => {
    this.props.dispatcher.executeRewordCommit(
      this.props.repository,
      this.props.commit,
      this.state.summary,
      this.state.body
    )
    this.props.onDismissed()
  }

  public render() {
    const disabled = this.state.summary.trim().length === 0

    return (
      <Dialog
        id="reword-commit-dialog"
        title="Reword Commit"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <TextBox
            label="Summary"
            value={this.state.summary}
            onValueChanged={this.onSummaryChanged}
            autoFocus={true}
          />
          <TextArea
            label="Description"
            value={this.state.body}
            onValueChanged={this.onBodyChanged}
          />
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="Reword Commit"
            okButtonDisabled={disabled}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
