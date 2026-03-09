import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Download, Trash2, X } from 'lucide-react';

interface PDFFile {
  id: string;
  name: string;
  blob: Blob;
  size: number;
  converted?: Blob;
  status?: 'pending' | 'converting' | 'converted' | 'error';
}

export default function PdfToWordTool() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
          status: 'pending',
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

  const convertPdfToWord = async (file: PDFFile) => {
    setPdfFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'converting' } : f));

    setTimeout(() => {
      const docContent = `
${file.name.replace('.pdf', '')}

This is a converted document from PDF.

Content would be extracted from the PDF file.
`.trim();

      const blob = new Blob([docContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

      setPdfFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'converted', converted: blob } : f
      ));
    }, 1500);
  };

  const handleConvertAll = async () => {
    setIsProcessing(true);
    for (const file of pdfFiles) {
      if (file.status === 'pending') {
        await convertPdfToWord(file);
      }
    }
    setIsProcessing(false);
  };

  const downloadConverted = useCallback((file: PDFFile) => {
    if (!file.converted) return;
    const url = URL.createObjectURL(file.converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.replace('.pdf', '.docx');
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

  const convertedCount = pdfFiles.filter(f => f.status === 'converted').length;

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            PDF to Word
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Convert PDF files to editable Word documents
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {pdfFiles.length} PDF{pdfFiles.length !== 1 ? 's' : ''} {convertedCount > 0 && `• ${convertedCount} converted`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConvertAll}
                      disabled={pdfFiles.length === 0 || isProcessing}
                      className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
                    >
                      <Download className="h-4 w-4" />
                      {isProcessing ? 'Converting...' : 'Convert All'}
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
                            {pdf.status === 'converting' ? (
                              <div className="animate-spin">
                                <FileText className="h-5 w-5 text-gray-600" />
                              </div>
                            ) : (
                              <FileText className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{pdf.name}</p>
                          <p className="text-xs text-gray-500">
                            {pdf.status === 'pending' && 'Ready to convert'}
                            {pdf.status === 'converting' && 'Converting...'}
                            {pdf.status === 'converted' && `Converted • ${formatFileSize(pdf.size)}`}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        {pdf.status === 'converted' && pdf.converted && (
                          <button
                            onClick={() => downloadConverted(pdf)}
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
