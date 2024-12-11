from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from documents_data import documents

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store the original documents as default
DEFAULT_DOCUMENTS = documents.copy()
CURRENT_DOCUMENTS = documents.copy()

# Initialize the TF-IDF Vectorizer globally but we'll update it when dataset changes
vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(CURRENT_DOCUMENTS)

class Query(BaseModel):
    query: str

class Document(BaseModel):
    id: str
    title: str
    content: str
    relevance_score: float

class TfidfWeight(BaseModel):
    term: str
    weight: float

class DocumentsUpdate(BaseModel):
    documents: List[str]

@app.post("/search")
async def search(query: Query) -> Dict:
    # Use current documents and vectorizer
    query_vector = vectorizer.transform([query.query])
    cosine_similarities = cosine_similarity(query_vector, tfidf_matrix).flatten()
    
    # Get all similarities for visualization
    all_similarities = []
    for idx, sim in enumerate(cosine_similarities):
        all_similarities.append({
            "id": f"doc{idx+1}",
            "title": f"Document {idx+1}",
            "similarity": float(sim),
            "rank": len(cosine_similarities) - idx - 1 if sim > 0 else -1,
            "is_top_5": False
        })

    # Get top 5 results
    top_indices = np.argsort(cosine_similarities)[::-1][:5]
    
    results = []
    for idx in top_indices:
        # Mark top 5 in all_similarities
        doc_id = f"doc{idx+1}"
        for sim in all_similarities:
            if sim["id"] == doc_id:
                sim["is_top_5"] = True
                break
                
        results.append(Document(
            id=f"doc{idx+1}",
            title=f"Document {idx+1}",
            content=CURRENT_DOCUMENTS[idx],
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
        "query_weights": sorted(query_weights, key=lambda x: x.weight, reverse=True),
        "all_similarities": all_similarities
    }

@app.get("/dataset_info")
async def get_dataset_info():
    return {
        "num_documents": len(CURRENT_DOCUMENTS),
        "num_features": len(vectorizer.get_feature_names_out()),
        "sample_documents": CURRENT_DOCUMENTS[:5]
    }

@app.get("/tfidf_matrix")
async def get_tfidf_matrix():
    feature_names = vectorizer.get_feature_names_out()
    tfidf_sample = tfidf_matrix[:5, :10].toarray()
    return {
        "feature_names": feature_names[:10].tolist(),
        "tfidf_sample": tfidf_sample.tolist()
    }

@app.get("/all_documents")
async def get_all_documents():
    all_documents = []
    for idx, document in enumerate(CURRENT_DOCUMENTS):
        all_documents.append({
            "id": f"doc{idx+1}",
            "title": f"Document {idx+1}",
            "content": document,
        })
    return all_documents

@app.post("/update_dataset")
async def update_dataset(data: DocumentsUpdate):
    global CURRENT_DOCUMENTS, vectorizer, tfidf_matrix
    
    try:
        # Update current documents
        CURRENT_DOCUMENTS = data.documents
        
        # Reinitialize TF-IDF vectorizer with new documents
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(CURRENT_DOCUMENTS)
        
        return {"message": "Dataset updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/reset_dataset")
async def reset_dataset():
    global CURRENT_DOCUMENTS, vectorizer, tfidf_matrix
    
    try:
        # Reset to default documents
        CURRENT_DOCUMENTS = DEFAULT_DOCUMENTS.copy()
        
        # Reinitialize TF-IDF vectorizer with default documents
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(CURRENT_DOCUMENTS)
        
        return {"message": "Dataset reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
