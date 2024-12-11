'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Save, RefreshCw } from 'lucide-react'

interface DatasetManagerProps {
    onDatasetUpdate: () => void;
}

export default function DatasetManager({ onDatasetUpdate }: DatasetManagerProps) {
    const [documents, setDocuments] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const text = await file.text()
            // Try to parse as JSON first
            try {
                const jsonData = JSON.parse(text)
                if (Array.isArray(jsonData)) {
                    setDocuments(jsonData.join('\n'))
                } else {
                    throw new Error('File must contain an array of strings')
                }
            } catch {
                // If not JSON, treat as plain text with one document per line
                setDocuments(text)
            }
        } catch (err) {
            setError('Error reading file')
        }
    }

    const handleSubmit = async () => {
        setIsLoading(true)
        setError(null)
        setSuccess(null)

        try {
            // Split by newlines and filter empty lines
            const docs = documents.split('\n').filter(doc => doc.trim().length > 0)

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

            setSuccess('Dataset updated successfully')
            onDatasetUpdate() // Trigger parent component to refresh data
        } catch (err) {
            setError('Error updating dataset')
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
            onDatasetUpdate() // Trigger parent component to refresh data
        } catch (err) {
            setError('Error resetting dataset')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dataset Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-4">
                    <Button variant="outline" className="w-full">
                        <label className="flex items-center justify-center w-full cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload File
                            <input
                                type="file"
                                accept=".txt,.json"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={isLoading}
                        className="w-full"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset to Default
                    </Button>
                </div>

                <div className="space-y-2">
                    <label className="text-sm text-gray-500">
                        Enter documents (one per line):
                    </label>
                    <Textarea
                        value={documents}
                        onChange={(e) => setDocuments(e.target.value)}
                        placeholder="Enter your documents here, one per line..."
                        className="min-h-[200px] font-mono text-sm"
                    />
                </div>

                {error && (
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert>
                        <AlertDescription>{success}</AlertDescription>
                    </Alert>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full"
                >
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? 'Updating...' : 'Update Dataset'}
                </Button>
            </CardContent>
        </Card>
    )
} 