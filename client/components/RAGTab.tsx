'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { Loader2, MessageSquare, Settings, Wand2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Label } from './ui/label'

interface RAGTabProps {
    searchResults: Array<{
        id: string
        title: string
        content: string
        relevance_score: number
    }>
}

export default function RAGTab({ searchResults }: RAGTabProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [prompt, setPrompt] = useState('')
    const [response, setResponse] = useState('')
    const [systemPrompt, setSystemPrompt] = useState(
        `You are a helpful AI assistant. Use the provided context to answer the user's question.
If the context doesn't contain relevant information, say so.
Always base your answers on the provided context.`
    )

    const generateResponse = async () => {
        if (!searchResults.length || !prompt) return

        setIsLoading(true)
        try {
            // Format context from search results
            const context = searchResults
                .map(doc => `Document (relevance: ${doc.relevance_score.toFixed(3)}):
${doc.content}`)
                .join('\n\n')

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: `Context:
${context}

User Query: ${prompt}

Please provide a response based on the context above.`
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            })

            const data = await response.json()
            setResponse(data.choices[0].message.content)
        } catch (error) {
            console.error('Error:', error)
            setResponse('Error generating response. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">AI Assistant</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>System Prompt Settings</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>System Prompt</Label>
                                <Textarea
                                    value={systemPrompt}
                                    onChange={(e) => setSystemPrompt(e.target.value)}
                                    placeholder="Enter system prompt..."
                                    className="min-h-[200px] font-mono text-sm"
                                />
                            </div>
                            <div className="text-sm text-gray-500">
                                This prompt guides the AI's behavior and response style.
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4 grid-cols-2">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Context Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {searchResults.length > 0 ? (
                            searchResults.map((doc, idx) => (
                                <div key={doc.id} className="p-3 bg-gray-50 rounded-lg space-y-1">
                                    <div className="text-sm font-medium">Document {idx + 1}</div>
                                    <div className="text-sm text-gray-500">
                                        Relevance: {doc.relevance_score.toFixed(3)}
                                    </div>
                                    <div className="text-sm">{doc.content}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-gray-500">
                                No search results available. Please perform a search first.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>AI Interaction</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Your Prompt</Label>
                            <Textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Enter your prompt here..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <Button
                            onClick={generateResponse}
                            disabled={isLoading || !searchResults.length || !prompt}
                            className="w-full"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Generate Response
                                </>
                            )}
                        </Button>

                        {response && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm">AI Response</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="whitespace-pre-wrap text-sm">{response}</div>
                                </CardContent>
                            </Card>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 