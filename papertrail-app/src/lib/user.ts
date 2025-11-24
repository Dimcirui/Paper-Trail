import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type UserRole =
  | "admin"
  | "principal_investigator"
  | "contributor"
  | "viewer";

export type AuthContext = {
  role: UserRole;
  isAuthenticated: boolean;
  userName?: string;
  userId?: number;
};

const JWT_SECRET = process.env.JWT_SECRET;

export async function getAuthContext(): Promise<AuthContext> {
  if (!JWT_SECRET) {
    return { role: "viewer", isAuthenticated: false };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) {
    return { role: "viewer", isAuthenticated: false };
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
    );
    const parsedRole = normalizeRole(payload.role);
    const userId =
      typeof payload.userId === "bigint"
        ? Number(payload.userId)
        : typeof payload.userId === "number"
          ? payload.userId
          : undefined;
    const userName =
      typeof payload.userName === "string" && payload.userName.length > 0
        ? payload.userName
        : undefined;
    if (parsedRole) {
      return {
        role: parsedRole,
        isAuthenticated: true,
        userId,
        userName,
      };
    }
  } catch (error) {
    console.warn("Failed to verify auth token", error);
  }

  return { role: "viewer", isAuthenticated: false };
}

export async function getCurrentUserRole(): Promise<UserRole> {
  const { role } = await getAuthContext();
  return role;
}

export function canEditContent(role: UserRole) {
  return role === "admin" || role === "principal_investigator";
}

function normalizeRole(roleValue: unknown): UserRole | null {
  if (typeof roleValue !== "string") {
    return null;
  }
  const role = roleValue.toLowerCase().replace(/\s+/g, "_");
  if (role === "research_admin" || role === "admin") {
    return "admin";
  }
  if (
    role === "principal_investigator" ||
    role === "principalinvestigator" ||
    role === "pi"
  ) {
    return "principal_investigator";
  }
  if (role === "contributor") {
    return "contributor";
  }
  if (role === "viewer") {
    return "viewer";
  }
  return null;
}
