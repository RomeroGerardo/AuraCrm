import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Client, CreateClientInput, UpdateClientInput } from '../types/client.types'
import { toast } from 'sonner'

export const useClients = (searchQuery?: string) => {
  const queryClient = useQueryClient()

  const { data: clients = [], isLoading, error } = useQuery<Client[]>({
    queryKey: ['clients', searchQuery],
    queryFn: async () => {
      const response = await api.get('/clients', {
        params: searchQuery 
          ? { or: `(full_name.ilike.*${searchQuery}*,phone.ilike.*${searchQuery}*)` } 
          : {}
      })
      return response.data
    }
  })

  const createClientMutation = useMutation({
    mutationFn: async (newClient: CreateClientInput) => {
      const response = await api.post('/clients', newClient)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente creado correctamente')
    },
    onError: () => {
      toast.error('Error al crear el cliente')
    }
  })

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClientInput }) => {
      const response = await api.patch(`/clients?id=eq.${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Cliente actualizado')
    },
    onError: () => {
      toast.error('Error al actualizar el cliente')
    }
  })

  return {
    clients,
    isLoading,
    error,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending
  }
}

export const useClient = (id: string) => {
  return useQuery<Client>({
    queryKey: ['client', id],
    queryFn: async () => {
      const response = await api.get(`/clients?id=eq.${id}&select=*`)
      return response.data[0]
    },
    enabled: !!id
  })
}
