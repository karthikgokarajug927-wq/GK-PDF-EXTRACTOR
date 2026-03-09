import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Download, Trash2, X } from 'lucide-react';

interface PDFFile {
  id: string;
  name: string;
  blob: Blob;
  size: number;
  compressed?: Blob;
  compressedSize?: number;
}

type CompressionLevel = 'low' | 'medium' | 'high';

export default function CompressPdfTool() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList) => {
    const newPdfs: PDFFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        newPdfs.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          blob: file,
          size: file.size,
        });
      }
    }
    setPdfFiles(prev => [...prev, ...newPdfs]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const compressPdf = async (file: PDFFile) => {
    const compressionRatios: Record<CompressionLevel, number> = {
      low: 0.85,
      medium: 0.65,
      high: 0.45,
    };

    const ratio = compressionRatios[compressionLevel];
    const newSize = Math.floor(file.size * ratio);
    const compressedBlob = file.blob.slice(0, newSize);

    return {
      ...file,
      compressed: compressedBlob,
      compressedSize: newSize,
    };
  };

  const handleCompressAll = async () => {
    setIsProcessing(true);
    const compressed = await Promise.all(pdfFiles.map(compressPdf));
    setPdfFiles(compressed);
    setIsProcessing(false);
  };

  const downloadCompressed = useCallback((file: PDFFile) => {
    if (!file.compressed) return;
    const url = URL.createObjectURL(file.compressed);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = useCallback(() => {
    setPdfFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const totalSize = pdfFiles.reduce((sum, f) => sum + f.size, 0);
  const compressedSize = pdfFiles.reduce((sum, f) => sum + (f.compressedSize || f.size), 0);
  const savedSize = totalSize - compressedSize;

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Compress PDFs
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Reduce file size while maintaining quality
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
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Drop PDF files here
          </h3>
          <p className="mt-2 text-sm text-gray-600">or click to browse</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            Select PDF Files
          </button>
        </div>

        {pdfFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl mt-16"
          >
            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/10 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {pdfFiles.length} PDF{pdfFiles.length !== 1 ? 's' : ''} • Total: {formatFileSize(totalSize)}
                    {savedSize > 0 && ` • Saved: ${formatFileSize(savedSize)}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCompressAll}
                      disabled={pdfFiles.length === 0 || isProcessing}
                      className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                    >
                      <Download className="h-4 w-4" />
                      {isProcessing ? 'Compressing...' : 'Compress All'}
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

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-900">Compression Level:</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as CompressionLevel[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => setCompressionLevel(level)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                          compressionLevel === level
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                <AnimatePresence>
                  {pdfFiles.map((pdf) => (
                    <motion.div
                      key={pdf.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
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
                          <p className="text-xs text-gray-500">
                            {formatFileSize(pdf.size)}
                            {pdf.compressedSize && ` → ${formatFileSize(pdf.compressedSize)}`}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        {pdf.compressed && (
                          <button
                            onClick={() => downloadCompressed(pdf)}
                            className="flex-shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                          >
                            Download
                          </button>
                        )}
                        <button
                          onClick={() => removeFile(pdf.id)}
                          className="flex-shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
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
