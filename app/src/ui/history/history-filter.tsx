import * as React from 'react'
import { TextBox } from '../lib/text-box'
import { Repository } from '../../models/repository'
import { Dispatcher } from '../dispatcher'
import { IHistoryFilter } from '../../lib/app-state'
import { Button } from '../lib/button'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'

interface IHistoryFilterProps {
  readonly repository: Repository
  readonly dispatcher: Dispatcher
  readonly historyFilter: IHistoryFilter
}

export class HistoryFilter extends React.Component<IHistoryFilterProps, {}> {
  private onPathChanged = (path: string) => {
    this.props.dispatcher.updateHistoryFilter(this.props.repository, {
      ...this.props.historyFilter,
      path: path.length > 0 ? path : undefined,
    })
  }

  private onAuthorChanged = (author: string) => {
    this.props.dispatcher.updateHistoryFilter(this.props.repository, {
      ...this.props.historyFilter,
      author: author.length > 0 ? author : undefined,
    })
  }

  private onSinceChanged = (sinceStr: string) => {
    const since = sinceStr.length > 0 ? new Date(sinceStr) : undefined
    // Only update if it's a valid date or empty
    if (sinceStr.length === 0 || !isNaN(since?.getTime() ?? 0)) {
      this.props.dispatcher.updateHistoryFilter(this.props.repository, {
        ...this.props.historyFilter,
        dateRange: {
          ...this.props.historyFilter.dateRange,
          since: since,
        },
      })
    }
  }

  private onUntilChanged = (untilStr: string) => {
    const until = untilStr.length > 0 ? new Date(untilStr) : undefined
    if (untilStr.length === 0 || !isNaN(until?.getTime() ?? 0)) {
      this.props.dispatcher.updateHistoryFilter(this.props.repository, {
        ...this.props.historyFilter,
        dateRange: {
          ...this.props.historyFilter.dateRange,
          until: until,
        },
      })
    }
  }

  private onClearFilters = () => {
    this.props.dispatcher.updateHistoryFilter(this.props.repository, {})
  }

  public render() {
    const { path, author, dateRange } = this.props.historyFilter
    const since = dateRange?.since?.toISOString().split('T')[0] ?? ''
    const until = dateRange?.until?.toISOString().split('T')[0] ?? ''

    return (
      <div className="history-filter-view">
        <TextBox
          label="File path"
          placeholder="e.g. app/src/models/commit.ts"
          value={path ?? ''}
          onValueChanged={this.onPathChanged}
        />
        <TextBox
          label="Author"
          placeholder="e.g. FarelGhozali"
          value={author ?? ''}
          onValueChanged={this.onAuthorChanged}
        />
        <div className="history-filter-date-range">
          <TextBox
            label="Since"
            placeholder="e.g. 2023-01-01"
            value={since}
            onValueChanged={this.onSinceChanged}
          />
          <TextBox
            label="Until"
            placeholder="e.g. today"
            value={until}
            onValueChanged={this.onUntilChanged}
          />
        </div>
        <Button onClick={this.onClearFilters} className="clear-filters-button">
          <Octicon symbol={octicons.x} /> Clear Filters
        </Button>
      </div>
    )
  }
}
