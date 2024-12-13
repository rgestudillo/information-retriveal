'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DatasetInfo from './DatasetInfo'
import TfidfMatrix from './TfidfMatrix'
import SearchResults from './SearchResults'
import { Loader2, Search, Info, Database, Network, Play, MessageSquare } from 'lucide-react'
import DatasetManager from './DatasetManager'
import EmbeddingVisualization3D from './EmbeddingVisualization3D'
import RAGTab from './RAGTab'

interface Document {
  id: string
  title: string
  content: string
  relevance_score: number
}

interface TfidfWeight {
  term: string
  weight: number
}

export default function IRVisualization() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Document[]>([])
  const [queryWeights, setQueryWeights] = useState<TfidfWeight[]>([])
  const [datasetInfo, setDatasetInfo] = useState<any>(null)
  const [tfidfMatrix, setTfidfMatrix] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchDatasetInfo()
    fetchTfidfMatrix()
  }, [])

  const fetchDatasetInfo = async () => {
    const response = await fetch('https://information-retriveal-2nf3.vercel.app/dataset_info')
    const data = await response.json()
    setDatasetInfo(data)
  }

  const fetchTfidfMatrix = async () => {
    const response = await fetch('https://information-retriveal-2nf3.vercel.app/tfidf_matrix')
    const data = await response.json()
    setTfidfMatrix(data)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('https://information-retriveal-2nf3.vercel.app/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const data = await response.json()
      setResults(data.results)
      setQueryWeights(data.query_weights)
    } catch (error) {
      console.error('Error during search:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDatasetUpdate = () => {
    // Refresh all data after dataset update
    fetchDatasetInfo()
    fetchTfidfMatrix()
    setResults([])
    setQueryWeights([])
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Information Retrieval Visualization</h1>
        <p className="text-gray-600">Explore document relationships and search results in 3D space</p>
      </div>

      {/* Search Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your search query"
                  className="pl-10"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="visualization" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visualization">
            <Network className="mr-2 h-4 w-4" />
            3D Embeddings
          </TabsTrigger>
          <TabsTrigger value="results">
            <Search className="mr-2 h-4 w-4" />
            Search Results
          </TabsTrigger>
          <TabsTrigger value="rag">
            <MessageSquare className="mr-2 h-4 w-4" />
            AI Assistant
          </TabsTrigger>
          <TabsTrigger value="details">
            <Info className="mr-2 h-4 w-4" />
            Dataset Details
          </TabsTrigger>
          <TabsTrigger value="dataset">
            <Database className="mr-2 h-4 w-4" />
            Manage Dataset
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-4">
          <EmbeddingVisualization3D
            searchResults={results}
          />

          {queryWeights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Query TF-IDF Weights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {queryWeights.slice(0, 10).map((weight, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-24 truncate font-mono text-sm">{weight.term}</span>
                      <Progress value={weight.weight * 100} className="flex-grow" />
                      <span className="w-16 text-right font-mono text-sm">{weight.weight.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results">
          <SearchResults results={results} />
        </TabsContent>

        <TabsContent value="rag">
          <RAGTab searchResults={results} />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {datasetInfo && <DatasetInfo info={datasetInfo} />}
          {tfidfMatrix && <TfidfMatrix matrix={tfidfMatrix} />}
        </TabsContent>

        <TabsContent value="dataset">
          <DatasetManager onDatasetUpdate={handleDatasetUpdate} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

