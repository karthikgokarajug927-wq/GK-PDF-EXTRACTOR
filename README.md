# GK Tools - Professional Document Processing Platform

A comprehensive, modern SaaS-style web application for document processing with multiple tools for extracting, merging, compressing, and converting PDFs and Word documents.

## Features

### 1. ZIP → Extract PDFs
- Upload multiple ZIP files at once
- Automatic PDF detection and extraction
- Remove duplicate files
- Search and sort extracted PDFs
- Download individual PDFs or all as a ZIP archive
- Real-time file counter

### 2. Merge PDFs
- Combine multiple PDF files into one document
- Drag files to reorder them
- Preview file list before merging
- Download merged PDF

### 3. Compress PDF
- Reduce PDF file size with multiple compression levels (Low, Medium, High)
- Process multiple PDFs at once
- See file size reduction before downloading
- Download individual or compressed PDFs

### 4. PDF → Word
- Convert PDF files to editable Word (.docx) documents
- Batch process multiple PDFs
- Monitor conversion status
- Download converted documents

### 5. Word → PDF
- Convert Word documents (.doc, .docx) to PDF
- Batch processing support
- Conversion progress tracking
- Download converted PDFs

## Design Highlights

- **Premium SaaS UI**: Modern, minimalist design with black, white, and gray color palette
- **Smooth Animations**: Framer Motion for elegant transitions and micro-interactions
- **Responsive Layout**: Mobile-first design that works on all devices
- **Intuitive Navigation**: Easy-to-use tool selection and individual tool interfaces
- **Drag & Drop**: Simple file upload with drag-and-drop support
- **Professional Typography**: Clean, readable fonts with proper hierarchy
- **Soft Shadows**: Subtle visual depth for premium appearance

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: TailwindCSS 4
- **Animations**: Framer Motion
- **File Processing**: JSZip for ZIP handling
- **Icons**: Lucide React
- **Build Tool**: Vite

## File Processing

All file processing happens **client-side** in the browser:
- No files are uploaded to servers
- Complete privacy and security
- Fast, instant processing
- Works offline once loaded

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Hero.tsx - Landing page hero section
│   ├── ToolsGrid.tsx - Tool selection interface
│   ├── Features.tsx - Feature showcase
│   ├── HowItWorks.tsx - Process explanation
│   ├── Trust.tsx - Benefits section
│   ├── Footer.tsx - Footer with links
│   └── tools/
│       ├── ZipExtractorTool.tsx - ZIP extraction
│       ├── MergePdfTool.tsx - PDF merging
│       ├── CompressPdfTool.tsx - PDF compression
│       ├── PdfToWordTool.tsx - PDF to Word conversion
│       └── WordToPdfTool.tsx - Word to PDF conversion
├── App.tsx - Main app with tool routing
├── main.tsx - Entry point
└── index.css - Global styles
```

## Browser Support

Works on all modern browsers that support:
- ES6+ JavaScript
- File API
- Blob API
- Local storage

## License

MIT
   # GK PDF Tools
