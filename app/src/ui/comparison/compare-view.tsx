import * as React from 'react'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import {
  IBranchComparisonState,
  RepositorySectionTab,
} from '../../lib/app-state'
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
import { Account } from '../../models/account'
import { Emoji } from '../../lib/emoji'

interface ICompareViewProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly state: IBranchComparisonState
  readonly emoji: Map<string, Emoji>
  readonly accounts: ReadonlyArray<Account>
  readonly imageDiffType: ImageDiffType
  readonly hideWhitespaceInDiff: boolean
  readonly showSideBySideDiff: boolean
  readonly sidebarWidth: IConstrainedValue
  readonly allBranches: ReadonlyArray<Branch>
  readonly recentBranches: ReadonlyArray<Branch>
  readonly defaultBranch: Branch | null
  readonly currentBranch: Branch | null
  readonly externalEditorLabel?: string
  readonly onOpenInExternalEditor: (path: string) => void
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
    const { state, repository, dispatcher, emoji, accounts } = this.props
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
          >
            <FileList
              files={files}
              onFileSelected={this.onFileSelected}
              selectedFile={selectedFile}
              availableWidth={this.props.sidebarWidth.value}
              externalEditorLabel={this.props.externalEditorLabel}
              onOpenInExternalEditor={this.props.onOpenInExternalEditor}
            />
          </Resizable>

          <SeamlessDiffSwitcher
            repository={repository}
            dispatcher={dispatcher}
            file={selectedFile}
            diff={diff}
            emoji={emoji}
            imageDiffType={this.props.imageDiffType}
            hideWhitespace={this.props.hideWhitespaceInDiff}
            showSideBySide={this.props.showSideBySideDiff}
            accounts={accounts}
          />
        </div>
      </div>
    )
  }

  private onResize = (width: number) => {
    this.props.dispatcher.setSidebarWidth(width)
  }
}
