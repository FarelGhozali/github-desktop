import * as React from 'react'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { IBranchComparisonState } from '../../lib/app-state'
import { Branch } from '../../models/branch'
import { CommittedFileChange } from '../../models/status'
import { ImageDiffType } from '../../models/diff'
import { FileList } from '../history/file-list'
import { SeamlessDiffSwitcher } from '../diff/seamless-diff-switcher'
import { Resizable } from '../resizable'
import { IConstrainedValue } from '../../lib/app-state'
import { BranchSelect } from '../branches/branch-select'
import { Button } from '../lib/button'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'

interface ICompareViewProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly state: IBranchComparisonState
  readonly imageDiffType: ImageDiffType
  readonly hideWhitespaceInDiff: boolean
  readonly showSideBySideDiff: boolean
  readonly sidebarWidth: IConstrainedValue
  readonly allBranches: ReadonlyArray<Branch>
  readonly recentBranches: ReadonlyArray<Branch>
  readonly defaultBranch: Branch | null
  readonly currentBranch: Branch | null
}

export class CompareView extends React.Component<ICompareViewProps> {
  private onBaseBranchChange = (branch: Branch) => {
    this.props.dispatcher.enterBranchComparisonMode(
      this.props.repository,
      branch,
      this.props.state.comparisonBranch
    )
  }

  private onComparisonBranchChange = (branch: Branch) => {
    this.props.dispatcher.enterBranchComparisonMode(
      this.props.repository,
      this.props.state.baseBranch,
      branch
    )
  }

  private onSwapBranches = () => {
    this.props.dispatcher.swapBranchComparisonBranches(this.props.repository)
  }

  private onExit = () => {
    this.props.dispatcher.exitBranchComparisonMode(this.props.repository)
  }

  private onFileSelected = (file: CommittedFileChange) => {
    this.props.dispatcher.changeBranchComparisonFileSelection(
      this.props.repository,
      file
    )
  }

  public render() {
    const { state, repository } = this.props
    const { baseBranch, comparisonBranch, files, selectedFile, diff } = state

    return (
      <div id="compare-view">
        <div className="compare-header">
          <div className="branch-selectors">
            <BranchSelect
              branch={baseBranch}
              allBranches={this.props.allBranches}
              recentBranches={this.props.recentBranches}
              defaultBranch={this.props.defaultBranch}
              currentBranch={this.props.currentBranch!}
              onChange={this.onBaseBranchChange}
              label="base:"
              contentTitle="Choose a base branch"
            />
            <Button
              className="swap-button"
              onClick={this.onSwapBranches}
              tooltip="Swap branches"
            >
              <Octicon symbol={octicons.sync} />
            </Button>
            <BranchSelect
              branch={comparisonBranch}
              allBranches={this.props.allBranches}
              recentBranches={this.props.recentBranches}
              defaultBranch={this.props.defaultBranch}
              currentBranch={this.props.currentBranch!}
              onChange={this.onComparisonBranchChange}
              label="compare:"
              contentTitle="Choose a branch to compare"
            />
          </div>
          <Button onClick={this.onExit}>
            <Octicon symbol={octicons.x} />
            Exit Comparison
          </Button>
        </div>

        <div className="compare-content">
          <Resizable
            width={this.props.sidebarWidth.value}
            onResize={this.onResize}
            onReset={this.noop}
          >
            <FileList
              onRowDoubleClick={this.noop}
              files={files}
              onSelectedFileChanged={this.onFileSelected as any}
              selectedFile={selectedFile as any}
              availableWidth={this.props.sidebarWidth.value}
            />
          </Resizable>

          {selectedFile !== null ? (
            <SeamlessDiffSwitcher
              repository={repository}
              file={selectedFile as any}
              diff={diff}
              imageDiffType={this.props.imageDiffType}
              hideWhitespaceInDiff={this.props.hideWhitespaceInDiff}
              showSideBySideDiff={this.props.showSideBySideDiff}
              readOnly={true}
              onOpenBinaryFile={this.noop}
              onChangeImageDiffType={this.noop}
              showDiffCheckMarks={false}
              onHideWhitespaceInDiffChanged={this.noop}
            />
          ) : (
            <div className="panel blankslate" id="diff">
              No file selected
            </div>
          )}
        </div>
      </div>
    )
  }

  private noop = () => {}

  private onResize = (width: number) => {
    this.props.dispatcher.setSidebarWidth(width)
  }
}
