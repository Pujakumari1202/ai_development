# AI SQL Query System

This project uses a workflow of:
- user input
- intent/entity extraction
- query generation via Azure OpenAI
- optional clarification loop
- SQL execution against PostgreSQL
- natural language response formatting

## Fixes applied
- Updated `.env` DB_HOST to `localhost`
- Corrected schema to use `product` table
- Removed unsupported `temperature=0` from response generation
- Added debug logging for traceability

## Test command
```bash
python test_e2e.py
```

working
