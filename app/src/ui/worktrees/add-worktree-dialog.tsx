import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { TextBox } from '../lib/text-box'
import { Branch } from '../../models/branch'
import { Select } from '../lib/select'

interface IAddWorktreeProps {
  readonly repository: Repository
  readonly allBranches: ReadonlyArray<Branch>
  readonly dispatcher: Dispatcher
  readonly onDismissed: () => void
}

interface IAddWorktreeState {
  readonly path: string
  readonly selectedBranch: string
}

export class AddWorktreeDialog extends React.Component<
  IAddWorktreeProps,
  IAddWorktreeState
> {
  public constructor(props: IAddWorktreeProps) {
    super(props)
    this.state = {
      path: '',
      selectedBranch: props.allBranches[0]?.name || '',
    }
  }

  private onPathChanged = (path: string) => {
    this.setState({ path })
  }

  private onBranchChanged = (event: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ selectedBranch: event.currentTarget.value })
  }

  private onSubmit = () => {
    this.props.dispatcher.addWorktree(
      this.props.repository,
      this.state.path,
      this.state.selectedBranch
    )
    this.props.onDismissed()
  }

  public render() {
    return (
      <Dialog
        id="add-worktree"
        title="Add Worktree"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <TextBox
            label="Path for new worktree"
            placeholder="e.g. /path/to/new/folder"
            value={this.state.path}
            onValueChanged={this.onPathChanged}
            autoFocus={true}
          />
          <Select
            label="Branch"
            value={this.state.selectedBranch}
            onChange={this.onBranchChanged}
          >
            {this.props.allBranches.map(b => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </Select>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup okButtonText="Add Worktree" />
        </DialogFooter>
      </Dialog>
    )
  }
}
