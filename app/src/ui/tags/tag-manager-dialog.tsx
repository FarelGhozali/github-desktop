import * as React from 'react'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { ITagDetails } from '../../models/tag'
import { FilterList } from '../lib/filter-list'
import { TagListItem } from './tag-list-item'
import { IMatches } from '../../lib/fuzzy-find'
import { Button } from '../lib/button'
import { Octicon } from '../octicons'
import * as OcticonSymbol from '../octicons/octicons.generated'
import { IFilterListItem } from '../lib/filter-list'

interface ITagFilterItem extends ITagDetails, IFilterListItem {}

interface ITagManagerProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly tags: ReadonlyArray<ITagDetails>
  readonly targetCommitSha: string
  readonly onDismissed: () => void
}

interface ITagManagerState {
  readonly filterText: string
  readonly pushingTags: Set<string>
  readonly deletingTags: Set<string>
}

export class TagManager extends React.Component<ITagManagerProps, ITagManagerState> {
  public constructor(props: ITagManagerProps) {
    super(props)
    this.state = {
      filterText: '',
      pushingTags: new Set(),
      deletingTags: new Set(),
    }
  }

  public render() {
    const items: ReadonlyArray<ITagFilterItem> = this.props.tags.map(t => ({
      ...t,
      text: [t.name],
      id: t.name,
    }))

    return (
      <Dialog
        id="tag-manager"
        title="Manage Tags"
        onDismissed={this.props.onDismissed}
        onSubmit={this.props.onDismissed}
      >
        <DialogContent className="tag-manager-content">
          <div className="tag-manager-header">
            <Button onClick={this.onCreateTag}>
              <Octicon symbol={OcticonSymbol.plus} />
              Create Tag
            </Button>
          </div>
          <FilterList<ITagFilterItem>
            rowHeight={29}
            groups={[{ identifier: 'tags', items }]}
            filterText={this.state.filterText}
            onFilterTextChanged={this.onFilterTextChanged}
            renderItem={this.renderTag}
            selectedItem={null}
            onSelectionChanged={() => {}}
            invalidationProps={this.props.tags}
          />
        </DialogContent>
        <DialogFooter>
          <div className="tag-manager-footer">
            <span>{this.props.tags.length} tags found</span>
          </div>
        </DialogFooter>
      </Dialog>
    )
  }

  private onFilterTextChanged = (filterText: string) => {
    this.setState({ filterText })
  }

  private renderTag = (tag: ITagFilterItem, matches: IMatches) => {
    return (
      <TagListItem
        key={tag.name}
        tag={tag}
        matches={matches}
        onPushTag={this.onPushTag}
        onDeleteTag={this.onDeleteTag}
        onDeleteRemoteTag={this.onDeleteRemoteTag}
        isPushing={this.state.pushingTags.has(tag.name)}
        isDeleting={this.state.deletingTags.has(tag.name)}
      />
    )
  }

  private onCreateTag = () => {
    const { dispatcher, repository, targetCommitSha } = this.props
    const localTags = new Map(this.props.tags.map(t => [t.name, t.commitSha]))

    this.props.onDismissed()
    dispatcher.showCreateTagDialog(repository, targetCommitSha, localTags)
  }

  private onPushTag = async (tag: ITagDetails) => {
    this.setState(s => ({
      pushingTags: new Set(s.pushingTags).add(tag.name),
    }))
    try {
      await this.props.dispatcher.pushTag(this.props.repository, tag.name)
    } finally {
      this.setState(s => {
        const pushingTags = new Set(s.pushingTags)
        pushingTags.delete(tag.name)
        return { pushingTags }
      })
    }
  }

  private onDeleteTag = async (tag: ITagDetails) => {
    this.setState(s => ({
      deletingTags: new Set(s.deletingTags).add(tag.name),
    }))
    try {
      await this.props.dispatcher.deleteTag(this.props.repository, tag.name)
    } finally {
      this.setState(s => {
        const deletingTags = new Set(s.deletingTags)
        deletingTags.delete(tag.name)
        return { deletingTags }
      })
    }
  }

  private onDeleteRemoteTag = async (tag: ITagDetails) => {
    this.setState(s => ({
      deletingTags: new Set(s.deletingTags).add(tag.name),
    }))
    try {
      await this.props.dispatcher.deleteRemoteTag(this.props.repository, tag.name)
    } finally {
      this.setState(s => {
        const deletingTags = new Set(s.deletingTags)
        deletingTags.delete(tag.name)
        return { deletingTags }
      })
    }
  }
}
