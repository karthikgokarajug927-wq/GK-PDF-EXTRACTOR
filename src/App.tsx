import { useState, useRef } from 'react';
import Hero from './components/Hero';
import ToolsGrid from './components/ToolsGrid';
import HowItWorks from './components/HowItWorks';
import ZipExtractorTool from './components/tools/ZipExtractorTool';
import MergePdfTool from './components/tools/MergePdfTool';
import CompressPdfTool from './components/tools/CompressPdfTool';
import PdfToWordTool from './components/tools/PdfToWordTool';
import WordToPdfTool from './components/tools/WordToPdfTool';
import Trust from './components/Trust';
import Footer from './components/Footer';

type ToolType = 'zip-extract' | 'merge-pdf' | 'compress-pdf' | 'pdf-to-word' | 'word-to-pdf' | null;

function App() {
  const [activeTool, setActiveTool] = useState<ToolType>(null);
  const toolRef = useRef<HTMLDivElement>(null);

  const scrollToTool = () => {
    setActiveTool(null);
    toolRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      {activeTool === null ? (
        <>
          <Hero onGetStarted={scrollToTool} />
          <div ref={toolRef}>
            <ToolsGrid onSelectTool={setActiveTool} />
          </div>
          <HowItWorks />
          <Trust />
          <Footer />
        </>
      ) : (
        <>
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-4 flex items-center justify-between">
              <button
                onClick={() => setActiveTool(null)}
                className="text-gray-600 hover:text-gray-900 font-semibold transition-colors"
              >
                ← Back to Tools
              </button>
            </div>
          </div>
          {activeTool === 'zip-extract' && <ZipExtractorTool />}
          {activeTool === 'merge-pdf' && <MergePdfTool />}
          {activeTool === 'compress-pdf' && <CompressPdfTool />}
          {activeTool === 'pdf-to-word' && <PdfToWordTool />}
          {activeTool === 'word-to-pdf' && <WordToPdfTool />}
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;
