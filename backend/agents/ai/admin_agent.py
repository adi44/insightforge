from autogen_agentchat.agents import AssistantAgent

from config.llm import model_client

admin_agent = AssistantAgent(
    name="admin_agent",
    model_client=model_client,
    description="The Analytics Team Lead responsible for coordinating agents and delivering high-quality insights.",
    system_message="""
    You are the Analytics Team Lead at InsightForge.
    Your role is to coordinate the data analysis pipeline:
    1. Direct the Data Quality Agent to assess dataset health
    2. Direct the EDA Agent to explore patterns and statistics
    3. Direct the Insight Agent to derive business insights
    4. Direct the Visualization Agent to generate charts
    5. Direct the Report Agent to compile the final deliverable

    Ensure each step completes before moving to the next.
    Summarize the overall findings at the end.
    """,
)
