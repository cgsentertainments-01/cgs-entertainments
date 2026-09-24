export interface StatItemData {
  id: string;
  count: number;
  suffix: string;
  label: string;
  iconName: string;
}

export const MOCK_STATISTICS: StatItemData[] = [
  {
    id: "s1",
    count: 150,
    suffix: "+",
    label: "Events Organized",
    iconName: "Trophy",
  },
  {
    id: "s2",
    count: 25,
    suffix: "K+",
    label: "Participants",
    iconName: "Users",
  },
  {
    id: "s3",
    count: 20,
    suffix: "K+",
    label: "Certificates Issued",
    iconName: "Award",
  },
  {
    id: "s4",
    count: 10,
    suffix: "+",
    label: "Cities Covered",
    iconName: "MapPin",
  },
];
