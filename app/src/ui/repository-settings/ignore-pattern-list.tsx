import * as React from 'react'
import { IIgnoreLine } from '../../lib/git/ignore-parser'
import { Checkbox, CheckboxValue } from '../lib/checkbox'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import { Button } from '../lib/button'

interface IIgnorePatternListProps {
  readonly lines: ReadonlyArray<IIgnoreLine>
  readonly onLineChanged: (line: IIgnoreLine) => void
  readonly onLineRemoved: (line: IIgnoreLine) => void
}

export class IgnorePatternList extends React.Component<IIgnorePatternListProps> {
  public render() {
    return (
      <div className="ignore-pattern-list">
        {this.props.lines.map(line => this.renderLine(line))}
      </div>
    )
  }

  private renderLine(line: IIgnoreLine) {
    if (line.type === 'empty') {
      return <div key={line.id} className="ignore-line empty" />
    }

    if (line.type === 'comment') {
      return (
        <div key={line.id} className="ignore-line comment">
          <span className="comment-content"># {line.content}</span>
          <Button
             className="remove-button"
             onClick={() => this.props.onLineRemoved(line)}
             tooltip="Remove comment"
          >
            <Octicon symbol={octicons.trash} />
          </Button>
        </div>
      )
    }

    return (
      <div key={line.id} className="ignore-line pattern">
        <Checkbox
          label=""
          value={line.isActive ? CheckboxValue.On : CheckboxValue.Off}
          onChange={(event) => this.onToggleLine(line, event)}
        />
        <input
          className="pattern-input"
          value={line.content}
          onChange={(event) => this.onContentChanged(line, event)}
          disabled={!line.isActive}
        />
        <Button
          className="remove-button"
          onClick={() => this.props.onLineRemoved(line)}
          tooltip="Remove pattern"
        >
          <Octicon symbol={octicons.trash} />
        </Button>
      </div>
    )
  }

  private onToggleLine = (line: IIgnoreLine, event: React.FormEvent<HTMLInputElement>) => {
    const isActive = event.currentTarget.checked
    this.props.onLineChanged({ ...line, isActive })
  }

  private onContentChanged = (line: IIgnoreLine, event: React.FormEvent<HTMLInputElement>) => {
    const content = event.currentTarget.value
    this.props.onLineChanged({ ...line, content })
  }
}

