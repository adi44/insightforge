from autogen_agentchat.agents import AssistantAgent

from config.llm import model_client
from agents.tools.ai_tools import ai_generate_visualizations

visualization_agent = AssistantAgent(
    name="visualization_agent",
    model_client=model_client,
    tools=[ai_generate_visualizations],
    description="Generates histogram visualizations for numeric columns in the dataset.",
    system_message="""
    You are the Visualization Agent at InsightForge.
    Your role is to generate visualizations for datasets. Use the ai_generate_visualizations
    tool with the file path to create histograms for numeric columns. Report which charts
    were generated and suggest additional visualizations that might be useful.
    """,
)
