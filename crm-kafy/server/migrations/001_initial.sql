BEGIN;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE lead (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  company VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'New'
    CHECK (status IN ('New', 'Contacted', 'Qualified', 'Lost', 'Converted')),
  lead_type VARCHAR(50)
    CHECK (lead_type IS NULL OR lead_type IN (
      'Supplier', 'Restaurant', 'Retail Store', 'Office Pantry',
      'Cafe', 'Home Business', 'Kitchen'
    )),
  source VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_lead_email ON lead(email);
CREATE INDEX idx_lead_status ON lead(status);

CREATE TABLE supplier_account (
  id BIGSERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES lead(id) ON DELETE SET NULL ON UPDATE CASCADE,
  external_id VARCHAR(100) NOT NULL UNIQUE,
  account_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  primary_contact_name VARCHAR(255),
  rebate_percentage DECIMAL(10, 2) NOT NULL DEFAULT 0,
  margin_default_percentage DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE supplier_account_users (
  id BIGSERIAL PRIMARY KEY,
  supplier_account_id BIGINT NOT NULL
    REFERENCES supplier_account(id) ON DELETE CASCADE ON UPDATE CASCADE,
  keycloak_user_id VARCHAR(36) NOT NULL,
  role VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_supplier_account_users
    UNIQUE (supplier_account_id, keycloak_user_id)
);

CREATE TABLE customer_account (
  id SERIAL PRIMARY KEY,
  lead_id INTEGER REFERENCES lead(id) ON DELETE SET NULL ON UPDATE CASCADE,
  external_id VARCHAR(100) NOT NULL UNIQUE,
  account_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  primary_contact_name VARCHAR(255),
  type_of_business VARCHAR(100)
    CHECK (type_of_business IS NULL OR type_of_business IN (
      'Office Pantry', 'Cafe', 'Grocery', 'Home Business',
      'Kitchen', 'Hotel', 'Restaurant'
    )),
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_account_users (
  id BIGSERIAL PRIMARY KEY,
  customer_account_id INTEGER NOT NULL
    REFERENCES customer_account(id) ON DELETE CASCADE ON UPDATE CASCADE,
  keycloak_user_id VARCHAR(36) NOT NULL,
  role VARCHAR(10) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_customer_account_users
    UNIQUE (customer_account_id, keycloak_user_id)
);

CREATE TABLE customer_branch (
  id SERIAL PRIMARY KEY,
  branch_name VARCHAR(255) NOT NULL,
  is_hq BOOLEAN NOT NULL DEFAULT FALSE,
  customer_account_id INTEGER NOT NULL
    REFERENCES customer_account(id) ON DELETE CASCADE ON UPDATE CASCADE,
  shop_name VARCHAR(255),
  zone_number VARCHAR(50),
  street_number VARCHAR(50),
  building_number VARCHAR(50),
  phone_country_code VARCHAR(10),
  phone_number VARCHAR(50),
  notes TEXT,
  created_by VARCHAR(255) NOT NULL,
  updated_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Operational CRM tables required by the existing application.
CREATE TABLE crm_manager (
  external_id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_customer_manager (
  customer_account_id INTEGER PRIMARY KEY
    REFERENCES customer_account(id) ON DELETE CASCADE,
  manager_id VARCHAR(100) NOT NULL
    REFERENCES crm_manager(external_id) ON DELETE RESTRICT
);

CREATE TABLE customer_contact (
  external_id VARCHAR(100) PRIMARY KEY,
  customer_account_id INTEGER NOT NULL
    REFERENCES customer_account(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT ''
);

CREATE TABLE supplier_contact (
  external_id VARCHAR(100) PRIMARY KEY,
  supplier_account_id BIGINT NOT NULL
    REFERENCES supplier_account(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL DEFAULT '',
  phone VARCHAR(50) NOT NULL DEFAULT ''
);

CREATE TABLE crm_ticket (
  external_id VARCHAR(100) PRIMARY KEY,
  customer_account_id INTEGER NOT NULL REFERENCES customer_account(id),
  supplier_account_id BIGINT NOT NULL REFERENCES supplier_account(id),
  manager_id VARCHAR(100) NOT NULL REFERENCES crm_manager(external_id),
  status VARCHAR(30) NOT NULL CHECK (
    status IN ('OPEN', 'WAITING_SUPPLIER', 'WAITING_CUSTOMER', 'CLOSED')
  ),
  summary TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crm_ticket_message (
  external_id VARCHAR(100) PRIMARY KEY,
  ticket_id VARCHAR(100) NOT NULL
    REFERENCES crm_ticket(external_id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL CHECK (
    sender IN ('CUSTOMER', 'AGENT', 'SUPPLIER', 'SYSTEM')
  ),
  text TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  whatsapp_message_id VARCHAR(255)
);

CREATE TRIGGER lead_updated_at BEFORE UPDATE ON lead
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER supplier_account_updated_at BEFORE UPDATE ON supplier_account
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER customer_account_updated_at BEFORE UPDATE ON customer_account
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER customer_branch_updated_at BEFORE UPDATE ON customer_branch
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER crm_manager_updated_at BEFORE UPDATE ON crm_manager
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
