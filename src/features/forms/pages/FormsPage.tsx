import React, { useState } from 'react';
import { useTemplates, useFormMutations } from '../hooks/useForms';
import { FormBuilder } from '../components/FormBuilder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, ChevronLeft, FileText } from 'lucide-react';
import type { FormTemplate, CreateFormTemplateInput } from '../types/form.types';

export const FormsPage: React.FC = () => {
  const { data: templates = [], isLoading: loadingTemplates } = useTemplates();
  const { createTemplate, updateTemplate, deleteTemplate, isCreating, isUpdating } = useFormMutations();
  
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setView('create');
  };

  const handleEdit = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setView('edit');
  };

  const handleSave = async (data: CreateFormTemplateInput) => {
    if (view === 'create') {
      await createTemplate(data);
    } else if (view === 'edit' && selectedTemplate) {
      await updateTemplate({ id: selectedTemplate.id, data });
    }
    setView('list');
  };

  if (view === 'create' || view === 'edit') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setView('list')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {view === 'create' ? 'Nueva Plantilla' : 'Editar Plantilla'}
          </h1>
        </div>
        
        <FormBuilder 
          initialData={selectedTemplate ? { name: selectedTemplate.name, fields: selectedTemplate.fields } : undefined}
          onSave={handleSave}
          isLoading={isCreating || isUpdating}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fichas Dinámicas</h1>
          <p className="text-muted-foreground">Gestiona tus plantillas de anamnesis y consentimientos.</p>
        </div>
        <Button onClick={handleCreate} className="gap-2 w-full md:w-auto">
          <Plus className="h-4 w-4" /> Nueva Plantilla
        </Button>
      </div>

      {loadingTemplates ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-dashed flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted p-4 rounded-full mb-4">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>No tienes plantillas aún</CardTitle>
          <CardDescription className="max-w-xs mt-2">
            Crea tu primera plantilla personalizada para empezar a digitalizar tus fichas.
          </CardDescription>
          <Button variant="outline" className="mt-6" onClick={handleCreate}>
            Crear mi primera plantilla
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary mb-2">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(template)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm('¿Estás seguro de eliminar esta plantilla?')) {
                          deleteTemplate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-1">{template.name}</CardTitle>
                <CardDescription>
                  {template.fields.length} campos configurados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {template.fields.slice(0, 3).map((f) => (
                    <span key={f.id} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full uppercase font-semibold">
                      {f.type}
                    </span>
                  ))}
                  {template.fields.length > 3 && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
                      +{template.fields.length - 3}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
