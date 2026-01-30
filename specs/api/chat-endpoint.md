# Chat API Endpoint (Phase-3)

## Endpoint
POST /api/{user_id}/chat

## Request Body
- conversation_id: integer (optional)
  - agar na ho → backend new conversation create kare
- message: string (required)

## Response
- conversation_id: integer
- response: string
- tool_calls: array (optional)
