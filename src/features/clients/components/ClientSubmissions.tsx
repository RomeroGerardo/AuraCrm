import React, { useState } from 'react'
import { useSubmissions } from '@/features/forms/hooks/useForms'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, FileText, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SubmissionDetailModal } from '@/features/forms/components/SubmissionDetailModal'
import type { FormSubmission } from '@/features/forms/types/form.types'

interface ClientSubmissionsProps {
  clientId: string
}

export const ClientSubmissions: React.FC<ClientSubmissionsProps> = ({ clientId }) => {
  const { data: submissions = [], isLoading } = useSubmissions(clientId)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleViewDetails = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    setIsModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/10 rounded-3xl border-2 border-dashed border-primary/5">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40 mb-4" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Consultando Historial...</p>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-muted/10 rounded-3xl border-2 border-dashed border-primary/5 text-center">
        <div className="p-4 rounded-full bg-primary/5 mb-4">
          <FileText className="h-8 w-8 text-primary/20" />
        </div>
        <p className="font-bold text-foreground mb-1 shadow-sm uppercase tracking-tight">Sin Fichas Firmadas</p>
        <p className="text-sm text-muted-foreground max-w-[250px] leading-relaxed mx-auto">
          La clienta aún no ha completado ningún consentimiento informado.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-3xl border border-primary/5 bg-card shadow-lg shadow-primary/[0.02] overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-primary/5">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5 pl-8">Fecha</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5">Ficha / Consentimiento</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5 text-center">Estado</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-muted-foreground py-5 text-right pr-8">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => (
              <TableRow key={submission.id} className="hover:bg-primary/[0.02] border-primary/5 transition-colors group">
                <TableCell className="py-5 pl-8">
                  <p className="text-base font-black text-foreground tracking-tight">
                    {submission.signed_at 
                      ? format(new Date(submission.signed_at), 'dd MMM, yyyy', { locale: es }) 
                      : format(new Date(submission.created_at), 'dd MMM, yyyy', { locale: es })}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                    {submission.signed_at 
                      ? format(new Date(submission.signed_at), 'HH:mm', { locale: es }) 
                      : '—'} hs
                  </p>
                </TableCell>
                <TableCell className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <FileText className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold tracking-tight">{submission.template?.name || 'Ficha General'}</p>
                  </div>
                </TableCell>
                <TableCell className="py-5 text-center">
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-500/20 rounded-full">
                    Firmado
                  </Badge>
                </TableCell>
                <TableCell className="py-5 text-right pr-8">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(submission)}
                    className="h-10 px-5 gap-2 rounded-xl border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all font-black text-[10px] uppercase tracking-widest"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Ficha
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SubmissionDetailModal 
        submission={selectedSubmission}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  )
}
