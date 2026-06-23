import os
import time
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI
from pydantic import BaseModel

from agents.ai.code_execution_agent import run as run_code_agent
from app.services.telemetry_service import log_event

load_dotenv()

router = APIRouter(tags=["chat"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "data"

_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


class ChatRequest(BaseModel):
    message: str
    filename: str
    history: list[dict] = []


@router.post("/chat")
async def chat(req: ChatRequest):
    file_path = UPLOAD_DIR / req.filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    start = time.time()
    try:
        df = pd.read_csv(file_path)
        result = await run_code_agent(
            question=req.message,
            df=df,
            history=req.history,
            client=_client,
            model=_model,
            filename=req.filename,
        )
        duration_ms = int((time.time() - start) * 1000)
        log_event({
            "filename": req.filename,
            "question": req.message[:120],
            "duration_ms": duration_ms,
            "prompt_tokens": result.prompt_tokens,
            "completion_tokens": result.completion_tokens,
            "total_tokens": result.total_tokens,
            "tool_calls": result.tool_calls,
            "success": True,
        })
        return {
            "role": "assistant",
            "content": result.content,
            "agents_used": ["Code Execution Agent"],
        }
    except Exception as e:
        log_event({
            "filename": req.filename,
            "question": req.message[:120],
            "duration_ms": int((time.time() - start) * 1000),
            "success": False,
            "error": str(e),
        })
        raise HTTPException(status_code=500, detail=f"Chat failed: {e}")
