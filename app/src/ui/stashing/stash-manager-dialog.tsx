import * as React from 'react'
import { IStashEntry } from '../../models/stash-entry'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Button } from '../lib/button'
import * as octicons from '../octicons'

interface IStashManagerDialogProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly stashEntries: ReadonlyArray<IStashEntry>
  readonly onDismissed: () => void
}

export class StashManagerDialog extends React.Component<IStashManagerDialogProps> {
  public render() {
    return (
      <Dialog
        id="stash-manager"
        title="Manage Stashes"
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>
          <div className="stash-manager-list">
            {this.props.stashEntries.length === 0 ? (
              <div className="no-stashes">No stashes found in this repository.</div>
            ) : (
              this.props.stashEntries.map(entry => (
                <div key={entry.stashSha} className="stash-entry-item">
                  <div className="stash-info">
                    <div className="stash-summary">{entry.summary}</div>
                    <div className="stash-meta">
                      {entry.branchName && (
                        <span className="branch">
                          <octicons.Octicon symbol={octicons.gitBranch} /> {entry.branchName}
                        </span>
                      )}
                      <span className="sha">{entry.stashSha.substring(0, 7)}</span>
                    </div>
                  </div>
                  <div className="stash-actions">
                    <Button onClick={() => this.onApply(entry)}>Apply</Button>
                    <Button onClick={() => this.onPop(entry)}>Pop</Button>
                    <Button
                      type="submit"
                      className="discard-button"
                      onClick={() => this.onDiscard(entry)}
                    >
                      Discard
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            cancelButtonText="Close"
            onCancelButtonClick={this.props.onDismissed}
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onApply = (entry: IStashEntry) => {
    // We don't have a direct "apply" in Dispatcher that takes an entry name yet
    // But we can add it or use pop if we want it to be removed.
    // GitHub Desktop currently only has popStashEntry which takes a SHA.
    this.props.dispatcher.popStash(this.props.repository, entry)
    this.props.onDismissed()
  }

  private onPop = (entry: IStashEntry) => {
    this.props.dispatcher.popStash(this.props.repository, entry)
    this.props.onDismissed()
  }

  private onDiscard = (entry: IStashEntry) => {
    this.props.dispatcher.dropStash(this.props.repository, entry)
  }
}
