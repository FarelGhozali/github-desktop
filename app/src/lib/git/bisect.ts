import { git } from './core'
import { Repository } from '../../models/repository'
import { BisectStepKind, IBisectState } from '../../models/bisect'
import { getCommit } from './log'
import * as Path from 'path'
import { pathExists } from '../../ui/lib/path-exists'

/**
 * Check if a bisect operation is currently underway.
 */
export async function isBisecting(repository: Repository): Promise<boolean> {
  const path = Path.join(repository.path, '.git', 'BISECT_START')
  return pathExists(path)
}

/**
 * Get the current state of an ongoing bisect operation.
 */
export async function getBisectState(
  repository: Repository
): Promise<IBisectState | null> {
  const active = await isBisecting(repository)
  if (!active) {
    return null
  }

  // We use 'git bisect visualize' or 'git rev-parse HEAD' to get the current commit
  // but 'git bisect log' or parsing stdout of 'git bisect' is better for status.
  // For now, let's get the current HEAD.
  const currentCommit = await getCommit(repository, 'HEAD')

  // Parse the output of 'git bisect status' (which doesn't exist, we use a trick)
  // Actually, 'git bisect visualize' gives us the range.
  
  // A better way to get progress is to run a "no-op" bisect command or parse log.
  // For now, let's just return a basic state. We'll refine progress parsing later.
  
  return {
    kind: BisectStepKind.Bisecting,
    currentCommit,
    culprit: null,
    revisionsLeft: null,
    stepsLeft: null,
  }
}

/** Start a new bisect session. */
export async function startBisect(
  repository: Repository,
  badRevision: string = 'HEAD',
  goodRevision?: string
): Promise<void> {
  const args = ['bisect', 'start', badRevision]
  if (goodRevision) {
    args.push(goodRevision)
  }
  await git(args, repository.path, 'startBisect')
}

/** Mark the current (or specified) revision as good. */
export async function markBisectGood(
  repository: Repository,
  revision: string = 'HEAD'
): Promise<string> {
  const result = await git(['bisect', 'good', revision], repository.path, 'markBisectGood')
  return result.stdout
}

/** Mark the current (or specified) revision as bad. */
export async function markBisectBad(
  repository: Repository,
  revision: string = 'HEAD'
): Promise<string> {
  const result = await git(['bisect', 'bad', revision], repository.path, 'markBisectBad')
  return result.stdout
}

/** Skip the current (or specified) revision. */
export async function skipBisect(
  repository: Repository,
  revision: string = 'HEAD'
): Promise<string> {
  const result = await git(['bisect', 'skip', revision], repository.path, 'skipBisect')
  return result.stdout
}

/** Reset the bisect session and return to the original branch. */
export async function resetBisect(repository: Repository): Promise<void> {
  await git(['bisect', 'reset'], repository.path, 'resetBisect')
}
