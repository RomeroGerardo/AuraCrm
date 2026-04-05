import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export const useAuth = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user, session, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      toast.success('Sesión iniciada correctamente')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión')
    } finally {
      setIsSubmitting(false)
    }
  }

  const register = async (email: string, password: string, full_name: string, salon_name: string) => {
    setIsSubmitting(true)
    try {
      // Registrar en Auth
      const { error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name, salon_name }
        }
      })
      if (authError) throw authError

      // Actualizar perfil (aunque el trigger lo haga, es bueno tenerlo como backup o refrescar localmente)
      // En Phase 1 confiamos en el trigger de Supabase.
      
      toast.success('Registro completado. Revisa tu email para confirmar.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message || 'Error al registrarse')
    } finally {
      setIsSubmitting(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Sesión cerrada')
      navigate('/login')
    } catch (error: any) {
      toast.error('Error al cerrar sesión')
    }
  }

  return {
    user,
    session,
    isLoading,
    isSubmitting,
    login,
    register,
    logout,
    isAuthenticated: !!session
  }
}
