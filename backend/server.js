/**
 * Backend Server for DA Prints AI - Stripe Checkout & Email Integration
 * 
 * This server handles:
 * 1. Creating Stripe Checkout Sessions that support multiple items in a single transaction
 * 2. Listening for Stripe webhooks to confirm successful payments
 * 3. Automatically emailing purchased picture PDFs to the buyer after payment
 * 
 * Setup:
 *   npm init -y
 *   npm install express stripe nodemailer cors dotenv
 * 
 * Environment variables (create a .env file):
 *   STRIPE_SECRET_KEY=your_stripe_secret_key
 *   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
 *   SMTP_HOST=smtp.gmail.com
 *   SMTP_PORT=587
 *   SMTP_USER=your-email@gmail.com
 *   SMTP_PASS=your-app-password
 *   EMAIL_FROM=DA Prints AI <your-email@gmail.com>
 *   BASE_URL=http://localhost:5500
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();

// Stripe requires raw body for webhook verification
// So we need to use express.raw() for the webhook endpoint BEFORE express.json()
app.post('/api/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Parse JSON for all other routes
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://daprintsai.live',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Serve static files (the frontend)
app.use(express.static(path.join(__dirname, '..')));

// Serve Stripe publishable key to frontend (avoids hardcoding in HTML)
app.get("/api/config", (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Initialize Stripe with the secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP connection on startup
transporter.verify()
    .then(() => console.log('SMTP connection verified successfully (Brevo)'))
    .catch((err) => console.error('SMTP connection error:', err.message));
/**
 * POST /api/create-checkout-session
 * 
 * Creates a Stripe Checkout Session that supports purchasing MULTIPLE pictures
 * in a single transaction. Each item in the cart becomes a separate line_item
 * with its own quantity, allowing buyers to purchase 2, 3, 4+ pictures at once.
 * 
 * Stripe collects the buyer's email during checkout automatically.
 */
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { lineItems } = req.body;

    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty. Please add items before checkout.' });
    }

    // Build Stripe line_items array - one entry per cart item
    // This enables multi-item checkout (2, 3, 4+ pictures in one transaction)
    const stripeLineItems = lineItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [`${process.env.BASE_URL || 'https://daprintsai.live'}/${item.image}`] : [],
          metadata: {
            product_id: item.id,
            pdf_path: item.image1 || ''
          }
        },
        unit_amount: item.priceCents, // Stripe expects amount in cents
      },
      quantity: item.quantity,
    }));

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      // Stripe automatically collects the buyer's email address
      customer_email: undefined, // Let Stripe collect it via the checkout form
      line_items: stripeLineItems,
      // Store cart data in metadata so we can retrieve it after payment
      metadata: {
        order_items: JSON.stringify(lineItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          priceCents: item.priceCents,
          image1: item.image1
        })))
      },
      // Redirect URLs after payment
      success_url: `${process.env.BASE_URL || 'https://daprintsai.live'}/checkout.html?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${process.env.BASE_URL || 'https://daprintsai.live'}/checkout.html?status=cancelled`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: error.message || 'Failed to create checkout session'
    });
  }
});

/**
 * POST /api/webhook
 * 
 * Stripe Webhook handler - processes events after payment completion.
 * When a checkout.session.completed event is received:
 * 1. Retrieves the buyer's email from the Stripe session
 * 2. Gets the list of purchased pictures from session metadata
 * 3. Sends an email with the purchased PDF files to the buyer
 */
async function handleWebhook(req, res) {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful checkout completion
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await handleSuccessfulPayment(session);
  }

  res.json({ received: true });
}

/**
 * After Stripe confirms a successful charge, this function:
 * 1. Extracts the buyer's email from the Stripe session (collected during checkout)
 * 2. Parses the purchased items from session metadata
 * 3. Sends an email with the purchased picture PDF(s) as attachments
 */
async function handleSuccessfulPayment(session) {
  try {
    // Get the buyer's email address that Stripe collected during checkout
    const customerEmail = session.customer_details?.email || session.customer_email;

    if (!customerEmail) {
      console.error('No customer email found in session:', session.id);
      return;
    }

    // Parse the purchased items from the session metadata
    const orderItems = JSON.parse(session.metadata.order_items || '[]');

    if (orderItems.length === 0) {
      console.error('No order items found in session metadata:', session.id);
      return;
    }

    console.log(`Sending ${orderItems.length} purchased picture(s) to ${customerEmail}`);

    // Build email attachments - one PDF per purchased picture
    const attachments = [];
    for (const item of orderItems) {
      if (item.image1) {
        // Resolve the PDF file path relative to the project directory
        const pdfPath = path.join(__dirname, '..', item.image1);
        const fileName = path.basename(item.image1);

            if (!fs.existsSync(pdfPath)) {
                console.error('PDF file not found:', pdfPath);
                continue;
            }
        attachments.push({
          filename: fileName,
          path: pdfPath,
          contentType: fileName.endsWith('.pdf') ? 'application/pdf' : 'image/png'
        });
      }
    }

    // Build the list of purchased items for the email body
    const itemsList = orderItems.map((item) =>
      `- ${item.name} (Qty: ${item.quantity}) - $${(item.priceCents / 100).toFixed(2)} each`
    ).join('\n');

    const totalAmount = (session.amount_total / 100).toFixed(2);

    // Send the email with the purchased pictures
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'DA Prints AI <noreply@daprintsai.com>',
      to: customerEmail,
      replyTo: process.env.SMTP_USER,
      headers: { 'X-Mailer': 'DA Prints AI', 'X-Priority': '3' },
      subject: 'Your DA Prints AI Purchase - Digital Downloads',
      text: `Thank you for your purchase from DA Prints AI!\n\nOrder Summary:\n${itemsList}\n\nTotal: $${totalAmount}\n\nYour purchased digital artwork PDF(s) are attached to this email.\n\nPlease note:\n- All images are Generative AI artwork\n- All images are copyright protected\n- All images come in PDF format\n- Perfect for wallpaper, thumbnails, screensavers, or small frames (4x6 or 5x7)\n\nThank you for shopping with DA Prints AI!\n\nBest regards,\nDA Prints AI Team`,
      html: `
        <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Order Confirmation</title></head><body style="margin:0;padding:20px;background-color:#f4f4f4;"><div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Thank you for your purchase from DA Prints AI!
          </h2>
          
          <h3>Order Summary:</h3>
          <ul style="list-style: none; padding: 0;">
            ${orderItems.map(item => `
              <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                <strong>${item.name}</strong><br>
                Quantity: ${item.quantity} | Price: $${(item.priceCents / 100).toFixed(2)} each
              </li>
            `).join('')}
          </ul>
          
          <p style="font-size: 18px; font-weight: bold; color: #333;">
            Total: $${totalAmount}
          </p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Your purchased digital artwork PDF(s) are attached to this email.</strong></p>
          </div>
          
          <div style="font-size: 12px; color: #666; margin-top: 20px;">
            <p>Please note:</p>
            <ul>
              <li>All images are Generative AI artwork</li>
              <li>All images are copyright protected</li>
              <li>All images come in PDF format</li>
              <li>Perfect for wallpaper, thumbnails, screensavers, or small frames (4x6 or 5x7)</li>
            </ul>
          </div>
          
          <p style="color: #333; margin-top: 20px;">
            Thank you for shopping with DA Prints AI!<br>
            <em>DA Prints AI Team</em>
          </p>
        </div>
</body></html>
      `,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);
    console.log(`Successfully sent ${attachments.length} picture(s) to ${customerEmail} for session ${session.id}`);

  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

/**
 * GET /api/session-status
 * 
 * Allows the frontend to check the status of a completed checkout session
 * and display a success message with the buyer's email.
 */
app.get('/api/session-status', async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({ error: 'Missing session_id parameter' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      status: session.payment_status,
      customerEmail: session.customer_details?.email || session.customer_email,
      amountTotal: session.amount_total,
      orderItems: JSON.parse(session.metadata?.order_items || '[]')
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: 'Failed to retrieve session status' });
  }
});



// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DA Prints AI server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/amazon.html to view the store`);
});
