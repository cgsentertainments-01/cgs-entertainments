export interface HeroFeature {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
}

export interface HeroData {
  badgeText: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  eventDate: string;
  location: string;
  buttonText: string;
  buttonUrl: string;
  imageUrl: string;
  features: HeroFeature[];
}

export const MOCK_HERO: HeroData = {
  badgeText: "CGS ENTERTAINMENTS",
  headingLine1: "DANCE",
  headingLine2: "COMPETITION 2026",
  description: "Show Your Talent. Shine On Stage. Be A Star!",
  eventDate: "20 - 22 March, 2026",
  location: "Hyderabad, Telangana",
  buttonText: "Register Now",
  buttonUrl: "/events",
  imageUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1920&q=80",
  features: [
    {
      id: "f1",
      title: "All Age Groups",
      subtitle: "Welcome",
      iconName: "Users",
    },
    {
      id: "f2",
      title: "Exciting Prizes",
      subtitle: "& Rewards",
      iconName: "Trophy",
    },
    {
      id: "f3",
      title: "Secure &",
      subtitle: "Safe Events",
      iconName: "ShieldCheck",
    },
    {
      id: "f4",
      title: "Professional",
      subtitle: "Stage",
      iconName: "Sparkles",
    },
  ],
};
