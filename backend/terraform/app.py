import uuid
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from terraform.config import settings
from terraform.models.schemas import ConversationRequest, KnowledgeGraph
from terraform.orchestration.director import OrchestrationDirector
from terraform.streaming.sse import SSEStream
from terraform.conversation.interviewer import Interviewer


director: OrchestrationDirector | None = None
interviewer: Interviewer | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global director, interviewer
    director = OrchestrationDirector()
    interviewer = Interviewer()
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="A living design intelligence system for Central Texas landscapes",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "living", "name": settings.app_name, "version": settings.app_version}


@app.get("/api/graph")
async def get_graph():
    if not director:
        raise HTTPException(status_code=503, detail="Director not initialized")
    return director.graph.to_serializable()


@app.get("/api/interview/question")
async def get_interview_question():
    if not interviewer:
        raise HTTPException(status_code=503, detail="Interviewer not initialized")
    context = interviewer.get_summary()
    question = interviewer.pick_question(context)
    return {"question": question, "answered": len(interviewer.answers), "total": len(interviewer.questions)}


@app.post("/api/interview/answer")
async def submit_interview_answer(question: str, answer: str):
    if not interviewer:
        raise HTTPException(status_code=503, detail="Interviewer not initialized")
    interviewer.record_answer(question, answer)
    if interviewer.is_complete():
        profile = await interviewer.interpret()
        if director:
            director.user_profile = {"profile": profile, "answers": interviewer.answers}
        return {"complete": True, "profile": profile}
    context = interviewer.get_summary()
    next_q = interviewer.pick_question(context)
    return {"complete": False, "next_question": next_q, "answered": len(interviewer.answers)}


@app.get("/api/interview/profile")
async def get_profile():
    if not interviewer or not interviewer.is_complete():
        raise HTTPException(status_code=400, detail="Interview not complete")
    return {
        "answers": interviewer.answers,
        "profile": await interviewer.interpret() if interviewer.is_complete() else "",
    }


@app.post("/api/converse")
async def converse(request: ConversationRequest):
    if not director:
        raise HTTPException(status_code=503, detail="Director not initialized")

    async def event_stream() -> AsyncGenerator[str, None]:
        async for event in director.process_conversation(request):
            yield event

    return SSEStream.from_async_gen(event_stream())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("terraform.app:app", host="0.0.0.0", port=8080, reload=True)
