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

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Authenticate user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)
    if (userError || !user) throw new Error(`Unauthorized: ${userError?.message || 'Invalid session'}`)

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('mercadopago_subscription_id, plan_type')
      .eq('id', user.id)
      .single()

    if (profileError) throw new Error(`Error fetching profile: ${profileError.message}`)

    const subId = profile?.mercadopago_subscription_id
    const MP_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    // If there is an active MP subscription, cancel it in Mercado Pago API
    if (subId && MP_ACCESS_TOKEN) {
      try {
        const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${subId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'cancelled' })
        })
        console.log(`MercadoPago cancel response status: ${mpResponse.status}`)
      } catch (err) {
        console.error('Error calling MercadoPago preapproval cancel:', err)
      }
    }

    // Update profile in database back to free
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        plan_type: 'free',
        subscription_status: 'cancelled',
        mercadopago_subscription_id: null
      })
      .eq('id', user.id)

    if (updateError) throw new Error(`Error updating profile: ${updateError.message}`)

    return new Response(
      JSON.stringify({ success: true, message: 'Suscripción cancelada correctamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error('Cancel Subscription Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
