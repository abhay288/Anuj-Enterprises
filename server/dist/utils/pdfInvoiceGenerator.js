import { jsPDF } from 'jspdf';
/**
 * Generate a professional, real B2B Vector PDF invoice buffer for Anuj Enterprises
 */
export const generateInvoicePdfBuffer = (data) => {
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });
    const invoiceNumber = data.invoiceNumber || 'AE-2026-000001';
    const orderId = data.orderId || data.invoiceNumber || 'ORD-2026-000001';
    const date = data.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    // Brand Header
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 42, 'F');
    // Company Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('ANUJ ENTERPRISES', 14, 16);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11); // Amber 500
    doc.text('AUTHORIZED WHOLESALE FMCG & CONFECTIONERY DISTRIBUTOR', 14, 23);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225); // Slate 300
    doc.setFontSize(8);
    doc.text('Anand Vihar Society, Koyla Nagar, Kanpur, Uttar Pradesh — 208021', 14, 30);
    doc.text('Phone: +91 88876 83782 / +91 70719 79894 | Email: anujenterprises.fmcg.006@gmail.com', 14, 36);
    // Invoice Title Right
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SALES INVOICE', 196, 16, { align: 'right' });
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoiceNumber}`, 196, 23, { align: 'right' });
    doc.text(`Order Ref: ${orderId}`, 196, 29, { align: 'right' });
    doc.text(`Date: ${date}`, 196, 35, { align: 'right' });
    // Bill To & Dispatch Box
    const startY = 48;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, startY, 182, 38, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, startY, 182, 38, 'S');
    // Customer Details (Left)
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('BILLED TO / RETAILER DETAILS', 18, startY + 6);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(String(data.customerName || 'Valued Retail Partner'), 18, startY + 13);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    if (data.customerMobile) {
        doc.text(`Contact: ${data.customerMobile}`, 18, startY + 19);
    }
    if (data.customerAddress) {
        doc.text(`Address: ${data.customerAddress.substring(0, 45)}`, 18, startY + 25);
    }
    doc.text(`Location: ${data.customerCity || 'Kanpur'}, ${data.customerState || 'Uttar Pradesh'}`, 18, startY + 31);
    // Supply & Route Details (Right)
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DISPATCH & PAYMENT TERMS', 115, startY + 6);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Owner: ${data.shopOwnerName || data.customerName || 'Store In-charge'}`, 115, startY + 13);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Place of Supply: Kanpur, UP', 115, startY + 19);
    doc.text('Hub: Kanpur Central Distribution Depot', 115, startY + 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(5, 150, 105); // Emerald 600
    doc.text(`Payment Terms: ${(data.paymentMethod || 'Due on Delivery (Offline)').toUpperCase()}`, 115, startY + 31);
    // Items Table Header
    const tableY = startY + 45;
    doc.setFillColor(15, 23, 42);
    doc.rect(14, tableY, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('#', 18, tableY + 5.5);
    doc.text('PRODUCT DESCRIPTION', 26, tableY + 5.5);
    doc.text('PACK SPECIFICATION', 105, tableY + 5.5);
    doc.text('QTY', 148, tableY + 5.5, { align: 'right' });
    doc.text('RATE', 170, tableY + 5.5, { align: 'right' });
    doc.text('TOTAL', 192, tableY + 5.5, { align: 'right' });
    // Items Rows
    let rowY = tableY + 8;
    const items = data.items || [];
    let calculatedGrandTotal = 0;
    items.slice(0, 15).forEach((item, index) => {
        const q = parseInt(String(item.qty || item.quantity || 1), 10);
        const p = parseFloat(String(item.price || item.unitPrice || 0));
        const lineTotal = p * q;
        calculatedGrandTotal += lineTotal;
        if (index % 2 === 1) {
            doc.setFillColor(241, 245, 249);
            doc.rect(14, rowY, 182, 7.5, 'F');
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(15, 23, 42);
        doc.text(String(index + 1), 18, rowY + 5);
        doc.text(String(item.name || item.productName || 'FMCG Product').substring(0, 42), 26, rowY + 5);
        doc.text(String(item.packSize || 'Piece').substring(0, 24), 105, rowY + 5);
        doc.setFont('helvetica', 'bold');
        doc.text(`${q}`, 148, rowY + 5, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.text(p > 0 ? `₹${p}` : '-', 170, rowY + 5, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(lineTotal > 0 ? `₹${lineTotal.toLocaleString('en-IN')}` : '-', 192, rowY + 5, { align: 'right' });
        rowY += 7.5;
    });
    const finalAmount = data.totalAmount || calculatedGrandTotal;
    // Table Border & Summary
    doc.setDrawColor(203, 213, 225);
    doc.line(14, rowY + 2, 196, rowY + 2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL BOOKED QUANTITY:', 105, rowY + 9);
    doc.setTextColor(5, 150, 105);
    doc.text(`${data.totalQuantity || items.reduce((acc, i) => acc + (i.qty || i.quantity || 1), 0)} Units`, 148, rowY + 9, { align: 'right' });
    doc.setTextColor(15, 23, 42);
    doc.text('GRAND TOTAL:', 160, rowY + 9);
    doc.setFontSize(11);
    doc.setTextColor(217, 119, 6); // Amber 600
    doc.text(`₹${finalAmount.toLocaleString('en-IN')}`, 192, rowY + 9, { align: 'right' });
    // Terms & Authorized Signatory Box
    const footerY = Math.max(rowY + 18, 220);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, footerY, 196, footerY);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('TERMS & CONDITIONS:', 14, footerY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('1. Goods received in good condition & verified on delivery are covered under brand warranty.', 14, footerY + 10);
    doc.text('2. Settlement due on physical delivery handover / approved B2B wholesale credit terms.', 14, footerY + 14);
    doc.text('3. All disputes are subject to exclusive Kanpur, Uttar Pradesh jurisdiction.', 14, footerY + 18);
    // Signatory Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('For ANUJ ENTERPRISES', 196, footerY + 10, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Signatory & Dispatch Officer', 196, footerY + 22, { align: 'right' });
    return Buffer.from(doc.output('arraybuffer'));
};
