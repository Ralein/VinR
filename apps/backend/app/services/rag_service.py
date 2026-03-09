"""RAG Service — Retrieval Augmented Generation for mental health knowledge."""


async def retrieve_context(query: str, top_k: int = 5) -> str:
    """
    Retrieve relevant knowledge chunks from the RAG vector store.

    This is a stub — real implementation in Sprint 1.3.
    Will use pgvector for embeddings storage and cosine similarity search.

    Args:
        query: User's emotional text input
        top_k: Number of chunks to retrieve

    Returns:
        Concatenated relevant context string
    """
    # TODO: Implement actual RAG pipeline:
    # 1. Generate embedding for query using text-embedding-3-small
    # 2. Search pgvector for top-k similar chunks
    # 3. Return concatenated context with source attribution
    return ""
