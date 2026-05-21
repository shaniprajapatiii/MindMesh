import Link from 'next/link';
import { LandingNav } from '@/components/landing/nav';
import { HeroSection } from '@/components/landing/hero';
import { FeaturesSection } from '@/components/landing/features';
import { StatsSection } from '@/components/landing/stats';
import { SheetsSection } from '@/components/landing/sheets';
import { CTASection } from '@/components/landing/cta';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <div className="grid-bg fixed inset-0 opacity-40 pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-cyan-600/8 blur-[100px]" />
      </div>
      <div className="relative z-10">
        <LandingNav />
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <SheetsSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  );
}
