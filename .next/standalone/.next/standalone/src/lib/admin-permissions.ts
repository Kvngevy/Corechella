export type AdminPermission =
  | "manage_orders"
  | "manage_attendees"
  | "check_in"
  | "manage_promos"
  | "manage_events";

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  manage_orders: "Orders & payments",
  manage_attendees: "Attendees & tickets",
  check_in: "QR check-in",
  manage_promos: "Coupons & promos",
  manage_events: "Ticket inventory & config",
};

export const PERMISSION_DESCRIPTIONS: Record<AdminPermission, string> = {
  manage_orders: "View orders, track payments, mark orders as paid",
  manage_attendees: "View attendee list, resend ticket emails",
  check_in: "Scan QR codes and check guests in at the gate",
  manage_promos: "Create and manage discount codes",
  manage_events: "Monitor ticket inventory (view only for staff)",
};

/** Default for new staff — monitor & operate, no platform config */
export const STAFF_DEFAULT_PERMISSIONS: AdminPermission[] = [
  "manage_orders",
  "manage_attendees",
  "check_in",
];

/** Permissions a super admin may assign to staff (never includes staff management) */
export const STAFF_ASSIGNABLE_PERMISSIONS: AdminPermission[] = [
  "manage_orders",
  "manage_attendees",
  "check_in",
  "manage_promos",
  "manage_events",
];

export function isAssignablePermission(permission: string): permission is AdminPermission {
  return STAFF_ASSIGNABLE_PERMISSIONS.includes(permission as AdminPermission);
}

export function sanitizeStaffPermissions(permissions: string[]): AdminPermission[] {
  return permissions.filter(isAssignablePermission);
}
