export interface Profile {
  id: string
  full_name: string | null
  salon_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface AuthStatus {
  isAuthenticated: boolean
  user: Profile | null
  isLoading: boolean
}
