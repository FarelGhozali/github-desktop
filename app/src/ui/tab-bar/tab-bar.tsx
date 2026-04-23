import * as React from 'react'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { Tab } from './tab'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'

interface ITabBarProps {
  readonly dispatcher: Dispatcher
  readonly openRepositories: ReadonlyArray<Repository>
  readonly activeRepositoryIndex: number
}

export class TabBar extends React.Component<ITabBarProps, {}> {
  private onSelectTab = (index: number) => {
    this.props.dispatcher.selectRepositoryTab(index)
  }

  private onCloseTab = (index: number) => {
    this.props.dispatcher.closeRepositoryTab(index)
  }

  private onOpenNewTab = () => {
    this.props.dispatcher.openNewRepositoryTab()
  }

  public render() {
    return (
      <div className="repo-tab-bar">
        <div className="tabs-container">
          {this.props.openRepositories.map((repo, index) => (
            <Tab
              key={`${repo.id}-${index}`}
              repository={repo}
              isActive={index === this.props.activeRepositoryIndex}
              hasUncommittedChanges={false} // Would require passing change state down
              onSelect={() => this.onSelectTab(index)}
              onClose={() => this.onCloseTab(index)}
            />
          ))}
        </div>
        <button
          className="add-tab-button"
          onClick={this.onOpenNewTab}
          title="Open New Tab"
        >
          <Octicon symbol={octicons.plus} />
        </button>
      </div>
    )
  }
}
