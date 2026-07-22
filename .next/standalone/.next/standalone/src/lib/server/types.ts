import type {
  AttendeeRecord,
  CartItem,
  OrderRecord,
  PromoCode,
  TicketInventory,
} from "@/lib/store/types";

export type UserRole = "user" | "super_admin" | "ticket_manager";

export type AdminPermission =
  | "manage_orders"
  | "manage_attendees"
  | "check_in"
  | "manage_promos"
  | "manage_events";

export interface DbUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  permissions: AdminPermission[];
  status: "active" | "inactive";
  createdAt: string;
}

export interface EarlyBirdClaimRecord {
  email: string;
  phone: string;
  deviceFingerprint?: string;
  orderId: string;
  at: string;
}

export interface AbuseFlagRecord {
  id: string;
  type: "bulk_early_bird";
  ip: string;
  email: string;
  phone: string;
  at: string;
}

export interface IpAttemptRecord {
  ip: string;
  at: string;
  type: "early_bird";
}

export interface DbState {
  users: DbUser[];
  tickets: TicketInventory[];
  promos: PromoCode[];
  orders: OrderRecord[];
  attendees: AttendeeRecord[];
  nextOrderSequence: number;
  earlyBirdIssued?: number;
  earlyBirdRemaining?: number;
  earlyBirdClaims?: EarlyBirdClaimRecord[];
  tableReservationCalls?: number;
  scanLogs?: import("@/lib/store/types").ScanLogEntry[];
  ipAttempts?: IpAttemptRecord[];
  abuseFlags?: AbuseFlagRecord[];
}

export interface AuthSession {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: AdminPermission[];
}

export interface CheckoutPayload {
  items: CartItem[];
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  promoCode?: string;
}

export const ALL_ADMIN_PERMISSIONS: AdminPermission[] = [
  "manage_orders",
  "manage_attendees",
  "check_in",
  "manage_promos",
  "manage_events",
];

export const TICKET_MANAGER_DEFAULT: AdminPermission[] = [
  "manage_orders",
  "manage_attendees",
  "check_in",
];
