import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface SectionTitleProps {
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
}

export function SectionTitle({
  title,
  viewAllLink,
  viewAllText = "View All",
}: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-600 to-pink-500" />
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-indigo-950 uppercase">
          {title}
        </h2>
      </div>
      {viewAllLink && (
        <Link
          href={viewAllLink}
          className="inline-flex items-center gap-1 text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors group"
        >
          <span>{viewAllText}</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
}
