import { HeroSection } from '@/components/hero-section';
import { RecommendationSection } from '@/components/recommendation-section';
import { FeaturesSection } from '@/components/features-section';

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <RecommendationSection />
      <FeaturesSection />
    </div>
  );
}