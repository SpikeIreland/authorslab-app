import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
})

export async function POST(req: Request) {
    try {
        const { authorId } = await req.json()

        if (!authorId) {
            return NextResponse.json({ error: 'Missing author ID' }, { status: 400 })
        }

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: '3-Phase Editing Package',
                            description: 'Professional AI editing with Alex, Sam, and Jordan',
                        },
                        unit_amount: 29900, // $299.00 in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing`,
            client_reference_id: authorId, // Store author ID for webhook
            metadata: {
                author_id: authorId,
                package_type: 'three-phase'
            }
        })

        return NextResponse.json({ url: session.url })

    } catch (error) {
        console.error('Checkout error:', error)
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}