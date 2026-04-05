import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: twilio-webhook
 * Fase 2 — Aura CRM by RomeroLabs
 *
 * Recibe los webhooks de Twilio cuando un cliente responde al mensaje de WhatsApp.
 * - Respuesta afirmativa (SI / SÍ / YES / CONFIRMO / OK) → status = 'confirmed'
 * - Respuesta negativa (NO / CANCEL / CANCELAR) → status = 'cancelled'
 *
 * El match se realiza por el número de teléfono del cliente (From).
 * verify_jwt: false — Twilio llama a este endpoint sin JWT.
 *
 * Variables de entorno requeridas (Supabase Secrets):
 *   TWILIO_AUTH_TOKEN           — Para validación de firma (opcional pero recomendado)
 *   SUPABASE_SERVICE_ROLE_KEY   — Para escribir en appointments sin RLS
 *
 * CONFIGURACIÓN EN TWILIO:
 *   En Twilio Console → WhatsApp Sandbox → When a message comes in:
 *   URL: https://obskmtyfxfwgqzzekrmy.supabase.co/functions/v1/twilio-webhook
 *   Method: POST
 */

const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Palabras clave que representan respuesta afirmativa
const POSITIVE_KEYWORDS = ["si", "sí", "yes", "confirmo", "confirmar", "ok", "claro", "dale"];
// Palabras clave que representan respuesta negativa
const NEGATIVE_KEYWORDS = ["no", "cancel", "cancelar", "cancelo", "no voy"];

function parseBody(raw: string): Record<string, string> {
  const params = new URLSearchParams(raw);
  const result: Record<string, string> = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}

/**
 * Normaliza el número de teléfono eliminando el prefijo 'whatsapp:' y espacios.
 */
function normalizePhone(raw: string): string {
  return raw.replace(/^whatsapp:/i, "").replace(/\s+/g, "").trim();
}

/**
 * Determina la intención del mensaje del cliente.
 * Retorna 'confirmed', 'cancelled', o null si no se reconoce.
 */
function parseIntent(body: string): "confirmed" | "cancelled" | null {
  const normalized = body.toLowerCase().trim();

  for (const word of POSITIVE_KEYWORDS) {
    if (normalized.includes(word)) return "confirmed";
  }
  for (const word of NEGATIVE_KEYWORDS) {
    if (normalized.includes(word)) return "cancelled";
  }
  return null;
}

Deno.serve(async (req: Request) => {
  // Solo aceptar POST
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const payload = parseBody(rawBody);

  const from = payload["From"]; // ej: whatsapp:+5491123456789
  const messageBody = payload["Body"]; // El texto que escribió el cliente

  if (!from || !messageBody) {
    console.warn("[twilio-webhook] Payload inválido: faltan 'From' o 'Body'");
    return new Response("Bad Request", { status: 400 });
  }

  const clientPhone = normalizePhone(from);
  const intent = parseIntent(messageBody);

  console.log(`[twilio-webhook] De: ${clientPhone}, Mensaje: "${messageBody}", Intent: ${intent}`);

  if (intent === null) {
    console.log("[twilio-webhook] Mensaje no reconocido. No se actualiza el estado.");
    // Responder a Twilio con TwiML vacío para evitar reintentos
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }

  // Inicializar Supabase con Service Role para omitir RLS
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Buscar la cita más próxima y pendiente con reminder_sent = true
  // (solo las que ya recibieron el recordatorio)
  const { data: appointments, error: fetchError } = await supabase
    .from("appointments")
    .select(`
      id,
      status,
      scheduled_at,
      client:clients!inner ( phone )
    `)
    .eq("status", "pending")
    .eq("reminder_sent", true)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true });

  if (fetchError) {
    console.error("[twilio-webhook] Error al buscar cita:", fetchError);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }

  // Filtrar manualmente por número de teléfono (normalizando ambos lados)
  const matchingAppointment = appointments?.find((appt: any) => {
    const storedPhone = normalizePhone(appt.client?.phone ?? "");
    return storedPhone === clientPhone;
  });

  if (!matchingAppointment) {
    console.warn(`[twilio-webhook] No se encontró cita pendiente para: ${clientPhone}`);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      { status: 200, headers: { "Content-Type": "text/xml" } }
    );
  }

  // Actualizar el status de la cita según la intención del cliente
  const { error: updateError } = await supabase
    .from("appointments")
    .update({ status: intent })
    .eq("id", matchingAppointment.id);

  if (updateError) {
    console.error(`[twilio-webhook] Error actualizando cita ${matchingAppointment.id}:`, updateError);
  } else {
    console.log(
      `[twilio-webhook] Cita ${matchingAppointment.id} actualizada a '${intent}' por respuesta de ${clientPhone}`
    );
  }

  // Responder a Twilio con TwiML confirmando al cliente
  const replyMessage =
    intent === "confirmed"
      ? "¡Perfecto! Tu cita ha sido confirmada. ✅ ¡Te esperamos!"
      : "Entendido. Tu cita ha sido cancelada. ❌ Si deseas reprogramar, no dudes en contactarnos.";

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${replyMessage}</Message></Response>`,
    {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    }
  );
});
