import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useClient, useClients } from '../hooks/useClients'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit, Calendar, FileText, Camera, Loader2, History } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClientForm } from '../components/ClientForm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
// Importaciones de Galería
import { GalleryCarousel } from '@/features/gallery/components/GalleryCarousel'
import { PhotoUploader } from '@/features/gallery/components/PhotoUploader'
import { useGallery } from '@/features/gallery/hooks/useGallery'
import { ClientSubmissions } from '../components/ClientSubmissions'

// Importaciones de Citas
import { useAppointments } from '@/features/appointments/hooks/useAppointments'
import { AppointmentForm } from '@/features/appointments/components/AppointmentForm'
import { AppointmentCard } from '@/features/appointments/components/AppointmentCard'
import { toast } from 'sonner'

export const ClientDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)
  
  const { data: client, isLoading } = useClient(id!)
  const { updateClient, isUpdating } = useClients()
  // Hook de Galería para cargar las fotos del cliente
  const { data: galleryItems = [], isLoading: isLoadingGallery } = useGallery(id!)
  
  // Hook de Citas
  const { 
    appointments, 
    createAppointment, 
    isCreating, 
    updateAppointment, 
    deleteAppointment 
  } = useAppointments(id);

  const clientAppointments = appointments.filter(a => a.client_id === id);
  const upcomingAppointments = clientAppointments
    .filter(a => new Date(a.scheduled_at) > new Date() && a.status !== "cancelled")
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const handleUpdate = async (data: any) => {
    try {
      await updateClient({ id: id!, data })
      setIsEditing(false)
    } catch (error) {
      // Error handled in hook via toast
    }
  }

  const handleCreateAppointment = async (values: any) => {
    try {
      await createAppointment(values);
      setIsScheduling(false);
      toast.success("Cita programada exitosamente");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Cliente no encontrado</h2>
        <Button onClick={() => navigate('/clients')}>Volver al listado</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-10">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/clients')}
          className="rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Detalle de Cliente</h1>
          <p className="text-muted-foreground text-sm">Gestiona la información y el historial del tratamiento.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Perfil del Cliente */}
        <Card className="lg:col-span-1 shadow-lg border-primary/5 rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-col items-center gap-4 pb-8 pt-10 bg-muted/20 border-b">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-primary/20">
              <AvatarImage src={client.avatar_url || undefined} alt={client.full_name} className="object-cover" />
              <AvatarFallback className="text-4xl font-black bg-primary/10 text-primary">
                {client.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <CardTitle className="text-2xl font-bold">{client.full_name}</CardTitle>
              <Badge variant="secondary" className="mt-2 font-medium">
                Cliente desde {new Date(client.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </Badge>
            </div>
            <div className="flex gap-2 w-full mt-4 px-4">
              <Button 
                variant="outline" 
                className="flex-1 gap-2 rounded-xl h-11 border-primary/20 hover:bg-primary/5"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
                Editar Perfil
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Información de Contacto</p>
              <div className="grid gap-4">
                <div className="bg-muted/30 p-3 rounded-xl border border-primary/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Teléfono</p>
                  <p className="font-semibold text-foreground">{client.phone || '—'}</p>
                </div>
                <div className="bg-muted/30 p-3 rounded-xl border border-primary/5">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                  <p className="font-semibold text-primary truncate">{client.email || '—'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Observaciones Técnicas</p>
              <div className="p-4 bg-muted/20 rounded-xl min-h-[100px] text-sm text-balance">
                {client.notes ? (
                  <p className="leading-relaxed">{client.notes}</p>
                ) : (
                  <p className="italic text-muted-foreground">Sin observaciones registradas.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Secciones de Actividad */}
        <div className="lg:col-span-2 space-y-8">
          {/* Botones de Acción Rápida */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              className="hover:scale-[1.03] cursor-pointer transition-all shadow-md group border-blue-100 dark:border-blue-900/30 overflow-hidden"
              onClick={() => navigate(`/clients/${client.id}/forms`)}
            >
              <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <p className="font-black uppercase text-[10px] tracking-widest text-blue-700/70 mb-1">Consentimientos</p>
                  <p className="text-sm font-semibold">Fichas y Firmas</p>
                </div>
              </CardContent>
            </Card>

            {/* Modal para Subir Fotos */}
            <Dialog open={isUploading} onOpenChange={setIsUploading}>
              <DialogTrigger asChild>
                <Card className="hover:scale-[1.03] cursor-pointer transition-all shadow-md group border-pink-100 dark:border-pink-900/30 overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                    <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 group-hover:scale-110 transition-transform">
                      <Camera className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-black uppercase text-[10px] tracking-widest text-pink-700/70 mb-1">Nueva Sesión</p>
                      <p className="text-sm font-semibold">Cargar Galería</p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto rounded-3xl p-8">
                <DialogHeader className="mb-6">
                  <div className="p-3 bg-pink-50 dark:bg-pink-900/20 text-pink-600 rounded-2xl w-fit mb-4">
                    <Camera className="h-6 w-6" />
                  </div>
                  <DialogTitle className="text-3xl font-black tracking-tighter">Historial Fotográfico</DialogTitle>
                  <DialogDescription className="text-base text-balance">
                    Captura el progreso subiendo las imágenes antes y después del tratamiento.
                  </DialogDescription>
                </DialogHeader>
                <PhotoUploader clientId={id!} onSuccess={() => setIsUploading(false)} />
              </DialogContent>
            </Dialog>

            {/* Programar Cita */}
            <Dialog open={isScheduling} onOpenChange={setIsScheduling}>
              <DialogTrigger asChild>
                <Card className="hover:scale-[1.03] cursor-pointer transition-all shadow-md group border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
                  <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="font-black uppercase text-[10px] tracking-widest text-emerald-700/70 mb-1">Citas</p>
                      <p className="text-sm font-semibold text-emerald-700/70">Programar Nueva</p>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-3xl p-8">
                <DialogHeader className="mb-6">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl w-fit mb-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <DialogTitle className="text-3xl font-black tracking-tighter">Programar Cita</DialogTitle>
                  <DialogDescription className="text-base text-balance">
                    Define la fecha y el servicio para la próxima sesión de {client.full_name}.
                  </DialogDescription>
                </DialogHeader>
                <AppointmentForm 
                  clientId={id}
                  isSubmitting={isCreating}
                  onSubmit={handleCreateAppointment}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Galería de Comparativas (Swiper Implementation) */}
          <section className="space-y-6 pt-2">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <History className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black tracking-tight">Galería de Resultados</h2>
              </div>
              <Badge variant="outline" className="px-5 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                {galleryItems.length} {galleryItems.length === 1 ? 'Sesión' : 'Sesiones'}
              </Badge>
            </div>
            
            {isLoadingGallery ? (
              <Card className="h-80 flex items-center justify-center border-none bg-muted/10 animate-pulse rounded-3xl">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Cargando Multimedia...</p>
                </div>
              </Card>
            ) : (
              <div className="px-1 py-1">
                <GalleryCarousel items={galleryItems} />
              </div>
            )}
          </section>

          {/* Citas / Próximos Pasos */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black tracking-tight">Próximas Citas</h2>
              </div>
              {upcomingAppointments.length > 0 && (
                <Badge variant="outline" className="px-5 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest">
                  {upcomingAppointments.length} Programada{upcomingAppointments.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            
            {upcomingAppointments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingAppointments.map(appointment => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusChange={(statusId, newStatus) => updateAppointment({ id: statusId, data: { status: newStatus } })}
                    onDelete={(delId) => deleteAppointment(delId)}
                  />
                ))}
              </div>
            ) : (
              <Card className="h-32 border-dashed flex items-center justify-center text-center p-6 bg-muted/10 rounded-3xl border-2 border-primary/10">
                <div className="flex flex-col items-center gap-1">
                  <p className="font-extrabold text-foreground tracking-tight">Sin citas pendientes</p>
                  <Button variant="link" onClick={() => setIsScheduling(true)} className="h-auto p-0 font-bold text-primary">
                    Programar una ahora
                  </Button>
                </div>
              </Card>
            )}
          </section>

          {/* Historial de Fichas Firmadas */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-black tracking-tight">Historial de Fichas</h2>
              </div>
            </div>
            
            <ClientSubmissions clientId={id!} />
          </section>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-3xl font-black tracking-tighter">Editar Perfil</DialogTitle>
            <DialogDescription className="text-base text-balance italic">
              Actualiza los datos personales o de contacto de la clienta.
            </DialogDescription>
          </DialogHeader>
          <ClientForm 
            initialData={client} 
            onSubmit={handleUpdate} 
            isSubmitting={isUpdating} 
            onCancel={() => setIsEditing(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
