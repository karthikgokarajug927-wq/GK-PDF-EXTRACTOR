import { motion } from 'framer-motion';
import { Clock, Users, Package, Lock } from 'lucide-react';

const benefits = [
  {
    name: 'Saves Hours of Manual Extraction',
    description: 'Automate the tedious process of extracting PDFs from multiple ZIP files.',
    icon: Clock,
  },
  {
    name: 'Perfect for Logistics & Operations Teams',
    description: 'Designed for teams handling large volumes of documents and shipments.',
    icon: Users,
  },
  {
    name: 'Works with Shipment Files',
    description: 'Process delivery notes, invoices, and shipping documents efficiently.',
    icon: Package,
  },
  {
    name: 'Secure and Private',
    description: 'All processing happens in your browser. Your files never leave your device.',
    icon: Lock,
  },
];

export default function Trust() {
  return (
    <section className="bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by Teams Worldwide
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Process documents faster and more efficiently with our powerful extraction tool.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-7xl sm:mt-20 lg:mt-24">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2 lg:gap-y-16">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pl-16"
              >
                <dt className="text-base font-semibold leading-7 text-white">
                  <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg bg-white">
                    <benefit.icon className="h-6 w-6 text-gray-900" aria-hidden="true" />
                  </div>
                  {benefit.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-300">{benefit.description}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
