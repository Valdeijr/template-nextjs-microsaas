import { auth } from '@/infrastructure/auth/providers/authProviders'
import { db } from '@/infrastructure/firebase/firebase'
import { stripe } from '@/infrastructure/stripe/stripe'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const customerId = userDoc.data()?.stripeCustomerId

    if (!customerId) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get('origin')}/dashboard`,
    })

    return NextResponse.json({ url: portalSession.url }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating portal session' }, { status: 500 })
  }
}
