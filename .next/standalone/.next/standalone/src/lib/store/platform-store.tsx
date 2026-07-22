"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { apiClient } from "@/lib/api-client";
import { getDeviceFingerprint } from "@/lib/device-fingerprint";
import { buildTicketEmail, dispatchEmails } from "@/lib/email";
import {
  getGuestBundlesForIds,
  mergeGuestBundles,
  saveGuestOrderBundle,
} from "@/lib/guest-ticket-storage";
import { createDefaultState, SERVICE_FEE, STORAGE_KEY } from "./defaults";
import type {
  AttendeeRecord,
  CartItem,
  CheckoutInput,
  EmailSendResult,
  OrderRecord,
  PlatformState,
  PromoCode,
  PromoResult,
  PromoType,
  StaffMember,
  UserSession,
  EarlyBirdStats,
} from "./types";

function loadLocalState(): Pick<PlatformState, "cart" | "guestOrderIds"> {
  if (typeof window === "undefined") return { cart: [], guestOrderIds: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        cart: parsed.cart ?? [],
        guestOrderIds: parsed.guestOrderIds ?? [],
      };
    }
  } catch {
    /* ignore */
  }
  return { cart: [], guestOrderIds: [] };
}

function persistLocal(cart: CartItem[], guestOrderIds: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart, guestOrderIds }));
}

function cartSubtotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function formatOrderDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}

function toSession(user: {
  userId: string;
  name: string;
  email: string;
  role: "user" | "super_admin" | "ticket_manager";
  permissions?: string[];
}): UserSession {
  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions ?? [],
    isLoggedIn: true,
  };
}

interface PlatformContextValue {
  ready: boolean;
  cart: CartItem[];
  tickets: PlatformState["tickets"];
  promos: PromoCode[];
  orders: OrderRecord[];
  attendees: AttendeeRecord[];
  staff: StaffMember[];
  session: UserSession | null;
  guestOrderIds: string[];
  setCart: (cart: CartItem[]) => void;
  clearCart: () => void;
  validatePromo: (code: string, subtotal: number) => Promise<PromoResult>;
  completeCheckout: (input: CheckoutInput) => Promise<{
    success: boolean;
    orderId?: string;
    order?: OrderRecord;
    attendees?: AttendeeRecord[];
    checkoutUrl?: string;
    error?: string;
  }>;
  markOrderComplete: (orderId: string) => Promise<void>;
  checkInByQr: (qrCode: string) => Promise<{
    status: "valid" | "used" | "invalid" | "pending_payment";
    message?: string;
    attendee?: AttendeeRecord;
    ticketCode?: string;
    checkInTime?: string;
    order?: { id: string; status: OrderRecord["status"]; customerName: string };
  }>;
  addPromo: (data: { code: string; type: PromoType; value: number; maxUses: number }) => Promise<{
    success: boolean;
    error?: string;
  }>;
  togglePromoStatus: (id: string) => Promise<{ success: boolean; error?: string }>;
  deletePromo: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshPromos: () => Promise<void>;
  addStaff: (data: { name: string; email: string; password: string; permissions?: string[] }) => Promise<void>;
  revokeStaffAccess: (id: string) => Promise<void>;
  activateStaff: (id: string, permissions?: string[]) => Promise<void>;
  updateStaffPermissions: (id: string, permissions: string[]) => Promise<void>;
  updateTicket: (payload: {
    id: string;
    name?: string;
    price?: number;
    description?: string;
    total?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  refreshStaff: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshData: (guestIds?: string[]) => Promise<void>;
  fetchGuestOrder: (orderId: string) => Promise<OrderRecord | undefined>;
  getMyOrders: () => OrderRecord[];
  getMyAttendees: () => AttendeeRecord[];
  sendAttendeeEmail: (attendeeId: string) => Promise<EmailSendResult>;
  sendBulkAttendeeEmails: (attendeeIds: string[]) => Promise<EmailSendResult>;
  stats: {
    revenue: number;
    ticketsSold: number;
    totalAttendees: number;
    checkedIn: number;
    pendingOrders: number;
    earlyBirdIssued: number;
    earlyBirdRemaining: number;
    regularSold: number;
    vipSold: number;
    tableReservationCalls: number;
    checkInsToday: number;
  };
  earlyBird: EarlyBirdStats;
  salesByMonth: { month: string; revenue: number; tickets: number }[];
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

function mapStaffMembers(
  staff: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
    status: string;
  }[]
): StaffMember[] {
  return staff.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    role: s.role,
    status: s.status as "active" | "inactive",
    permissions: s.permissions,
  }));
}

export function PlatformProvider({ children }: { children: ReactNode }) {
  const local = loadLocalState();
  const [cart, setCartState] = useState<CartItem[]>(local.cart);
  const [guestOrderIds, setGuestOrderIds] = useState<string[]>(local.guestOrderIds);
  const [tickets, setTickets] = useState(createDefaultState().tickets);
  const [earlyBird, setEarlyBird] = useState<EarlyBirdStats>({
    issued: 0,
    remaining: 300,
    allocation: 300,
    exhausted: false,
  });
  const [tableReservationCalls, setTableReservationCalls] = useState(0);
  const [checkInsToday, setCheckInsToday] = useState(0);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [attendees, setAttendees] = useState<AttendeeRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [ready, setReady] = useState(false);

  const refreshStaff = useCallback(async () => {
    try {
      const data = await apiClient.getStaff();
      setStaff(mapStaffMembers(data.staff));
    } catch {
      /* keep existing staff list on transient failures */
    }
  }, []);

  const refreshPromos = useCallback(async () => {
    try {
      const data = await apiClient.getPromos();
      setPromos(data.promos ?? []);
    } catch {
      /* keep existing coupons on transient failures */
    }
  }, []);

  const refreshData = useCallback(async (guestIds?: string[]) => {
    try {
      const ids = guestIds ?? guestOrderIds;
      const [{ user }, ticketData, orderData] = await Promise.all([
        apiClient.getSession(),
        apiClient.getTickets(),
        apiClient.getOrders(ids.length ? ids : undefined),
      ]);

      setSession(user ? toSession(user) : null);
      setTickets(ticketData.tickets);
      if (ticketData.earlyBird) setEarlyBird(ticketData.earlyBird);
      if (ticketData.tableReservationCalls != null) {
        setTableReservationCalls(ticketData.tableReservationCalls);
      }
      if (ticketData.checkInsToday != null) setCheckInsToday(ticketData.checkInsToday);

      if (user && (user.role === "super_admin" || user.role === "ticket_manager")) {
        setOrders(orderData.orders);
        setAttendees(orderData.attendees);
      } else if (ids.length) {
        const merged = mergeGuestBundles(ids, orderData.orders, orderData.attendees);
        if (merged.orders.length) {
          setOrders((prev) => {
            const map = new Map(prev.map((o) => [o.id, o]));
            merged.orders.forEach((o) => map.set(o.id, o));
            return Array.from(map.values());
          });
        }
        if (merged.attendees.length) {
          setAttendees((prev) => {
            const map = new Map(prev.map((a) => [a.id, a]));
            merged.attendees.forEach((a) => map.set(a.id, a));
            return Array.from(map.values());
          });
        }
      } else {
        setOrders(orderData.orders);
        setAttendees(orderData.attendees);
      }

      if (
        user &&
        (user.role === "super_admin" ||
          (user.role === "ticket_manager" && user.permissions.includes("manage_promos")))
      ) {
        await refreshPromos();
      }

      if (user?.role === "super_admin") {
        try {
          const staffData = await apiClient.getStaff();
          setStaff(mapStaffMembers(staffData.staff));
        } catch {
          /* keep existing staff list */
        }
      }
    } catch {
      /* keep existing state on failure */
    }
  }, [guestOrderIds, refreshPromos]);

  useEffect(() => {
    refreshData().finally(() => setReady(true));
  }, [refreshData]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshData();
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    persistLocal(cart, guestOrderIds);
  }, [cart, guestOrderIds]);

  const setCart = useCallback((next: CartItem[]) => setCartState(next), []);
  const clearCart = useCallback(() => setCartState([]), []);

  const validatePromo = useCallback(async (code: string, subtotal: number): Promise<PromoResult> => {
    try {
      const result = await apiClient.validatePromo(code, cart);
      if (!result.valid) {
        return { valid: false, discount: 0, message: result.message };
      }
      return {
        valid: true,
        discount: result.discount ?? 0,
        promo: result.promo as PromoCode | undefined,
      };
    } catch (err) {
      return { valid: false, discount: 0, message: err instanceof Error ? err.message : "Invalid promo code" };
    }
  }, [cart]);

  const completeCheckout = useCallback(
    async (input: CheckoutInput) => {
      if (cart.length === 0) return { success: false, error: "Your cart is empty" };

      try {
        const result = await apiClient.checkout({
          items: cart,
          ...input,
          deviceFingerprint: input.deviceFingerprint ?? getDeviceFingerprint(),
        });

        const isStaffSession =
          session?.role === "super_admin" || session?.role === "ticket_manager";
        const nextGuestIds =
          result.guestAccess && !isStaffSession
            ? [...new Set([...guestOrderIds, result.guestAccess])]
            : guestOrderIds;

        if (result.order) {
          setOrders((prev) => {
            const without = prev.filter((o) => o.id !== result.order!.id);
            return [...without, result.order!];
          });
          const unlocked =
            result.order.status === "completed" || result.order.total <= 0;
          saveGuestOrderBundle(result.order, unlocked ? (result.attendees ?? []) : []);
        }
        if (result.attendees?.length && result.order?.status === "completed") {
          setAttendees((prev) => {
            const ids = new Set(result.attendees!.map((a) => a.id));
            return [...prev.filter((a) => !ids.has(a.id)), ...result.attendees!];
          });
        }

        if (result.guestAccess && !isStaffSession) {
          setGuestOrderIds(nextGuestIds);
        }

        if (!result.attendees?.length) {
          if (result.guestAccess && !isStaffSession) {
            await refreshData(nextGuestIds);
          } else {
            await refreshData();
          }
        }

        setCartState([]);
        persistLocal([], nextGuestIds);

        if (result.checkoutUrl) {
          return {
            success: true,
            orderId: result.orderId,
            order: result.order,
            attendees: result.attendees,
            checkoutUrl: result.checkoutUrl,
          };
        }

        return {
          success: true,
          orderId: result.orderId,
          order: result.order,
          attendees: result.attendees,
        };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : "Checkout failed" };
      }
    },
    [cart, session, guestOrderIds, refreshData]
  );

  const fetchGuestOrder = useCallback(
    async (orderId: string): Promise<OrderRecord | undefined> => {
      const nextGuestIds = [...new Set([...guestOrderIds, orderId])];
      setGuestOrderIds(nextGuestIds);
      persistLocal(cart, nextGuestIds);

      const mergeOrders = (incoming: OrderRecord[]) => {
        if (!incoming.length) return;
        setOrders((prev) => {
          const ids = new Set(incoming.map((o) => o.id));
          return [...prev.filter((o) => !ids.has(o.id)), ...incoming];
        });
      };

      const mergeAttendees = (incoming: AttendeeRecord[]) => {
        if (!incoming.length) return;
        setAttendees((prev) => {
          const ids = new Set(incoming.map((a) => a.id));
          return [...prev.filter((a) => !ids.has(a.id)), ...incoming];
        });
      };

      try {
        const guestData = await apiClient.getGuestOrderTickets(orderId);
        mergeOrders([guestData.order]);
        if (guestData.attendees.length) {
          mergeAttendees(guestData.attendees);
          saveGuestOrderBundle(guestData.order, guestData.attendees);
        } else {
          saveGuestOrderBundle(guestData.order, []);
        }
        return guestData.order;
      } catch {
        try {
          const detail = await apiClient.getOrder(orderId);
          mergeOrders([detail.order]);
          mergeAttendees(detail.attendees);
          if (detail.attendees.length) {
            saveGuestOrderBundle(detail.order, detail.attendees);
          }
          return detail.order;
        } catch {
          const cached = getGuestBundlesForIds([orderId])[0];
          if (cached) {
            mergeOrders([cached.order]);
            mergeAttendees(cached.attendees);
            return cached.order;
          }
          return undefined;
        }
      }
    },
    [guestOrderIds, cart]
  );

  const markOrderComplete = useCallback(async (orderId: string) => {
    await apiClient.confirmOrder(orderId);
    await refreshData();
  }, [refreshData]);

  const checkInByQr = useCallback(
    async (qrCode: string) => {
      const result = await apiClient.checkIn(qrCode);
      await refreshData();
      return result;
    },
    [refreshData]
  );

  const addPromo = useCallback(
    async (data: { code: string; type: PromoType; value: number; maxUses: number }) => {
      try {
        const result = await apiClient.addPromo(data);
        if (result.promo) {
          setPromos((prev) => {
            const without = prev.filter((p) => p.id !== result.promo!.id);
            return [result.promo!, ...without];
          });
        } else {
          await refreshPromos();
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to create coupon",
        };
      }
    },
    [refreshPromos]
  );

  const togglePromoStatus = useCallback(
    async (id: string) => {
      try {
        const result = await apiClient.togglePromo(id);
        if (result.promo) {
          setPromos((prev) => prev.map((p) => (p.id === id ? result.promo! : p)));
        } else {
          await refreshPromos();
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update coupon",
        };
      }
    },
    [refreshPromos]
  );

  const deletePromo = useCallback(
    async (id: string) => {
      try {
        await apiClient.deletePromo(id);
        setPromos((prev) => prev.filter((p) => p.id !== id));
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to delete coupon",
        };
      }
    },
    []
  );

  const addStaff = useCallback(
    async (data: { name: string; email: string; password: string; permissions?: string[] }) => {
      const result = await apiClient.addStaff(data);
      if (result.staff) {
        const member: StaffMember = {
          id: result.staff.id,
          name: result.staff.name,
          email: result.staff.email,
          role: result.staff.role,
          status: result.staff.status as "active" | "inactive",
          permissions: result.staff.permissions,
        };
        setStaff((prev) => {
          const without = prev.filter((s) => s.id !== member.id);
          return [...without, member];
        });
      }
      await refreshStaff();
    },
    [refreshStaff]
  );

  const revokeStaffAccess = useCallback(
    async (id: string) => {
      await apiClient.updateStaff({ id, action: "revoke" });
      await refreshStaff();
    },
    [refreshStaff]
  );

  const activateStaff = useCallback(
    async (id: string, permissions?: string[]) => {
      await apiClient.updateStaff({ id, action: "activate", permissions });
      await refreshStaff();
    },
    [refreshStaff]
  );

  const updateStaffPermissions = useCallback(
    async (id: string, permissions: string[]) => {
      await apiClient.updateStaff({ id, action: "update_permissions", permissions });
      await refreshStaff();
    },
    [refreshStaff]
  );

  const updateTicket = useCallback(
    async (payload: {
      id: string;
      name?: string;
      price?: number;
      description?: string;
      total?: number;
    }) => {
      try {
        const { ticket } = await apiClient.updateTicket(payload);
        setTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticket : t)));
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Failed to update ticket",
        };
      }
    },
    []
  );

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user } = await apiClient.login({ email, password });
      setSession(toSession(user));
      await refreshData();
      await refreshStaff();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : "Login failed" };
    }
  }, [refreshData, refreshStaff]);

  const logout = useCallback(async () => {
    await apiClient.logout();
    setSession(null);
    setStaff([]);
  }, []);

  const getMyOrders = useCallback(() => {
    return orders.filter((o) => guestOrderIds.includes(o.id));
  }, [orders, guestOrderIds]);

  const getMyAttendees = useCallback(() => {
    const guestIdSet = new Set(guestOrderIds);
    return attendees.filter((a) => guestIdSet.has(a.orderId));
  }, [guestOrderIds, attendees]);

  const sendAttendeeEmail = useCallback(
    async (attendeeId: string): Promise<EmailSendResult> => {
      const attendee = attendees.find((a) => a.id === attendeeId);
      if (!attendee) return { success: false, sent: 0, message: "Attendee not found" };
      const { sent } = await dispatchEmails([buildTicketEmail(attendee)]);
      return { success: true, sent, message: `Ticket email sent to ${attendee.name}` };
    },
    [attendees]
  );

  const sendBulkAttendeeEmails = useCallback(
    async (attendeeIds: string[]): Promise<EmailSendResult> => {
      if (attendeeIds.length === 0) return { success: false, sent: 0, message: "No attendees selected" };
      const targets = attendees.filter((a) => attendeeIds.includes(a.id));
      if (targets.length === 0) return { success: false, sent: 0, message: "No matching attendees found" };
      const { sent } = await dispatchEmails(targets.map(buildTicketEmail));
      return { success: true, sent, message: `Ticket emails sent to ${sent} attendee${sent !== 1 ? "s" : ""}` };
    },
    [attendees]
  );

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status === "completed");
    const revenue = completed.reduce((s, o) => s + o.total, 0);
    const ticketsSold = tickets.reduce((s, t) => s + t.sold, 0);
    const checkedIn = attendees.filter((a) => a.status === "checked-in").length;
    const regularTier = tickets.find((t) => t.id === "reg");
    const vipTier = tickets.find((t) => t.id === "vip");
    return {
      revenue,
      ticketsSold,
      totalAttendees: attendees.length,
      checkedIn,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      earlyBirdIssued: earlyBird.issued,
      earlyBirdRemaining: earlyBird.remaining,
      regularSold: regularTier?.sold ?? 0,
      vipSold: vipTier?.sold ?? 0,
      tableReservationCalls,
      checkInsToday,
    };
  }, [orders, tickets, attendees, earlyBird, tableReservationCalls, checkInsToday]);

  const salesByMonth = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    const buckets = months.map((month) => ({ month, revenue: 0, tickets: 0 }));
    orders
      .filter((o) => o.status === "completed")
      .forEach((order) => {
        const m = new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(order.createdAt));
        const bucket = buckets.find((b) => b.month === m);
        if (bucket) {
          bucket.revenue += order.total;
          bucket.tickets += order.items.reduce((s, i) => s + i.quantity, 0);
        }
      });
    return buckets;
  }, [orders]);

  const value = useMemo(
    () => ({
      ready,
      cart,
      tickets,
      promos,
      orders,
      attendees,
      staff,
      session,
      guestOrderIds,
      setCart,
      clearCart,
      validatePromo,
      completeCheckout,
      markOrderComplete,
      checkInByQr,
      addPromo,
      togglePromoStatus,
      deletePromo,
      refreshPromos,
      addStaff,
      revokeStaffAccess,
      activateStaff,
      updateStaffPermissions,
      updateTicket,
      refreshStaff,
      login,
      logout,
      refreshData,
      fetchGuestOrder,
      getMyOrders,
      getMyAttendees,
      sendAttendeeEmail,
      sendBulkAttendeeEmails,
      stats,
      earlyBird,
      salesByMonth,
    }),
    [
      ready,
      cart,
      tickets,
      earlyBird,
      promos,
      orders,
      attendees,
      staff,
      session,
      guestOrderIds,
      setCart,
      clearCart,
      validatePromo,
      completeCheckout,
      markOrderComplete,
      checkInByQr,
      addPromo,
      togglePromoStatus,
      deletePromo,
      refreshPromos,
      addStaff,
      revokeStaffAccess,
      activateStaff,
      updateStaffPermissions,
      updateTicket,
      refreshStaff,
      login,
      logout,
      refreshData,
      fetchGuestOrder,
      getMyOrders,
      getMyAttendees,
      sendAttendeeEmail,
      sendBulkAttendeeEmails,
      stats,
      salesByMonth,
    ]
  );

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error("usePlatform must be used within PlatformProvider");
  return ctx;
}

export { formatOrderDate, cartSubtotal, SERVICE_FEE };
export {
  saveGuestOrderBundle,
  getGuestOrderBundle,
  getAllGuestBundles,
} from "@/lib/guest-ticket-storage";
