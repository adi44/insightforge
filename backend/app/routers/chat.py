from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.tools.ai_tools import (
    ai_analyze_data_quality,
    ai_run_eda,
    ai_generate_visualizations,
)
from config.llm import model_client
from autogen_core.models import UserMessage, SystemMessage, AssistantMessage

router = APIRouter(tags=["chat"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "data"


class ChatRequest(BaseModel):
    message: str
    filename: str
    history: list[dict] = []


@router.post("/chat")
async def chat(req: ChatRequest):
    file_path = UPLOAD_DIR / req.filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    tool_context = _build_tool_context(str(file_path), req.message)

    messages = [
        SystemMessage(content=_system_prompt(req.filename, tool_context)),
    ]

    for msg in req.history[-10:]:
        if msg["role"] == "user":
            messages.append(UserMessage(content=msg["content"], source="user"))
        else:
            messages.append(AssistantMessage(content=msg["content"], source="assistant"))

    messages.append(UserMessage(content=req.message, source="user"))

    try:
        result = await model_client.create(messages)
        return {
            "role": "assistant",
            "content": result.content,
            "agents_used": _detect_agents_used(req.message),
        }
    except Exception as e:
        error_msg = str(e)
        if "prefill" in error_msg.lower():
            return {
                "role": "assistant",
                "content": "I encountered a compatibility issue with the AI model. "
                           "This is a known issue with the current framework version. "
                           "Please try rephrasing your question.",
                "error": True,
            }
        raise HTTPException(status_code=500, detail=f"Chat failed: {error_msg}")


def _system_prompt(filename: str, tool_context: str) -> str:
    return f"""You are InsightForge AI, an analytics assistant powered by a team of specialized agents.
You are helping the user analyze their dataset: {filename}

Here is the current analysis context from your agent tools:
{tool_context}

Based on this data, answer the user's questions clearly and concisely.
When referencing numbers, be specific. When suggesting actions, be practical.
If the user asks for something beyond the data, say so clearly."""


def _build_tool_context(file_path: str, message: str) -> str:
    parts = []
    try:
        quality = ai_analyze_data_quality(file_path)
        parts.append(f"DATA QUALITY:\n{quality}")
    except Exception:
        pass

    msg_lower = message.lower()
    if any(kw in msg_lower for kw in ["eda", "statistic", "correlation", "distribution", "summary", "mean", "average"]):
        try:
            eda = ai_run_eda(file_path)
            parts.append(f"EDA RESULTS:\n{eda}")
        except Exception:
            pass

    return "\n\n".join(parts) if parts else "No analysis data available yet."


def _detect_agents_used(message: str) -> list[str]:
    agents = ["Data Quality Agent"]
    msg_lower = message.lower()
    if any(kw in msg_lower for kw in ["eda", "statistic", "correlation", "distribution", "summary", "mean"]):
        agents.append("EDA Agent")
    if any(kw in msg_lower for kw in ["insight", "recommend", "suggest", "why", "business"]):
        agents.append("Insight Agent")
    if any(kw in msg_lower for kw in ["chart", "visual", "plot", "graph", "histogram"]):
        agents.append("Visualization Agent")
    if any(kw in msg_lower for kw in ["report", "compile", "full analysis"]):
        agents.append("Report Agent")
    return agents
