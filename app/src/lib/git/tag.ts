import { git } from './core'
import { Repository } from '../../models/repository'
import { IRemote } from '../../models/remote'
import { envForRemoteOperation } from './environment'
import { ITagDetails } from '../../models/tag'
import { createForEachRefParser } from './git-delimiter-parser'

/**
 * Create a new tag on the given target commit.
 *
 * @param repository        - The repository in which to create the new tag.
 * @param name              - The name of the new tag.
 * @param targetCommitSha   - The SHA of the commit where the new tag will live on.
 */
export async function createTag(
  repository: Repository,
  name: string,
  targetCommitSha: string
): Promise<void> {
  const args = ['tag', '-a', '-m', '', name, targetCommitSha]

  await git(args, repository.path, 'createTag')
}

/**
 * Delete a tag.
 *
 * @param repository        - The repository in which to create the new tag.
 * @param name              - The name of the tag to delete.
 */
export async function deleteTag(
  repository: Repository,
  name: string
): Promise<void> {
  const args = ['tag', '-d', name]

  await git(args, repository.path, 'deleteTag')
}

/**
 * Gets all the local tags. Returns a Map with the tag name and the commit it points to.
 *
 * @param repository    The repository in which to get all the tags from.
 */
export async function getAllTags(
  repository: Repository
): Promise<Map<string, string>> {
  const args = ['show-ref', '--tags', '-d']

  const tags = await git(args, repository.path, 'getAllTags', {
    successExitCodes: new Set([0, 1]), // when there are no tags, git exits with 1.
  })

  const tagsArray: Array<[string, string]> = tags.stdout
    .split('\n')
    .filter(line => line !== '')
    .map(line => {
      const [commitSha, rawTagName] = line.split(' ')

      // Normalize tag names by removing the leading ref/tags/ and the trailing ^{}.
      //
      // git show-ref returns two entries for annotated tags:
      // deadbeef refs/tags/annotated-tag
      // de510b99 refs/tags/annotated-tag^{}
      //
      // The first entry sha correspond to the blob object of the annotation, while the second
      // entry corresponds to the actual commit where the tag was created.
      // By normalizing the tag name we can make sure that the commit sha gets stored in the returned
      // Map of commits (since git will always print the entry with the commit sha at the end).
      const tagName = rawTagName
        .replace(/^refs\/tags\//, '')
        .replace(/\^\{\}$/, '')

      return [tagName, commitSha]
    })

  return new Map(tagsArray)
}

/**
 * Gets all tags with details.
 *
 * @param repository The repository in which to get all the tags from.
 */
export async function getAllTagsWithDetails(
  repository: Repository
): Promise<ReadonlyArray<ITagDetails>> {
  const { formatArgs, parse } = createForEachRefParser({
    name: '%(refname:short)',
    commitSha: '%(objectname)',
    message: '%(contents:subject)',
    date: '%(creatordate:iso8601)',
  })

  const result = await git(
    ['for-each-ref', ...formatArgs, 'refs/tags'],
    repository.path,
    'getAllTagsWithDetails'
  )

  const tags = new Array<ITagDetails>()
  for (const ref of parse(result.stdout)) {
    tags.push({
      name: ref.name,
      commitSha: ref.commitSha,
      message: ref.message,
      date: new Date(ref.date),
      isRemote: false, // This only gets local tags
    })
  }

  return tags
}

/**
 * Push a tag to the remote.
 *
 * @param repository The repository in which to push the tag.
 * @param remote     The remote to push the tag to.
 * @param tagName    The name of the tag to push.
 */
export async function pushTag(
  repository: Repository,
  remote: IRemote,
  tagName: string
): Promise<void> {
  const args = ['push', remote.name, `refs/tags/${tagName}`]

  await git(args, repository.path, 'pushTag', {
    env: await envForRemoteOperation(remote.url),
  })
}

/**
 * Delete a tag from the remote.
 *
 * @param repository The repository in which to delete the tag.
 * @param remote     The remote to delete the tag from.
 * @param tagName    The name of the tag to delete.
 */
export async function deleteRemoteTag(
  repository: Repository,
  remote: IRemote,
  tagName: string
): Promise<void> {
  const args = ['push', remote.name, '--delete', `refs/tags/${tagName}`]

  await git(args, repository.path, 'deleteRemoteTag', {
    env: await envForRemoteOperation(remote.url),
  })
}

/**
 * Fetches the tags that will get pushed to the remote repository (it does a network request).
 *
 * @param repository  - The repository in which to check for unpushed tags
 * @param remote      - The remote to check for unpushed tags
 * @param branchName  - The branch that will be used on the push command
 */
export async function fetchTagsToPush(
  repository: Repository,
  remote: IRemote,
  branchName: string
): Promise<ReadonlyArray<string>> {
  const args = [
    'push',
    remote.name,
    branchName,
    '--follow-tags',
    '--dry-run',
    '--no-verify',
    '--porcelain',
  ]

  const result = await git(args, repository.path, 'fetchTagsToPush', {
    env: await envForRemoteOperation(remote.url),
    successExitCodes: new Set([0, 1, 128]),
  })

  if (result.exitCode !== 0 && result.exitCode !== 1) {
    // Only when the exit code of git is 0 or 1, its stdout is parseable.
    // In other cases, we just rethrow the error so our memoization layer
    // doesn't cache it indefinitely.
    throw result.gitError
  }

  const lines = result.stdout.split('\n')
  let currentLine = 1
  const unpushedTags = []

  // the last line of this porcelain command is always 'Done'
  while (currentLine < lines.length && lines[currentLine] !== 'Done') {
    const line = lines[currentLine]
    const parts = line.split('\t')

    if (parts[0] === '*' && parts[2] === '[new tag]') {
      const [tagName] = parts[1].split(':')

      if (tagName !== undefined) {
        unpushedTags.push(tagName.replace(/^refs\/tags\//, ''))
      }
    }

    currentLine++
  }

  return unpushedTags
}
