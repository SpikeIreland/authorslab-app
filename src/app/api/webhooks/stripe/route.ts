import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
})

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin access
)

export async function POST(req: NextRequest) {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        const authorId = session.client_reference_id || session.metadata?.author_id
        const manuscriptId = session.metadata?.manuscript_id
        const packageType = session.metadata?.package

        console.log(`✅ Payment successful - Author: ${authorId}, Package: ${packageType}`)

        // Handle THREE-PHASE PACKAGE (Phases 1-3 access)
        if (packageType === 'three-phase' && authorId) {
            // Create subscription record to grant access
            const { data: subscription, error: subError } = await supabase
                .from('subscriptions')
                .insert({
                    author_id: authorId,
                    plan_type: 'pay_per_manuscript',
                    status: 'active',
                    manuscripts_allowed: 1,
                    manuscripts_used: 0,
                    stripe_customer_id: session.customer as string,
                    current_period_start: new Date().toISOString(),
                    current_period_end: null // One-time payment, no expiration
                })
                .select()
                .single()

            if (subError) {
                console.error('❌ Failed to create subscription:', subError)
            } else {
                console.log('✅ Created subscription for three-phase package:', subscription.id)
            }

            // Optional: Record the payment
            await supabase.from('payments').insert({
                author_id: authorId,
                subscription_id: subscription?.id,
                amount_cents: 29900, // $299
                currency: 'usd',
                payment_type: 'one_time',
                stripe_payment_intent_id: session.payment_intent as string,
                status: 'succeeded',
                succeeded_at: new Date().toISOString()
            })

            console.log('✅ Three-phase package activated for author:', authorId)
        }

        // Handle PHASE 4 (Publishing) - existing logic
        if ((packageType === 'publishing' || packageType === 'complete') && manuscriptId) {
            await supabase
                .from('editing_phases')
                .update({
                    phase_status: 'active',
                    started_at: new Date().toISOString()
                })
                .eq('manuscript_id', manuscriptId)
                .eq('phase_number', 4)

            console.log('✅ Activated Phase 4 (Publishing) for manuscript:', manuscriptId)
        }

        // Handle PHASE 5 (Marketing) - existing logic
        if ((packageType === 'marketing' || packageType === 'complete') && manuscriptId) {
            await supabase
                .from('editing_phases')
                .update({
                    phase_status: 'active',
                    started_at: new Date().toISOString()
                })
                .eq('manuscript_id', manuscriptId)
                .eq('phase_number', 5)

            console.log('✅ Activated Phase 5 (Marketing) for manuscript:', manuscriptId)
        }
    }

    return NextResponse.json({ received: true })
}