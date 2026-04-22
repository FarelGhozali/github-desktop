import * as React from 'react'
import { ITagDetails } from '../../models/tag'
import { IMatches } from '../../lib/fuzzy-find'
import { HighlightText } from '../lib/highlight-text'
import { Octicon } from '../octicons'
import * as OcticonSymbol from '../octicons/octicons.generated'
import { Button } from '../lib/button'
import { RelativeTime } from '../relative-time'

interface ITagListItemProps {
  readonly tag: ITagDetails
  readonly matches: IMatches
  readonly onPushTag: (tag: ITagDetails) => void
  readonly onDeleteTag: (tag: ITagDetails) => void
  readonly onDeleteRemoteTag: (tag: ITagDetails) => void
  readonly isPushing: boolean
  readonly isDeleting: boolean
}

export class TagListItem extends React.PureComponent<ITagListItemProps> {
  public render() {
    const { tag, matches } = this.props

    return (
      <div className="tag-list-item">
        <div className="tag-info">
          <div className="tag-name">
            <Octicon symbol={OcticonSymbol.tag} />
            <HighlightText text={tag.name} highlight={matches.title} />
          </div>
          <div className="tag-meta">
            {tag.message && <span className="tag-message">{tag.message}</span>}
            <span className="tag-date">
              <RelativeTime date={tag.date} />
            </span>
          </div>
        </div>
        <div className="tag-actions">
          <Button
            size="small"
            onClick={this.onPush}
            disabled={this.props.isPushing || this.props.isDeleting}
            tooltip="Push tag to remote"
          >
            <Octicon symbol={OcticonSymbol.arrowUp} />
          </Button>
          <Button
            size="small"
            onClick={this.onDelete}
            disabled={this.props.isPushing || this.props.isDeleting}
            tooltip="Delete local tag"
          >
            <Octicon symbol={OcticonSymbol.trash} />
          </Button>
          <Button
            size="small"
            onClick={this.onDeleteRemote}
            disabled={this.props.isPushing || this.props.isDeleting}
            tooltip="Delete remote tag"
          >
            <Octicon symbol={OcticonSymbol.globe} />
          </Button>
        </div>
      </div>
    )
  }

  private onPush = () => {
    this.props.onPushTag(this.props.tag)
  }

  private onDelete = () => {
    this.props.onDeleteTag(this.props.tag)
  }

  private onDeleteRemote = () => {
    this.props.onDeleteRemoteTag(this.props.tag)
  }
}
