const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { lineItems } = req.body;
    if (!lineItems || lineItems.length === 0) return res.status(400).json({ error: 'Cart is empty' });
    const baseUrl = process.env.BASE_URL || 'https://daprintsai.live';
    const stripeLineItems = lineItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [baseUrl + '/' + item.image] : [],
        },
        unit_amount: item.priceCents,
      },
      quantity: item.quantity,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: stripeLineItems,
      success_url: baseUrl + '/checkout.html?session_id={CHECKOUT_SESSION_ID}&status=success',
      cancel_url: baseUrl + '/checkout.html?status=cancelled',
    });
    res.status(200).json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
  }
};