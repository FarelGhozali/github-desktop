/**
 * Represents a connection between two commits in the graph.
 */
export interface IGraphEdge {
  /** The starting column index of the edge */
  readonly fromColumn: number
  /** The ending column index of the edge */
  readonly toColumn: number
  /** The color index for this edge */
  readonly colorIndex: number
}

/**
 * Represents the node (the commit dot) in a graph row.
 */
export interface IGraphNode {
  /** The column index where the dot is placed */
  readonly column: number
  /** The color index for this node */
  readonly colorIndex: number
}

/**
 * Represents all graphical information for a single commit row.
 */
export interface IGraphRow {
  /** The node (dot) for this commit */
  readonly node: IGraphNode
  /** Edges coming from the previous row into this row */
  readonly inboundEdges: ReadonlyArray<IGraphEdge>
  /** Edges going from this row into the next row */
  readonly outboundEdges: ReadonlyArray<IGraphEdge>
  /** SHAs currently occupying columns in this row (used for state tracking) */
  readonly columns: ReadonlyArray<string | null>
}
