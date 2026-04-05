import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { supabase } from '@/lib/supabase'
import type { GalleryItem } from '../types/gallery.types'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

/**
 * Hook para obtener los elementos de la galería de un cliente específico
 */
export const useGallery = (clientId: string) => {
  return useQuery<GalleryItem[]>({
    queryKey: ['gallery', clientId],
    queryFn: async () => {
      // Obtenemos los items de la tabla gallery_items filtrados por client_id
      const response = await api.get(`/gallery_items?client_id=eq.${clientId}&select=*&order=taken_at.desc`)
      return response.data
    },
    enabled: !!clientId,
  })
}

/**
 * Hook para subir un nuevo par de fotos (Antes/Después) a la galería
 */
export const useUploadGalleryItem = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore(state => state.user)

  return useMutation({
    mutationFn: async ({
      client_id,
      before_file,
      after_file,
      treatment,
      notes,
    }: {
      client_id: string
      before_file: File
      after_file: File
      treatment: string
      notes?: string
    }) => {
      if (!user) throw new Error('No hay sesión de usuario activa')

      // Función interna para subir archivos al bucket 'gallery'
      const uploadPhoto = async (file: File, prefix: string) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${client_id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(filePath)

        return publicUrl
      }

      // Subida de archivos en paralelo
      const [before_url, after_url] = await Promise.all([
        uploadPhoto(before_file, 'before'),
        uploadPhoto(after_file, 'after')
      ])

      // Persistencia en la tabla gallery_items
      const response = await api.post('/gallery_items', {
        client_id,
        professional_id: user.id,
        before_url,
        after_url,
        treatment,
        notes,
        taken_at: new Date().toISOString().split('T')[0],
      })

      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidamos la caché de la galería para este cliente
      queryClient.invalidateQueries({ queryKey: ['gallery', variables.client_id] })
      toast.success('Nueva entrada de galería guardada correctamente')
    },
    onError: (error) => {
      console.error('Gallery upload error:', error)
      toast.error('Error al guardar en la galería. Por favor reintenta.')
    }
  })
}

/**
 * Hook para eliminar un elemento de la galería (Base de datos + Storage)
 */
export const useDeleteGalleryItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (item: GalleryItem) => {
      // 1. Extraer rutas de los archivos desde las URLs públicas
      // Formato esperado: .../storage/v1/object/public/gallery/client_id/filename.ext
      const getPath = (url: string | null) => {
        if (!url) return null
        const parts = url.split('gallery/')
        return parts.length > 1 ? parts[1] : null
      }

      const pathsToDelete = [
        getPath(item.before_url),
        getPath(item.after_url)
      ].filter(Boolean) as string[]

      // 2. Eliminar archivos de Supabase Storage
      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('gallery')
          .remove(pathsToDelete)
        
        if (storageError) {
          console.warn('Error deleting files from storage:', storageError)
          // Continuamos para intentar borrar el registro de la DB de todos modos
        }
      }

      // 3. Eliminar registro de la tabla gallery_items
      const response = await api.delete(`/gallery_items?id=eq.${item.id}`)
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['gallery', variables.client_id] })
      toast.success('Entrada de galería eliminada')
    },
    onError: (error) => {
      console.error('Gallery delete error:', error)
      toast.error('Error al eliminar la galería')
    }
  })
}

