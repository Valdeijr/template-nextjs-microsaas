import { auth } from '@/infrastructure/auth/providers/authProviders'
import { stripe } from '@/infrastructure/stripe/stripe'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  const userEmail = session?.user?.email

  if (!userId && !userEmail) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  const price = process.env.STRIPE_SUBSCRIPTION_PRICE_ID

  if (!price) return NextResponse.json({ error: 'Price ID not defined' }, { status: 500 })
  if (!id) throw new Error('id is not defined')

  // const customerId = await getCustomerId(userId, userEmail)

  try {
    const response = await stripe.checkout.sessions.create({
      line_items: [{ price: price, quantity: 1 }],
      mode: 'subscription',
      payment_method_types: ['card'],
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
