import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!host || !user || !pass || user.includes('your-email')) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

const FROM_EMAIL = process.env.SMTP_FROM || '"Veloura Fashion" <no-reply@veloura.com>';

export async function sendOtpEmail(toEmail, otpCode, customerName = 'Valued Customer') {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f6; color: #1c1c1c;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-family: Georgia, serif; font-size: 32px; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #111;">VELOURA</h1>
        <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-top: 4px;">Modern Luxury & Tailored Essentials</p>
      </div>

      <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="font-size: 20px; font-weight: 500; margin-top: 0; color: #111;">Verify Your Account</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #555;">Hello ${customerName},</p>
        <p style="font-size: 14px; line-height: 1.6; color: #555;">Thank you for choosing Veloura. Use the verification code below to complete your authentication. This code is valid for <strong>10 minutes</strong>.</p>

        <div style="text-align: center; margin: 35px 0;">
          <div style="display: inline-block; font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #111; background-color: #f7f7f7; padding: 16px 28px; border-radius: 6px; border: 1px solid #e0e0e0;">
            ${otpCode}
          </div>
        </div>

        <p style="font-size: 12px; color: #888; line-height: 1.5; margin-bottom: 0;">If you did not request this verification code, please disregard this email. Never share your OTP with anyone.</p>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
        &copy; ${new Date().getFullYear()} Veloura Fashion Inc. All rights reserved.
      </div>
    </div>
  `;

  if (!transporter) {
    console.warn(`[OTP Fallback Log] SMTP credentials not set in .env. Real generated OTP for ${toEmail}: [ ${otpCode} ]`);
    return { success: true, delivered: 'logged_console', otp: otpCode };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: toEmail,
      subject: `Veloura Verification Code: ${otpCode}`,
      html,
    });
    console.log(`✅ OTP email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, delivered: 'email', messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${toEmail}:`, error.message);
    // Log code as fallback so flow is not blocked during misconfigured SMTP
    console.warn(`[OTP Recovery Log] OTP for ${toEmail}: [ ${otpCode} ]`);
    return { success: true, delivered: 'error_fallback', error: error.message };
  }
}

export async function sendOrderConfirmationEmail(order, items = []) {
  const transporter = createTransporter();

  const customerName = order.customer_name || 'Valued Customer';
  const customerEmail = order.customer_email;
  const orderId = order.id;
  const total = Number(order.total_amount || 0).toLocaleString('en-IN');
  const subtotal = Number(order.subtotal || 0).toLocaleString('en-IN');
  const shippingFee = Number(order.shipping_fee || 0) === 0 ? 'FREE' : `₹${order.shipping_fee}`;
  const address = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address || {};

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <div style="font-weight: 600; color: #111; font-size: 14px;">${item.product_name}</div>
        <div style="font-size: 12px; color: #777;">Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'} | Qty: ${item.quantity}</div>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: 500; font-size: 14px; color: #111;">
        ₹${(Number(item.price) * item.quantity).toLocaleString('en-IN')}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 40px 20px; background-color: #faf9f6; color: #1c1c1c;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-family: Georgia, serif; font-size: 32px; letter-spacing: 4px; text-transform: uppercase; margin: 0; color: #111;">VELOURA</h1>
        <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-top: 4px;">Order Confirmation</p>
      </div>

      <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; border: 1px solid #eaeaea; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background-color: #e8f5e9; color: #2e7d32; font-size: 24px;">✓</div>
          <h2 style="font-size: 22px; font-weight: 600; margin: 12px 0 4px 0; color: #111;">Thank You For Your Order</h2>
          <p style="font-size: 14px; color: #666; margin: 0;">Order #${orderId}</p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #444;">Hello ${customerName},</p>
        <p style="font-size: 14px; line-height: 1.6; color: #444;">We are pleased to confirm that your order has been placed. We are preparing your tailored pieces with utmost care.</p>

        <div style="margin: 30px 0;">
          <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 1px solid #eaeaea; padding-bottom: 8px; margin-bottom: 12px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>

          <table style="width: 100%; margin-top: 16px; font-size: 14px;">
            <tr>
              <td style="color: #666; padding: 4px 0;">Subtotal:</td>
              <td style="text-align: right; color: #111; padding: 4px 0;">₹${subtotal}</td>
            </tr>
            <tr>
              <td style="color: #666; padding: 4px 0;">Shipping:</td>
              <td style="text-align: right; color: #111; padding: 4px 0;">${shippingFee}</td>
            </tr>
            <tr style="border-top: 1px solid #eee; font-weight: 700; font-size: 16px;">
              <td style="color: #111; padding: 12px 0 4px 0;">Total:</td>
              <td style="text-align: right; color: #111; padding: 12px 0 4px 0;">₹${total}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fcfcfc; border: 1px solid #eee; border-radius: 6px; padding: 18px; margin-top: 25px;">
          <h4 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #555; margin: 0 0 10px 0;">Shipping & Payment</h4>
          <p style="font-size: 13px; color: #666; margin: 0 0 6px 0; line-height: 1.5;">
            <strong>Deliver to:</strong> ${customerName}<br>
            ${address.street || address.address || ''}, ${address.city || ''} ${address.state || ''} - ${address.pincode || ''}<br>
            Phone: +91 ${order.customer_phone}
          </p>
          <p style="font-size: 13px; color: #666; margin: 6px 0 0 0;">
            <strong>Payment Method:</strong> ${order.payment_method === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery (COD)'} |
            <strong>Status:</strong> <span style="color: #2e7d32; font-weight: 600;">${order.payment_status?.toUpperCase()}</span>
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
        Questions about your order? Contact us at concierge@veloura.com<br>
        &copy; ${new Date().getFullYear()} Veloura Fashion Inc. All rights reserved.
      </div>
    </div>
  `;

  if (!customerEmail) {
    console.warn(`[Order Email] No customer email provided for order ${orderId}`);
    return;
  }

  if (!transporter) {
    console.warn(`[Order Email Fallback] SMTP not configured. Order confirmation for #${orderId} logged for ${customerEmail}`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Order Confirmation #${orderId} - Veloura`,
      html,
    });
    console.log(`✅ Order confirmation email sent to ${customerEmail} for order #${orderId}`);
    return info;
  } catch (err) {
    console.error(`❌ Failed to send order confirmation email:`, err.message);
  }
}