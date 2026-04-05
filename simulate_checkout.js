require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const mockSession = {
  id: 'cs_simulated_' + Date.now(),
  customer_email: 'henry_alcaide@hotmail.com',
  customer_details: { email: 'henry_alcaide@hotmail.com', name: 'Test Customer' },
  amount_total: 398,
  metadata: {
    order_items: JSON.stringify([
      { id: '54e0eccd-8f36-462b-b68a-8182611d9add', name: 'AI Artwork - Toucans', quantity: 1, priceCents: 199, image1: '/images/New Project picz PDF/Toucans.pdf' },
      { id: '15b6fc6f-327a-4ec4-896f-486349e85a3d', name: 'AI Artwork - The Ship', quantity: 1, priceCents: 199, image1: '/images/New Project picz PDF/Theship.pdf' }
    ])
  }
};

async function simulateCheckoutCompletion() {
  const session = mockSession;
  console.log('=== Simulating Stripe checkout.session.completed event ===');
  console.log('Session ID:', session.id);

  const customerEmail = session.customer_details?.email || session.customer_email;
  if (!customerEmail) { console.error('No customer email'); return; }
  console.log('Customer email:', customerEmail);

  const orderItems = JSON.parse(session.metadata.order_items || '[]');
  if (orderItems.length === 0) { console.error('No order items'); return; }
  console.log('Order items:', orderItems.length);
  orderItems.forEach(item => console.log('  -', item.name, '| $' + (item.priceCents / 100).toFixed(2)));

  const attachments = [];
  for (const item of orderItems) {
    if (item.image1) {
      const pdfPath = path.join(__dirname, item.image1);
      const fileName = path.basename(item.image1);
      console.log('Checking PDF:', pdfPath);
      if (!fs.existsSync(pdfPath)) { console.error('PDF not found:', pdfPath); continue; }
      const fileSize = fs.statSync(pdfPath).size;
      console.log('  Found:', fileName, '(' + (fileSize / 1024).toFixed(1) + ' KB)');
      attachments.push({ filename: fileName, path: pdfPath, contentType: 'application/pdf' });
    }
  }
  console.log('Total attachments:', attachments.length);

  const totalAmount = (session.amount_total / 100).toFixed(2);

  console.log('Setting up SMTP transporter...');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT),
    secure: false, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  console.log('Verifying SMTP connection...');
  try { await transporter.verify(); console.log('SMTP OK!'); }
  catch (err) { console.error('SMTP failed:', err.message); return; }

  const htmlItems = orderItems.map(item =>
    '<li style="padding:8px 0;border-bottom:1px solid #eee;"><strong>' + item.name + '</strong><br>Qty: ' + item.quantity + ' | $' + (item.priceCents/100).toFixed(2) + ' each</li>'
  ).join('');

  const htmlContent = '<html><head><title>Order Confirmation</title></head><body style="margin:0;padding:20px;background:#f4f4f4;"><div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;"><h2 style="color:#1a73e8;border-bottom:2px solid #eee;padding-bottom:10px;">Thank you for your purchase from DA Prints AI!</h2><h3>Order Summary:</h3><ul style="list-style:none;padding:0;">' + htmlItems + '</ul><p style="font-size:18px;font-weight:bold;color:#333;">Total: $' + totalAmount + '</p><div style="background:#f5f5f5;padding:15px;border-radius:5px;margin:20px 0;"><p style="margin:0;"><strong>Your purchased digital artwork PDF(s) are attached to this email.</strong></p></div><p style="color:#333;margin-top:20px;">Thank you for shopping with DA Prints AI!<br><em>DA Prints AI Team</em></p></div></body></html>';

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'DA Prints AI <noreply@daprintsai.com>',
    to: customerEmail,
    replyTo: process.env.SMTP_USER,
    subject: 'Your DA Prints AI Purchase - Digital Downloads',
    html: htmlContent,
    attachments: attachments
  };

  console.log('Sending email to:', mailOptions.to);
  console.log('Attachments:', attachments.map(a => a.filename).join(', '));

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('=== EMAIL SENT SUCCESSFULLY ===');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('=== EMAIL SENDING FAILED ===');
    console.error('Error:', error.message);
  }
}

simulateCheckoutCompletion().catch(console.error);
