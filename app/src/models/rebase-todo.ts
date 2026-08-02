import { Commit } from './commit'

/** The actions that can be performed on a commit during an interactive rebase. */
export type RebaseAction =
  | 'pick'
  | 'reword'
  | 'edit'
  | 'squash'
  | 'fixup'
  | 'drop'

/** An item in an interactive rebase todo list. */
export interface IRebaseTodoItem {
  /** The action to perform on the commit. */
  readonly action: RebaseAction
  /** The commit to perform the action on. */
  readonly commit: Commit
  /** Optional new message for reword action */
  readonly newMessage?: string
  /** Optional new body for reword action */
  readonly newBody?: string
}
