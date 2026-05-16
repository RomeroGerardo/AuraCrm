import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from './useAuth'

// Mock de dependencias
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
    }
  }
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}))

const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args)
  }
}))

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: null,
    session: null,
    isLoading: false,
  })
}))

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login should succeed and navigate to dashboard', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: { user: { id: '1' } }, error: null })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login('test@test.com', 'password123')
    })
    
    expect(mockSignInWithPassword).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password123' })
    expect(mockToastSuccess).toHaveBeenCalledWith('Sesión iniciada correctamente')
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })

  it('login should handle errors', async () => {
    mockSignInWithPassword.mockResolvedValueOnce({ data: null, error: new Error('Credenciales inválidas') })
    
    const { result } = renderHook(() => useAuth())
    
    await act(async () => {
      await result.current.login('test@test.com', 'wrongpassword')
    })
    
    expect(mockToastError).toHaveBeenCalledWith('Credenciales inválidas')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
