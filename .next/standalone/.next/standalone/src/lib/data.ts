import { images } from "./images";

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  remaining: number;
}

export interface PastEdition {
  edition: number;
  year: number;
  date: string;
  attendance: number;
  attendanceSuffix?: string;
  image: string;
  highlight: string;
  location: string;
}

export interface CorechellaEvent {
  id: string;
  slug: string;
  edition: number;
  editionNumber: number;
  title: string;
  tagline: string;
  image: string;
  banner: string;
  date: string;
  endDate: string;
  time: string;
  location: string;
  venue: string;
  city: string;
  price: number;
  description: string;
  organizer: string;
  tickets: TicketTier[];
  gallery: string[];
  faqs: { question: string; answer: string }[];
}

export const CORECHELLA_SLUG = "corechella-2026";
export const VENUE = "Eden Garden";
export const VENUE_AREA = "Bodija";
export const VENUE_FULL = "Eden Garden, Bodija, Ibadan";
export const CITY = "Ibadan";
export const CURRENT_EDITION = 4;
export const TOTAL_EDITIONS = 4;
export const EARLY_BIRD_ALLOCATION = 300;
export const EARLY_BIRD_TICKET_ID = "eb";
export const EARLY_BIRD_MAX_PER_EMAIL = 2;
export const EARLY_BIRD_MAX_PER_PHONE = 2;
export const EARLY_BIRD_MAX_QUANTITY_PER_ORDER = 2;
export const REGULAR_TICKET_PRICE = 3000;
export const VIP_TICKET_PRICE = 25000;
export const TABLE_RESERVATION_PHONES = ["09062049798", "09067700391"] as const;
/** Ticket purchase & checkout support — call/WhatsApp for order or QR issues */
export const TICKET_SUPPORT_PHONE = "09062049798";
export const EVENT_TIME_LINE = "6:00 PM Till Dawn";
export const EVENT_TIME_LINE_TICKET = "6:00PM TILL DAWN";
export const CORECHELLA_THEME = "Sound of the Summer";

export const CORECHELLA_ABOUT =
  "A night where music, culture, fashion, and creative communities collide. An immersive rave experience created for those who live for unforgettable moments, authentic connections, and pure energy.";

/** The one event — Corechella Edition 4, Sound of the Summer in Ibadan */
export const corechella: CorechellaEvent = {
  id: "corechella-2026",
  slug: CORECHELLA_SLUG,
  edition: 2026,
  editionNumber: CURRENT_EDITION,
  title: "Corechella 2026",
  tagline: CORECHELLA_THEME,
  image: images.card,
  banner: images.banner,
  date: "2026-07-25",
  endDate: "2026-07-25",
  time: EVENT_TIME_LINE,
  location: VENUE_FULL,
  venue: VENUE,
  city: CITY,
  price: REGULAR_TICKET_PRICE,
  description: CORECHELLA_ABOUT,
  organizer: "Corechella Productions",
  tickets: [
    { id: "eb", name: "Early Bird", price: 0, description: "Free limited early access — 300 tickets only", remaining: EARLY_BIRD_ALLOCATION },
    { id: "reg", name: "Regular Ticket", price: REGULAR_TICKET_PRICE, description: "General admission", remaining: 5000 },
    { id: "vip", name: "VIP", price: VIP_TICKET_PRICE, description: "Premium viewing, lounge & fast entry", remaining: 500 },
  ],
  gallery: [...images.gallery],
  faqs: [
    { question: "When is Corechella Edition 4?", answer: "Saturday, July 25, 2026. Gates open at 6:00 PM till dawn." },
    { question: "How often is Corechella?", answer: "Corechella returns every 3–4 months in Ibadan — one immersive night of music, culture, fashion, and creative community." },
    { question: "Where is the venue?", answer: `${VENUE_FULL} — the home of Corechella Edition 4.` },
    {
      question: "Can I get a refund?",
      answer:
        "TICKETS ARE NON-REFUNDABLE. No refunds will be issued under any circumstances.",
    },
    {
      question: "Having trouble with your ticket or purchase?",
      answer: `Call or WhatsApp ${TICKET_SUPPORT_PHONE} for ticket and checkout support. Have your order ID ready.`,
    },
  ],
};

export const experiences = [
  { name: "Main Stage", icon: "music", description: "Headliners & live performances", image: images.experiences.music },
  { name: "Art District", icon: "palette", description: "Installations & live painting", image: images.experiences.art },
  { name: "Food Village", icon: "utensils", description: "West African flavours & chefs", image: images.experiences.food },
  { name: "Neon After Dark", icon: "moon", description: "Late-night DJ sets & lights", image: images.experiences.nightlife },
  { name: "Culture Lab", icon: "sparkles", description: "Talks, fashion & film", image: images.experiences.culture },
  { name: "Chill Zone", icon: "heart", description: "Wellness, lounges & recovery", image: images.experiences.wellness },
];

/** Past editions — Edition 4 is the current on-sale event */
export const pastEditions: PastEdition[] = [
  {
    edition: 1,
    year: 2025,
    date: "March 15, 2025",
    attendance: 700,
    image: images.pastEdition1,
    highlight: "The inaugural Corechella — Ibadan came alive",
    location: "Liberty Stadium, Ibadan",
  },
  {
    edition: 2,
    year: 2025,
    date: "November 7, 2025",
    attendance: 1500,
    image: images.pastEdition2,
    highlight: "Sold out in 48 hours — summer energy all night",
    location: "Cascade Lounge, Ibadan",
  },
  {
    edition: 3,
    year: 2026,
    date: "Saturday, March 27, 2026",
    attendance: 2000,
    attendanceSuffix: "+",
    image: images.banner,
    highlight: "Corechella 2026 — 2,000+ ravers at Stone Cafe",
    location: "Stone Cafe, Ibadan",
  },
];

export const eventStats = [
  { label: "Editions", value: TOTAL_EDITIONS, suffix: "" },
  { label: "Attendees", value: 5200, suffix: "+" },
  { label: "Tickets", value: 10000, suffix: "" },
];

/** Homepage ticket display */
export const landingTicketTiers = [
  {
    id: "eb",
    name: "Early Bird",
    price: 0,
    tag: "FREE",
    perks: ["Free general entry", "Main floor access", "Food village"],
    isFree: true,
  },
  {
    id: "reg",
    name: "Regular Ticket",
    price: REGULAR_TICKET_PRICE,
    perks: ["General admission", "Full venue access", "Merch discount"],
  },
  {
    id: "vip",
    name: "VIP",
    price: VIP_TICKET_PRICE,
    popular: true,
    perks: ["Premium viewing", "VIP lounge", "Fast-track entry", "Complimentary drink"],
  },
];

export const partnerLogos = [
  { name: "ZAVEX", src: "/images/partners/zavex.png" },
  { name: "WAVY", src: "/images/partners/wavy.png" },
  { name: "SIB", src: "/images/partners/sb.png" },
  { name: "CHOP LIFE", src: "/images/partners/chop-life.png" },
  { name: "SNACK DAD", src: "/images/partners/snack-dad.png" },
  { name: "GUINNESS", src: "/images/partners/guinness.png" },
  { name: "SMIRNOFF", src: "/images/partners/smirnoff.png" },
  { name: "GORDON'S", src: "/images/partners/gordons.png" },
];

export const eventSchedule = [
  { time: "6:00 PM", label: "Doors Open", subtitle: "Get in, Link Up" },
  { time: "7:00 PM", label: "Warm Up", subtitle: "Feel the vibe" },
  { time: "8:00 PM", label: "Main Rave", subtitle: "Let the wave begin" },
  { time: "12:00 AM", label: "Peak Hour", subtitle: "The energy hits" },
  { time: "4:00 AM", label: "Closing", subtitle: "One last wave" },
];

export const expectItems = [
  { label: "Live DJs", icon: "music" },
  { label: "Dance Floor", icon: "disc" },
  { label: "Premium Drinks", icon: "wine" },
  { label: "VIP Lounge", icon: "crown" },
  { label: "Photo Moments", icon: "camera" },
  { label: "Food Village", icon: "utensils" },
];

export const testimonials = [
  {
    name: "FHEYII",
    role: "Corechella Edition 3 · Ibadan",
    quote: "The inaugural Corechella changed everything. Ibadan came alive — can't wait for the next edition!",
    avatar: images.testimonials.fheyii,
  },
  {
    name: "JUST MUA",
    role: "Corechella Edition 2 · Ibadan",
    quote: "Flew in for the first edition. Corechella isn't just a rave — it's a movement.",
    avatar: images.testimonials.justMua,
  },
  {
    name: "OLEX",
    role: "Corechella Edition 4 · Ibadan",
    quote: "Edition 3 was unreal — 2,000+ in the stadium. Already locked in for Edition 4.",
    avatar: images.testimonials.olex,
  },
];

export const whyCorechella = [
  { title: "Every 3–4 Months", description: `${CORECHELLA_THEME} — same magic, new memories each edition in Ibadan.` },
  { title: "Immersive Experience", description: "Music, culture, fashion, and creative communities collide in one unforgettable night." },
  { title: "Seamless Entry", description: "QR-powered check-in. No queues. Just vibes from gate to stage." },
  { title: "Authentic Connections", description: "Built for those who live for unforgettable moments, real community, and pure energy." },
];

export const aboutContent = {
  mission: CORECHELLA_ABOUT,
  vision:
    "A recurring cultural landmark where every edition feels like the biggest night of the year — premium production, inclusive energy, and memories that last long after the lights go down.",
  story: [
    "Corechella is a night where music, culture, fashion, and creative communities collide — an immersive rave experience for those who live for unforgettable moments, authentic connections, and pure energy.",
    `Edition 1 at Liberty Stadium brought 700 ravers together. Edition 2 at Cascade Lounge drew 1,500 on November 7, 2025. Edition 3 at Stone Cafe on March 27 brought 2,000+ together. Edition 4 returns to Eden Garden, Bodija with bigger production and the ${CORECHELLA_THEME} theme.`,
    "We are not just throwing parties. We are curating experiences — from the main stage and food village to the culture lab and neon after dark. Every detail is designed so you walk in and immediately feel the summer.",
  ],
  values: [
    { title: "Community First", description: "Creative communities at the heart of every edition — built in Ibadan, open to all who show up." },
    { title: "Premium Production", description: "World-class sound, lighting, and staging for an immersive rave experience." },
    { title: "Safe & Inclusive", description: "Secure environment, clear policies, and good vibes only." },
    { title: "Culture & Connection", description: "Where music, fashion, and culture meet — authentic connections, unforgettable moments." },
  ],
};

export const userPayments = [
  { id: "1", event: "Corechella 2026 (Edition 4)", amount: 45000, date: "Jun 1, 2026", status: "completed" as const },
  { id: "2", event: "Corechella 2026 (Edition 3)", amount: 15000, date: "Mar 20, 2026", status: "completed" as const },
  { id: "3", event: "Corechella 2025 (Edition 2)", amount: 15000, date: "Nov 5, 2025", status: "completed" as const },
];

export const attendees = [
  { id: "1", name: "Chidi Okonkwo", email: "chidi@email.com", phone: "+234 801 234 5678", ticketType: "VIP", amount: 45000, status: "checked-in", date: "2026-06-01" },
  { id: "2", name: "Amina Hassan", email: "amina@email.com", phone: "+234 802 345 6789", ticketType: "Regular", amount: 15000, status: "not-checked-in", date: "2026-06-02" },
  { id: "3", name: "David Mensah", email: "david@email.com", phone: "+233 24 567 8901", ticketType: "VVIP", amount: 95000, status: "checked-in", date: "2026-05-28" },
  { id: "4", name: "Blessing Adeyemi", email: "blessing@email.com", phone: "+234 803 456 7890", ticketType: "Early Bird", amount: 12000, status: "not-checked-in", date: "2026-06-03" },
  { id: "5", name: "Emeka Nwosu", email: "emeka@email.com", phone: "+234 804 567 8901", ticketType: "Regular", amount: 15000, status: "checked-in", date: "2026-05-25" },
];

export const adminOrders = [
  { id: "ORD-001", customer: "Chidi Okonkwo", event: "Corechella 2026", amount: 45000, date: "Jun 1", status: "completed" as const },
  { id: "ORD-002", customer: "Amina Hassan", event: "Corechella 2026", amount: 15000, date: "Jun 2", status: "completed" as const },
  { id: "ORD-003", customer: "David Mensah", event: "Corechella 2026", amount: 95000, date: "Jun 3", status: "pending" as const },
];

export const salesData = [
  { month: "Jan", revenue: 800000, tickets: 45 },
  { month: "Feb", revenue: 1200000, tickets: 78 },
  { month: "Mar", revenue: 1800000, tickets: 120 },
  { month: "Apr", revenue: 2400000, tickets: 165 },
  { month: "May", revenue: 3100000, tickets: 210 },
  { month: "Jun", revenue: 4200000, tickets: 285 },
];

export const events = [corechella];

export function getEventBySlug(slug: string) {
  return slug === CORECHELLA_SLUG ? corechella : undefined;
}

export { images };
