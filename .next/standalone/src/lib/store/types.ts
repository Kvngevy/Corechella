export type OrderStatus = "completed" | "pending";
export type AttendeeStatus = "checked-in" | "not-checked-in";
export type PromoStatus = "active" | "expired";
export type PromoType = "percent" | "fixed";

export interface CartItem {
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
}

export interface TicketInventory {
  id: string;
  name: string;
  price: number;
  description: string;
  total: number;
  remaining: number;
  sold: number;
}

export interface PromoCode {
  id: string;
  code: string;
  type: PromoType;
  value: number;
  maxUses: number;
  uses: number;
  status: PromoStatus;
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  event: string;
  items: CartItem[];
  subtotal: number;
  fee: number;
  discount: number;
  promoCode?: string;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentReference?: string;
  createdAt: string;
}

export interface ScanLogEntry {
  id: string;
  ticketId: string;
  ticketCode: string;
  ticketType: string;
  attendeeName: string;
  scannerId: string;
  scannerEmail: string;
  result: "valid" | "used" | "invalid" | "pending_payment";
  scannedAt: string;
  previousCheckInTime?: string;
}

export interface AttendeeRecord {
  id: string;
  orderId: string;
  ticketIndex?: number;
  ticketCode?: string;
  ticketUuid?: string;
  name: string;
  email: string;
  phone: string;
  ticketType: string;
  ticketTypeId?: string;
  amount: number;
  status: AttendeeStatus;
  checkInTime?: string;
  deviceFingerprint?: string;
  qrCode: string;
  qrExpiresAt?: string;
  date: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: "active" | "inactive";
  permissions?: string[];
}

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: "user" | "super_admin" | "ticket_manager";
  permissions: string[];
  isLoggedIn: boolean;
}

export interface PlatformState {
  cart: CartItem[];
  tickets: TicketInventory[];
  promos: PromoCode[];
  orders: OrderRecord[];
  attendees: AttendeeRecord[];
  staff: StaffMember[];
  guestOrderIds: string[];
  session: UserSession | null;
}

export interface PromoResult {
  valid: boolean;
  discount: number;
  promo?: PromoCode;
  message?: string;
}

export interface CheckoutInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  promoCode?: string;
  deviceFingerprint?: string;
}

export interface EarlyBirdStats {
  issued: number;
  remaining: number;
  allocation: number;
  exhausted: boolean;
}

export interface EmailSendResult {
  success: boolean;
  sent: number;
  message: string;
}
