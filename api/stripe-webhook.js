import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Vercel requires raw body for Stripe signature verification
export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const sig = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature error:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.metadata?.userId
      if (userId) {
        await supabase
          .from('profiles')
          .update({
            access_level: 'paid',
            stripe_customer_id: session.customer,
          })
          .eq('id', userId)
      }
    }

    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object
      const customerId = invoice.customer
      if (customerId) {
        await supabase
          .from('profiles')
          .update({ access_level: 'paid' })
          .eq('stripe_customer_id', customerId)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customerId = subscription.customer
      if (customerId) {
        await supabase
          .from('profiles')
          .update({ access_level: 'free' })
          .eq('stripe_customer_id', customerId)
      }
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
