import * as React from 'react'
import { IGraphRow } from '../../models/history-graph'

interface ICommitGraphProps {
  /** The graph information for this specific row */
  readonly graphRow: IGraphRow
  /** Height of the row in pixels */
  readonly height: number
}

const ColumnWidth = 12
const DotRadius = 4
const LineWidth = 2

const GraphColors = [
  '#FF5252', // Red
  '#448AFF', // Blue
  '#4CAF50', // Green
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FF9800', // Orange
  '#795548', // Brown
  '#607D8B', // Blue Grey
  '#E91E63', // Pink
]

/**
 * A component that renders the branching graph for a single commit row.
 */
export class CommitGraph extends React.PureComponent<ICommitGraphProps> {
  private getX(column: number): number {
    return (column + 0.5) * ColumnWidth
  }

  public render() {
    const { graphRow, height } = this.props
    const width = Math.max(1, graphRow.columns.length) * ColumnWidth
    const centerY = height / 2

    return (
      <svg
        className="commit-graph"
        style={{ width, height }}
        viewBox={`0 0 ${width} ${height}`}
      >
        {this.renderInboundEdges(centerY)}
        {this.renderOutboundEdges(centerY, height)}
        {this.renderNode(centerY)}
      </svg>
    )
  }

  private renderInboundEdges(centerY: number) {
    return this.props.graphRow.inboundEdges.map((edge, i) => {
      const x1 = this.getX(edge.fromColumn)
      const y1 = 0
      const x2 = this.getX(edge.toColumn)
      const y2 = centerY

      return (
        <path
          key={`in-${i}`}
          d={this.getBezierPath(x1, y1, x2, y2)}
          stroke={GraphColors[edge.colorIndex % GraphColors.length]}
          strokeWidth={LineWidth}
          fill="none"
        />
      )
    })
  }

  private renderOutboundEdges(centerY: number, height: number) {
    return this.props.graphRow.outboundEdges.map((edge, i) => {
      const x1 = this.getX(edge.fromColumn)
      const y1 = centerY
      const x2 = this.getX(edge.toColumn)
      const y2 = height

      return (
        <path
          key={`out-${i}`}
          d={this.getBezierPath(x1, y1, x2, y2)}
          stroke={GraphColors[edge.colorIndex % GraphColors.length]}
          strokeWidth={LineWidth}
          fill="none"
        />
      )
    })
  }

  private renderNode(centerY: number) {
    const { node } = this.props.graphRow
    const x = this.getX(node.column)
    return (
      <circle
        cx={x}
        cy={centerY}
        r={DotRadius}
        fill={GraphColors[node.colorIndex % GraphColors.length]}
        stroke="var(--background-color)"
        strokeWidth={1}
      />
    )
  }

  /**
   * Generates a cubic bezier path between two points.
   */
  private getBezierPath(x1: number, y1: number, x2: number, y2: number): string {
    if (x1 === x2) {
      return `M ${x1} ${y1} L ${x2} ${y2}`
    }

    const controlPointY = (y1 + y2) / 2
    return `M ${x1} ${y1} C ${x1} ${controlPointY} ${x2} ${controlPointY} ${x2} ${y2}`
  }
}
