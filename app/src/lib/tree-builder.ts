import * as Path from 'path'
import { WorkingDirectoryFileChange } from '../models/status'
import { DiffSelectionType } from '../models/diff'
import { ITreeNode, TreeNodeKind, IDirectoryNode } from '../models/tree-node'

/**
 * Builds two trees (staged and unstaged) from a list of working directory changes.
 */
export function buildTrees(files: ReadonlyArray<WorkingDirectoryFileChange>): {
  staged: IDirectoryNode
  unstaged: IDirectoryNode
} {
  const stagedRoot: IDirectoryNode = {
    kind: TreeNodeKind.Directory,
    path: '',
    name: 'root',
    children: new Map(),
  }

  const unstagedRoot: IDirectoryNode = {
    kind: TreeNodeKind.Directory,
    path: '',
    name: 'root',
    children: new Map(),
  }

  for (const file of files) {
    const selection = file.selection.getSelectionType()

    if (selection === DiffSelectionType.All || selection === DiffSelectionType.Partial) {
      addFileToTree(stagedRoot, file)
    }

    if (selection === DiffSelectionType.None || selection === DiffSelectionType.Partial) {
      addFileToTree(unstagedRoot, file)
    }
  }

  return { staged: stagedRoot, unstaged: unstagedRoot }
}

function addFileToTree(root: IDirectoryNode, file: WorkingDirectoryFileChange) {
  const components = file.path.split('/')
  let current = root

  for (let i = 0; i < components.length - 1; i++) {
    const component = components[i]
    let node = current.children.get(component)

    if (!node || node.kind !== TreeNodeKind.Directory) {
      const dirPath = components.slice(0, i + 1).join('/')
      node = {
        kind: TreeNodeKind.Directory,
        path: dirPath,
        name: component,
        children: new Map(),
      }
      current.children.set(component, node)
    }
    current = node as IDirectoryNode
  }

  const fileName = components[components.length - 1]
  current.children.set(fileName, {
    kind: TreeNodeKind.File,
    path: file.path,
    name: fileName,
    file,
  })
}

/**
 * Flattens a tree into a sorted array of nodes that should be visible.
 *
 * @param root           The root directory node.
 * @param expandedPaths  A set of paths that are currently expanded.
 * @param depth          The current indentation depth.
 */
export function flattenTree(
  root: IDirectoryNode,
  expandedPaths: ReadonlySet<string>,
  depth: number = 0
): Array<{ node: ITreeNode; depth: number }> {
  const result: Array<{ node: ITreeNode; depth: number }> = []

  // Sort children: directories first, then alphabetically
  const sortedChildren = Array.from(root.children.values()).sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind === TreeNodeKind.Directory ? -1 : 1
    }
    return a.name.localeCompare(b.name)
  })

  for (const child of sortedChildren) {
    result.push({ node: child, depth })

    if (child.kind === TreeNodeKind.Directory && expandedPaths.has(child.path)) {
      result.push(...flattenTree(child, expandedPaths, depth + 1))
    }
  }

  return result
}
