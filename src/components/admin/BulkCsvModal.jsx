import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, Loader2, AlertCircle, Image as ImageIcon, History } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BulkCsvModal = ({ isOpen, onClose }) => {
  const { bulkAddProducts, showToast } = useApp();
  const [file, setFile] = useState(null);
  const [imagesZip, setImagesZip] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState([]);
  const [failedData, setFailedData] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('import'); // 'import' | 'history'

  const mockImportHistory = [
    { date: "2026-08-12 14:30", fileName: "fmcg_bulk_august.csv", total: 45, success: 44, failed: 1, status: "Completed with warnings" },
    { date: "2026-08-01 10:15", fileName: "amul_dairy_update.csv", total: 20, success: 20, failed: 0, status: "Success" },
  ];

  if (!isOpen) return null;

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      // Simulate CSV parsing with 1 valid batch and 1 failed validation row
      const mockParsedSuccess = [
        { id: `prod-${Date.now()}-1`, name: "Amul Gold Full Cream Milk 1L Tetra (Case of 12)", brand: "Amul", category: "Dairy & Frozen Foods", sku: "AML-GLD-1L-12", price: 890, mrp: 960, stock: 150, packSize: "1 Litre", bundleSize: "6 Units", caseSize: "12 Units", rating: 4.9, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80", status: "Published" },
        { id: `prod-${Date.now()}-2`, name: "Britannia NutriChoice Digestive Biscuits (Carton of 24)", brand: "Britannia", category: "Confectionery & Snacks", sku: "BRT-NTR-DIG-24", price: 1680, mrp: 1920, stock: 300, packSize: "200g Pack", bundleSize: "6 Packs", caseSize: "24 Packs", rating: 4.8, image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80", status: "Published" }
      ];
      const mockParsedFailed = [
        { row: 4, sku: "ERR-INVALID-SKU", name: "Corrupted FMCG Item", error: "Missing mandatory Pack Size & invalid Price format" }
      ];

      setPreviewData(mockParsedSuccess);
      setFailedData(mockParsedFailed);
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
      currentProgress += 25;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          bulkAddProducts(previewData);
          setIsUploading(false);
          setFile(null);
          setPreviewData([]);
          setFailedData([]);
          setProgress(0);
          onClose();
        }, 500);
      }
    }, 250);
  };

  const downloadSampleCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,Product Name,Brand,Category,SKU,Price,MRP,Stock,Pack Size,Bundle Size,Case Size,HSN\nAmul Gold 1L,Amul,Dairy & Frozen Foods,AML-GLD-1L,890,960,150,1 Litre,6 Units,12 Units,04012000";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Anuj_Enterprises_Bulk_Import_Template.csv");
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
                <h3 className="text-lg font-extrabold">Bulk Product Inventory CSV Import</h3>
                <p className="text-xs text-slate-300">Upload CSV records & zip product image archives</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-950 text-xs">
            <button
              onClick={() => setActiveSubTab('import')}
              className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'import'
                  ? 'border-amber-500 text-slate-900 dark:text-white font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4" /> Import CSV File
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'history'
                  ? 'border-amber-500 text-slate-900 dark:text-white font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" /> Import History
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {activeSubTab === 'import' && (
              <>
                {/* Drag & Drop Zone for CSV */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950/60 hover:border-amber-500 transition-colors relative cursor-pointer"
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileDrop}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">
                    {file ? file.name : "Drag & Drop your Inventory .CSV File here"}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Supports .CSV formatted with columns: Product Name, Brand, Category, SKU, Pack Size, Bundle Size, Case Size
                  </p>
                </div>

                {/* Upload Product Images Zip Indicator */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Upload Product Images (.ZIP Archive - Optional)</span>
                  </div>
                  <input
                    type="file"
                    accept=".zip"
                    onChange={(e) => setImagesZip(e.target.files[0])}
                    className="text-[11px] text-slate-500"
                  />
                </div>

                {/* Download Sample CSV */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Need correct column mapping template?</span>
                  <button
                    type="button"
                    onClick={downloadSampleCsv}
                    className="text-amber-600 dark:text-amber-400 font-extrabold hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Sample CSV Template
                  </button>
                </div>

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-extrabold">
                      <span className="text-slate-700 dark:text-slate-300">Validating & Importing Records...</span>
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

                {/* Preview & Validation Results */}
                {previewData.length > 0 && !isUploading && (
                  <div className="space-y-4">
                    {/* Imported Success Products */}
                    <div className="space-y-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Validated Products Ready for Import ({previewData.length})
                      </span>
                      <div className="max-h-36 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 font-extrabold">
                            <tr>
                              <th className="p-2">Name</th>
                              <th className="p-2">Brand</th>
                              <th className="p-2">SKU</th>
                              <th className="p-2">Pack Details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                            {previewData.map((item, idx) => (
                              <tr key={idx}>
                                <td className="p-2 font-bold text-slate-900 dark:text-white">{item.name}</td>
                                <td className="p-2 font-semibold">{item.brand}</td>
                                <td className="p-2 font-mono">{item.sku}</td>
                                <td className="p-2 text-slate-500">{item.packSize || '1 Unit'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Failed Validation Errors List */}
                    {failedData.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> Failed Validation Errors ({failedData.length} Row)
                        </span>
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900 text-xs space-y-1 text-red-800 dark:text-red-300">
                          {failedData.map((err, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span>Row {err.row}: <strong>{err.sku}</strong> — {err.error}</span>
                              <span className="text-[10px] font-bold uppercase bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 px-2 py-0.5 rounded">Skipped</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={isUploading || !file}
                    className="flex-1 py-3 bg-brand-900 hover:bg-brand-800 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Confirm & Import Validated Products"}
                  </button>
                </div>
              </>
            )}

            {/* SubTab 2: Import History */}
            {activeSubTab === 'history' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Recent Bulk Import Operations</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 font-extrabold">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">File Name</th>
                        <th className="p-2.5 text-center">Imported</th>
                        <th className="p-2.5 text-center">Failed</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {mockImportHistory.map((log, idx) => (
                        <tr key={idx}>
                          <td className="p-2.5 text-slate-500 font-mono">{log.date}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-white">{log.fileName}</td>
                          <td className="p-2.5 text-center font-bold text-emerald-600">{log.success}</td>
                          <td className="p-2.5 text-center font-bold text-red-600">{log.failed}</td>
                          <td className="p-2.5 text-right font-extrabold text-amber-600">{log.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
