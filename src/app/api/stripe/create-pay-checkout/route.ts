import { stripe } from '@/infrastructure/stripe/stripe'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { id, userEmail } = await request.json()
  const price = process.env.STRIPE_PRODUCT_PRICE_ID

  if (!price) return NextResponse.json({ error: 'Price ID not defined' }, { status: 500 })
  if (!id) throw new Error('id is not defined')

  try {
    const response = await stripe.checkout.sessions.create({
      line_items: [{ price: price, quantity: 1 }],
      mode: 'payment',
      payment_method_types: ['card', 'boleto', 'pix'],
      success_url: `${request.headers.get('origin')}/success`,
      cancel_url: `${request.headers.get('origin')}/cancel`,
      ...(userEmail && { customer_email: userEmail }),
    })
    if (!response) throw new Error('Error creating checkout session')
    return new Response(JSON.stringify({ id: response.id }), { status: 200 })
  } catch (error) {
    return NextResponse.error()
  }
}
