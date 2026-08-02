export enum SubmoduleStatus {
  /** The submodule is initialized and up to date */
  UpToDate = 'UpToDate',
  /** The submodule is not initialized */
  NotInitialized = 'NotInitialized',
  /** The submodule has local changes or is out of sync with the index */
  OutOfSync = 'OutOfSync',
  /** The submodule has merge conflicts */
  Conflict = 'Conflict',
  /** The submodule status is unknown */
  Unknown = 'Unknown',
}

export class SubmoduleEntry {
  public constructor(
    public readonly sha: string,
    public readonly path: string,
    public readonly describe: string,
    public readonly status: SubmoduleStatus,
    public readonly url?: string
  ) {}
}
