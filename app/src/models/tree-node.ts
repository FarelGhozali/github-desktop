import { WorkingDirectoryFileChange } from './status'

/**
 * The type of a tree node.
 */
export enum TreeNodeKind {
  Directory = 'Directory',
  File = 'File',
}

/**
 * A node in a file tree.
 */
export type ITreeNode = IDirectoryNode | IFileNode

/**
 * A directory node in a file tree.
 */
export interface IDirectoryNode {
  readonly kind: TreeNodeKind.Directory
  /** The full path relative to the repository root. */
  readonly path: string
  /** The name of the directory (last component of path). */
  readonly name: string
  /** The children of this directory. */
  readonly children: Map<string, ITreeNode>
}

/**
 * A file node in a file tree.
 */
export interface IFileNode {
  readonly kind: TreeNodeKind.File
  /** The full path relative to the repository root. */
  readonly path: string
  /** The name of the file (last component of path). */
  readonly name: string
  /** The file change information from the working directory. */
  readonly file: WorkingDirectoryFileChange
}
