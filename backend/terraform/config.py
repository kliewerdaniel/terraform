from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    app_name: str = "TERRAFORM"
    app_version: str = "0.1.0"
    debug: bool = True

    # LLM provider
    llm_provider: Literal["ollama", "llamacpp", "openai"] = "ollama"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:14b"

    # ChromaDB
    chroma_persist_directory: str = "./terraform_memory"

    # SSE
    sse_retry_timeout: int = 3000

    # Orchestration
    max_agent_rounds: int = 3
    deliberation_timeout: int = 60

    # Image generation (optional)
    comfyui_enabled: bool = False
    comfyui_base_url: str = "http://localhost:8188"

    model_config = {"env_prefix": "TERRAFORM_"}


settings = Settings()
