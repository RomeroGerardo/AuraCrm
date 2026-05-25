import { useNavigate } from 'react-router-dom'
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useSettings } from '@/features/settings/hooks/useSettings'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  Users,
  FileText,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  TrendingUp,
  ChevronRight,
  Sparkles,
  UserPlus,
  Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Appointment } from '@/features/appointments/types/appointment.types'

// ─── helpers ────────────────────────────────────────────────────────────────

const statusMeta: Record<
  Appointment['status'],
  { label: string; color: string; dot: string }
> = {
  pending:   { label: 'Pendiente',  color: 'text-amber-600',  dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmada', color: 'text-blue-600',   dot: 'bg-blue-500'  },
  cancelled: { label: 'Cancelada',  color: 'text-red-500',    dot: 'bg-red-400'   },
  completed: { label: 'Completada', color: 'text-emerald-600',dot: 'bg-emerald-500'},
}

function getDateLabel(iso: string) {
  const d = new Date(iso)
  if (isToday(d))    return 'Hoy'
  if (isTomorrow(d)) return 'Mañana'
  return format(d, "EEE d MMM", { locale: es })
}

// ─── sub-components ─────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  accent: string
  sub?: string
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      {/* gradient stripe */}
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <CardContent className="pt-6 pb-5 px-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
            <p className="text-4xl font-black mt-2 leading-none">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
          </div>
          <div className={`p-3 rounded-2xl ${accent} bg-opacity-10`}>
            <Icon className={`h-6 w-6 ${accent.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AppointmentRow({ appt, onClick }: { appt: Appointment; onClick: () => void }) {
  const meta = statusMeta[appt.status]
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-accent/40 transition-colors text-left group"
    >
      {/* time block */}
      <div className="w-14 shrink-0 text-center">
        <p className="text-[11px] font-bold text-muted-foreground uppercase">
          {getDateLabel(appt.scheduled_at)}
        </p>
        <p className="text-base font-black leading-tight">
          {format(new Date(appt.scheduled_at), 'HH:mm')}
        </p>
      </div>

      {/* status dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />

      {/* info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{appt.client?.full_name ?? 'Cliente'}</p>
        <p className="text-xs text-muted-foreground truncate">{appt.service}</p>
      </div>

      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </button>
  )
}

// ─── page ───────────────────────────────────────────────────────────────────

export const DashboardPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile } = useSettings()
  const { data: stats, isLoading, isError } = useDashboardStats()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return '¡Buenos días'
    if (h < 19) return '¡Buenas tardes'
    return '¡Buenas noches'
  }

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    user?.user_metadata?.full_name?.split(' ')[0] ||
    'Profesional'

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !stats) {
    return (
      <div className="p-8 text-center text-destructive">
        Error al cargar el panel. Por favor, recarga la página.
      </div>
    )
  }

  const todayCount = stats.todayAppointments.length

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* ── Greeting header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-widest">
              Panel de Control
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            {greeting()}, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}
            {todayCount > 0 && (
              <span className="ml-2 text-primary font-semibold">
                · {todayCount} {todayCount === 1 ? 'cita hoy' : 'citas hoy'}
              </span>
            )}
          </p>
        </div>

        <Button
          onClick={() => navigate('/appointments')}
          className="gap-2 md:self-end shadow-md shadow-primary/20 w-full md:w-auto"
        >
          <Calendar className="h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Clientes"
          value={stats.totalClients}
          icon={Users}
          accent="bg-violet-500"
          sub="En tu base de datos"
        />
        <StatCard
          title="Citas Pendientes"
          value={stats.pendingAppointments}
          icon={Clock}
          accent="bg-amber-500"
          sub="Esperando confirmación"
        />
        <StatCard
          title="Confirmadas"
          value={stats.confirmedAppointments}
          icon={CheckCircle2}
          accent="bg-blue-500"
          sub="Listas para atender"
        />
        <StatCard
          title="Completadas"
          value={stats.completedThisMonth}
          icon={TrendingUp}
          accent="bg-emerald-500"
          sub="Este mes"
        />
      </div>

      {/* ── Two-column section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Citas de hoy + próximas (3 cols) */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold">
                Citas próximas
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary gap-1 h-8"
              onClick={() => navigate('/appointments')}
            >
              Ver todas <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {stats.upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-accent/5 rounded-xl border border-dashed gap-3">
                <Calendar className="h-10 w-10 text-muted-foreground/30" />
                <div className="text-center">
                  <p className="font-semibold">Sin citas en los próximos 7 días</p>
                  <p className="text-sm text-muted-foreground">¡Aprovecha para programar nuevas!</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => navigate('/appointments')}
                >
                  <Calendar className="h-4 w-4 mr-2" /> Programar cita
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {stats.upcomingAppointments.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appt={appt}
                    onClick={() => navigate('/appointments')}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* RIGHT: clientes recientes + fichas (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Clientes recientes */}
          <Card className="border-0 shadow-sm flex-1">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg font-bold">Clientes recientes</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary gap-1 h-8"
                onClick={() => navigate('/clients')}
              >
                Ver todos <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {stats.recentClients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aún no hay clientes registrados.
                </p>
              ) : (
                stats.recentClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/40 transition-colors text-left group"
                  >
                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/10">
                      <AvatarImage src={client.avatar_url ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                        {client.full_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{client.full_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {formatDistanceToNow(new Date(client.created_at), {
                          addSuffix: true,
                          locale: es,
                        })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Fichas digitales */}
          <Card className="border-0 shadow-sm">
            <CardContent className="py-5 px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Fichas firmadas</p>
                    <p className="text-xs text-muted-foreground">Consentimientos digitales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{stats.totalSubmissions}</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-primary"
                    onClick={() => navigate('/forms')}
                  >
                    Ver fichas →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* ── Quick actions ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Acciones rápidas
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Nuevo cliente',     icon: UserPlus,   path: '/clients',      color: 'hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/10' },
            { label: 'Nueva cita',        icon: Calendar,   path: '/appointments', color: 'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/10' },
            { label: 'Crear ficha',       icon: FileText,   path: '/forms',        color: 'hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10' },
            { label: 'Configuración',     icon: Sparkles,   path: '/settings',     color: 'hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/10' },
          ].map(({ label, icon: Icon, path, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 p-4 rounded-xl border bg-card transition-all text-left font-semibold text-sm ${color}`}
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
