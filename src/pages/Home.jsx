import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import UseCases from "../components/UseCases";
import FAQ from "../components/FAQ";
import CTAFooter from "../components/CTAFooter";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-amber-50 text-stone-900 font-sans overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <FAQ />
      <CTAFooter />
    </div>
  );
}
