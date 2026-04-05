import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Edge Function: send-reminders
 * Fase 2 — Aura CRM by RomeroLabs
 *
 * Busca citas en las próximas 24 horas con reminder_sent = false,
 * envía un mensaje de WhatsApp via Twilio Sandbox pidiendo confirmación (Sí/No)
 * y actualiza reminder_sent = true.
 *
 * Invocada por pg_cron cada hora.
 * verify_jwt: false — el cron la invoca sin token de usuario.
 *
 * Variables de entorno requeridas (Supabase Secrets):
 *   TWILIO_ACCOUNT_SID     — SID de tu cuenta Twilio
 *   TWILIO_AUTH_TOKEN      — Auth Token de Twilio
 *   TWILIO_WHATSAPP_FROM   — Número Twilio Sandbox, ej: whatsapp:+14155238886
 */

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM") ?? "whatsapp:+14155238886";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface AppointmentRow {
  id: string;
  service: string;
  scheduled_at: string;
  client: {
    full_name: string;
    phone: string;
  };
}

async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

  const formData = new URLSearchParams();
  formData.append("From", TWILIO_WHATSAPP_FROM);
  formData.append("To", `whatsapp:${to}`);
  formData.append("Body", body);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    return { success: false, error: data.message ?? "Twilio error" };
  }

  return { success: true, sid: data.sid };
}

Deno.serve(async (_req: Request) => {
  // Inicializar Supabase con Service Role para omitir RLS
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Buscar citas en las próximas 24 h con reminder_sent = false y status pending
  const { data: appointments, error: fetchError } = await supabase
    .from("appointments")
    .select(`
      id,
      service,
      scheduled_at,
      client:clients ( full_name, phone )
    `)
    .eq("reminder_sent", false)
    .eq("status", "pending")
    .gte("scheduled_at", now.toISOString())
    .lte("scheduled_at", in24h.toISOString());

  if (fetchError) {
    console.error("[send-reminders] Error al buscar citas:", fetchError);
    return new Response(
      JSON.stringify({ error: fetchError.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!appointments || appointments.length === 0) {
    console.log("[send-reminders] No hay citas pendientes de recordatorio.");
    return new Response(
      JSON.stringify({ sent: 0, message: "No hay citas pendientes" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const results: Array<{ id: string; status: string; error?: string }> = [];

  for (const appointment of appointments as AppointmentRow[]) {
    const { client } = appointment;

    if (!client?.phone) {
      console.warn(`[send-reminders] Cita ${appointment.id}: cliente sin teléfono.`);
      results.push({ id: appointment.id, status: "skipped_no_phone" });
      continue;
    }

    // Formatear fecha de la cita en español (Argentina)
    const appointmentDate = new Date(appointment.scheduled_at);
    const dateStr = appointmentDate.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = appointmentDate.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageBody =
      `Hola ${client.full_name} 👋 Te recordamos que tienes una cita para *${appointment.service}* ` +
      `el *${dateStr}* a las *${timeStr}*.\n\n` +
      `¿Confirmas tu asistencia?\n` +
      `Responde *SI* para confirmar o *NO* para cancelar.`;

    const { success, sid, error } = await sendWhatsAppMessage(
      client.phone,
      messageBody
    );

    if (success) {
      // Marcar reminder_sent = true
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ reminder_sent: true })
        .eq("id", appointment.id);

      if (updateError) {
        console.error(
          `[send-reminders] Error actualizando cita ${appointment.id}:`,
          updateError
        );
        results.push({ id: appointment.id, status: "reminder_sent_update_failed", error: updateError.message });
      } else {
        console.log(`[send-reminders] Recordatorio enviado. SID: ${sid}, Cita: ${appointment.id}`);
        results.push({ id: appointment.id, status: "sent", error: sid });
      }
    } else {
      console.error(`[send-reminders] Error Twilio para cita ${appointment.id}: ${error}`);
      results.push({ id: appointment.id, status: "twilio_error", error });
    }
  }

  return new Response(
    JSON.stringify({ sent: results.filter((r) => r.status === "sent").length, results }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
