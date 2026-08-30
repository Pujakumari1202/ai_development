import type { Pool, PoolClient } from "pg";

import type { CRMDataInput } from "./validation.js";

export class CrmRepository {
  constructor(private readonly database: Pool) {}

  async getAll(): Promise<CRMDataInput> {
    const [managers, customers, customerContacts, suppliers, supplierContacts, tickets, messages] =
      await Promise.all([
        this.database.query("SELECT external_id, name, email, phone FROM crm_manager ORDER BY name"),
        this.database.query(`
          SELECT c.id, c.external_id, c.account_name, m.name AS manager
          FROM customer_account c
          LEFT JOIN crm_customer_manager cm ON cm.customer_account_id = c.id
          LEFT JOIN crm_manager m ON m.external_id = cm.manager_id
          ORDER BY c.account_name
        `),
        this.database.query("SELECT * FROM customer_contact ORDER BY external_id"),
        this.database.query("SELECT id, external_id, account_name FROM supplier_account ORDER BY account_name"),
        this.database.query("SELECT * FROM supplier_contact ORDER BY external_id"),
        this.database.query(`
          SELECT t.external_id, ca.account_name AS customer, sa.account_name AS supplier,
                 m.name AS manager, t.status, t.summary, t.updated_at
          FROM crm_ticket t
          JOIN customer_account ca ON ca.id = t.customer_account_id
          JOIN supplier_account sa ON sa.id = t.supplier_account_id
          JOIN crm_manager m ON m.external_id = t.manager_id
          ORDER BY t.updated_at DESC
        `),
        this.database.query("SELECT * FROM crm_ticket_message ORDER BY sent_at"),
      ]);

    return {
      managers: managers.rows.map((row) => ({
        id: row.external_id,
        name: row.name,
        email: row.email,
        phone: row.phone,
      })),
      customers: customers.rows.map((row) => ({
        id: row.external_id,
        name: row.account_name,
        manager: row.manager ?? "",
        contacts: customerContacts.rows
          .filter((contact) => contact.customer_account_id === row.id)
          .map(mapContact),
      })),
      suppliers: suppliers.rows.map((row) => ({
        id: row.external_id,
        name: row.account_name ?? "",
        contacts: supplierContacts.rows
          .filter((contact) => String(contact.supplier_account_id) === String(row.id))
          .map(mapContact),
      })),
      tickets: tickets.rows.map((row) => ({
        id: row.external_id,
        customer: row.customer,
        supplier: row.supplier,
        manager: row.manager,
        status: row.status,
        summary: row.summary,
        updatedAt: new Date(row.updated_at).toISOString(),
        conversation: messages.rows
          .filter((message) => message.ticket_id === row.external_id)
          .map((message) => ({
            id: message.external_id,
            sender: message.sender,
            text: message.text,
            timestamp: new Date(message.sent_at).toISOString(),
          })),
      })),
    };
  }

  async replaceAll(data: CRMDataInput, actor = "api"): Promise<CRMDataInput> {
    const client = await this.database.connect();
    try {
      await client.query("BEGIN");
      await clearOperationalData(client);

      for (const manager of data.managers) {
        await client.query(
          `INSERT INTO crm_manager(external_id, name, email, phone)
           VALUES ($1, $2, $3, $4)`,
          [manager.id, manager.name, manager.email, manager.phone],
        );
      }

      const managerIds = new Map(data.managers.map((manager) => [manager.name, manager.id]));
      const customerIds = new Map<string, number>();
      for (const customer of data.customers) {
        const result = await client.query(
          `INSERT INTO customer_account(
             external_id, account_name, email, phone, primary_contact_name, created_by, updated_by
           ) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id`,
          [
            customer.id,
            customer.name,
            customer.contacts[0]?.email || null,
            customer.contacts[0]?.phone || null,
            customer.contacts[0]?.name || null,
            actor,
          ],
        );
        const accountId = result.rows[0].id as number;
        customerIds.set(customer.name, accountId);
        const managerId = managerIds.get(customer.manager);
        if (!managerId) throw new Error(`Unknown manager: ${customer.manager}`);
        await client.query(
          "INSERT INTO crm_customer_manager(customer_account_id, manager_id) VALUES ($1, $2)",
          [accountId, managerId],
        );
        await insertContacts(client, "customer", accountId, customer.contacts);
      }

      const supplierIds = new Map<string, string>();
      for (const supplier of data.suppliers) {
        const result = await client.query(
          `INSERT INTO supplier_account(
             external_id, account_name, email, phone, primary_contact_name, created_by, updated_by
           ) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id`,
          [
            supplier.id,
            supplier.name,
            supplier.contacts[0]?.email || null,
            supplier.contacts[0]?.phone || null,
            supplier.contacts[0]?.name || null,
            actor,
          ],
        );
        const accountId = String(result.rows[0].id);
        supplierIds.set(supplier.name, accountId);
        await insertContacts(client, "supplier", accountId, supplier.contacts);
      }

      for (const ticket of data.tickets) {
        const customerId = customerIds.get(ticket.customer);
        const supplierId = supplierIds.get(ticket.supplier);
        const managerId = managerIds.get(ticket.manager);
        if (!customerId || !supplierId || !managerId) {
          throw new Error(`Ticket ${ticket.id} references an unknown account or manager`);
        }
        await client.query(
          `INSERT INTO crm_ticket(
             external_id, customer_account_id, supplier_account_id, manager_id,
             status, summary, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            ticket.id, customerId, supplierId, managerId,
            ticket.status, ticket.summary, ticket.updatedAt,
          ],
        );
        for (const message of ticket.conversation) {
          await client.query(
            `INSERT INTO crm_ticket_message(external_id, ticket_id, sender, text, sent_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [message.id, ticket.id, message.sender, message.text, message.timestamp],
          );
        }
      }

      await client.query("COMMIT");
      return data;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

async function clearOperationalData(client: PoolClient): Promise<void> {
  await client.query("DELETE FROM crm_ticket_message");
  await client.query("DELETE FROM crm_ticket");
  await client.query("DELETE FROM customer_contact");
  await client.query("DELETE FROM supplier_contact");
  await client.query("DELETE FROM crm_customer_manager");
  await client.query("DELETE FROM customer_account");
  await client.query("DELETE FROM supplier_account");
  await client.query("DELETE FROM crm_manager");
}

async function insertContacts(
  client: PoolClient,
  kind: "customer" | "supplier",
  accountId: number | string,
  contacts: CRMDataInput["customers"][number]["contacts"],
): Promise<void> {
  const table = kind === "customer" ? "customer_contact" : "supplier_contact";
  const accountColumn = `${kind}_account_id`;
  for (const contact of contacts) {
    await client.query(
      `INSERT INTO ${table}(external_id, ${accountColumn}, name, email, phone)
       VALUES ($1, $2, $3, $4, $5)`,
      [contact.id, accountId, contact.name, contact.email, contact.phone],
    );
  }
}

function mapContact(row: Record<string, unknown>) {
  return {
    id: String(row.external_id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone),
  };
}
