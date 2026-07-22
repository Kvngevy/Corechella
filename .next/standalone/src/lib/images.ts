/** Corechella event photography — local assets in /public/images */

const q = (id: string, w: number) =>
  `https://images.unsplash.com/${id}?w=${w}&q=85&auto=format&fit=crop`;

export const images = {
  hero: "/images/hero-bg.jpg",
  banner: "/images/hero-bg.jpg",
  card: "/images/color-festival.png",
  authLogin: "/images/dj-setup.png",
  authSignup: "/images/club-haze.png",
  pastEdition1: "/images/crowd-bw.png",
  pastEdition2: "/images/crowd-purple.png",

  ibadan: {
    mapoHall: "/images/mapo-hall.png",
    cocoaHouse: "/images/cocoa-house.png",
    city: "/images/mapo-hall.png",
  },

  gallery: [
    "/images/crowd-purple.png",
    "/images/cocoa-house.png",
    "/images/culture-lab.png",
    "/images/crowd-bw.png",
    "/images/dj-setup.png",
    "/images/club-haze.png",
    "/images/color-festival.png",
    "/images/bartender.png",
    "/images/mapo-hall.png",
  ],

  avatars: {
    amara: q("photo-1534528741775-53994a69daeb", 100),
    kwame: q("photo-1507003211169-0a1dd7228f2d", 100),
    fatima: q("photo-1438761681033-6461ffad8d80", 100),
  },

  testimonials: {
    fheyii: "/images/testimonials/fheyii.png",
    justMua: "/images/testimonials/just-mua.png",
    olex: "/images/testimonials/olex.png",
  },

  experiences: {
    music: "/images/crowd-purple.png",
    art: "/images/color-festival.png",
    food: "/images/bartender.png",
    nightlife: "/images/dj-setup.png",
    culture: "/images/culture-lab.png",
    wellness: "/images/crowd-bw.png",
  },
} as const;
