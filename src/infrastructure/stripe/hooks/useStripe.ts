import { type Stripe, loadStripe } from '@stripe/stripe-js'
import { useEffect, useState } from 'react'

export function useStripe() {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stripePromise = async () => {
      const instance = await loadStripe(process.env.STRIPE_SECRET_PUB_KEY as string)
      setStripe(instance)
    }
    stripePromise()
  }, [])

  async function createPaymentCheckout(checkoutData: any) {
    if (!stripe) return
    try {
      const response = await await fetch('/api/stripe/create-pay-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })
      const data = await response.json()
      await stripe.redirectToCheckout({ sessionId: data.id })
    } catch (error) {
      throw new Error('Error creating checkout session')
    }
  }

  async function createPaymentSubscriptionCheckout(checkoutData: any) {
    if (!stripe) return
    try {
      const response = await fetch('/api/stripe/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })
      const data = await response.json()
      await stripe.redirectToCheckout({ sessionId: data.id })
    } catch (error) {
      throw new Error('Error creating subscription checkout session')
    }
  }

  async function createPaymentPortal(checkoutData: any) {
    if (!stripe) return
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      })
      const data = await response.json()
      window.location.href = data.url
    } catch (error) {
      throw new Error('Error creating portal session')
    }
  }
  return { createPaymentCheckout, createPaymentSubscriptionCheckout, createPaymentPortal }
}
