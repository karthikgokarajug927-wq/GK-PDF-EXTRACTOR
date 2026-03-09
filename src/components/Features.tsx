import { motion } from 'framer-motion';
import { Upload, Zap, Files, Copy, Download, Shield } from 'lucide-react';

const features = [
  {
    name: 'Lightning Fast Processing',
    description: 'Extract, merge, and convert documents in seconds with optimized performance.',
    icon: Zap,
  },
  {
    name: 'Batch Operations',
    description: 'Process multiple files at once and save hours of manual work.',
    icon: Files,
  },
  {
    name: 'Drag & Drop Upload',
    description: 'Simple intuitive interface - just drag files and drop them to get started.',
    icon: Upload,
  },
  {
    name: 'Secure & Private',
    description: 'All processing happens in your browser. Your files never leave your device.',
    icon: Shield,
  },
  {
    name: 'Multiple Tools',
    description: 'ZIP extraction, PDF merging, compression, and format conversion all in one.',
    icon: Copy,
  },
  {
    name: 'Easy Downloads',
    description: 'Download individual files or bulk downloads as ZIP archives.',
    icon: Download,
  },
];

export default function Features() {
  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-gray-600">Why Choose GK Tools</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Professional Document Processing
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Everything you need to handle documents like a pro. Fast, secure, and easy to use.
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
