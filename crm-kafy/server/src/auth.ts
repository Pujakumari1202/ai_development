import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";

import { config } from "./config.js";

let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function authenticate(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  if (config.authDisabled) {
    next();
    return;
  }
  if (!config.KEYCLOAK_ISSUER || !config.KEYCLOAK_AUDIENCE) {
    response.status(503).json({ error: "Authentication is not configured" });
    return;
  }

  const [scheme, token] = request.headers.authorization?.split(" ") ?? [];
  if (scheme !== "Bearer" || !token) {
    response.status(401).json({ error: "Bearer token required" });
    return;
  }

  try {
    jwks ??= createRemoteJWKSet(
      new URL(`${config.KEYCLOAK_ISSUER.replace(/\/$/, "")}/protocol/openid-connect/certs`),
    );
    const { payload } = await jwtVerify(token, jwks, {
      issuer: config.KEYCLOAK_ISSUER,
      audience: config.KEYCLOAK_AUDIENCE,
    });
    response.locals.user = payload;
    next();
  } catch {
    response.status(401).json({ error: "Invalid or expired token" });
  }
}
