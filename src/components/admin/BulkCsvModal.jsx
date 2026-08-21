import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, 
  Loader2, AlertCircle, Image as ImageIcon, History, 
  FileText, Archive, Check, Info, Printer
} from 'lucide-react';
import JSZip from 'jszip';
import { useApp } from '../../context/AppContext';

export const BulkCsvModal = ({ isOpen, onClose }) => {
  const { bulkAddProducts, showToast } = useApp();
  const [file, setFile] = useState(null);
  const [imagesZip, setImagesZip] = useState(null);
  const [zipImageMap, setZipImageMap] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isParsingZip, setIsParsingZip] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewData, setPreviewData] = useState([]);
  const [failedData, setFailedData] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('import'); // 'import' | 'history'

  const mockImportHistory = [
    { date: "2026-08-20 11:45", fileName: "fmcg_beverages_batch.csv", total: 32, success: 32, failed: 0, status: "Success" },
    { date: "2026-08-15 14:30", fileName: "dairy_restock_master.csv", total: 45, success: 44, failed: 1, status: "Completed with warnings" },
    { date: "2026-08-01 10:15", fileName: "amul_dairy_update.csv", total: 20, success: 20, failed: 0, status: "Success" }
  ];

  if (!isOpen) return null;

  // Robust CSV Line Parser supporting quotes and commas
  const parseCSV = (text) => {
    const lines = text.split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^["']|["']$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^["']|["']$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;
      
      const rowObj = {};
      headers.forEach((header, index) => {
        rowObj[header] = values[index] || '';
      });
      rowObj._rawRow = i + 1;
      rows.push(rowObj);
    }

    return rows;
  };

  // Extract images from uploaded ZIP file in browser
  const handleZipFileChange = async (e) => {
    const zipFile = e.target.files?.[0];
    if (!zipFile) return;

    if (!zipFile.name.endsWith('.zip')) {
      showToast('Please upload a valid .zip image archive', 'error');
      return;
    }

    setIsParsingZip(true);
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(zipFile);
      const extractedMap = {};
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];

      const filePromises = [];

      loadedZip.forEach((relativePath, zipEntry) => {
        if (!zipEntry.dir) {
          const lowerName = zipEntry.name.toLowerCase().split('/').pop() || '';
          const isImage = imageExtensions.some(ext => lowerName.endsWith(ext));
          
          if (isImage) {
            const promise = zipEntry.async('base64').then((base64Data) => {
              const mime = lowerName.endsWith('.png') ? 'image/png' 
                : lowerName.endsWith('.webp') ? 'image/webp' 
                : lowerName.endsWith('.svg') ? 'image/svg+xml' 
                : 'image/jpeg';
              const dataUrl = `data:${mime};base64,${base64Data}`;
              
              // Store by clean filename and base name without extension
              extractedMap[lowerName] = dataUrl;
              const baseNameWithoutExt = lowerName.substring(0, lowerName.lastIndexOf('.'));
              extractedMap[baseNameWithoutExt] = dataUrl;
            });
            filePromises.push(promise);
          }
        }
      });

      await Promise.all(filePromises);
      setImagesZip(zipFile);
      setZipImageMap(extractedMap);
      const extractedCount = Object.keys(extractedMap).length / 2;
      showToast(`Extracted ${Math.round(extractedCount)} product image(s) from ZIP archive!`, 'success');
      
      // Re-validate if CSV already loaded
      if (file) {
        processCsvFile(file, extractedMap);
      }
    } catch (err) {
      console.error('ZIP Parsing error:', err);
      showToast('Failed to read ZIP archive. Please ensure it is a valid .zip file.', 'error');
    } finally {
      setIsParsingZip(false);
    }
  };

  const processCsvFile = (csvFile, imageMap = zipImageMap) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text) return;

        const rawRows = parseCSV(text);
        const validRows = [];
        const invalidRows = [];

        rawRows.forEach((row) => {
          // Normalize column lookups
          const name = row.productname || row.name || row.title || row.producttitle || '';
          const brand = row.brand || row.company || 'Amul';
          const category = row.category || 'Food & Beverages';
          const sku = (row.sku || row.skucode || `${brand.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`).toUpperCase();
          const stock = parseInt(row.stock || row.currentstock || row.quantity || '100', 10);
          const lowStockThreshold = parseInt(row.lowstockthreshold || row.threshold || '20', 10);
          const packSize = row.packsize || row.unitpacksize || '1 Unit';
          const bundleSize = row.bundlesize || row.innerbundlesize || '6 Units';
          const caseSize = row.casesize || row.mastercasesize || '12 Units';
          const hsn = row.hsn || row.hsncode || '19053100';
          const description = row.description || row.overview || 'Standard wholesale FMCG distributor pack.';
          const isFeatured = (row.featured || row.isfeatured || 'true').toLowerCase() === 'true';
          const isNew = (row.new || row.isnew || 'false').toLowerCase() === 'true';
          const status = (row.status || 'Published').toLowerCase() === 'draft' ? 'Draft' : 'Published';

          // Image resolution: Check image columns or look up in zipImageMap
          const imgCol1 = (row.image1 || row.image || row.imagefilename1 || row.imagefilename || '').toLowerCase().trim();
          const imgCol2 = (row.image2 || row.imagefilename2 || '').toLowerCase().trim();
          const imgCol3 = (row.image3 || row.imagefilename3 || '').toLowerCase().trim();

          const resolvedImages = [];

          // Helper to resolve an image identifier (URL vs ZIP filename vs SKU matching)
          const resolveImg = (identifier) => {
            if (!identifier) return null;
            if (identifier.startsWith('http://') || identifier.startsWith('https://') || identifier.startsWith('data:')) {
              return identifier;
            }
            if (imageMap[identifier]) return imageMap[identifier];
            const clean = identifier.replace(/[^a-z0-9]/g, '');
            if (imageMap[clean]) return imageMap[clean];
            return null;
          };

          const p1 = resolveImg(imgCol1) || resolveImg(sku.toLowerCase()) || resolveImg(`${sku.toLowerCase()}_1`);
          const p2 = resolveImg(imgCol2) || resolveImg(`${sku.toLowerCase()}_2`);
          const p3 = resolveImg(imgCol3) || resolveImg(`${sku.toLowerCase()}_3`);

          if (p1) resolvedImages.push(p1);
          if (p2) resolvedImages.push(p2);
          if (p3) resolvedImages.push(p3);

          if (resolvedImages.length === 0) {
            resolvedImages.push('https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80');
          }

          // Validation Rules
          if (!name.trim()) {
            invalidRows.push({
              row: row._rawRow,
              sku: sku || 'N/A',
              name: 'Empty Product Title',
              error: 'Missing required "Product Name" field'
            });
            return;
          }

          if (isNaN(stock) || stock < 0) {
            invalidRows.push({
              row: row._rawRow,
              sku,
              name,
              error: `Invalid stock value: "${row.stock}". Must be a non-negative number.`
            });
            return;
          }

          validRows.push({
            id: `prod-bulk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: name.trim(),
            brand: brand.trim(),
            category: category.trim(),
            sku: sku.trim(),
            hsn: hsn.trim(),
            stock,
            lowStockThreshold,
            packSize: packSize.trim(),
            bundleSize: bundleSize.trim(),
            caseSize: caseSize.trim(),
            description: description.trim(),
            isFeatured,
            isNew,
            status,
            image: resolvedImages[0],
            images: resolvedImages.slice(0, 3),
            gallery: resolvedImages.slice(0, 3)
          });
        });

        setPreviewData(validRows);
        setFailedData(invalidRows);
        if (validRows.length > 0) {
          showToast(`Parsed ${validRows.length} valid product record(s) from CSV!`, 'success');
        }
        if (invalidRows.length > 0) {
          showToast(`${invalidRows.length} row(s) failed validation. See table below.`, 'warning');
        }
      } catch (err) {
        console.error('CSV Parsing error:', err);
        showToast('Error parsing CSV file. Please check format.', 'error');
      }
    };
    reader.readAsText(csvFile);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.csv')) {
        showToast('Please upload a .csv file', 'error');
        return;
      }
      setFile(droppedFile);
      processCsvFile(droppedFile);
    }
  };

  const handleUploadSubmit = () => {
    if (!previewData.length) {
      showToast('No validated products to import. Please check your CSV.', 'warning');
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
          setImagesZip(null);
          setZipImageMap({});
          setPreviewData([]);
          setFailedData([]);
          setProgress(0);
          showToast(`🎉 Successfully imported ${previewData.length} products to database!`, 'success');
          onClose();
        }, 400);
      }
    }, 150);
  };

  // Download Sample CSV
  const downloadSampleCsv = () => {
    const csvContent = 
`Product Name,Brand,Category,SKU,Unit Pack Size,Inner Bundle Size,Master Case Size,Stock Count,Low Stock Threshold,Image 1,Image 2,Image 3,Description,Featured,New,Status
Amul Taaza Homogenised Toned Milk 1L Tetra Pak,Amul,Food & Beverages,AML-TAZ-1L-12,1 Litre Tetra,6 Packs,12 Units / Case,250,20,amul_taaza_1.jpg,amul_taaza_2.jpg,amul_taaza_3.jpg,High-margin UHT treated toned milk pack with 180-day ambient shelf life.,true,false,Published
Nestlé Koko Krunch Chocolate Whole Grain Cereal 500g,Nestlé,Food & Beverages,NST-KKR-500G-12,500g Box,6 Boxes,12 Boxes / Carton,120,15,koko_krunch_1.jpg,koko_krunch_2.jpg,,Crunchy whole grain chocolate wheat curl cereal loaded with vitamins.,true,true,Published
Coca-Cola Original Taste Carbonated Soft Drink 750ml,Coca-Cola,Food & Beverages,KO-KO-750ML-24,750ml PET,6 Bottles,24 Bottles Shrink Crate,400,30,coca_cola_1.jpg,coca_cola_2.jpg,,Classic refreshing carbonated cola beverage with authentic taste formulation.,false,true,Published
Bisleri Packaged Natural Mountain Water 1L Bottle,Bisleri,Food & Beverages,BSL-WTR-1L-24,1 Litre Bottle,12 Bottles,24 Bottles Crate,800,50,bisleri_1.jpg,,,Pure ozonated packaged drinking water with added essential minerals.,true,false,Published
Dove Cream Beauty Bathing Soap 125g,Hindustan Unilever,Personal Care,HUL-DOV-125G-36,125g Bar,6 Bars,36 Bars Master Pack,180,25,dove_soap_1.jpg,dove_soap_2.jpg,,Moisturizing cream beauty bathing bar with 1/4th moisturizing milk.,true,false,Published`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Anuj_Enterprises_FMCG_Products_Sample_Template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded sample CSV template with FMCG specifications', 'info');
  };

  // Open & Print High-Resolution Visual PDF Guide
  const downloadPdfVisualGuide = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=1000');
    if (!printWindow) {
      showToast('Popup blocker prevented PDF generation. Please allow popups.', 'error');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Anuj Enterprises - FMCG Bulk Import & Image Matching Visual SOP</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 32px;
      line-height: 1.5;
      font-size: 13px;
    }
    
    @media print {
      body { padding: 12px; font-size: 11px; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #f59e0b;
      margin-bottom: 24px;
    }
    .logo-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-badge {
      width: 48px;
      height: 48px;
      background: #0f172a;
      border: 2px solid #f59e0b;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #f59e0b;
      font-size: 20px;
      font-weight: 900;
    }
    .title-area h1 {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      letter-spacing: -0.5px;
    }
    .title-area p {
      font-size: 12px;
      color: #64748b;
      font-weight: 600;
    }
    .sop-tag {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 6px 14px;
      border-radius: 999px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .workflow-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .step-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 14px;
      position: relative;
    }
    .step-num {
      width: 24px;
      height: 24px;
      background: #f59e0b;
      color: #0f172a;
      font-weight: 900;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      margin-bottom: 8px;
    }
    .step-card h3 {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .step-card p {
      font-size: 10.5px;
      color: #64748b;
      line-height: 1.4;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 4px solid #f59e0b;
      padding-left: 10px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 11.5px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }
    th {
      background: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 10px 12px;
      font-weight: 800;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    td {
      padding: 9px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
    .badge-req {
      background: #fee2e2;
      color: #991b1b;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 800;
      font-size: 10px;
    }
    .badge-opt {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 10px;
    }
    
    .visual-diagram {
      background: #f8fafc;
      border: 1.5px dashed #cbd5e1;
      border-radius: 16px;
      padding: 18px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: 16px;
    }
    .diagram-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.04);
      text-align: center;
      flex: 1;
    }
    .diagram-box h4 {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .diagram-box code {
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      color: #d97706;
      font-weight: 700;
    }
    .diagram-arrow {
      font-size: 18px;
      color: #f59e0b;
      font-weight: 900;
    }
    
    .footer-note {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    
    .print-btn-bar {
      margin-bottom: 20px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
    .btn-print {
      background: #0f172a;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-print:hover {
      background: #f59e0b;
      color: #0f172a;
    }
  </style>
</head>
<body>
  <div class="print-btn-bar no-print">
    <button class="btn-print" onclick="window.print()">🖨️ Print or Save as PDF</button>
  </div>

  <div class="header">
    <div class="logo-title">
      <div class="logo-badge">AE</div>
      <div class="title-area">
        <h1>ANUJ ENTERPRISES</h1>
        <p>B2B FMCG Distribution & Catalog Management SOP</p>
      </div>
    </div>
    <div class="sop-tag">Official Visual Guide</div>
  </div>

  <!-- Visual 4-Step Workflow -->
  <div class="workflow-grid">
    <div class="step-card">
      <div class="step-num">1</div>
      <h3>Prepare CSV Data</h3>
      <p>Fill product titles, packaging hierarchy, stock count in Excel/Sheets & save as .CSV</p>
    </div>
    <div class="step-card">
      <div class="step-num">2</div>
      <h3>Name Product Photos</h3>
      <p>Rename photos to match CSV (e.g. <code>amul_1.jpg</code>) or SKU (up to 3 photos/product, &lt;2MB).</p>
    </div>
    <div class="step-card">
      <div class="step-num">3</div>
      <h3>Create .ZIP Archive</h3>
      <p>Select all images, right-click and compress into a single <code>product_images.zip</code> file.</p>
    </div>
    <div class="step-card">
      <div class="step-num">4</div>
      <h3>1-Click Import</h3>
      <p>Upload ZIP then CSV in Admin Dashboard. Products & photos publish immediately!</p>
    </div>
  </div>

  <!-- Section 1: CSV Columns -->
  <h2 class="section-title">1. CSV Column Structure & Formatting Rules</h2>
  <table>
    <thead>
      <tr>
        <th>Column Header</th>
        <th>Status</th>
        <th>Example Value</th>
        <th>Description & Rules</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="font-mono"><strong>Product Name</strong></td>
        <td><span class="badge-req">REQUIRED</span></td>
        <td>Amul Taaza Milk 1L Tetra</td>
        <td>Full descriptive title of the FMCG SKU</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Brand</strong></td>
        <td><span class="badge-req">REQUIRED</span></td>
        <td>Amul / Nestlé / Coca-Cola</td>
        <td>Manufacturer or Brand entity</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Category</strong></td>
        <td><span class="badge-req">REQUIRED</span></td>
        <td>Food & Beverages</td>
        <td>Distribution category name</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>SKU</strong></td>
        <td><span class="badge-opt">OPTIONAL</span></td>
        <td>AML-TAZ-1L-12</td>
        <td>Unique warehouse SKU (auto-generated if empty)</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Unit Pack Size</strong></td>
        <td><span class="badge-opt">OPTIONAL</span></td>
        <td>1 Litre Tetra / 500g Box</td>
        <td>Primary consumer unit size</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Inner Bundle Size</strong></td>
        <td><span class="badge-opt">OPTIONAL</span></td>
        <td>6 Packs / 12 Units</td>
        <td>Secondary wholesale bundle packaging</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Master Case Size</strong></td>
        <td><span class="badge-opt">OPTIONAL</span></td>
        <td>12 Units / Master Case</td>
        <td>Outer master carton packaging</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Stock Count</strong></td>
        <td><span class="badge-req">REQUIRED</span></td>
        <td>250</td>
        <td>Initial available inventory quantity in warehouse</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Low Stock Threshold</strong></td>
        <td><span class="badge-opt">OPTIONAL</span></td>
        <td>20</td>
        <td>Alert trigger when stock count drops (default: 20)</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Image 1, Image 2, Image 3</strong></td>
        <td><span class="badge-opt">OPTIONAL</span></td>
        <td>amul_1.jpg, amul_2.jpg</td>
        <td>Filenames inside ZIP archive or direct CDN URLs</td>
      </tr>
      <tr>
        <td class="font-mono"><strong>Status</strong></td>
        <td><span class="badge-opt">OPTIONAL</span></td>
        <td>Published</td>
        <td>'Published' (live on catalog) or 'Draft'</td>
      </tr>
    </tbody>
  </table>

  <!-- Section 2: Visual Image Matching Diagram -->
  <h2 class="section-title">2. Visual Image Naming & Matching Diagram</h2>
  <div class="visual-diagram">
    <div class="diagram-box">
      <h4>CSV Row Entry</h4>
      <code>Image 1: amul_milk_1.jpg</code><br>
      <code>Image 2: amul_milk_2.jpg</code>
    </div>
    <div class="diagram-arrow">➔</div>
    <div class="diagram-box">
      <h4>ZIP Archive Contents</h4>
      <code>📁 product_images.zip</code><br>
      <code>↳ amul_milk_1.jpg</code> (Cover)<br>
      <code>↳ amul_milk_2.jpg</code> (Side)
    </div>
    <div class="diagram-arrow">➔</div>
    <div class="diagram-box">
      <h4>Published Product</h4>
      <strong>★ Cover Photo Linked</strong><br>
      <span style="color:#10b981; font-weight:bold; font-size:10.5px;">✓ Cloudinary Optimized</span>
    </div>
  </div>

  <!-- Section 3: Creating the ZIP Archive -->
  <h2 class="section-title">3. How to Create the .ZIP Image Archive</h2>
  <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px;">
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
      <h3 style="font-size:12px; font-weight:800; margin-bottom:6px; color:#0f172a;">🪟 Windows OS Steps</h3>
      <ol style="padding-left:18px; font-size:11px; color:#475569; line-height:1.6;">
        <li>Put all product photos inside a folder.</li>
        <li>Select all images (<strong>Ctrl + A</strong>).</li>
        <li>Right-click ➔ Choose <strong>"Compress to ZIP file"</strong>.</li>
        <li>Name it <code>product_images.zip</code>.</li>
      </ol>
    </div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px;">
      <h3 style="font-size:12px; font-weight:800; margin-bottom:6px; color:#0f172a;">🍏 Mac OS Steps</h3>
      <ol style="padding-left:18px; font-size:11px; color:#475569; line-height:1.6;">
        <li>Select all product images inside your folder.</li>
        <li>Right-click ➔ Choose <strong>"Compress Items"</strong>.</li>
        <li>Name the file <code>product_images.zip</code>.</li>
      </ol>
    </div>
  </div>

  <!-- Best Practices -->
  <div style="background:#fffbeb; border:1px solid #fef3c7; border-radius:12px; padding:14px;">
    <h3 style="font-size:12px; font-weight:800; color:#92400e; margin-bottom:4px;">💡 Important Quality & Speed Directives</h3>
    <ul style="padding-left:18px; font-size:11px; color:#78350f; line-height:1.6;">
      <li><strong>Max 2MB per photo:</strong> Please resize or compress photos to under 2MB for instant page rendering.</li>
      <li><strong>Up to 3 Photos:</strong> Slot 1 (Cover), Slot 2 (Angle/Pack view), Slot 3 (Nutrition/Barcode).</li>
      <li><strong>Supported Formats:</strong> PNG, JPG, JPEG, and WEBP.</li>
    </ul>
  </div>

  <div class="footer-note">
    <span>Author: ANUJ (Managing Director)</span>
    <span>Contact: anujenterprises.fmcg.006@gmail.com</span>
    <span>Anuj Enterprises © 2026</span>
  </div>

  <script>
    window.onload = function() {
      // Auto-trigger print dialog after render
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    showToast('Generated printable Visual PDF Guide window!', 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex justify-between items-center border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                  <span>Bulk Product Inventory CSV Import</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    B2B FMCG Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Automated CSV parsing, packaging hierarchy mapping & ZIP image linking
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-950 text-xs shrink-0">
            <button
              onClick={() => setActiveSubTab('import')}
              className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'import'
                  ? 'border-amber-500 text-slate-900 dark:text-white font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-amber-500" />
              <span>Import CSV & ZIP</span>
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`py-3 px-4 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeSubTab === 'history'
                  ? 'border-amber-500 text-slate-900 dark:text-white font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4 text-emerald-500" />
              <span>Import History</span>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-grow">
            
            {/* ================= SUBTAB 1: IMPORT CSV & ZIP ================= */}
            {activeSubTab === 'import' && (
              <>
                {/* Action Bar: Download Sample CSV & Download Visual Guide PDF */}
                <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900/5 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Info className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Need templates or visual instructions for CSV & images?
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadSampleCsv}
                      className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 font-extrabold text-xs rounded-xl border border-amber-300 dark:border-amber-700/50 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Sample CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadPdfVisualGuide}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>Download Guide (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* 1. Upload Product Images Zip Section */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Archive className="w-4 h-4 text-blue-500" />
                      <span>Step 1: Product Images (.ZIP Archive) — Optional</span>
                    </label>
                    {imagesZip && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>ZIP Loaded ({Object.keys(zipImageMap).length / 2} photos)</span>
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-500 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm flex items-center justify-center gap-2 transition-all">
                      <input
                        type="file"
                        accept=".zip"
                        onChange={handleZipFileChange}
                        disabled={isParsingZip}
                        className="hidden"
                      />
                      {isParsingZip ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span>Unpacking Image Archive...</span>
                        </>
                      ) : (
                        <>
                          <Archive className="w-4 h-4 text-blue-500" />
                          <span>{imagesZip ? imagesZip.name : "Select Image ZIP File"}</span>
                        </>
                      )}
                    </label>
                    <span className="text-[11px] text-slate-500">
                      Zip your product photos (<code>amul_1.jpg</code>, <code>sku_2.png</code>). System will auto-link them to CSV rows!
                    </span>
                  </div>
                </div>

                {/* 2. Drag & Drop Zone for CSV */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                    <span>Step 2: Upload FMCG Inventory .CSV File *</span>
                  </label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-amber-500/40 hover:border-amber-500 dark:border-amber-500/30 dark:hover:border-amber-500 rounded-3xl p-6 text-center bg-slate-50 dark:bg-slate-950/60 hover:bg-amber-50/40 dark:hover:bg-amber-950/10 transition-all relative cursor-pointer group"
                  >
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileDrop}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mb-1">
                      {file ? file.name : "Drag & Drop your Inventory .CSV File here or Click to Browse"}
                    </h4>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      Supports standard CSV formatted with: <strong>Product Name, Brand, Category, SKU, Pack Size, Bundle Size, Case Size, Stock Count</strong>
                    </p>
                  </div>
                </div>

                {/* Upload Progress Bar */}
                {isUploading && (
                  <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-500/30">
                    <div className="flex justify-between text-xs font-extrabold">
                      <span className="text-slate-800 dark:text-slate-200 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        <span>Validating & Publishing {previewData.length} Product Records to Catalog...</span>
                      </span>
                      <span className="text-amber-500 font-mono">{progress}%</span>
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
                    {/* Validated Products Table */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Validated Products Ready for Import ({previewData.length})</span>
                        </span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Ready to commit into MongoDB Database
                        </span>
                      </div>
                      <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-inner">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold sticky top-0">
                            <tr>
                              <th className="p-2.5">Photo</th>
                              <th className="p-2.5">Product Title</th>
                              <th className="p-2.5">Brand</th>
                              <th className="p-2.5">SKU</th>
                              <th className="p-2.5">Packaging</th>
                              <th className="p-2.5 text-center">Stock</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                            {previewData.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="p-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border p-0.5 overflow-hidden flex items-center justify-center">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80';
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="p-2.5 font-bold text-slate-900 dark:text-white">{item.name}</td>
                                <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">{item.brand}</td>
                                <td className="p-2.5 font-mono font-bold text-slate-500">{item.sku}</td>
                                <td className="p-2.5 text-slate-500 font-mono text-[10px]">{item.packSize} • {item.caseSize}</td>
                                <td className="p-2.5 text-center font-extrabold text-emerald-600 font-mono">{item.stock}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Failed Validation Errors List */}
                    {failedData.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" />
                          <span>Validation Warnings ({failedData.length} Skipped Rows)</span>
                        </span>
                        <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-900 text-xs space-y-1.5 text-red-800 dark:text-red-300 max-h-32 overflow-y-auto">
                          {failedData.map((err, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2">
                              <span>Row {err.row}: <strong>{err.sku}</strong> — {err.error}</span>
                              <span className="text-[10px] font-bold uppercase bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 px-2 py-0.5 rounded shrink-0">
                                Skipped
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit / Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={isUploading || !file || previewData.length === 0}
                    className="flex-1 py-3 bg-brand-900 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Publishing to Catalog...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Confirm & Import {previewData.length > 0 ? `(${previewData.length}) Products` : ''}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ================= SUBTAB 2: IMPORT HISTORY ================= */}
            {activeSubTab === 'history' && (
              <div className="space-y-4 text-xs">
                <h4 className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Bulk Import Operations
                </h4>
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-extrabold">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Batch File Name</th>
                        <th className="p-3 text-center">Imported</th>
                        <th className="p-3 text-center">Failed</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                      {mockImportHistory.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="p-3 text-slate-500 font-mono">{log.date}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{log.fileName}</td>
                          <td className="p-3 text-center font-extrabold text-emerald-600 font-mono">{log.success}</td>
                          <td className="p-3 text-center font-extrabold text-red-600 font-mono">{log.failed}</td>
                          <td className="p-3 text-right font-extrabold text-emerald-600">{log.status}</td>
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
