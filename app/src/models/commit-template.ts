export interface ICommitTemplate {
  readonly id: string
  readonly name: string
  readonly text: string
}

export const ConventionalCommitTemplates: ReadonlyArray<ICommitTemplate> = [
  {
    id: 'feat',
    name: 'Conventional - Feature',
    text: 'feat: \n\n',
  },
  {
    id: 'fix',
    name: 'Conventional - Bug Fix',
    text: 'fix: \n\n',
  },
  {
    id: 'docs',
    name: 'Conventional - Documentation',
    text: 'docs: \n\n',
  },
  {
    id: 'style',
    name: 'Conventional - Style',
    text: 'style: \n\n',
  },
  {
    id: 'refactor',
    name: 'Conventional - Refactor',
    text: 'refactor: \n\n',
  },
  {
    id: 'test',
    name: 'Conventional - Test',
    text: 'test: \n\n',
  },
  {
    id: 'chore',
    name: 'Conventional - Chore',
    text: 'chore: \n\n',
  },
]
