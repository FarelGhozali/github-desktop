import * as React from 'react'
import { Commit } from '../../../models/commit'
import { RebaseAction, IRebaseTodoItem } from '../../../models/rebase-todo'
import { Dialog, DialogContent, DialogFooter } from '../../dialog'
import { OkCancelButtonGroup } from '../../dialog/ok-cancel-button-group'
import { Dispatcher } from '../../dispatcher'
import { Repository } from '../../../models/repository'
import { Octicon } from '../../octicons'
import * as octicons from '../../octicons'
import { Select } from '../../lib/select'
import { TextBox } from '../../lib/text-box'
import { TextArea } from '../../lib/text-area'
import { List } from '../../lib/list'
import { Draggable } from '../../lib/draggable'
import { dragAndDropManager } from '../../../lib/drag-and-drop-manager'
import { DragType, DropTargetSelector, DragData } from '../../../models/drag-drop'

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

  private onMessageChanged = (index: number, newMessage: string) => {
    const newTodoList = [...this.state.todoList]
    newTodoList[index] = { ...newTodoList[index], newMessage }
    this.setState({ todoList: newTodoList })
  }

  private onBodyChanged = (index: number, newBody: string) => {
    const newTodoList = [...this.state.todoList]
    newTodoList[index] = { ...newTodoList[index], newBody }
    this.setState({ todoList: newTodoList })
  }

  private onDragStart = (index: number) => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    dragAndDropManager.setDragData({
      type: DragType.Commit,
      commits: [this.state.todoList[index].commit],
    })
  }

  private onDropDataInsertion = (row: number, data: DragData) => {
    if (data.type !== DragType.Commit) return
    const commitToMove = data.commits[0]
    
    const currentIndex = this.state.todoList.findIndex(
      item => item.commit.sha === commitToMove.sha
    )
    if (currentIndex === -1 || currentIndex === row) return
    
    const newTodoList = [...this.state.todoList]
    const [movedItem] = newTodoList.splice(currentIndex, 1)
    
    const insertRow = currentIndex < row ? row - 1 : row
    newTodoList.splice(insertRow, 0, movedItem)
    
    this.setState({ todoList: newTodoList })
  }

  private getRowHeight = (info: { index: number }) => {
    const item = this.state.todoList[info.index]
    return item.action === 'reword' ? 120 : 45
  }

  private renderRow = (row: number) => {
    const item = this.state.todoList[row]
    return (
      <div key={item.commit.sha} className="rebase-todo-item">
        <Draggable
          isEnabled={true}
          onDragStart={() => this.onDragStart(row)}
          onRenderDragElement={() => {}}
          onRemoveDragElement={() => {}}
          dropTargetSelectors={[DropTargetSelector.ListInsertionPoint]}
        >
          <div className="drag-handle">
            <Octicon symbol={octicons.threeBars} />
          </div>
        </Draggable>

        <Select
          value={item.action}
          onChange={event =>
            this.onActionChanged(row, event.currentTarget.value as RebaseAction)
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
          {item.action === 'reword' ? (
            <div className="rebase-item-reword">
              <TextBox
                value={item.newMessage ?? item.commit.summary}
                onValueChanged={value => this.onMessageChanged(row, value)}
                placeholder="Summary"
              />
              <TextArea
                value={item.newBody ?? item.commit.body}
                onValueChanged={value => this.onBodyChanged(row, value)}
                placeholder="Description"
              />
            </div>
          ) : (
            <span className="summary">{item.commit.summary}</span>
          )}
        </div>
      </div>
    )
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
        backdropDismissable={false}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
      >
        <DialogContent>
          <div className="interactive-rebase-todo-list">
            <List
              id="interactive-rebase-todo-list-inner"
              rowCount={this.state.todoList.length}
              rowHeight={this.getRowHeight}
              rowRenderer={this.renderRow}
              selectedRows={[]}
              onDropDataInsertion={this.onDropDataInsertion}
              insertionDragType={DragType.Commit}
            />
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
