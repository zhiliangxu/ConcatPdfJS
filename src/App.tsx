import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { 
  Upload, 
  FileText, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  FilePlus, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';

// Main App Component
export default function App() {
  const [files, setFiles] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Accept PDF, JPG, JPEG, PNG
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => validTypes.includes(file.type));
    
    if (droppedFiles.length === 0) {
      setError("Please drop valid PDF or Image (JPG, PNG) files.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const selectedFiles = Array.from(e.target.files).filter(file => validTypes.includes(file.type));
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    setSuccessMsg('');
    setError(null);
    const filesWithId = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      type: file.type, // Store type for icon logic
      size: (file.size / 1024 / 1024).toFixed(2) // MB
    }));
    setFiles(prev => [...prev, ...filesWithId]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...files];
    if (direction === 'up' && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
    } else if (direction === 'down' && index < newFiles.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    }
    setFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 1) {
      setError("Please select at least 1 file to generate a PDF.");
      return;
    }

    setProcessing(true);
    setError(null);
    setSuccessMsg('');

    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of files) {
        const fileBuffer = await fileObj.file.arrayBuffer();

        if (fileObj.file.type === 'application/pdf') {
          // Handle PDF merging
          const pdf = await PDFDocument.load(fileBuffer);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } 
        else if (fileObj.file.type === 'image/jpeg' || fileObj.file.type === 'image/png') {
          // Handle Image embedding
          let image;
          if (fileObj.file.type === 'image/jpeg') {
            image = await mergedPdf.embedJpg(fileBuffer);
          } else {
            image = await mergedPdf.embedPng(fileBuffer);
          }

          // Create a page with the same dimensions as the image
          const page = mergedPdf.addPage([image.width, image.height]);
          
          // Draw the image on the page
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as any], { type: 'application/pdf' });

      // Try to use File System Access API if available
      if ('showSaveFilePicker' in window) {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: 'merged_document.pdf',
            types: [{
              description: 'PDF Document',
              accept: { 'application/pdf': ['.pdf'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          setSuccessMsg('PDF saved successfully!');
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            downloadBlob(blob);
          }
        }
      } else {
        downloadBlob(blob);
        setSuccessMsg('PDF downloaded successfully!');
      }

    } catch (err) {
      console.error(err);
      setError("An error occurred while merging. Ensure files are not corrupted.");
    } finally {
      setProcessing(false);
    }
  };

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            PDF & Image Merger
          </h1>
          <p className="text-slate-500 text-lg">
            Securely combine PDFs and Images into one file directly in your browser. <br/>
            <span className="text-sm text-slate-400 font-medium">No uploads. No server processing. 100% Private.</span>
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          
          {/* Drop Zone */}
          <div 
            className={`p-10 border-2 border-dashed transition-all duration-300 text-center ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-700">
                  Drag & Drop PDF or Image files here
                </p>
                <p className="text-sm text-slate-400 mt-1">Supports PDF, JPG, PNG</p>
              </div>
              <label className="cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf, .jpg, .jpeg, .png" 
                  onChange={handleFileInput} 
                  className="hidden" 
                />
                <span className="inline-flex items-center px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                  <FilePlus className="w-4 h-4 mr-2" />
                  Select Files
                </span>
              </label>
            </div>
          </div>

          {/* Action Bar / Status */}
          {(error || successMsg) && (
            <div className={`px-6 py-4 flex items-center ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {error ? <AlertCircle className="w-5 h-5 mr-3" /> : <CheckCircle2 className="w-5 h-5 mr-3" />}
              <span className="font-medium">{error || successMsg}</span>
            </div>
          )}

          {/* File List */}
          <div className="p-6 md:p-8 bg-slate-50 min-h-[300px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                Files to Merge ({files.length})
              </h2>
              {files.length > 0 && (
                <button 
                  onClick={() => setFiles([])}
                  className="text-sm text-red-500 hover:text-red-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 border border-slate-200 rounded-2xl bg-white border-dashed">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <p>No files selected yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div 
                    key={file.id} 
                    className="group flex flex-col sm:flex-row items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center w-full sm:w-auto mb-3 sm:mb-0 overflow-hidden">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-4 ${file.type.includes('image') ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
                        {file.type.includes('image') ? (
                          <ImageIcon className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-bold">PDF</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-700 truncate max-w-[200px] md:max-w-xs" title={file.name}>
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-400 uppercase">
                           {file.type.split('/')[1]} • {file.size} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <div className="flex items-center mr-2 space-x-1 bg-slate-100 rounded-lg p-1">
                        <button 
                          onClick={() => moveFile(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
                          title="Move Up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => moveFile(index, 'down')}
                          disabled={index === files.length - 1}
                          className="p-1.5 rounded-md hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
                          title="Move Down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove File"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
            <button
              onClick={mergePDFs}
              disabled={files.length < 1 || processing}
              className={`
                flex items-center px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all
                ${files.length < 1 || processing
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-0.5 active:translate-y-0'
                }
              `}
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Merging...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-3" />
                  Merge & Save PDF
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>Powered by PDF-Lib. Runs locally in your browser.</p>
        </div>

      </div>
    </div>
  );
}
