import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1).default("postgres://postgres:postgres@localhost:5432/crm_kafy"),
  CORS_ORIGIN: z.string().default("*"),
  AUTH_DISABLED: z.enum(["true", "false"]).default("true"),
  KEYCLOAK_ISSUER: z.string().url().optional(),
  KEYCLOAK_AUDIENCE: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_GRAPH_API_VERSION: z.string().regex(/^v\d+\.\d+$/).default("v21.0"),
  ALLOW_DB_RESET: z.enum(["true", "false"]).default("false"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  throw new Error(`Invalid server environment: ${parsed.error.message}`);
}

export const config = {
  ...parsed.data,
  authDisabled: parsed.data.AUTH_DISABLED === "true",
  allowDbReset: parsed.data.ALLOW_DB_RESET === "true",
};
