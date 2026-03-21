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

- [ ] **TASK-03 · Instalar y configurar shadcn/ui**  
  Ejecutar `npx shadcn-ui@latest init` sobre el proyecto existente. Confirmar que el tema base queda en `src/components/ui/`. Agregar los primeros componentes base necesarios: `button`, `input`, `label`, `card`, `dialog`, `toast`.

- [ ] **TASK-04 · Instalar dependencias del stack completo**  
  Instalar en una sola sesión todas las librerías del stack: `zustand`, `@tanstack/react-query`, `axios`, `react-hook-form`, `zod`, `@hookform/resolvers`, `react-router-dom`, `sonner`, `date-fns`, `react-signature-canvas`, `swiper`. Verificar que el proyecto compila sin errores.

- [ ] **TASK-05 · Crear la estructura de carpetas del proyecto**  
  Crear manualmente (con archivos `.gitkeep` o índices vacíos) toda la estructura de directorios definida en la Sección 4 del RFC: `src/app/`, `src/assets/`, `src/components/ui/`, `src/components/shared/`, `src/features/auth/`, `src/features/dashboard/`, `src/features/clients/`, `src/features/forms/`, `src/features/signatures/`, `src/features/gallery/`, `src/features/appointments/`, `src/lib/`, `src/stores/`, `src/types/`, `src/utils/`.

---

## ☁️ BLOQUE 2 — Backend: Supabase

- [ ] **TASK-06 · Configurar proyecto Supabase y variables de entorno**  
  Crear el archivo `.env.local` con las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Crear `.env.example` (sin valores reales) para commitear al repo. Agregar `.env.local` al `.gitignore`.

- [ ] **TASK-07 · Crear cliente de Supabase (`src/lib/supabase.ts`)**  
  Implementar el archivo `src/lib/supabase.ts` que inicializa y exporta el cliente de Supabase usando `@supabase/supabase-js` con las variables de entorno de Vite.

- [ ] **TASK-08 · Migración SQL: Tabla `profiles` y trigger automático**  
  Escribir y ejecutar el script SQL en Supabase que crea la tabla `profiles` con las columnas del RFC (Sección 5.1). Crear el trigger `on_auth_user_created` que inserta un registro en `profiles` automáticamente al registrar un usuario en `auth.users`.

- [ ] **TASK-09 · Migración SQL: Tabla `clients`**  
  Escribir y ejecutar el script SQL que crea la tabla `clients` con todas sus columnas y la FK hacia `profiles.id`. Habilitar RLS y crear la política `"Own clients only"` (Sección 8.1 del RFC).

- [ ] **TASK-10 · Migración SQL: Tablas `form_templates` y `form_submissions`**  
  Escribir y ejecutar el script SQL que crea las tablas `form_templates` y `form_submissions` con columnas `jsonb` para `fields` y `answers`. Habilitar RLS en ambas con política de acceso por `professional_id`.

- [ ] **TASK-11 · Migración SQL: Tabla `appointments`**  
  Escribir y ejecutar el script SQL que crea la tabla `appointments` con sus columnas (incluyendo el campo `status` con valores `pending`, `confirmed`, `cancelled`, `completed`). Habilitar RLS con política de acceso por `professional_id`.

- [ ] **TASK-12 · Migración SQL: Tabla `gallery_items` y buckets de Storage**  
  Escribir y ejecutar el script SQL para la tabla `gallery_items`. Crear en Supabase Storage los buckets `signatures` y `gallery`, configurando el bucket `signatures` como privado y `gallery` como privado. Crear políticas de Storage RLS para acceso por usuario autenticado.

---

## 🔐 BLOQUE 3 — Módulo Auth

- [ ] **TASK-13 · Crear `authStore` de Zustand (`src/stores/authStore.ts`)**  
  Implementar el store de Zustand para Auth que almacene: `session`, `user`, `isLoading`. Incluir las acciones: `setSession`, `clearSession`. El store debe leer la sesión inicial desde el cliente de Supabase con `supabase.auth.getSession()` y suscribirse a `onAuthStateChange`.

- [ ] **TASK-14 · Crear instancia de Axios con interceptor JWT (`src/lib/axios.ts`)**  
  Implementar la instancia de Axios apuntando a la URL de Supabase con el header `apikey`. Agregar un interceptor de request que lea el token del `authStore` e inyecte el header `Authorization: Bearer {token}` en cada llamada.

- [ ] **TASK-15 · Configurar TanStack Query Client (`src/lib/queryClient.ts`)**  
  Crear e instanciar el `QueryClient` de TanStack Query con los valores de `staleTime` (5 minutos) y `cacheTime` (10 minutos) como defecto global, según el RFC.

- [ ] **TASK-16 · Crear tipos globales de Auth (`src/types/`)**  
  Definir los tipos TypeScript compartidos: `Profile`, `AuthUser`. Estos deben reflejar exactamente las columnas de la tabla `profiles` del RFC.

- [ ] **TASK-17 · Implementar `LoginPage` y `LoginForm`**  
  Crear `src/features/auth/pages/LoginPage.tsx` y `src/features/auth/components/LoginForm.tsx`. El formulario usa React Hook Form + Zod para validar email y contraseña. Al enviar, llama a `supabase.auth.signInWithPassword()`. Los errores y éxitos se notifican con `toast` de Sonner.

- [ ] **TASK-18 · Implementar `RegisterPage` y `RegisterForm`**  
  Crear `src/features/auth/pages/RegisterPage.tsx` y `src/features/auth/components/RegisterForm.tsx`. Validar `email`, `password`, `full_name`, `salon_name` con Zod. Al registrar, llama a `supabase.auth.signUp()` y luego actualiza `profiles` con los datos del salón. Usa Sonner para feedback.

- [ ] **TASK-19 · Crear hook `useAuth` (`src/features/auth/hooks/useAuth.ts`)**  
  Encapsular la lógica de autenticación: leer el estado del `authStore`, exponer `login`, `logout`, `register`, `user`, `isAuthenticated`. El hook es el único punto de contacto de los componentes con Supabase Auth.

- [ ] **TASK-20 · Implementar el componente `PrivateRoute` y configurar React Router**  
  Crear `src/app/App.tsx` con React Router v6 definiendo todas las rutas de la Sección 10 del RFC. Implementar el componente `PrivateRoute` que lee el `authStore` y redirige a `/login` si no hay sesión activa. Aplicar `React.lazy` + `Suspense` para lazy loading de rutas.

---

## 👥 BLOQUE 4 — Módulo Clientes

- [ ] **TASK-21 · Definir tipos y schema Zod de Cliente**  
  Crear `src/features/clients/types/client.types.ts` con el tipo `Client` (espejo de la tabla DB). Crear `src/features/clients/schemas/clientSchema.ts` con el schema Zod exacto del RFC (Sección 7.2), incluyendo los mensajes de error en español.

- [ ] **TASK-22 · Implementar hooks de datos de Clientes**  
  Crear `src/features/clients/hooks/useClients.ts` con `useQuery` para listar clientes (`GET /rest/v1/clients`). Crear `src/features/clients/hooks/useClient.ts` para obtener un cliente por ID. Crear `useCreateClient`, `useUpdateClient`, `useDeleteClient` con `useMutation` y `invalidateQueries` al completar.

- [ ] **TASK-23 · Implementar componentes de UI para Clientes**  
  Crear `ClientCard.tsx` (tarjeta con nombre, teléfono, fecha de creación), `ClientSearch.tsx` (input con filtrado local) y `ClientForm.tsx` (formulario React Hook Form + Zod para crear/editar un cliente). Todos deben ser componentes presentacionales sin lógica de red.

- [ ] **TASK-24 · Implementar `ClientsPage`**  
  Crear `src/features/clients/pages/ClientsPage.tsx`. Debe mostrar la lista de clientes usando `useClients`, integrar `ClientSearch`, renderizar `ClientCard` por cada resultado y tener un botón para abrir el `ClientForm` en un `Dialog` de shadcn/ui para crear un nuevo cliente. Notificaciones con Sonner.

- [ ] **TASK-25 · Implementar `ClientDetailPage`**  
  Crear `src/features/clients/pages/ClientDetailPage.tsx`. Muestra el detalle completo de una clienta, permite editar sus datos abriendo el `ClientForm` en modo edición, y tiene accesos directos (links) al módulo de Fichas y al módulo de Galería de esa clienta.

---

## 📋 BLOQUE 5 — Módulo Fichas Dinámicas

- [ ] **TASK-26 · Definir tipos y schema Zod de Formularios**  
  Crear `src/features/forms/types/form.types.ts` con los tipos `FormField`, `FormTemplate`, `FormSubmission`. Crear `src/features/forms/schemas/formSchema.ts` con el schema Zod que valida la estructura JSON de campos (type, label, required, options).

- [ ] **TASK-27 · Implementar hooks de datos de Formularios**  
  Crear `src/features/forms/hooks/useForms.ts` para listar plantillas del profesional. Crear `useCreateTemplate`, `useUpdateTemplate`, `useDeleteTemplate` con `useMutation`. Crear `useSubmitForm` para enviar una ficha completa a `form_submissions`.

- [ ] **TASK-28 · Implementar `FormBuilder` (creador de plantillas)**  
  Crear `src/features/forms/components/FormBuilder.tsx`. Permite al profesional añadir campos a una plantilla (tipo, label, si es requerido, opciones para select). Los campos se gestionan internamente con `useState` y se guardan como JSONB al enviar. Sin drag-and-drop (Fase 1).

- [ ] **TASK-29 · Implementar `FormRenderer` (visualizador/completador de ficha)**  
  Crear `src/features/forms/components/FormRenderer.tsx`. Recibe la definición de campos de una plantilla y genera dinámicamente un formulario con React Hook Form + schema Zod generado en runtime. Soporta tipos: `text`, `textarea`, `select`, `checkbox`.

- [ ] **TASK-30 · Implementar `FormsPage` y `FormFillerPage`**  
  Crear `src/features/forms/pages/FormsPage.tsx` para gestionar las plantillas del profesional (listar, crear, editar, eliminar). Crear `src/features/forms/pages/FormFillerPage.tsx` que combine el `FormRenderer` con el `SignaturePad` para completar una ficha de una clienta específica y guardar la `form_submission`.

---

## ✍️ BLOQUE 6 — Módulo Firmas Digitales

- [ ] **TASK-31 · Implementar componente `SignaturePad`**  
  Crear `src/features/signatures/components/SignaturePad.tsx` usando `react-signature-canvas`. Debe exponer las acciones: limpiar el trazo, exportar el trazo como `image/png` en Base64. Incluir botones "Limpiar" y "Confirmar". Diseño responsivo y apto para uso en pantalla táctil.

- [ ] **TASK-32 · Implementar hook `useSignature` para subir firma a Storage**  
  Crear `src/features/signatures/hooks/useSignature.ts`. Encapsula la lógica de: recibir el Base64 de la firma, convertirlo a Blob, subirlo a Supabase Storage en el bucket `signatures` bajo la ruta `{submission_id}.png` y retornar la URL del archivo. Manejar errores con Sonner.

- [ ] **TASK-33 · Integrar firma digital en `FormFillerPage`**  
  Conectar el `SignaturePad` y el `useSignature` hook dentro de `FormFillerPage`. Al confirmarse el formulario: (1) subir la firma, (2) obtener la URL, (3) incluir `signature_url`, `signed_at` (timestamp actual con timezone) e `ip_address` en el payload de `form_submissions`.

---

## 📊 BLOQUE 7 — Dashboard

- [ ] **TASK-34 · Implementar `DashboardPage` con métricas básicas**  
  Crear `src/features/dashboard/pages/DashboardPage.tsx`. Mostrar tarjetas de métricas resumen usando `useQuery`: total de clientas registradas, total de fichas completadas, total de citas pendientes. Usar componentes `Card` de shadcn/ui. Los datos se leen directamente desde Supabase via Axios + TanStack Query.

---

## 🎨 BLOQUE 8 — Layout y UI Global

- [ ] **TASK-35 · Crear `uiStore` de Zustand (`src/stores/uiStore.ts`)**  
  Implementar el store de UI que gestione el estado efímero de la app: `isSidebarOpen` (boolean), `activeModal` (string | null). Incluir acciones: `toggleSidebar`, `openModal`, `closeModal`.

- [ ] **TASK-36 · Implementar Layout principal con Sidebar y Header**  
  Crear `src/components/shared/AppLayout.tsx` que incluya: un `Sidebar` con navegación a todas las rutas principales (Dashboard, Clientes, Fichas, Citas, Configuración) y un `Header` con el nombre del salón y un botón de logout. Responsivo: sidebar colapsable en móvil usando el `uiStore`. Integrar el `<Toaster />` de Sonner en este layout.

- [ ] **TASK-37 · Configurar `Providers` globales en `main.tsx`**  
  Actualizar `src/main.tsx` para envolver la aplicación con: `QueryClientProvider` (TanStack Query), `BrowserRouter` (React Router) y el `<Toaster />` de Sonner. Asegurarse de que el `authStore` inicialice la sesión desde Supabase en el arranque.

---

## ✅ BLOQUE 9 — Verificación Final de Fase 1

- [ ] **TASK-38 · Verificación de criterios de aceptación del RFC**  
  Revisar y confirmar manualmente los 6 criterios de la Sección 12 del RFC:  
  1. Rutas privadas redirigen a `/login` sin sesión.  
  2. Al guardar ficha con firma, `signature_url` y `signed_at` se persisten correctamente.  
  3. Todas las notificaciones usan exclusivamente Sonner.  
  4. Las políticas RLS impiden acceso cruzado entre profesionales.  
  5. No hay errores de `tsc --noEmit`.  
  6. El build de producción (`npm run build`) finaliza sin errores.

---

*Documento generado por el Technical Product Manager de RomeroLabs · Fase 1 MVP · 2026-03-21*
