import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { plan, userId, email } = req.body

  if (!plan || !userId) {
    return res.status(400).json({ error: 'Missing plan or userId' })
  }

  const isMonthly = plan === 'monthly'
  const priceId = isMonthly
    ? process.env.STRIPE_MONTHLY_PRICE_ID
    : process.env.STRIPE_LIFETIME_PRICE_ID

  const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173'

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isMonthly ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${appUrl}/success`,
      cancel_url: appUrl,
      metadata: { userId },
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return res.status(500).json({ error: err.message })
  }
}
