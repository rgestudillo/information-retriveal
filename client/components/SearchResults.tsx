import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Document {
  id: string
  title: string
  content: string
  relevance_score: number
}

interface SearchResultsProps {
  results: Document[]
}

export default function SearchResults({ results }: SearchResultsProps) {
  if (results.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.id}>
              <CardHeader>
                <CardTitle>{result.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{result.content}</p>
                <div className="flex items-center gap-4">
                  <Progress value={result.relevance_score * 100} className="flex-grow" />
                  <span className="text-sm font-medium">
                    {(result.relevance_score * 100).toFixed(2)}% relevant
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

