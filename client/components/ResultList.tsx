import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface Result {
  id: string
  title: string
  content: string
  relevance_score: number
}

interface ResultListProps {
  results: Result[]
}

export default function ResultList({ results }: ResultListProps) {
  return (
    <div className="space-y-4">
      {results.map((result) => (
        <Card key={result.id}>
          <CardHeader>
            <CardTitle>{result.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{result.content.substring(0, 150)}...</p>
            <div className="flex items-center gap-4">
              <Progress value={result.relevance_score * 100} className="flex-grow" />
              <span className="text-sm font-medium">
                {(result.relevance_score * 100).toFixed(0)}% relevant
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

