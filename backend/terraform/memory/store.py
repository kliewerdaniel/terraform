import json
from typing import Optional
from datetime import datetime
from terraform.config import settings
from terraform.models.schemas import MemoryEntry

try:
    import chromadb
    from chromadb.config import Settings as ChromaSettings

    CHROMA_AVAILABLE = True
except ImportError:
    CHROMA_AVAILABLE = False


class MemoryStore:
    def __init__(self):
        self.collection = None
        self.client = None
        if CHROMA_AVAILABLE:
            self._init_chroma()
        self._fallback: list[dict] = []

    def _init_chroma(self):
        try:
            self.client = chromadb.PersistentClient(
                path=settings.chroma_persist_directory,
                settings=ChromaSettings(anonymized_telemetry=False),
            )
            self.collection = self.client.get_or_create_collection(
                name="terraform_memory",
                metadata={"hnsw:space": "cosine"},
            )
        except Exception:
            self.client = None
            self.collection = None

    def store(self, entry: MemoryEntry, embedding: Optional[list[float]] = None):
        doc_id = entry.id or f"mem_{datetime.now().timestamp()}_{hash(entry.content) % 1000000}"
        metadata = {"type": entry.type, "context": json.dumps(entry.context), "timestamp": datetime.now().isoformat()}
        if self.collection:
            try:
                kwargs = {
                    "documents": [entry.content],
                    "metadatas": [metadata],
                    "ids": [doc_id],
                }
                if embedding:
                    kwargs["embeddings"] = [embedding]
                self.collection.add(**kwargs)
                return
            except Exception:
                pass
        self._fallback.append({"id": doc_id, "content": entry.content, "metadata": metadata})

    def search(self, query: str, n_results: int = 5, type_filter: Optional[str] = None):
        if self.collection:
            try:
                where = {}
                if type_filter:
                    where["type"] = type_filter
                results = self.collection.query(query_texts=[query], n_results=n_results, where=where or None)
                entries = []
                if results["ids"] and results["ids"][0]:
                    for i, doc_id in enumerate(results["ids"][0]):
                        entries.append(MemoryEntry(
                            id=doc_id,
                            type=results["metadatas"][0][i].get("type", "unknown"),
                            content=results["documents"][0][i],
                            context={},
                        ))
                return entries
            except Exception:
                pass
        return []

    def get_context(self, query: str, n_results: int = 5) -> str:
        entries = self.search(query, n_results)
        if not entries:
            return ""
        parts = [f"[{e.type}] {e.content}" for e in entries]
        return "\n".join(parts)

    def get_history(self, n: int = 10) -> list[MemoryEntry]:
        if self.collection:
            try:
                results = self.collection.get(limit=n)
                entries = []
                if results["ids"]:
                    for i, doc_id in enumerate(results["ids"]):
                        entries.append(MemoryEntry(
                            id=doc_id,
                            type=results["metadatas"][i].get("type", "unknown"),
                            content=results["documents"][i],
                            context={},
                        ))
                return entries
            except Exception:
                pass
        return []
