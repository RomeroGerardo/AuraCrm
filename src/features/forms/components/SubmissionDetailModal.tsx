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
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClient } from '@/features/clients/hooks/useClients'
import html2pdf from 'html2pdf.js'
import { toast } from 'sonner'

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
  const { data: client } = useClient(submission?.client_id || '')
  const [isExporting, setIsExporting] = React.useState(false)
  const printRef = React.useRef<HTMLDivElement>(null)
  
  if (!submission) return null

  // Usamos los campos de la plantilla para mostrar las etiquetas correctas
  const fields = submission.template?.fields || []
  const answers = submission.answers || {}
  const logoUrl = businessProfile?.logo_url
  const salonName = businessProfile?.salon_name

  const handleDownloadPDF = async () => {
    if (!submission || !printRef.current) return

    try {
      setIsExporting(true)
      const element = printRef.current
      
      const opt = {
        margin: [10, 10] as [number, number],
        filename: `Ficha_${client?.full_name || 'Cliente'}_${format(new Date(), 'dd-MM-yyyy')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      }

      await html2pdf().set(opt).from(element).save()
      toast.success('PDF generado correctamente')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('No se pudo generar el PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-[600px] h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto sm:overflow-hidden flex flex-col p-0 rounded-none sm:rounded-3xl border-none shadow-2xl">
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
            
            <div className="flex flex-col items-end gap-3 shrink-0">
              <Button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                variant="outline"
                className="h-10 px-5 gap-2 rounded-xl border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/5 group"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 group-hover:bounce" />
                )}
                {isExporting ? 'Generando...' : 'Descargar PDF'}
              </Button>
              {logoUrl && (
                <div className="h-16 w-16 md:h-20 md:w-20 hidden sm:block">
                  <img 
                    src={logoUrl} 
                    alt="Business Logo" 
                    className="h-full w-full object-contain drop-shadow-md"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
            </div>
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
                    crossOrigin="anonymous"
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

      {/* Contenedor Oculto para Generación de PDF */}
      <div className="fixed -left-[9999px] top-0">
        <div 
          ref={printRef} 
          className="w-[210mm] min-h-[297mm] p-[15mm] bg-white text-black font-sans leading-relaxed"
          style={{ fontFeatureSettings: '"kern" 1' }}
        >
          {/* Header del PDF */}
          <header className="flex justify-between items-start border-b-2 border-black pb-6 mb-10">
            <div className="space-y-2">
              {salonName && <h1 className="text-2xl font-black uppercase tracking-tighter text-black">{salonName}</h1>}
              <h2 className="text-sm font-bold text-gray-600 uppercase tracking-widest">{submission.template?.name || 'Ficha de Anamnesis'}</h2>
            </div>
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="h-20 w-20 object-contain"
                crossOrigin="anonymous"
              />
            )}
          </header>

          {/* Información de la Clienta */}
          <section className="mb-10 grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Clienta</p>
              <p className="text-sm font-bold text-black border-b border-gray-200 pb-1">{client?.full_name || '—'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Fecha de Firma</p>
              <p className="text-sm font-bold text-black border-b border-gray-200 pb-1">
                {submission.signed_at ? format(new Date(submission.signed_at), "dd 'de' MMMM, yyyy - HH:mm", { locale: es }) : '—'}
              </p>
            </div>
            {client?.phone && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Teléfono</p>
                <p className="text-sm font-bold text-black border-b border-gray-200 pb-1">{client.phone}</p>
              </div>
            )}
            {client?.email && (
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Email</p>
                <p className="text-sm font-bold text-black border-b border-gray-200 pb-1">{client.email}</p>
              </div>
            )}
          </section>

          {/* Respuestas de la Anamnesis */}
          <section className="mb-10">
            <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] mb-6 border-l-4 border-black pl-3">Historial Médico y Consultas</h3>
            <div className="space-y-6">
              {fields.map((field) => (
                <div key={field.id} className="break-inside-avoid pb-4 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-2">{field.label}</p>
                  <p className="text-sm font-semibold text-black">
                    {typeof answers[field.id] === 'boolean' 
                      ? (answers[field.id] ? 'Sí' : 'No') 
                      : (String(answers[field.id] ?? 'No respondido'))}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Firma y Validación Legal */}
          <section className="mt-auto pt-10 border-t-2 border-dashed border-gray-200 break-inside-avoid">
            <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] mb-6">Consentimiento Digital</h3>
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-gray-200 mb-6">
              {submission.signature_url ? (
                <img 
                  src={submission.signature_url} 
                  alt="Firma" 
                  className="max-h-32 object-contain"
                  crossOrigin="anonymous"
                />
              ) : (
                <p className="text-xs text-gray-400 italic">No se registró firma</p>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-[9px] font-bold text-gray-500 uppercase bg-gray-100 px-4 py-3 rounded-lg">
              <div>IP Address: <span className="text-black">{submission.ip_address || '—'}</span></div>
              <div className="text-center">Auth ID: <span className="text-black">{submission.id.slice(0, 13)}...</span></div>
              <div className="text-right">Aura CRM · RomeroLabs</div>
            </div>
          </section>

          {/* Footer del PDF */}
          <footer className="mt-10 text-[8px] text-gray-400 text-center uppercase tracking-widest">
            Este documento digital tiene validez legal como consentimiento informado firmado electrónicamente.
          </footer>
        </div>
      </div>
    </Dialog>
  )
}
