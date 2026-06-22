from autogen_agentchat.teams import RoundRobinGroupChat

from agents.ai.eda_agent import eda_agent
from agents.ai.insight_agent import insight_agent
from agents.ai.visualization_agent import visualization_agent
from agents.ai.report_agent import report_agent
from agents.ai.admin_agent import admin_agent
from agents.ai.data_quality_agent import data_quality_agent

analytics_team = RoundRobinGroupChat(
    participants=[
        admin_agent,
        data_quality_agent,
        eda_agent,
        insight_agent,
        visualization_agent,
        report_agent,
    ]
)