import "dotenv/config"
import nodemailer from "nodemailer";

/**
 * Creates and returns an SMTP transporter based on environment variables.
 * Returns null if SMTP configuration is not provided, allowing safe degradation in test/dev environments.
 */
let cachedTransporter = null;

export const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = process.env.SMTP_SECURE === "true" || port === 465;

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransporter;
};

/**
 * Reusable email delivery helper.
 * Never throws errors to callers, guaranteeing order flow is never broken.
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!to) {
      return { skipped: true, reason: "No recipient email provided" };
    }

    const transporter = getTransporter();
    if (!transporter) {
      return { skipped: true, reason: "SMTP credentials not configured in environment" };
    }

    const fromAddress = process.env.SMTP_FROM || `"Wardrobe Hub" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text: text || "",
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Brand-aligned HTML email template layout.
 * Colors: Main #111111, Beige #BFA88A, Background #F5F1EB, Surface #FFFFFF
 */
const renderEmailHtml = ({ title, heading, message, detailsHtml = "" }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #F5F1EB; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111111; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; border: 1px solid #E5DED3; }
    .header { background-color: #111111; padding: 24px; text-align: center; }
    .header-logo { display: inline-block; width: 36px; height: 36px; line-height: 36px; border-radius: 4px; background-color: #BFA88A; color: #111111; font-weight: bold; font-size: 20px; font-family: serif; }
    .header-title { color: #F5F1EB; font-size: 20px; font-weight: 600; margin-top: 10px; letter-spacing: 0.05em; }
    .content { padding: 32px 24px; }
    .heading { font-size: 22px; font-weight: 700; color: #111111; margin-bottom: 12px; }
    .message { font-size: 15px; line-height: 1.6; color: #5C5C5C; margin-bottom: 24px; }
    .details-box { background-color: #F5F1EB; border: 1px solid #E5DED3; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
    .footer { background-color: #F5F1EB; border-top: 1px solid #E5DED3; padding: 20px; text-align: center; font-size: 12px; color: #8A6F4E; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-logo">W</div>
      <div class="header-title">WARDROBE HUB</div>
    </div>
    <div class="content">
      <div class="heading">${heading}</div>
      <div class="message">${message}</div>
      ${detailsHtml}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Wardrobe Hub. Quality Fashion & Accessories.<br>
      This is an automated notification. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Helper to safely resolve delivery address from either formatted or raw Prisma order objects
 */
const extractShippingInfo = (order) => {
  const addr = order.shippingAddress || {};
  const name = addr.name || order.shipName || order.customer?.name || order.user?.name || "Customer";
  const phone = addr.phone || order.shipPhone || order.customer?.phone || order.user?.phone || "";
  const addressLine = addr.address || order.shipAddress || "";
  const city = addr.city || order.shipCity || "";
  const state = addr.state || order.shipState || "";
  const postalCode = addr.postalCode || order.shipPostalCode || "";
  const country = addr.country || order.shipCountry || "India";

  const locationPart = [
    addressLine,
    city && state ? `${city}, ${state}` : (city || state),
    postalCode ? `- ${postalCode}` : "",
    country,
  ].filter(Boolean).join(" ");

  return {
    name,
    phone,
    fullAddress: locationPart || "Address on file",
  };
};

/**
 * Format order summary block for order emails
 */
const renderOrderSummaryBox = (order) => {
  const items = order.items || [];
  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E5DED3;">
        <td style="padding: 8px 0; font-size: 14px; color: #111111;">
          <strong>${item.productName}</strong><br>
          <span style="font-size: 12px; color: #5C5C5C;">Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</span>
        </td>
        <td style="padding: 8px 0; text-align: right; font-size: 14px; font-weight: 600; color: #111111;">
          ₹${(item.subtotal || item.unitPrice * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const shipping = extractShippingInfo(order);

  return `
    <div class="details-box">
      <div style="font-size: 14px; font-weight: 700; color: #111111; margin-bottom: 12px; border-bottom: 1px solid #E5DED3; padding-bottom: 6px;">
        Order Details (#${order.orderNumber})
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="text-align: right; font-size: 15px; font-weight: 700; color: #111111; padding-top: 8px; border-top: 1px solid #E5DED3;">
        Total: ₹${Number(order.total).toFixed(2)}
      </div>
      <div style="font-size: 12px; color: #5C5C5C; margin-top: 10px;">
        <strong>Delivery Address:</strong><br>
        ${shipping.name} ${shipping.phone ? `(${shipping.phone})` : ""}<br>
        ${shipping.fullAddress}
      </div>
    </div>
  `;
};

/**
 * Send Order Confirmed Email
 */
export const sendOrderConfirmedEmail = async (order, recipientEmail) => {
  const shipping = extractShippingInfo(order);
  const to = recipientEmail || order.customer?.email || order.user?.email;
  const customerName = shipping.name;

  const html = renderEmailHtml({
    title: `Order Confirmed - #${order.orderNumber}`,
    heading: `Thank you for your order, ${customerName}!`,
    message: `Your order <strong>#${order.orderNumber}</strong> has been confirmed and is being processed by our warehouse team. We will notify you once your package is on the way.`,
    detailsHtml: renderOrderSummaryBox(order),
  });

  return await sendEmail({
    to,
    subject: `Order Confirmed: #${order.orderNumber} - Wardrobe Hub`,
    text: `Hi ${customerName}, your order #${order.orderNumber} for ₹${Number(order.total).toFixed(2)} has been confirmed. Delivery Address: ${shipping.fullAddress}`,
    html,
  });
};

/**
 * Send Order Shipped Email
 */
export const sendOrderShippedEmail = async (order, recipientEmail) => {
  const shipping = extractShippingInfo(order);
  const to = recipientEmail || order.customer?.email || order.user?.email;
  const customerName = shipping.name;

  const html = renderEmailHtml({
    title: `Order Shipped - #${order.orderNumber}`,
    heading: "Your package is on its way!",
    message: `Great news, ${customerName}! Your order <strong>#${order.orderNumber}</strong> has been shipped and is heading to your delivery address.`,
    detailsHtml: renderOrderSummaryBox(order),
  });

  return await sendEmail({
    to,
    subject: `Order Shipped: #${order.orderNumber} - Wardrobe Hub`,
    text: `Hi ${customerName}, your order #${order.orderNumber} has been shipped!`,
    html,
  });
};

/**
 * Send Order Delivered Email
 */
export const sendOrderDeliveredEmail = async (order, recipientEmail) => {
  const shipping = extractShippingInfo(order);
  const to = recipientEmail || order.customer?.email || order.user?.email;
  const customerName = shipping.name;

  const html = renderEmailHtml({
    title: `Order Delivered - #${order.orderNumber}`,
    heading: "Package Delivered!",
    message: `Hi ${customerName}, your order <strong>#${order.orderNumber}</strong> has been successfully delivered. We hope you love your new wardrobe selections!`,
    detailsHtml: renderOrderSummaryBox(order),
  });

  return await sendEmail({
    to,
    subject: `Order Delivered: #${order.orderNumber} - Wardrobe Hub`,
    text: `Hi ${customerName}, your order #${order.orderNumber} has been delivered. Thank you for shopping with Wardrobe Hub!`,
    html,
  });
};

/**
 * Send Order Cancelled Email
 */
export const sendOrderCancelledEmail = async (order, recipientEmail) => {
  const shipping = extractShippingInfo(order);
  const to = recipientEmail || order.customer?.email || order.user?.email;
  const customerName = shipping.name;

  const html = renderEmailHtml({
    title: `Order Cancelled - #${order.orderNumber}`,
    heading: "Order Cancellation Notice",
    message: `Hi ${customerName}, your order <strong>#${order.orderNumber}</strong> has been cancelled. Any reserved items have been returned to inventory. If you did not request this cancellation or have questions, please reach out to customer support.`,
    detailsHtml: renderOrderSummaryBox(order),
  });

  return await sendEmail({
    to,
    subject: `Order Cancelled: #${order.orderNumber} - Wardrobe Hub`,
    text: `Hi ${customerName}, your order #${order.orderNumber} has been cancelled.`,
    html,
  });
};


/**
 * Send Return/Exchange Request Submitted Email
 */
export const sendReturnRequestSubmittedEmail = async (request, order, recipientEmail) => {
  const to = recipientEmail || request.customerEmail || order?.user?.email;
  const orderNumber = request.orderNumber || order?.orderNumber || "N/A";
  const typeLabel = request.type === "EXCHANGE" ? "Exchange" : "Return";

  const html = renderEmailHtml({
    title: `${typeLabel} Request Received - #${orderNumber}`,
    heading: `${typeLabel} Request Received`,
    message: `We have received your ${typeLabel.toLowerCase()} request for order <strong>#${orderNumber}</strong>. Our support team will review your request shortly and update you.`,
    detailsHtml: `
      <div class="details-box">
        <div style="font-size: 14px; font-weight: 700; color: #111111; margin-bottom: 8px;">Request Summary</div>
        <p style="margin: 4px 0; font-size: 13px; color: #5C5C5C;"><strong>Type:</strong> ${typeLabel}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #5C5C5C;"><strong>Reason:</strong> ${request.reason}</p>
        ${request.details ? `<p style="margin: 4px 0; font-size: 13px; color: #5C5C5C;"><strong>Details:</strong> ${request.details}</p>` : ""}
        <p style="margin: 4px 0; font-size: 13px; color: #5C5C5C;"><strong>Current Status:</strong> PENDING</p>
      </div>
    `,
  });

  return await sendEmail({
    to,
    subject: `${typeLabel} Request Received: Order #${orderNumber} - Wardrobe Hub`,
    text: `We have received your ${typeLabel.toLowerCase()} request for order #${orderNumber}. Status: PENDING.`,
    html,
  });
};

/**
 * Send Return/Exchange Request Status Updated Email
 */
export const sendReturnRequestStatusUpdatedEmail = async (request, order, recipientEmail) => {
  const to = recipientEmail || request.customerEmail || order?.user?.email;
  const orderNumber = request.orderNumber || order?.orderNumber || "N/A";
  const typeLabel = request.type === "EXCHANGE" ? "Exchange" : "Return";
  const statusLabel = request.status;

  const html = renderEmailHtml({
    title: `${typeLabel} Request ${statusLabel} - #${orderNumber}`,
    heading: `${typeLabel} Request ${statusLabel}`,
    message: `Your ${typeLabel.toLowerCase()} request for order <strong>#${orderNumber}</strong> has been updated to <strong>${statusLabel}</strong>.`,
    detailsHtml: `
      <div class="details-box">
        <div style="font-size: 14px; font-weight: 700; color: #111111; margin-bottom: 8px;">Decision Details</div>
        <p style="margin: 4px 0; font-size: 13px; color: #5C5C5C;"><strong>Status:</strong> ${statusLabel}</p>
        ${request.adminResponse ? `<p style="margin: 4px 0; font-size: 13px; color: #5C5C5C;"><strong>Admin Note:</strong> ${request.adminResponse}</p>` : ""}
      </div>
    `,
  });

  return await sendEmail({
    to,
    subject: `${typeLabel} Request ${statusLabel}: Order #${orderNumber} - Wardrobe Hub`,
    text: `Your ${typeLabel.toLowerCase()} request for order #${orderNumber} has been marked as ${statusLabel}.`,
    html,
  });
};

export default {
  getTransporter,
  sendEmail,
  sendOrderConfirmedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
  sendOrderCancelledEmail,
  sendReturnRequestSubmittedEmail,
  sendReturnRequestStatusUpdatedEmail,
};
