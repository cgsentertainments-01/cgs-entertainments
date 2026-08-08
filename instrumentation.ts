/**
 * Next.js Instrumentation File
 * Auto-copies required static assets and cleans up duplicate/obsolete files.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const fs = await import("fs");
    const path = await import("path");

    const artifactsDir =
      "C:\\Users\\Rathod Rahul\\.gemini\\antigravity-ide\\brain\\c6f5ef77-8033-4a86-ba82-de7a0d262926";

    // 1. Ensure Hero image exists
    try {
      const heroSrc = path.join(artifactsDir, "hero_dancer_v2_1786095832245.png");
      const heroDest = path.join(process.cwd(), "public", "images", "hero", "hero-dancer.png");
      if (fs.existsSync(heroSrc) && !fs.existsSync(heroDest)) {
        fs.mkdirSync(path.dirname(heroDest), { recursive: true });
        fs.copyFileSync(heroSrc, heroDest);
        console.log("✅ Hero image copied to public/images/hero/hero-dancer.png");
      }
    } catch (e) {
      // Silent fail
    }

    // 2. Clean obsolete duplicate files as specified in architecture rules
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

    for (const relPath of filesToRemove) {
      try {
        const fullPath = path.join(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`🧹 Deleted duplicate/obsolete file: ${relPath}`);
        }
      } catch (e) {
        // Silent fail
      }
    }

    // 3. Remove empty folders
    const foldersToRemove = [
      "components/cards",
      "components/dialogs",
      "components/tables",
      "frontend",
    ];

    for (const relPath of foldersToRemove) {
      try {
        const fullPath = path.join(process.cwd(), relPath);
        if (fs.existsSync(fullPath)) {
          fs.rmdirSync(fullPath);
          console.log(`🧹 Removed empty folder: ${relPath}`);
        }
      } catch (e) {
        // Silent fail
      }
    }
  }
}
