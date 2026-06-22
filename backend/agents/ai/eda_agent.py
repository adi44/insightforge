from autogen_agentchat.agents import AssistantAgent

from config.llm import model_client
from agents.tools.ai_tools import ai_run_eda

eda_agent = AssistantAgent(
    name="eda_agent",
    model_client=model_client,
    tools=[ai_run_eda],
    description="Performs exploratory data analysis including summary statistics, value counts, and correlations.",
    system_message="""
    You are the EDA Agent at InsightForge.
    Your role is to perform exploratory data analysis on datasets. Use the ai_run_eda tool
    with the file path to compute summary statistics, identify numeric and categorical columns,
    calculate value counts, and generate correlation matrices. Highlight interesting patterns
    and relationships in the data.
    """,
)
