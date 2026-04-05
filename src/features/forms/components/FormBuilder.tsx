import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Save, X, Type, List, CheckSquare, AlignLeft, GripVertical } from 'lucide-react';
import type { FormField, FormFieldType, CreateFormTemplateInput } from '../types/form.types';

// DND Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableFormFieldProps {
  field: FormField;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onAddOption: (fieldId: string) => void;
  onUpdateOption: (fieldId: string, index: number, value: string) => void;
  onRemoveOption: (fieldId: string, index: number) => void;
}

const SortableFormField: React.FC<SortableFormFieldProps> = ({
  field,
  index,
  onRemove,
  onUpdate,
  onAddOption,
  onUpdateOption,
  onRemoveOption,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className={`relative overflow-hidden pl-10 ${isDragging ? 'ring-2 ring-primary shadow-lg' : ''}`}>
        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
        
        {/* Drag Handle Container (Left side) */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-all rounded-md hover:bg-primary/5 touch-none"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="h-6 w-6" />
        </div>

        <CardHeader className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
                PREGUNTA #{index + 1}
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {field.type}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onRemove(field.id)} 
              className="text-destructive h-8 w-8 hover:bg-destructive/10"
            >
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
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                placeholder="Escribe la pregunta aquí..."
              />
            </div>
            <div className="space-y-2">
              <Label>Placeholder (Opcional)</Label>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                placeholder="Ej. 'Ingresa tu respuesta...'"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`required-${field.id}`}
              checked={field.required}
              onCheckedChange={(val) => onUpdate(field.id, { required: val })}
            />
            <Label htmlFor={`required-${field.id}`} className="cursor-pointer">Campo Obligatorio</Label>
          </div>

          {field.type === 'select' && (
            <div className="space-y-3 pt-4 border-t mt-4 bg-muted/30 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Opciones de Selección</Label>
                <Button variant="outline" size="sm" onClick={() => onAddOption(field.id)} className="h-7 text-xs bg-background">
                  <Plus className="h-3 w-3 mr-1" /> Añadir Opción
                </Button>
              </div>
              <div className="space-y-2">
                {field.options?.map((option, optIdx) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input
                        value={option}
                        onChange={(e) => onUpdateOption(field.id, optIdx, e.target.value)}
                        className="h-8 text-sm bg-background"
                        placeholder={`Opción ${optIdx + 1}`}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveOption(field.id, optIdx)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
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
    </div>
  );
};

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialData, onSave, isLoading }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [fields, setFields] = useState<FormField[]>(initialData?.fields || []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Desactivar drag accidental si se hace click rápido
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `Nuevo Campo de ${type === 'text' ? 'Texto' : type === 'textarea' ? 'Texto Largo' : type === 'select' ? 'Selección' : 'Confirmación'}`,
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
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl">Configuración de la Plantilla</CardTitle>
          <CardDescription>Define el nombre y los campos de la ficha médica.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name" className="font-semibold">Nombre de la Plantilla</Label>
            <Input
              id="template-name"
              placeholder="Ej. Consentimiento Botox, Ficha de Anamnesis..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg py-6"
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/50 p-4 rounded-xl border border-dashed border-muted-foreground/20">
        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block text-center">
          Añadir nuevos elementos
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FIELD_TYPES.map((ft) => (
            <Button
              key={ft.type}
              variant="secondary"
              className="flex flex-col h-auto py-4 gap-2 bg-background hover:bg-primary/5 hover:text-primary border-transparent hover:border-primary/20 transition-all shadow-sm"
              onClick={() => addField(ft.type)}
            >
              <ft.icon className="h-5 w-5" />
              <span className="text-xs font-semibold">{ft.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-muted">
            <p className="text-muted-foreground">Aún no has añadido campos. Utiliza los botones de arriba para empezar.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <SortableFormField
                    key={field.id}
                    field={field}
                    index={index}
                    onRemove={removeField}
                    onUpdate={updateField}
                    onAddOption={addOption}
                    onUpdateOption={updateOption}
                    onRemoveOption={removeOption}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {fields.length > 0 && (
        <div className="flex justify-end pt-6 items-center gap-4">
          <p className="text-sm text-muted-foreground italic">
            Puedes reordenar las preguntas arrastrándolas desde el icono ⋮⋮
          </p>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !name.trim()} 
            className="gap-2 px-8 shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Guardando...
              </span>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Guardar Plantilla
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
