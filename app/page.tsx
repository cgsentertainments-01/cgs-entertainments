import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeUpcomingEvents } from "@/components/home/HomeUpcomingEvents";
import { Statistics } from "@/components/home/Statistics";
import { Newsletter } from "@/components/home/Newsletter";
import { CTA } from "@/components/home/CTA";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Navbar />
      <main>
        <Hero />
        <HomeCategories />
        <HomeUpcomingEvents />
        <Statistics />
        <Newsletter />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
