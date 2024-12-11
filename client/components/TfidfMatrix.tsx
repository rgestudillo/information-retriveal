'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TfidfMatrixProps {
  matrix: {
    feature_names: string[]
    tfidf_sample: number[][]
  }
}

export default function TfidfMatrix({ matrix }: TfidfMatrixProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>TF-IDF Matrix Sample</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isExpanded ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                {matrix.feature_names.map((feature, index) => (
                  <TableHead key={index}>{feature}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.tfidf_sample.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>Document {rowIndex + 1}</TableCell>
                  {row.map((value, colIndex) => (
                    <TableCell key={colIndex}>{value.toFixed(4)}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>Click to expand and view the TF-IDF matrix sample.</p>
        )}
      </CardContent>
    </Card>
  )
}

