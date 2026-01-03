import { CardLookupForm } from '@/components/cards/CardLookupForm';
import { HeroSection } from '@/components/layout/HeroSection';

export default function Home() {
  return (
    <div className="space-y-12">
      <HeroSection />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <CardLookupForm />
      </div>
    </div>
  );
}
