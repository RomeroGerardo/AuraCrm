import { z } from "zod";

export const appointmentStatusEnum = ["pending", "confirmed", "cancelled", "completed"] as const;

export const appointmentSchema = z.object({
  client_id: z.string().uuid("Seleccione un cliente válido"),
  service: z.string().min(2, "El servicio debe tener al menos 2 caracteres"),
  scheduled_at: z.string().min(1, "La fecha es requerida"),
  status: z.enum(appointmentStatusEnum),
  reminder_sent: z.boolean(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;

export interface Appointment extends AppointmentFormValues {
  id: string;
  professional_id: string;
  created_at: string;
  // Optional join with client
  client?: {
    full_name: string;
    phone: string;
  };
}

export type CreateAppointmentInput = Omit<AppointmentFormValues, "reminder_sent">;
export type UpdateAppointmentInput = Partial<AppointmentFormValues>;
