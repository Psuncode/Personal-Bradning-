import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { About } from '../components/About';
import { CaseStudies } from '../components/CaseStudies';
import { ContentGrid } from '../components/ContentGrid';
import { Footer } from '../components/Footer';

export function HomePage() {
  return (
    <div className="size-full">
      <Navigation />
      <Hero />
      <About />
      <CaseStudies />
      <ContentGrid />
      <Footer />
    </div>
  );
}
