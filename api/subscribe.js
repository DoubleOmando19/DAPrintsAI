/**
 * Vercel Serverless: /api/subscribe
 * Saves subscriber to JSON database + sends welcome email via Brevo SMTP
 */
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'subscribers.json');

function loadSubscribers() {
  try {
    const data = fs.readFileSync(SUBSCRIBERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveSubscribers(list) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2), 'utf8');
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { email, tag, gift } = req.body;
    if (!email || !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email required.' });
    }

    // 1. Save to JSON database
    const subscribers = loadSubscribers();
    const exists = subscribers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (!exists) {
      subscribers.push({
        email: email.toLowerCase(),
        tag: tag || 'general',
        gift: gift || '',
        subscribedAt: new Date().toISOString(),
        source: 'chatbot'
      });
      saveSubscribers(subscribers);
      console.log('New subscriber saved:', email, 'tag:', tag);
    } else {
      if (tag && !exists.tag.includes(tag)) {
        exists.tag = exists.tag + ',' + tag;
        exists.updatedAt = new Date().toISOString();
        saveSubscribers(subscribers);
      }
    }

    // 2. Send welcome email via Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    let subject = 'Welcome to DA Prints AI!';
    let body = '<h2>Welcome to DA Prints AI!</h2><p>Thank you for subscribing.</p>';
    let emailAttachments = [];

    if (tag === 'free-wallpapers') {
      subject = 'Your Free Wallpaper from DA Prints AI!';
      body = '<h2>Your Free Wallpaper Is Here!</h2><p>Thank you for joining! Here is your free digital wallpaper.</p><p>Visit <a href="https://daprintsai.live">daprintsai.live</a> to browse our full collection.</p>';
        emailAttachments.push({ filename: "R1 AI Artwork - The Eagle.pdf", path: path.join(process.cwd(), "images", "New Project picz PDF", "Eagle.pdf"), contentType: "application/pdf" });
    } else if (tag === 'discount-15') {
      subject = 'Your 15% Discount Code from DA Prints AI!';
      body = '<h2>Your Exclusive Discount!</h2><p>Use code <strong>DAPRINTS15</strong> at checkout for 15% off your first order.</p><p>Shop now at <a href="https://daprintsai.live">daprintsai.live</a></p>';
    } else if (tag === 'newsletter') {
      subject = 'Welcome to the DA Prints AI Artist Tips Newsletter!';
      body = '<h2>Welcome, Art Lover!</h2><p>You are now subscribed to our weekly artist tips newsletter.</p>';
    } else if (tag === 'giveaway') {
      subject = 'You are entered in the DA Prints AI Giveaway!';
      body = '<h2>Giveaway Entry Confirmed!</h2><p>You are now entered to win exclusive digital artwork.</p>';
    } else if (tag === 'community') {
      subject = 'Welcome to the DA Prints AI Community!';
      body = '<h2>Welcome to Our Community!</h2><p>Connect with fellow digital art enthusiasts.</p>';
    }

    body += '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;"><tr><td width="25%" height="8" style="background-color:#1a73e8;"></td><td width="25%" height="8" style="background-color:#4ecdc4;"></td><td width="25%" height="8" style="background-color:#e94560;"></td><td width="25%" height="8" style="background-color:#1a73e8;"></td></tr></table>';
    body += '<br><hr><p style="font-size:12px;color:#888;">DA Prints AI | <a href="https://daprintsai.live">daprintsai.live</a></p>';

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'DA Prints AI <noreply@daprintsai.live>',
      to: email,
      subject: subject,
      html: body,
        attachments: emailAttachments
    });

    return res.status(200).json({ success: true, message: 'Subscribed! Check your email.' });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ success: false, message: 'Failed to subscribe. Try again later.' });
  }
};
