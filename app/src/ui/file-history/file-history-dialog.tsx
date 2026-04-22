import * as React from 'react'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { Commit } from '../../models/commit'
import { getFileHistory } from '../../lib/git'
import { Dialog, DialogFooter } from '../dialog'
import { CommitList } from '../history/commit-list'
import { Account } from '../../models/account'
import { Emoji } from '../../lib/emoji'
import { SeamlessDiffSwitcher } from '../diff/seamless-diff-switcher'
import { CommittedFileChange, AppFileStatusKind } from '../../models/status'
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
  readonly commits: ReadonlyArray<Commit>
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
      commits: [],
      commitLookup: new Map(),
      selectedSHA: null,
      currentDiff: null,
      isLoading: true,
    }
  }

  public async componentDidMount() {
    const commits = await getFileHistory(this.props.repository, this.props.path)
    const commitLookup = new Map<string, Commit>()
    for (const commit of commits) {
      commitLookup.set(commit.sha, commit)
    }

    this.setState({
      commits,
      commitLookup,
      isLoading: false,
      selectedSHA: commits.length > 0 ? commits[0].sha : null,
    })

    if (commits.length > 0) {
      this.loadDiff(commits[0].sha)
    }
  }

  private onCommitsSelected = (
    commits: ReadonlyArray<Commit>,
    isContiguous: boolean
  ) => {
    if (commits.length > 0) {
      const sha = commits[0].sha
      this.setState({ selectedSHA: sha })
      this.loadDiff(sha)
    }
  }

  private async loadDiff(sha: string) {
    const { repository, path } = this.props
    
    // Create a fake CommittedFileChange for the diff
    // In a real implementation, we might want to get the actual status
    const file = new CommittedFileChange(
      path,
      { kind: AppFileStatusKind.Modified },
      sha
    )

    try {
      const diff = await getCommitDiff(repository, file, sha)
      this.setState({ currentDiff: diff })
    } catch (e) {
      console.error('Failed to load diff', e)
      this.setState({ currentDiff: null })
    }
  }

  public render() {
    const commitSHAs = this.state.commits.map(c => c.sha)
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
          <div className="diff-container">
            {this.renderDiff()}
          </div>
        </div>
      </Dialog>
    )
  }

  private renderDiff() {
    if (this.state.selectedSHA === null || this.state.currentDiff === null) {
      return <div className="no-diff">No commit selected</div>
    }

    // We need to provide a FileChange for the SeamlessDiffSwitcher
    const file = new CommittedFileChange(
      this.props.path,
      { kind: AppFileStatusKind.Modified },
      this.state.selectedSHA
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
