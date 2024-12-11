from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn
import numpy as np
from sklearn.datasets import fetch_20newsgroups
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Fetch the 20 Newsgroups dataset
newsgroups = fetch_20newsgroups(subset='all')
documents = newsgroups.data[:1000]  # Limit to 1000 documents for performance
document_titles = [f"Document {i+1}" for i in range(len(documents))]

# Initialize the TF-IDF Vectorizer
vectorizer = TfidfVectorizer(stop_words='english')

# Fit and transform the documents
tfidf_matrix = vectorizer.fit_transform(documents)

class Document(BaseModel):
    id: str
    title: str
    content: str
    relevance_score: float

class Query(BaseModel):
    query: str

class TfidfWeight(BaseModel):
    term: str
    weight: float

@app.post("/search")
async def search(query: Query) -> Dict:
    query_vector = vectorizer.transform([query.query])
    cosine_similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
    sorted_indices = np.argsort(cosine_similarities)[::-1]

    results = []
    for idx in sorted_indices[:5]:
        results.append(Document(
            id=f"doc{idx+1}",
            title=document_titles[idx],
            content=documents[idx],
            relevance_score=float(cosine_similarities[idx])
        ))

    # Get TF-IDF weights for the query
    query_tfidf = vectorizer.transform([query.query])
    feature_names = vectorizer.get_feature_names_out()
    query_weights = []
    for col in query_tfidf.nonzero()[1]:
        query_weights.append(TfidfWeight(
            term=feature_names[col],
            weight=float(query_tfidf[0, col])
        ))

    return {
        "results": results,
        "query_weights": sorted(query_weights, key=lambda x: x.weight, reverse=True)
    }

@app.get("/dataset_info")
async def get_dataset_info():
    return {
        "num_documents": len(documents),
        "num_features": len(vectorizer.get_feature_names_out()),
        "sample_documents": documents[:5]  # First 5 documents
    }

@app.get("/tfidf_matrix")
async def get_tfidf_matrix():
    feature_names = vectorizer.get_feature_names_out()
    tfidf_sample = tfidf_matrix[:5, :10].toarray()  # First 5 documents, first 10 features
    return {
        "feature_names": feature_names[:10].tolist(),
        "tfidf_sample": tfidf_sample.tolist()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

