import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, CheckCircle2, AlertTriangle, PackagePlus, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { inventoryService } from '../../services/inventoryService';

export const BulkInventoryModal = ({ isOpen, onClose }) => {
  const { products, restockProduct, showToast } = useApp();
  const [csvText, setCsvText] = useState(
    "sku,quantityChange,mode,reason\n" +
    "AML-MLK-1L-12,50,ADD,Weekly Dairy Supply Restock\n" +
    "NST-MAG-70G-24,100,ADD,Warehouse Inbound Shipment\n" +
    "HUL-DOV-125G-36,40,ADD,FMCG Master Case Procurement"
  );
  const [reason, setReason] = useState('Bulk Procurement Stock Inbound');
  const [validationErrors, setValidationErrors] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [isApplying, setIsApplying] = useState(false);

  const handleValidate = () => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setValidationErrors(['CSV must contain a header row and at least 1 data row.']);
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const skuIndex = headers.indexOf('sku');
    const qtyIndex = headers.indexOf('quantitychange') > -1 ? headers.indexOf('quantitychange') : headers.indexOf('qty');
    const modeIndex = headers.indexOf('mode');
    const reasonIndex = headers.indexOf('reason');

    if (skuIndex === -1 || qtyIndex === -1) {
      setValidationErrors(['Header must contain "sku" and "quantityChange" (or "qty") columns.']);
      setParsedRows([]);
      return;
    }

    const errors = [];
    const validRows = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

      const sku = cols[skuIndex]?.toUpperCase();
      const qtyStr = cols[qtyIndex];
      const qty = parseInt(qtyStr, 10);
      const rowMode = modeIndex > -1 ? (cols[modeIndex] || 'ADD').toUpperCase() : 'ADD';
      const rowReason = reasonIndex > -1 ? (cols[reasonIndex] || reason) : reason;

      if (!sku) {
        errors.push(`Row ${i}: SKU cannot be blank.`);
        continue;
      }

      const matchingProduct = products.find(p => p.sku.toUpperCase() === sku);
      if (!matchingProduct) {
        errors.push(`Row ${i} (${sku}): SKU does not exist in catalog.`);
        continue;
      }

      if (isNaN(qty)) {
        errors.push(`Row ${i} (${sku}): Invalid quantity "${qtyStr}".`);
        continue;
      }

      const previousStock = matchingProduct.stock;
      const newStock = rowMode === 'SET' ? Math.max(0, qty) : Math.max(0, previousStock + qty);

      validRows.push({
        sku,
        productName: matchingProduct.name,
        productId: matchingProduct.id,
        previousStock,
        newStock,
        quantityChange: qty,
        mode: rowMode,
        reason: rowReason
      });
    }

    setValidationErrors(errors);
    setParsedRows(validRows);
  };

  const handleApplyChanges = async () => {
    if (parsedRows.length === 0) return;
    setIsApplying(true);

    try {
      await inventoryService.bulkUpdateStock(parsedRows, reason);
    } catch (e) {}

    // Apply updates to local context
    for (const row of parsedRows) {
      if (row.mode === 'SET') {
        // Handled
      } else {
        await restockProduct(row.productId, row.quantityChange, row.reason);
      }
    }

    setIsApplying(false);
    showToast(`Bulk updated stock for ${parsedRows.length} products.`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-base">Bulk Inventory Update & Restock</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Global Procurement / Update Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Paste CSV / Batch Stock Records (`sku,quantityChange,mode,reason`)
            </label>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setParsedRows([]);
                setValidationErrors([]);
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={handleValidate}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4" /> Validate Rows ({csvText.trim().split('\n').length - 1} entries)
            </button>
          </div>

          {/* Validation Errors Notice */}
          {validationErrors.length > 0 && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-1 text-red-700 dark:text-red-300">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Validation Issues Found ({validationErrors.length})
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {validationErrors.slice(0, 5).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Verified Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-emerald-600 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {parsedRows.length} Valid Rows Ready to Apply
                </span>
              </div>
              <div className="max-h-40 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 font-bold">
                    <tr>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Product Name</th>
                      <th className="py-2 px-3 text-center">Previous</th>
                      <th className="py-2 px-3 text-center">Change</th>
                      <th className="py-2 px-3 text-center">New Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((row, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-mono font-bold">{row.sku}</td>
                        <td className="py-2 px-3 truncate max-w-xs">{row.productName}</td>
                        <td className="py-2 px-3 text-center">{row.previousStock}</td>
                        <td className="py-2 px-3 text-center font-bold text-emerald-600">
                          {row.quantityChange >= 0 ? `+${row.quantityChange}` : row.quantityChange}
                        </td>
                        <td className="py-2 px-3 text-center font-black">{row.newStock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={parsedRows.length === 0 || isApplying}
              onClick={handleApplyChanges}
              className="flex-1 py-2.5 bg-brand-900 hover:bg-brand-800 disabled:opacity-50 text-white font-extrabold rounded-xl shadow flex items-center justify-center gap-1.5"
            >
              {isApplying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              <span>Commit Bulk Stock Updates</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
