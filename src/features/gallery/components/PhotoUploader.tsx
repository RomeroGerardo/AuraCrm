import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { useUploadGalleryItem } from '../hooks/useGallery'

const uploaderSchema = z.object({
  treatment: z.string().min(3, 'El tratamiento debe tener al menos 3 caracteres'),
  notes: z.string().optional(),
})

interface PhotoUploaderProps {
  clientId: string
  onSuccess?: () => void
}

/**
 * Componente que permite seleccionar dos fotos (Antes y Después),
 * añadir detalles del tratamiento y subirlas a Supabase Storage y DB.
 */
export const PhotoUploader = ({ clientId, onSuccess }: PhotoUploaderProps) => {
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [beforePreview, setBeforePreview] = useState<string | null>(null)
  const [afterPreview, setAfterPreview] = useState<string | null>(null)
  
  const { mutateAsync: upload, isPending } = useUploadGalleryItem()

  const form = useForm<z.infer<typeof uploaderSchema>>({
    resolver: zodResolver(uploaderSchema),
    defaultValues: {
      treatment: '',
      notes: '',
    },
  })

  // Manejador de cambio de archivos con previsualización
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'before') {
          setBeforeFile(file)
          setBeforePreview(reader.result as string)
        } else {
          setAfterFile(file)
          setAfterPreview(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values: z.infer<typeof uploaderSchema>) => {
    if (!beforeFile || !afterFile) return

    try {
      await upload({
        client_id: clientId,
        before_file: beforeFile,
        after_file: afterFile,
        treatment: values.treatment,
        notes: values.notes,
      })
      
      // Resetear estado tras éxito
      setBeforeFile(null)
      setAfterFile(null)
      setBeforePreview(null)
      setAfterPreview(null)
      form.reset()
      
      onSuccess?.()
    } catch (error) {
      // El error ya se maneja con toast en el hook
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Foto Antes */}
          <div className="space-y-3">
            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Foto Antes</FormLabel>
            <div className="relative group aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/50 hover:bg-muted transition-colors border-muted-foreground/20">
              {beforePreview ? (
                <>
                  <img
                    src={beforePreview}
                    alt="Antes"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setBeforeFile(null)
                      setBeforePreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Estado Inicial</p>
                    <p className="text-xs text-muted-foreground">Click para subir foto antes</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'before')}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Foto Después */}
          <div className="space-y-3">
            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Foto Después</FormLabel>
            <div className="relative group aspect-square rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/50 hover:bg-muted transition-colors border-muted-foreground/20">
              {afterPreview ? (
                <>
                  <img
                    src={afterPreview}
                    alt="Después"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                      setAfterFile(null)
                      setAfterPreview(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-2 p-6 text-center">
                  <div className="p-3 rounded-full bg-secondary/20 text-secondary-foreground">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Resultado</p>
                    <p className="text-xs text-muted-foreground">Click para subir foto después</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'after')}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="treatment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tratamiento Realizado</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Microblading, Limpieza facial profunda..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observaciones (opcional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detalles sobre pigmentos usados, técnica o evolución esperada..." 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold"
          disabled={!beforeFile || !afterFile || isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Procesando Imágenes...
            </>
          ) : (
            'Guardar en Historial Fotográfico'
          )}
        </Button>
      </form>
    </Form>
  )
}
