import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import type { BusinessProfile, BusinessService } from '../types/settings.types'

/**
 * Hook para obtener la configuración del perfil del negocio
 */
export const useSettings = () => {
  const user = useAuthStore(state => state.user)

  return useQuery<BusinessProfile>({
    queryKey: ['settings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Usuario no autenticado')
      const response = await api.get(`/profiles?id=eq.${user.id}&select=*`)
      
      // Aseguramos que services siempre sea un array
      const profile = response.data[0]
      return {
        ...profile,
        services: Array.isArray(profile.services) ? profile.services : []
      }
    },
    enabled: !!user,
  })
}

/**
 * Hook para actualizar los datos básicos del perfil (nombre del salón, etc)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)

  return useMutation({
    mutationFn: async (updates: Partial<BusinessProfile>) => {
      if (!user) throw new Error('Usuario no autenticado')
      const response = await api.patch(`/profiles?id=eq.${user.id}`, updates)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] })
      toast.success('Perfil actualizado correctamente')
    },
    onError: (error) => {
      console.error('Update profile error:', error)
      toast.error('Error al actualizar el perfil')
    }
  })
}

/**
 * Hook para subir el logo del negocio
 */
export const useUploadLogo = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Usuario no autenticado')

      const fileExt = file.name.split('.').pop()
      const fileName = `logo_${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      // 1. Subir el archivo al bucket 'logos'
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 2. Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      // 3. Actualizar la tabla de perfiles con la nueva URL
      await api.patch(`/profiles?id=eq.${user.id}`, { logo_url: publicUrl })
      
      return publicUrl
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] })
      toast.success('Logo del negocio actualizado')
    },
    onError: (error) => {
      console.error('Upload logo error:', error)
      toast.error('Error al subir el logo')
    }
  })
}

/**
 * Hook para actualizar la lista de servicios del negocio
 */
export const useUpdateServices = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)

  return useMutation({
    mutationFn: async (services: BusinessService[]) => {
      if (!user) throw new Error('Usuario no autenticado')
      const response = await api.patch(`/profiles?id=eq.${user.id}`, { services })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', user?.id] })
      toast.success('Servicios actualizados correctamente')
    },
    onError: (error) => {
      console.error('Update services error:', error)
      toast.error('Error al actualizar los servicios')
    }
  })
}
