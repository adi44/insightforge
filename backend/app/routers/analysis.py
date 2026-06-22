import asyncio
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from agents.tools.data_quality_tool import analyze_data_quality
from agents.tools.eda_tool import run_eda
from agents.tools.visualization_tool import generate_visualizations
from agents.tools.report_tool import generate_report
from app.services.dataset_service import DatasetService

router = APIRouter(tags=["analysis"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "data"


class AnalysisRequest(BaseModel):
    filename: str


class AgentAnalysisRequest(BaseModel):
    filename: str
    task: str = ""


@router.post("/analysis/run")
async def run_analysis(req: AnalysisRequest):
    file_path = UPLOAD_DIR / req.filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    dataset = DatasetService.load_dataset(file_path)
    if dataset.empty:
        raise HTTPException(status_code=400, detail="Failed to load dataset")

    quality_result = analyze_data_quality(dataset)
    eda_result = run_eda(dataset)
    charts = generate_visualizations(dataset)
    insights = [
        f"Dataset has {quality_result.total_records} records across {quality_result.total_columns} columns",
        f"Missing values: {quality_result.missing_values} ({quality_result.missing_values / max(quality_result.total_records * quality_result.total_columns, 1) * 100:.1f}%)",
        f"Duplicate rows: {quality_result.duplicate_rows}",
    ]
    report = generate_report(quality_result, eda_result, insights, charts)

    return {
        "quality": quality_result.model_dump(),
        "eda": eda_result.model_dump(),
        "charts": charts,
        "insights": insights,
        "report": report,
    }


@router.post("/analysis/agent")
async def run_agent_analysis(req: AgentAnalysisRequest):
    file_path = UPLOAD_DIR / req.filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Dataset not found")

    task = req.task or (
        f"Analyze the dataset at {file_path}. "
        "First check data quality, then perform EDA, derive insights, "
        "generate visualizations, and compile a final report."
    )

    from workflows.analytics_team import run_analytics_pipeline
    result = await run_analytics_pipeline(task)
    return result
