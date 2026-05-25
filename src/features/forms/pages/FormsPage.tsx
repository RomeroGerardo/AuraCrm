import React, { useState } from 'react';
import { useTemplates, useFormMutations } from '../hooks/useForms';
import { FormBuilder } from '../components/FormBuilder';
import { Button } from '@/components/ui/button';
import {
  Plus, Edit2, Trash2, ChevronLeft, FileText,
  Sparkles, ArrowRight, Check, Search,
} from 'lucide-react';
import type { FormTemplate, CreateFormTemplateInput } from '../types/form.types';
import { TEMPLATE_PRESETS, type TemplatePreset } from '../data/templatePresets';

// ─── View states ─────────────────────────────────────────────────────────────

type View = 'list' | 'choose' | 'create' | 'edit';

// ─── Template preset card ─────────────────────────────────────────────────────

function PresetCard({
  preset,
  onSelect,
}: {
  preset: TemplatePreset;
  onSelect: (p: TemplatePreset) => void;
}) {
  return (
    <button
      onClick={() => onSelect(preset)}
      className={`
        group relative flex flex-col gap-3 p-5 rounded-2xl text-left w-full
        bg-gradient-to-br ${preset.color} border-2 border-transparent
        transition-all duration-200
        hover:scale-[1.02] hover:shadow-lg hover:border-white/50 dark:hover:border-white/10
        active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
      `}
    >
      {/* Emoji + category */}
      <div className="flex items-start justify-between">
        <div className={`text-3xl p-2 rounded-xl ${preset.iconColor} w-fit`}>
          {preset.emoji}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
          {preset.category}
        </span>
      </div>

      {/* Name + desc */}
      <div className="space-y-1">
        <h3 className="font-bold text-base leading-snug">{preset.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{preset.description}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-black/5 dark:border-white/5">
        <span className="text-[11px] text-muted-foreground font-medium">
          {preset.fields.length} campos · {preset.fields.filter(f => f.required).length} obligatorios
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          Usar plantilla <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}

// ─── Existing template card ────────────────────────────────────────────────────

function TemplateCard({
  template,
  onEdit,
  onDelete,
}: {
  template: FormTemplate;
  onEdit: (t: FormTemplate) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl border bg-card hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Color top stripe */}
      <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />

      <div className="flex-1 p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="p-2 rounded-xl bg-primary/8 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          {/* Actions — appear on hover */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(template)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Editar"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm('¿Eliminar esta plantilla? Esta acción no se puede deshacer.')) {
                  onDelete(template.id);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-muted-foreground hover:text-rose-500"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-base leading-tight">{template.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {template.fields.length} campo{template.fields.length !== 1 ? 's' : ''}
            {' · '}{template.fields.filter(f => f.required).length} obligatorio{template.fields.filter(f => f.required).length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Field type pills */}
        <div className="flex flex-wrap gap-1">
          {template.fields.slice(0, 4).map(f => (
            <span key={f.id} className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full font-semibold uppercase">
              {f.type}
            </span>
          ))}
          {template.fields.length > 4 && (
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-semibold">
              +{template.fields.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Use button */}
      <div className="px-5 pb-4">
        <button
          onClick={() => onEdit(template)}
          className="w-full text-xs font-semibold text-primary hover:underline text-left"
        >
          Editar plantilla →
        </button>
      </div>
    </div>
  );
}

// ─── Template chooser screen ──────────────────────────────────────────────────

function TemplateChooser({
  onSelectPreset,
  onCreateBlank,
}: {
  onSelectPreset: (preset: TemplatePreset) => void;
  onCreateBlank: () => void;
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(TEMPLATE_PRESETS.map(p => p.category)));

  const filtered = TEMPLATE_PRESETS.filter(p => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || p.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-400">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-primary/8 text-primary px-4 py-1.5 rounded-full text-sm font-bold mb-2">
          <Sparkles className="h-4 w-4" /> Plantillas profesionales
        </div>
        <h2 className="text-3xl font-black tracking-tight">¿Con qué empezamos?</h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Elegí una plantilla ya armada por tratamiento o creá una desde cero. Podés modificarla después.
        </p>
      </div>

      {/* Desde cero — featured */}
      <button
        onClick={onCreateBlank}
        className="w-full flex items-center gap-5 p-5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/3 hover:bg-primary/6 hover:border-primary/50 transition-all group"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
          <Plus className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="text-left flex-1">
          <p className="font-bold text-base">Crear desde cero</p>
          <p className="text-sm text-muted-foreground">Ficha 100% personalizada, sin campos predefinidos.</p>
        </div>
        <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">o elegí una plantilla</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar tratamiento…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
              !activeCategory ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(c => c === cat ? null : cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                activeCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Preset grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron plantillas para "{search}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(preset => (
            <PresetCard key={preset.id} preset={preset} onSelect={onSelectPreset} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main FormsPage ───────────────────────────────────────────────────────────

export const FormsPage: React.FC = () => {
  const { data: templates = [], isLoading } = useTemplates();
  const { createTemplate, updateTemplate, deleteTemplate, isCreating, isUpdating } = useFormMutations();

  const [view, setView] = useState<View>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [prefilledData, setPrefilledData] = useState<{ name: string; fields: any[] } | undefined>(undefined);

  // ── Navigate ──────────────────────────────────────────────────────────────

  const goList   = () => { setView('list'); setSelectedTemplate(null); setPrefilledData(undefined); };
  const goChoose = () => setView('choose');

  const handleSelectPreset = (preset: TemplatePreset) => {
    setPrefilledData({ name: preset.name, fields: preset.fields });
    setSelectedTemplate(null);
    setView('create');
  };

  const handleEdit = (template: FormTemplate) => {
    setSelectedTemplate(template);
    setPrefilledData(undefined);
    setView('edit');
  };

  const handleCreateBlank = () => {
    setPrefilledData(undefined);
    setSelectedTemplate(null);
    setView('create');
  };

  const handleSave = async (data: CreateFormTemplateInput) => {
    if (view === 'create') {
      await createTemplate(data);
    } else if (view === 'edit' && selectedTemplate) {
      await updateTemplate({ id: selectedTemplate.id, data });
    }
    goList();
  };

  // ── Builder view (create or edit) ────────────────────────────────────────

  if (view === 'create' || view === 'edit') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-400">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={view === 'create' ? goChoose : goList}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              {view === 'create' ? 'Nueva Plantilla' : `Editar: ${selectedTemplate?.name}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === 'create'
                ? prefilledData ? `Basada en "${prefilledData.name}" · Podés modificar todos los campos` : 'Plantilla en blanco'
                : 'Los cambios se guardan en tu cuenta'}
            </p>
          </div>
          {prefilledData && (
            <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1 rounded-full">
              <Check className="h-3 w-3" /> Plantilla predefinida
            </span>
          )}
        </div>

        <FormBuilder
          initialData={view === 'edit' && selectedTemplate
            ? { name: selectedTemplate.name, fields: selectedTemplate.fields }
            : prefilledData
          }
          onSave={handleSave}
          isLoading={isCreating || isUpdating}
        />
      </div>
    );
  }

  // ── Chooser view ──────────────────────────────────────────────────────────

  if (view === 'choose') {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={goList}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        <TemplateChooser
          onSelectPreset={handleSelectPreset}
          onCreateBlank={handleCreateBlank}
        />
      </div>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl animate-in fade-in duration-400">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Fichas Dinámicas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tus plantillas de anamnesis, consentimientos y evaluaciones.
          </p>
        </div>
        <Button onClick={goChoose} className="gap-2 w-full md:w-auto shadow-md shadow-primary/20">
          <Plus className="h-4 w-4" /> Nueva Plantilla
        </Button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        /* ── Empty state ── */
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-muted bg-muted/10 text-center space-y-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
              <FileText className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold">No tenés fichas todavía</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Creá tu primera plantilla desde cero o elegí una de nuestras fichas prediseñadas por tratamiento.
            </p>
          </div>
          <Button onClick={goChoose} className="gap-2 shadow-md">
            <Sparkles className="h-4 w-4" /> Explorar plantillas
          </Button>
        </div>
      ) : (
        /* ── Templates grid ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={deleteTemplate}
            />
          ))}
          {/* "+" add card */}
          <button
            onClick={goChoose}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-muted hover:border-primary/30 hover:bg-primary/3 transition-all min-h-[180px] group"
          >
            <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-muted-foreground group-hover:text-foreground transition-colors">Nueva plantilla</p>
              <p className="text-xs text-muted-foreground/60">Desde cero o prediseñada</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
