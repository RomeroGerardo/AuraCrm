import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { 
  FormTemplate, 
  CreateFormTemplateInput, 
  UpdateFormTemplateInput,
  FormSubmission,
  CreateFormSubmissionInput
} from '../types/form.types'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

/**
 * Hook para obtener todas las plantillas del profesional actual
 */
export const useTemplates = () => {
  const user = useAuthStore((state) => state.user)

  return useQuery<FormTemplate[]>({
    queryKey: ['form_templates', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const response = await api.get(`/form_templates?professional_id=eq.${user.id}`)
      return response.data
    },
    enabled: !!user?.id
  })
}

/**
 * Hook para obtener una plantilla específica por ID
 */
export const useTemplate = (id: string | undefined) => {
  return useQuery<FormTemplate>({
    queryKey: ['form_template', id],
    queryFn: async () => {
      const response = await api.get(`/form_templates?id=eq.${id}`)
      return response.data[0]
    },
    enabled: !!id
  })
}

/**
 * Hook para mutaciones de plantillas (Crear, Actualizar, Eliminar)
 */
export const useFormMutations = () => {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const createTemplate = useMutation({
    mutationFn: async (newTemplate: CreateFormTemplateInput) => {
      if (!user?.id) throw new Error('Usuario no autenticado')
      const response = await api.post('/form_templates', {
        ...newTemplate,
        professional_id: user.id
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form_templates'] })
      toast.success('Plantilla creada correctamente')
    },
    onError: () => {
      toast.error('Error al crear la plantilla')
    }
  })

  const updateTemplate = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFormTemplateInput }) => {
      const response = await api.patch(`/form_templates?id=eq.${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form_templates'] })
      queryClient.invalidateQueries({ queryKey: ['form_template'] })
      toast.success('Plantilla actualizada')
    },
    onError: () => {
      toast.error('Error al actualizar la plantilla')
    }
  })

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/form_templates?id=eq.${id}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form_templates'] })
      toast.success('Plantilla eliminada')
    },
    onError: () => {
      toast.error('Error al eliminar la plantilla')
    }
  })

  return {
    createTemplate: createTemplate.mutateAsync,
    updateTemplate: updateTemplate.mutateAsync,
    deleteTemplate: deleteTemplate.mutateAsync,
    isCreating: createTemplate.isPending,
    isUpdating: updateTemplate.isPending,
    isDeleting: deleteTemplate.isPending
  }
}

/**
 * Hook para obtener los envíos de fichas (opcionalmente filtrados por cliente)
 */
export const useSubmissions = (clientId?: string) => {
  return useQuery<FormSubmission[]>({
    queryKey: ['form_submissions', clientId],
    queryFn: async () => {
      const select = '*,template:form_templates(name,fields)'
      const url = clientId 
        ? `/form_submissions?client_id=eq.${clientId}&select=${select}`
        : `/form_submissions?select=${select}`
      const response = await api.get(url)
      return response.data
    }
  })
}

/**
 * Hook para enviar una ficha completada
 */
export const useSubmitForm = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (submission: CreateFormSubmissionInput) => {
      const response = await api.post('/form_submissions', submission)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form_submissions'] })
      toast.success('Ficha guardada correctamente')
    },
    onError: () => {
      toast.error('Error al guardar la ficha')
    }
  })
}
