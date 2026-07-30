import { Repository } from '../../models/repository'
import { rebaseInteractive, RebaseResult } from './rebase'
import { IRebaseTodoItem } from '../../models/rebase-todo'
import * as Path from 'path'
import * as OS from 'os'
import { IMultiCommitOperationProgress } from '../../models/progress'

/**
 * Perform an interactive rebase by generating a todo file from the provided items.
 *
 * @param repository The repository to perform the rebase in.
 * @param todoItems  The list of actions and commits to include in the todo file.
 * @param lastRetainedCommitRef The ref (SHA) of the commit before the first one in the todo list.
 */
export async function performInteractiveRebase(
  repository: Repository,
  todoItems: ReadonlyArray<IRebaseTodoItem>,
  lastRetainedCommitRef: string | null,
  progressCallback?: (progress: IMultiCommitOperationProgress) => void
): Promise<RebaseResult> {
  const todoContent = todoItems
    .map(item => {
      if (item.action === 'reword') {
        const newMessage = item.newMessage ?? item.commit.summary
        const escapeShellArg = (arg: string) => `'${arg.replace(/'/g, "'\\''")}'`
        
        let execCmd = `exec git commit --amend -m ${escapeShellArg(newMessage)}`
        const body = item.newBody ?? item.commit.body
        if (body) {
          execCmd += ` -m ${escapeShellArg(body)}`
        }
        
        return `pick ${item.commit.sha} ${item.commit.summary}\n${execCmd}`
      }
      return `${item.action} ${item.commit.sha} ${item.commit.summary}`
    })
    .join('\n')

  const tempDir = await writeFileToTempFile(todoContent)
  const todoPath = Path.join(tempDir, 'git-rebase-todo')

  try {
    return await rebaseInteractive(
      repository,
      todoPath,
      lastRetainedCommitRef,
      'Interactive rebase',
      ':',
      progressCallback,
      todoItems.map(i => i.commit)
    )
  } finally {
    // We should clean up the temp file/dir but we'll leave it for now
    // as it's in the OS temp dir anyway.
  }
}

async function writeFileToTempFile(content: string): Promise<string> {
  const tempDir = await Path.join(OS.tmpdir(), `desktop-rebase-${Date.now()}`)
  const fs = require('fs/promises')
  await fs.mkdir(tempDir, { recursive: true })
  await fs.writeFile(Path.join(tempDir, 'git-rebase-todo'), content)
  return tempDir
}
