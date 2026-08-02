import * as React from 'react'
import { Banner } from './banner'
import { IBisectState, BisectStepKind } from '../../models/bisect'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { Button } from '../lib/button'
import * as octicons from '../octicons/octicons.generated'
import { Octicon } from '../octicons'

interface IBisectBannerProps {
  readonly repository: Repository
  readonly bisectState: IBisectState
  readonly dispatcher: Dispatcher
}

export class BisectBanner extends React.Component<IBisectBannerProps> {
  public render() {
    const { bisectState } = this.props
    const { currentCommit, kind } = bisectState

    const title = kind === BisectStepKind.CulpritFound 
      ? 'Culprit found!' 
      : 'Bisecting in progress'

    const commitInfo = currentCommit 
      ? `Testing commit ${currentCommit.sha.substring(0, 7)}: ${currentCommit.summary}`
      : 'No commit currently selected'

    return (
      <Banner id="bisect-banner" dismissable={false} onDismissed={this.onReset}>
        <div className="bisect-banner-content">
          <Octicon className="icon" symbol={octicons.search} />
          <div className="bisect-banner-text">
            <strong>{title}</strong>
            <div className="bisect-banner-details">{commitInfo}</div>
          </div>

          <div className="button-group">
            {kind === BisectStepKind.Bisecting && (
              <>
                <Button onClick={this.onMarkGood}>Good</Button>
                <Button onClick={this.onMarkBad}>Bad</Button>
                <Button onClick={this.onSkip}>Skip</Button>
              </>
            )}
            <Button onClick={this.onReset}>
              {kind === BisectStepKind.CulpritFound ? 'Reset' : 'Abort'}
            </Button>
          </div>
        </div>
      </Banner>
    )
  }

  private onMarkGood = () => {
    this.props.dispatcher.markBisectGood(this.props.repository)
  }

  private onMarkBad = () => {
    this.props.dispatcher.markBisectBad(this.props.repository)
  }

  private onSkip = () => {
    this.props.dispatcher.skipBisect(this.props.repository)
  }

  private onReset = () => {
    this.props.dispatcher.resetBisect(this.props.repository)
  }
}
