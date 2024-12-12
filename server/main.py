from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import math
import numpy as np
import uvicorn
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
VOCABULARY = {}
TF_IDF_MATRIX = []

# Helper functions
def tokenize(text):
    return text.lower().split()

def build_vocabulary(documents):
    vocab = {}
    for doc in documents:
        for word in tokenize(doc):
            if word not in vocab:
                vocab[word] = len(vocab)
    return vocab

def calculate_tf(document, vocab):
    tokens = tokenize(document)
    tf = np.zeros(len(vocab))
    for token in tokens:
        if token in vocab:
            tf[vocab[token]] += 1
    return tf / len(tokens)

def calculate_idf(documents, vocab):
    doc_count = len(documents)
    idf = np.zeros(len(vocab))
    for token in vocab:
        count = sum(1 for doc in documents if token in tokenize(doc))
        idf[vocab[token]] = math.log(doc_count / (1 + count))
    return idf

def calculate_tf_idf(documents, vocab):
    idf = calculate_idf(documents, vocab)
    tf_idf_matrix = []
    for document in documents:
        tf = calculate_tf(document, vocab)
        tf_idf_matrix.append(tf * idf)
    return np.array(tf_idf_matrix)

def cosine_similarity(vector1, vector2):
    dot_product = np.dot(vector1, vector2)
    magnitude1 = np.linalg.norm(vector1)
    magnitude2 = np.linalg.norm(vector2)
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)

def reduce_to_3d(embeddings):
    mean = np.mean(embeddings, axis=0)
    centered = embeddings - mean
    covariance = np.cov(centered.T)
    eigenvalues, eigenvectors = np.linalg.eigh(covariance)
    top_indices = np.argsort(eigenvalues)[::-1][:3]
    top_vectors = eigenvectors[:, top_indices]
    reduced = np.dot(centered, top_vectors)
    return reduced

def get_sample_tfidf_matrix(tfidf_matrix, num_rows=5, num_cols=10):
    return tfidf_matrix[:num_rows, :num_cols]

# Initialize Vocabulary and TF-IDF Matrix
VOCABULARY = build_vocabulary(CURRENT_DOCUMENTS)
TF_IDF_MATRIX = calculate_tf_idf(CURRENT_DOCUMENTS, VOCABULARY)

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
    # Query vector
    query_vector = calculate_tf(query.query, VOCABULARY) * calculate_idf(CURRENT_DOCUMENTS, VOCABULARY)

    # Cosine similarities
    similarities = [cosine_similarity(query_vector, doc_vector) for doc_vector in TF_IDF_MATRIX]

    # Get top 5 results
    top_indices = np.argsort(similarities)[::-1][:5]
    results = []
    for idx in top_indices:
        results.append({
            "id": f"doc{idx+1}",
            "title": f"Document {idx+1}",
            "content": CURRENT_DOCUMENTS[idx],
            "relevance_score": similarities[idx]
        })

    # Query weights
    query_weights = []
    for idx, value in enumerate(query_vector):
        if value > 0:
            term = list(VOCABULARY.keys())[list(VOCABULARY.values()).index(idx)]
            query_weights.append({
                "term": term,
                "weight": value
            })

    return {
        "results": results,
        "query_weights": query_weights
    }

@app.get("/document_embeddings_3d")
async def get_document_embeddings_3d():
    # Reduce dimensionality to 3D
    embeddings_3d = reduce_to_3d(TF_IDF_MATRIX)

    # Create response data
    embedding_data = []
    for idx, (x, y, z) in enumerate(embeddings_3d):
        embedding_data.append({
            "id": f"doc{idx+1}",
            "title": f"Document {idx+1}",
            "content": CURRENT_DOCUMENTS[idx],
            "x": float(x),
            "y": float(y),
            "z": float(z)
        })
    return embedding_data

@app.get("/dataset_info")
async def get_dataset_info():
    return {
        "num_documents": len(CURRENT_DOCUMENTS),
        "num_features": len(VOCABULARY),
        "sample_documents": CURRENT_DOCUMENTS[:5]
    }

@app.get("/tfidf_matrix")
async def get_tfidf_matrix():
    sample_tfidf = get_sample_tfidf_matrix(TF_IDF_MATRIX)
    feature_names = list(VOCABULARY.keys())[:10]
    return {
        "feature_names": feature_names,
        "tfidf_sample": sample_tfidf.tolist()
    }

@app.post("/update_dataset")
async def update_dataset(data: DocumentsUpdate):
    global CURRENT_DOCUMENTS, VOCABULARY, TF_IDF_MATRIX
    try:
        # Update the current documents
        CURRENT_DOCUMENTS = data.documents

        # Recalculate the vocabulary and TF-IDF matrix
        VOCABULARY = build_vocabulary(CURRENT_DOCUMENTS)
        TF_IDF_MATRIX = calculate_tf_idf(CURRENT_DOCUMENTS, VOCABULARY)

        return {"message": "Dataset updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/reset_dataset")
async def reset_dataset():
    global CURRENT_DOCUMENTS, VOCABULARY, TF_IDF_MATRIX
    try:
        # Reset to default documents
        CURRENT_DOCUMENTS = DEFAULT_DOCUMENTS.copy()

        # Recalculate the vocabulary and TF-IDF matrix
        VOCABULARY = build_vocabulary(CURRENT_DOCUMENTS)
        TF_IDF_MATRIX = calculate_tf_idf(CURRENT_DOCUMENTS, VOCABULARY)

        return {"message": "Dataset reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)