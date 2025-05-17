import { FooterWebsite } from '@/components/footer/FooterWebsite';
import Faq from '@/components/landing/faq';
import FeatureOne from '@/components/landing/feature-one';
import FeatureThree from '@/components/landing/feature-three';
import FeatureTwo from '@/components/landing/feature-two';
import FirstSection from '@/components/landing/first-section';
import Hero from '@/components/landing/hero';
import Newsletter from '@/components/landing/newsletter';
import SecondSection from '@/components/landing/second-section';
import NavbarFixed from '@/components/navbar/NavbarFixed';

export default async function HomePage() {
  return (
    <div className="relative bg-white dark:bg-zinc-950">
      <div className="relative flex h-full min-h-screen flex-col items-center overflow-hidden">
        <div className="relative flex w-full flex-col items-center justify-center pb-0 md:pb-[80px]">
          <Hero />
          <FirstSection />
          <SecondSection />
          <FeatureOne />
          <FeatureTwo />
          <FeatureThree />
          <Faq />
          <Newsletter />
        </div>
        <FooterWebsite />
      </div>
      <NavbarFixed />
    </div>
  );
} 