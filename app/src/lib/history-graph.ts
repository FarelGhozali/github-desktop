import { Commit } from '../models/commit'
import { IGraphRow, IGraphEdge } from '../models/history-graph'

/**
 * Builds the graph layout for a list of commits.
 *
 * @param commits Ordered list of commits (newest first).
 */
export function buildGraph(commits: ReadonlyArray<Commit>): ReadonlyArray<IGraphRow> {
  const rows: IGraphRow[] = []
  let activeSHAs: (string | null)[] = []
  const shaToColorIndex = new Map<string, number>()
  let nextColorIndex = 0

  for (let i = 0; i < commits.length; i++) {
    const commit = commits[i]
    const sha = commit.sha

    // 1. Determine column for the current commit
    let columnIndex = activeSHAs.indexOf(sha)
    if (columnIndex === -1) {
      // New branch tip detected (likely the head of a branch)
      columnIndex = activeSHAs.length
      activeSHAs.push(sha)
    }

    if (!shaToColorIndex.has(sha)) {
      shaToColorIndex.set(sha, nextColorIndex % 10)
      nextColorIndex++
    }

    const colorIndex = shaToColorIndex.get(sha)!

    // 2. Prepare the columns state for this row BEFORE modifications
    const columnsBefore = [...activeSHAs]

    // 3. Process parents to update activeSHAs for the NEXT row
    // A commit "consumes" its own SHA and "produces" its parents' SHAs.
    const inboundEdges: IGraphEdge[] = []
    const outboundEdges: IGraphEdge[] = []

    // Edges from previous row to current row (straight lines for existing branches)
    for (let col = 0; col < columnsBefore.length; col++) {
      const colSha = columnsBefore[col]
      if (colSha !== null) {
        inboundEdges.push({
          fromColumn: col,
          toColumn: col,
          colorIndex: shaToColorIndex.get(colSha) ?? 0,
        })
      }
    }

    // Update activeSHAs for next row
    const nextActiveSHAs = [...activeSHAs]
    const parents = commit.parentSHAs

    if (parents.length === 0) {
      // Root commit - branch ends here
      nextActiveSHAs[columnIndex] = null
    } else {
      // First parent takes the current column
      const firstParent = parents[0]
      nextActiveSHAs[columnIndex] = firstParent
      if (!shaToColorIndex.has(firstParent)) {
        shaToColorIndex.set(firstParent, colorIndex) // Keep branch color
      }

      // Additional parents (merges) get new columns
      for (let j = 1; j < parents.length; j++) {
        const otherParent = parents[j]
        let parentCol = nextActiveSHAs.indexOf(otherParent)
        if (parentCol === -1) {
          parentCol = nextActiveSHAs.length
          nextActiveSHAs.push(otherParent)
        }

        if (!shaToColorIndex.has(otherParent)) {
          shaToColorIndex.set(otherParent, nextColorIndex % 10)
          nextColorIndex++
        }

        // Outbound edge for the merge connection
        outboundEdges.push({
          fromColumn: columnIndex,
          toColumn: parentCol,
          colorIndex: shaToColorIndex.get(otherParent)!,
        })
      }
    }

    // Straight outbound edges for all continuing branches
    for (let col = 0; col < nextActiveSHAs.length; col++) {
      const nextSha = nextActiveSHAs[col]
      if (nextSha !== null) {
        // If this column wasn't just added as a merge parent above
        if (outboundEdges.every(e => e.toColumn !== col)) {
          outboundEdges.push({
            fromColumn: col,
            toColumn: col,
            colorIndex: shaToColorIndex.get(nextSha) ?? 0,
          })
        }
      }
    }

    rows.push({
      node: { column: columnIndex, colorIndex },
      inboundEdges,
      outboundEdges,
      columns: columnsBefore,
    })

    activeSHAs = nextActiveSHAs

    // Compact activeSHAs if trailing elements are null
    while (activeSHAs.length > 0 && activeSHAs[activeSHAs.length - 1] === null) {
      activeSHAs.pop()
    }
  }

  return rows
}
