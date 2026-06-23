import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from openai import AsyncOpenAI
from pydantic import BaseModel

from agents.ai.code_execution_agent import run as run_code_agent

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

    try:
        df = pd.read_csv(file_path)
        content = await run_code_agent(
            question=req.message,
            df=df,
            history=req.history,
            client=_client,
            model=_model,
            filename=req.filename,
        )
        return {
            "role": "assistant",
            "content": content,
            "agents_used": ["Code Execution Agent"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {e}")
