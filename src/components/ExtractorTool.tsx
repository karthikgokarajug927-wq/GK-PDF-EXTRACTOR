import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { Upload, FileText, Download, Trash2, Search, ArrowUpDown, X } from 'lucide-react';

interface PDFFile {
  name: string;
  blob: Blob;
  sourceZip: string;
  size: number;
}

export default function ExtractorTool() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'name' | 'size' | 'source'>('name');
  const [removeDuplicates, setRemoveDuplicates] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    setIsProcessing(true);
    const allPdfs: PDFFile[] = [];
    const seenNames = new Set<string>();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.name.toLowerCase().endsWith('.zip')) continue;

      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);

        for (const filename of Object.keys(contents.files)) {
          if (filename.toLowerCase().endsWith('.pdf')) {
            const fileData = contents.files[filename];
            if (!fileData.dir) {
              if (removeDuplicates && seenNames.has(filename)) {
                continue;
              }
              const blob = await fileData.async('blob');
              allPdfs.push({
                name: filename,
                blob,
                sourceZip: file.name,
                size: blob.size,
              });
              seenNames.add(filename);
            }
          }
        }
      } catch (err) {
        console.error('Error processing', file.name, err);
      }
    }

    setPdfFiles(prev => [...prev, ...allPdfs]);
    setIsProcessing(false);
  }, [removeDuplicates]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const downloadPDF = useCallback((pdf: PDFFile) => {
    const url = URL.createObjectURL(pdf.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdf.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const filteredAndSortedPDFs = pdfFiles
    .filter(pdf => pdf.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return b.size - a.size;
        case 'source':
          return a.sourceZip.localeCompare(b.sourceZip);
        default:
          return 0;
      }
    });

  const downloadAllPDFs = useCallback(async () => {
    const zip = new JSZip();
    const pdfsToDownload = pdfFiles
      .filter(pdf => pdf.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        switch (sortOrder) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'size':
            return b.size - a.size;
          case 'source':
            return a.sourceZip.localeCompare(b.sourceZip);
          default:
            return 0;
        }
      });

    pdfsToDownload.forEach(pdf => {
      zip.file(pdf.name, pdf.blob);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted_pdfs.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [pdfFiles, searchQuery, sortOrder]);

  const clearAll = useCallback(() => {
    setPdfFiles([]);
    setSearchQuery('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <section id="tool" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Start Extracting
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Upload your ZIP files and let us do the rest
          </p>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative mx-auto max-w-4xl rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
            isDragging
              ? 'border-gray-900 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".zip"
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {isProcessing ? 'Processing...' : 'Drop ZIP files here'}
          </h3>
          <p className="mt-2 text-sm text-gray-600">or click to browse</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
          >
            {isProcessing ? 'Processing...' : 'Select ZIP Files'}
          </button>
        </div>

        {pdfFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-6xl mt-16"
          >
            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/10 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {filteredAndSortedPDFs.length} PDF{filteredAndSortedPDFs.length !== 1 ? 's' : ''} extracted
                    </p>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={removeDuplicates}
                        onChange={(e) => setRemoveDuplicates(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      Remove duplicates
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={downloadAllPDFs}
                      className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                    >
                      <Download className="h-4 w-4" />
                      Download All
                    </button>
                    <button
                      onClick={clearAll}
                      className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search PDF files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as any)}
                      className="appearance-none rounded-lg border border-gray-300 pl-10 pr-10 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="size">Sort by Size</option>
                      <option value="source">Sort by Source</option>
                    </select>
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {filteredAndSortedPDFs.map((pdf, index) => (
                    <motion.div
                      key={`${pdf.name}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            <FileText className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{pdf.name}</p>
                          <p className="text-xs text-gray-500 truncate">
                            From: {pdf.sourceZip} • {formatFileSize(pdf.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadPDF(pdf)}
                        className="ml-4 flex-shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                      >
                        Download
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
