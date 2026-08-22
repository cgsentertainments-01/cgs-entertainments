import { GuestJudge } from "@/types/guest-judge";

// In-Memory & Default Pre-Seeded Guests & Judges
let inMemoryGuestsJudges: GuestJudge[] = [
  {
    id: "gj-1",
    name: "Shiamak Davar",
    role: "Chief Guest",
    designation: "International Choreographer",
    organization: "Shiamak Davar Dance Academy",
    bio: "Global pioneer of contemporary dance in India and legendary Bollywood choreographer.",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    social_links: { instagram: "https://instagram.com", youtube: "https://youtube.com" },
    display_order: 1,
    is_active: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "gj-2",
    name: "Punit Pathak",
    role: "Judge",
    designation: "Renowned Choreographer & Actor",
    organization: "Dance India Dance Winner",
    bio: "Acclaimed choreographer and mentor known for path-breaking modern dance styles.",
    photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    social_links: { instagram: "https://instagram.com", youtube: "https://youtube.com" },
    display_order: 2,
    is_active: true,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "gj-3",
    name: "Shakti Mohan",
    role: "Judge",
    designation: "Celebrity Dancer & Mentor",
    organization: "Nritya Shakti",
    bio: "Popular contemporary dancer and mentor with international dance performance acclaim.",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    social_links: { instagram: "https://instagram.com", youtube: "https://youtube.com" },
    display_order: 3,
    is_active: true,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "gj-4",
    name: "Neeti Mohan",
    role: "Guest",
    designation: "Playback Singer & Performing Artist",
    organization: "Bollywood Music Industry",
    bio: "Award-winning playback singer and celebrity judge across major Indian reality shows.",
    photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    social_links: { instagram: "https://instagram.com", youtube: "https://youtube.com" },
    display_order: 4,
    is_active: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "gj-5",
    name: "Terence Lewis",
    role: "Judge",
    designation: "Choreographer & Dance Educator",
    organization: "Terence Lewis Contemporary Dance Company",
    bio: "Master of Indian contemporary and modern dance and prominent TV personality.",
    photo_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    social_links: { instagram: "https://instagram.com", youtube: "https://youtube.com" },
    display_order: 5,
    is_active: true,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function getFallbackGuestsJudges(): GuestJudge[] {
  return [...inMemoryGuestsJudges].sort((a, b) => a.display_order - b.display_order);
}

export function addFallbackGuestJudge(item: Omit<GuestJudge, "id" | "created_at" | "updated_at">): GuestJudge {
  const newItem: GuestJudge = {
    ...item,
    id: `gj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  inMemoryGuestsJudges.push(newItem);
  return newItem;
}

export function updateFallbackGuestJudge(id: string, updates: Partial<GuestJudge>): GuestJudge | null {
  const index = inMemoryGuestsJudges.findIndex((g) => g.id === id);
  if (index === -1) return null;

  inMemoryGuestsJudges[index] = {
    ...inMemoryGuestsJudges[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  return inMemoryGuestsJudges[index];
}

export function deleteFallbackGuestJudge(id: string): boolean {
  const initialLen = inMemoryGuestsJudges.length;
  inMemoryGuestsJudges = inMemoryGuestsJudges.filter((g) => g.id !== id);
  return inMemoryGuestsJudges.length < initialLen;
}

export function reorderFallbackGuestsJudges(items: { id: string; display_order: number }[]): void {
  const map = new Map(items.map((i) => [i.id, i.display_order]));
  inMemoryGuestsJudges.forEach((g) => {
    if (map.has(g.id)) {
      g.display_order = map.get(g.id)!;
      g.updated_at = new Date().toISOString();
    }
  });
}
