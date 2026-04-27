import * as React from 'react'
import { Repository } from '../../models/repository'
import { applyPatchToIndex } from '../../lib/git/partial-staging'

interface IPartialStagingViewProps {
  readonly repository: Repository
  readonly patch: string
}

interface IPartialStagingViewState {
  readonly isStaging: boolean
  readonly error: Error | null
}

export class PartialStagingView extends React.Component<IPartialStagingViewProps, IPartialStagingViewState> {
  public constructor(props: IPartialStagingViewProps) {
    super(props)
    this.state = {
      isStaging: false,
      error: null
    }
  }

  private onStageSelected = async () => {
    this.setState({ isStaging: true, error: null })
    try {
      await applyPatchToIndex(this.props.repository, this.props.patch, false)
      // Disini kita bisa memanggil fungsi untuk me-refresh status git
    } catch (e) {
      if (e instanceof Error) {
        this.setState({ error: e })
      }
    } finally {
      this.setState({ isStaging: false })
    }
  }

  public render() {
    return (
      <div className="partial-staging-container">
        <button 
          disabled={this.state.isStaging} 
          onClick={this.onStageSelected}>
          {this.state.isStaging ? 'Staging...' : 'Stage Selected Lines'}
        </button>
        {this.state.error && <div className="error">{this.state.error.message}</div>}
      </div>
    )
  }
}
