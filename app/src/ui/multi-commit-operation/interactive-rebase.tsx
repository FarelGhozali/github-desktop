import React from 'react'
import {
  MultiCommitOperationKind,
  MultiCommitOperationStepKind,
} from '../../models/multi-commit-operation'
import { BaseRebase } from './base-rebase'
import { InteractiveRebaseEditorDialog } from './dialog/interactive-rebase-editor-dialog'
import { instanceOfIBaseRebaseDetails } from '../../models/multi-commit-operation'

export class InteractiveRebase extends BaseRebase {
  protected conflictDialogOperationPrefix = 'interactively rebasing'
  protected rebaseKind = MultiCommitOperationKind.InteractiveRebase

  protected onBeginOperation = () => {
    // This is not used for interactive rebase as it's started from the editor dialog
    this.endFlowInvalidState()
  }

  protected onChooseBranch = () => {
    this.endFlowInvalidState()
  }

  protected renderChooseBranch = () => {
    this.endFlowInvalidState()
    return null
  }

  protected renderCreateBranch = () => {
    this.endFlowInvalidState()
    return null
  }

  protected renderInteractiveRebaseEditor = (): JSX.Element | null => {
    const { repository, dispatcher, state } = this.props
    const { step, operationDetail } = state

    if (step.kind !== MultiCommitOperationStepKind.InteractiveRebaseEditor) {
      this.endFlowInvalidState()
      return null
    }

    if (!instanceOfIBaseRebaseDetails(operationDetail)) {
      this.endFlowInvalidState()
      return null
    }

    return (
      <InteractiveRebaseEditorDialog
        key="interactive-rebase-editor"
        dispatcher={dispatcher}
        repository={repository}
        commits={operationDetail.commits}
        onDismissed={this.onFlowEnded}
      />
    )
  }
}
