import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

serve(async (req) => {
  try {
    const body = await req.json()
    console.log("Webhook received:", body)

    // MercadoPago can send 'type' or 'topic' depending on the configuration
    const topic = body.type || body.topic
    
    if (topic === 'subscription_preapproval' || topic === 'preapproval') {
      const subscriptionId = body.data?.id
      if (!subscriptionId) throw new Error('No subscription ID in webhook')

      const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
      
      // Fetch the full subscription details from MercadoPago
      const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
        headers: {
          'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
        }
      })
      
      if (!mpResponse.ok) {
        throw new Error('Failed to fetch subscription details from MP')
      }

      const subscription = await mpResponse.json()
      console.log("Subscription details:", subscription)

      // external_reference holds our Supabase user.id
      const userId = subscription.external_reference
      if (!userId) {
        console.log("No external_reference found in subscription")
        return new Response('Ok', { status: 200 })
      }

      // Check status of subscription
      const status = subscription.status // 'authorized', 'paused', 'cancelled'
      let planType = 'free'
      let dbStatus = 'trialing'

      if (status === 'authorized') {
        dbStatus = 'active'
        // Determine plan by reason or amount
        if (subscription.reason.includes('Pro')) planType = 'pro'
        if (subscription.reason.includes('Full')) planType = 'full'
      } else if (status === 'cancelled') {
        dbStatus = 'canceled'
      }

      // Update the user's profile in Supabase using the Service Role Key (bypasses RLS)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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
        console.error("Error updating profile:", error)
        throw error
      }
      
      console.log(`Updated user ${userId} to plan ${planType} with status ${dbStatus}`)
    }

    return new Response(JSON.stringify({ received: true }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error("Webhook error:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
