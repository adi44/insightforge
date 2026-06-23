"""Pandas code execution tool definition and sandboxed runner."""

import io
import traceback
from contextlib import redirect_stdout
from typing import Any

import numpy as np
import pandas as pd

EXECUTE_TOOL: dict[str, Any] = {
    "type": "function",
    "function": {
        "name": "execute_pandas_code",
        "description": (
            "Execute Python/pandas code against the dataset DataFrame `df`. "
            "Assign your final answer to a variable called `result`. "
            "`df`, `pd`, and `np` are pre-imported. Do not import anything else."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "description": "Python code to run. Must assign the answer to `result`.",
                }
            },
            "required": ["code"],
        },
    },
}

_SAFE_BUILTINS = {
    "abs": abs, "bool": bool, "dict": dict, "enumerate": enumerate,
    "float": float, "int": int, "isinstance": isinstance, "len": len,
    "list": list, "max": max, "min": min, "print": print, "range": range,
    "round": round, "set": set, "sorted": sorted, "str": str,
    "sum": sum, "tuple": tuple, "type": type, "zip": zip,
}


def execute_pandas_code(code: str, df: pd.DataFrame) -> str:
    """Run `code` in a restricted sandbox with `df`, `pd`, and `np` available."""
    namespace: dict[str, Any] = {
        "__builtins__": _SAFE_BUILTINS,
        "pd": pd,
        "np": np,
        "df": df.copy(),
        "result": None,
    }
    buf = io.StringIO()
    try:
        with redirect_stdout(buf):
            exec(code, namespace)  # noqa: S102
        result = namespace.get("result")
        printed = buf.getvalue().strip()
        if result is not None:
            if isinstance(result, pd.DataFrame):
                return result.to_string(index=False)
            if isinstance(result, pd.Series):
                return result.to_string()
            return str(result)
        if printed:
            return printed
        return "Code ran but `result` was not set and nothing was printed."
    except Exception:
        return f"Execution error:\n{traceback.format_exc()}"
