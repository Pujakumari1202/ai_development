# AI Procurement LangGraph System

This project uses a workflow of:
- user input
- intent/entity extraction
- procurement workflow routing via Azure OpenAI
- optional clarification loop
- human-in-the-loop operations when negotiation or order placement is needed
- SQL execution against PostgreSQL
- natural language response formatting

## Current schema
- `customers`
- `suppliers`
- `products`
- `orders`
- `order_lines`

The uploaded `schema.sql` and `data.sql` are the current source of truth.

## Conversation memory
Conversation history can be stored in PostgreSQL using:
- `public.conversation_sessions`
- `public.conversation_messages`

Create those tables by running [conversation_memory.sql](c:/Users/PUJA%20KUMARI/Desktop/ai_development/conversation_memory.sql) once in your database.

## Local setup
Create a `.env` file in the project root and set:

```env
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_DEPLOYMENT=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=demo_db
DB_USER=postgres
DB_PASSWORD=password12
```

If you are using [docker-compose.yml](c:/Users/PUJA%20KUMARI/Desktop/ai_development/docker-compose.yml), start PostgreSQL with:

```bash
docker compose up -d postgres
```

Then start the MCP server:

```bash
cd mcp/db-mcp
python main.py
```

Then start the LangGraph app:

```bash
python main.py
```

## Test command
```bash
python test_e2e.py
```
