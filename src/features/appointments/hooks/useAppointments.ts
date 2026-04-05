import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Appointment, CreateAppointmentInput, UpdateAppointmentInput } from '../types/appointment.types'
import { toast } from 'sonner'

export const useAppointments = (clientId?: string) => {
  const queryClient = useQueryClient()

  const { data: appointments = [], isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['appointments', clientId],
    queryFn: async () => {
      let url = '/appointments?select=*,client:clients(full_name,phone)&order=scheduled_at.asc'
      if (clientId) {
        url += `&client_id=eq.${clientId}`
      }
      const response = await api.get(url)
      return response.data
    }
  })

  const createAppointmentMutation = useMutation({
    mutationFn: async (newAppointment: CreateAppointmentInput) => {
      const response = await api.post('/appointments', newAppointment)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Cita programada correctamente')
    },
    onError: () => {
      toast.error('Error al programar la cita')
    }
  })

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAppointmentInput }) => {
      const response = await api.patch(`/appointments?id=eq.${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Cita actualizada')
    },
    onError: () => {
      toast.error('Error al actualizar la cita')
    }
  })

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/appointments?id=eq.${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Cita eliminada')
    },
    onError: () => {
      toast.error('Error al eliminar la cita')
    }
  })

  return {
    appointments,
    isLoading,
    error,
    createAppointment: createAppointmentMutation.mutateAsync,
    updateAppointment: updateAppointmentMutation.mutateAsync,
    deleteAppointment: deleteAppointmentMutation.mutateAsync,
    isCreating: createAppointmentMutation.isPending,
    isUpdating: updateAppointmentMutation.isPending,
    isDeleting: deleteAppointmentMutation.isPending
  }
}
