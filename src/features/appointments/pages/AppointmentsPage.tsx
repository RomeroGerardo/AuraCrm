import { useState } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { format, isAfter, isBefore, startOfToday } from "date-fns";
import { useAppointments } from "../hooks/useAppointments";
import { AppointmentCard } from "../components/AppointmentCard";
import { AppointmentForm } from "../components/AppointmentForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const AppointmentsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    appointments, 
    isLoading, 
    createAppointment, 
    updateAppointment, 
    deleteAppointment, 
    isCreating 
  } = useAppointments();

  const today = startOfToday();

  // Filtrar citas próximas (hoy o en el futuro, no completadas ni canceladas)
  const upcomingAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.scheduled_at);
    return (
      (isAfter(apptDate, today) || format(apptDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) &&
      appt.status !== 'completed' && 
      appt.status !== 'cancelled'
    );
  });

  // Filtrar historial (pasadas, completadas o canceladas)
  const pastAppointments = appointments.filter((appt) => {
    const apptDate = new Date(appt.scheduled_at);
    return (
      isBefore(apptDate, today) || 
      appt.status === 'completed' || 
      appt.status === 'cancelled'
    );
  }).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const handleCreate = async (values: any) => {
    try {
      await createAppointment(values);
      setIsOpen(false);
    } catch (error) {
      // Error handled by hook toast
    }
  };

  const handleStatusChange = async (id: string, status: any) => {
    await updateAppointment({ id, data: { status } });
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(id);
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Citas</h1>
          <p className="text-muted-foreground">
            Organiza tus tratamientos y recordatorios.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto shadow-sm">
              <Plus className="mr-2 h-4 w-4" /> Nueva Cita
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Programar Nueva Cita</DialogTitle>
              <DialogDescription>
                Completa los datos para agendar un nuevo servicio.
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              <AppointmentForm 
                onSubmit={handleCreate} 
                isSubmitting={isCreating} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="upcoming" className="relative">
            Próximas
            {upcomingAppointments.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full">
                {upcomingAppointments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingAppointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-accent/5 border border-dashed rounded-xl space-y-3">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/30" />
              <div className="text-center">
                <p className="text-lg font-medium">No hay citas próximas</p>
                <p className="text-sm text-muted-foreground">¡Parece que tienes tiempo libre!</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {isLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
              ))}
             </div>
          ) : pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-90">
              {pastAppointments.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appointment={appt}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground bg-accent/5 rounded-xl">
              No hay historial de citas registrado.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
