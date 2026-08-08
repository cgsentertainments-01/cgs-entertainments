export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  colorGradient: string;
}

export const MOCK_CATEGORIES: CategoryItem[] = [
  {
    id: "c1",
    name: "Dance",
    slug: "dance",
    description: "Explore Dance Competitions",
    iconName: "Footprints",
    colorGradient: "from-purple-600 to-indigo-600",
  },
  {
    id: "c2",
    name: "Modeling",
    slug: "modeling",
    description: "Showcase Your Modeling Skills",
    iconName: "Shirt",
    colorGradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "c3",
    name: "Acting",
    slug: "acting",
    description: "Drama, Theatre & Performances",
    iconName: "Theater",
    colorGradient: "from-amber-500 to-orange-500",
  },
  {
    id: "c4",
    name: "Singing",
    slug: "singing",
    description: "Solo & Group Singing Events",
    iconName: "Mic",
    colorGradient: "from-pink-500 to-rose-500",
  },
  {
    id: "c5",
    name: "Music",
    slug: "music",
    description: "Instrumental & Band Performances",
    iconName: "Music",
    colorGradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "c6",
    name: "Photography",
    slug: "photography",
    description: "Capture Moments, Win Rewards",
    iconName: "Camera",
    colorGradient: "from-orange-500 to-red-500",
  },
  {
    id: "c7",
    name: "More",
    slug: "more",
    description: "Many More Categories",
    iconName: "MoreHorizontal",
    colorGradient: "from-purple-500 to-pink-500",
  },
];
