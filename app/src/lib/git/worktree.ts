import { git } from './core'
import { Repository } from '../../models/repository'

export interface IWorktree {
  readonly path: string
  readonly head: string
  readonly branch?: string
  readonly isDetached: boolean
  readonly isLocked: boolean
}

/**
 * Get the list of worktrees for a repository.
 */
export async function getWorktrees(
  repository: Repository
): Promise<ReadonlyArray<IWorktree>> {
  const result = await git(
    ['worktree', 'list', '--porcelain'],
    repository.path,
    'getWorktrees'
  )

  const worktrees: IWorktree[] = []
  const lines = result.stdout.split('\n')

  let currentPath: string | null = null
  let currentHead: string | null = null
  let currentBranch: string | null = null
  let isDetached = false
  let isLocked = false

  for (const line of lines) {
    if (line.startsWith('worktree ')) {
      if (currentPath !== null && currentHead !== null) {
        worktrees.push({
          path: currentPath,
          head: currentHead,
          branch: currentBranch || undefined,
          isDetached,
          isLocked,
        })
      }
      currentPath = line.substring(9).trim()
      currentHead = null
      currentBranch = null
      isDetached = false
      isLocked = false
    } else if (line.startsWith('HEAD ')) {
      currentHead = line.substring(5).trim()
    } else if (line.startsWith('branch ')) {
      currentBranch = line.substring(7).trim()
      if (currentBranch.startsWith('refs/heads/')) {
        currentBranch = currentBranch.substring(11)
      }
    } else if (line === 'detached') {
      isDetached = true
    } else if (line === 'locked') {
      isLocked = true
    }
  }

  if (currentPath !== null && currentHead !== null) {
    worktrees.push({
      path: currentPath,
      head: currentHead,
      branch: currentBranch || undefined,
      isDetached,
      isLocked,
    })
  }

  return worktrees
}

/**
 * Add a new worktree.
 */
export async function addWorktree(
  repository: Repository,
  path: string,
  branch: string
): Promise<void> {
  await git(
    ['worktree', 'add', path, branch],
    repository.path,
    'addWorktree'
  )
}

/**
 * Remove a worktree.
 */
export async function removeWorktree(
  repository: Repository,
  path: string,
  force: boolean = false
): Promise<void> {
  const args = ['worktree', 'remove']
  if (force) {
    args.push('--force')
  }
  args.push(path)

  await git(args, repository.path, 'removeWorktree')
}

/**
 * Prune worktree information.
 */
export async function pruneWorktrees(repository: Repository): Promise<void> {
  await git(['worktree', 'prune'], repository.path, 'pruneWorktrees')
}
