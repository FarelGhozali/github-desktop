export interface IReflogEntry {
  readonly sha: string
  readonly shortSha: string
  readonly selector: string
  readonly action: string
  readonly description: string
  readonly date: Date
}
