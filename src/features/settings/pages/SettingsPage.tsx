import React, { useState } from 'react';
import { useSettings, useUpdateProfile, useUploadLogo, useUpdateServices } from '../hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Store, 
  Briefcase, 
  Loader2,
  Pencil
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import type { BusinessService } from '../types/settings.types';

export const SettingsPage = () => {
  const { data: profile, isLoading } = useSettings();
  const updateProfile = useUpdateProfile();
  const uploadLogo = useUploadLogo();
  const updateServices = useUpdateServices();

  const [salonName, setSalonName] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<BusinessService | null>(null);
  
  // Local state for service being created/edited
  const [newService, setNewService] = useState<Partial<BusinessService>>({
    name: '',
    description: '',
    price: 0
  });

  // Sync profile data to local state
  React.useEffect(() => {
    if (profile?.salon_name) setSalonName(profile.salon_name);
  }, [profile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpdateProfile = () => {
    updateProfile.mutate({ salon_name: salonName });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo.mutate(file);
  };

  const handleSaveService = () => {
    if (!profile) return;
    
    let updatedServices: BusinessService[];
    if (editingService) {
      updatedServices = profile.services.map(s => 
        s.id === editingService.id ? { ...editingService, ...newService } as BusinessService : s
      );
    } else {
      updatedServices = [
        ...profile.services, 
        { ...newService, id: crypto.randomUUID() } as BusinessService
      ];
    }

    updateServices.mutate(updatedServices, {
      onSuccess: () => {
        setIsAddingService(false);
        setEditingService(null);
        setNewService({ name: '', description: '', price: 0 });
      }
    });
  };

  const handleDeleteService = (id: string) => {
    if (!profile) return;
    const updatedServices = profile.services.filter(s => s.id !== id);
    updateServices.mutate(updatedServices);
  };

  return (
    <div className="container py-10 space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Gestiona los detalles de tu estudio médico y los servicios que ofreces.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border shadow-sm">
          <TabsTrigger value="profile" className="gap-2">
            <Store className="h-4 w-4" /> Perfil del Negocio
          </TabsTrigger>
          <TabsTrigger value="services" className="gap-2">
            <Briefcase className="h-4 w-4" /> Servicios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-none shadow-premium rounded-2xl overflow-hidden glass-card">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
              <CardTitle>Identidad del Negocio</CardTitle>
              <CardDescription>
                Esta información aparecerá en las cabeceras de tus fichas médicas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="space-y-4 w-full md:w-auto">
                  <Label>Logo del Estudio</Label>
                  <div className="relative group mx-auto md:mx-0">
                    <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-primary/10">
                      {profile?.logo_url ? (
                        <img 
                          src={profile.logo_url} 
                          alt="Logo" 
                          className="w-full h-full object-contain p-2" 
                        />
                      ) : (
                        <Store className="h-10 w-10 text-primary/40" />
                      )}
                    </div>
                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all rounded-2xl">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                      />
                      <Upload className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </label>
                    {uploadLogo.isPending && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-2xl">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground max-w-[128px] text-center">
                    Formatos JPG, PNG. Máx 2MB.
                  </p>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <Label htmlFor="salonName">Nombre del Negocio</Label>
                    <Input 
                      id="salonName" 
                      placeholder="Ej. Aura Studio" 
                      value={salonName}
                      onChange={(e) => setSalonName(e.target.value)}
                      className="max-w-md focus-visible:ring-primary shadow-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Perfil Profesional</Label>
                    <Input 
                      disabled 
                      value={profile?.full_name || ''} 
                      className="max-w-md bg-muted/50"
                    />
                    <p className="text-xs text-muted-foreground">Este perfil está vinculado a tu cuenta registrada.</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/30 px-6 py-4 flex justify-end">
              <Button 
                onClick={handleUpdateProfile} 
                className="shadow-md shadow-primary/20"
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Guardar Cambios
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Tus Servicios</h2>
              <p className="text-sm text-muted-foreground">Gestiona los tratamientos que realizas.</p>
            </div>
            <Dialog open={isAddingService} onOpenChange={(open) => {
              setIsAddingService(open);
              if (!open) {
                setEditingService(null);
                setNewService({ name: '', description: '', price: 0 });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg shadow-primary/20 rounded-xl">
                  <Plus className="h-4 w-4" /> Añadir Servicio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-2xl">
                <DialogHeader>
                  <DialogTitle>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
                  <DialogDescription>
                    Define los detalles del servicio médico o estético.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input 
                      id="name" 
                      placeholder="Ej. Limpieza Facial Profunda" 
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción (Opcional)</Label>
                    <Input 
                      id="description" 
                      placeholder="Detalles del tratamiento..." 
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio sugerido ($)</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0.00" 
                      value={newService.price}
                      onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddingService(false)}>Cancelar</Button>
                  <Button onClick={handleSaveService} disabled={updateServices.isPending}>
                    {updateServices.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile?.services.length === 0 ? (
              <Card className="col-span-full py-12 border-dashed flex flex-col items-center justify-center text-center bg-muted/20 rounded-2xl">
                <Store className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-lg font-medium">Aún no tienes servicios configurados</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Carga los servicios que ofreces para poder seleccionarlos rápidamente al agendar citas.
                </p>
              </Card>
            ) : (
              profile?.services.map((service) => (
                <Card key={service.id} className="group relative hover:shadow-md transition-all border-none shadow-sm glass-card rounded-2xl overflow-hidden flex flex-col">
                  <CardHeader className="pb-3 border-b bg-muted/5">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold truncate pr-8">{service.name}</CardTitle>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => {
                            setEditingService(service);
                            setNewService({ ...service });
                            setIsAddingService(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-4 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 min-h-[60px]">
                      {service.description || 'Sin descripción disponible para este servicio.'}
                    </p>
                  </CardContent>
                  <CardFooter className="bg-primary/5 px-6 py-3 flex justify-between items-center mt-auto">
                     <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Precio Sugerido</span>
                     <span className="font-bold text-primary text-lg">${service.price || 0}</span>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
