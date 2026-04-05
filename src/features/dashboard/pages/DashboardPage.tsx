import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboardStats } from "../hooks/useDashboardStats"
import { Users, FileText, Calendar, Loader2 } from "lucide-react"

export const DashboardPage = () => {
  const { data: stats, isLoading, isError } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-destructive">
        Error al cargar las métricas. Por favor, intenta de nuevo.
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Clientes",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "text-blue-600",
      description: "Clientes registrados en el sistema"
    },
    {
      title: "Fichas Completadas",
      value: stats?.totalSubmissions ?? 0,
      icon: FileText,
      color: "text-green-600",
      description: "Formularios enviados y firmados"
    },
    {
      title: "Citas Pendientes",
      value: stats?.pendingAppointments ?? 0,
      icon: Calendar,
      color: "text-amber-600",
      description: "Próximas citas por atender"
    }
  ]

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido a Aura CRM. Aquí tienes un resumen de tu actividad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
