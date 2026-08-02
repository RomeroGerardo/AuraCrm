import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get the user making the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'Invalid session'}`)

    const { planId } = await req.json()
    
    // Map plans to ARS amounts (assuming $1 USD = 1000 ARS for this test)
    let amount = 0
    let planName = ''
    if (planId === 'pro') {
      amount = 39000
      planName = 'Plan Pro - Aura CRM'
    } else if (planId === 'full') {
      amount = 59000
      planName = 'Plan Full - Aura CRM'
    } else {
      throw new Error('Invalid plan ID')
    }

    const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN not found')

    // Create a Preapproval (Subscription) in MercadoPago
    const mpResponse = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: planName,
        external_reference: user.id,
        payer_email: user.email,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: amount,
          currency_id: "ARS"
        },
        back_url: "https://auracrm.app/settings"
      })
    })

    const mpData = await mpResponse.json()
    console.log("MercadoPago Status:", mpResponse.status)
    console.log("MercadoPago Response:", JSON.stringify(mpData))

    if (!mpResponse.ok) {
      const errorMsg = mpData.message || mpData.error || JSON.stringify(mpData);
      throw new Error(`MercadoPago error: ${errorMsg}`)
    }

    // mpData.init_point contains the checkout URL
    return new Response(
      JSON.stringify({ init_point: mpData.init_point }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error("Create Checkout Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
