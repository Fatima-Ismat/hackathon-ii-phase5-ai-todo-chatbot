# MCP Tools (Phase-3)

Agent ko tasks manage karne ke liye ye tools milenge:

## add_task
Params:
- user_id (string, required)
- title (string, required)
- description (string, optional)
Returns:
- task_id, status, title

## list_tasks
Params:
- user_id (string, required)
- status (optional: all | pending | completed)
Returns:
- tasks array

## complete_task
Params:
- user_id (string, required)
- task_id (int, required)
Returns:
- task_id, status, title

## delete_task
Params:
- user_id (string, required)
- task_id (int, required)
Returns:
- task_id, status, title

## update_task
Params:
- user_id (string, required)
- task_id (int, required)
- title (optional)
- description (optional)
Returns:
- task_id, status, title
