'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface DatasetInfoProps {
  info: {
    num_documents: number
    num_features: number
    sample_documents: string[]
  }
}

export default function DatasetInfo({ info }: DatasetInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Dataset Information</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p>Number of documents: {info.num_documents}</p>
        <p>Number of features: {info.num_features}</p>
        {isExpanded && (
          <>
            <h3 className="font-semibold mt-4 mb-2">Sample Documents:</h3>
            <ul className="list-disc pl-5">
              {info.sample_documents.map((doc, index) => (
                <li key={index} className="mb-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto">
                        {doc.substring(0, 100)}...
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Full Document Content</DialogTitle>
                      </DialogHeader>
                      <p className="mt-4 whitespace-pre-wrap">{doc}</p>
                    </DialogContent>
                  </Dialog>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}

