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

  const appUrl = process.env.VITE_APP_URL || 'https://resume-reviewer-gqxq.vercel.app'

  const params = new URLSearchParams({
    mode: isMonthly ? 'subscription' : 'payment',
    'payment_method_types[0]': 'card',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${appUrl}/success`,
    cancel_url: appUrl,
    'metadata[userId]': userId,
  })

  if (email) params.append('customer_email', email)

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Stripe error:', data)
      return res.status(500).json({ error: data?.error?.message || 'Stripe error' })
    }

    return res.status(200).json({ url: data.url })
  } catch (err) {
    console.error('Checkout fetch error:', err)
    return res.status(500).json({ error: err.message })
  }
}
