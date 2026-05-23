from typing import Optional, AsyncGenerator
from terraform.models.schemas import AgentRole
from terraform.models.llm_client import LLMClient


class BaseAgent:
    role: AgentRole
    name: str
    system_prompt: str

    def __init__(self, llm: Optional[LLMClient] = None):
        self.llm = llm or LLMClient()

    async def think(self, context: str, question: str) -> str:
        return await self.llm.generate(
            system_prompt=self.system_prompt,
            user_prompt=f"CONTEXT:\n{context}\n\nQUESTION:\n{question}\n\nRespond as {self.name}:",
            temperature=0.7,
        )

    async def think_stream(self, context: str, question: str) -> AsyncGenerator[str, None]:
        async for chunk in self.llm.generate_stream(
            system_prompt=self.system_prompt,
            user_prompt=f"CONTEXT:\n{context}\n\nQUESTION:\n{question}\n\nRespond as {self.name}:",
            temperature=0.7,
        ):
            yield chunk

    def to_dict(self) -> dict:
        return {"role": self.role.value, "name": self.name}
