import * as React from 'react'
import { ICommitTemplate } from '../../models/commit-template'
import { Button } from '../lib/button'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { showContextualMenu, IMenuItem } from '../../lib/menu-item'

interface ICommitTemplateSelectorProps {
  readonly templates: ReadonlyArray<ICommitTemplate>
  readonly onSelectTemplate: (template: ICommitTemplate) => void
  readonly disabled?: boolean
}

export class CommitTemplateSelector extends React.Component<ICommitTemplateSelectorProps> {
  private onButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    const items: IMenuItem[] = this.props.templates.map(template => ({
      label: template.name,
      action: () => this.props.onSelectTemplate(template),
    }))

    showContextualMenu(items)
  }

  public render() {
    return (
      <Button
        className="commit-template-selector"
        onClick={this.onButtonClick}
        ariaLabel="Select a commit template"
        tooltip="Select a commit template"
        disabled={this.props.disabled}
      >
        <Octicon symbol={octicons.fileText} />
      </Button>
    )
  }
}
