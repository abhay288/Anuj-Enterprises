import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { generateInvoicePdfBuffer } from './pdfInvoiceGenerator.js';
// Load environment variables with resilient multi-path resolution
try {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const candidateEnvPaths = [
        path.resolve(process.cwd(), 'server/.env'),
        path.resolve(process.cwd(), '.env'),
        path.resolve(currentDir, '../../../.env'),
        path.resolve(currentDir, '../../.env')
    ];
    for (const envPath of candidateEnvPaths) {
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
        }
    }
}
catch {
    dotenv.config();
}
import { companyConfig } from '../config/companyConfig.js';
// 1. Create Nodemailer Transporter configured for Normal Email (Gmail SMTP / Custom SMTP)
export const createEmailTransporter = () => {
    const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'anujenterprises.fmcg.006@gmail.com';
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'daklfkxitufdwsjz';
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
 * 2A. Send Customer-Facing Official B2B Delivery Invoice & Dispatch Email
 * Strictly NO price, rate, or tax displays. 100% table-based for bulletproof alignment.
 */
export const sendCustomerInvoiceEmail = async (orderData, customerEmail, pdfAttachment) => {
    try {
        const transporter = createEmailTransporter();
        const invoiceNum = orderData.invoiceNumber || orderData.orderId || 'AE-INV-2026-000001';
        const orderNum = orderData.orderId || invoiceNum;
        const invoiceDate = orderData.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        // Vector PDF delivery invoice attachment
        const finalAttachment = pdfAttachment || {
            filename: `Delivery_Invoice_${invoiceNum}.pdf`,
            content: generateInvoicePdfBuffer(orderData),
            contentType: 'application/pdf'
        };
        let totalUnits = 0;
        const itemsRowsHtml = (orderData.items || []).map((item, idx) => {
            const pName = item.productName || item.name || 'FMCG Product';
            const qty = parseInt(String(item.quantity || item.qty || 1), 10);
            const sku = item.sku || item.hsn || `SKU-${1000 + idx}`;
            const pack = item.packSize || 'Standard Box';
            totalUnits += qty;
            const bgColor = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
            return `
        <tr style="background-color: ${bgColor}; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px; font-size: 11px; color: #64748b; text-align: center; font-weight: 700; width: 6%;">${idx + 1}</td>
          <td style="padding: 10px 10px; font-size: 12.5px; color: #0f172a; font-weight: 600; text-align: left; width: 44%;">
            ${pName}
          </td>
          <td style="padding: 10px 8px; font-size: 11px; color: #475569; text-align: center; font-family: monospace; width: 16%;">${sku}</td>
          <td style="padding: 10px 8px; font-size: 11.5px; color: #475569; text-align: center; width: 18%;">${pack}</td>
          <td style="padding: 10px 10px; font-size: 13px; color: #0f172a; text-align: right; font-weight: 800; width: 16%;">${qty} Units</td>
        </tr>
      `;
        }).join('');
        const finalTotalUnits = orderData.totalQuantity || totalUnits;
        const htmlContent = `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Delivery Invoice #${invoiceNum}</title>
      </head>
      <body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9;">
          <tr>
            <td align="center" style="padding: 10px 15px;">
              <!-- Main Card (680px max) -->
              <table width="680" cellpadding="0" cellspacing="0" border="0" style="max-width: 680px; width: 100%; background-color: #ffffff; border-radius: 12px; border: 1px solid #cbd5e1; border-collapse: separate; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
                
                <!-- 1. Header: Brand, Badges & Metadata -->
                <tr>
                  <td style="background-color: #0f172a; padding: 24px; border-bottom: 4px solid #d97706;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Left: Badges & Company Identity -->
                        <td valign="top" style="width: 60%; text-align: left;">
                          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
                            <tr>
                              <td style="background-color: #d97706; color: #ffffff; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                                DELIVERY INVOICE
                              </td>
                              <td style="width: 8px;"></td>
                              <td style="background-color: #334155; color: #cbd5e1; font-size: 9px; font-weight: 700; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">
                                ORIGINAL FOR RECIPIENT
                              </td>
                            </tr>
                          </table>
                          <div style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; margin-top: 4px;">
                            ${companyConfig.name.toUpperCase()}
                          </div>
                          <div style="font-size: 11px; font-weight: 700; color: #f59e0b; margin-top: 2px;">
                            ${companyConfig.tagline.toUpperCase()}
                          </div>
                          <div style="font-size: 11px; color: #cbd5e1; margin-top: 6px; line-height: 1.4;">
                            📍 ${companyConfig.address}<br />
                            📞 Helpline: ${companyConfig.phone} / ${companyConfig.mobile} | ✉️ ${companyConfig.email}
                          </div>
                        </td>
                        <!-- Right: Invoice Metadata -->
                        <td valign="top" style="width: 40%; text-align: right;">
                          <div style="font-size: 13px; font-weight: 900; color: #f59e0b; text-transform: uppercase; letter-spacing: 0.5px;">
                            B2B DELIVERY INVOICE
                          </div>
                          <div style="font-size: 16px; font-weight: 900; color: #ffffff; font-family: monospace; margin-top: 3px;">
                            ${invoiceNum}
                          </div>
                          <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 4px;">
                            <strong>Date of Issue:</strong> ${invoiceDate}
                          </div>
                          <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">
                            <strong>Order Ref:</strong> ${orderNum}
                          </div>
                          <div style="font-size: 11px; color: #34d399; font-weight: 700; margin-top: 2px;">
                            Dispatch Hub: Kanpur Central Depot
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 2. Buyer & Dispatch Details -->
                <tr>
                  <td style="padding: 20px 24px 12px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-collapse: separate;">
                      <tr>
                        <!-- Buyer Details Left (50%) -->
                        <td valign="top" style="width: 50%; padding: 14px; border-right: 1px solid #e2e8f0; text-align: left;">
                          <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
                            DETAILS OF RECEIVER / BILLED TO (BUYER):
                          </div>
                          <div style="font-size: 14px; font-weight: 800; color: #0f172a;">
                            ${orderData.customerName || 'Valued Retail Partner'}
                          </div>
                          ${orderData.shopOwnerName ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">Proprietor: <strong>${orderData.shopOwnerName}</strong></div>` : ''}
                          ${orderData.customerMobile ? `<div style="font-size: 12px; color: #475569; margin-top: 2px;">Mobile: <strong>${orderData.customerMobile}</strong></div>` : ''}
                          <div style="font-size: 11.5px; color: #475569; margin-top: 2px; line-height: 1.4;">
                            Address: ${orderData.customerAddress || 'Local Market'}, ${orderData.customerCity || 'Kanpur'}, ${orderData.customerState || 'Uttar Pradesh'}
                          </div>
                        </td>
                        <!-- Supply Terms Right (50%) -->
                        <td valign="top" style="width: 50%; padding: 14px; text-align: left;">
                          <div style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 4px;">
                            DISPATCH & DELIVERY TERMS:
                          </div>
                          <div style="font-size: 12px; color: #334155; margin-top: 2px;">
                            <strong>Dispatch Hub:</strong> Kanpur Central Warehouse Depot
                          </div>
                          <div style="font-size: 12px; color: #334155; margin-top: 2px;">
                            <strong>Delivery Mode:</strong> Direct Store Delivery (Doorstep)
                          </div>
                          <div style="font-size: 12px; color: #059669; font-weight: 800; margin-top: 4px;">
                            <strong>Payment Mode:</strong> ${(orderData.paymentMethod || 'Due on Delivery (Offline)').toUpperCase()}
                          </div>
                          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                            Inspection: <strong>Verified on Delivery Handover</strong>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 3. Itemized Goods Table (Product & Packaging Specifications Only) -->
                <tr>
                  <td style="padding: 8px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #cbd5e1; border-collapse: collapse; border-radius: 6px; overflow: hidden;">
                      <thead>
                        <tr style="background-color: #0f172a; color: #ffffff;">
                          <th style="padding: 10px 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: center; width: 6%;">#</th>
                          <th style="padding: 10px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: left; width: 44%;">Description of Goods / SKU</th>
                          <th style="padding: 10px 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: center; width: 16%;">Item Code</th>
                          <th style="padding: 10px 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: center; width: 18%;">Packaging Spec</th>
                          <th style="padding: 10px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; text-align: right; width: 16%;">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsRowsHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- 4. Quantity Summary Box (No Price, No Tax) -->
                <tr>
                  <td style="padding: 12px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; border-collapse: separate;">
                      <tr>
                        <!-- Left: Line items info -->
                        <td valign="middle" style="width: 50%; padding: 16px; border-right: 1px solid #cbd5e1; text-align: left;">
                          <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 4px;">
                            DISPATCH VOLUME VERIFICATION:
                          </div>
                          <div style="font-size: 12.5px; color: #475569;">
                            Total Product Line Items: <strong>${(orderData.items || []).length} SKU(s)</strong>
                          </div>
                          <div style="font-size: 11.5px; color: #059669; font-weight: 700; margin-top: 4px;">
                            ✓ All cases inspected & verified for delivery handover
                          </div>
                        </td>
                        <!-- Right: Total Units -->
                        <td valign="middle" style="width: 50%; padding: 16px; text-align: right;">
                          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase;">
                            TOTAL DISPATCHED VOLUME
                          </div>
                          <div style="font-size: 22px; font-weight: 900; color: #0f172a; margin-top: 2px;">
                            ${finalTotalUnits} UNITS
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 5. Official PDF Attachment Notice -->
                <tr>
                  <td style="padding: 0 24px 16px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px;">
                      <tr>
                        <td style="font-size: 18px; width: 32px; vertical-align: middle; text-align: center;">📎</td>
                        <td style="font-size: 12px; color: #065f46; vertical-align: middle; text-align: left; line-height: 1.4;">
                          <strong>Official Vector PDF Delivery Invoice Attached:</strong><br />
                          An official print-ready delivery invoice (<code>${finalAttachment.filename}</code>) is attached to this email for your store receiving records.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 6. Statutory Declaration & Authorized Signatory -->
                <tr>
                  <td style="padding: 16px 24px; border-top: 1px dashed #cbd5e1;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Left: Legal Terms -->
                        <td valign="top" style="width: 60%; font-size: 10.5px; color: #64748b; line-height: 1.5; text-align: left;">
                          <strong style="color: #334155;">Terms & Delivery Conditions:</strong><br />
                          1. Goods once inspected & received upon delivery handover are covered under manufacturer guarantee.<br />
                          2. B2B trade account billing and payments are settled per agreed wholesale terms.<br />
                          3. Subject to exclusive Kanpur, Uttar Pradesh jurisdiction.
                        </td>
                        <!-- Right: Signatory -->
                        <td valign="bottom" style="width: 40%; text-align: right;">
                          <div style="font-size: 11px; font-weight: 800; color: #0f172a;">
                            For ${companyConfig.name.toUpperCase()}
                          </div>
                          <div style="height: 24px;"></div>
                          <div style="border-top: 1px solid #94a3b8; display: inline-block; padding-top: 4px; font-size: 11px; font-weight: 700; color: #334155;">
                            ${companyConfig.signatory} / Authorized Signatory
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- 7. Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; line-height: 1.6;">
                    <strong>${companyConfig.name}</strong> &bull; ${companyConfig.tagline}<br />
                    📍 ${companyConfig.address}<br />
                    📞 Support: ${companyConfig.phone} / ${companyConfig.mobile} &bull; 📧 ${companyConfig.email}
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
        const mailOptions = {
            from: FROM_EMAIL,
            to: customerEmail,
            subject: `📦 Official Delivery Invoice #${invoiceNum} - ${companyConfig.name}`,
            html: htmlContent,
            attachments: [finalAttachment]
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EmailService] Delivery invoice email with PDF sent to ${customerEmail} (MessageID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    }
    catch (err) {
        console.error(`[EmailService] Failed to send customer delivery invoice email to ${customerEmail}:`, err?.message || err);
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
                  <td style="padding: 5px 0; color: #94a3b8;">Dispatch Status:</td>
                  <td style="padding: 5px 0; font-weight: 900; color: #34d399; font-size: 13px;">READY FOR WAREHOUSE DISPATCH</td>
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
        const finalAttachment = pdfAttachment || {
            filename: `Delivery_Invoice_${orderData.invoiceNumber || orderData.orderId || 'AE-2026'}.pdf`,
            content: generateInvoicePdfBuffer(orderData),
            contentType: 'application/pdf'
        };
        const mailOptions = {
            from: FROM_EMAIL,
            to: adminEmail,
            subject: `📦 NEW B2B ORDER ALERT: Invoice #${orderData.invoiceNumber || orderData.orderId} | ${orderData.customerName} (${orderData.totalQuantity} Units)`,
            html: htmlContent,
            attachments: [finalAttachment]
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
/**
 * 5. Send Urgent New Device Admin Login Security Alert
 * Dispatched immediately when an admin successfully authenticates from an unrecognized device/browser.
 * Strictly adheres to security policies: NO passwords, NO tokens, NO JWTs.
 */
export const sendAdminNewDeviceAlertEmail = async (alertData) => {
    try {
        const transporter = createEmailTransporter();
        const FROM_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'anujenterprises.fmcg.006@gmail.com';
        const safeLocation = alertData.approximateLocation || 'Kanpur / Uttar Pradesh Region, India (Approximate)';
        const safeTimezone = alertData.timezone || 'IST (UTC+05:30)';
        const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #0f172a; margin: 0; padding: 20px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
          .header { background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); color: #ffffff; padding: 28px 24px; text-align: center; }
          .alert-badge { display: inline-block; background: #fee2e2; color: #991b1b; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 20px; margin-bottom: 12px; }
          .title { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
          .subtitle { color: #fecaca; margin: 6px 0 0; font-size: 13px; font-weight: 500; }
          .content { padding: 28px 24px; font-size: 14px; line-height: 1.6; color: #334155; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
          .info-table td { padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .info-table tr:last-child td { border-bottom: none; }
          .info-table td.label { font-weight: 700; color: #64748b; width: 38%; }
          .info-table td.val { font-weight: 600; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; }
          .warning-box { background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0; color: #92400e; font-size: 13px; }
          .warning-box strong { color: #78350f; display: block; margin-bottom: 4px; font-size: 14px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="alert-badge">🛡️ Security Notification</span>
            <h1 class="title">New Admin Login Detected</h1>
            <p class="subtitle">Anuj Enterprises Management Portal</p>
          </div>
          <div class="content">
            <p>Hello <strong>${alertData.adminName || 'Administrator'}</strong>,</p>
            <p>Your Anuj Enterprises Admin account was just accessed from a <strong>new or unrecognized device / browser session</strong>.</p>
            
            <table class="info-table">
              <tr>
                <td class="label">Admin Account</td>
                <td class="val"><strong>${alertData.adminEmail}</strong></td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="val">${alertData.loginDate}</td>
              </tr>
              <tr>
                <td class="label">Time</td>
                <td class="val">${alertData.loginTime} (${safeTimezone})</td>
              </tr>
              <tr>
                <td class="label">Device Type</td>
                <td class="val">${alertData.deviceType}</td>
              </tr>
              <tr>
                <td class="label">Operating System</td>
                <td class="val">${alertData.os}</td>
              </tr>
              <tr>
                <td class="label">Browser</td>
                <td class="val">${alertData.browser}</td>
              </tr>
              <tr>
                <td class="label">Approximate Location</td>
                <td class="val">${safeLocation}</td>
              </tr>
              <tr>
                <td class="label">IP Address</td>
                <td class="val" style="font-family: monospace;">${alertData.ipAddress}</td>
              </tr>
              ${alertData.userAgent ? `
              <tr>
                <td class="label">Client User-Agent</td>
                <td class="val" style="font-family: monospace; font-size: 11px; word-break: break-all;">${alertData.userAgent}</td>
              </tr>` : ''}
            </table>

            <div class="warning-box">
              <strong>⚠️ Did not authorize this login?</strong>
              If you did not perform this login, your account credentials may be compromised. Please change your password immediately in the Admin Dashboard and review your active sessions.
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
              * Note: Geographic locations derived from IP addresses are approximate and should be used as guidance only.
            </p>
          </div>
          <div class="footer">
            <strong>Anuj Enterprises Security Team</strong> • Kanpur, Uttar Pradesh<br>
            📞 Helpline: +91 88876 83782 / +91 70719 79894 | 📧 anujenterprises.fmcg.006@gmail.com
          </div>
        </div>
      </body>
      </html>
    `;
        const info = await transporter.sendMail({
            from: `"Anuj Enterprises Security" <${FROM_EMAIL}>`,
            to: alertData.adminEmail,
            subject: "New Admin Login Detected — Anuj Enterprises",
            html: htmlContent
        });
        console.log(`[EmailService] New device alert email sent to ${alertData.adminEmail} (MessageID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    }
    catch (err) {
        console.error('[EmailService] Failed to send new device alert email:', err?.message || err);
        return { success: false, error: err?.message || 'Failed to send alert email' };
    }
};
