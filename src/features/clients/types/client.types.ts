export interface Client {
  id: string
  professional_id: string
  full_name: string
  email: string | null
  phone: string | null
  birth_date: string | null
  notes: string | null
  avatar_url?: string | null
  created_at: string
}

export type CreateClientInput = Omit<Client, 'id' | 'professional_id' | 'created_at'>
export type UpdateClientInput = Partial<CreateClientInput>
