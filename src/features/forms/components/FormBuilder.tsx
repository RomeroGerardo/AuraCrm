import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Plus, Trash2, Save, X, Type, List, CheckSquare, AlignLeft,
  GripVertical, Eye, EyeOff, ChevronDown, ChevronUp, Copy,
  Sparkles, FileText,
} from 'lucide-react';
import type { FormField, FormFieldType, CreateFormTemplateInput } from '../types/form.types';

import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent, DragOverlay, type DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormBuilderProps {
  initialData?: { name: string; fields: FormField[] };
  onSave: (data: CreateFormTemplateInput) => void;
  isLoading?: boolean;
}

// ─── Design tokens per field type ────────────────────────────────────────────

const FIELD_META: Record<FormFieldType, {
  label: string; description: string;
  icon: React.ElementType;
  gradient: string;    // palette card gradient
  iconBg: string;      // icon pill bg
  iconColor: string;   // icon color
  pill: string;        // badge on card header
  accent: string;      // left border of field card
}> = {
  text: {
    label: 'Texto corto', description: 'Nombre, teléfono, ciudad…',
    icon: Type,
    gradient: 'from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40',
    iconBg:   'bg-blue-100 dark:bg-blue-900/50',
    iconColor:'text-blue-600 dark:text-blue-400',
    pill:     'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    accent:   'border-l-blue-400',
  },
  textarea: {
    label: 'Texto largo', description: 'Observaciones, antecedentes…',
    icon: AlignLeft,
    gradient: 'from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/40',
    iconBg:   'bg-violet-100 dark:bg-violet-900/50',
    iconColor:'text-violet-600 dark:text-violet-400',
    pill:     'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
    accent:   'border-l-violet-400',
  },
  select: {
    label: 'Selección única', description: 'El cliente elige una opción',
    icon: List,
    gradient: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
    iconBg:   'bg-amber-100 dark:bg-amber-900/50',
    iconColor:'text-amber-600 dark:text-amber-400',
    pill:     'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    accent:   'border-l-amber-400',
  },
  checkbox: {
    label: 'Confirmación', description: 'Acepto / Declaro / Autorizo…',
    icon: CheckSquare,
    gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
    iconBg:   'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor:'text-emerald-600 dark:text-emerald-400',
    pill:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    accent:   'border-l-emerald-400',
  },
};

// ─── Mini preview of how a field looks to the client ─────────────────────────

function FieldPreview({ field }: { field: FormField }) {
  const meta = FIELD_META[field.type];
  return (
    <div className="pointer-events-none select-none space-y-2 p-4 rounded-xl bg-white/60 dark:bg-black/20 border border-white/40 backdrop-blur-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
        <Eye className="h-3 w-3" /> Vista del cliente
      </p>
      {field.type !== 'checkbox' && (
        <p className="text-sm font-semibold">
          {field.label || <em className="text-muted-foreground font-normal">Pregunta sin título</em>}
          {field.required && <span className="text-rose-500 ml-0.5">*</span>}
        </p>
      )}
      {field.type === 'text' && (
        <div className="h-9 rounded-lg border bg-white dark:bg-black/20 px-3 flex items-center shadow-sm">
          <span className="text-xs text-muted-foreground">{field.placeholder || 'Respuesta corta…'}</span>
        </div>
      )}
      {field.type === 'textarea' && (
        <div className="h-20 rounded-lg border bg-white dark:bg-black/20 px-3 py-2 shadow-sm">
          <span className="text-xs text-muted-foreground">{field.placeholder || 'Respuesta larga…'}</span>
        </div>
      )}
      {field.type === 'select' && (
        <div className="h-9 rounded-lg border bg-white dark:bg-black/20 px-3 flex items-center justify-between shadow-sm">
          <span className="text-xs text-muted-foreground">{field.options?.[0] ?? 'Selecciona una opción…'}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
      {field.type === 'checkbox' && (
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 h-4 w-4 rounded border-2 border-muted-foreground/40 shrink-0" />
          <span className="text-sm leading-snug">{field.label || 'Texto de confirmación…'}</span>
        </div>
      )}
      {/* Options preview */}
      {field.type === 'select' && (field.options?.length ?? 0) > 1 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {field.options?.slice(0, 4).map((o, i) => (
            <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.pill}`}>{o}</span>
          ))}
          {(field.options?.length ?? 0) > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{(field.options?.length ?? 0) - 4}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Palette card (Add field buttons) ────────────────────────────────────────

function PaletteCard({ type, onClick }: { type: FormFieldType; onClick: () => void }) {
  const meta = FIELD_META[type];
  const Icon = meta.icon;
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex flex-col gap-3 p-4 rounded-2xl border-2 border-transparent
        bg-gradient-to-br ${meta.gradient} text-left
        transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:border-white/60
        active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
      `}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${meta.iconBg}`}>
          <Icon className={`h-4 w-4 ${meta.iconColor}`} />
        </div>
        <div className="w-6 h-6 rounded-full bg-white/60 dark:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="h-3.5 w-3.5 text-foreground" />
        </div>
      </div>
      <div>
        <p className="font-bold text-sm text-foreground leading-none">{meta.label}</p>
        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{meta.description}</p>
      </div>
    </button>
  );
}

// ─── Individual sortable field card ──────────────────────────────────────────

interface SortableFieldCardProps {
  field: FormField; index: number; total: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
  onDuplicate: (id: string) => void;
  onAddOption: (fieldId: string) => void;
  onUpdateOption: (fieldId: string, index: number, value: string) => void;
  onRemoveOption: (fieldId: string, index: number) => void;
}

const SortableFieldCard: React.FC<SortableFieldCardProps> = ({
  field, index, total, onRemove, onUpdate, onDuplicate,
  onAddOption, onUpdateOption, onRemoveOption,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const meta = FIELD_META[field.type];
  const Icon = meta.icon;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : 'auto' };

  return (
    <div ref={setNodeRef} style={style}>
      <div className={`
        rounded-2xl border-l-4 ${meta.accent} bg-card
        shadow-sm transition-all duration-200
        ${isDragging ? 'opacity-30 scale-95' : 'hover:shadow-md'}
      `}>

        {/* ── Card header bar ── */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/60">

          {/* Drag handle — large, obvious */}
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-1 cursor-grab active:cursor-grabbing touch-none px-1.5 py-2 -ml-1 rounded-xl hover:bg-muted transition-colors group"
            title="Arrastrá para reordenar"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
          </div>

          {/* Type icon + pill */}
          <div className={`p-1.5 rounded-lg ${meta.iconBg} shrink-0`}>
            <Icon className={`h-3.5 w-3.5 ${meta.iconColor}`} />
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.pill}`}>
            {meta.label}
          </span>

          {/* Field label preview (collapsed mode) */}
          <p className="flex-1 text-sm font-medium truncate min-w-0 text-foreground/75">
            {field.label || <span className="italic text-muted-foreground">Sin título</span>}
          </p>

          {/* Position */}
          <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0 tabular-nums">
            {String(index + 1).padStart(2, '0')}/{String(total).padStart(2, '0')}
          </span>

          {/* Action buttons */}
          <div className="flex items-center shrink-0">
            <IconBtn onClick={() => setShowPreview(v => !v)} title={showPreview ? 'Ocultar preview' : 'Ver preview'}>
              {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </IconBtn>
            <IconBtn onClick={() => onDuplicate(field.id)} title="Duplicar">
              <Copy className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn onClick={() => setExpanded(v => !v)} title={expanded ? 'Colapsar' : 'Expandir'}>
              {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </IconBtn>
            <IconBtn
              onClick={() => onRemove(field.id)}
              title="Eliminar campo"
              className="hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </IconBtn>
          </div>
        </div>

        {/* ── Preview strip ── */}
        {showPreview && (
          <div className="px-4 pt-3 pb-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <FieldPreview field={field} />
          </div>
        )}

        {/* ── Edit body ── */}
        {expanded && (
          <div className="px-4 pb-4 pt-3 space-y-4 animate-in fade-in duration-150">

            {/* Label input */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
                Pregunta / Etiqueta
                {field.required && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400 normal-case tracking-normal">
                    Obligatorio
                  </span>
                )}
              </Label>
              <Input
                value={field.label}
                onChange={e => onUpdate(field.id, { label: e.target.value })}
                placeholder={`Ej. "${field.type === 'text' ? 'Nombre completo' : field.type === 'textarea' ? 'Describa sus antecedentes' : field.type === 'select' ? 'Tipo de piel' : 'Acepto los términos'}"`}
                className="font-medium"
              />
            </div>

            {/* Placeholder — only for text / textarea */}
            {(field.type === 'text' || field.type === 'textarea') && (
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Texto de ayuda <span className="normal-case font-normal">(opcional)</span>
                </Label>
                <Input
                  value={field.placeholder || ''}
                  onChange={e => onUpdate(field.id, { placeholder: e.target.value })}
                  placeholder="Pista que verá el cliente dentro del campo…"
                  className="text-sm"
                />
              </div>
            )}

            {/* Options — only for select */}
            {field.type === 'select' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Opciones
                    <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-muted text-[9px] font-bold">
                      {field.options?.length ?? 0}
                    </span>
                  </Label>
                  <Button variant="outline" size="sm" onClick={() => onAddOption(field.id)} className="h-7 text-xs gap-1 rounded-lg">
                    <Plus className="h-3 w-3" /> Agregar
                  </Button>
                </div>
                <div className="space-y-2">
                  {field.options?.map((option, optIdx) => (
                    <div key={optIdx} className="flex items-center gap-2 group/opt">
                      <span className="text-[10px] font-bold text-muted-foreground/60 w-5 text-right shrink-0 tabular-nums">
                        {optIdx + 1}
                      </span>
                      <div className="flex-1 relative">
                        <Input
                          value={option}
                          onChange={e => onUpdateOption(field.id, optIdx, e.target.value)}
                          className="h-8 text-sm pr-8"
                          placeholder={`Opción ${optIdx + 1}`}
                        />
                      </div>
                      <button
                        onClick={() => onRemoveOption(field.id, optIdx)}
                        disabled={(field.options?.length ?? 0) <= 1}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-25 disabled:cursor-not-allowed shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold leading-none">Campo obligatorio</p>
                <p className="text-xs text-muted-foreground">No se puede enviar el formulario sin completarlo</p>
              </div>
              <Switch
                id={`req-${field.id}`}
                checked={field.required}
                onCheckedChange={val => onUpdate(field.id, { required: val })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Small icon button helper ─────────────────────────────────────────────────

function IconBtn({
  children, onClick, title, className = '',
}: { children: React.ReactNode; onClick: () => void; title: string; className?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Drag overlay ghost ───────────────────────────────────────────────────────

function DragGhost({ field }: { field: FormField }) {
  const meta = FIELD_META[field.type];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-card border-2 border-primary/30 shadow-2xl rotate-1 scale-[1.03]">
      <GripVertical className="h-5 w-5 text-primary" />
      <div className={`p-1.5 rounded-lg ${meta.iconBg}`}>
        <Icon className={`h-4 w-4 ${meta.iconColor}`} />
      </div>
      <span className="font-semibold text-sm max-w-[200px] truncate">{field.label || 'Campo sin título'}</span>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-muted bg-muted/20 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <FileText className="h-8 w-8 text-muted-foreground/30" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Plus className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="font-semibold text-foreground">Aún no hay campos</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Hacé clic en uno de los tipos de arriba para agregar tu primer campo a la ficha.
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const FormBuilder: React.FC<FormBuilderProps> = ({ initialData, onSave, isLoading }) => {
  const [name, setName]         = useState(initialData?.name   || '');
  const [fields, setFields]     = useState<FormField[]>(initialData?.fields || []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeField = fields.find(f => f.id === activeId) ?? null;
  const requiredCount = fields.filter(f => f.required).length;

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd   = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (over && active.id !== over.id) {
      setFields(prev => {
        const from = prev.findIndex(f => f.id === active.id);
        const to   = prev.findIndex(f => f.id === over.id);
        return arrayMove(prev, from, to);
      });
    }
  };

  const addField = (type: FormFieldType) => {
    const defaults: Record<FormFieldType, string> = {
      text:     'Nombre completo',
      textarea: 'Observaciones generales',
      select:   'Seleccione una opción',
      checkbox: 'Acepto los términos y condiciones',
    };
    setFields(prev => [...prev, {
      id: crypto.randomUUID(), type, label: defaults[type], required: false,
      options: type === 'select' ? ['Opción 1', 'Opción 2'] : undefined,
    }]);
  };

  const duplicateField = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (!field) return;
    const copy = { ...field, id: crypto.randomUUID(), label: `${field.label} (copia)` };
    const idx  = fields.findIndex(f => f.id === id);
    const next = [...fields];
    next.splice(idx + 1, 0, copy);
    setFields(next);
  };

  const updateField  = (id: string, updates: Partial<FormField>) =>
    setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  const removeField  = (id: string) => setFields(prev => prev.filter(f => f.id !== id));

  const addOption    = (fieldId: string) => {
    const f = fields.find(x => x.id === fieldId);
    if (f?.options) updateField(fieldId, { options: [...f.options, `Opción ${f.options.length + 1}`] });
  };
  const updateOption = (fieldId: string, index: number, value: string) => {
    const f = fields.find(x => x.id === fieldId);
    if (f?.options) { const o = [...f.options]; o[index] = value; updateField(fieldId, { options: o }); }
  };
  const removeOption = (fieldId: string, index: number) => {
    const f = fields.find(x => x.id === fieldId);
    if (f?.options) updateField(fieldId, { options: f.options.filter((_, i) => i !== index) });
  };

  const handleSave = () => {
    if (!name.trim()) { setNameError(true); return; }
    if (fields.length === 0) return;
    onSave({ name, fields });
  };

  return (
    <div className="space-y-8">

      {/* ── Template name ── */}
      <div className="space-y-2">
        <Label htmlFor="tpl-name" className="font-bold text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Nombre de la plantilla
        </Label>
        <Input
          id="tpl-name"
          placeholder="Ej. Consentimiento Botox · Ficha de Anamnesis · Evaluación Inicial…"
          value={name}
          onChange={e => { setName(e.target.value); setNameError(false); }}
          className={`text-lg h-14 font-semibold rounded-xl shadow-sm ${nameError ? 'border-rose-400 ring-1 ring-rose-400' : ''}`}
        />
        {nameError && (
          <p className="text-xs text-rose-500 flex items-center gap-1">
            <X className="h-3 w-3" /> El nombre es obligatorio para guardar.
          </p>
        )}
      </div>

      {/* ── Palette ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Tipos de campo
          </p>
          {fields.length > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <GripVertical className="h-3.5 w-3.5" />
              Arrastrá para reordenar
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(FIELD_META) as FormFieldType[]).map(type => (
            <PaletteCard key={type} type={type} onClick={() => addField(type)} />
          ))}
        </div>
      </div>

      {/* ── Fields list ── */}
      {fields.length === 0 ? <EmptyState /> : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <SortableFieldCard
                  key={field.id} field={field} index={index} total={fields.length}
                  onRemove={removeField} onUpdate={updateField} onDuplicate={duplicateField}
                  onAddOption={addOption} onUpdateOption={updateOption} onRemoveOption={removeOption}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
            {activeField && <DragGhost field={activeField} />}
          </DragOverlay>
        </DndContext>
      )}

      {/* ── Sticky save bar ── */}
      {fields.length > 0 && (
        <div className="sticky bottom-4 z-20 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between rounded-2xl border bg-card/90 backdrop-blur-md shadow-xl shadow-black/10 px-5 py-3.5">
            {/* Summary */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-none">
                  {fields.length} campo{fields.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {requiredCount} obligatorio{requiredCount !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Type summary pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {(Object.keys(FIELD_META) as FormFieldType[]).map(type => {
                  const count = fields.filter(f => f.type === type).length;
                  if (!count) return null;
                  const meta = FIELD_META[type];
                  const Icon = meta.icon;
                  return (
                    <span key={type} className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.pill}`}>
                      <Icon className="h-2.5 w-2.5" />{count}
                    </span>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={isLoading || !name.trim()}
              size="lg"
              className="gap-2 px-8 rounded-xl shadow-lg shadow-primary/20"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Guardando…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Guardar plantilla
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
