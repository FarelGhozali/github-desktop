import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { IReflogEntry } from '../../models/reflog'
import { getReflog } from '../../lib/git/reflog'
import { List } from '../lib/list'
import { RelativeTime } from '../relative-time'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Button } from '../lib/button'

interface IReflogProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly onDismissed: () => void
}

interface IReflogState {
  readonly entries: ReadonlyArray<IReflogEntry>
  readonly isLoading: boolean
}

const RowHeight = 50

export class Reflog extends React.Component<IReflogProps, IReflogState> {
  public constructor(props: IReflogProps) {
    super(props)
    this.state = {
      entries: [],
      isLoading: true,
    }
  }

  public async componentDidMount() {
    const entries = await getReflog(this.props.repository)
    this.setState({ entries, isLoading: false })
  }

  private onRestore = (entry: IReflogEntry) => {
    this.props.dispatcher.resetToSHA(
      this.props.repository,
      entry.sha,
      entry.description
    )
    this.props.onDismissed()
  }

  private renderRow = (row: number) => {
    const entry = this.state.entries[row]
    return (
      <div className="reflog-entry-item" key={entry.selector}>
        <div className="reflog-entry-info">
          <div className="reflog-entry-main">
            <span className="reflog-entry-action">{entry.action}</span>
            <span className="reflog-entry-description">{entry.description}</span>
          </div>
          <div className="reflog-entry-meta">
            <Octicon symbol={octicons.gitCommit} />
            <span className="reflog-entry-sha">{entry.shortSha}</span>
            <span className="reflog-entry-selector">{entry.selector}</span>
            <RelativeTime date={entry.date} />
          </div>
        </div>
        <Button
          onClick={() => this.onRestore(entry)}
          tooltip={`Restore to this state (${entry.shortSha})`}
        >
          Restore
        </Button>
      </div>
    )
  }

  public render() {
    return (
      <Dialog
        id="reflog"
        title="Repository Reflog"
        onDismissed={this.props.onDismissed}
        onSubmit={this.props.onDismissed}
      >
        <DialogContent>
          {this.state.isLoading ? (
            <div className="loading">Loading reflog...</div>
          ) : (
            <List
              rowCount={this.state.entries.length}
              rowHeight={RowHeight}
              rowRenderer={this.renderRow}
              id="reflog-list"
            />
          )}
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup okButtonText="Close" cancelButtonVisible={false} />
        </DialogFooter>
      </Dialog>
    )
  }
}
