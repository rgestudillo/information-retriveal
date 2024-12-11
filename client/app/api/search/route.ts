import { NextResponse } from 'next/server'

const sampleDocuments = [
  {
    id: "doc1",
    title: "Introduction to Natural Language Processing",
    content: "Natural Language Processing (NLP) is a subfield of artificial intelligence...",
    relevance_score: 0.95
  },
  {
    id: "doc2",
    title: "Vector Space Model in Information Retrieval",
    content: "The Vector Space Model (VSM) is an algebraic model for representing text documents...",
    relevance_score: 0.88
  },
  {
    id: "doc3",
    title: "Text Mining Techniques",
    content: "Text mining is the process of deriving high-quality information from text...",
    relevance_score: 0.82
  },
  {
    id: "doc4",
    title: "Topic Modeling with LDA",
    content: "Latent Dirichlet Allocation (LDA) is a generative statistical model...",
    relevance_score: 0.75
  },
  {
    id: "doc5",
    title: "Sentiment Analysis in NLP",
    content: "Sentiment analysis is the interpretation and classification of emotions...",
    relevance_score: 0.68
  }
]

export async function POST(request: Request) {
  const { query } = await request.json()
  
  // In a real application, you would use the query to filter and rank the results
  // For this example, we'll just return all documents, sorted by relevance score
  const results = sampleDocuments.sort((a, b) => b.relevance_score - a.relevance_score)
  
  return NextResponse.json(results)
}

