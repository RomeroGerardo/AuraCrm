import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/features/settings/hooks/useSettings'
import type { FormSubmission } from '../types/form.types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface SubmissionDetailModalProps {
  submission: FormSubmission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  submission,
  open,
  onOpenChange,
}) => {
  const { data: businessProfile } = useSettings()
  
  if (!submission) return null

  // Usamos los campos de la plantilla para mostrar las etiquetas correctas
  const fields = submission.template?.fields || []
  const answers = submission.answers || {}
  const logoUrl = businessProfile?.logo_url
  const salonName = businessProfile?.salon_name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-8 bg-primary/5 pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <Badge variant="outline" className="mb-2 bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                Ficha Firmada
              </Badge>
              <DialogTitle className="text-3xl font-black tracking-tighter text-foreground line-clamp-1">
                {submission.template?.name || 'Detalle de Ficha'}
              </DialogTitle>
              <div className="flex flex-col gap-0.5 mt-1">
                {salonName && (
                  <p className="text-sm font-bold text-primary uppercase tracking-wider">{salonName}</p>
                )}
                <DialogDescription className="text-xs font-medium text-muted-foreground">
                  Firmado el {submission.signed_at ? format(new Date(submission.signed_at), "PPP 'a las' p", { locale: es }) : '—'}
                </DialogDescription>
              </div>
            </div>
            {logoUrl && (
              <div className="h-16 w-16 md:h-20 md:w-20 shrink-0">
                <img 
                  src={logoUrl} 
                  alt="Business Logo" 
                  className="h-full w-full object-contain drop-shadow-md"
                />
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8 pt-2">
          <div className="space-y-8">
            <section className="space-y-4 pt-4">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Respuestas del Cliente</h3>
              <div className="grid gap-6">
                {fields.length > 0 ? (
                  fields.map((field) => (
                    <div key={field.id} className="group">
                      <p className="text-xs font-bold text-muted-foreground mb-1 group-hover:text-primary transition-colors">{field.label}</p>
                      <div className="p-3 rounded-xl bg-muted/30 border border-transparent group-hover:border-primary/10 group-hover:bg-muted/50 transition-all">
                        <p className="text-sm font-semibold text-foreground">
                          {typeof answers[field.id] === 'boolean' 
                            ? (answers[field.id] ? 'Sí' : 'No') 
                            : (String(answers[field.id] ?? 'No respondido'))}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-2xl border-2 border-dashed border-primary/5">
                    <p className="text-sm text-muted-foreground italic font-medium">No hay campos definidos en esta versión de la plantilla.</p>
                  </div>
                )}
              </div>
            </section>

            <Separator className="bg-primary/5" />

            {submission.signature_url && (
              <section className="space-y-4 pb-4">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Firma Digital</h3>
                <div className="relative aspect-[3/1] w-full bg-white rounded-2xl border-2 border-dashed border-primary/10 overflow-hidden group">
                  <img 
                    src={submission.signature_url} 
                    alt="Firma del cliente" 
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg w-fit">
                  <p>IP: {submission.ip_address || 'No registrada'}</p>
                  <span className="opacity-20">•</span>
                  <p>ID: {submission.id.slice(0, 8)}...</p>
                </div>
              </section>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
