import * as React from 'react'
import { Commit } from '../../../models/commit'
import { RebaseAction, IRebaseTodoItem } from '../../../models/rebase-todo'
import { Dialog, DialogContent, DialogFooter } from '../../dialog'
import { OkCancelButtonGroup } from '../../dialog/ok-cancel-button-group'
import { Dispatcher } from '../../dispatcher'
import { Repository } from '../../../models/repository'
import { Octicon, OcticonSymbol } from '../../octicons'
import { Select } from '../../lib/select'
import { Button } from '../../lib/button'

interface IInteractiveRebaseEditorDialogProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly commits: ReadonlyArray<Commit>
  readonly onDismissed: () => void
}

interface IInteractiveRebaseEditorDialogState {
  readonly todoList: ReadonlyArray<IRebaseTodoItem>
}

export class InteractiveRebaseEditorDialog extends React.Component<
  IInteractiveRebaseEditorDialogProps,
  IInteractiveRebaseEditorDialogState
> {
  public constructor(props: IInteractiveRebaseEditorDialogProps) {
    super(props)
    this.state = {
      todoList: props.commits.map(commit => ({ action: 'pick', commit })),
    }
  }

  private onActionChanged = (index: number, action: RebaseAction) => {
    const newTodoList = [...this.state.todoList]
    newTodoList[index] = { ...newTodoList[index], action }
    this.setState({ todoList: newTodoList })
  }

  private moveUp = (index: number) => {
    if (index === 0) return
    const newTodoList = [...this.state.todoList]
    const temp = newTodoList[index]
    newTodoList[index] = newTodoList[index - 1]
    newTodoList[index - 1] = temp
    this.setState({ todoList: newTodoList })
  }

  private moveDown = (index: number) => {
    if (index === this.state.todoList.length - 1) return
    const newTodoList = [...this.state.todoList]
    const temp = newTodoList[index]
    newTodoList[index] = newTodoList[index + 1]
    newTodoList[index + 1] = temp
    this.setState({ todoList: newTodoList })
  }

  private onSubmit = () => {
    this.props.dispatcher.executeInteractiveRebase(
      this.props.repository,
      this.state.todoList
    )
    this.props.onDismissed()
  }

  public render() {
    return (
      <Dialog
        id="interactive-rebase-editor"
        title="Interactive Rebase"
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <div className="interactive-rebase-todo-list">
            {this.state.todoList.map((item, index) => (
              <div key={item.commit.sha} className="rebase-todo-item">
                <div className="rebase-item-actions">
                  <Button onClick={() => this.moveUp(index)} disabled={index === 0}>
                    <Octicon symbol={OcticonSymbol.chevronUp} />
                  </Button>
                  <Button
                    onClick={() => this.moveDown(index)}
                    disabled={index === this.state.todoList.length - 1}
                  >
                    <Octicon symbol={OcticonSymbol.chevronDown} />
                  </Button>
                </div>

                <Select
                  value={item.action}
                  onSelectionChanged={action =>
                    this.onActionChanged(index, action as RebaseAction)
                  }
                  label="Action"
                >
                  <option value="pick">Pick</option>
                  <option value="reword">Reword</option>
                  <option value="edit">Edit</option>
                  <option value="squash">Squash</option>
                  <option value="fixup">Fixup</option>
                  <option value="drop">Drop</option>
                </Select>

                <div className="rebase-item-commit">
                  <span className="sha">{item.commit.sha.substring(0, 7)}</span>
                  <span className="summary">{item.commit.summary}</span>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>

        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="Start Rebase"
            cancelButtonText="Cancel"
            onCancelButtonClick={this.props.onDismissed}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
