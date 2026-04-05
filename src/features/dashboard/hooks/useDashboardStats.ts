import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

export interface DashboardStats {
  totalClients: number
  totalSubmissions: number
  pendingAppointments: number
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Realizamos peticiones en paralelo para optimizar
      const [clientsRes, submissionsRes, appointmentsRes] = await Promise.all([
        api.get('/clients?select=id', { headers: { 'Prefer': 'count=exact' } }),
        api.get('/form_submissions?select=id', { headers: { 'Prefer': 'count=exact' } }),
        api.get('/appointments?status=eq.pending&select=id', { headers: { 'Prefer': 'count=exact' } })
      ])

      // Extraemos el conteo del header 'content-range' o similar si el backend lo soporta, 
      // pero PostgREST con count=exact devuelve la cuenta en el header Content-Range: 0-0/total
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
        pendingAppointments: getCount(appointmentsRes)
      }
    }
  })
}
