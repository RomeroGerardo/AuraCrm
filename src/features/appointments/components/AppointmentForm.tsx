import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { appointmentSchema, type AppointmentFormValues } from "../types/appointment.types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useClients } from "@/features/clients/hooks/useClients";
import { useSettings } from "@/features/settings/hooks/useSettings";

interface AppointmentFormProps {
  clientId?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit: (values: AppointmentFormValues) => void;
  defaultValues?: Partial<AppointmentFormValues>;
}

export const AppointmentForm = ({
  clientId,
  submitLabel = "Programar Cita",
  isSubmitting,
  onSubmit,
  defaultValues,
}: AppointmentFormProps) => {
  const { clients, isLoading: loadingClients } = useClients();
  const { data: businessProfile } = useSettings();
  const services = businessProfile?.services || [];

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      client_id: clientId || defaultValues?.client_id || "",
      service: defaultValues?.service || "",
      scheduled_at: defaultValues?.scheduled_at || new Date().toISOString(),
      status: defaultValues?.status || "pending",
      reminder_sent: defaultValues?.reminder_sent || false,
    },
  });

  const scheduledAtValue = form.watch("scheduled_at");
  const selectedDate = scheduledAtValue ? new Date(scheduledAtValue) : new Date();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!clientId && (
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={loadingClients}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-10 bg-muted/20 border-primary/10 rounded-xl">
                      <SelectValue placeholder="Seleccione un cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servicio / Tratamiento</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full h-12 bg-muted/20 border-primary/10 rounded-xl">
                    <SelectValue placeholder="Seleccione un servicio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {services.length > 0 ? (
                    services.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        <div className="flex flex-col">
                          <span className="font-semibold">{s.name}</span>
                          {s.price && <span className="text-[10px] text-muted-foreground">{s.price}€</span>}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-center text-muted-foreground">
                      No hay servicios configurados.
                    </div>
                  )}
                  <Separator className="my-1" />
                  {/* Permitir escribir uno nuevo si no está en la lista o simplemente fallbacks */}
                  {!services.some(s => s.name === field.value) && field.value && (
                    <SelectItem value={field.value}>{field.value}</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduled_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha</FormLabel>
                <Popover modal={false}>
                  <PopoverTrigger
                    render={
                      <Button
                        type="button"
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: es })
                        ) : (
                          <span>Seleccione una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(field.value)}
                      onSelect={(date) => {
                        if (date) {
                          const currentDateTime = new Date(field.value);
                          date.setHours(currentDateTime.getHours());
                          date.setMinutes(currentDateTime.getMinutes());
                          field.onChange(date.toISOString());
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem className="flex flex-col">
            <FormLabel>Hora</FormLabel>
            <FormControl>
              <Input
                type="time"
                value={format(selectedDate, "HH:mm")}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(":");
                  const newDate = new Date(selectedDate);
                  newDate.setHours(parseInt(hours));
                  newDate.setMinutes(parseInt(minutes));
                  form.setValue("scheduled_at", newDate.toISOString());
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full bg-muted/20 border-primary/10 rounded-xl">
                    <SelectValue placeholder="Estado de la cita" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pending" className="text-amber-600 font-bold">Pendiente</SelectItem>
                  <SelectItem value="confirmed" className="text-blue-600 font-bold">Confirmada</SelectItem>
                  <SelectItem value="cancelled" className="text-destructive font-bold">Cancelada</SelectItem>
                  <SelectItem value="completed" className="text-emerald-600 font-bold">Completada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
};
