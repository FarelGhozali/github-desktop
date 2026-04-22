import * as React from 'react'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { Commit } from '../../models/commit'
import { getFileHistory, IFileCommit } from '../../lib/git'
import { Dialog, DialogFooter } from '../dialog'
import { CommitList } from '../history/commit-list'
import { Account } from '../../models/account'
import { Emoji } from '../../lib/emoji'
import { SeamlessDiffSwitcher } from '../diff/seamless-diff-switcher'
import { CommittedFileChange } from '../../models/status'
import { IDiff, ImageDiffType } from '../../models/diff'
import { getCommitDiff } from '../../lib/git/diff'

interface IFileHistoryDialogProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly path: string
  readonly emoji: Map<string, Emoji>
  readonly accounts: ReadonlyArray<Account>
  readonly onDismissed: () => void
}

interface IFileHistoryDialogState {
  readonly fileCommits: ReadonlyArray<IFileCommit>
  readonly commitLookup: Map<string, Commit>
  readonly selectedSHA: string | null
  readonly currentDiff: IDiff | null
  readonly isLoading: boolean
}

export class FileHistoryDialog extends React.Component<
  IFileHistoryDialogProps,
  IFileHistoryDialogState
> {
  public constructor(props: IFileHistoryDialogProps) {
    super(props)

    this.state = {
      fileCommits: [],
      commitLookup: new Map(),
      selectedSHA: null,
      currentDiff: null,
      isLoading: true,
    }
  }

  public async componentDidMount() {
    const fileCommits = await getFileHistory(
      this.props.repository,
      this.props.path
    )
    const commitLookup = new Map<string, Commit>()
    for (const fc of fileCommits) {
      commitLookup.set(fc.commit.sha, fc.commit)
    }

    this.setState({
      fileCommits,
      commitLookup,
      isLoading: false,
      selectedSHA: fileCommits.length > 0 ? fileCommits[0].commit.sha : null,
    })

    if (fileCommits.length > 0) {
      this.loadDiff(fileCommits[0])
    }
  }

  private onCommitsSelected = (
    commits: ReadonlyArray<Commit>,
    isContiguous: boolean
  ) => {
    if (commits.length > 0) {
      const sha = commits[0].sha
      this.setState({ selectedSHA: sha })
      const fileCommit = this.state.fileCommits.find(fc => fc.commit.sha === sha)
      if (fileCommit) {
        this.loadDiff(fileCommit)
      }
    }
  }

  private async loadDiff(fileCommit: IFileCommit) {
    const { repository } = this.props
    const { commit, path, status } = fileCommit

    const file = new CommittedFileChange(path, status, commit.sha)

    try {
      const diff = await getCommitDiff(repository, file, commit.sha)
      this.setState({ currentDiff: diff })
    } catch (e) {
      console.error('Failed to load diff', e)
      this.setState({ currentDiff: null })
    }
  }

  public render() {
    const commitSHAs = this.state.fileCommits.map(fc => fc.commit.sha)
    const selectedSHAs = this.state.selectedSHA ? [this.state.selectedSHA] : []

    return (
      <Dialog
        className="file-history-dialog"
        title={`History for: ${this.props.path}`}
        onDismissed={this.props.onDismissed}
        onSubmit={this.props.onDismissed}
      >
        <div className="file-history-content">
          <div className="commit-list-container">
            <CommitList
              gitHubRepository={null}
              commitLookup={this.state.commitLookup}
              commitSHAs={commitSHAs}
              selectedSHAs={selectedSHAs}
              localCommitSHAs={[]}
              emoji={this.props.emoji}
              onCommitsSelected={this.onCommitsSelected}
              accounts={this.props.accounts}
            />
          </div>
          <div className="diff-container">{this.renderDiff()}</div>
        </div>
      </Dialog>
    )
  }

  private renderDiff() {
    if (this.state.selectedSHA === null || this.state.currentDiff === null) {
      return <div className="no-diff">No commit selected</div>
    }

    const fileCommit = this.state.fileCommits.find(
      fc => fc.commit.sha === this.state.selectedSHA
    )
    if (!fileCommit) {
      return null
    }

    const file = new CommittedFileChange(
      fileCommit.path,
      fileCommit.status,
      fileCommit.commit.sha
    )

    return (
      <SeamlessDiffSwitcher
        repository={this.props.repository}
        dispatcher={this.props.dispatcher}
        imageDiffType={ImageDiffType.Rendered}
        file={file}
        diff={this.state.currentDiff}
        hideWhitespaceInDiff={false}
        showSideBySideDiff={false}
        onOpenBinaryFile={() => {}}
        onChangeImageDiffType={() => {}}
      />
    )
  }
}
