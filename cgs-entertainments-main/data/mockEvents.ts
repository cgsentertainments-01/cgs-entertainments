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

export const MOCK_EVENTS: EventItem[] = [];
