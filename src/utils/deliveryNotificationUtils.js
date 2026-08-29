/**
 * WhatsApp Delivery Notification Utilities for Anuj Enterprises
 */

/**
 * Clean and format Indian phone number for WhatsApp direct link
 * @param {string} phone 
 * @returns {string} Clean numeric phone with country code (e.g., '919876543210')
 */
export const cleanWhatsAppPhone = (phone) => {
  if (!phone) return '';
  // Remove all non-digits
  let cleaned = String(phone).replace(/\D/g, '');
  
  // If starts with 0, remove 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If 10 digits (Standard Indian Mobile), prepend 91
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  
  return cleaned;
};

/**
 * Generate formatted WhatsApp Delivery Alert text
 * @param {Object} order - Order details
 * @param {Object} custom - Optional courier/delivery overrides
 * @returns {string} Raw message text with WhatsApp formatting (*bold*, _italic_)
 */
export const generateDeliveryWhatsAppMessage = (order, custom = {}) => {
  const invoiceNumber = order.invoiceNumber || order.id || 'AE-2026-000001';
  const customerName = order.customerName || 'Valued Retail Partner';
  const orderDate = order.date || new Date().toISOString().split('T')[0];
  
  const totalUnits = order.totalQuantity || order.items?.reduce((a, b) => a + (b.qty || b.quantity || 0), 0) || 0;
  const totalSkus = order.items?.length || 0;
  
  const address = order.customerAddress || order.shippingAddress?.street || 'Store Premises';
  const city = order.customerCity || order.shippingAddress?.city || 'Kanpur';
  const state = order.customerState || order.shippingAddress?.state || 'Uttar Pradesh';
  
  const repName = custom.repName || order.shopOwnerName || order.salesmanName || 'Anuj Enterprises Field Rep';
  const driverName = custom.driverName || 'Central Logistics Executive';
  const driverPhone = custom.driverPhone || '';
  const vehicleNo = custom.vehicleNo || 'Fleet UP-78 Express';
  const estimatedTime = custom.estimatedTime || 'Today / In-Transit';
  const customNote = custom.customNote || '';
  const paymentMode = order.paymentMethod || order.paymentMode || 'Offline / Cash on Delivery';

  let msg = 
`🚚 *ANUJ ENTERPRISES — ORDER OUT FOR DELIVERY!* 📦
--------------------------------------------------
Dear *${customerName}*,

Great news! Your wholesale FMCG order has been dispatched from our *Kanpur Central Warehouse* and is now *Out for Delivery* to your store! 🚀

📋 *ORDER & INVOICE DETAILS:*
• *Invoice No:* ${invoiceNumber}
• *Booking Date:* ${orderDate}
• *Total Volume:* ${totalUnits} Units (${totalSkus} Product Lines)
• *Delivery Destination:* ${address}, ${city}, ${state}

🚛 *DISPATCH & COURIER DETAILS:*
• *Delivery Executive:* ${driverName}${driverPhone ? ` (📞 ${driverPhone})` : ''}
• *Assigned Route / Sales Rep:* ${repName}
• *Vehicle Reference:* ${vehicleNo}
• *Estimated Arrival:* 🕒 *${estimatedTime}*
• *Delivery Status:* 🟢 *OUT FOR DELIVERY (IN-TRANSIT)*
• *Payment Mode:* ${paymentMode}
`;

  if (customNote) {
    msg += `\n📝 *Special Dispatch Instructions:* ${customNote}\n`;
  }

  msg += 
`--------------------------------------------------
⚡ *Delivery Advisory:* Please keep your store receiving executive available with verification seal.
📞 *Central Logistics Helpline:* +91 88876 83782 / +91 70719 79894
🏢 *Anuj Enterprises — Kanpur Central FMCG Hub*`;

  return msg;
};

/**
 * Dispatch WhatsApp Out for Delivery message directly to customer
 * @param {Object} order 
 * @param {Object} custom 
 * @param {Function} showToast 
 */
export const sendDeliveryWhatsAppNotification = (order, custom = {}, showToast = null) => {
  try {
    const rawText = generateDeliveryWhatsAppMessage(order, custom);
    const targetPhone = custom.customerMobile || order.customerMobile || order.customerPhone || order.phone || '';
    const cleanPhone = cleanWhatsAppPhone(targetPhone);
    const encodedText = encodeURIComponent(rawText);

    let url = '';
    if (cleanPhone && cleanPhone.length >= 10) {
      url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    } else {
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    }

    window.open(url, '_blank');

    if (showToast) {
      showToast(
        cleanPhone 
          ? `Opening WhatsApp to notify ${order.customerName || 'customer'} (${cleanPhone})...` 
          : 'Opening WhatsApp with Delivery Notification message...', 
        'success'
      );
    }
  } catch (error) {
    console.error('Failed to open WhatsApp delivery notification:', error);
    if (showToast) {
      showToast('Could not open WhatsApp. Please check popup permissions.', 'error');
    }
  }
};
