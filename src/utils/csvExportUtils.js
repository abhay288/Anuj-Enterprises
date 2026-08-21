import * as XLSX from 'xlsx';

/**
 * Generates and triggers browser download of an authentic formatted Microsoft Excel (.xlsx) file
 */
export const downloadExcel = (filename, rows, headers, sheetName = 'Report') => {
  if (!rows || !rows.length) return;

  const headerKeys = Object.keys(headers);
  const formattedRows = rows.map(item => {
    const rowObj = {};
    headerKeys.forEach(key => {
      const headerLabel = headers[key];
      const val = key.split('.').reduce((obj, i) => (obj ? obj[i] : ''), item);
      rowObj[headerLabel] = val === null || val === undefined ? '' : val;
    });
    return rowObj;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // Auto-calculate column widths
  const colWidths = headerKeys.map(key => {
    const headerLen = String(headers[key]).length;
    const maxValLen = Math.max(
      ...rows.map(item => {
        const val = key.split('.').reduce((obj, i) => (obj ? obj[i] : ''), item);
        return val ? String(val).length : 0;
      }),
      headerLen
    );
    return { wch: Math.min(Math.max(maxValLen + 3, 14), 60) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${filename}_${dateStr}.xlsx`);
};

// Aliased CSV downloader pointing to high-fidelity Excel export
export const downloadCSV = (filename, rows, headers) => {
  downloadExcel(filename, rows, headers, 'Report');
};

export const exportOrdersCSV = (orders) => {
  const headers = {
    invoiceNumber: 'Invoice / Order ID',
    date: 'Booking Date',
    customerName: 'Customer / Business Name',
    customerMobile: 'Contact Mobile Number',
    customerType: 'Customer Classification',
    salesmanName: 'Assigned Sales Executive',
    salesmanId: 'Salesman ID',
    totalQuantity: 'Total Units Quantity',
    grandTotal: 'Grand Total Amount (INR)',
    paymentStatus: 'Payment Status',
    collectionStatus: 'Collection Status',
    status: 'Order Status'
  };
  downloadExcel('Anuj_Enterprises_Orders_Report', orders, headers, 'Orders & Invoices');
};

export const exportProductsCSV = (products) => {
  const headers = {
    sku: 'SKU Code',
    name: 'Product Name / Title',
    brand: 'Manufacturer / Brand',
    category: 'Category',
    stock: 'Current Warehouse Stock (Units)',
    lowStockThreshold: 'Low Stock Alert Level',
    packSize: 'Consumer Unit Pack Size',
    bundleSize: 'Inner Bundle Size',
    caseSize: 'Master Case Packaging Size',
    hsn: 'HSN Tax Code',
    status: 'Catalog Status'
  };
  downloadExcel('Anuj_Enterprises_Product_Catalog', products, headers, 'Product Catalog');
};

export const exportSalesmenCSV = (salesmen) => {
  const headers = {
    id: 'Salesman ID',
    name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    region: 'Territory / Region HQ',
    status: 'Account Status',
    ordersCount: 'Total Orders Booked',
    salesVolume: 'Total Sourced Volume'
  };
  downloadExcel('Anuj_Enterprises_Sales_Force_Roster', salesmen, headers, 'Sales Force Roster');
};

export const exportInventoryReportCSV = (products) => {
  const headers = {
    sku: 'SKU Code',
    name: 'Product Name',
    brand: 'Manufacturer / Brand',
    category: 'Category',
    stock: 'Current Stock Count (Units)',
    lowStockThreshold: 'Low Stock Threshold',
    packSize: 'Unit Pack Specification',
    bundleSize: 'Inner Bundle Size',
    caseSize: 'Master Case Size',
    status: 'Warehouse Status'
  };
  downloadExcel('Anuj_Enterprises_Warehouse_Stock_Report', products, headers, 'Inventory Stock');
};

// Aliases for explicit Excel naming
export const exportOrdersExcel = exportOrdersCSV;
export const exportProductsExcel = exportProductsCSV;
export const exportSalesmenExcel = exportSalesmenCSV;
export const exportInventoryReportExcel = exportInventoryReportCSV;
