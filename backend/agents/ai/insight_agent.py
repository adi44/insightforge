from autogen_agentchat.agents import AssistantAgent

from config.llm import model_client

insight_agent = AssistantAgent(
    name="insight_agent",
    model_client=model_client,
    description="Derives actionable business insights from the data quality and EDA results.",
    system_message="""
    You are the Insight Agent at InsightForge.
    Your role is to analyze the outputs from data quality checks and exploratory data
    analysis, then derive actionable business insights. Focus on:
    - Identifying trends and anomalies
    - Highlighting potential business implications
    - Suggesting data-driven recommendations
    - Flagging areas that need further investigation

    Provide clear, concise insights that a non-technical stakeholder can understand.
    """,
)
