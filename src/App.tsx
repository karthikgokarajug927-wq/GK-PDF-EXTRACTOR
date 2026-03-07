import { useRef } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import ExtractorTool from './components/ExtractorTool';
import Trust from './components/Trust';
import Footer from './components/Footer';

function App() {
  const toolRef = useRef<HTMLDivElement>(null);

  const scrollToTool = () => {
    toolRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Hero onGetStarted={scrollToTool} />
      <Features />
      <HowItWorks />
      <div ref={toolRef}>
        <ExtractorTool />
      </div>
      <Trust />
      <Footer />
    </div>
  );
}

export default App;
