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

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    svg.selectAll('*').remove() // Clear previous graph

    const nodes: Node[] = documents.map(d => ({ ...d, id: d.id, title: d.title }))
    const links: Link[] = []

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        links.push({ source: nodes[i], target: nodes[j] })
      }
    }

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))
      .force('link', d3.forceLink(links).id((d: any) => d.id))

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)

    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', d => topResults.some(r => r.id === d.id) ? '#ff0000' : '#1f77b4')

    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text(d => d.title)
      .attr('font-size', '8px')
      .attr('dx', 8)
      .attr('dy', 3)

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

  return <svg ref={svgRef}></svg>
}

