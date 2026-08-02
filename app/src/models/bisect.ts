import { Commit } from './commit'

/** The different states a bisect session can be in. */
export enum BisectStepKind {
  /** The bisect has started and is currently searching for the culprit. */
  Bisecting = 'Bisecting',
  /** The bisect has finished and the culprit commit has been found. */
  CulpritFound = 'CulpritFound',
  /** The bisect has finished because no culprit could be found. */
  NoCulpritFound = 'NoCulpritFound',
}

/** The state of an ongoing git bisect session. */
export interface IBisectState {
  /** The current step of the bisect process. */
  readonly kind: BisectStepKind
  /** The commit currently being tested. */
  readonly currentCommit: Commit | null
  /** The culprit commit, if found. */
  readonly culprit: Commit | null
  /**
   * The number of revisions left to test (roughly).
   * Parsed from "roughly X steps" or "X revisions left".
   */
  readonly revisionsLeft: number | null
  /**
   * The number of steps remaining (roughly).
   */
  readonly stepsLeft: number | null
}
