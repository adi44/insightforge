"""Thin wrappers around core tools for use with AutoGen AI agents.

These accept JSON-serializable inputs (file paths, strings) so they can be
called by an LLM via tool use. They load data internally.
"""

from pathlib import Path

import pandas as pd

from agents.tools.data_quality_tool import analyze_data_quality
from agents.tools.eda_tool import run_eda
from agents.tools.visualization_tool import generate_visualizations
from agents.tools.report_tool import generate_report


def ai_analyze_data_quality(file_path: str) -> str:
    """Analyze dataset quality. Returns a summary of missing values, duplicates, and column types."""
    df = pd.read_csv(file_path)
    result = analyze_data_quality(df)
    return result.model_dump_json(indent=2)


def ai_run_eda(file_path: str) -> str:
    """Run exploratory data analysis on a dataset. Returns summary statistics, value counts, and correlations."""
    df = pd.read_csv(file_path)
    result = run_eda(df)
    return result.model_dump_json(indent=2)


def ai_generate_visualizations(file_path: str) -> str:
    """Generate histogram visualizations for numeric columns. Returns list of generated chart paths."""
    df = pd.read_csv(file_path)
    charts = generate_visualizations(df)
    return "\n".join(charts)


def ai_generate_report(
    quality_json: str,
    eda_json: str,
    insights: list[str],
    chart_paths: list[str],
) -> str:
    """Compile a final report from data quality results, EDA results, insights, and chart paths."""
    from app.schemas.data_quality import DataQualityResult
    from app.schemas.eda import EDAResult

    quality_result = DataQualityResult.model_validate_json(quality_json)
    eda_result = EDAResult.model_validate_json(eda_json)
    return generate_report(quality_result, eda_result, insights, chart_paths)
