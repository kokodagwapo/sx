import Navigation from "@/components/sections/navigation";
import Hero from "@/components/sections/hero";
import Features from "@/components/sections/features";
import Education from "@/components/sections/education";
import Currency from "@/components/sections/currency";
import Testimonials from "@/components/sections/testimonials";
import Signup from "@/components/sections/signup";
import Footer from "@/components/sections/footer";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { useEffect } from "react";

export default function Home() {
  useSmoothScroll();

  useEffect(() => {
    document.title = "PeraBida - Smart Money Tracking for OFW Families | Financial Accountability App";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Empower your OFW family with transparent expense tracking, receipt accountability, and financial education. Built specifically for overseas Filipino workers and their families.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Empower your OFW family with transparent expense tracking, receipt accountability, and financial education. Built specifically for overseas Filipino workers and their families.';
      document.head.appendChild(meta);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Features />
      <Testimonials />
      <Education />
      <Currency />
      <Signup />
      <Footer />
    </div>
  );
}
