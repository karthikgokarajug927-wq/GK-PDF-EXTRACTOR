import { motion } from 'framer-motion';
import { Upload, Zap, Files, Copy, Download, Shield } from 'lucide-react';

const features = [
  {
    name: 'Upload Multiple ZIP Files',
    description: 'Drag and drop or select multiple ZIP files at once for batch processing.',
    icon: Upload,
  },
  {
    name: 'Automatic PDF Detection',
    description: 'Intelligently scans and identifies all PDF files within your ZIP archives.',
    icon: Zap,
  },
  {
    name: 'Extract Hundreds of PDFs Fast',
    description: 'Process large archives containing hundreds of PDF files in seconds.',
    icon: Files,
  },
  {
    name: 'Remove Duplicate Files',
    description: 'Automatically detect and remove duplicate PDF files to save space.',
    icon: Copy,
  },
  {
    name: 'One-Click Download',
    description: 'Download all extracted PDFs as a single ZIP file with one click.',
    icon: Download,
  },
  {
    name: 'Secure Processing',
    description: 'All files are processed locally in your browser. Nothing is uploaded to servers.',
    icon: Shield,
  },
];

export default function Features() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-gray-600">Everything You Need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Powerful Features for PDF Extraction
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Built for teams who need to process documents efficiently and securely.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-16"
              >
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-900">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
