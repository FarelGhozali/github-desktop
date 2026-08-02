import * as React from 'react'
import { Repository } from '../../../models/repository'
import { Commit } from '../../../models/commit'
import { Dispatcher } from '../../dispatcher'
import { Dialog, DialogContent, DialogFooter } from '../../dialog'
import { TextBox } from '../../lib/text-box'
import { TextArea } from '../../lib/text-area'
import { OkCancelButtonGroup } from '../../dialog/ok-cancel-button-group'

interface ISquashCommitDialogProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly commit: Commit
  readonly parentCommit: Commit
  readonly onDismissed: () => void
}

interface ISquashCommitDialogState {
  readonly summary: string
  readonly body: string
}

export class SquashCommitDialog extends React.Component<
  ISquashCommitDialogProps,
  ISquashCommitDialogState
> {
  public constructor(props: ISquashCommitDialogProps) {
    super(props)
    
    // Combine summaries and bodies
    const summary = props.parentCommit.summary
    const bodyParts = []
    if (props.parentCommit.body) bodyParts.push(props.parentCommit.body)
    bodyParts.push(`* ${props.commit.summary}`)
    if (props.commit.body) bodyParts.push(props.commit.body)
    
    this.state = {
      summary,
      body: bodyParts.join('\n\n'),
    }
  }

  private onSummaryChanged = (summary: string) => this.setState({ summary })
  private onBodyChanged = (body: string) => this.setState({ body })

  private onSubmit = () => {
    this.props.dispatcher.executeSquashCommit(
      this.props.repository,
      this.props.commit,
      this.props.parentCommit,
      this.state.summary,
      this.state.body
    )
    this.props.onDismissed()
  }

  public render() {
    const disabled = this.state.summary.trim().length === 0

    return (
      <Dialog
        id="squash-commit-dialog"
        title="Squash Commit"
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
            okButtonText="Squash Commit"
            okButtonDisabled={disabled}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
