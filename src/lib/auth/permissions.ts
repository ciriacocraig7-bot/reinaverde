export type Role = "CLIENTE" | "ADMIN" | "CHEF" | "STAFF" | "PROVEEDOR" | "FINANZAS";

export type Permission =
  | "menu:read"
  | "menu:write"
  | "orders:read"
  | "orders:write"
  | "orders:manage"
  | "events:read"
  | "events:write"
  | "events:manage"
  | "production:read"
  | "production:write"
  | "logistics:read"
  | "logistics:write"
  | "finance:read"
  | "finance:write"
  | "suppliers:read"
  | "suppliers:write"
  | "users:read"
  | "users:write"
  | "feedback:read"
  | "feedback:write"
  | "dashboard:admin"
  | "dashboard:finance"
  | "dashboard:production"
  | "dashboard:logistics"
  | "settings:read"
  | "settings:write";

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "menu:read", "menu:write",
    "orders:read", "orders:write", "orders:manage",
    "events:read", "events:write", "events:manage",
    "production:read", "production:write",
    "logistics:read", "logistics:write",
    "finance:read", "finance:write",
    "suppliers:read", "suppliers:write",
    "users:read", "users:write",
    "feedback:read", "feedback:write",
    "dashboard:admin", "dashboard:finance", "dashboard:production", "dashboard:logistics",
    "settings:read", "settings:write",
  ],
  CLIENTE: [
    "menu:read",
    "orders:read", "orders:write",
    "events:read", "events:write",
    "feedback:read", "feedback:write",
  ],
  CHEF: [
    "menu:read",
    "orders:read",
    "production:read", "production:write",
    "suppliers:read",
    "dashboard:production",
  ],
  STAFF: [
    "orders:read",
    "events:read",
    "logistics:read", "logistics:write",
    "dashboard:logistics",
  ],
  PROVEEDOR: [
    "suppliers:read", "suppliers:write",
  ],
  FINANZAS: [
    "orders:read",
    "finance:read", "finance:write",
    "dashboard:finance",
    "feedback:read",
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function getRoleDashboardPath(role: Role): string {
  const paths: Record<Role, string> = {
    ADMIN: "/admin",
    CLIENTE: "/cliente",
    CHEF: "/chef",
    STAFF: "/staff",
    PROVEEDOR: "/proveedor",
    FINANZAS: "/finanzas",
  };
  return paths[role] ?? "/cliente";
}
