import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import MaxMessageTermination

from config.llm import model_client
from agents.ai.admin_agent import admin_agent
from agents.ai.data_quality_agent import data_quality_agent
from agents.ai.eda_agent import eda_agent
from agents.ai.insight_agent import insight_agent
from agents.ai.visualization_agent import visualization_agent
from agents.ai.report_agent import report_agent


termination = MaxMessageTermination(max_messages=20)

analytics_team = SelectorGroupChat(
    participants=[
        admin_agent,
        data_quality_agent,
        eda_agent,
        insight_agent,
        visualization_agent,
        report_agent,
    ],
    model_client=model_client,
    termination_condition=termination,
)


async def run_analytics_pipeline(task: str) -> dict:
    try:
        result = await analytics_team.run(task=task)
        messages = [
            {"source": msg.source, "content": str(msg.content)[:500]}
            for msg in result.messages
        ]
        return {"status": "complete", "messages": messages}
    except Exception as e:
        error_msg = str(e)
        if "prefill" in error_msg.lower() or "must end with a user message" in error_msg:
            return {
                "status": "error",
                "error": "The AI agent framework has a compatibility issue with this Claude model version. "
                         "Please use the direct analysis endpoint (/api/analysis/run) which runs the same "
                         "tools without the multi-agent orchestration.",
                "detail": "autogen-ext sends assistant prefills which Claude Sonnet 4.6 does not support. "
                          "Upgrade autogen-ext or switch to claude-haiku-4-5 once supported.",
            }
        return {
            "status": "error",
            "error": f"Agent pipeline encountered an error: {error_msg}",
        }


if __name__ == "__main__":
    task = (
        "Analyze the dataset at /home/aditya/insightforge/backend/data/sample_dataset.csv. "
        "First check data quality, then perform EDA, derive insights, "
        "generate visualizations, and compile a final report."
    )
    result = asyncio.run(run_analytics_pipeline(task))
    if result["status"] == "error":
        print(f"Error: {result['error']}")
    else:
        for msg in result["messages"]:
            print(f"[{msg['source']}]: {msg['content']}")

