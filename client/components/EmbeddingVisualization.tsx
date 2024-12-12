'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'

interface EmbeddingPoint {
    id: string
    title: string
    content: string
    x: number
    y: number
}

interface SearchResult {
    id: string
    title: string
    content: string
    relevance_score: number
}

interface EmbeddingVisualizationProps {
    searchResults: SearchResult[]
}

export default function EmbeddingVisualization({ searchResults = [] }: EmbeddingVisualizationProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [embeddings, setEmbeddings] = useState<EmbeddingPoint[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hoveredDoc, setHoveredDoc] = useState<EmbeddingPoint | null>(null)

    useEffect(() => {
        fetchEmbeddings()
    }, [])

    useEffect(() => {
        if (embeddings.length > 0) {
            drawVisualization(embeddings)
        }
    }, [searchResults, embeddings])

    const fetchEmbeddings = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:8000/document_embeddings')
            const data = await response.json()
            setEmbeddings(data)
            drawVisualization(data)
        } catch (error) {
            console.error('Error fetching embeddings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const isSearchResult = (docId: string) => {
        return searchResults.some(result => result.id === docId)
    }

    const getRelevanceScore = (docId: string) => {
        const result = searchResults.find(result => result.id === docId)
        return result?.relevance_score || 0
    }

    const drawVisualization = (data: EmbeddingPoint[]) => {
        if (!svgRef.current) return

        // Clear previous visualization
        d3.select(svgRef.current).selectAll('*').remove()

        const width = 800
        const height = 600
        const margin = { top: 20, right: 20, bottom: 20, left: 20 }

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.x) || 0, d3.max(data, d => d.x) || 0])
            .range([margin.left, width - margin.right])

        const yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.y) || 0, d3.max(data, d => d.y) || 0])
            .range([height - margin.bottom, margin.top])

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 5])
            .on('zoom', (event) => {
                container.attr('transform', event.transform)
            })

        svg.call(zoom as any)

        // Create container for zoom
        const container = svg.append('g')

        // Draw connections between search results
        if (searchResults.length > 0) {
            const resultPoints = data.filter(d => isSearchResult(d.id))

            // Draw lines between search results
            resultPoints.forEach((point1, i) => {
                resultPoints.slice(i + 1).forEach(point2 => {
                    container.append('line')
                        .attr('x1', xScale(point1.x))
                        .attr('y1', yScale(point1.y))
                        .attr('x2', xScale(point2.x))
                        .attr('y2', yScale(point2.y))
                        .attr('stroke', '#ff4444')
                        .attr('stroke-opacity', 0.5)
                        .attr('stroke-width', 2)
                })
            })
        }

        // Draw points
        container.selectAll('circle')
            .data(data)
            .join('circle')
            .attr('cx', d => xScale(d.x))
            .attr('cy', d => yScale(d.y))
            .attr('r', d => isSearchResult(d.id) ? 10 : 5)
            .attr('fill', d => isSearchResult(d.id) ? '#ff4444' : '#1f77b4')
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('opacity', d => isSearchResult(d.id) ? 1 : 0.6)
            .on('mouseover', (event, d) => {
                setHoveredDoc(d)
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr('r', d => isSearchResult(d.id) ? 12 : 7)
                    .attr('opacity', 1)
            })
            .on('mouseout', (event, d) => {
                setHoveredDoc(null)
                d3.select(event.currentTarget)
                    .transition()
                    .duration(200)
                    .attr('r', d => isSearchResult(d.id) ? 10 : 5)
                    .attr('opacity', d => isSearchResult(d.id) ? 1 : 0.6)
            })

        // Add labels for search results
        container.selectAll('text')
            .data(data.filter(d => isSearchResult(d.id)))
            .join('text')
            .attr('x', d => xScale(d.x))
            .attr('y', d => yScale(d.y) - 15)
            .text(d => `${d.title} (${getRelevanceScore(d.id).toFixed(3)})`)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#ff4444')
            .attr('font-weight', 'bold')

        // Add legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 150}, 20)`)

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 5)
            .attr('fill', '#1f77b4')
            .attr('opacity', 0.6)

        legend.append('text')
            .attr('x', 15)
            .attr('y', 5)
            .text('Document')
            .attr('font-size', '12px')

        legend.append('circle')
            .attr('cx', 0)
            .attr('cy', 25)
            .attr('r', 8)
            .attr('fill', '#ff4444')

        legend.append('text')
            .attr('x', 15)
            .attr('y', 30)
            .text('Search Result')
            .attr('font-size', '12px')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Document Embeddings Visualization (t-SNE)</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchEmbeddings}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Refresh'
                        )}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <svg ref={svgRef} />
                    {hoveredDoc && (
                        <div
                            className="absolute bg-white/95 p-3 rounded-lg shadow-lg border max-w-[300px]"
                            style={{
                                left: '20px',
                                top: '20px'
                            }}
                        >
                            <h4 className="font-semibold mb-1">
                                {hoveredDoc.title}
                                {isSearchResult(hoveredDoc.id) && (
                                    <span className="ml-2 text-red-500">
                                        (Score: {getRelevanceScore(hoveredDoc.id).toFixed(3)})
                                    </span>
                                )}
                            </h4>
                            <p className="text-sm text-gray-600">{hoveredDoc.content}</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 