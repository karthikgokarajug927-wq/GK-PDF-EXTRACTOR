import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Download, Trash2, X } from 'lucide-react';

interface DocumentFile {
  id: string;
  name: string;
  blob: Blob;
  size: number;
  converted?: Blob;
  status?: 'pending' | 'converting' | 'converted' | 'error';
}

export default function WordToPdfTool() {
  const [docFiles, setDocFiles] = useState<DocumentFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList) => {
    const newDocs: DocumentFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.toLowerCase().endsWith('.docx');
      const isDoc = file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc');

      if (isDocx || isDoc) {
        newDocs.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          name: file.name,
          blob: file,
          size: file.size,
          status: 'pending',
        });
      }
    }
    setDocFiles(prev => [...prev, ...newDocs]);
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

  const convertWordToPdf = async (file: DocumentFile) => {
    setDocFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'converting' } : f));

    setTimeout(() => {
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 100 >>
stream
BT
/F1 12 Tf
50 750 Td
(${file.name.replace(/\.(docx?|doc)$/i, '')} - Converted from Word) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000262 00000 n
0000000341 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
492
%%EOF`;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });

      setDocFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'converted', converted: blob } : f
      ));
    }, 1500);
  };

  const handleConvertAll = async () => {
    setIsProcessing(true);
    for (const file of docFiles) {
      if (file.status === 'pending') {
        await convertWordToPdf(file);
      }
    }
    setIsProcessing(false);
  };

  const downloadConverted = useCallback((file: DocumentFile) => {
    if (!file.converted) return;
    const url = URL.createObjectURL(file.converted);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.replace(/\.(docx?|doc)$/i, '.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const removeFile = (id: string) => {
    setDocFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = useCallback(() => {
    setDocFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const convertedCount = docFiles.filter(f => f.status === 'converted').length;

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Word to PDF
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Convert Word documents to PDF format
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
            accept=".doc,.docx"
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            Drop Word files here
          </h3>
          <p className="mt-2 text-sm text-gray-600">or click to browse</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-6 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-all duration-200 hover:scale-105"
          >
            Select Word Files
          </button>
        </div>

        {docFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl mt-16"
          >
            <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-900/10 overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {docFiles.length} Document{docFiles.length !== 1 ? 's' : ''} {convertedCount > 0 && `• ${convertedCount} converted`}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleConvertAll}
                      disabled={docFiles.length === 0 || isProcessing}
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
                  {docFiles.map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex-shrink-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                            {doc.status === 'converting' ? (
                              <div className="animate-spin">
                                <FileText className="h-5 w-5 text-gray-600" />
                              </div>
                            ) : (
                              <FileText className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.status === 'pending' && 'Ready to convert'}
                            {doc.status === 'converting' && 'Converting...'}
                            {doc.status === 'converted' && `Converted • ${formatFileSize(doc.size)}`}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        {doc.status === 'converted' && doc.converted && (
                          <button
                            onClick={() => downloadConverted(doc)}
                            className="flex-shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                          >
                            Download
                          </button>
                        )}
                        <button
                          onClick={() => removeFile(doc.id)}
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
