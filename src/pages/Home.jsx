import Navbar from "../components/Navbar.jsx";
import Hero from "../components/Hero.jsx";
import Features from "../components/Features.jsx";
import HowItWorks from "../components/HowItworks.jsx";
import UseCases from "../components/Usecases.jsx";
import FAQ from "../components/Faq.jsx";
import CTAFooter from "../components/Ctafooter.jsx";

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
