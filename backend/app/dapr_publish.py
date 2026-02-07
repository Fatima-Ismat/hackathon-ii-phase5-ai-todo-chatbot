import os
import httpx
from typing import Any, Dict

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
PUBSUB_NAME = os.getenv("DAPR_PUBSUB_NAME", "kafka-pubsub")
TOPIC_NAME = os.getenv("DAPR_TOPIC_NAME", "task-events")


async def publish_task_event(event_type: str, task: Dict[str, Any]):
    """
    Publish task events to Dapr Pub/Sub.
    If Dapr is not running or unreachable, fail silently (no crash).
    """
    url = f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/{PUBSUB_NAME}/{TOPIC_NAME}"

    payload = {
        "event_type": event_type,
        "task": task,
    }

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            await client.post(url, json=payload)
    except Exception:
        # Dapr optional / infra-level feature
        # App should NOT crash if Dapr is down
        pass
