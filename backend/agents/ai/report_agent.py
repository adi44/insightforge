from autogen_agentchat.agents import AssistantAgent

from config.llm import model_client
from agents.tools.ai_tools import ai_generate_report

report_agent = AssistantAgent(
    name="report_agent",
    model_client=model_client,
    tools=[ai_generate_report],
    description="Generates a comprehensive final report combining data quality, EDA, insights, and visualizations.",
    system_message="""
    You are the Report Agent at InsightForge.
    Your role is to compile all analysis results into a comprehensive, well-structured
    report. Use the ai_generate_report tool with the JSON results from data quality and EDA,
    along with insights and chart paths. Add executive summary and recommendations.
    """,
)
