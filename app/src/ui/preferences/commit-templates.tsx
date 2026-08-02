import * as React from 'react'
import { ICommitTemplate } from '../../models/commit-template'
import { Button } from '../lib/button'
import { TextBox } from '../lib/text-box'
import { TextArea } from '../lib/text-area'
import { Row } from '../lib/row'
import { DialogContent } from '../dialog'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { uuid } from '../../lib/uuid'

interface ICommitTemplatesProps {
  readonly templates: ReadonlyArray<ICommitTemplate>
  readonly onAddTemplate: (template: ICommitTemplate) => void
  readonly onRemoveTemplate: (id: string) => void
  readonly onUpdateTemplate: (template: ICommitTemplate) => void
}

interface ICommitTemplatesState {
  readonly newTemplateName: string
  readonly newTemplateText: string
  readonly isAdding: boolean
}

export class CommitTemplates extends React.Component<
  ICommitTemplatesProps,
  ICommitTemplatesState
> {
  public constructor(props: ICommitTemplatesProps) {
    super(props)
    this.state = {
      newTemplateName: '',
      newTemplateText: '',
      isAdding: false,
    }
  }

  private onAddClick = () => {
    this.setState({ isAdding: true })
  }

  private onCancelAdd = () => {
    this.setState({ isAdding: false, newTemplateName: '', newTemplateText: '' })
  }

  private onSaveAdd = () => {
    const { newTemplateName, newTemplateText } = this.state
    if (newTemplateName.trim() === '' || newTemplateText.trim() === '') {
      return
    }

    const newTemplate: ICommitTemplate = {
      id: uuid(),
      name: newTemplateName,
      text: newTemplateText,
    }

    this.props.onAddTemplate(newTemplate)
    this.onCancelAdd()
  }

  private onNewTemplateNameChanged = (name: string) => {
    this.setState({ newTemplateName: name })
  }

  private onNewTemplateTextChanged = (text: string) => {
    this.setState({ newTemplateText: text })
  }

  private onRemoveTemplate = (id: string) => {
    return () => this.props.onRemoveTemplate(id)
  }

  public render() {
    return (
      <DialogContent className="commit-templates-tab">
        <p>
          Custom commit templates allow you to quickly fill the commit message
          with a predefined structure.
        </p>

        <div className="template-list">
          {this.props.templates.map(template => (
            <Row key={template.id} className="template-item">
              <div className="template-info">
                <div className="template-name">{template.name}</div>
              </div>
              <Button onClick={this.onRemoveTemplate(template.id)}>
                <Octicon symbol={octicons.trash} />
              </Button>
            </Row>
          ))}
        </div>

        {this.state.isAdding ? (
          <div className="add-template-form">
            <TextBox
              label="Template Name"
              value={this.state.newTemplateName}
              onValueChanged={this.onNewTemplateNameChanged}
              placeholder="e.g. My Custom Template"
              autoFocus={true}
            />
            <TextArea
              label="Template Text"
              value={this.state.newTemplateText}
              onValueChanged={this.onNewTemplateTextChanged}
              placeholder="e.g. [Tag] Summary&#10;&#10;Description..."
            />
            <Row className="form-actions">
              <Button onClick={this.onSaveAdd} type="submit">
                Save Template
              </Button>
              <Button onClick={this.onCancelAdd}>Cancel</Button>
            </Row>
          </div>
        ) : (
          <Button onClick={this.onAddClick} className="add-button">
            <Octicon symbol={octicons.plus} /> Add New Template
          </Button>
        )}
      </DialogContent>
    )
  }
}
