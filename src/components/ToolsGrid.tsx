import { motion } from 'framer-motion';
import { FileArchive, Merge, Zap, FileDown, File } from 'lucide-react';

interface ToolsGridProps {
  onSelectTool: (tool: 'zip-extract' | 'merge-pdf' | 'compress-pdf' | 'pdf-to-word' | 'word-to-pdf') => void;
}

const tools = [
  {
    id: 'zip-extract',
    name: 'ZIP → Extract PDFs',
    description: 'Extract all PDF files from ZIP archives instantly.',
    icon: FileArchive,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDFs',
    description: 'Combine multiple PDF files into one document.',
    icon: Merge,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while maintaining quality.',
    icon: Zap,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'pdf-to-word',
    name: 'PDF → Word',
    description: 'Convert PDF files to editable Word documents.',
    icon: FileDown,
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'word-to-pdf',
    name: 'Word → PDF',
    description: 'Convert Word documents to PDF format.',
    icon: File,
    color: 'from-red-500 to-red-600',
  },
];

export default function ToolsGrid({ onSelectTool }: ToolsGridProps) {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your Tool
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Select a tool to get started with document processing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => onSelectTool(tool.id as any)}
                className="group relative overflow-hidden rounded-2xl bg-white p-6 text-left shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 hover:border-gray-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative">
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${tool.color} p-3 mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tool.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {tool.description}
                  </p>

                  <div className="flex items-center text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    Open Tool
                    <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
