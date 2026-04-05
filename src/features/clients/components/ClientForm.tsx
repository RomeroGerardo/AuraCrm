import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, User, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { CreateClientInput, Client } from '../types/client.types'
import { toast } from 'sonner'

const clientSchema = z.object({
  full_name: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido').nullish().or(z.literal('')),
  phone: z.string().min(6, 'Teléfono inválido').nullish().or(z.literal('')),
  birth_date: z.string().nullish().or(z.literal('')),
  notes: z.string().nullish().or(z.literal('')),
  avatar_url: z.string().nullish().or(z.literal(''))
})

type ClientFormValues = z.infer<typeof clientSchema>

interface ClientFormProps {
  initialData?: Client
  onSubmit: (data: CreateClientInput) => void
  isSubmitting?: boolean
  onCancel?: () => void
}

export const ClientForm = ({ initialData, onSubmit, isSubmitting, onCancel }: ClientFormProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      full_name: initialData?.full_name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      birth_date: initialData?.birth_date || '',
      notes: initialData?.notes || '',
      avatar_url: initialData?.avatar_url || ''
    }
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Error al subir la imagen de perfil')
      return null
    }
  }

  const onFormSubmit = async (data: ClientFormValues) => {
    let finalAvatarUrl = data.avatar_url || null

    if (avatarFile) {
      setIsUploading(true)
      const uploadedUrl = await uploadAvatar(avatarFile)
      setIsUploading(false)
      if (uploadedUrl) {
        finalAvatarUrl = uploadedUrl
      }
    }

    onSubmit({
      ...data,
      email: data.email || null,
      phone: data.phone || null,
      birth_date: data.birth_date || null,
      notes: data.notes || null,
      avatar_url: finalAvatarUrl
    } as CreateClientInput)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Avatar Upload Section */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-2">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-primary/10 overflow-hidden bg-muted flex items-center justify-center transition-all group-hover:border-primary/30">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-16 h-16 text-muted-foreground/40" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Camera className="w-5 h-5" />
          </button>
          {avatarPreview && (
            <button
              type="button"
              onClick={() => {
                setAvatarPreview(null)
                setAvatarFile(null)
                setValue('avatar_url', '')
              }}
              className="absolute top-0 right-0 p-1 bg-destructive text-destructive-foreground rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-center">
          <Label className="text-sm font-medium text-muted-foreground">Foto de Perfil</Label>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mt-1">Recomendado: Cuadrada, máx 2MB</p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Nombre Completo *</Label>
          <Input id="full_name" placeholder="Ej. María García" {...register('full_name')} />
          {errors.full_name && <p className="text-sm text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="maria@ejemplo.com" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" placeholder="+54 9 11 ..." {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
          <Input id="birth_date" type="date" {...register('birth_date')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notas / Observaciones</Label>
          <Textarea 
            id="notes" 
            placeholder="Alergias, preferencias, etc." 
            className="min-h-[100px]" 
            {...register('notes')} 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || isUploading} className="min-w-[120px]">
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? 'Subiendo...' : 'Guardando...'}
            </>
          ) : (
            initialData ? 'Actualizar Cliente' : 'Crear Cliente'
          )}
        </Button>
      </div>
    </form>
  )
}

