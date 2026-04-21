import * as React from 'react'
import { IDirectoryNode, ITreeNode, TreeNodeKind } from '../../models/tree-node'
import { flattenTree } from '../../lib/tree-builder'
import { List, ClickSource } from '../lib/list'
import { ChangedFile } from './changed-file'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'
import classNames from 'classnames'
import { DiffSelectionType } from '../../models/diff'

interface IChangesTreeViewProps {
  readonly root: IDirectoryNode
  readonly availableWidth: number
  readonly isCommitting: boolean
  readonly selectedFileIDs: ReadonlyArray<string>
  readonly onIncludeChanged: (path: string, include: boolean) => void
  readonly onFileSelectionChanged: (rows: ReadonlyArray<string>) => void
  readonly onRowClick?: (row: number, source: ClickSource) => void
  readonly onRowDoubleClick?: (row: number) => void
  readonly onRowContextMenu?: (node: ITreeNode, event: React.MouseEvent<HTMLDivElement>) => void
  readonly onScroll?: (scrollTop: number, clientHeight: number) => void
  readonly setScrollTop?: number
}

interface IChangesTreeViewState {
  readonly expandedPaths: Set<string>
}

const RowHeight = 29

export class ChangesTreeView extends React.Component<
  IChangesTreeViewProps,
  IChangesTreeViewState
> {
  private listRef = React.createRef<List>()

  public constructor(props: IChangesTreeViewProps) {
    super(props)
    this.state = {
      expandedPaths: new Set<string>(['']), // Root is always expanded (virtual)
    }
  }

  public focus() {
    this.listRef.current?.focus()
  }

  private toggleDirectory = (path: string) => {
    const newExpandedPaths = new Set(this.state.expandedPaths)
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path)
    } else {
      newExpandedPaths.add(path)
    }
    this.setState({ expandedPaths: newExpandedPaths })
  }

  private renderRow = (row: number): JSX.Element => {
    const flattened = flattenTree(this.props.root, this.state.expandedPaths)
    const { node, depth } = flattened[row]

    if (node.kind === TreeNodeKind.Directory) {
      const isExpanded = this.state.expandedPaths.has(node.path)
      const icon = isExpanded ? octicons.chevronDown : octicons.chevronRight
      return (
        <div
          className="directory-node"
          style={{ paddingLeft: depth * 12 + 4 }}
          onClick={() => this.toggleDirectory(node.path)}
          onContextMenu={e => this.props.onRowContextMenu?.(node, e)}
        >
          <Octicon symbol={icon} className="expansion-icon" />
          <Octicon symbol={octicons.fileDirectory} className="directory-icon" />
          <span className="directory-name">{node.name}</span>
        </div>
      )
    } else {
      const file = node.file
      const selection = file.selection.getSelectionType()
      const include =
        selection === DiffSelectionType.All
          ? true
          : selection === DiffSelectionType.None
          ? false
          : null

      return (
        <div
          className="file-node"
          style={{ paddingLeft: depth * 12 }}
          onContextMenu={e => this.props.onRowContextMenu?.(node, e)}
        >
          <ChangedFile
            file={file}
            include={include}
            availableWidth={this.props.availableWidth - depth * 12}
            disableSelection={this.props.isCommitting}
            onIncludeChanged={this.props.onIncludeChanged}
            focused={false}
          />
        </div>
      )
    }
  }

  private onSelectionChanged = (rows: ReadonlyArray<number>) => {
    const flattened = flattenTree(this.props.root, this.state.expandedPaths)
    const selectedIDs = rows
      .map(r => flattened[r].node)
      .filter(n => n.kind === TreeNodeKind.File)
      .map(n => (n as any).file.id)
    this.props.onFileSelectionChanged(selectedIDs)
  }

  public render() {
    const flattened = flattenTree(this.props.root, this.state.expandedPaths)
    const selectedRows = []
    for (let i = 0; i < flattened.length; i++) {
      const node = flattened[i].node
      if (node.kind === TreeNodeKind.File && this.props.selectedFileIDs.includes(node.file.id)) {
        selectedRows.push(i)
      }
    }

    return (
      <div className="changes-tree-view">
        <List
          ref={this.listRef}
          rowCount={flattened.length}
          rowHeight={RowHeight}
          rowRenderer={this.renderRow}
          selectedRows={selectedRows}
          selectionMode="multi"
          onSelectionChanged={this.onSelectionChanged}
          onRowClick={this.props.onRowClick}
          onRowDoubleClick={this.props.onRowDoubleClick}
          onScroll={this.props.onScroll}
          setScrollTop={this.props.setScrollTop}
        />
      </div>
    )
  }
}

