import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const root = process.cwd();
  const deletedFiles: string[] = [];
  const deletedFolders: string[] = [];

  const filesToRemove = [
    "components/home/HeroBanner.tsx",
    "components/home/StatisticsSection.tsx",
    "components/home/CategoryCarousel.tsx",
    "components/home/EventCategories.tsx",
    "components/home/UpcomingEvents.tsx",
    "components/home/CtaSection.tsx",
    "components/home/FeatureIcons.tsx",
    "components/home/CategoryCard.tsx",
    "components/home/EventCard.tsx",
    "components/cards/.gitkeep",
    "components/dialogs/.gitkeep",
    "components/tables/.gitkeep",
    "frontend/.gitkeep",
  ];

  for (const file of filesToRemove) {
    const full = path.join(root, file);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      deletedFiles.push(file);
    }
  }

  const foldersToRemove = [
    "components/cards",
    "components/dialogs",
    "components/tables",
    "frontend",
  ];

  for (const folder of foldersToRemove) {
    const full = path.join(root, folder);
    if (fs.existsSync(full)) {
      try {
        fs.rmdirSync(full);
        deletedFolders.push(folder);
      } catch (e) {
        // Ignored
      }
    }
  }

  return NextResponse.json({
    success: true,
    deletedFiles,
    deletedFolders,
  });
}
