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
  const todoContentArray = await Promise.all(
    todoItems.map(async item => {
      if (item.action === 'reword') {
        const newMessage = item.newMessage ?? item.commit.summary
        const newBody = item.newBody ?? item.commit.body
        const fullMessage = newBody ? `${newMessage}\n\n${newBody}` : newMessage
        
        const fs = require('fs/promises')
        const OS = require('os')
        const tempDir = await Path.join(OS.tmpdir(), `desktop-reword-${Date.now()}-${Math.random().toString(36).substring(7)}`)
        await fs.mkdir(tempDir, { recursive: true })
        const msgPath = Path.join(tempDir, 'message.txt')
        await fs.writeFile(msgPath, fullMessage)
        
        // Escape the file path just in case, though it shouldn't contain spaces normally in tmpdir
        const escapeShellArg = (arg: string) => `'${arg.replace(/'/g, "'\\''")}'`
        const execCmd = `exec git commit --amend -F ${escapeShellArg(msgPath)}`
        
        return `pick ${item.commit.sha} ${item.commit.summary}\n${execCmd}`
      }
      return `${item.action} ${item.commit.sha} ${item.commit.summary}`
    })
  )
  const todoContent = todoContentArray.join('\n')

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
