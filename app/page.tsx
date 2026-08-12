import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { DiscoverEventHub } from "@/components/discover/DiscoverEventHub";
import { HomeCategories } from "@/components/home/HomeCategories";
import { Statistics } from "@/components/home/Statistics";
import { Newsletter } from "@/components/home/Newsletter";
import { CTA } from "@/components/home/CTA";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />
      <main style={{ paddingTop: 16 }}>
        <Hero />
        <DiscoverEventHub />
        <HomeCategories />
        <Statistics />
        <Newsletter />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

