import * as React from 'react'
import { DialogContent } from '../dialog'
import { TextArea } from '../lib/text-area'
import { LinkButton } from '../lib/link-button'
import { Ref } from '../lib/ref'
import { IIgnoreLine, parseGitIgnore, serializeGitIgnore } from '../../lib/git/ignore-parser'
import { IgnorePatternList } from './ignore-pattern-list'
import { TextBox } from '../lib/text-box'
import { Button } from '../lib/button'
import { v4 as guid } from 'uuid'
import { Select } from '../lib/select'
import { getGitIgnoreNames, getGitIgnoreText } from '../add-repository/gitignores'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'

interface IGitIgnoreProps {
  readonly text: string | null
  readonly onIgnoreTextChanged: (text: string) => void
  readonly onShowExamples: () => void
}

interface IGitIgnoreState {
  readonly isAdvanced: boolean
  readonly lines: ReadonlyArray<IIgnoreLine>
  readonly newPattern: string
  readonly availableTemplates: ReadonlyArray<string>
  readonly selectedTemplate: string
}

/** A view for creating or modifying the repository's gitignore file */
export class GitIgnore extends React.Component<IGitIgnoreProps, IGitIgnoreState> {
  public constructor(props: IGitIgnoreProps) {
    super(props)

    this.state = {
      isAdvanced: true,
      lines: parseGitIgnore(props.text || ''),
      newPattern: '',
      availableTemplates: [],
      selectedTemplate: '',
    }
  }

  public async componentDidMount() {
    const templates = await getGitIgnoreNames()
    this.setState({ availableTemplates: templates })
  }

  public componentWillReceiveProps(nextProps: IGitIgnoreProps) {
    if (nextProps.text !== this.props.text) {
      // Only update lines if they are actually different from what we would serialize
      const currentSerialized = serializeGitIgnore(this.state.lines)
      if (nextProps.text !== currentSerialized) {
        this.setState({ lines: parseGitIgnore(nextProps.text || '') })
      }
    }
  }

  private onToggleMode = () => {
    this.setState({ isAdvanced: !this.state.isAdvanced })
  }

  private onLineChanged = (updatedLine: IIgnoreLine) => {
    const newLines = this.state.lines.map(line => 
      line.id === updatedLine.id ? updatedLine : line
    )
    this.updateLines(newLines)
  }

  private onLineRemoved = (removedLine: IIgnoreLine) => {
    const newLines = this.state.lines.filter(line => line.id !== removedLine.id)
    this.updateLines(newLines)
  }

  private updateLines(lines: ReadonlyArray<IIgnoreLine>) {
    this.setState({ lines })
    this.props.onIgnoreTextChanged(serializeGitIgnore(lines))
  }

  private onAddPattern = () => {
    if (this.state.newPattern.trim() === '') {
      return
    }

    const newLine: IIgnoreLine = {
      id: guid(),
      type: 'pattern',
      content: this.state.newPattern.trim(),
      isActive: true,
    }

    this.updateLines([...this.state.lines, newLine])
    this.setState({ newPattern: '' })
  }

  private onNewPatternChanged = (value: string) => {
    this.setState({ newPattern: value })
  }

  private onTemplateSelected = (event: React.FormEvent<HTMLSelectElement>) => {
    this.setState({ selectedTemplate: event.currentTarget.value })
  }

  private onAddTemplate = async () => {
    if (this.state.selectedTemplate === '') {
      return
    }

    try {
      const templateText = await getGitIgnoreText(this.state.selectedTemplate)
      const templateLines = parseGitIgnore(templateText)
      
      // Add a comment separator
      const separator: IIgnoreLine = {
        id: guid(),
        type: 'comment',
        content: `Template: ${this.state.selectedTemplate}`,
        isActive: true,
      }

      this.updateLines([...this.state.lines, separator, ...templateLines])
    } catch (e) {
      log.error(`Failed to load template ${this.state.selectedTemplate}`, e)
    }
  }

  public render() {
    return (
      <DialogContent className="gitignore-content">
        <div className="gitignore-header">
          <p>
            Editing <Ref>.gitignore</Ref>. This file specifies intentionally
            untracked files that Git should ignore.{' '}
            <LinkButton onClick={this.props.onShowExamples}>
              Learn more
            </LinkButton>
          </p>
          <LinkButton onClick={this.onToggleMode}>
            {this.state.isAdvanced ? 'Switch to Simple View' : 'Switch to Advanced View'}
          </LinkButton>
        </div>

        {this.state.isAdvanced ? this.renderAdvancedView() : this.renderSimpleView()}
      </DialogContent>
    )
  }

  private renderSimpleView() {
    return (
      <TextArea
        placeholder="Ignored files"
        value={this.props.text || ''}
        onValueChanged={this.props.onIgnoreTextChanged}
        textareaClassName="gitignore"
      />
    )
  }

  private renderAdvancedView() {
    return (
      <div className="advanced-ignore-view">
        <div className="add-pattern-row">
          <TextBox
            placeholder="Add new pattern..."
            value={this.state.newPattern}
            onValueChanged={this.onNewPatternChanged}
            onEnterPressed={this.onAddPattern}
          />
          <Button onClick={this.onAddPattern}>Add</Button>
        </div>

        <div className="template-row">
          <Select
            label="Add template"
            value={this.state.selectedTemplate}
            onChange={this.onTemplateSelected}
          >
            <option value="" disabled>Select a template...</option>
            {this.state.availableTemplates.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>
          <Button onClick={this.onAddTemplate} disabled={!this.state.selectedTemplate}>
            <Octicon symbol={octicons.plus} />
          </Button>
        </div>

        <div className="ignore-list-container">
          <IgnorePatternList
            lines={this.state.lines}
            onLineChanged={this.onLineChanged}
            onLineRemoved={this.onLineRemoved}
          />
        </div>
      </div>
    )
  }
}
