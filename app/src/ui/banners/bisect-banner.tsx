import * as React from 'react'
import { Banner } from './banner'
import { IBisectState, BisectStepKind } from '../../models/bisect'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { Button } from '../lib/button'
import { ButtonGroup } from '../lib/button-group'
import { Octicon, OcticonSymbol } from '../octicons'

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
      <Banner className="bisect-banner" dismissable={false}>
        <div className="bisect-banner-content">
          <Octicon className="icon" symbol={OcticonSymbol.search} />
          <div className="bisect-banner-text">
            <strong>{title}</strong>
            <div className="bisect-banner-details">{commitInfo}</div>
          </div>

          <ButtonGroup>
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
          </ButtonGroup>
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
