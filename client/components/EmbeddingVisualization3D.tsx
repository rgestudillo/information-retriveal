'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2, Maximize2 } from 'lucide-react'
import * as d3 from 'd3'

interface EmbeddingPoint {
    id: string
    title: string
    content: string
    x: number
    y: number
    z: number  // We'll need this from backend
}

interface SearchResult {
    id: string
    title: string
    content: string
    relevance_score: number
}

interface EmbeddingVisualization3DProps {
    searchResults: SearchResult[]
}

export default function EmbeddingVisualization3D({ searchResults = [] }: EmbeddingVisualization3DProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [embeddings, setEmbeddings] = useState<EmbeddingPoint[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hoveredDoc, setHoveredDoc] = useState<EmbeddingPoint | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        fetchEmbeddings()
    }, [])

    useEffect(() => {
        if (embeddings.length > 0) {
            initScene()
        }
    }, [embeddings, searchResults, isFullscreen])

    const fetchEmbeddings = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:8000/document_embeddings_3d')
            const data = await response.json()
            setEmbeddings(data)
        } catch (error) {
            console.error('Error fetching embeddings:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const initScene = () => {
        if (!containerRef.current) return

        // Scene setup
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0xffffff)

        // Camera setup
        const camera = new THREE.PerspectiveCamera(
            75,
            containerRef.current.clientWidth / containerRef.current.clientHeight,
            0.1,
            1000
        )
        camera.position.z = 5

        // Renderer setup
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        containerRef.current.innerHTML = ''
        containerRef.current.appendChild(renderer.domElement)

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
        scene.add(ambientLight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(10, 10, 10)
        scene.add(directionalLight)

        // Create points
        const points = new THREE.Group()

        // Scale factors
        const xScale = d3.scaleLinear()
            .domain([d3.min(embeddings, d => d.x) || 0, d3.max(embeddings, d => d.x) || 0])
            .range([-2, 2])
        const yScale = d3.scaleLinear()
            .domain([d3.min(embeddings, d => d.y) || 0, d3.max(embeddings, d => d.y) || 0])
            .range([-2, 2])
        const zScale = d3.scaleLinear()
            .domain([d3.min(embeddings, d => d.z) || 0, d3.max(embeddings, d => d.z) || 0])
            .range([-2, 2])

        // Add points
        embeddings.forEach(point => {
            const isResult = searchResults.some(result => result.id === point.id)
            const geometry = new THREE.SphereGeometry(isResult ? 0.08 : 0.04)
            const material = new THREE.MeshPhongMaterial({
                color: isResult ? 0xff4444 : 0x1f77b4,
                opacity: isResult ? 1 : 0.6,
                transparent: true,
            })
            const sphere = new THREE.Mesh(geometry, material)
            sphere.position.set(
                xScale(point.x),
                yScale(point.y),
                zScale(point.z)
            )
            sphere.userData = point
            points.add(sphere)
        })

        // Add connections between search results
        if (searchResults.length > 0) {
            const resultPoints = embeddings.filter(p =>
                searchResults.some(r => r.id === p.id)
            )

            resultPoints.forEach((point1, i) => {
                resultPoints.slice(i + 1).forEach(point2 => {
                    const geometry = new THREE.BufferGeometry().setFromPoints([
                        new THREE.Vector3(xScale(point1.x), yScale(point1.y), zScale(point1.z)),
                        new THREE.Vector3(xScale(point2.x), yScale(point2.y), zScale(point2.z))
                    ])
                    const material = new THREE.LineBasicMaterial({
                        color: 0xff4444,
                        opacity: 0.5,
                        transparent: true
                    })
                    const line = new THREE.Line(geometry, material)
                    points.add(line)
                })
            })
        }

        scene.add(points)

        // Add coordinate axes
        const axesHelper = new THREE.AxesHelper(3)
        scene.add(axesHelper)

        // Raycaster for interaction
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2()

        // Mouse move handler
        const onMouseMove = (event: MouseEvent) => {
            const rect = renderer.domElement.getBoundingClientRect()
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

            raycaster.setFromCamera(mouse, camera)
            const intersects = raycaster.intersectObjects(points.children.filter(obj => obj instanceof THREE.Mesh))

            if (intersects.length > 0) {
                const point = intersects[0].object as THREE.Mesh
                setHoveredDoc(point.userData)
            } else {
                setHoveredDoc(null)
            }
        }

        renderer.domElement.addEventListener('mousemove', onMouseMove)

        // Animation loop
        const animate = () => {
            requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        // Cleanup
        return () => {
            renderer.domElement.removeEventListener('mousemove', onMouseMove)
            renderer.dispose()
        }
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    return (
        <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>3D Document Embeddings Visualization</span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={toggleFullscreen}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
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
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <div
                        ref={containerRef}
                        className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}
                    />
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
                                {searchResults.some(r => r.id === hoveredDoc.id) && (
                                    <span className="ml-2 text-red-500">
                                        (Score: {searchResults.find(r => r.id === hoveredDoc.id)?.relevance_score.toFixed(3)})
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