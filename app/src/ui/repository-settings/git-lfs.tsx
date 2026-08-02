import * as React from 'react'
import { DialogContent } from '../dialog'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { Button } from '../lib/button'
import { TextBox } from '../lib/text-box'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import {
  isUsingLFS,
  installLFSHooks,
  getLFSTrackedPatterns,
  trackPattern,
  untrackPattern,
  getLFSFiles,
  ILFSFile,
} from '../../lib/git/lfs'

interface IGitLFSProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
}

interface IGitLFSState {
  readonly isUsingLFS: boolean
  readonly trackedPatterns: ReadonlyArray<string>
  readonly lfsFiles: ReadonlyArray<ILFSFile>
  readonly newPattern: string
  readonly isLoading: boolean
}

/** The Git LFS settings view. */
export class GitLFS extends React.Component<IGitLFSProps, IGitLFSState> {
  public constructor(props: IGitLFSProps) {
    super(props)

    this.state = {
      isUsingLFS: false,
      trackedPatterns: [],
      lfsFiles: [],
      newPattern: '',
      isLoading: true,
    }
  }

  public async componentDidMount() {
    await this.refreshLFSStatus()
  }

  private async refreshLFSStatus() {
    this.setState({ isLoading: true })
    const usingLFS = await isUsingLFS(this.props.repository)
    let trackedPatterns: ReadonlyArray<string> = []
    let lfsFiles: ReadonlyArray<ILFSFile> = []

    if (usingLFS) {
      trackedPatterns = await getLFSTrackedPatterns(this.props.repository)
      lfsFiles = await getLFSFiles(this.props.repository)
    }

    this.setState({
      isUsingLFS: usingLFS,
      trackedPatterns,
      lfsFiles,
      isLoading: false,
    })
  }

  private onInitializeLFS = async () => {
    await installLFSHooks(this.props.repository, false)
    await this.refreshLFSStatus()
  }

  private onPatternChanged = (pattern: string) => {
    this.setState({ newPattern: pattern })
  }

  private onTrackPattern = async () => {
    const pattern = this.state.newPattern.trim()
    if (pattern) {
      await trackPattern(this.props.repository, pattern)
      this.setState({ newPattern: '' })
      await this.refreshLFSStatus()
    }
  }

  private onUntrackPattern = async (pattern: string) => {
    await untrackPattern(this.props.repository, pattern)
    await this.refreshLFSStatus()
  }

  public render() {
    if (this.state.isLoading) {
      return (
        <DialogContent>
          <div className="loading-lfs">Loading LFS status…</div>
        </DialogContent>
      )
    }

    if (!this.state.isUsingLFS) {
      return (
        <DialogContent>
          <div className="lfs-init-container">
            <p>
              Git LFS is not initialized for this repository. Initialize it to
              start tracking large files.
            </p>
            <Button onClick={this.onInitializeLFS} type="submit">
              Initialize Git LFS
            </Button>
          </div>
        </DialogContent>
      )
    }

    return (
      <DialogContent>
        <div className="lfs-settings">
          <div className="track-pattern-container">
            <TextBox
              label="Track new pattern (e.g., *.psd, models/*)"
              value={this.state.newPattern}
              onValueChanged={this.onPatternChanged}
              placeholder="e.g. *.psd"
            />
            <Button onClick={this.onTrackPattern}>Track Pattern</Button>
          </div>

          <h2 className="lfs-section-header">Tracked Patterns</h2>
          <div className="tracked-patterns-list">
            {this.state.trackedPatterns.length === 0 ? (
              <p>No patterns tracked yet.</p>
            ) : (
              <ul className="lfs-pattern-list">
                {this.state.trackedPatterns.map(p => (
                  <li key={p} className="lfs-pattern-item">
                    <div className="lfs-pattern-info">
                      <Octicon symbol={octicons.fileBinary} />
                      <span className="lfs-pattern-name">{p}</span>
                    </div>
                    <Button
                      onClick={() => this.onUntrackPattern(p)}
                      tooltip="Untrack pattern"
                    >
                      <Octicon symbol={octicons.trash} />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h2 className="lfs-section-header">LFS Tracked Files</h2>
          <div className="lfs-files-list">
            {this.state.lfsFiles.length === 0 ? (
              <p>No files currently tracked by LFS.</p>
            ) : (
              <div className="lfs-files-table-container">
                <table className="lfs-files-table">
                  <thead>
                    <tr>
                      <th>SHA</th>
                      <th>Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.lfsFiles.map(f => (
                      <tr key={f.path}>
                        <td className="lfs-file-sha">{f.sha.substring(0, 7)}</td>
                        <td className="lfs-file-path">{f.path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    )
  }
}
