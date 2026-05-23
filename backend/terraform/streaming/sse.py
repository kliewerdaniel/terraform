import json
from typing import AsyncGenerator, Any
from fastapi.responses import StreamingResponse


class SSEStream:
    def __init__(self, event_generator: AsyncGenerator[str, None]):
        self.generator = event_generator

    @classmethod
    def from_async_gen(cls, gen: AsyncGenerator[str, None]) -> StreamingResponse:
        return StreamingResponse(
            gen,
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )


def format_sse(event: str, data: Any) -> str:
    if isinstance(data, (dict, list)):
        data = json.dumps(data)
    return f"event: {event}\ndata: {data}\n\n"
