# Phase-3 Architecture

Request Flow (Stateless):
1. ChatKit UI → POST /api/{user_id}/chat
2. Backend DB se conversation load karta hai (ya new banata hai)
3. User message DB me save hota hai
4. OpenAI Agent run hota hai (Agents SDK)
5. Agent MCP tools call karta hai (task CRUD)
6. Assistant response + tool calls DB me save hotay hain
7. Response frontend ko return hota hai

Database Tables:
- tasks
- conversations
- messages

Important:
Server kisi bhi conversation ko memory me hold nahi karta.
