PRD (Product Requirements Document) - Aura CRM by RomeroLabs
Este documento define qué se va a construir y por qué, sirviendo como el plano del edificio antes de escribir la primera línea de código
. Está optimizado para ser procesado por nuestros agentes de IA bajo la metodología de Spec Driven Development (SDD)
.
1. Problema del Negocio y del Usuario
Actualmente, los estudios de belleza pierden información de sus clientas, llevan historiales desordenados en papel o PDFs estáticos y proyectan una imagen poco profesional
. Además, carecen de protección legal ágil y sufren pérdidas económicas por las clientas que olvidan sus citas (no-shows)
.
2. Objetivos del Producto
Construir un CRM en la nube bajo el modelo SwaS (Software with a Service) que permita digitalizar integralmente los estudios de belleza
. El sistema debe gestionar fichas clínicas interactivas, capturar firmas digitales con validez legal, organizar galerías de tratamientos y enviar recordatorios automatizados.
3. Alcance (Scope)
Dentro del alcance Autenticación de usuarios (profesionales), panel de control (Dashboard), gestión dinámica de pacientesclientas, creador de formularios médicos editables, sistema de firmas digitales en pantalla, galería fotográfica Antes y Después, y alertasrecordatorios.
Fuera del alcance (para esta fase) Gestión de inventario de productos físicos, nóminas de empleados y pasarelas de pago integradas para cobro a clientes finales.
4. Stack Tecnológico Obligatorio (Reglas para la IA)
Todo el desarrollo debe regirse estrictamente por las siguientes tecnologías estándar de RomeroLabs

Core React empaquetado con Vite y tipado estático con TypeScript
.
Estilos y UI Tailwind CSS y shadcnui para componentes accesibles
.
Estado Global Zustand (minimalista y potente)
.
Datos y APIs TanStack React Query para cachésincronización y Axios como cliente HTTP
.
Formularios de FichasAnamnesis React Hook Form tipado de forma segura con Zod
.
Navegación React Router
.
Utilidades Visuales Swiper para la galería de imágenes Antes y Después, Sonner para notificaciones Toast elegantes y date-fns para el manejo de fechas de citas
.
5. Historias de Usuario (User Stories) y Requerimientos Funcionales
Gestión de Fichas Dinámicas Como profesional, quiero crear y personalizar fichas de anamnesis (preguntas médicas, alergias) para no depender de plantillas estáticas
. (Implementación React Hook Form + Zod).
Firmas Digitales Como clienta, quiero poder leer el consentimiento informado en una tablet y firmar digitalmente con el dedo para mayor seguridad legal
.
Historial Visual Como profesional, quiero subir y visualizar fotos del antes y después en el perfil de mi clienta para documentar la evolución del tratamiento
. (Implementación Carruseles con Swiper).
Recordatorios Como sistema, debo programar y gestionar el envío de notificaciones (vía integración con API de WhatsApp) 24 horas antes de la cita para reducir el ausentismo. (Manejo de tiempos date-fns).
6. Requerimientos No Funcionales
Usabilidad Multidispositivo La interfaz debe ser completamente fluida y responsiva, optimizada especialmente para su uso en tablets y celulares dentro de la cabina de atención
.
Seguridad Los datos médicos y las firmas deben estar encriptados para garantizar la privacidad y validez legal del consentimiento informado
.
Rendimiento Cargas rápidas y manejo eficiente del estado global (Zustand) para no interrumpir el flujo de atención en el salón
.
7. Criterios de Aceptación
El profesional puede registrarse, crear una plantilla de preguntas médicas y generar una ficha para una nueva clienta sin errores.
La clienta puede firmar el consentimiento en una pantalla táctil y el sistema guarda el registro de la fecha, hora y trazo de la firma.
Las notificaciones de éxito o error en la UI se muestran utilizando la librería Sonner
.
El código generado por los subagentes pasa pruebas unitarias mínimas y no presenta vulnerabilidades de seguridad
.