import { jsPDF } from 'jspdf';

/**
 * Generate a professional, vector PDF invoice for Anuj Enterprises
 * @param {Object} order - Order object containing details
 * @returns {Object} { pdfBlob, pdfFile, filename }
 */
export const generateInvoicePDF = (order) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const invoiceNumber = order.invoiceNumber || order.id || 'AE-2026-000001';
  const orderId = order.orderId || order.id || 'ORD-2026-000001';
  const date = order.date || new Date().toISOString().split('T')[0];
  const filename = `Sales_Invoice_${invoiceNumber}.pdf`;

  // Colors
  const primaryColor = [15, 23, 42]; // Slate 900
  const amberColor = [217, 119, 6]; // Amber 600
  const emeraldColor = [5, 150, 105]; // Emerald 600

  // Header Background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');

  // Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('ANUJ ENTERPRISES', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11); // Amber
  doc.text('YOUR TRUSTED FMCG SUPPLY PARTNER', 14, 25);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFontSize(8);
  doc.text('Kanpur HQ, Uttar Pradesh | Helpline: +91 88876 83782 / +91 70719 79894', 14, 32);

  // Invoice Meta Right Box
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('TAX INVOICE', 196, 16, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoiceNumber}`, 196, 23, { align: 'right' });
  doc.text(`Order Ref: ${orderId}`, 196, 29, { align: 'right' });
  doc.text(`Date: ${date}`, 196, 34, { align: 'right' });

  // Customer & Salesman Box
  let startY = 48;

  // Box background
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(14, startY, 182, 38, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, startY, 182, 38, 'S');

  // Customer Info Left
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('B2B CUSTOMER DETAILS', 18, startY + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(String(order.customerName || 'Valued Retailer'), 18, startY + 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Contact: ${order.customerMobile || '+91 98200 11223'}`, 18, startY + 19);
  doc.text(`Address: ${order.customerAddress || 'Kanpur B2B Hub'}`, 18, startY + 25);
  doc.text(`Location: ${order.customerCity || 'Kanpur'}, ${order.customerState || 'Uttar Pradesh'}`, 18, startY + 31);

  // Salesman Info Right
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SALESMAN & ROUTE DETAILS', 115, startY + 6);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`${order.salesmanName || 'Rajesh Kumar'} (ID: ${order.salesmanId || 'AE-SM-001'})`, 115, startY + 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Area: ${order.salesmanArea || 'South Kanpur Central'}`, 115, startY + 19);
  doc.text(`Route: ${order.salesmanRoute || 'Route #4 — Wholesale Mandi'}`, 115, startY + 25);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`Payment Method: ${(order.paymentMethod || order.paymentMode || 'Cash').toUpperCase()}`, 115, startY + 31);

  // Items Table
  let tableY = startY + 46;

  // Table Header
  doc.setFillColor(15, 23, 42);
  doc.rect(14, tableY, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('#', 18, tableY + 5.5);
  doc.text('PRODUCT DESCRIPTION', 28, tableY + 5.5);
  doc.text('PACK SPECIFICATION', 115, tableY + 5.5);
  doc.text('QUANTITY', 170, tableY + 5.5, { align: 'right' });

  let rowY = tableY + 8;
  const items = order.items || [];
  let totalQty = 0;

  items.forEach((item, index) => {
    const q = parseInt(item.qty || item.quantity || 1, 10);
    totalQty += q;

    // Alternate row shading
    if (index % 2 === 1) {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, rowY, 182, 8, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);

    doc.text(String(index + 1), 18, rowY + 5.5);
    doc.text(String(item.name || item.product || 'FMCG Product SKU').substring(0, 48), 28, rowY + 5.5);
    doc.text(String(item.packSize || '1 Pack'), 115, rowY + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${q} Units`, 170, rowY + 5.5, { align: 'right' });

    rowY += 8;
  });

  // Table Border & Summary Row
  doc.setDrawColor(203, 213, 225);
  doc.line(14, rowY + 2, 196, rowY + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL BOOKED VOLUME:', 115, rowY + 9);
  doc.setFontSize(10.5);
  doc.setTextColor(5, 150, 105);
  doc.text(`${totalQty || order.totalQuantity || 0} Units`, 196, rowY + 9, { align: 'right' });

  // Footer / Verification Seal
  let footerY = rowY + 22;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('TERMS & CONDITIONS:', 14, footerY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('1. Goods once sold & verified on delivery handover are covered under manufacturer warranty.', 14, footerY + 11);
  doc.text('2. Computer generated tax invoice — No signature required. Authorized by Anuj Enterprises Central Hub.', 14, footerY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Distribution Seal', 196, footerY + 16, { align: 'right' });

  // Generate Blob and File
  const pdfBlob = doc.output('blob');
  const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

  return { doc, pdfBlob, pdfFile, filename };
};

/**
 * Handle direct PDF sharing via Web Share API or Auto-Download + WhatsApp Web
 * @param {Object} order 
 * @param {Function} showToast 
 */
export const shareInvoicePDFToWhatsApp = async (order, showToast = null) => {
  try {
    const { pdfFile, pdfBlob, filename, doc } = generateInvoicePDF(order);

    const invoiceNumber = order.invoiceNumber || order.id || 'AE-2026-000001';
    const rawText = 
`🏢 *ANUJ ENTERPRISES - B2B PRODUCT INVOICE*
---------------------------------------
📋 *Invoice No:* ${invoiceNumber}
📅 *Date:* ${order.date || new Date().toISOString().split('T')[0]}

👤 *CUSTOMER DETAILS:*
• *Name:* ${order.customerName || 'Valued Retailer'}
• *Location:* ${order.customerCity || 'Kanpur'}, ${order.customerState || 'Uttar Pradesh'}

👨‍💼 *SALESMAN:* ${order.salesmanName || 'Rajesh Kumar'} (${order.salesmanId || 'AE-SM-001'})
• *Area:* ${order.salesmanArea || 'South Kanpur Central'}
• *Route:* ${order.salesmanRoute || 'Route #4 — Wholesale Mandi'}

💳 *PAYMENT METHOD:* ${order.paymentMethod || order.paymentMode || 'Cash'}
🔢 *TOTAL VOLUME:* ${order.totalQuantity || order.items?.reduce((a, b) => a + (b.qty || 0), 0) || 0} Units

📄 *Invoice PDF Document:* "${filename}"
---------------------------------------
⚡ *Anuj Enterprises — Central FMCG Hub*
📞 *Helpline / Orders:* +91 88876 83782 / +91 70719 79894`;

    // 1. Check if device supports Web Share API with files (Mobile Android/iOS WhatsApp)
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        title: `Sales Invoice ${invoiceNumber}`,
        text: rawText,
        files: [pdfFile]
      });
      if (showToast) showToast('Invoice PDF shared to WhatsApp successfully!', 'success');
      return;
    }

    // 2. Fallback for Desktop/Web: Trigger instant download of the PDF file and launch WhatsApp Web
    doc.save(filename);

    const encodedText = encodeURIComponent(rawText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');

    if (showToast) {
      showToast(`PDF "${filename}" downloaded! Attach it in WhatsApp chat.`, 'success');
    }
  } catch (error) {
    console.error('WhatsApp PDF share error:', error);
    // Standard WhatsApp text link as emergency fallback
    const text = encodeURIComponent(`Anuj Enterprises Invoice #${order.invoiceNumber || order.id} for ${order.customerName || 'Retailer'}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }
};
