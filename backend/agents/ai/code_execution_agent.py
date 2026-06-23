"""Code execution agent for dataset Q&A.

Flow:
  1. Build a compact schema context (column names, types, 3 sample values).
  2. Send schema + user question to the LLM with the execute_pandas_code tool.
  3. LLM emits a tool call with Python/pandas code.
  4. We run the code against the real DataFrame via the sandboxed tool.
  5. Append the tool result and let the LLM produce the final answer.
"""

import json

import pandas as pd
from openai import AsyncOpenAI

from agents.tools.code_execution_tool import EXECUTE_TOOL, execute_pandas_code


def build_schema_context(df: pd.DataFrame) -> str:
    lines = [f"Shape: {df.shape[0]} rows × {df.shape[1]} columns", "", "Columns:"]
    for col, dtype in df.dtypes.items():
        samples = df[col].dropna().head(3).tolist()
        lines.append(f"  {col!r} ({dtype}) — e.g. {samples}")
    lines += ["", "First 3 rows:", df.head(3).to_string(index=False)]
    return "\n".join(lines)


async def run(
    question: str,
    df: pd.DataFrame,
    history: list[dict],
    client: AsyncOpenAI,
    model: str,
    filename: str,
) -> str:
    schema = build_schema_context(df)
    system = (
        f'You are InsightForge AI, an expert data analyst. The user has uploaded "{filename}".\n\n'
        f"## Dataset schema\n{schema}\n\n"
        "To answer questions, call the `execute_pandas_code` tool with pandas code that assigns "
        "the precise answer to `result`. Then interpret the result for the user in plain English. "
        "Reference exact numbers from the execution output. Never guess — always compute."
    )

    messages: list[dict] = [{"role": "system", "content": system}]
    for msg in history[-10:]:
        if msg.get("role") in ("user", "assistant"):
            messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": question})

    for _ in range(3):
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            tools=[EXECUTE_TOOL],
            tool_choice="auto",
            max_tokens=2048,
            temperature=0.2,
        )
        choice = response.choices[0]

        if choice.finish_reason == "tool_calls":
            messages.append(choice.message)
            for tc in choice.message.tool_calls:
                try:
                    code = json.loads(tc.function.arguments)["code"]
                except Exception:
                    code = tc.function.arguments
                output = execute_pandas_code(code, df)
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "content": output,
                })
        else:
            return choice.message.content or ""

    return "Could not produce an answer after multiple attempts."
