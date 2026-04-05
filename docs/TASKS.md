# TASKS.md — Aura CRM by RomeroLabs
## Fase 1 — MVP (Core) · Plan de Tareas Atómicas

> **Metodología:** Spec Driven Development (SDD)  
> **Basado en:** `docs/PRD.md` · `docs/RFC.md` (Sección 11 — Fase 1)  
> **Regla:** Cada tarea es independiente, ejecutable por un subagente de IA en una sola sesión.  
> **Estado:** `[ ]` pendiente · `[/]` en progreso · `[x]` completada

---

## 🏗️ BLOQUE 1 — Scaffolding y Configuración Base

- [x] **TASK-01 · Inicializar proyecto Vite + React + TypeScript**  
  Crear el proyecto con `npm create vite@latest` usando la plantilla `react-ts`. Configurar `tsconfig.json` con `paths` para el alias `@/` apuntando a `src/`. Verificar que `tsc --noEmit` corra sin errores.

- [x] **TASK-02 · Instalar y configurar Tailwind CSS**  
  Instalar Tailwind CSS v3 con PostCSS y Autoprefixer. Crear `tailwind.config.js` y `postcss.config.js`. Definir el `content` path para `src/**/*.{ts,tsx}`. Agregar las directivas `@tailwind` en `src/index.css`.

- [x] **TASK-03 · Instalar y configurar shadcn/ui**  
  Ejecutar `npx shadcn-ui@latest init` sobre el proyecto existente. Confirmar que el tema base queda en `src/components/ui/`. Agregar los primeros componentes base necesarios: `button`, `input`, `label`, `card`, `dialog`, `toast`.

- [x] **TASK-04 · Instalar dependencias del stack completo**  
  Instalar en una sola sesión todas las librerías del stack: `zustand`, `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `react-router-dom`, `sonner`, `date-fns`, `react-signature-canvas`, `swiper`. Verificar que el proyecto compila sin errores.

- [x] **TASK-05 · Crear la estructura de carpetas del proyecto**  
  Crear manualmente (con archivos `.gitkeep` o índices vacíos) toda la estructura de directorios definida en la Sección 4 del RFC: `src/app/`, `src/assets/`, `src/components/ui/`, `src/components/shared/`, `src/features/auth/`, `src/features/dashboard/`, `src/features/clients/`, `src/features/forms/`, `src/features/signatures/`, `src/features/gallery/`, `src/features/appointments/`, `src/lib/`, `src/stores/`, `src/types/`, `src/utils/`.

---

## ☁️ BLOQUE 2 — Backend: Supabase

- [x] **TASK-06 · Configurar proyecto Supabase y variables de entorno**  
  Crear el archivo `.env.local` con las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Crear `.env.example` (sin valores reales) para commitear al repo. Agregar `.env.local` al `.gitignore`.

- [x] **TASK-07 · Crear cliente de Supabase (`src/lib/supabase.ts`)**  
  Implementar el archivo `src/lib/supabase.ts` que inicializa y exporta el cliente de Supabase usando `@supabase/supabase-js` con las variables de entorno de Vite.

- [x] **TASK-08 · Migración SQL: Tabla `profiles` y trigger automático**  
  Escribir y ejecutar el script SQL en Supabase que crea la tabla `profiles` con las columnas del RFC (Sección 5.1). Crear el trigger `on_auth_user_created` que inserta un registro en `profiles` automáticamente al registrar un usuario en `auth.users`.
- [x] **TASK-09 · Migración SQL: Tabla `clients`**  
  Escribir y ejecutar el script SQL que crea la tabla `clients` con todas sus columnas y la FK hacia `profiles.id`. Habilitar RLS y crear la política `"Own clients only"` (Sección 8.1 del RFC).
- [x] **TASK-10 · Migración SQL: Tablas `form_templates` y `form_submissions`**  
  Escribir y ejecutar el script SQL que crea las tablas `form_templates` y `form_submissions` con columnas `jsonb` para `fields` y `answers`. Habilitar RLS en ambas con política de acceso por `professional_id`.
- [x] **TASK-11 · Migración SQL: Tabla `appointments`**  
  Escribir y ejecutar el script SQL que crea la tabla `appointments` con sus columnas (incluyendo el campo `status` con valores `pending`, `confirmed`, `cancelled`, `completed`). Habilitar RLS con política de acceso por `professional_id`.
- [x] **TASK-12 · Migración SQL: Tabla `gallery_items` y buckets de Storage**  
  Escribir y ejecutar el script SQL para la tabla `gallery_items`. Crear en Supabase Storage los buckets `signatures` y `gallery`, configurando el bucket `signatures` como privado y `gallery` como privado. Crear políticas de Storage RLS para acceso por usuario autenticado.

---

## 🔐 BLOQUE 3 — Módulo Auth

- [x] **TASK-13 · Crear `authStore` de Zustand (`src/stores/authStore.ts`)**  
  Implementar el store de Zustand para Auth que maneja `session`, `user`, `isLoading`. Suscribirse a `onAuthStateChange`.
- [x] **TASK-14 · Crear instancia de Axios con interceptor JWT (`src/lib/axios.ts`)**  
  Configurar Axios con interceptor para inyectar el token de sesión en las peticiones.
- [x] **TASK-15 · Configurar TanStack Query Client (`src/lib/queryClient.ts`)**  
  Configuración global de QueryClient con políticas de caché del RFC.
- [x] **TASK-16 · Crear tipos globales de Auth (`src/features/auth/types/auth.types.ts`)**  
  Definición de interfaces para Profile y AuthStatus.
- [x] **TASK-17 · Implementar `LoginPage` y `LoginForm`**  
  Interfaz de login con validación Zod y conexión a Supabase.
- [x] **TASK-18 · Implementar `RegisterPage` y `RegisterForm`**  
  Interfaz de registro con validación Zod y gestión de perfiles.
- [x] **TASK-19 · Crear hook `useAuth` (`src/features/auth/hooks/useAuth.ts`)**  
  Encapsular la lógica de autenticación: `login`, `logout`, `register`.
- [x] **TASK-20 · Implementar el componente `PrivateRoute` y configurar React Router**  
  Protección de rutas y configuración de `App.tsx` con lazy loading.

---

## 👥 BLOQUE 4 — Módulo Clientes

- [x] **TASK-21 · Crear tipos globales de Clientes (`src/features/clients/types/client.types.ts`)**  
  Definir la interfaz `Client` y los tipos de entrada para creación y actualización.
- [x] **TASK-22 · Implementar hook `useClients` (`src/features/clients/hooks/useClients.ts`)**  
  Implementar consultas con TanStack Query para listar, buscar, crear y actualizar clientes.
- [x] **TASK-23 · Implementar componente `ClientSearch` y `ClientCard`**  
  Crear la barra de búsqueda y la tarjeta de cliente para el listado.
- [x] **TASK-24 · Implementar formulario `ClientForm` (Zod)**  
  Crear el formulario con validación para los campos requeridos y opcionales.
- [x] **TASK-25 · Implementar `ClientsPage` (Listado)**  
  Crear la vista principal de clientes con el buscador y el botón de añadir.
- [x] **TASK-26 · Implementar `ClientDetailPage`**  
  Crear la vista de detalle con la información completa de la clienta.
- [x] **TASK-27 · Registrar rutas de Clientes en `App.tsx`**  
  Añadir las rutas `/clients` y `/clients/:id` protegidas por `PrivateRoute`.

---

## 📋 BLOQUE 5 — Módulo Fichas Dinámicas

- [x] **TASK-26 · Definir tipos y schema Zod de Formularios**  
  Crear `src/features/forms/types/form.types.ts` con los tipos `FormField`, `FormTemplate`, `FormSubmission`. Crear `src/features/forms/schemas/formSchema.ts` con el schema Zod que valida la estructura JSON de campos (type, label, required, options).

- [x] **TASK-27 · Implementar hooks de datos de Formularios**  
  Crear `src/features/forms/hooks/useForms.ts` para listar plantillas del profesional. Crear `useCreateTemplate`, `useUpdateTemplate`, `useDeleteTemplate` con `useMutation`. Crear `useSubmitForm` para enviar una ficha completa a `form_submissions`.

- [x] **TASK-28 · Implementar `FormBuilder` (creador de plantillas)**  
  Crear `src/features/forms/components/FormBuilder.tsx`. Permite al profesional añadir campos a una plantilla (tipo, label, si es requerido, opciones para select). Los campos se gestionan internamente con `useState` y se guardan como JSONB al enviar. Sin drag-and-drop (Fase 1).

- [x] **TASK-29 · Implementar `FormRenderer` (visualizador/completador de ficha)**  
  Crear `src/features/forms/components/FormRenderer.tsx`. Recibe la definición de campos de una plantilla y genera dinámicamente un formulario con React Hook Form + schema Zod generado en runtime. Soporta tipos: `text`, `textarea`, `select`, `checkbox`.

- [x] **TASK-30 · Implementar `FormsPage` y `FormFillerPage`**  
  Crear `src/features/forms/pages/FormsPage.tsx` para gestionar las plantillas del profesional (listar, crear, editar, eliminar). Crear `src/features/forms/pages/FormFillerPage.tsx` que combine el `FormRenderer` con el `SignaturePad` para completar una ficha de una clienta específica y guardar la `form_submission`.

---

## ✍️ BLOQUE 6 — Módulo Firmas Digitales

- [x] **TASK-31 · Implementar componente `SignaturePad`**  
  Crear `src/features/signatures/components/SignaturePad.tsx` usando `react-signature-canvas`. Debe exponer las acciones: limpiar el trazo, exportar el trazo como `image/png` en Base64. Incluir botones "Limpiar" y "Confirmar". Diseño responsivo y apto para uso en pantalla táctil.

- [x] **TASK-32 · Implementar hook `useSignature` para subir firma a Storage**  
  Crear `src/features/signatures/hooks/useSignature.ts`. Encapsula la lógica de: recibir el Base64 de la firma, convertirlo a Blob, subirlo a Supabase Storage en el bucket `signatures` bajo la ruta `{submission_id}.png` y retornar la URL del archivo. Manejar errores con Sonner.

- [x] **TASK-33 · Integrar firma digital en `FormFillerPage`**  
  Conectar el `SignaturePad` y el `useSignature` hook dentro de `FormFillerPage`. Al confirmarse el formulario: (1) subir la firma, (2) obtener la URL, (3) incluir `signature_url`, `signed_at` (timestamp actual con timezone) e `ip_address` en el payload de `form_submissions`.

---

## 📊 BLOQUE 7 — Dashboard

- [x] **TASK-34 · Implementar `DashboardPage` con métricas básicas**  
  Crear `src/features/dashboard/pages/DashboardPage.tsx`. Mostrar tarjetas de métricas resumen usando `useQuery`: total de clientas registradas, total de fichas completadas, total de citas pendientes. Usar componentes `Card` de shadcn/ui. Los datos se leen directamente desde Supabase via Axios + TanStack Query.

---

## 🎨 BLOQUE 8 — Layout y UI Global

- [x] **TASK-35 · Crear `uiStore` de Zustand (`src/stores/uiStore.ts`)**  
  Implementar el store de UI que gestione el estado efímero de la app: `isSidebarOpen` (boolean), `activeModal` (string | null). Incluir acciones: `toggleSidebar`, `openModal`, `closeModal`.

- [x] **TASK-36 · Implementar Layout principal con Sidebar y Header**  
  Crear `src/components/shared/AppLayout.tsx` que incluya: un `Sidebar` con navegación a todas las rutas principales (Dashboard, Clientes, Fichas, Citas, Configuración) y un `Header` con el nombre del salón y un botón de logout. Responsivo: sidebar colapsable en móvil usando el `uiStore`. Integrar el `<Toaster />` de Sonner en este layout.

- [x] **TASK-37 · Configurar `Providers` globales en `main.tsx`**  
  Actualizar `src/main.tsx` para envolver la aplicación con: `QueryClientProvider` (TanStack Query), `BrowserRouter` (React Router) y el `<Toaster />` de Sonner. Asegurarse de que el `authStore` inicialice la sesión desde Supabase en el arranque.

---

## ✅ BLOQUE 9 — Verificación Final de Fase 1

- [x] **TASK-38 · Verificación de criterios de aceptación del RFC**  
  Revisar y confirmar manualmente los 6 criterios de la Sección 12 del RFC:  
  1. Rutas privadas redirigen a `/login` sin sesión.  
  2. Al guardar ficha con firma, `signature_url` y `signed_at` se persisten correctamente.  
  3. Todas las notificaciones usan exclusivamente Sonner.  
  4. Las políticas RLS impiden acceso cruzado entre profesionales.  
  5. No hay errores de `tsc --noEmit`.  
  6. El build de producción (`npm run build`) finaliza sin errores.

---

---

## 🎨 Fase 2 — Módulo Galería y UX Avanzada

## 🖼️ BLOQUE 10 — Módulo Galería (Fase 2)

- [x] **TASK-39 · Definir tipos de Galería y Estructura de Datos**  
  Crear `src/features/gallery/types/gallery.types.ts` con la interfaz `GalleryItem` (id, client_id, before_url, after_url, treatment, taken_at, notes).
- [x] **TASK-40 · Implementar Hooks de Galería (`useGallery`, `useUploadGalleryItem`)**  
  Crear la lógica de negocio para interactuar con Supabase Storage (bucket `gallery`) y la tabla `gallery_items`. Manejar subida paralela de fotos y persistencia.
- [x] **TASK-41 · Crear componente `PhotoUploader` con Previsualización**  
  Desarrollar la interfaz de subida con `shadcn/ui`, permitiendo seleccionar dos fotos, previsualizarlas y añadir metadatos del tratamiento.
- [x] **TASK-42 · Implementar `GalleryCarousel` con Swiper.js**  
  Crear el carrusel interactivo para comparar fotos "Antes/Después" con navegación táctil, paginación dinámica y diseño premium.
- [x] **TASK-43 · Integración en `ClientDetailPage`**  
  Reemplazar el placeholder de historial por la galería real. Añadir disparador (Dialog) para nuevas subidas y contador de sesiones.
- [x] **TASK-44 · Verificación de Tipos y Compilación**  
  Ejecutar `tsc --noEmit` y asegurar que no existen errores de importación de módulos (Swiper CSS, tipos de React Hook Form).

---

*Documento actualizado por el Subagente de Implementación · Fase 2 Galería · 2026-04-03*

---

## 📅 BLOQUE 11 — Módulo Citas (Fase 2)

- [x] **TASK-APT-01 · Definir tipos y esquemas de Citas**  
  Crear `src/features/appointments/types/appointment.types.ts` con la interfaz `Appointment` y el schema Zod para validación de formularios.
- [x] **TASK-APT-02 · Implementar hook `useAppointments`**  
  Crear la lógica para listar, crear, actualizar (estado) y eliminar citas conectando con Supabase. Soporte para filtrado por cliente.
- [x] **TASK-APT-03 · Crear componentes `AppointmentForm` y `AppointmentCard`**  
  Desarrollar el formulario con selección de fecha/hora y la tarjeta de visualización con acciones rápidas de estado.
- [x] **TASK-APT-04 · Implementar `AppointmentsPage` (Agenda Global)**  
  Crear la vista principal de la agenda con pestañas para citas próximas y pasadas.
- [x] **TASK-APT-05 · Integración en `ClientDetailPage`**  
  Añadir botón de "Programar Cita" y listado de citas próximas directamente en el perfil de la clienta.
- [x] **TASK-APT-06 · Registro de rutas y Verificación Final**  
  Configurar la ruta `/appointments` en `App.tsx` y validar la compilación con `npm run build`.

*Documento actualizado por el Subagente de Implementación · Fase 2 Citas · 2026-04-03*

---

## 🤖 BLOQUE 12 — Edge Functions: Recordatorios WhatsApp (Fase 2)

- [x] **TASK-REM-01 · Habilitar extensiones `pg_cron` y `pg_net`**  
  Ejecutar migración SQL para instalar `pg_cron` (scheduler de jobs) y `pg_net` (HTTP client desde SQL) en el proyecto Supabase AuraCrm. Ambas extensiones son necesarias para que el cron job llame a la Edge Function sin herramientas externas.

- [x] **TASK-REM-02 · Crear Edge Function `send-reminders`**  
  Implementar `supabase/functions/send-reminders/index.ts` en TypeScript/Deno. La función:
  - Se invoca via HTTP (sin JWT) desde el cron job de pg_cron.
  - Usa `SUPABASE_SERVICE_ROLE_KEY` para consultar `appointments` + `clients` sin restricciones de RLS.
  - Filtra citas con `reminder_sent = false`, `status = 'pending'` y `scheduled_at` en las próximas 24 horas.
  - Formatea el mensaje en español (es-AR) e invoca la API REST de Twilio Sandbox para WhatsApp.
  - Actualiza `reminder_sent = true` tras el envío exitoso.
  - **Desplegada en Supabase** con `verify_jwt: false`. Status: `ACTIVE`.

- [x] **TASK-REM-03 · Crear Edge Function `twilio-webhook`**  
  Implementar `supabase/functions/twilio-webhook/index.ts` en TypeScript/Deno. La función:
  - Recibe POST de Twilio con el cuerpo `application/x-www-form-urlencoded`.
  - Extrae `From` (número del cliente) y `Body` (texto de respuesta).
  - Parsea la intención: palabras afirmativas → `confirmed`; negativas → `cancelled`; no reconocidas → TwiML vacío.
  - Busca la cita más próxima con `reminder_sent = true` y `status = 'pending'` del número de teléfono.
  - Actualiza `appointments.status` a `confirmed` o `cancelled`.
  - Responde a Twilio con TwiML confirmando la acción al cliente.
  - **Desplegada en Supabase** con `verify_jwt: false`. Status: `ACTIVE`.

- [x] **TASK-REM-04 · Programar cron job con `pg_cron`**  
  Ejecutar migración SQL que registra el job `'send-appointment-reminders'` con expresión `'0 * * * *'` (cada hora en punto). El job llama via `pg_net.http_post` a la URL de la Edge Function `send-reminders`.  
  **URL del webhook:** `https://obskmtyfxfwgqzzekrmy.supabase.co/functions/v1/twilio-webhook`

- [x] **TASK-REM-05 · Configurar Secrets de Twilio en Supabase**  
  Configurados vía browser en Supabase Dashboard → Settings → Edge Functions → Secrets:
  - `TWILIO_ACCOUNT_SID` ✅
  - `TWILIO_AUTH_TOKEN` ✅
  - `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886` ✅

- [x] **TASK-REM-06 · Configurar Twilio Sandbox Webhook**  
  Configurado vía browser en Twilio Console → Messaging → Try it out → Send a WhatsApp message → Sandbox settings:  
  - **"When a message comes in"**: `https://obskmtyfxfwgqzzekrmy.supabase.co/functions/v1/twilio-webhook` ✅  
  - **Method**: `POST` ✅

*Documento actualizado por el Subagente de Backend · Fase 2 Edge Functions Twilio · 2026-04-05*
