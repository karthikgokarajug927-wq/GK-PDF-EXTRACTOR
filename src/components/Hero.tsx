import { motion } from 'framer-motion';
import { ArrowRight, FileArchive, FileText, Merge } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl text-balance"
          >
            All Your PDF Tools{' '}
            <span className="text-gray-600">in One Place</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-lg leading-8 text-gray-600"
          >
            Extract, merge, compress and convert PDF files instantly. No installation required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <button
              onClick={onGetStarted}
              className="rounded-lg bg-gray-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center gap-2"
            >
              Start Using Tools
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors"
            >
              See Features <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flow-root sm:mt-24"
        >
          <div className="relative mx-auto max-w-2xl rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:max-w-5xl">
            <div className="relative rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/10 p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                  className="flex flex-col items-center"
                >
                  <div className="rounded-xl bg-blue-100 p-6 shadow-lg">
                    <FileArchive className="w-16 h-16 text-blue-600" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-600">ZIP Files</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className="rounded-xl bg-purple-100 p-6 shadow-lg">
                    <Merge className="w-16 h-16 text-purple-600" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-600">Multiple PDFs</p>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="rounded-xl bg-gray-900 p-6 shadow-lg">
                    <FileText className="w-16 h-16 text-white" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-600">Word & PDFs</p>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
