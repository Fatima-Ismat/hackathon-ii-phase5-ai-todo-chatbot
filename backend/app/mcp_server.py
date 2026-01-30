# backend/app/mcp_server.py

from __future__ import annotations

import contextlib
import inspect
from typing import Any, Dict, List, Optional

from fastapi import FastAPI

from mcp.server.fastmcp import FastMCP

from app import mcp_tools


mcp = FastMCP("todo-mcp")


# -----------------------------
# Tools (MCP) -> existing DB-backed tools
# -----------------------------

@mcp.tool()
def add_task(user_id: str, title: str, description: Optional[str] = None) -> Dict[str, Any]:
    return mcp_tools.add_task(user_id=user_id, title=title, description=description)


@mcp.tool()
def list_tasks(user_id: str, status: str = "all") -> List[Dict[str, Any]]:
    return mcp_tools.list_tasks(user_id=user_id, status=status)


@mcp.tool()
def complete_task(user_id: str, task_id: int) -> Dict[str, Any]:
    return mcp_tools.complete_task(user_id=user_id, task_id=task_id)


@mcp.tool()
def delete_task(user_id: str, task_id: int) -> Dict[str, Any]:
    return mcp_tools.delete_task(user_id=user_id, task_id=task_id)


@mcp.tool()
def update_task(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
) -> Dict[str, Any]:
    return mcp_tools.update_task(
        user_id=user_id,
        task_id=task_id,
        title=title,
        description=description,
    )


# -----------------------------
# Mount helper (FastAPI -> MCP)
# -----------------------------

def _build_mcp_asgi():
    """
    Version-compatible builder for FastMCP ASGI app.
    Different MCP versions expose different kwargs.
    We try a few safe call patterns.
    """
    fn = getattr(mcp, "streamable_http_app", None)
    if fn is None:
        raise RuntimeError("FastMCP.streamable_http_app() not found. MCP install may be incorrect.")

    sig = inspect.signature(fn)
    params = set(sig.parameters.keys())

    # Try most complete (newer versions)
    if {"streamable_http_path", "stateless_http", "json_response"} <= params:
        return fn(streamable_http_path="/", stateless_http=True, json_response=True)

    # Try slightly older (no streamable_http_path)
    if {"stateless_http", "json_response"} <= params:
        return fn(stateless_http=True, json_response=True)

    if {"path", "stateless_http", "json_response"} <= params:
        return fn(path="/", stateless_http=True, json_response=True)

    # Fallback: call with no kwargs
    return fn()


def mount_mcp(app: FastAPI, path: str = "/mcp") -> None:
    """
    Mount MCP on FastAPI at /mcp.
    """
    mcp_asgi = _build_mcp_asgi()
    app.mount(path, mcp_asgi)


@contextlib.asynccontextmanager
async def mcp_lifespan(app: FastAPI):
    """
    Keep MCP session manager running when supported.
    If session_manager is missing in your MCP version, it still works without it.
    """
    mgr = getattr(mcp, "session_manager", None)
    if mgr is None:
        yield
        return

    run = getattr(mgr, "run", None)
    if run is None:
        yield
        return

    async with run():
        yield
