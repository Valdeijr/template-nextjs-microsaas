import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KET) throw new Error('STRIPE_SECRET_KET is not defined')

export const stripe = new Stripe(process.env.STRIPE_SECRET_KET, {
  apiVersion: '2025-03-31.basil',
})
