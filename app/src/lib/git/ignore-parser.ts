import { v4 as guid } from 'uuid'

export interface IIgnoreLine {
  readonly id: string
  readonly type: 'pattern' | 'comment' | 'empty'
  readonly content: string
  readonly isActive: boolean
}

/**
 * Parses the contents of a .gitignore file into a list of IIgnoreLine objects.
 */
export function parseGitIgnore(text: string): ReadonlyArray<IIgnoreLine> {
  const lines = text.split(/\r?\n/)
  const result: IIgnoreLine[] = []

  for (const line of lines) {
    if (line.trim() === '') {
      result.push({
        id: guid(),
        type: 'empty',
        content: '',
        isActive: true,
      })
      continue
    }

    if (line.startsWith('#')) {
      const content = line.substring(1).trim()
      // If the comment looks like a disabled pattern (starts with a space),
      // we could potentially treat it as such.
      // But for simplicity, let's see if it's just a regular comment or a disabled pattern.
      // A disabled pattern usually looks like `# pattern`
      
      // Let's check if there's a space after #. If so, it might be a disabled pattern or a comment.
      // The PRD says: "aplikasi akan menambahkan karakter # di depan baris tersebut agar menjadi comment"
      
      if (line.startsWith('# ')) {
        const potentialPattern = line.substring(2).trim()
        if (potentialPattern.length > 0 && !potentialPattern.startsWith('#')) {
          result.push({
            id: guid(),
            type: 'pattern',
            content: potentialPattern,
            isActive: false,
          })
          continue
        }
      }

      result.push({
        id: guid(),
        type: 'comment',
        content: line.substring(1).trim(),
        isActive: true,
      })
    } else {
      result.push({
        id: guid(),
        type: 'pattern',
        content: line.trim(),
        isActive: true,
      })
    }
  }

  return result
}

/**
 * Serializes a list of IIgnoreLine objects back into a .gitignore file string.
 */
export function serializeGitIgnore(lines: ReadonlyArray<IIgnoreLine>): string {
  return lines
    .map(line => {
      if (line.type === 'empty') {
        return ''
      }
      if (line.type === 'comment') {
        return `# ${line.content}`
      }
      if (line.type === 'pattern') {
        return line.isActive ? line.content : `# ${line.content}`
      }
      return ''
    })
    .join('\n')
}
