export interface EventItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  badgeTheme: "purple" | "blue" | "orange" | "pink";
  eventDate: string;
  location: string;
  bannerUrl: string;
  registrationFee: number;
}

export const MOCK_EVENTS: EventItem[] = [
  {
    id: "e1",
    title: "National Dance Championship",
    slug: "national-dance-championship",
    category: "DANCE",
    badgeTheme: "purple",
    eventDate: "25 May 2026",
    location: "Hyderabad",
    bannerUrl: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=800&q=80",
    registrationFee: 499,
  },
  {
    id: "e2",
    title: "Elite Modeling Show",
    slug: "elite-modeling-show",
    category: "MODELING",
    badgeTheme: "blue",
    eventDate: "10 June 2026",
    location: "Bangalore",
    bannerUrl: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    registrationFee: 799,
  },
  {
    id: "e3",
    title: "Acting Excellence Awards",
    slug: "acting-excellence-awards",
    category: "ACTING",
    badgeTheme: "orange",
    eventDate: "18 June 2026",
    location: "Chennai",
    bannerUrl: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80",
    registrationFee: 399,
  },
  {
    id: "e4",
    title: "Voice of India 2026",
    slug: "voice-of-india-2026",
    category: "SINGING",
    badgeTheme: "pink",
    eventDate: "30 June 2026",
    location: "Mumbai",
    bannerUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
    registrationFee: 599,
  },
];
