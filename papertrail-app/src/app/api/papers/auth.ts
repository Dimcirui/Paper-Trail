import { NextRequest } from "next/server";

const WRITE_ROLES = new Set(["admin", "principal_investigator"]);
const EMAIL_ROLES = new Set(["admin", "principal_investigator"]);

export type AuthorizationResult = {
  authorized: boolean;
  role?: string;
  message?: string;
};

/**
 * Validates the bearer token and extracts the caller role from the request headers.
 */
export function authorizeRequest(req: NextRequest): AuthorizationResult {
  const token = process.env.API_AUTH_TOKEN;
  if (!token) {
    console.error("API_AUTH_TOKEN is not configured. Requests are denied.");
    return {
      authorized: false,
      message: "Server configuration error. Contact administrator.",
    };
  }
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return { authorized: false, message: "Missing Authorization header." };
  }
  if (authHeader !== `Bearer ${token}`) {
    return { authorized: false, message: "Invalid credentials." };
  }
  return {
    authorized: true,
    role: req.headers.get("x-user-role")?.toLowerCase() ?? "viewer",
  };
}

export function hasWritePermission(role?: string) {
  return Boolean(role && WRITE_ROLES.has(role));
}

export function canIncludeEmails(role?: string) {
  return Boolean(role && EMAIL_ROLES.has(role));
}
