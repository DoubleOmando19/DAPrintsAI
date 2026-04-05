const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Missing session_id' });
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json({ status: session.payment_status, customer_email: session.customer_details?.email, amount_total: session.amount_total });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve session status' });
  }
};