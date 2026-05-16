# TASKS.md â€” Aura CRM by RomeroLabs
## Fase 1 â€” MVP (Core) Â· Plan de Tareas AtÃ³micas

> **MetodologÃ­a:** Spec Driven Development (SDD)  
> **Basado en:** `docs/PRD.md` Â· `docs/RFC.md` (SecciÃ³n 11 â€” Fase 1)  
> **Regla:** Cada tarea es independiente, ejecutable por un subagente de IA en una sola sesiÃ³n.  
> **Estado:** `[ ]` pendiente Â· `[/]` en progreso Â· `[x]` completada

---

## ðŸ�—ï¸� BLOQUE 1 â€” Scaffolding y ConfiguraciÃ³n Base

- [x] **TASK-01 Â· Inicializar proyecto Vite + React + TypeScript**  
  Crear el proyecto con `npm create vite@latest` usando la plantilla `react-ts`. Configurar `tsconfig.json` con `paths` para el alias `@/` apuntando a `src/`. Verificar que `tsc --noEmit` corra sin errores.

- [x] **TASK-02 Â· Instalar y configurar Tailwind CSS**  
  Instalar Tailwind CSS v3 con PostCSS y Autoprefixer. Crear `tailwind.config.js` y `postcss.config.js`. Definir el `content` path para `src/**/*.{ts,tsx}`. Agregar las directivas `@tailwind` en `src/index.css`.

- [x] **TASK-03 Â· Instalar y configurar shadcn/ui**  
  Ejecutar `npx shadcn-ui@latest init` sobre el proyecto existente. Confirmar que el tema base queda en `src/components/ui/`. Agregar los primeros componentes base necesarios: `button`, `input`, `label`, `card`, `dialog`, `toast`.

- [x] **TASK-04 Â· Instalar dependencias del stack completo**  
  Instalar en una sola sesiÃ³n todas las librerÃ­as del stack: `zustand`, `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `react-router-dom`, `sonner`, `date-fns`, `react-signature-canvas`, `swiper`. Verificar que el proyecto compila sin errores.

- [x] **TASK-05 Â· Crear la estructura de carpetas del proyecto**  
  Crear manualmente (con archivos `.gitkeep` o Ã­ndices vacÃ­os) toda la estructura de directorios definida en la SecciÃ³n 4 del RFC: `src/app/`, `src/assets/`, `src/components/ui/`, `src/components/shared/`, `src/features/auth/`, `src/features/dashboard/`, `src/features/clients/`, `src/features/forms/`, `src/features/signatures/`, `src/features/gallery/`, `src/features/appointments/`, `src/lib/`, `src/stores/`, `src/types/`, `src/utils/`.

---

## â˜�ï¸� BLOQUE 2 â€” Backend: Supabase

- [x] **TASK-06 Â· Configurar proyecto Supabase y variables de entorno**  
  Crear el archivo `.env.local` con las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Crear `.env.example` (sin valores reales) para commitear al repo. Agregar `.env.local` al `.gitignore`.

- [x] **TASK-07 Â· Crear cliente de Supabase (`src/lib/supabase.ts`)**  
  Implementar el archivo `src/lib/supabase.ts` que inicializa y exporta el cliente de Supabase usando `@supabase/supabase-js` con las variables de entorno de Vite.

- [x] **TASK-08 Â· MigraciÃ³n SQL: Tabla `profiles` y trigger automÃ¡tico**  
  Escribir y ejecutar el script SQL en Supabase que crea la tabla `profiles` con las columnas del RFC (SecciÃ³n 5.1). Crear el trigger `on_auth_user_created` que inserta un registro en `profiles` automÃ¡ticamente al registrar un usuario en `auth.users`.
- [x] **TASK-09 Â· MigraciÃ³n SQL: Tabla `clients`**  
  Escribir y ejecutar el script SQL que crea la tabla `clients` con todas sus columnas y la FK hacia `profiles.id`. Habilitar RLS y crear la polÃ­tica `"Own clients only"` (SecciÃ³n 8.1 del RFC).
- [x] **TASK-10 Â· MigraciÃ³n SQL: Tablas `form_templates` y `form_submissions`**  
  Escribir y ejecutar el script SQL que crea las tablas `form_templates` y `form_submissions` con columnas `jsonb` para `fields` y `answers`. Habilitar RLS en ambas con polÃ­tica de acceso por `professional_id`.
- [x] **TASK-11 Â· MigraciÃ³n SQL: Tabla `appointments`**  
  Escribir y ejecutar el script SQL que crea la tabla `appointments` con sus columnas (incluyendo el campo `status` con valores `pending`, `confirmed`, `cancelled`, `completed`). Habilitar RLS con polÃ­tica de acceso por `professional_id`.
- [x] **TASK-12 Â· MigraciÃ³n SQL: Tabla `gallery_items` y buckets de Storage**  
  Escribir y ejecutar el script SQL para la tabla `gallery_items`. Crear en Supabase Storage los buckets `signatures` y `gallery`, configurando el bucket `signatures` como privado y `gallery` como privado. Crear polÃ­ticas de Storage RLS para acceso por usuario autenticado.

---

## ðŸ”� BLOQUE 3 â€” MÃ³dulo Auth

- [x] **TASK-13 Â· Crear `authStore` de Zustand (`src/stores/authStore.ts`)**  
  Implementar el store de Zustand para Auth que maneja `session`, `user`, `isLoading`. Suscribirse a `onAuthStateChange`.
- [x] **TASK-14 Â· Crear instancia de Axios con interceptor JWT (`src/lib/axios.ts`)**  
  Configurar Axios con interceptor para inyectar el token de sesiÃ³n en las peticiones.
- [x] **TASK-15 Â· Configurar TanStack Query Client (`src/lib/queryClient.ts`)**  
  ConfiguraciÃ³n global de QueryClient con polÃ­ticas de cachÃ© del RFC.
- [x] **TASK-16 Â· Crear tipos globales de Auth (`src/features/auth/types/auth.types.ts`)**  
  DefiniciÃ³n de interfaces para Profile y AuthStatus.
- [x] **TASK-17 Â· Implementar `LoginPage` y `LoginForm`**  
  Interfaz de login con validaciÃ³n Zod y conexiÃ³n a Supabase.
- [x] **TASK-18 Â· Implementar `RegisterPage` y `RegisterForm`**  
  Interfaz de registro con validaciÃ³n Zod y gestiÃ³n de perfiles.
- [x] **TASK-19 Â· Crear hook `useAuth` (`src/features/auth/hooks/useAuth.ts`)**  
  Encapsular la lÃ³gica de autenticaciÃ³n: `login`, `logout`, `register`.
- [x] **TASK-20 Â· Implementar el componente `PrivateRoute` y configurar React Router**  
  ProtecciÃ³n de rutas y configuraciÃ³n de `App.tsx` con lazy loading.

---

## ðŸ‘¥ BLOQUE 4 â€” MÃ³dulo Clientes

- [x] **TASK-21 Â· Crear tipos globales de Clientes (`src/features/clients/types/client.types.ts`)**  
  Definir la interfaz `Client` y los tipos de entrada para creaciÃ³n y actualizaciÃ³n.
- [x] **TASK-22 Â· Implementar hook `useClients` (`src/features/clients/hooks/useClients.ts`)**  
  Implementar consultas con TanStack Query para listar, buscar, crear y actualizar clientes.
- [x] **TASK-23 Â· Implementar componente `ClientSearch` y `ClientCard`**  
  Crear la barra de bÃºsqueda y la tarjeta de cliente para el listado.
- [x] **TASK-24 Â· Implementar formulario `ClientForm` (Zod)**  
  Crear el formulario con validaciÃ³n para los campos requeridos y opcionales.
- [x] **TASK-25 Â· Implementar `ClientsPage` (Listado)**  
  Crear la vista principal de clientes con el buscador y el botÃ³n de aÃ±adir.
- [x] **TASK-26 Â· Implementar `ClientDetailPage`**  
  Crear la vista de detalle con la informaciÃ³n completa de la clienta.
- [x] **TASK-27 Â· Registrar rutas de Clientes en `App.tsx`**  
  AÃ±adir las rutas `/clients` y `/clients/:id` protegidas por `PrivateRoute`.

---

## ðŸ“‹ BLOQUE 5 â€” MÃ³dulo Fichas DinÃ¡micas

- [x] **TASK-26 Â· Definir tipos y schema Zod de Formularios**  
  Crear `src/features/forms/types/form.types.ts` con los tipos `FormField`, `FormTemplate`, `FormSubmission`. Crear `src/features/forms/schemas/formSchema.ts` con el schema Zod que valida la estructura JSON de campos (type, label, required, options).

- [x] **TASK-27 Â· Implementar hooks de datos de Formularios**  
  Crear `src/features/forms/hooks/useForms.ts` para listar plantillas del profesional. Crear `useCreateTemplate`, `useUpdateTemplate`, `useDeleteTemplate` con `useMutation`. Crear `useSubmitForm` para enviar una ficha completa a `form_submissions`.

- [x] **TASK-28 Â· Implementar `FormBuilder` (creador de plantillas)**  
  Crear `src/features/forms/components/FormBuilder.tsx`. Permite al profesional aÃ±adir campos a una plantilla (tipo, label, si es requerido, opciones para select). Los campos se gestionan internamente con `useState` y se guardan como JSONB al enviar. Sin drag-and-drop (Fase 1).

- [x] **TASK-29 Â· Implementar `FormRenderer` (visualizador/completador de ficha)**  
  Crear `src/features/forms/components/FormRenderer.tsx`. Recibe la definiciÃ³n de campos de una plantilla y genera dinÃ¡micamente un formulario con React Hook Form + schema Zod generado en runtime. Soporta tipos: `text`, `textarea`, `select`, `checkbox`.

- [x] **TASK-30 Â· Implementar `FormsPage` y `FormFillerPage`**  
  Crear `src/features/forms/pages/FormsPage.tsx` para gestionar las plantillas del profesional (listar, crear, editar, eliminar). Crear `src/features/forms/pages/FormFillerPage.tsx` que combine el `FormRenderer` con el `SignaturePad` para completar una ficha de una clienta especÃ­fica y guardar la `form_submission`.

---

## âœ�ï¸� BLOQUE 6 â€” MÃ³dulo Firmas Digitales

- [x] **TASK-31 Â· Implementar componente `SignaturePad`**  
  Crear `src/features/signatures/components/SignaturePad.tsx` usando `react-signature-canvas`. Debe exponer las acciones: limpiar el trazo, exportar el trazo como `image/png` en Base64. Incluir botones "Limpiar" y "Confirmar". DiseÃ±o responsivo y apto para uso en pantalla tÃ¡ctil.

- [x] **TASK-32 Â· Implementar hook `useSignature` para subir firma a Storage**  
  Crear `src/features/signatures/hooks/useSignature.ts`. Encapsula la lÃ³gica de: recibir el Base64 de la firma, convertirlo a Blob, subirlo a Supabase Storage en el bucket `signatures` bajo la ruta `{submission_id}.png` y retornar la URL del archivo. Manejar errores con Sonner.

- [x] **TASK-33 Â· Integrar firma digital en `FormFillerPage`**  
  Conectar el `SignaturePad` y el `useSignature` hook dentro de `FormFillerPage`. Al confirmarse el formulario: (1) subir la firma, (2) obtener la URL, (3) incluir `signature_url`, `signed_at` (timestamp actual con timezone) e `ip_address` en el payload de `form_submissions`.

---

## ðŸ“Š BLOQUE 7 â€” Dashboard

- [x] **TASK-34 Â· Implementar `DashboardPage` con mÃ©tricas bÃ¡sicas**  
  Crear `src/features/dashboard/pages/DashboardPage.tsx`. Mostrar tarjetas de mÃ©tricas resumen usando `useQuery`: total de clientas registradas, total de fichas completadas, total de citas pendientes. Usar componentes `Card` de shadcn/ui. Los datos se leen directamente desde Supabase via Axios + TanStack Query.

---

## ðŸŽ¨ BLOQUE 8 â€” Layout y UI Global

- [x] **TASK-35 Â· Crear `uiStore` de Zustand (`src/stores/uiStore.ts`)**  
  Implementar el store de UI que gestione el estado efÃ­mero de la app: `isSidebarOpen` (boolean), `activeModal` (string | null). Incluir acciones: `toggleSidebar`, `openModal`, `closeModal`.

- [x] **TASK-36 Â· Implementar Layout principal con Sidebar y Header**  
  Crear `src/components/shared/AppLayout.tsx` que incluya: un `Sidebar` con navegaciÃ³n a todas las rutas principales (Dashboard, Clientes, Fichas, Citas, ConfiguraciÃ³n) y un `Header` con el nombre del salÃ³n y un botÃ³n de logout. Responsivo: sidebar colapsable en mÃ³vil usando el `uiStore`. Integrar el `<Toaster />` de Sonner en este layout.

- [x] **TASK-37 Â· Configurar `Providers` globales en `main.tsx`**  
  Actualizar `src/main.tsx` para envolver la aplicaciÃ³n con: `QueryClientProvider` (TanStack Query), `BrowserRouter` (React Router) y el `<Toaster />` de Sonner. Asegurarse de que el `authStore` inicialice la sesiÃ³n desde Supabase en el arranque.

---

## âœ… BLOQUE 9 â€” VerificaciÃ³n Final de Fase 1

- [x] **TASK-38 Â· VerificaciÃ³n de criterios de aceptaciÃ³n del RFC**  
  Revisar y confirmar manualmente los 6 criterios de la SecciÃ³n 12 del RFC:  
  1. Rutas privadas redirigen a `/login` sin sesiÃ³n.  
  2. Al guardar ficha con firma, `signature_url` y `signed_at` se persisten correctamente.  
  3. Todas las notificaciones usan exclusivamente Sonner.  
  4. Las polÃ­ticas RLS impiden acceso cruzado entre profesionales.  
  5. No hay errores de `tsc --noEmit`.  
  6. El build de producciÃ³n (`npm run build`) finaliza sin errores.

---

---

## ðŸŽ¨ Fase 2 â€” MÃ³dulo GalerÃ­a y UX Avanzada

## ðŸ–¼ï¸� BLOQUE 10 â€” MÃ³dulo GalerÃ­a (Fase 2)

- [x] **TASK-39 Â· Definir tipos de GalerÃ­a y Estructura de Datos**  
  Crear `src/features/gallery/types/gallery.types.ts` con la interfaz `GalleryItem` (id, client_id, before_url, after_url, treatment, taken_at, notes).
- [x] **TASK-40 Â· Implementar Hooks de GalerÃ­a (`useGallery`, `useUploadGalleryItem`)**  
  Crear la lÃ³gica de negocio para interactuar con Supabase Storage (bucket `gallery`) y la tabla `gallery_items`. Manejar subida paralela de fotos y persistencia.
- [x] **TASK-41 Â· Crear componente `PhotoUploader` con PrevisualizaciÃ³n**  
  Desarrollar la interfaz de subida con `shadcn/ui`, permitiendo seleccionar dos fotos, previsualizarlas y aÃ±adir metadatos del tratamiento.
- [x] **TASK-42 Â· Implementar `GalleryCarousel` con Swiper.js**  
  Crear el carrusel interactivo para comparar fotos "Antes/DespuÃ©s" con navegaciÃ³n tÃ¡ctil, paginaciÃ³n dinÃ¡mica y diseÃ±o premium.
- [x] **TASK-43 Â· IntegraciÃ³n en `ClientDetailPage`**  
  Reemplazar el placeholder de historial por la galerÃ­a real. AÃ±adir disparador (Dialog) para nuevas subidas y contador de sesiones.
- [x] **TASK-44 Â· VerificaciÃ³n de Tipos y CompilaciÃ³n**  
  Ejecutar `tsc --noEmit` y asegurar que no existen errores de importaciÃ³n de mÃ³dulos (Swiper CSS, tipos de React Hook Form).

---

*Documento actualizado por el Subagente de ImplementaciÃ³n Â· Fase 2 GalerÃ­a Â· 2026-04-03*

---

## ðŸ“… BLOQUE 11 â€” MÃ³dulo Citas (Fase 2)

- [x] **TASK-APT-01 Â· Definir tipos y esquemas de Citas**  
  Crear `src/features/appointments/types/appointment.types.ts` con la interfaz `Appointment` y el schema Zod para validaciÃ³n de formularios.
- [x] **TASK-APT-02 Â· Implementar hook `useAppointments`**  
  Crear la lÃ³gica para listar, crear, actualizar (estado) y eliminar citas conectando con Supabase. Soporte para filtrado por cliente.
- [x] **TASK-APT-03 Â· Crear componentes `AppointmentForm` y `AppointmentCard`**  
  Desarrollar el formulario con selecciÃ³n de fecha/hora y la tarjeta de visualizaciÃ³n con acciones rÃ¡pidas de estado.
- [x] **TASK-APT-04 Â· Implementar `AppointmentsPage` (Agenda Global)**  
  Crear la vista principal de la agenda con pestaÃ±as para citas prÃ³ximas y pasadas.
- [x] **TASK-APT-05 Â· IntegraciÃ³n en `ClientDetailPage`**  
  AÃ±adir botÃ³n de "Programar Cita" y listado de citas prÃ³ximas directamente en el perfil de la clienta.
- [x] **TASK-APT-06 Â· Registro de rutas y VerificaciÃ³n Final**  
  Configurar la ruta `/appointments` en `App.tsx` y validar la compilaciÃ³n con `npm run build`.

*Documento actualizado por el Subagente de ImplementaciÃ³n Â· Fase 2 Citas Â· 2026-04-03*

---

## ðŸ¤– BLOQUE 12 â€” Edge Functions: Recordatorios WhatsApp (Fase 2)

- [x] **TASK-REM-01 Â· Habilitar extensiones `pg_cron` y `pg_net`**  
  Ejecutar migraciÃ³n SQL para instalar `pg_cron` (scheduler de jobs) y `pg_net` (HTTP client desde SQL) en el proyecto Supabase AuraCrm. Ambas extensiones son necesarias para que el cron job llame a la Edge Function sin herramientas externas.

- [x] **TASK-REM-02 Â· Crear Edge Function `send-reminders`**  
  Implementar `supabase/functions/send-reminders/index.ts` en TypeScript/Deno. La funciÃ³n:
  - Se invoca via HTTP (sin JWT) desde el cron job de pg_cron.
  - Usa `SUPABASE_SERVICE_ROLE_KEY` para consultar `appointments` + `clients` sin restricciones de RLS.
  - Filtra citas con `reminder_sent = false`, `status = 'pending'` y `scheduled_at` en las prÃ³ximas 24 horas.
  - Formatea el mensaje en espaÃ±ol (es-AR) e invoca la API REST de Twilio Sandbox para WhatsApp.
  - Actualiza `reminder_sent = true` tras el envÃ­o exitoso.
  - **Desplegada en Supabase** con `verify_jwt: false`. Status: `ACTIVE`.

- [x] **TASK-REM-03 Â· Crear Edge Function `twilio-webhook`**  
  Implementar `supabase/functions/twilio-webhook/index.ts` en TypeScript/Deno. La funciÃ³n:
  - Recibe POST de Twilio con el cuerpo `application/x-www-form-urlencoded`.
  - Extrae `From` (nÃºmero del cliente) y `Body` (texto de respuesta).
  - Parsea la intenciÃ³n: palabras afirmativas â†’ `confirmed`; negativas â†’ `cancelled`; no reconocidas â†’ TwiML vacÃ­o.
  - Busca la cita mÃ¡s prÃ³xima con `reminder_sent = true` y `status = 'pending'` del nÃºmero de telÃ©fono.
  - Actualiza `appointments.status` a `confirmed` o `cancelled`.
  - Responde a Twilio con TwiML confirmando la acciÃ³n al cliente.
  - **Desplegada en Supabase** con `verify_jwt: false`. Status: `ACTIVE`.

- [x] **TASK-REM-04 Â· Programar cron job con `pg_cron`**  
  Ejecutar migraciÃ³n SQL que registra el job `'send-appointment-reminders'` con expresiÃ³n `'0 * * * *'` (cada hora en punto). El job llama via `pg_net.http_post` a la URL de la Edge Function `send-reminders`.  
  **URL del webhook:** `https://obskmtyfxfwgqzzekrmy.supabase.co/functions/v1/twilio-webhook`

- [x] **TASK-REM-05 Â· Configurar Secrets de Twilio en Supabase**  
  Configurados vÃ­a browser en Supabase Dashboard â†’ Settings â†’ Edge Functions â†’ Secrets:
  - `TWILIO_ACCOUNT_SID` âœ…
  - `TWILIO_AUTH_TOKEN` âœ…
  - `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886` âœ…

- [x] **TASK-REM-06 Â· Configurar Twilio Sandbox Webhook**  
  Configurado vÃ­a browser en Twilio Console â†’ Messaging â†’ Try it out â†’ Send a WhatsApp message â†’ Sandbox settings:  
  - **"When a message comes in"**: `https://obskmtyfxfwgqzzekrmy.supabase.co/functions/v1/twilio-webhook` âœ…  
  - **Method**: `POST` âœ…

*Documento actualizado por el Subagente de Backend Â· Fase 2 Edge Functions Twilio Â· 2026-04-05*

---

## ?? Fase 3 — Pulido y PWA

### ??? BLOQUE 13 — Mejoras y Funcionalidades Finales (Fase 3)

- [x] **TASK-F3-01 · PWA (offline, instalar en pantalla de inicio)**
- [x] **TASK-F3-02 · Form Builder con drag-and-drop (@dnd-kit)**
- [x] **TASK-F3-03 · Reportes y exportación PDF de fichas (html2pdf.js)**
- [x] **TASK-F3-04 · Tests unitarios (Vitest) e integración (Playwright)**

*Documento actualizado por el Subagente de QA y Testing · Fase 3 Testing · 2026-05-16*
