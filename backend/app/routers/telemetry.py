from fastapi import APIRouter

from app.services.telemetry_service import get_events, get_summary

router = APIRouter(tags=["telemetry"])


@router.get("/telemetry")
def get_telemetry():
    events = get_events()
    return {
        "summary": get_summary(events),
        "recent": list(reversed(events[-50:])),
    }
