'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Code, Database, Search, Network, FileJson } from 'lucide-react'

export default function Documentation() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                    <p className="text-gray-600">
                        Complete guide to understanding and using the Information Retrieval System
                    </p>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <TabsTrigger value="overview">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="algorithm">
                            <Code className="mr-2 h-4 w-4" />
                            Algorithm
                        </TabsTrigger>
                        <TabsTrigger value="dataset">
                            <Database className="mr-2 h-4 w-4" />
                            Dataset
                        </TabsTrigger>
                        <TabsTrigger value="search">
                            <Search className="mr-2 h-4 w-4" />
                            Search
                        </TabsTrigger>
                        <TabsTrigger value="visualization">
                            <Network className="mr-2 h-4 w-4" />
                            Visualization
                        </TabsTrigger>
                        <TabsTrigger value="api">
                            <FileJson className="mr-2 h-4 w-4" />
                            API
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Card>
                            <CardHeader>
                                <CardTitle>Overview</CardTitle>
                                <CardDescription>
                                    Understanding the Information Retrieval System
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="text-lg font-semibold">What is this project?</h3>
                                <p>
                                    This project is an implementation of an Information Retrieval system that uses TF-IDF (Term Frequency-Inverse Document Frequency) and Cosine Similarity to search through a collection of documents and find the most relevant matches for a given query.
                                </p>

                                <h3 className="text-lg font-semibold">Key Features</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>TF-IDF based document indexing</li>
                                    <li>Cosine similarity search</li>
                                    <li>Interactive document relationship visualization</li>
                                    <li>Custom dataset management</li>
                                    <li>Real-time search results</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="algorithm">
                        <Card>
                            <CardHeader>
                                <CardTitle>Algorithm Details</CardTitle>
                                <CardDescription>
                                    Understanding TF-IDF and Cosine Similarity
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">TF-IDF</h3>
                                    <p>
                                        TF-IDF (Term Frequency-Inverse Document Frequency) is a numerical statistic that reflects how important a word is to a document in a collection.
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>TF (Term Frequency): How often a word appears in a document</li>
                                        <li>IDF (Inverse Document Frequency): How unique the word is across all documents</li>
                                        <li>Final Score = TF × IDF</li>
                                    </ul>

                                    <h3 className="text-lg font-semibold mt-6">Cosine Similarity</h3>
                                    <p>
                                        Cosine similarity measures the cosine of the angle between two vectors, providing a similarity score between -1 and 1.
                                    </p>
                                    <p>
                                        In our implementation, we use it to compare the TF-IDF vector of the query with the TF-IDF vectors of all documents.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="dataset">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dataset Management</CardTitle>
                                <CardDescription>
                                    How to work with custom datasets
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="text-lg font-semibold">Adding Custom Datasets</h3>
                                <p>You can add your own dataset in two ways:</p>
                                <ol className="list-decimal list-inside space-y-2 ml-4">
                                    <li>Upload a text file (one document per line)</li>
                                    <li>Upload a JSON file (array of strings)</li>
                                    <li>Manually enter documents in the textarea</li>
                                </ol>

                                <h3 className="text-lg font-semibold mt-6">Format Requirements</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Each document should be a complete, meaningful text</li>
                                    <li>Empty lines are automatically removed</li>
                                    <li>No special formatting required</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="search">
                        <Card>
                            <CardHeader>
                                <CardTitle>Search Functionality</CardTitle>
                                <CardDescription>
                                    How the search system works
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="text-lg font-semibold">Search Process</h3>
                                <ol className="list-decimal list-inside space-y-2 ml-4">
                                    <li>Query is converted to TF-IDF vector</li>
                                    <li>Cosine similarity calculated with all documents</li>
                                    <li>Documents are ranked by similarity score</li>
                                    <li>Top 5 most similar documents are returned</li>
                                </ol>

                                <h3 className="text-lg font-semibold mt-6">Search Tips</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Use natural language queries</li>
                                    <li>More specific queries yield better results</li>
                                    <li>Common words (stop words) are automatically removed</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="visualization">
                        <Card>
                            <CardHeader>
                                <CardTitle>Visualization Guide</CardTitle>
                                <CardDescription>
                                    Understanding the document graph
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <h3 className="text-lg font-semibold">Graph Elements</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Nodes represent documents</li>
                                    <li>Red nodes are top 5 results</li>
                                    <li>Lines show relationships between documents</li>
                                    <li>Line thickness indicates similarity strength</li>
                                </ul>

                                <h3 className="text-lg font-semibold mt-6">Interactions</h3>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                    <li>Drag nodes to rearrange</li>
                                    <li>Scroll to zoom</li>
                                    <li>Click nodes for details</li>
                                    <li>Hover for additional information</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="api">
                        <Card>
                            <CardHeader>
                                <CardTitle>API Reference</CardTitle>
                                <CardDescription>
                                    Backend API endpoints documentation
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold">POST /search</h3>
                                        <p className="text-sm text-gray-600 mt-1">Search for documents using a query</p>
                                        <pre className="bg-gray-100 p-2 rounded mt-2">
                                            {`{
  "query": "string"
}`}
                                        </pre>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">POST /update_dataset</h3>
                                        <p className="text-sm text-gray-600 mt-1">Update the current dataset</p>
                                        <pre className="bg-gray-100 p-2 rounded mt-2">
                                            {`{
  "documents": string[]
}`}
                                        </pre>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">GET /all_documents</h3>
                                        <p className="text-sm text-gray-600 mt-1">Retrieve all documents</p>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold">GET /dataset_info</h3>
                                        <p className="text-sm text-gray-600 mt-1">Get information about the current dataset</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
} 