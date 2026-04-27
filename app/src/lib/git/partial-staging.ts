import * as FS from 'fs/promises'
import * as Path from 'path'
import * as OS from 'os'
import { git } from './core'
import { Repository } from '../../models/repository'

/**
 * Menerima string berformat *unified diff/patch* dari Frontend dan mengeksekusinya ke staging area.
 * @param repository The repository in which to apply the patch
 * @param patch The diff/patch string to apply
 * @param isUnstage Whether to reverse the patch
 */
export async function applyPatchToIndex(
  repository: Repository,
  patch: string,
  isUnstage: boolean
): Promise<void> {
  const tempDir = await FS.mkdtemp(Path.join(OS.tmpdir(), 'desktop-patch-'))
  const patchPath = Path.join(tempDir, 'partial.patch')

  try {
    await FS.writeFile(patchPath, patch, 'utf8')

    const args = ['apply', '--cached', '--whitespace=nowarn']
    
    if (isUnstage) {
      args.push('--reverse')
    }

    // Apply the patch from temp file
    args.push(patchPath)

    await git(args, repository.path, 'applyPatchToIndex')
  } catch (error) {
    if (error instanceof Error && error.message.includes('patch does not apply')) {
      throw new Error('File has been modified, please refresh')
    }
    throw error
  } finally {
    // Membersihkan kembali file sementara setelah selesai
    await FS.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}
