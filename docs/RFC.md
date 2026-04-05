# RFC-001 — Diseño Técnico: Aura CRM by RomeroLabs

**Estado:** Borrador  
**Autor:** Arquitecto de Software — RomeroLabs  
**Fecha:** 2026-03-19  
**Revisión:** 1.0  
**Basado en:** `docs/PRD.md` · `agent.md`

---

## 1. Resumen Ejecutivo

Aura CRM es una aplicación web progresiva (PWA) bajo el modelo **SwaS (Software with a Service)** diseñada para digitalizar integralmente los estudios de belleza. Reemplaza los historiales en papel, otorga validez legal a los consentimientos informados mediante firmas digitales, centraliza el historial fotográfico de tratamientos y automatiza los recordatorios de citas por WhatsApp.

Este documento describe la arquitectura técnica completa, la estructura de carpetas, los contratos de datos, las convenciones de código y el plan de verificación que regirán el desarrollo de Aura CRM. Todo el stack está **fijo e inamovible** según las reglas de `agent.md`.

---

## 2. Stack Tecnológico (No Negociable)

| Capa | Tecnología |
|---|---|
| Core | React 18 + TypeScript + Vite |
| Estilos / UI | Tailwind CSS + shadcn/ui |
| Estado Global | Zustand |
| Fetching / Caché | TanStack React Query + Axios |
| Formularios | React Hook Form + Zod |
| Enrutamiento | React Router v6 |
| Galería | Swiper.js |
| Notificaciones | Sonner |
| Fechas | date-fns |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Firmas | react-signature-canvas |
| PWA | vite-plugin-pwa |
| Drag & Drop | @dnd-kit/core |
| Exportación PDF | html2pdf.js |

> **Regla:** Ningún subagente o pull-request puede introducir dependencias fuera de esta lista sin aprobación explícita del Arquitecto Senior.

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     Cliente (Browser / PWA)             │
│  React + Vite + TypeScript                              │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Pages  │  │Components│  │  Stores  │  │ Hooks  │  │
│  │(Router) │  │(shadcn)  │  │(Zustand) │  │(Query) │  │
│  └────┬────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       └────────────┴─────────────┴─────────────┘       │
│                         │ Axios                         │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS / REST / Realtime WS
┌─────────────────────────┼───────────────────────────────┐
│              Supabase (BaaS)                            │
│  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐ │
│  │ PostgREST│  │  Auth  │  │ Storage  │  │  Edge    │ │
│  │ (API)    │  │  (JWT) │  │ (Fotos)  │  │Functions │ │
│  └──────────┘  └────────┘  └──────────┘  └────┬─────┘ │
└────────────────────────────────────────────────┼────────┘
                                                 │ HTTP
                                    ┌────────────▼──────────────┐
                                    │ API de WhatsApp (Meta)    │
                                    │ (recordatorios de citas)  │
                                    └───────────────────────────┘
```

### 3.1 Flujo de Datos Principal

1. El profesional inicia sesión → Supabase Auth emite JWT.  
2. Axios adjunta el JWT en cada request como `Bearer`.  
3. TanStack Query cachea y sincroniza los datos del servidor.  
4. Zustand mantiene el estado de UI efímero (sidebars, modales, selecciones).  
5. Las Edge Functions de Supabase orquestan el envío de recordatorios por WhatsApp 24 h antes de cada cita, utilizando **Twilio** como proveedor de mensajería.

---

## 4. Estructura de Carpetas

```
src/
├── app/                    # Configuración global (Router, QueryClient, Providers)
│   └── App.tsx
├── assets/                 # Imágenes, íconos estáticos
├── components/
│   ├── ui/                 # Re-exports de shadcn/ui sin modificar
│   └── shared/             # Componentes reutilizables (Avatar, PageHeader, etc.)
├── features/               # Módulos por dominio (cada uno es auto-contenido)
│   ├── auth/
│   │   ├── components/     # LoginForm, RegisterForm
│   │   ├── hooks/          # useAuth.ts
│   │   └── pages/          # LoginPage.tsx
│   ├── dashboard/
│   │   └── pages/          # DashboardPage.tsx
│   ├── clients/            # Gestión de clientes / pacientes
│   │   ├── components/     # ClientCard, ClientSearch, ClientForm
│   │   ├── hooks/          # useClients.ts, useClient.ts
│   │   ├── pages/          # ClientsPage.tsx, ClientDetailPage.tsx
│   │   ├── schemas/        # clientSchema.ts (Zod)
│   │   └── types/          # client.types.ts
│   ├── forms/              # Fichas de anamnesis dinámicas
│   │   ├── components/     # FormBuilder, FormRenderer, FieldEditor
│   │   ├── hooks/          # useForms.ts
│   │   ├── pages/          # FormsPage.tsx, FormFillerPage.tsx
│   │   └── schemas/        # formSchema.ts
│   ├── signatures/         # Firma digital en pantalla
│   │   ├── components/     # SignaturePad, SignatureViewer
│   │   ├── hooks/          # useSignature.ts
│   │   └── pages/          # SignaturePage.tsx
│   ├── gallery/            # Galería Antes / Después
│   │   ├── components/     # GalleryCarousel, PhotoUploader
│   │   ├── hooks/          # useGallery.ts
│   │   └── pages/          # GalleryPage.tsx
│   └── appointments/       # Citas y recordatorios
│       ├── components/     # AppointmentCard, AppointmentForm
│       ├── hooks/          # useAppointments.ts
│       └── pages/          # AppointmentsPage.tsx
├── lib/
│   ├── supabase.ts         # Cliente Supabase configurado
│   ├── axios.ts            # Instancia Axios con interceptores (JWT)
│   └── queryClient.ts      # Configuración TanStack Query
├── stores/                 # Zustand stores
│   ├── authStore.ts
│   └── uiStore.ts
├── types/                  # Tipos globales compartidos
└── utils/                  # Helpers genéricos
```

---

## 5. Modelo de Datos (Supabase / PostgreSQL)

### 5.1 Tablas Principales

#### `profiles`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | Referencia a `auth.users` |
| `full_name` | `text` | Nombre del profesional |
| `salon_name` | `text` | Nombre del estudio |
| `avatar_url` | `text` | URL en Supabase Storage |
| `created_at` | `timestamptz` | Auto |

#### `clients`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | |
| `professional_id` | `uuid` FK → `profiles.id` | Dueño del registro |
| `full_name` | `text` | |
| `email` | `text` | |
| `phone` | `text` | Para WhatsApp |
| `birth_date` | `date` | |
| `notes` | `text` | Observaciones libres |
| `created_at` | `timestamptz` | |

#### `form_templates`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | |
| `professional_id` | `uuid` FK | |
| `name` | `text` | Ej. "Anamnesis Botox" |
| `fields` | `jsonb` | Array de definición de campos |
| `created_at` | `timestamptz` | |

**Estructura `fields` (JSONB):**
```json
[
  {
    "id": "uuid-v4",
    "type": "text | select | checkbox | textarea",
    "label": "¿Tiene alergias conocidas?",
    "required": true,
    "options": ["Sí", "No"]
  }
]
```

#### `form_submissions`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | |
| `template_id` | `uuid` FK | |
| `client_id` | `uuid` FK | |
| `answers` | `jsonb` | Respuestas del cliente |
| `signature_url` | `text` | URL en Storage |
| `signed_at` | `timestamptz` | Fecha/hora de firma |
| `ip_address` | `text` | Para validez legal |
| `created_at` | `timestamptz` | |

#### `appointments`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | |
| `professional_id` | `uuid` FK | |
| `client_id` | `uuid` FK | |
| `service` | `text` | Tipo de tratamiento |
| `scheduled_at` | `timestamptz` | Fecha y hora de la cita |
| `reminder_sent` | `boolean` | Default `false` |
| `status` | `text` | `pending`, `confirmed`, `cancelled`, `completed` |

#### `gallery_items`
| Columna | Tipo | Descripción |
|---|---|---|
| `id` | `uuid` PK | |
| `client_id` | `uuid` FK | |
| `professional_id` | `uuid` FK | |
| `before_url` | `text` | URL en Storage |
| `after_url` | `text` | URL en Storage |
| `treatment` | `text` | Nombre del tratamiento |
| `taken_at` | `date` | |
| `notes` | `text` | |

---

## 6. Diseño de Módulos

### 6.1 Autenticación (`features/auth`)
- Supabase Auth con email/password.  
- El JWT se persiste en el `authStore` de Zustand.  
- El interceptor de Axios en `lib/axios.ts` inyecta el token en cada request.  
- Rutas protegidas mediante un `PrivateRoute` wrapper en el router.

### 6.2 Fichas Dinámicas (`features/forms`)
- **Form Builder:** UI drag-and-drop opcional (Phase 2); en Phase 1, el profesional añade campos via lista.  
- **Validación:** Cada campo del JSON se mapea a un esquema Zod generado dinámicamente.  
- **Persistencia:** `useFormState` de React Hook Form controla el estado; al enviar se hace `POST` a `form_submissions`.  
- **Tecnología clave:** React Hook Form + Zod + TanStack Query.

### 6.3 Firmas Digitales (`features/signatures`)
- Componente `SignaturePad` basado en `react-signature-canvas`.  
- Al confirmar, el trazo se exporta como `image/png` en Base64, se sube a Supabase Storage bajo `signatures/{submission_id}.png`.  
- Se graba `signature_url`, `signed_at` e `ip_address` en `form_submissions`.  
- La URL del archivo está firmada con expiración larga (o privada + presigned URL).

### 6.4 Galería Antes/Después (`features/gallery`)
- `PhotoUploader` acepta dos imágenes (before/after) y las sube a `gallery/{client_id}/`.  
- `GalleryCarousel` usa **Swiper** con el módulo `Navigation` para navegar entre pares de fotos.  
- Las imágenes se sirven directamente desde Supabase Storage CDN.

### 6.5 Recordatorios (`features/appointments`)
- Al crear/modificar una cita, se registra en `appointments`.  
- Una **Supabase Edge Function** (`send-reminders`) se ejecuta via `pg_cron` (o cron job externo) cada hora y busca citas en las próximas 24 h donde `reminder_sent = false`.  
- La función llama a la **Twilio Sandbox API para WhatsApp** con el número de teléfono del cliente y actualiza `reminder_sent = true`.  
- Una segunda **Supabase Edge Function** (`whatsapp-webhook`) actúa como Webhook para recibir las respuestas de los clientes enviadas por WhatsApp; parsea el cuerpo del mensaje y actualiza automáticamente la columna `status` de la tabla `appointments` a `confirmed` o `cancelled` según la respuesta del cliente.  
- `date-fns` se usa en el frontend para mostrar fechas formateadas y calcular countdowns.

---

## 7. Convenciones de Código

### 7.1 Nomenclatura
| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `ClientCard.tsx` |
| Hooks | camelCase con `use` | `useClients.ts` |
| Stores | camelCase con `Store` | `authStore.ts` |
| Tipos | PascalCase con sufijo | `Client.ts`, `FormTemplate.ts` |
| Constantes | SCREAMING_SNAKE | `MAX_PHOTO_SIZE_MB` |
| Rutas | kebab-case | `/clients/:id/gallery` |

### 7.2 Esquemas Zod (contrato de datos en frontend)
```typescript
// features/clients/schemas/clientSchema.ts
import { z } from 'zod';

export const clientSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10, 'Ingresa un número válido'),
  birth_date: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientSchema>;
```

### 7.3 Patron de Query (TanStack Query)
```typescript
// features/clients/hooks/useClients.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useClients = () =>
  useQuery({
    queryKey: ['clients'],
    queryFn: () => api.get('/clients').then(r => r.data),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
```

### 7.4 Notificaciones (Sonner)
Todas las notificaciones de éxito y error deben usar `toast` de **Sonner**. Queda prohibido el uso de `alert()` o cualquier librería alternativa.
```typescript
import { toast } from 'sonner';
toast.success('Cliente guardado correctamente.');
toast.error('Error al guardar. Intenta nuevamente.');
```

---

## 8. Seguridad

| Medida | Implementación |
|---|---|
| Autenticación | JWT (Supabase Auth) · Refresh token automático |
| Row Level Security | Cada tabla tiene políticas RLS: el profesional solo accede a sus propios registros |
| Cifrado en reposo | Supabase cifra el disco por defecto (AES-256) |
| Cifrado en tránsito | HTTPS obligatorio en todos los endpoints |
| Firmas digitales | Archivos en Storage con acceso privado + presigned URL temporal |
| Variables de entorno | `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` nunca se commitean (`.env.local`) |
| Headers de seguridad | CSP, X-Frame-Options configurados en el hosting (Vercel/Netlify) |

### 8.1 Ejemplo de política RLS (`clients`)
```sql
-- Solo el dueño puede ver y modificar sus propios clientes
CREATE POLICY "Own clients only" ON clients
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
```

---

## 9. Requerimientos No Funcionales (Implementación)

| Requisito | Estrategia |
|---|---|
| **Responsividad** | Mobile-first con Tailwind. Layouts `sm:`, `md:`, `lg:`. Optimizado para tablet en cabina. |
| **Performance** | TanStack Query con `staleTime` y `cacheTime` configurados. Lazy loading de rutas con `React.lazy`. Swiper con virtualización para galerías grandes. |
| **Offline-ready (Phase 2)** | PWA con Service Worker (Vite PWA plugin). |
| **Accesibilidad** | shadcn/ui sigue WAI-ARIA. Contraste de colores AA mínimo. |

---

## 10. Rutas de la Aplicación

```
/                        → Redirect a /dashboard (si autenticado) o /login
/login                   → LoginPage
/register                → RegisterPage
/dashboard               → DashboardPage (métricas resumen)
/clients                 → ClientsPage (lista + búsqueda)
/clients/:id             → ClientDetailPage
/clients/:id/gallery     → GalleryPage
/clients/:id/forms/:formId → FormFillerPage (ficha + firma)
/forms                   → FormsPage (plantillas)
/forms/new               → FormBuilderPage
/forms/:id/edit          → FormBuilderPage (modo edición)
/appointments            → AppointmentsPage
/settings                → SettingsPage (perfil del profesional)
```

---

## 11. Plan de Implementación por Fases

### Fase 1 — MVP (Core)
- [ ] Scaffolding del proyecto (Vite + TS + Tailwind + shadcn + Zustand)
- [ ] Configuración de Supabase (tablas, RLS, Storage)
- [ ] Módulo Auth (login, registro, rutas protegidas)
- [ ] Módulo Clientes (CRUD completo)
- [ ] Módulo Fichas Dinámicas (Form Builder básico + Renderer)
- [ ] Módulo Firmas Digitales
- [ ] Dashboard básico con métricas

### Fase 2 — Galería y Citas
- [ ] Módulo Galería Antes/Después (Swiper)
- [ ] Módulo Citas (calendario + formulario)
- [ ] Edge Function de recordatorios WhatsApp

### Fase 3 — Pulido y PWA
- [x] PWA (offline, instalar en pantalla de inicio)
- [/] Form Builder con drag-and-drop (@dnd-kit)
- [/] Reportes y exportación PDF de fichas (html2pdf.js)
- [ ] Tests unitarios (Vitest) e integración (Playwright)

---

## 12. Criterios de Aceptación Técnica

1. ✅ Todas las rutas privadas redirigen a `/login` si no hay sesión válida.
2. ✅ Al guardar una ficha con firma, `form_submissions.signature_url` contiene una URL accesible y `signed_at` registra la fecha/hora exacta con zona horaria.
3. ✅ Las notificaciones de éxito y error en la UI utilizan exclusivamente **Sonner**.
4. ✅ Las políticas RLS impiden que un profesional vea datos de otro profesional.
5. ✅ El Lighthouse Score en mobile es ≥ 85 en Performance y ≥ 90 en Accessibility.
6. ✅ El código generado pasa `tsc --noEmit` sin errores de tipado.

---

## 13. Glosario

| Término | Definición |
|---|---|
| **SwaS** | Software with a Service — modelo donde la IA o el equipo acompaña al software con servicio humano. |
| **SDD** | Spec Driven Development — metodología donde los agentes de IA generan código basado en especificaciones formales (PRD, RFC). |
| **Ficha / Anamnesis** | Formulario médico personalizable para registrar alergias, contraindicaciones y datos de salud de la clienta. |
| **RFC** | Request for Comments — documento de diseño técnico que precede la implementación. |
| **RLS** | Row Level Security — política de seguridad a nivel de fila en PostgreSQL/Supabase. |
| **Edge Function** | Función serverless ejecutada en el edge de Supabase para lógica backend. |

---

*Documento preparado por el Arquitecto Senior de RomeroLabs. Versión 1.0 — Sujeto a revisión del equipo.*
