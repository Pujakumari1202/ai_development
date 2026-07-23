CREATE TABLE IF NOT EXISTS public.conversation_sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    active_order_context JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.conversation_messages (
    message_id BIGSERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation_session
        FOREIGN KEY (session_id)
        REFERENCES public.conversation_sessions(session_id)
        ON DELETE CASCADE
);