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

        const manuscriptId = session.client_reference_id
        const packageType = session.metadata?.package

        if (!manuscriptId || !packageType) {
            console.error('Missing manuscript ID or package type')
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        console.log(`✅ Payment successful for manuscript ${manuscriptId}, package: ${packageType}`)

        // Activate Phase 4 (Publishing)
        if (packageType === 'publishing' || packageType === 'complete') {
            await supabase
                .from('editing_phases')
                .update({
                    phase_status: 'active',
                    started_at: new Date().toISOString()
                })
                .eq('manuscript_id', manuscriptId)
                .eq('phase_number', 4)

            console.log('✅ Activated Phase 4 (Publishing)')
        }

        // Activate Phase 5 (Marketing)
        if (packageType === 'marketing' || packageType === 'complete') {
            await supabase
                .from('editing_phases')
                .update({
                    phase_status: 'active',
                    started_at: new Date().toISOString()
                })
                .eq('manuscript_id', manuscriptId)
                .eq('phase_number', 5)

            console.log('✅ Activated Phase 5 (Marketing)')
        }
    }

    return NextResponse.json({ received: true })
}