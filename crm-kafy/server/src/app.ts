import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import helmet from "helmet";
import { ZodError } from "zod";

import { authenticate } from "./auth.js";
import type { CrmRepository } from "./crm-repository.js";
import { pool } from "./db.js";
import { config } from "./config.js";
import {
  accountUserSchema,
  crmDataSchema,
  customerBranchSchema,
  leadSchema,
  whatsappMessageSchema,
} from "./validation.js";
import {
  sendWhatsAppMessage,
  type WhatsAppResult,
} from "./whatsapp.js";

type SendWhatsApp = (recipientId: string, text: string) => Promise<WhatsAppResult>;

export function createApp(
  repository: CrmRepository,
  sendWhatsApp: SendWhatsApp = sendWhatsAppMessage,
) {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({
    origin: config.CORS_ORIGIN === "*" ? true : config.CORS_ORIGIN.split(","),
  }));
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", async (_request, response, next) => {
    try {
      await pool.query("SELECT 1");
      response.json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  });

  app.use("/api", authenticate);

  app.get("/api/crm", async (_request, response, next) => {
    try {
      response.json(await repository.getAll());
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/crm", async (request, response, next) => {
    try {
      const data = crmDataSchema.parse(request.body);
      const actor = String(response.locals.user?.sub ?? "api");
      response.json(await repository.replaceAll(data, actor));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/crm/reset", async (request, response, next) => {
    if (!config.allowDbReset) {
      response.status(403).json({ error: "Database reset is disabled" });
      return;
    }
    try {
      const data = crmDataSchema.parse(request.body);
      response.json(await repository.replaceAll(data, "reset"));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/whatsapp/messages", async (request, response, next) => {
    try {
      const input = whatsappMessageSchema.parse(request.body);
      const result = await sendWhatsApp(input.recipientId, input.text);
      response.status(result.ok ? 200 : result.reason === "missing_credentials" ? 503 : 502)
        .json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/leads", async (_request, response, next) => {
    try {
      const result = await pool.query("SELECT * FROM lead ORDER BY created_at DESC");
      response.json(result.rows.map(toLead));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/leads", async (request, response, next) => {
    try {
      const input = leadSchema.parse(request.body);
      const result = await pool.query(
        `INSERT INTO lead(name, email, phone, company, status, lead_type, source, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          input.name, input.email ?? null, input.phone ?? null,
          input.company ?? null, input.status, input.leadType ?? null,
          input.source ?? null, input.notes ?? null,
        ],
      );
      response.status(201).json(toLead(result.rows[0]));
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/leads/:id", async (request, response, next) => {
    try {
      const id = parsePositiveId(request.params.id);
      const current = await pool.query("SELECT * FROM lead WHERE id = $1", [id]);
      if (!current.rowCount) {
        response.status(404).json({ error: "Lead not found" });
        return;
      }
      const existing = toLead(current.rows[0]);
      const input = leadSchema.parse({ ...existing, ...request.body });
      const result = await pool.query(
        `UPDATE lead SET name=$2, email=$3, phone=$4, company=$5, status=$6,
         lead_type=$7, source=$8, notes=$9 WHERE id=$1 RETURNING *`,
        [
          id, input.name, input.email ?? null, input.phone ?? null,
          input.company ?? null, input.status, input.leadType ?? null,
          input.source ?? null, input.notes ?? null,
        ],
      );
      response.json(toLead(result.rows[0]));
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/leads/:id", async (request, response, next) => {
    try {
      const result = await pool.query("DELETE FROM lead WHERE id = $1", [
        parsePositiveId(request.params.id),
      ]);
      response.status(result.rowCount ? 204 : 404).send();
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/customers/:externalId/branches", async (request, response, next) => {
    try {
      const result = await pool.query(
        `SELECT b.* FROM customer_branch b
         JOIN customer_account c ON c.id = b.customer_account_id
         WHERE c.external_id = $1 ORDER BY b.is_hq DESC, b.branch_name`,
        [request.params.externalId],
      );
      response.json(result.rows.map((row) => ({
        id: row.id,
        branchName: row.branch_name,
        isHq: row.is_hq,
        shopName: row.shop_name,
        zoneNumber: row.zone_number,
        streetNumber: row.street_number,
        buildingNumber: row.building_number,
        phoneCountryCode: row.phone_country_code,
        phoneNumber: row.phone_number,
        notes: row.notes,
      })));
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/customers/:externalId/branches", async (request, response, next) => {
    try {
      const input = customerBranchSchema.parse(request.body);
      const account = await accountId("customer_account", request.params.externalId);
      if (!account) {
        response.status(404).json({ error: "Customer account not found" });
        return;
      }
      const actor = String(response.locals.user?.sub ?? "api");
      const result = await pool.query(
        `INSERT INTO customer_branch(
          branch_name, is_hq, customer_account_id, shop_name, zone_number,
          street_number, building_number, phone_country_code, phone_number,
          notes, created_by, updated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$11) RETURNING *`,
        [
          input.branchName, input.isHq, account, input.shopName ?? null,
          input.zoneNumber ?? null, input.streetNumber ?? null,
          input.buildingNumber ?? null, input.phoneCountryCode ?? null,
          input.phoneNumber ?? null, input.notes ?? null, actor,
        ],
      );
      response.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/:kind/:externalId/users", async (request, response, next) => {
    try {
      if (!["customers", "suppliers"].includes(request.params.kind)) {
        response.status(404).json({ error: "Route not found" });
        return;
      }
      const isCustomer = request.params.kind === "customers";
      const table = isCustomer ? "customer_account" : "supplier_account";
      const usersTable = isCustomer ? "customer_account_users" : "supplier_account_users";
      const accountColumn = isCustomer ? "customer_account_id" : "supplier_account_id";
      const result = await pool.query(
        `SELECT u.id, u.keycloak_user_id AS "keycloakUserId", u.role, u.created_at AS "createdAt"
         FROM ${usersTable} u JOIN ${table} a ON a.id = u.${accountColumn}
         WHERE a.external_id = $1 ORDER BY u.created_at`,
        [request.params.externalId],
      );
      response.json(result.rows);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/:kind/:externalId/users", async (request, response, next) => {
    try {
      if (!["customers", "suppliers"].includes(request.params.kind)) {
        response.status(404).json({ error: "Route not found" });
        return;
      }
      const input = accountUserSchema.parse(request.body);
      const isCustomer = request.params.kind === "customers";
      const table = isCustomer ? "customer_account" : "supplier_account";
      const usersTable = isCustomer ? "customer_account_users" : "supplier_account_users";
      const accountColumn = isCustomer ? "customer_account_id" : "supplier_account_id";
      const account = await accountId(table, request.params.externalId);
      if (!account) {
        response.status(404).json({ error: "Account not found" });
        return;
      }
      const result = await pool.query(
        `INSERT INTO ${usersTable}(${accountColumn}, keycloak_user_id, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (${accountColumn}, keycloak_user_id)
         DO UPDATE SET role = EXCLUDED.role
         RETURNING id, keycloak_user_id AS "keycloakUserId", role, created_at AS "createdAt"`,
        [account, input.keycloakUserId, input.role],
      );
      response.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  });

  app.use((_request, response) => {
    response.status(404).json({ error: "Route not found" });
  });

  app.use((
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction,
  ) => {
    if (error instanceof ZodError) {
      response.status(400).json({
        error: "Validation failed",
        details: error.flatten(),
      });
      return;
    }
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  });

  return app;
}

async function accountId(
  table: "customer_account" | "supplier_account",
  externalId: string,
): Promise<number | string | null> {
  const result = await pool.query(`SELECT id FROM ${table} WHERE external_id = $1`, [externalId]);
  return result.rows[0]?.id ?? null;
}

function parsePositiveId(value: string | string[] | undefined): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ZodError([]);
  }
  return id;
}

function toLead(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    status: row.status,
    leadType: row.lead_type,
    source: row.source,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
