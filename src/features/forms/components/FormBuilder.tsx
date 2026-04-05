import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, X, Type, List, CheckSquare, AlignLeft } from 'lucide-react';
import type { FormField, FormFieldType, CreateFormTemplateInput } from '../types/form.types';

interface FormBuilderProps {
  initialData?: {
    name: string;
    fields: FormField[];
  };
  onSave: (data: CreateFormTemplateInput) => void;
  isLoading?: boolean;
}

const FIELD_TYPES: { type: FormFieldType; label: string; icon: any }[] = [
  { type: 'text', label: 'Texto Corto', icon: Type },
  { type: 'textarea', label: 'Texto Largo', icon: AlignLeft },
  { type: 'select', label: 'Selección Única', icon: List },
  { type: 'checkbox', label: 'Check de Confirmación', icon: CheckSquare },
];

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialData, onSave, isLoading }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [fields, setFields] = useState<FormField[]>(initialData?.fields || []);

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `Nuevo Campo de ${type}`,
      required: false,
      options: type === 'select' ? ['Opción 1'] : undefined,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const addOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      updateField(fieldId, { options: [...field.options, `Nueva opción ${field.options.length + 1}`] });
    }
  };

  const updateOption = (fieldId: string, index: number, value: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = [...field.options];
      newOptions[index] = value;
      updateField(fieldId, { options: newOptions });
    }
  };

  const removeOption = (fieldId: string, index: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
      const newOptions = field.options.filter((_, i) => i !== index);
      updateField(fieldId, { options: newOptions });
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (fields.length === 0) return;
    onSave({ name, fields });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración de la Plantilla</CardTitle>
          <CardDescription>Asigna un nombre y añade los campos que necesites.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Nombre de la Plantilla</Label>
            <Input
              id="template-name"
              placeholder="Ej. Consentimiento Botox, Ficha de Anamnesis..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {FIELD_TYPES.map((ft) => (
          <Button
            key={ft.type}
            variant="outline"
            className="flex flex-col h-auto py-4 gap-2"
            onClick={() => addField(ft.type)}
          >
            <ft.icon className="h-5 w-5" />
            <span className="text-xs">{ft.label}</span>
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                    CAMPO #{index + 1}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {field.type}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeField(field.id)} className="text-destructive h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Etiqueta / Pregunta</Label>
                  <Input
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Placeholder (Opcional)</Label>
                  <Input
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`required-${field.id}`}
                  checked={field.required}
                  onCheckedChange={(val) => updateField(field.id, { required: val })}
                />
                <Label htmlFor={`required-${field.id}`}>Campo Obligatorio</Label>
              </div>

              {field.type === 'select' && (
                <div className="space-y-3 pt-2 border-t mt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Opciones de Selección</Label>
                    <Button variant="ghost" size="sm" onClick={() => addOption(field.id)} className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Añadir Opción
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {field.options?.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(field.id, optIdx, e.target.value)}
                          className="h-8 text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(field.id, optIdx)}
                          className="h-8 w-8 text-muted-foreground"
                          disabled={field.options!.length <= 1}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {fields.length > 0 && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={isLoading || !name.trim()} className="gap-2">
            <Save className="h-4 w-4" />
            {isLoading ? 'Guardando...' : 'Guardar Plantilla'}
          </Button>
        </div>
      )}
    </div>
  );
};
