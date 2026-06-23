"""Append-only JSONL telemetry log with in-memory aggregation."""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

_LOG_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "telemetry.jsonl"


def log_event(event: dict[str, Any]) -> None:
    event["timestamp"] = datetime.now(timezone.utc).isoformat()
    with open(_LOG_FILE, "a") as f:
        f.write(json.dumps(event) + "\n")


def get_events(limit: int = 500) -> list[dict]:
    if not _LOG_FILE.exists():
        return []
    events: list[dict] = []
    with open(_LOG_FILE) as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    events.append(json.loads(line))
                except Exception:
                    pass
    return events[-limit:]


def get_summary(events: list[dict]) -> dict:
    if not events:
        return {
            "total_requests": 0,
            "success_rate": 0.0,
            "avg_duration_ms": 0.0,
            "total_tokens": 0,
            "total_prompt_tokens": 0,
            "total_completion_tokens": 0,
            "avg_tool_calls": 0.0,
            "error_count": 0,
        }

    total = len(events)
    successes = sum(1 for e in events if e.get("success", False))
    errors = total - successes
    durations = [e["duration_ms"] for e in events if "duration_ms" in e]
    tool_calls = [e["tool_calls"] for e in events if "tool_calls" in e]

    return {
        "total_requests": total,
        "success_rate": round(successes / total, 4),
        "avg_duration_ms": round(sum(durations) / len(durations), 1) if durations else 0.0,
        "total_tokens": sum(e.get("total_tokens", 0) for e in events),
        "total_prompt_tokens": sum(e.get("prompt_tokens", 0) for e in events),
        "total_completion_tokens": sum(e.get("completion_tokens", 0) for e in events),
        "avg_tool_calls": round(sum(tool_calls) / len(tool_calls), 2) if tool_calls else 0.0,
        "error_count": errors,
    }
