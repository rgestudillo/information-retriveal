'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import DatasetInfo from './DatasetInfo'
import TfidfMatrix from './TfidfMatrix'
import SearchResults from './SearchResults'
import DocumentGraph from './DocumentGraph'
import { Loader2 } from 'lucide-react'

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
  const [allDocuments, setAllDocuments] = useState<Document[]>([])

  useEffect(() => {
    fetchDatasetInfo()
    fetchTfidfMatrix()
    fetchAllDocuments()
  }, [])

  const fetchDatasetInfo = async () => {
    const response = await fetch('http://localhost:8000/dataset_info')
    const data = await response.json()
    setDatasetInfo(data)
  }

  const fetchTfidfMatrix = async () => {
    const response = await fetch('http://localhost:8000/tfidf_matrix')
    const data = await response.json()
    setTfidfMatrix(data)
  }

  const fetchAllDocuments = async () => {
    const response = await fetch('http://localhost:8000/all_documents')
    const data = await response.json()
    setAllDocuments(data)
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8000/search', {
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

  return (
    <div className="space-y-8">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query"
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
        </div>
      </form>

      {datasetInfo && <DatasetInfo info={datasetInfo} />}
      {tfidfMatrix && <TfidfMatrix matrix={tfidfMatrix} />}

      <Card>
        <CardHeader>
          <CardTitle>Document Graph</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentGraph documents={allDocuments} topResults={results} />
        </CardContent>
      </Card>

      {queryWeights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Query TF-IDF Weights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {queryWeights.slice(0, 10).map((weight, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-24 truncate">{weight.term}</span>
                  <Progress value={weight.weight * 100} className="flex-grow" />
                  <span className="w-16 text-right">{weight.weight.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <SearchResults results={results} />
    </div>
  )
}

