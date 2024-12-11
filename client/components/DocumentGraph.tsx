'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface Document {
  id: string
  title: string
  content: string
  relevance_score: number
}

interface Node extends d3.SimulationNodeDatum {
  id: string
  title: string
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: Node
  target: Node
}

interface DocumentGraphProps {
  documents: Document[]
  topResults: Document[]
}

export default function DocumentGraph({ documents, topResults }: DocumentGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || documents.length === 0) return

    const width = 800
    const height = 600

    // Clear previous graph
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
    svg.selectAll('*').remove()

    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
      })
    svg.call(zoom as any)

    // Create container for zoom
    const container = svg.append('g')

    const nodes: Node[] = documents.map(d => ({ ...d, id: d.id, title: d.title }))
    const links: Link[] = []

    // Create links only between top results and their neighbors
    topResults.forEach((result, i) => {
      nodes.forEach(node => {
        if (result.id !== node.id) {
          links.push({ source: nodes.find(n => n.id === result.id)!, target: node })
        }
      })
    })

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))

    // Draw links with varying opacity
    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', 1)

    // Create node group for better organization
    const nodeGroup = container.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')

    // Add circles with different sizes based on relevance
    const node = nodeGroup
      .append('circle')
      .attr('r', d => {
        const result = topResults.find(r => r.id === d.id)
        return result ? 20 + result.relevance_score * 20 : 8
      })
      .attr('fill', d => {
        const result = topResults.find(r => r.id === d.id)
        return result ? '#ff4444' : '#1f77b4'
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)

    // Add labels with better visibility
    const label = nodeGroup
      .append('text')
      .text(d => {
        const result = topResults.find(r => r.id === d.id)
        return result ? `${d.title} (${result.relevance_score.toFixed(2)})` : d.title
      })
      .attr('font-size', d => topResults.some(r => r.id === d.id) ? '12px' : '8px')
      .attr('dx', d => topResults.some(r => r.id === d.id) ? 25 : 12)
      .attr('dy', '.35em')
      .attr('fill', d => topResults.some(r => r.id === d.id) ? '#000' : '#666')

    // Add hover interactions
    nodeGroup
      .on('mouseover', function () {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('stroke', '#000')
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .attr('font-size', '14px')
      })
      .on('mouseout', function (_, d) {
        d3.select(this).select('circle')
          .transition()
          .duration(200)
          .attr('stroke', '#fff')
        d3.select(this).select('text')
          .transition()
          .duration(200)
          .attr('font-size', topResults.some(r => r.id === d.id) ? '12px' : '8px')
      })

    // Add drag behavior
    nodeGroup.call(d3.drag<any, any>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }) as any)

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y)

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)

      label
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)
    })

  }, [documents, topResults])

  return (
    <div className="relative">
      <svg ref={svgRef}></svg>
      <div className="absolute top-2 right-2 text-sm text-gray-500">
        Tip: Scroll to zoom, drag nodes to rearrange
      </div>
    </div>
  )
}

