import * as Path from 'path'

import { git } from './core'
import { Repository } from '../../models/repository'
import { SubmoduleEntry, SubmoduleStatus } from '../../models/submodule'
import { pathExists } from '../../ui/lib/path-exists'

function parseStatus(char: string): SubmoduleStatus {
  switch (char) {
    case ' ':
      return SubmoduleStatus.UpToDate
    case '-':
      return SubmoduleStatus.NotInitialized
    case '+':
      return SubmoduleStatus.OutOfSync
    case 'U':
      return SubmoduleStatus.Conflict
    default:
      return SubmoduleStatus.Unknown
  }
}

async function getSubmoduleURLs(
  repository: Repository
): Promise<Map<string, string>> {
  const { stdout } = await git(
    ['config', '--file', '.gitmodules', '--get-regexp', 'url'],
    repository.path,
    'getSubmoduleURLs',
    { successExitCodes: new Set([0, 1]) }
  )

  const urls = new Map<string, string>()
  const lines = stdout.split('\n')
  for (const line of lines) {
    const match = line.match(/^submodule\.(.*)\.url (.*)$/)
    if (match) {
      const [, name, url] = match
      urls.set(name, url)
    }
  }
  return urls
}

async function getSubmoduleNamePathMap(
  repository: Repository
): Promise<Map<string, string>> {
  const { stdout } = await git(
    ['config', '--file', '.gitmodules', '--get-regexp', 'path'],
    repository.path,
    'getSubmoduleNamePathMap',
    { successExitCodes: new Set([0, 1]) }
  )

  const paths = new Map<string, string>()
  const lines = stdout.split('\n')
  for (const line of lines) {
    const match = line.match(/^submodule\.(.*)\.path (.*)$/)
    if (match) {
      const [, name, path] = match
      paths.set(path, name)
    }
  }
  return paths
}

export async function listSubmodules(
  repository: Repository
): Promise<ReadonlyArray<SubmoduleEntry>> {
  const [submodulesFile, submodulesDir] = await Promise.all([
    pathExists(Path.join(repository.path, '.gitmodules')),
    pathExists(Path.join(repository.path, '.git', 'modules')),
  ])

  if (!submodulesFile && !submodulesDir) {
    return []
  }

  const { stdout, exitCode } = await git(
    ['submodule', 'status', '--recursive'],
    repository.path,
    'listSubmodules',
    { successExitCodes: new Set([0, 128]) }
  )

  if (exitCode === 128) {
    return []
  }

  const [urlsByName, namesByPath] = await Promise.all([
    getSubmoduleURLs(repository),
    getSubmoduleNamePathMap(repository),
  ])

  const submodules = new Array<SubmoduleEntry>()
  const lines = stdout.split('\n')

  for (const line of lines) {
    if (line.length === 0) continue

    const char = line[0]
    const sha = line.substring(1, 41)
    const rest = line.substring(42)
    const describeMatch = rest.match(/(.*) \((.*)\)$/)

    let path = rest
    let describe = ''

    if (describeMatch) {
      path = describeMatch[1]
      describe = describeMatch[2]
    }

    const name = namesByPath.get(path)
    const url = name ? urlsByName.get(name) : undefined

    submodules.push(
      new SubmoduleEntry(sha, path, describe, parseStatus(char), url)
    )
  }

  return submodules
}

export async function initAndUpdateSubmodules(
  repository: Repository
): Promise<void> {
  await git(
    ['submodule', 'update', '--init', '--recursive'],
    repository.path,
    'initAndUpdateSubmodules'
  )
}

export async function syncSubmodules(repository: Repository): Promise<void> {
  await git(['submodule', 'sync', '--recursive'], repository.path, 'syncSubmodules')
}

export async function addSubmodule(
  repository: Repository,
  url: string,
  path: string
): Promise<void> {
  await git(
    ['submodule', 'add', '--', url, path],
    repository.path,
    'addSubmodule'
  )
}

export async function resetSubmodulePaths(
  repository: Repository,
  paths: ReadonlyArray<string>
): Promise<void> {
  if (paths.length === 0) {
    return
  }

  await git(
    ['submodule', 'update', '--recursive', '--force', '--', ...paths],
    repository.path,
    'resetSubmodulePaths'
  )
}
