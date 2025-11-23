export type UserRole =
  | "admin"
  | "principal_investigator"
  | "contributor"
  | "viewer";

export function getCurrentUserRole(): UserRole {
  const role =
    process.env.NEXT_PUBLIC_USER_ROLE?.toLowerCase() ??
    process.env.USER_ROLE?.toLowerCase() ??
    "admin";
  if (
    role === "admin" ||
    role === "principal_investigator" ||
    role === "contributor" ||
    role === "viewer"
  ) {
    return role;
  }
  return "viewer";
}

export function canEditContent(role: UserRole) {
  return role === "admin" || role === "principal_investigator";
}
