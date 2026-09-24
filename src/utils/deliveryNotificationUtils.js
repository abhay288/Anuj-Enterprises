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
 * Generate formatted WhatsApp Delivery Alert text (Concise & Emoji-Rich)
 * @param {Object} order - Order details
 * @param {Object} custom - Optional courier/delivery overrides
 * @returns {string} Raw message text with WhatsApp formatting (*bold*, _italic_)
 */
export const generateDeliveryWhatsAppMessage = (order, custom = {}) => {
  const invoiceNumber = order.invoiceNumber || order.id || 'AE-2026-000001';
  const customerName = order.customerName || 'Valued Retailer';
  
  const totalUnits = order.totalQuantity || order.items?.reduce((a, b) => a + (b.qty || b.quantity || 0), 0) || 0;
  const totalSkus = order.items?.length || 0;
  
  const city = order.customerCity || order.shippingAddress?.city || 'Kanpur';
  const driverName = custom.driverName || order.salesmanName || 'Logistics Fleet';
  const driverPhone = custom.driverPhone || '+91 88876 83782';
  const estimatedTime = custom.estimatedTime || 'Today (In-Transit)';
  const customNote = custom.customNote ? `\n📝 *Note:* ${custom.customNote}` : '';

  // Extract all ordered product names and quantities
  const itemsList = Array.isArray(order.items) ? order.items : [];
  let productsSection = '';
  if (itemsList.length > 0) {
    const productLines = itemsList.map((item, idx) => {
      const pName = item.productName || item.name || item.product?.name || `Product #${idx + 1}`;
      const qty = item.qty || item.quantity;
      return qty ? `• ${pName} (${qty} Units)` : `• ${pName}`;
    }).join('\n');
    productsSection = `\n📦 *Products Ordered:*\n${productLines}\n`;
  }

  return `🚚 *ANUJ ENTERPRISES — OUT FOR DELIVERY!* 📦

Namaste *${customerName}*, your FMCG wholesale order has been dispatched from our Kanpur Central Hub and is on the way! 🚀

📄 *Invoice #:* ${invoiceNumber}
📦 *Total Volume:* ${totalUnits} Units (${totalSkus} SKUs)
📍 *Delivery Destination:* ${city}
⏰ *Est. Arrival:* ${estimatedTime}
👨‍💼 *Delivery Rep:* ${driverName} (📞 ${driverPhone})${customNote}
${productsSection}
📞 *Helpline:* +91 88876 83782 / +91 70719 79894
🏢 *Anuj Enterprises — FMCG Wholesale Partner*`;
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
