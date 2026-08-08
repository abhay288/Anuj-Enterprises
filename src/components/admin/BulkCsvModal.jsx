import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BulkCsvModal = ({ isOpen, onClose }) => {
  const { bulkAddProducts, showToast } = useApp();
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState([]);

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      // Simulate CSV parsing
      const mockParsed = [
        { id: `prod-${Date.now()}-1`, name: "Schneider Acti9 iC60N 16A 3P MCB", brand: "Schneider Electric", category: "Electrical & Automation", sku: "SE-MCB-16A-3P", price: 1420, mrp: 1850, stock: 200, gstRate: 18, rating: 4.9, reviewCount: 45, image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", hsn: "85362090" },
        { id: `prod-${Date.now()}-2`, name: "SKF 6205-2RSH Deep Groove Ball Bearing", brand: "SKF", category: "Bearings & Power Transmission", sku: "SKF-BRG-6205", price: 420, mrp: 550, stock: 800, gstRate: 18, rating: 4.8, reviewCount: 110, image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80", hsn: "84821010" }
      ];
      setPreviewData(mockParsed);
    }
  };

  const handleUploadSubmit = () => {
    if (!previewData.length) {
      showToast('Please select a CSV file first', 'warning');
      return;
    }

    setIsUploading(true);
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          bulkAddProducts(previewData);
          setIsUploading(false);
          setFile(null);
          setPreviewData([]);
          setProgress(0);
          onClose();
        }, 500);
      }
    }, 300);
  };

  const downloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,Product Name,Brand,Category,SKU,Price,MRP,Stock,GST Rate,HSN\nSchneider MCB 16A,Schneider Electric,Electrical & Automation,SE-MCB-16A,1420,1850,200,18,85362090";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Anuj_Enterprises_Bulk_Products_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded sample CSV template', 'info');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Bulk CSV Product Inventory Import</h3>
                <p className="text-xs text-slate-300">Upload 100+ SKU records seamlessly</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Drag & Drop Zone */}
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center bg-slate-50 dark:bg-slate-950/60 hover:border-amber-500 transition-colors relative cursor-pointer"
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileDrop}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-12 h-12 text-amber-500 mx-auto mb-3 animate-bounce" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                {file ? file.name : "Drag & Drop your Inventory CSV File here"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports .CSV files formatted with UTF-8 encoding (Max 10MB)
              </p>
            </div>

            {/* Sample Template Download */}
            <div className="flex justify-between items-center text-xs pt-2">
              <span className="text-slate-500 dark:text-slate-400">Need the correct column structure?</span>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" /> Download CSV Sample Template
              </button>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Processing Records...</span>
                  <span className="text-amber-500">{progress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Preview Table */}
            {previewData.length > 0 && !isUploading && (
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Import Preview ({previewData.length} SKUs Verified)
                </span>
                <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600">
                      <tr>
                        <th className="p-2">Name</th>
                        <th className="p-2">Brand</th>
                        <th className="p-2">SKU</th>
                        <th className="p-2 text-right">Price Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {previewData.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-bold">{item.name}</td>
                          <td className="p-2">{item.brand}</td>
                          <td className="p-2 font-mono">{item.sku}</td>
                          <td className="p-2 text-right font-bold">Price On Request</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUploadSubmit}
                disabled={isUploading || !file}
                className="flex-1 py-3 bg-brand-900 hover:bg-brand-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Import All Records"}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
