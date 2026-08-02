import * as React from 'react'
import { Repository } from '../../models/repository'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { untrackFiles } from '../../lib/git/gitignore'
import { Dispatcher } from '../dispatcher'
import { PathText } from '../lib/path-text'

interface IUntrackFilesProps {
  readonly repository: Repository
  readonly files: ReadonlyArray<string>
  readonly dispatcher: Dispatcher
  readonly onDismissed: () => void
}

interface IUntrackFilesState {
  readonly disabled: boolean
}

export class UntrackFilesDialog extends React.Component<
  IUntrackFilesProps,
  IUntrackFilesState
> {
  public constructor(props: IUntrackFilesProps) {
    super(props)
    this.state = { disabled: false }
  }

  public render() {
    const fileCount = this.props.files.length
    const title = 'Untrack Files'
    
    return (
      <Dialog
        id="untrack-files"
        title={title}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
        disabled={this.state.disabled}
      >
        <DialogContent>
          <p>
            The following {fileCount} {fileCount === 1 ? 'file is' : 'files are'} already tracked by Git
            but matches your new ignore patterns. Do you want to untrack {fileCount === 1 ? 'it' : 'them'}?
          </p>
          <p className="secondary-text">
            This will remove the {fileCount === 1 ? 'file' : 'files'} from the Git index but keep {fileCount === 1 ? 'it' : 'them'} on your disk.
          </p>
          <div className="file-list">
            {this.props.files.map(f => (
              <PathText key={f} path={f} />
            ))}
          </div>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText={`Untrack ${fileCount === 1 ? 'File' : 'Files'}`}
            cancelButtonText="Skip"
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onSubmit = async () => {
    this.setState({ disabled: true })
    try {
      await untrackFiles(this.props.repository, this.props.files)
      this.props.dispatcher.refreshRepository(this.props.repository)
    } catch (e) {
      log.error('Failed to untrack files', e)
    } finally {
      this.props.onDismissed()
    }
  }
}
