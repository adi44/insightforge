from autogen_agentchat.agents import AssistantAgent

from config.llm import model_client
from agents.tools.ai_tools import ai_analyze_data_quality

data_quality_agent = AssistantAgent(
    name="data_quality_agent",
    model_client=model_client,
    tools=[ai_analyze_data_quality],
    description="Analyzes dataset quality by checking for missing values, duplicates, and data types.",
    system_message="""
    You are the Data Quality Agent at InsightForge.
    Your role is to analyze the quality of datasets by checking for missing values,
    duplicates, and data types. Use the ai_analyze_data_quality tool with the file path
    when given a dataset. Summarize your findings clearly and flag any critical quality issues.
    """,
)
