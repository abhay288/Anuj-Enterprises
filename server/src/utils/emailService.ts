import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
}

interface OrderEmailData {
  orderId: string;
  invoiceNumber: string;
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
    price?: number;
    unitPrice?: number;
    packSize?: string;
    isPriority?: boolean;
  }>;
  date?: string;
  paymentMethod?: string;
}

// 1. Create Nodemailer Transporter configured for Normal Email (Gmail SMTP / Custom SMTP)
export const createEmailTransporter = () => {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'anujenterprises.fmcg.006@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Verify SMTP Connection with credentials
 */
export const verifyEmailConnection = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    return { success: true };
  } catch (error: any) {
    console.error('Nodemailer SMTP verification error:', error.message);
    return { success: false, error: error.message };
  }
};

const FROM_EMAIL = process.env.EMAIL_FROM || '"Anuj Enterprises FMCG" <anujenterprises.fmcg.006@gmail.com>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'anujenterprises.fmcg.006@gmail.com';

/**
 * 2. Send Automated Order Confirmation & Tax Invoice Email
 */
export const sendOrderInvoiceEmail = async (
  orderData: OrderEmailData,
  recipientEmail?: string,
  pdfAttachment?: EmailAttachment
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const transporter = createEmailTransporter();
    const targetEmail = recipientEmail || ADMIN_EMAIL;
    const isToAdmin = targetEmail === ADMIN_EMAIL;

    const itemsRowsHtml = (orderData.items || []).map((item, idx) => {
      const pName = item.productName || item.name || 'FMCG Product';
      const qty = item.quantity || item.qty || 1;
      const pack = item.packSize ? `<span style="font-size: 11px; color: #64748b;">(Pack: ${item.packSize})</span>` : '';
      const priorityBadge = item.isPriority 
        ? `<span style="background: #f59e0b; color: #020617; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">URGENT</span>` 
        : '';

      return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; font-weight: 600;">
            ${pName} ${pack} ${priorityBadge}
          </td>
          <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; text-align: center; font-weight: 700;">
            ${qty} Units
          </td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
          .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); color: #ffffff; padding: 30px 25px; text-align: center; }
          .badge { display: inline-block; background: #f59e0b; color: #020617; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 10px; }
          .title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; letter-spacing: -0.5px; }
          .subtitle { font-size: 13px; color: #94a3b8; margin: 0; }
          .content { padding: 24px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .th { background: #0f172a; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 10px 14px; text-align: left; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">Official B2B Order Invoice</span>
            <h1 class="title">Anuj Enterprises FMCG</h1>
            <p class="subtitle">Wholesale FMCG & Confectionery Distribution, Kanpur</p>
          </div>

          <div class="content">
            <p style="font-size: 14px; color: #334155; margin-top: 0;">
              Hello <strong>${orderData.customerName || 'Valued Retailer'}</strong>,
            </p>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">
              ${isToAdmin ? 'A new B2B wholesale order has been booked on the portal.' : 'Your wholesale order has been successfully confirmed and booked with our central distribution hub.'}
            </p>

            <div class="info-box">
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; width: 40%;">Invoice / Order #:</td>
                  <td style="padding: 4px 0; font-weight: 800; color: #0f172a; font-family: monospace;">${orderData.invoiceNumber || orderData.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Retail Store:</td>
                  <td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${orderData.customerName}</td>
                </tr>
                ${orderData.shopOwnerName ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Shop Owner:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #334155;">${orderData.shopOwnerName}</td>
                </tr>` : ''}
                ${orderData.customerMobile ? `
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Contact Mobile:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #334155;">${orderData.customerMobile}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Location:</td>
                  <td style="padding: 4px 0; font-weight: 600; color: #334155;">${orderData.customerCity || 'Kanpur'}, ${orderData.customerState || 'Uttar Pradesh'}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b;">Total Units:</td>
                  <td style="padding: 4px 0; font-weight: 900; color: #d97706;">${orderData.totalQuantity} Units / Cases</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Order Items Breakdown</h3>
            <table class="table">
              <thead>
                <tr>
                  <th class="th">Product Details</th>
                  <th class="th" style="text-align: center;">Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <div style="margin-top: 25px; padding: 14px; background: #fef3c7; border: 1px solid #fde68a; border-radius: 10px; font-size: 12px; color: #92400e;">
              <strong>🚚 Delivery Status:</strong> Your order docket is scheduled for dispatch. For expedited delivery or amendments, please reach out directly via WhatsApp or phone.
            </div>
          </div>

          <div class="footer">
            <strong>Anuj Enterprises</strong> — Authorized FMCG & Confectionery Distributors<br>
            📍 Kanpur Central Mandi, Uttar Pradesh | 📞 +91 88876 83782 / +91 70719 79894<br>
            📧 anujenterprises.fmcg.006@gmail.com
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: FROM_EMAIL,
      to: targetEmail,
      subject: `📦 Order Confirmation & Tax Invoice #${orderData.invoiceNumber || orderData.orderId} - Anuj Enterprises`,
      html: htmlContent,
      attachments: pdfAttachment ? [pdfAttachment] : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Order invoice email sent successfully to ${targetEmail} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[EmailService] Failed to send order invoice email:', err?.message || err);
    return { success: false, error: err?.message || 'Failed to send email' };
  }
};

/**
 * 3. Send Retailer Registration & Welcome Email
 */
export const sendWelcomeEmail = async (customerData: {
  name: string;
  ownerName?: string;
  email: string;
  mobile?: string;
  customerId?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    const transporter = createEmailTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
          .title { font-size: 24px; font-weight: 900; margin: 0 0 6px 0; }
          .content { padding: 24px; font-size: 13px; color: #334155; line-height: 1.6; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin: 16px 0; }
          .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">Welcome to Anuj Enterprises</h1>
            <p style="color: #f59e0b; margin: 0; font-weight: 700;">Authorized FMCG Wholesale B2B Portal</p>
          </div>
          <div class="content">
            <p>Dear <strong>${customerData.ownerName || customerData.name}</strong>,</p>
            <p>Your B2B retail account for <strong>"${customerData.name}"</strong> has been successfully registered with Anuj Enterprises.</p>
            
            <div class="box">
              <p style="margin: 4px 0;"><strong>Customer Account ID:</strong> <span style="font-family: monospace; font-weight: 800; color: #f59e0b;">${customerData.customerId || 'CUST-REGISTERED'}</span></p>
              <p style="margin: 4px 0;"><strong>Registered Mobile:</strong> ${customerData.mobile || 'N/A'}</p>
              <p style="margin: 4px 0;"><strong>Registered Email:</strong> ${customerData.email}</p>
              <p style="margin: 4px 0;"><strong>Portal Access:</strong> Immediate access to wholesale FMCG pricing, real-time stock levels, and instant tax invoice generation.</p>
            </div>

            <p>You can now log in anytime to manage orders, browse top brands like Britannia, Parle, ITC, Cadbury, and download your monthly billing invoices.</p>
          </div>
          <div class="footer">
            <strong>Anuj Enterprises</strong> • Kanpur, Uttar Pradesh<br>
            📞 +91 88876 83782 / +91 70719 79894 | 📧 anujenterprises.fmcg.006@gmail.com
          </div>
        </div>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: customerData.email,
      subject: `🎉 Welcome to Anuj Enterprises B2B Portal - ${customerData.name}`,
      html: htmlContent
    });

    console.log(`[EmailService] Welcome email sent to ${customerData.email} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[EmailService] Failed to send welcome email:', err?.message || err);
    return { success: false, error: err?.message || 'Failed to send welcome email' };
  }
};

/**
 * 4. Verify Transporter Connection
 */
export const verifyTransporterConnection = async (): Promise<boolean> => {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    console.log('✅ [EmailService] Nodemailer SMTP connection verified successfully.');
    return true;
  } catch (err: any) {
    console.warn('⚠️ [EmailService] Nodemailer SMTP connection warning:', err?.message || err);
    return false;
  }
};
