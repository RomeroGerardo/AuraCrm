import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEFAULT_FALLBACK_DOLLAR_RATE = 1510;

const PLAN_USD_PRICES: Record<string, { priceUsd: number; name: string }> = {
  pro: { priceUsd: 39, name: 'Plan Pro - Aura CRM' },
  full: { priceUsd: 59, name: 'Plan Full - Aura CRM' },
};

async function getDollarRate(): Promise<number> {
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/oficial', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data.venta || data.compra);
      if (rate && !isNaN(rate) && rate > 0) {
        return rate;
      }
    }
  } catch (err) {
    console.warn('DolarAPI fetch failed in create-checkout, trying backup...', err);
  }

  try {
    const res = await fetch('https://api.bluelytics.com.ar/v2/latest', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      const rate = Number(data?.oficial?.value_sell || data?.oficial?.value_avg);
      if (rate && !isNaN(rate) && rate > 0) {
        return rate;
      }
    }
  } catch (err) {
    console.warn('Bluelytics fetch failed in create-checkout...', err);
  }

  return DEFAULT_FALLBACK_DOLLAR_RATE;
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

    const { planId, exchangeRate: clientRate } = await req.json()
    
    const planConfig = PLAN_USD_PRICES[planId];
    if (!planConfig) {
      throw new Error('Invalid plan ID');
    }

    // Determine exchange rate: use clientRate if valid or fetch server-side
    let dollarRate = DEFAULT_FALLBACK_DOLLAR_RATE;
    if (typeof clientRate === 'number' && clientRate > 500 && clientRate < 10000) {
      dollarRate = clientRate;
    } else {
      dollarRate = await getDollarRate();
    }

    const amount = Math.round(planConfig.priceUsd * dollarRate);
    const planName = planConfig.name;

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
        back_url: "https://aura-crm-rosy.vercel.app/settings"
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
