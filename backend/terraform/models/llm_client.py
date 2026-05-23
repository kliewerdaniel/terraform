import httpx
import json
from typing import AsyncGenerator, Optional
from terraform.config import settings


class LLMClient:
    def __init__(self, model: Optional[str] = None):
        self.model = model or settings.ollama_model
        self.base_url = settings.ollama_base_url

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        if settings.llm_provider == "ollama":
            return await self._ollama_generate(system_prompt, user_prompt, temperature, max_tokens)
        return "LLM provider not configured"

    async def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        if settings.llm_provider == "ollama":
            async for chunk in self._ollama_stream(system_prompt, user_prompt, temperature, max_tokens):
                yield chunk

    async def _ollama_generate(
        self, system_prompt: str, user_prompt: str, temperature: float, max_tokens: int
    ) -> str:
        full_response = ""
        async for chunk in self._ollama_stream(system_prompt, user_prompt, temperature, max_tokens):
            full_response += chunk
        return full_response

    async def _ollama_stream(
        self, system_prompt: str, user_prompt: str, temperature: float, max_tokens: int
    ) -> AsyncGenerator[str, None]:
        payload = {
            "model": self.model,
            "prompt": user_prompt,
            "system": system_prompt,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens,
            },
        }
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", f"{self.base_url}/api/generate", json=payload) as response:
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            if "response" in data:
                                yield data["response"]
                            if data.get("done"):
                                break
                        except json.JSONDecodeError:
                            continue

    async def embedding(self, text: str) -> list[float]:
        if settings.llm_provider == "ollama":
            return await self._ollama_embedding(text)
        return [0.0] * 768

    async def _ollama_embedding(self, text: str) -> list[float]:
        payload = {"model": self.model, "prompt": text}
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{self.base_url}/api/embeddings", json=payload)
            data = resp.json()
            return data.get("embedding", [0.0] * 768)
