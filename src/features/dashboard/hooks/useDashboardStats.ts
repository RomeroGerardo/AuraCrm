import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Appointment } from '@/features/appointments/types/appointment.types'
import type { Client } from '@/features/clients/types/client.types'

export interface DashboardStats {
  totalClients: number
  totalSubmissions: number
  pendingAppointments: number
  confirmedAppointments: number
  completedThisMonth: number
  todayAppointments: Appointment[]
  recentClients: Client[]
  upcomingAppointments: Appointment[]
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const now = new Date()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const [
        clientsRes,
        submissionsRes,
        pendingRes,
        confirmedRes,
        completedMonthRes,
        todayRes,
        recentClientsRes,
        upcomingRes,
      ] = await Promise.all([
        // totales
        api.get('/clients?select=id', { headers: { Prefer: 'count=exact' } }),
        api.get('/form_submissions?select=id', { headers: { Prefer: 'count=exact' } }),
        api.get('/appointments?status=eq.pending&select=id', { headers: { Prefer: 'count=exact' } }),
        api.get('/appointments?status=eq.confirmed&select=id', { headers: { Prefer: 'count=exact' } }),
        // completadas este mes
        api.get(
          `/appointments?status=eq.completed&scheduled_at=gte.${startOfMonth}&select=id`,
          { headers: { Prefer: 'count=exact' } }
        ),
        // citas de hoy
        api.get(
          `/appointments?scheduled_at=gte.${startOfToday}&scheduled_at=lte.${endOfToday}&select=*,client:clients(full_name,phone)&order=scheduled_at.asc`
        ),
        // últimos 5 clientes
        api.get('/clients?select=*&order=created_at.desc&limit=5'),
        // próximas 7 días (excluye hoy, max 5)
        api.get(
          `/appointments?scheduled_at=gte.${startOfToday}&scheduled_at=lte.${next7Days}&status=neq.cancelled&status=neq.completed&select=*,client:clients(full_name,phone)&order=scheduled_at.asc&limit=6`
        ),
      ])

      const getCount = (res: any) => {
        const range = res.headers['content-range']
        if (range) {
          const parts = range.split('/')
          return parseInt(parts[1], 10) || 0
        }
        return Array.isArray(res.data) ? res.data.length : 0
      }

      return {
        totalClients: getCount(clientsRes),
        totalSubmissions: getCount(submissionsRes),
        pendingAppointments: getCount(pendingRes),
        confirmedAppointments: getCount(confirmedRes),
        completedThisMonth: getCount(completedMonthRes),
        todayAppointments: todayRes.data ?? [],
        recentClients: recentClientsRes.data ?? [],
        upcomingAppointments: upcomingRes.data ?? [],
      }
    },
    refetchInterval: 60_000, // refresca cada minuto
  })
}
