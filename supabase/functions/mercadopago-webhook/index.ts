import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  try {
    const url = new URL(req.url)
    let body: any = {}
    try {
      body = await req.json()
    } catch (_) {}

    console.log("Webhook SearchParams:", url.search)
    console.log("Webhook body:", JSON.stringify(body))

    // MercadoPago can send data in query params (IPN) or in body (Webhooks)
    const topic = body.type || body.topic || body.action || url.searchParams.get('topic') || url.searchParams.get('type')
    const subscriptionId = body.data?.id || url.searchParams.get('data.id') || url.searchParams.get('id')

    if (
      topic === 'subscription_preapproval' || 
      topic === 'preapproval' || 
      topic === 'subscription_authorized_payment' ||
      (typeof topic === 'string' && (topic.includes('subscription') || topic.includes('preapproval')))
    ) {
      if (!subscriptionId) {
        console.log('No subscription ID in webhook payload')
        return new Response(JSON.stringify({ received: true, note: 'no id' }), { status: 200 })
      }

      const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
      
      // Fetch the full subscription details from MercadoPago
      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
        }
      })
      
      if (!mpResponse.ok) {
        console.error('Failed to fetch subscription details from MP:', await mpResponse.text())
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }

      const subscription = await mpResponse.json()
      console.log("Subscription details:", JSON.stringify(subscription))

      // external_reference holds our Supabase user.id
      const userId = subscription.external_reference
      if (!userId) {
        console.log("No external_reference found in subscription")
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }

      // Check status of subscription
      const status = subscription.status // 'authorized', 'paused', 'cancelled', 'pending'
      let planType = 'free'
      let dbStatus = 'trialing'

      if (status === 'authorized') {
        dbStatus = 'active'
        const reason = subscription.reason || ''
        const amount = subscription.auto_recurring?.transaction_amount || 0
        if (reason.includes('Full') || amount >= 50000) {
          planType = 'full'
        } else {
          planType = 'pro'
        }
      } else if (status === 'cancelled') {
        dbStatus = 'canceled'
        planType = 'free'
      }

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )

      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          plan_type: planType,
          subscription_status: dbStatus,
          mercadopago_subscription_id: subscriptionId
        })
        .eq('id', userId)

      if (error) {
        console.error("Error updating profile in Supabase:", error)
        throw error
      }
      
      console.log(`Updated user ${userId} to plan ${planType} with status ${dbStatus}`)
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    })

  } catch (error: any) {
    console.error("Webhook processing error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 200 })
  }
})
