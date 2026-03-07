import { useState } from 'react';
import JSZip from 'jszip';
import './App.css';

interface PDFFile {
  name: string;
  blob: Blob;
}

function App() {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');
    setPdfFiles([]);

    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const pdfs: PDFFile[] = [];

      for (const filename of Object.keys(contents.files)) {
        if (filename.toLowerCase().endsWith('.pdf')) {
          const fileData = contents.files[filename];
          if (!fileData.dir) {
            const blob = await fileData.async('blob');
            pdfs.push({ name: filename, blob });
          }
        }
      }

      if (pdfs.length === 0) {
        setError('No PDF files found in the ZIP archive');
      } else {
        setPdfFiles(pdfs);
      }
    } catch (err) {
      setError('Error processing ZIP file. Please ensure it is a valid ZIP archive.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPDF = (pdf: PDFFile) => {
    const url = URL.createObjectURL(pdf.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = pdf.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadAllPDFs = async () => {
    const zip = new JSZip();
    pdfFiles.forEach(pdf => {
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
  };

  const resetUpload = () => {
    setPdfFiles([]);
    setError('');
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">ZIP to PDF Extractor</h1>
          <p className="subtitle">Upload a ZIP file to extract all PDF documents</p>
        </header>

        <div className="upload-section">
          <input
            type="file"
            id="file-input"
            accept=".zip"
            onChange={handleFileUpload}
            className="file-input"
            disabled={isProcessing}
          />
          <label htmlFor="file-input" className={`upload-button ${isProcessing ? 'disabled' : ''}`}>
            {isProcessing ? 'Processing...' : 'Choose ZIP File'}
          </label>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {pdfFiles.length > 0 && (
          <div className="results">
            <div className="results-header">
              <p className="count">{pdfFiles.length} PDF {pdfFiles.length === 1 ? 'file' : 'files'} found</p>
              <div className="header-actions">
                <button onClick={downloadAllPDFs} className="download-all-button">
                  Download All
                </button>
                <button onClick={resetUpload} className="reset-button">
                  Upload New
                </button>
              </div>
            </div>

            <div className="pdf-list">
              {pdfFiles.map((pdf, index) => (
                <div key={index} className="pdf-item">
                  <div className="pdf-info">
                    <span className="pdf-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </span>
                    <span className="pdf-name">{pdf.name}</span>
                  </div>
                  <button onClick={() => downloadPDF(pdf)} className="download-button">
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <footer className="footer">
          <p>GK Tools</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
