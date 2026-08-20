/**
 * Generates and triggers browser download of CSV file
 */
export const downloadCSV = (filename, rows, headers) => {
  if (!rows || !rows.length) return;

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvRows = [];
  // Add Header Row
  csvRows.push(headerLabels.map(label => `"${String(label).replace(/"/g, '""')}"`).join(','));

  // Add Data Rows
  for (const row of rows) {
    const values = headerKeys.map(key => {
      const val = key.split('.').reduce((obj, i) => (obj ? obj[i] : ''), row);
      const strVal = val === null || val === undefined ? '' : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportOrdersCSV = (orders) => {
  const headers = {
    invoiceNumber: 'Invoice / Order ID',
    date: 'Date',
    customerName: 'Customer Name',
    customerMobile: 'Customer Phone',
    customerType: 'Customer Classification',
    salesmanName: 'Salesman Name',
    salesmanId: 'Salesman ID',
    totalQuantity: 'Total Units Quantity',
    grandTotal: 'Grand Total Amount (INR)',
    paymentStatus: 'Payment Status',
    collectionStatus: 'Collection Status',
    status: 'Order Status'
  };
  downloadCSV('Anuj_Enterprises_Orders_Report', orders, headers);
};

export const exportProductsCSV = (products) => {
  const headers = {
    sku: 'SKU Code',
    name: 'Product Name',
    brand: 'Company / Brand',
    category: 'Category',
    price: 'Wholesale Unit Rate (INR)',
    mrp: 'Maximum Retail Price (MRP)',
    stock: 'Stock Count (Units)',
    packSize: 'Pack Specification',
    bundleSize: 'Bundle Specification',
    caseSize: 'Master Case Specification',
    hsn: 'HSN Tax Code',
    status: 'Catalog Status'
  };
  downloadCSV('Anuj_Enterprises_Product_Catalog', products, headers);
};

export const exportSalesmenCSV = (salesmen) => {
  const headers = {
    id: 'Salesman ID',
    name: 'Full Name',
    phone: 'Phone Number',
    email: 'Email Address',
    region: 'Territory / Region',
    status: 'Account Status',
    ordersCount: 'Total Orders Booked',
    salesVolume: 'Total Sourced Volume'
  };
  downloadCSV('Anuj_Enterprises_Sales_Force_Roster', salesmen, headers);
};

export const exportInventoryReportCSV = (products) => {
  const headers = {
    sku: 'SKU Code',
    name: 'Product Name',
    brand: 'Manufacturer / Brand',
    category: 'Category',
    stock: 'Current Stock (Units)',
    status: 'Catalog Status',
    price: 'Wholesale Price (INR)',
    packSize: 'Pack Size'
  };
  downloadCSV('Anuj_Enterprises_Inventory_Report', products, headers);
};
