import os
from typing import Sequence

from dotenv import load_dotenv
from autogen_ext.models.anthropic import AnthropicChatCompletionClient
from autogen_core.models import AssistantMessage, LLMMessage

load_dotenv()


class PatchedAnthropicClient(AnthropicChatCompletionClient):
    def _rstrip_last_assistant_message(self, messages: Sequence[LLMMessage]) -> Sequence[LLMMessage]:
        # Claude Sonnet 4.6 rejects conversations ending with an assistant message.
        # AutoGen sends the full history including the last assistant turn — strip it.
        msgs = list(messages)
        while msgs and isinstance(msgs[-1], AssistantMessage):
            msgs.pop()
        return msgs


model_client = PatchedAnthropicClient(
    model=os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6"),
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    max_tokens=int(os.getenv("ANTHROPIC_MAX_TOKENS", 4096)),
)