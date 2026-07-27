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

CREATE TABLE IF NOT EXISTS public.pending_supplier_outreach (
    outreach_id BIGSERIAL PRIMARY KEY,
    customer_session_id VARCHAR(100) NOT NULL,
    customer_phone_number VARCHAR(30) NOT NULL,
    supplier_phone_number VARCHAR(30) NOT NULL,
    supplier_name VARCHAR(100) NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER,
    request_message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    supplier_reply TEXT,
    replied_at TIMESTAMP
);