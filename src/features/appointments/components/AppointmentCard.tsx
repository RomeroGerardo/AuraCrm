import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, MoreVertical, Trash2, User } from "lucide-react";
import type { Appointment } from "../types/appointment.types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppointmentCardProps {
  appointment: Appointment;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Appointment["status"]) => void;
}

const statusColors = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100/80",
  cancelled: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100/80",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80",
};

const statusLabels: Record<Appointment["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
};

export const AppointmentCard = ({
  appointment,
  onDelete,
  onStatusChange,
}: AppointmentCardProps) => {
  const scheduledDate = new Date(appointment.scheduled_at);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0 bg-accent/5">
        <div className="space-y-1">
          <Badge variant="outline" className={statusColors[appointment.status]}>
            {statusLabels[appointment.status]}
          </Badge>
          <h3 className="font-semibold text-lg leading-tight pt-1">
            {appointment.service}
          </h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent/10">
                <MoreVertical className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange(appointment.id, "confirmed")}>
              Confirmar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(appointment.id, "completed")}>
              Marcar Completada
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(appointment.id, "cancelled")} className="text-destructive">
              Cancelar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                if (confirm("¿Estás seguro de eliminar esta cita?")) {
                  onDelete(appointment.id);
                }
              }} 
              className="text-destructive font-semibold"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-4 space-y-2.5">
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 text-primary">
            <User className="h-4 w-4" />
          </div>
          <span className="font-medium text-foreground truncate">
            {appointment.client?.full_name || "Cliente"}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="flex items-center text-xs text-muted-foreground bg-accent/30 p-2 rounded-md">
            <Calendar className="mr-2 h-3.5 w-3.5 text-primary" />
            <span className="capitalize">{format(scheduledDate, "EEE d 'de' MMM", { locale: es })}</span>
          </div>
          <div className="flex items-center text-xs text-muted-foreground bg-accent/30 p-2 rounded-md">
            <Clock className="mr-2 h-3.5 w-3.5 text-primary" />
            <span>{format(scheduledDate, "HH:mm 'hs'")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
