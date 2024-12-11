'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Save, RefreshCw, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface DatasetManagerProps {
    onDatasetUpdate: () => void;
}

export default function DatasetManager({ onDatasetUpdate }: DatasetManagerProps) {
    const [documents, setDocuments] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [documentCount, setDocumentCount] = useState(0)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const text = await file.text()
            // Try to parse as JSON first
            try {
                const jsonData = JSON.parse(text)
                if (Array.isArray(jsonData)) {
                    const formattedDocs = jsonData.join('\n')
                    setDocuments(formattedDocs)
                    setDocumentCount(jsonData.length)
                    setSuccess(`Successfully loaded ${jsonData.length} documents from JSON`)
                } else {
                    throw new Error('File must contain an array of strings')
                }
            } catch {
                // If not JSON, treat as plain text with one document per line
                const docs = text.split('\n').filter(doc => doc.trim().length > 0)
                setDocuments(text)
                setDocumentCount(docs.length)
                setSuccess(`Successfully loaded ${docs.length} documents from text file`)
            }
        } catch (err) {
            setError('Error reading file. Please ensure it\'s a valid JSON array or text file.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Split by newlines and filter empty lines
            const docs = documents.split('\n').filter(doc => doc.trim().length > 0)

            if (docs.length === 0) {
                throw new Error('Please add at least one document')
            }

            const response = await fetch('http://localhost:8000/update_dataset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ documents: docs }),
            })

            if (!response.ok) {
                throw new Error('Failed to update dataset')
            }

            setSuccess(`Dataset updated successfully with ${docs.length} documents`)
            setDocumentCount(docs.length)
            onDatasetUpdate()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error updating dataset')
        } finally {
            setIsLoading(false)
        }
    }

    const handleReset = async () => {
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch('http://localhost:8000/reset_dataset', {
                method: 'POST',
            })

            if (!response.ok) {
                throw new Error('Failed to reset dataset')
            }

            setSuccess('Dataset reset to default')
            setDocuments('')
            setDocumentCount(0)
            onDatasetUpdate()
        } catch (err) {
            setError('Error resetting dataset')
        } finally {
            setIsLoading(false)
        }
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        setDocuments(text)
        const docs = text.split('\n').filter(doc => doc.trim().length > 0)
        setDocumentCount(docs.length)
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Dataset Management
                    </CardTitle>
                    <CardDescription>
                        Upload your own dataset or use the default one. Each line represents one document.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Button variant="outline" className="w-full relative overflow-hidden">
                            <label className="flex items-center justify-center w-full cursor-pointer">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Dataset
                                <input
                                    type="file"
                                    accept=".txt,.json"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </label>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={isLoading}
                            className="w-full"
                        >
                            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Reset to Default
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">
                                Documents (one per line):
                            </label>
                            <span className="text-sm text-gray-500">
                                {documentCount} documents
                            </span>
                        </div>
                        <Textarea
                            value={documents}
                            onChange={handleTextChange}
                            placeholder="Enter your documents here, one per line...
Example:
The quick brown fox jumps over the lazy dog.
Python is a powerful programming language.
Data science involves analyzing large datasets."
                            className="min-h-[300px] font-mono text-sm"
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-600">Success</AlertTitle>
                            <AlertDescription className="text-green-600">{success}</AlertDescription>
                        </Alert>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full"
                    >
                        {isLoading ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Updating Dataset...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Update Dataset
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Dataset Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>Each line should contain one complete document</li>
                        <li>Empty lines will be automatically removed</li>
                        <li>You can upload either a JSON array or a text file</li>
                        <li>For best results, ensure each document is a complete, meaningful text</li>
                        <li>The system will automatically process and index all documents</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
} 