'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as d3 from 'd3'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Loader2, Maximize2, Play } from 'lucide-react'
import { Slider } from './ui/slider'

interface EmbeddingPoint {
    id: string
    title: string
    content: string
    x: number
    y: number
    z: number
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
    const sceneRef = useRef<{
        scene: THREE.Scene
        camera: THREE.PerspectiveCamera
        renderer: THREE.WebGLRenderer
        controls: OrbitControls
    } | null>(null)
    const [embeddings, setEmbeddings] = useState<EmbeddingPoint[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hoveredDoc, setHoveredDoc] = useState<EmbeddingPoint | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const [animationSpeed, setAnimationSpeed] = useState(1)

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

        // Store scene reference
        sceneRef.current = { scene, camera, renderer, controls }

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

        // Window resize handler
        const handleResize = () => {
            if (!containerRef.current) return
            camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
            camera.updateProjectionMatrix()
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
        }
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            renderer.dispose()
        }
    }

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    const animateSearchTraversal = () => {
        if (!sceneRef.current || searchResults.length === 0) return
        setIsAnimating(true)

        const { scene } = sceneRef.current
        const duration = 1000 / animationSpeed // milliseconds per step

        // Reset all materials
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                const material = object.material as THREE.MeshPhongMaterial
                material.color.set(0x1f77b4)
                material.opacity = 0.6
            }
            if (object instanceof THREE.Line) {
                object.visible = false
            }
        })

        // Animate each result sequentially
        searchResults.forEach((result, index) => {
            setTimeout(() => {
                // Find the corresponding mesh
                scene.traverse((object) => {
                    if (object instanceof THREE.Mesh && object.userData.id === result.id) {
                        const material = object.material as THREE.MeshPhongMaterial

                        // Pulse animation
                        const startScale = object.scale.x
                        const pulseAnimation = new THREE.AnimationMixer(object)
                        const track = new THREE.VectorKeyframeTrack(
                            '.scale',
                            [0, 0.5, 1],
                            [
                                startScale, startScale, startScale,
                                startScale * 1.5, startScale * 1.5, startScale * 1.5,
                                startScale, startScale, startScale
                            ]
                        )
                        const clip = new THREE.AnimationClip('pulse', 1, [track])
                        const action = pulseAnimation.clipAction(clip)
                        action.setLoop(THREE.LoopOnce, 1)
                        action.play()

                        // Update material
                        material.color.set(0xff4444)
                        material.opacity = 1

                        // Show connection to previous result
                        if (index > 0) {
                            const prevResult = searchResults[index - 1]
                            scene.traverse((prevObject) => {
                                if (prevObject instanceof THREE.Mesh && prevObject.userData.id === prevResult.id) {
                                    const line = new THREE.Line(
                                        new THREE.BufferGeometry().setFromPoints([
                                            object.position,
                                            prevObject.position
                                        ]),
                                        new THREE.LineBasicMaterial({
                                            color: 0xff4444,
                                            opacity: 0.5,
                                            transparent: true
                                        })
                                    )
                                    scene.add(line)
                                }
                            })
                        }
                    }
                })

                // Add floating score label
                const resultMesh = scene.children.find(
                    (child) => child instanceof THREE.Mesh && child.userData.id === result.id
                ) as THREE.Mesh
                if (resultMesh) {
                    const score = result.relevance_score.toFixed(3)
                    const sprite = new THREE.Sprite(
                        new THREE.SpriteMaterial({
                            map: createTextTexture(`#${index + 1} (${score})`),
                            sizeAttenuation: false
                        })
                    )
                    sprite.position.copy(resultMesh.position)
                    sprite.position.y += 0.2
                    sprite.scale.set(0.1, 0.1, 1)
                    scene.add(sprite)
                }

            }, index * duration)
        })

        // Reset animation state
        setTimeout(() => {
            setIsAnimating(false)
        }, searchResults.length * duration)
    }

    const createTextTexture = (text: string) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        canvas.width = 256
        canvas.height = 64

        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, canvas.width, canvas.height)

        context.font = '24px Arial'
        context.fillStyle = '#ff4444'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(text, canvas.width / 2, canvas.height / 2)

        const texture = new THREE.CanvasTexture(canvas)
        texture.needsUpdate = true
        return texture
    }

    return (
        <Card className={isFullscreen ? 'fixed inset-4 z-50' : ''}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>3D Document Embeddings Visualization</span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Animation Speed</span>
                            <Slider
                                className="w-32"
                                min={0.5}
                                max={2}
                                step={0.1}
                                value={[animationSpeed]}
                                onValueChange={([value]) => setAnimationSpeed(value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={animateSearchTraversal}
                            disabled={isAnimating || searchResults.length === 0}
                        >
                            <Play className="h-4 w-4 mr-2" />
                            Animate Results
                        </Button>
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