import { useState } from 'react'
import { ClientSearch } from '../components/ClientSearch'
import { ClientCard } from '../components/ClientCard'
import { ClientForm } from '../components/ClientForm'
import { useClients } from '../hooks/useClients'
import { Button } from '@/components/ui/button'
import { Plus, UserPlus, Loader2 } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

export const ClientsPage = () => {
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { clients, isLoading, createClient, isCreating } = useClients(search)

  const handleCreate = async (data: any) => {
    try {
      await createClient(data)
      setIsDialogOpen(false)
    } catch (error) {
      // Ignoramos error ya que se maneja en el hook con toast
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gestiona la base de datos de tus clientas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Clienta</DialogTitle>
              <DialogDescription>
                Ingresa los datos personales para registrar una nueva clienta en tu base de datos.
              </DialogDescription>
            </DialogHeader>
            <ClientForm onSubmit={handleCreate} isSubmitting={isCreating} onCancel={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-4 -mx-4 px-4">
        <ClientSearch value={search} onChange={setSearch} />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium text-lg">Cargando clientas...</p>
        </div>
      ) : clients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border-2 border-dashed rounded-xl bg-muted/30">
          <UserPlus className="h-16 w-16 text-muted-foreground/40" />
          <div className="space-y-1">
            <h3 className="text-xl font-semibold">No se encontraron clientes</h3>
            <p className="text-muted-foreground max-w-xs">
              {search 
                ? `No hay resultados para "${search}". Intenta con otro nombre.` 
                : "Aún no tienes clientas registradas."}
            </p>
          </div>
          {!search && (
            <Button variant="outline" onClick={() => setIsDialogOpen(true)} className="mt-2">
              Crear mi primer cliente
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
