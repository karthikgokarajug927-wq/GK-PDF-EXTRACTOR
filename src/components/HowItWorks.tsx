import { motion } from 'framer-motion';
import { Upload, ScanSearch, Download } from 'lucide-react';

const steps = [
  {
    name: 'Upload ZIP Files',
    description: 'Drag and drop your ZIP files or click to browse. Upload multiple files at once.',
    icon: Upload,
    step: '01',
  },
  {
    name: 'Automatic Extraction',
    description: 'Our system scans and extracts all PDF files automatically. Remove duplicates if needed.',
    icon: ScanSearch,
    step: '02',
  },
  {
    name: 'Download PDFs',
    description: 'Download individual PDFs or get all extracted files in one ZIP archive instantly.',
    icon: Download,
    step: '03',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-gray-600">Simple Process</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            How It Works
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Extract PDFs from ZIP files in three simple steps. No technical knowledge required.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="relative"
              >
                <div className="relative flex flex-col items-center text-center">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center justify-center rounded-full bg-gray-900 px-4 py-1 text-sm font-semibold text-white">
                      {step.step}
                    </span>
                  </div>
                  <div className="mt-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/10">
                    <step.icon className="h-12 w-12 text-gray-900" />
                  </div>
                  <h3 className="mt-8 text-xl font-semibold leading-7 text-gray-900">{step.name}</h3>
                  <p className="mt-4 text-base leading-7 text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
