import { jsPDF } from 'jspdf';
import { companyConfig } from '../config/companyConfig.js';

export interface InvoicePdfData {
  invoiceNumber: string;
  orderId?: string;
  customerName: string;
  shopOwnerName?: string;
  customerMobile?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  totalQuantity: number;
  totalAmount?: number;
  items: Array<{
    name?: string;
    productName?: string;
    quantity?: number;
    qty?: number;
    packSize?: string;
    sku?: string;
    hsn?: string;
    isPriority?: boolean;
  }>;
  date?: string;
  paymentMethod?: string;
}

/**
 * Generate an official B2B Delivery & Dispatch Invoice vector PDF buffer
 * Strictly NO price, rate, or tax displays as requested.
 */
export const generateInvoicePdfBuffer = (data: InvoicePdfData): Buffer => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const invoiceNumber = data.invoiceNumber || 'AE-INV-2026-000001';
  const orderId = data.orderId || data.invoiceNumber || 'ORD-2026-000001';
  const date = data.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // 1. Top Header Banner: Dark Navy
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 42, 'F');

  // Badges
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.roundedRect(14, 8, 42, 5.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DELIVERY INVOICE', 35, 11.8, { align: 'center' });

  doc.setFillColor(30, 41, 59); // Slate 800
  doc.roundedRect(58, 8, 46, 5.5, 1, 1, 'F');
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7);
  doc.text('ORIGINAL FOR RECIPIENT', 81, 11.8, { align: 'center' });

  // Company Brand Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(companyConfig.name.toUpperCase(), 14, 21);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(251, 191, 36); // Amber 400
  doc.text(companyConfig.tagline.toUpperCase(), 14, 26.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.setFontSize(7.5);
  doc.text(companyConfig.address, 14, 32);
  doc.text(`Helpline: ${companyConfig.phone} / ${companyConfig.mobile} | Email: ${companyConfig.email}`, 14, 36.5);

  // Right Top Box: Invoice Number & Date
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('B2B DELIVERY INVOICE', 196, 12, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(`Invoice No: ${invoiceNumber}`, 196, 19, { align: 'right' });
  doc.text(`Invoice Date: ${date}`, 196, 24, { align: 'right' });
  doc.text(`Order Ref: ${orderId}`, 196, 29, { align: 'right' });
  doc.text(`Dispatch Hub: Kanpur Central Depot`, 196, 34, { align: 'right' });

  // 2. Billed To (Buyer) & Consignee Details Box
  const startY = 46;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, startY, 182, 34, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, startY, 182, 34, 'S');

  // Left Column: Buyer Details
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DETAILS OF RECEIVER / BILLED TO (BUYER):', 18, startY + 5.5);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(String(data.customerName || 'Valued Retail Partner'), 18, startY + 11.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  if (data.shopOwnerName) {
    doc.text(`Proprietor / Contact: ${data.shopOwnerName}`, 18, startY + 16.5);
  }
  if (data.customerMobile) {
    doc.text(`Mobile: ${data.customerMobile}`, 18, startY + 21.5);
  }
  const addr = data.customerAddress || 'Local Market';
  doc.text(`Address: ${addr.substring(0, 48)}`, 18, startY + 26.5);
  doc.text(`Location: ${data.customerCity || 'Kanpur'}, ${data.customerState || 'Uttar Pradesh'}`, 18, startY + 31);

  // Right Column: Dispatch & Payment Terms
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('DISPATCH & DELIVERY TERMS:', 115, startY + 5.5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`Destination: ${data.customerCity || 'Kanpur'}, ${data.customerState || 'Uttar Pradesh'}`, 115, startY + 12);
  doc.text('Delivery Mode: Direct Store Delivery (Doorstep)', 115, startY + 17.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // Emerald 600
  doc.text(`Payment Mode: ${(data.paymentMethod || 'Due on Delivery (Offline)').toUpperCase()}`, 115, startY + 23);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('Inspection: Verified on Delivery Handover', 115, startY + 28.5);

  // 3. Itemized Goods Table Header
  const tableY = startY + 38;
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(14, tableY, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);

  // Wide product specification columns without price or tax
  doc.text('#', 17, tableY + 5.5);
  doc.text('DESCRIPTION OF GOODS / SKU', 25, tableY + 5.5);
  doc.text('CODE / SKU', 105, tableY + 5.5);
  doc.text('PACKAGING SPECIFICATION', 135, tableY + 5.5);
  doc.text('DISPATCH QTY', 193, tableY + 5.5, { align: 'right' });

  // 4. Items Rows
  let rowY = tableY + 8;
  const items = data.items || [];
  let totalUnits = 0;

  items.slice(0, 18).forEach((item, index) => {
    const q = parseInt(String(item.qty || item.quantity || 1), 10);
    totalUnits += q;

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, rowY, 182, 7.5, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);

    doc.text(String(index + 1), 17, rowY + 5);
    const pName = String(item.name || item.productName || 'FMCG Wholesale SKU');
    doc.text(pName.substring(0, 46), 25, rowY + 5);

    const skuCode = String(item.sku || item.hsn || `SKU-${1000 + index}`);
    doc.text(skuCode.substring(0, 16), 105, rowY + 5);

    const pack = String(item.packSize || 'Standard Box');
    doc.text(pack.substring(0, 26), 135, rowY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(`${q} Units`, 193, rowY + 5, { align: 'right' });

    rowY += 7.5;
  });

  const finalTotalUnits = data.totalQuantity || totalUnits;

  // 5. Table Separator Line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, rowY + 1, 196, rowY + 1);

  // 6. Summary & Quantity Totals Box (No Price, No Tax)
  const summaryBoxY = rowY + 3;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, summaryBoxY, 182, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, summaryBoxY, 182, 22, 'S');

  // Left Details
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DISPATCH QUANTITY SUMMARY:', 18, summaryBoxY + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Product Line Items: ${items.length} SKU(s)`, 18, summaryBoxY + 12);
  doc.text('Dispatch Verification: Passed Quality & Case Seal Check', 18, summaryBoxY + 17);

  // Right Quantity Box
  doc.setFillColor(15, 23, 42);
  doc.rect(115, summaryBoxY + 3.5, 76, 15, 'F');

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('TOTAL DISPATCH VOLUME:', 119, summaryBoxY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(251, 191, 36); // Amber 400
  doc.text(`${finalTotalUnits} UNITS`, 187, summaryBoxY + 14.5, { align: 'right' });

  // 7. Terms & Signatory Section
  const footerY = summaryBoxY + 26;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, footerY, 196, footerY);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TERMS & DELIVERY CONDITIONS:', 14, footerY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('1. Goods once inspected and received upon delivery handover are covered under manufacturer guarantee.', 14, footerY + 10.5);
  doc.text('2. This delivery invoice serves as physical dispatch verification. B2B account settlement as per agreement.', 14, footerY + 15);
  doc.text('3. All disputes are subject to exclusive Kanpur, Uttar Pradesh jurisdiction.', 14, footerY + 19.5);

  // Signatory & Seal Right Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${companyConfig.name.toUpperCase()}`, 196, footerY + 5.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory / Warehouse Dispatcher', 196, footerY + 19.5, { align: 'right' });

  return Buffer.from(doc.output('arraybuffer'));
};
