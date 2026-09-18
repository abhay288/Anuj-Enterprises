import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
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
export const verifyEmailConnection = async () => {
    try {
        const transporter = createEmailTransporter();
        await transporter.verify();
        return { success: true };
    }
    catch (error) {
        console.error('Nodemailer SMTP verification error:', error.message);
        return { success: false, error: error.message };
    }
};
const FROM_EMAIL = process.env.EMAIL_FROM || '"Anuj Enterprises FMCG" <anujenterprises.fmcg.006@gmail.com>';
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'anujenterprises.fmcg.006@gmail.com';
/**
 * 2A. Send Customer-Facing Tax Invoice & B2B Order Confirmation Email
 */
export const sendCustomerInvoiceEmail = async (orderData, customerEmail, pdfAttachment) => {
    try {
        const transporter = createEmailTransporter();
        const itemsRowsHtml = (orderData.items || []).map((item, idx) => {
            const pName = item.productName || item.name || 'FMCG Product';
            const qty = item.quantity || item.qty || 1;
            const pack = item.packSize ? `<span style="font-size: 11px; color: #64748b;">(${item.packSize})</span>` : '';
            const unitPrice = item.price || item.unitPrice ? `₹${item.price || item.unitPrice}` : 'N/A';
            const itemTotal = (item.price || item.unitPrice || 0) * qty;
            return `
        <tr style="border-bottom: 1px solid #e2e8f0; ${idx % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; font-weight: 600;">
            ${pName} ${pack}
          </td>
          <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; text-align: center; font-weight: 700;">
            ${qty}
          </td>
          <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; text-align: right; font-weight: 600;">
            ${unitPrice}
          </td>
          <td style="padding: 10px 14px; font-size: 13px; color: #d97706; text-align: right; font-weight: 800;">
            ${itemTotal > 0 ? `₹${itemTotal.toLocaleString('en-IN')}` : '-'}
          </td>
        </tr>
      `;
        }).join('');
        const formattedTotal = orderData.totalAmount ? `₹${orderData.totalAmount.toLocaleString('en-IN')}` : 'N/A';
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
          .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #020617 0%, #1e1b4b 100%); color: #ffffff; padding: 30px 25px; text-align: center; }
          .badge { display: inline-block; background: #f59e0b; color: #020617; font-weight: 800; font-size: 11px; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 10px; }
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
            <span class="badge">Official B2B Order Receipt & Invoice</span>
            <h1 class="title">Anuj Enterprises FMCG</h1>
            <p class="subtitle">Wholesale FMCG & Confectionery Distribution, Kanpur</p>
          </div>

          <div class="content">
            <p style="font-size: 14px; color: #334155; margin-top: 0;">
              Dear <strong>${orderData.customerName || 'Valued Retailer Partner'}</strong>,
            </p>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">
              Thank you for ordering with <strong>Anuj Enterprises</strong>! Your B2B wholesale order has been confirmed and queued at our Kanpur distribution hub.
            </p>

            <div class="info-box">
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #64748b; width: 40%;">Invoice / Order #:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #0f172a; font-family: monospace;">${orderData.invoiceNumber || orderData.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b;">Retail Store Name:</td>
                  <td style="padding: 5px 0; font-weight: 700; color: #0f172a;">${orderData.customerName}</td>
                </tr>
                ${orderData.customerMobile ? `
                <tr>
                  <td style="padding: 5px 0; color: #64748b;">Contact Mobile:</td>
                  <td style="padding: 5px 0; font-weight: 600; color: #334155;">${orderData.customerMobile}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 5px 0; color: #64748b;">Delivery Destination:</td>
                  <td style="padding: 5px 0; font-weight: 600; color: #334155;">${orderData.customerAddress || 'Kanpur Store Address'}, ${orderData.customerCity || 'Kanpur'}, ${orderData.customerState || 'Uttar Pradesh'}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b;">Total Quantity:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #0f172a;">${orderData.totalQuantity} Units / Cases</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #64748b;">Grand Total Amount:</td>
                  <td style="padding: 5px 0; font-weight: 900; color: #d97706; font-size: 15px;">${formattedTotal}</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Itemized Order Summary</h3>
            <table class="table">
              <thead>
                <tr>
                  <th class="th">Product Item</th>
                  <th class="th" style="text-align: center;">Qty</th>
                  <th class="th" style="text-align: right;">Rate</th>
                  <th class="th" style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <div style="margin-top: 25px; padding: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; font-size: 12px; color: #065f46;">
              <strong>🚚 Dispatch & Payment Notice:</strong> Payment settlement is handled upon direct delivery / offline collection. For urgent updates, contact your assigned territory representative or our Kanpur dispatch desk on WhatsApp.
            </div>
          </div>

          <div class="footer">
            <strong>Anuj Enterprises</strong> — Authorized FMCG & Confectionery Distributors<br>
            📍 Anand Vihar Society, Koyla Nagar, Kanpur, Uttar Pradesh — 208021<br>
            📞 +91 88876 83782 / +91 70719 79894 | 📧 anujenterprises.fmcg.006@gmail.com
          </div>
        </div>
      </body>
      </html>
    `;
        const mailOptions = {
            from: FROM_EMAIL,
            to: customerEmail,
            subject: `🧾 Tax Invoice & Order Confirmation #${orderData.invoiceNumber || orderData.orderId} - Anuj Enterprises`,
            html: htmlContent,
            attachments: pdfAttachment ? [pdfAttachment] : []
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Customer invoice email sent to ${customerEmail} (MessageID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    }
    catch (err) {
        console.error(`[EmailService] Failed to send customer invoice email to ${customerEmail}:`, err?.message || err);
        return { success: false, error: err?.message || 'Failed to send customer email' };
    }
};
/**
 * 2B. Send Admin Order Alert & Dispatch Dashboard Email
 */
export const sendAdminOrderAlertEmail = async (orderData, adminEmail, pdfAttachment) => {
    try {
        const transporter = createEmailTransporter();
        const itemsRowsHtml = (orderData.items || []).map((item, idx) => {
            const pName = item.productName || item.name || 'FMCG Product';
            const qty = item.quantity || item.qty || 1;
            const pack = item.packSize ? `<span style="font-size: 11px; color: #94a3b8;">(${item.packSize})</span>` : '';
            const priorityBadge = item.isPriority
                ? `<span style="background: #ef4444; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">URGENT</span>`
                : '';
            return `
        <tr style="border-bottom: 1px solid #334155; ${idx % 2 === 0 ? 'background-color: #0f172a;' : 'background-color: #1e293b;'}">
          <td style="padding: 10px 14px; font-size: 13px; color: #f8fafc; font-weight: 600;">
            ${pName} ${pack} ${priorityBadge}
          </td>
          <td style="padding: 10px 14px; font-size: 13px; color: #f59e0b; text-align: center; font-weight: 800;">
            ${qty} Units
          </td>
        </tr>
      `;
        }).join('');
        const formattedTotal = orderData.totalAmount ? `₹${orderData.totalAmount.toLocaleString('en-IN')}` : 'N/A';
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #020617; margin: 0; padding: 20px; color: #f8fafc; }
          .container { max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 1px solid #1e293b; }
          .header { background: linear-gradient(135deg, #7f1d1d 0%, #1e1b4b 100%); color: #ffffff; padding: 25px; text-align: center; border-b: 2px solid #ef4444; }
          .alert-badge { display: inline-block; background: #ef4444; color: #ffffff; font-weight: 900; font-size: 11px; padding: 4px 14px; border-radius: 20px; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 0.5px; }
          .title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; }
          .content { padding: 24px; }
          .info-box { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .th { background: #020617; color: #f59e0b; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 10px 14px; text-align: left; border-bottom: 2px solid #334155; }
          .footer { background: #020617; padding: 18px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #1e293b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="alert-badge">🚨 NEW B2B ORDER ALERT — DISPATCH REQUIRED</span>
            <h1 class="title">Anuj Enterprises Admin Control</h1>
            <p style="font-size: 13px; color: #fca5a5; margin: 0;">New wholesale order booked on portal</p>
          </div>

          <div class="content">
            <p style="font-size: 14px; color: #f1f5f9; margin-top: 0;">
              <strong>Admin Alert:</strong> A new B2B order <strong>#${orderData.invoiceNumber || orderData.orderId}</strong> has been submitted.
            </p>

            <div class="info-box">
              <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8; width: 40%;">Invoice Number:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #f59e0b; font-family: monospace;">${orderData.invoiceNumber || orderData.orderId}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Retailer Store Name:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #ffffff;">${orderData.customerName}</td>
                </tr>
                ${orderData.shopOwnerName ? `
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Shop Owner:</td>
                  <td style="padding: 5px 0; font-weight: 600; color: #cbd5e1;">${orderData.shopOwnerName}</td>
                </tr>` : ''}
                ${orderData.customerMobile ? `
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Retailer Mobile:</td>
                  <td style="padding: 5px 0; font-weight: 700; color: #38bdf8;">${orderData.customerMobile}</td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Delivery Address:</td>
                  <td style="padding: 5px 0; font-weight: 600; color: #cbd5e1;">${orderData.customerAddress || 'Kanpur'}, ${orderData.customerCity || 'Kanpur'}, ${orderData.customerState || 'Uttar Pradesh'}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Total Items / Units:</td>
                  <td style="padding: 5px 0; font-weight: 800; color: #ffffff;">${orderData.totalQuantity} Units / Cases</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; color: #94a3b8;">Grand Total Amount:</td>
                  <td style="padding: 5px 0; font-weight: 900; color: #f59e0b; font-size: 16px;">${formattedTotal}</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 14px; font-weight: 800; color: #f59e0b; margin-bottom: 8px;">Dispatch Items List</h3>
            <table class="table">
              <thead>
                <tr>
                  <th class="th">SKU & Product Name</th>
                  <th class="th" style="text-align: center;">Required Qty</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRowsHtml}
              </tbody>
            </table>

            <div style="margin-top: 25px; text-align: center;">
              <a href="https://anujfmcg.com" style="display: inline-block; background: #f59e0b; color: #020617; font-weight: 900; font-size: 13px; padding: 12px 24px; border-radius: 10px; text-decoration: none; text-transform: uppercase;">
                Manage Order in Admin Portal &rarr;
              </a>
            </div>
          </div>

          <div class="footer">
            Anuj Enterprises Central Admin System &bull; Kanpur HQ<br>
            Notification Target: ${adminEmail}
          </div>
        </div>
      </body>
      </html>
    `;
        const mailOptions = {
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `🚨 NEW B2B ORDER ALERT: Invoice #${orderData.invoiceNumber || orderData.orderId} | ${orderData.customerName} (${formattedTotal})`,
            html: htmlContent,
            attachments: pdfAttachment ? [pdfAttachment] : []
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Admin order alert email sent to ${adminEmail} (MessageID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    }
    catch (err) {
        console.error(`[EmailService] Failed to send admin order alert email to ${adminEmail}:`, err?.message || err);
        return { success: false, error: err?.message || 'Failed to send admin email' };
    }
};
/**
 * 2C. Master Order Invoice Dispatcher (Triggers both Admin & Customer Emails)
 */
export const sendOrderInvoiceEmail = async (orderData, recipientEmail, pdfAttachment) => {
    try {
        const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.PROD_ADMIN_EMAIL || 'anujenterprises.fmcg.006@gmail.com';
        const customerTargetEmail = recipientEmail || orderData.customerEmail || orderData.email;
        console.log(`[EmailService] Dispatching order invoice notification #${orderData.invoiceNumber}...`);
        const dispatchPromises = [
            // 1. Always dispatch Admin Order Alert Email with Admin Template
            sendAdminOrderAlertEmail(orderData, adminEmail, pdfAttachment)
        ];
        // 2. Dispatch Customer Invoice Email with User Template if customer email exists
        if (customerTargetEmail && customerTargetEmail.toLowerCase() !== adminEmail.toLowerCase()) {
            dispatchPromises.push(sendCustomerInvoiceEmail(orderData, customerTargetEmail, pdfAttachment));
        }
        const results = await Promise.allSettled(dispatchPromises);
        return { success: true, results };
    }
    catch (err) {
        console.error('[EmailService] Master sendOrderInvoiceEmail failed:', err?.message || err);
        return { success: false, error: err?.message || 'Email dispatch failed' };
    }
};
/**
 * 3. Send Retailer Registration & Welcome Email
 */
export const sendWelcomeEmail = async (customerData) => {
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
    }
    catch (err) {
        console.error('[EmailService] Failed to send welcome email:', err?.message || err);
        return { success: false, error: err?.message || 'Failed to send welcome email' };
    }
};
/**
 * 4. Verify Transporter Connection
 */
export const verifyTransporterConnection = async () => {
    try {
        const transporter = createEmailTransporter();
        await transporter.verify();
        console.log('✅ [EmailService] Nodemailer SMTP connection verified successfully.');
        return true;
    }
    catch (err) {
        console.warn('⚠️ [EmailService] Nodemailer SMTP connection warning:', err?.message || err);
        return false;
    }
};
