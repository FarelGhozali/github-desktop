import { git } from './core'
import { Repository } from '../../models/repository'

/** Install the global LFS filters. */
export async function installGlobalLFSFilters(force: boolean): Promise<void> {
  const args = ['lfs', 'install', '--skip-repo']
  if (force) {
    args.push('--force')
  }

  await git(args, __dirname, 'installGlobalLFSFilter')
}

/** Install LFS hooks in the repository. */
export async function installLFSHooks(
  repository: Repository,
  force: boolean
): Promise<void> {
  const args = ['lfs', 'install']
  if (force) {
    args.push('--force')
  }

  await git(args, repository.path, 'installLFSHooks')
}

/** Is the repository configured to track any paths with LFS? */
export async function isUsingLFS(repository: Repository): Promise<boolean> {
  const env = {
    GIT_LFS_TRACK_NO_INSTALL_HOOKS: '1',
  }
  const result = await git(['lfs', 'track'], repository.path, 'isUsingLFS', {
    env,
  })
  return result.stdout.length > 0
}

/** Get the list of tracked patterns from Git LFS. */
export async function getLFSTrackedPatterns(
  repository: Repository
): Promise<ReadonlyArray<string>> {
  const env = {
    GIT_LFS_TRACK_NO_INSTALL_HOOKS: '1',
  }
  const result = await git(['lfs', 'track'], repository.path, 'getLFSTrackedPatterns', {
    env,
  })

  // Output format of `git lfs track`:
  // Listing tracked patterns
  //     *.psd (.gitattributes)
  //     *.mp4 (.gitattributes)
  const lines = result.stdout.split('\n')
  const patterns = new Array<string>()
  const patternRegex = /^\s+(.*)\s+\(.gitattributes\)$/

  for (const line of lines) {
    const match = patternRegex.exec(line)
    if (match) {
      patterns.push(match[1])
    }
  }

  return patterns
}

/** Track a new pattern with Git LFS. */
export async function trackPattern(
  repository: Repository,
  pattern: string
): Promise<void> {
  await git(['lfs', 'track', pattern], repository.path, 'trackPattern')
  await git(['add', '.gitattributes'], repository.path, 'stageGitAttributes')
}

/** Untrack a pattern from Git LFS. */
export async function untrackPattern(
  repository: Repository,
  pattern: string
): Promise<void> {
  await git(['lfs', 'untrack', pattern], repository.path, 'untrackPattern')
  await git(['add', '.gitattributes'], repository.path, 'stageGitAttributes')
}

/**
 * The metadata about a file tracked by Git LFS.
 */
export interface ILFSFile {
  readonly sha: string
  readonly path: string
}

/** Get the list of files tracked by Git LFS. */
export async function getLFSFiles(
  repository: Repository
): Promise<ReadonlyArray<ILFSFile>> {
  const result = await git(['lfs', 'ls-files'], repository.path, 'getLFSFiles')
  
  // Output format of `git lfs ls-files`:
  // <sha> * <path>
  // <sha> - <path>
  const lines = result.stdout.split('\n')
  const files = new Array<ILFSFile>()
  
  for (const line of lines) {
    const parts = line.split(' ')
    if (parts.length >= 3) {
      files.push({ sha: parts[0], path: parts.slice(2).join(' ') })
    }
  }
  
  return files
}

/**
 * Check if a provided file path is being tracked by Git LFS
 *
 * This uses the Git plumbing to read the .gitattributes file
 * for any LFS-related rules that are set for the file
 *
 * @param repository repository with
 * @param path relative file path in the repository
 */
export async function isTrackedByLFS(
  repository: Repository,
  path: string
): Promise<boolean> {
  const { stdout } = await git(
    ['check-attr', 'filter', path],
    repository.path,
    'checkAttrForLFS'
  )

  // "git check-attr -a" will output every filter it can find in .gitattributes
  // and it looks like this:
  //
  // README.md: diff: lfs
  // README.md: merge: lfs
  // README.md: text: unset
  // README.md: filter: lfs
  //
  // To verify git-lfs this test will just focus on that last row, "filter",
  // and the value associated with it. If nothing is found in .gitattributes
  // the output will look like this
  //
  // README.md: filter: unspecified

  const lfsFilterRegex = /: filter: lfs/

  const match = lfsFilterRegex.exec(stdout)

  return match !== null
}

/**
 * Query a Git repository and filter the set of provided relative paths to see
 * which are not covered by the current Git LFS configuration.
 *
 * @param repository
 * @param filePaths List of relative paths in the repository
 */
export async function filesNotTrackedByLFS(
  repository: Repository,
  filePaths: ReadonlyArray<string>
): Promise<ReadonlyArray<string>> {
  const filesNotTrackedByGitLFS = new Array<string>()

  for (const file of filePaths) {
    const isTracked = await isTrackedByLFS(repository, file)

    if (!isTracked) {
      filesNotTrackedByGitLFS.push(file)
    }
  }

  return filesNotTrackedByGitLFS
}
