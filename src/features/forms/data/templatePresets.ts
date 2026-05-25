import type { FormField } from '../types/form.types';

export interface TemplatePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  color: string;          // gradient classes for the card
  iconColor: string;      // text color for the emoji/icon bg
  fields: FormField[];
}

function f(
  type: FormField['type'],
  label: string,
  opts?: { required?: boolean; placeholder?: string; options?: string[] }
): FormField {
  return {
    id: crypto.randomUUID(),
    type,
    label,
    required: opts?.required ?? false,
    placeholder: opts?.placeholder,
    options: opts?.options,
  };
}

// ─── Template definitions ─────────────────────────────────────────────────────

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  // ── 1. Anamnesis General ────────────────────────────────────────────────────
  {
    id: 'anamnesis-general',
    name: 'Anamnesis General',
    description: 'Historial médico y datos personales para cualquier tratamiento. Base ideal para empezar.',
    category: 'General',
    emoji: '📋',
    color: 'from-slate-50 to-gray-100 dark:from-slate-900/60 dark:to-gray-900/60',
    iconColor: 'bg-slate-100 dark:bg-slate-800',
    fields: [
      f('text',     'Nombre completo',          { required: true,  placeholder: 'Ej. María García' }),
      f('text',     'DNI / Documento',           { required: true,  placeholder: 'Ej. 32.456.789' }),
      f('text',     'Fecha de nacimiento',       { required: true,  placeholder: 'DD/MM/AAAA' }),
      f('text',     'Teléfono de contacto',      { required: true,  placeholder: '+54 9 11 ...' }),
      f('text',     'Correo electrónico',        { placeholder: 'ejemplo@correo.com' }),
      f('text',     'Contacto de emergencia (nombre y teléfono)', { placeholder: 'Ej. Juan García — 11 5555-5555' }),
      f('select',   'Estado civil',              { options: ['Soltera/o', 'Casada/o', 'Divorciada/o', 'Viuda/o', 'Otro'] }),
      f('textarea', '¿Padece alguna enfermedad crónica o preexistente?', { placeholder: 'Diabetes, hipertensión, enfermedades autoinmunes, epilepsia, etc. Escriba "Ninguna" si no aplica.' }),
      f('textarea', '¿Tiene alergias conocidas (medicamentos, productos, látex, metales)?', { placeholder: 'Indique a qué es alérgico/a. Escriba "Ninguna" si no aplica.' }),
      f('textarea', '¿Está tomando alguna medicación actualmente?',     { placeholder: 'Nombre del medicamento y dosis. Escriba "No" si no aplica.' }),
      f('select',   '¿Está embarazada o en período de lactancia?',      { required: true, options: ['No', 'Sí — embarazada', 'Sí — lactancia'] }),
      f('textarea', '¿Ha realizado tratamientos estéticos previos?',    { placeholder: 'Indique cuáles y hace cuánto tiempo.' }),
      f('select',   '¿Fuma?',                                           { options: ['No', 'Sí, menos de 10 cigarrillos/día', 'Sí, más de 10 cigarrillos/día', 'Ex fumador/a'] }),
      f('checkbox', 'Declaro que la información proporcionada es verdadera y completa.', { required: true }),
      f('checkbox', 'Autorizo el uso de mis datos para fines de seguimiento y comunicación relacionada con mi tratamiento.', { required: true }),
    ],
  },

  // ── 2. Toxina Botulínica (Botox) ────────────────────────────────────────────
  {
    id: 'botox-toxina',
    name: 'Consentimiento Botox',
    description: 'Consentimiento informado completo para aplicación de toxina botulínica. Cumple Ley 26.529.',
    category: 'Medicina Estética',
    emoji: '💉',
    color: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50',
    iconColor: 'bg-blue-100 dark:bg-blue-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'DNI',                       { required: true }),
      f('text',     'Fecha de nacimiento',       { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Zona a tratar',             { required: true, options: ['Frente', 'Entrecejo (glabela)', 'Patas de gallo', 'Frente + Entrecejo', 'Frente + Entrecejo + Patas de gallo', 'Cuello (bandas platismales)', 'Otro'] }),
      f('textarea', '¿Tiene antecedentes de enfermedades neuromusculares?', { required: true, placeholder: 'Miastenia gravis, esclerosis lateral amiotrófica, etc. Escriba "No" si no aplica.' }),
      f('select',   '¿Está embarazada o en período de lactancia?',      { required: true, options: ['No', 'Sí'] }),
      f('textarea', '¿Está tomando antibióticos, anticoagulantes o relajantes musculares?', { placeholder: 'Indique el medicamento. Escriba "No" si no aplica.' }),
      f('select',   '¿Ha recibido toxina botulínica anteriormente?',    { options: ['No, es la primera vez', 'Sí, sin reacciones adversas', 'Sí, con reacciones adversas'] }),
      f('textarea', 'Si tuvo reacciones adversas previas, descríbalas', { placeholder: 'Deje en blanco si no aplica.' }),
      f('checkbox', 'Comprendo que los resultados pueden variar y no se garantizan resultados exactos.', { required: true }),
      f('checkbox', 'Fui informado/a sobre los efectos secundarios posibles: hematomas, inflamación, caída del párpado temporal, dolor en la zona.', { required: true }),
      f('checkbox', 'Comprendo que el efecto es temporal (3 a 6 meses aproximadamente) y puede requerir sesiones de mantenimiento.', { required: true }),
      f('checkbox', 'Se me informaron los cuidados post-procedimiento y me comprometo a seguirlos.', { required: true }),
      f('checkbox', 'Autorizo al profesional a realizar el procedimiento de toxina botulínica en las zonas acordadas.', { required: true }),
      f('select',   '¿Autoriza el uso de fotografías antes/después con fines profesionales (con privacidad de identidad)?', { options: ['Sí, autorizo', 'No autorizo'] }),
    ],
  },

  // ── 3. Rellenos / Fillers ───────────────────────────────────────────────────
  {
    id: 'rellenos-fillers',
    name: 'Consentimiento Rellenos / Fillers',
    description: 'Consentimiento para ácido hialurónico, biostimuladores y rellenos dérmicos.',
    category: 'Medicina Estética',
    emoji: '✨',
    color: 'from-violet-50 to-pink-50 dark:from-violet-950/50 dark:to-pink-950/50',
    iconColor: 'bg-violet-100 dark:bg-violet-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'DNI',                       { required: true }),
      f('text',     'Fecha de nacimiento',       { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Producto a utilizar',       { required: true, options: ['Ácido hialurónico', 'Hidroxiapatita de calcio', 'Ácido poliláctico (Sculptra)', 'Otro'] }),
      f('select',   'Zona a tratar',             { required: true, options: ['Labios', 'Surcos nasogenianos', 'Ojeras / Tear trough', 'Mentón', 'Pómulos', 'Mandíbula', 'Manos', 'Otro'] }),
      f('select',   '¿Ha tenido previamente rellenos en la zona?',      { required: true, options: ['No', 'Sí, con ácido hialurónico', 'Sí, con otro producto'] }),
      f('select',   '¿Está embarazada o en período de lactancia?',      { required: true, options: ['No', 'Sí'] }),
      f('textarea', '¿Tiene alergias a anestésicos locales (lidocaína) o productos dérmicos?', { required: true, placeholder: 'Escriba "No" si no aplica.' }),
      f('select',   '¿Toma anticoagulantes, aspirina o suplementos como vitamina E u Omega 3?', { required: true, options: ['No', 'Sí'] }),
      f('select',   '¿Tiene tendencia a formar queloides o cicatrices hipertróficas?', { options: ['No', 'Sí', 'No sé'] }),
      f('checkbox', 'Comprendo que los resultados son orientativos y no se garantiza un resultado exacto.', { required: true }),
      f('checkbox', 'Fui informado/a sobre posibles efectos: hematomas, inflamación (1–3 días), asimetría temporal, efecto Tyndall.', { required: true }),
      f('checkbox', 'Comprendo que el relleno es reabsorbible y temporal (6 a 18 meses según producto y zona).', { required: true }),
      f('checkbox', 'Se me informó que existe la posibilidad de reversar el ácido hialurónico con hialuronidasa si fuera necesario.', { required: true }),
      f('checkbox', 'Autorizo al profesional a realizar el procedimiento de relleno en las zonas acordadas.', { required: true }),
      f('select',   '¿Autoriza el uso de fotografías antes/después con fines profesionales?', { options: ['Sí, autorizo', 'No autorizo'] }),
    ],
  },

  // ── 4. Peeling Químico ──────────────────────────────────────────────────────
  {
    id: 'peeling-quimico',
    name: 'Consentimiento Peeling Químico',
    description: 'Ficha para peelings superficiales, medios y profundos. Incluye evaluación de fototipo.',
    category: 'Tratamientos Faciales',
    emoji: '🧪',
    color: 'from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50',
    iconColor: 'bg-amber-100 dark:bg-amber-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Tipo de peeling',           { required: true, options: ['Superficial (AHA/BHA)', 'Jessner', 'TCA 15–20%', 'TCA 30–35%', 'Fenol (profundo)', 'Otro'] }),
      f('select',   'Fototipo de piel (Fitzpatrick)', { required: true, options: ['I — Muy clara, siempre se quema', 'II — Clara, generalmente se quema', 'III — Morena clara, a veces se quema', 'IV — Morena moderada, raramente se quema', 'V — Oscura, muy raramente se quema', 'VI — Muy oscura, nunca se quema'] }),
      f('select',   '¿Tuvo exposición solar en los últimos 15 días?',   { required: true, options: ['No', 'Sí, poca', 'Sí, mucha (cama de bronceado, playa, etc.)'] }),
      f('select',   '¿Usa actualmente retinoides (retinol, tretinoína)?', { required: true, options: ['No', 'Sí, tópico', 'Sí, oral (isotretinoína)'] }),
      f('select',   '¿Tiene herpes labial activo o antecedentes frecuentes de herpes?', { required: true, options: ['No', 'Sí, activo actualmente', 'Sí, con recurrencias frecuentes'] }),
      f('select',   '¿Está embarazada o en período de lactancia?',      { required: true, options: ['No', 'Sí'] }),
      f('textarea', '¿Tiene antecedentes de cicatrices queloides o hiperpigmentación post-inflamatoria?', { placeholder: 'Describa brevemente. Escriba "No" si no aplica.' }),
      f('textarea', '¿Usa alguna crema activa (despigmentante, ácido glicólico, vitamina C)?', { placeholder: 'Indique producto y frecuencia.' }),
      f('checkbox', 'Fui informado/a sobre el proceso de descamación normal durante los días posteriores al procedimiento.', { required: true }),
      f('checkbox', 'Entiendo que debo evitar el sol y usar protector solar FPS 50+ durante al menos 4 semanas post-peeling.', { required: true }),
      f('checkbox', 'No debo frotar ni despegar la piel descamada manualmente.', { required: true }),
      f('checkbox', 'Autorizo la realización del peeling químico y declaro haber recibido todas las indicaciones.', { required: true }),
    ],
  },

  // ── 5. Microblading / Micropigmentación ─────────────────────────────────────
  {
    id: 'microblading',
    name: 'Consentimiento Microblading / Micropigmentación',
    description: 'Diseño de cejas, labios o delineado permanente. Incluye preguntas sobre cicatrización.',
    category: 'Pigmentación',
    emoji: '🎨',
    color: 'from-rose-50 to-pink-50 dark:from-rose-950/50 dark:to-pink-950/50',
    iconColor: 'bg-rose-100 dark:bg-rose-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Tipo de procedimiento',     { required: true, options: ['Microblading (cabello a cabello)', 'Sombreado (powder brows)', 'Combinado (microblading + sombra)', 'Micropigmentación de labios', 'Delineado de ojos', 'Otro'] }),
      f('select',   '¿Tiene piel muy grasa o poros dilatados en la zona de cejas?', { options: ['No', 'Sí', 'No sé'] }),
      f('select',   '¿Tiene herpes labial o pericorneal activo o antecedentes?', { required: true, options: ['No', 'Sí, activo', 'Sí, con recurrencias (protocolamos profilaxis)'] }),
      f('select',   '¿Tiene tatuajes o micropigmentación previa en la zona?', { required: true, options: ['No', 'Sí, completamente cicatrizados', 'Sí, recientes (menos de 4 semanas)'] }),
      f('select',   '¿Usa isotretinoína oral (Roacután, Isoface, etc.)?', { required: true, options: ['No', 'Sí, actualmente', 'Sí, la dejé hace menos de 6 meses'] }),
      f('select',   '¿Tiene tendencia a formar queloides?',             { required: true, options: ['No', 'Sí', 'No sé'] }),
      f('select',   '¿Tiene diabetes o trastornos de coagulación?',    { required: true, options: ['No', 'Sí'] }),
      f('select',   '¿Está embarazada o en período de lactancia?',      { required: true, options: ['No', 'Sí'] }),
      f('textarea', '¿Tiene alergias a metales (níquel), anestésicos o pigmentos cosméticos?', { placeholder: 'Escriba "No" si no aplica.' }),
      f('checkbox', 'Comprendo que el color se verá más intenso los primeros días y aclarará entre un 30–40% durante la cicatrización.', { required: true }),
      f('checkbox', 'Entiendo que puede ser necesaria una sesión de retoque a las 4–6 semanas para perfeccionar el resultado.', { required: true }),
      f('checkbox', 'Me comprometo a seguir los cuidados post-procedimiento (no mojar, no frotar, no exponer al sol).', { required: true }),
      f('checkbox', 'Autorizo la realización del procedimiento y declaro haber recibido toda la información necesaria.', { required: true }),
      f('select',   '¿Autoriza fotografías del proceso y resultado para uso profesional?', { options: ['Sí, autorizo', 'No autorizo'] }),
    ],
  },

  // ── 6. Depilación Láser ─────────────────────────────────────────────────────
  {
    id: 'depilacion-laser',
    name: 'Consentimiento Depilación Láser',
    description: 'Evaluación de fototipo, zona y contraindicaciones para tratamiento láser.',
    category: 'Depilación',
    emoji: '⚡',
    color: 'from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50',
    iconColor: 'bg-yellow-100 dark:bg-yellow-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Zona a tratar',             { required: true, options: ['Axilas', 'Bozo', 'Piernas completas', 'Muslos', 'Bikini brasileña', 'Zona íntima completa', 'Espalda', 'Abdomen', 'Brazos', 'Rostro completo', 'Otro'] }),
      f('select',   'Fototipo Fitzpatrick',      { required: true, options: ['I — Muy blanca', 'II — Blanca/Europea', 'III — Trigueña/Mediterránea', 'IV — Morena/Latina', 'V — Muy morena', 'VI — Negra'] }),
      f('select',   'Color natural del vello',   { required: true, options: ['Negro', 'Castaño oscuro', 'Castaño claro', 'Rubio', 'Rojo / Colorín', 'Canoso / Blanco'] }),
      f('select',   '¿Tuvo exposición solar o cama de bronceado en los últimos 15 días?', { required: true, options: ['No', 'Sí, poca exposición', 'Sí, exposición intensa'] }),
      f('select',   '¿Usa autobronceador actualmente?',                 { required: true, options: ['No', 'Sí'] }),
      f('select',   '¿Toma medicamentos fotosensibilizantes (antibióticos, diuréticos, anticonceptivos)?', { options: ['No', 'Sí', 'No sé'] }),
      f('select',   '¿Tiene diabetes, lupus u otras enfermedades autoinmunes?', { options: ['No', 'Sí'] }),
      f('select',   '¿Está embarazada o en período de lactancia?',      { required: true, options: ['No', 'Sí'] }),
      f('select',   '¿Tiene tatuajes en la zona a tratar?',             { options: ['No', 'Sí (se evitará esa área)'] }),
      f('select',   '¿Ha tenido herpes en la zona a tratar?',           { options: ['No', 'Sí'] }),
      f('checkbox', 'Comprendo que se requieren entre 6 y 10 sesiones para obtener resultados óptimos.', { required: true }),
      f('checkbox', 'Entiendo que el vello rubio, canoso o pelirrojo responde de forma limitada al láser.', { required: true }),
      f('checkbox', 'Me comprometo a NO exponer la zona al sol ni usar cama de bronceado durante el tratamiento.', { required: true }),
      f('checkbox', 'Autorizo la realización del tratamiento de depilación láser.', { required: true }),
    ],
  },

  // ── 7. Limpieza Facial / Hidrafacial ────────────────────────────────────────
  {
    id: 'limpieza-facial',
    name: 'Ficha Limpieza Facial / HydraFacial',
    description: 'Evaluación de piel y consentimiento para limpiezas faciales, hidrataión y tratamientos combinados.',
    category: 'Tratamientos Faciales',
    emoji: '🌿',
    color: 'from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50',
    iconColor: 'bg-emerald-100 dark:bg-emerald-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Tipo de piel (autopercepción)', { required: true, options: ['Seca', 'Normal', 'Mixta', 'Grasa', 'Sensible', 'No sé'] }),
      f('select',   'Principal preocupación estética', { required: true, options: ['Puntos negros / Comedones', 'Acné activo', 'Manchas / Hiperpigmentación', 'Deshidratación', 'Líneas finas / Arrugas', 'Poros dilatados', 'Opacidad / Sin luminosidad', 'Otro'] }),
      f('textarea', '¿Qué productos usa actualmente en su rutina facial?', { placeholder: 'Limpiador, crema hidratante, protector solar, sérum, etc.' }),
      f('select',   '¿Usa protector solar diariamente?',                { options: ['Sí, todos los días', 'A veces', 'No'] }),
      f('select',   '¿Tiene acné activo o lesiones abiertas en el rostro?', { required: true, options: ['No', 'Sí, pocas', 'Sí, moderado', 'Sí, severo'] }),
      f('select',   '¿Ha aplicado ácidos (retinol, AHA, BHA) en los últimos 7 días?', { options: ['No', 'Sí'] }),
      f('select',   '¿Está tomando isotretinoína oral?',                { required: true, options: ['No', 'Sí, actualmente', 'La dejé hace menos de 6 meses'] }),
      f('textarea', '¿Tiene alergias a algún ingrediente cosmético conocido?', { placeholder: 'Fragancia, parabenos, vitamina C, etc. Escriba "No" si no aplica.' }),
      f('select',   '¿Está embarazada o en período de lactancia?',      { options: ['No', 'Sí'] }),
      f('checkbox', 'Autorizo la realización del tratamiento facial indicado por la profesional.', { required: true }),
      f('checkbox', 'Entiendo que los resultados pueden variar según mi tipo de piel y constancia en el tratamiento.', { required: true }),
    ],
  },

  // ── 8. Extensión de Pestañas ────────────────────────────────────────────────
  {
    id: 'extension-pestanas',
    name: 'Extensión de Pestañas',
    description: 'Consentimiento y evaluación para extensión pelo a pelo, volumen ruso y lifting de pestañas.',
    category: 'Ojos',
    emoji: '👁️',
    color: 'from-sky-50 to-blue-50 dark:from-sky-950/50 dark:to-blue-950/50',
    iconColor: 'bg-sky-100 dark:bg-sky-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Tipo de servicio',          { required: true, options: ['Extensión pelo a pelo (clásica)', 'Volumen ruso (2D–6D)', 'Mega volumen', 'Lifting de pestañas', 'Laminado de pestañas'] }),
      f('select',   'Estado actual de las pestañas naturales', { options: ['Naturales sin tratamiento previo', 'Con extensiones (requiere relleno)', 'Con extensiones (requiere retiro completo)', 'Muy escasas o dañadas'] }),
      f('select',   '¿Tiene ojos sensibles o síndrome del ojo seco?',   { required: true, options: ['No', 'Sí, leve', 'Sí, moderado / Uso gotas'] }),
      f('select',   '¿Usa lentes de contacto?',                         { options: ['No', 'Sí (se retiran durante el servicio)'] }),
      f('select',   '¿Tiene alergia al cianoacrilato (adhesivo de pestañas) o lo sospecha?', { required: true, options: ['No', 'Sí', 'No lo sé / es mi primera vez'] }),
      f('textarea', '¿Tiene alguna alergia o irritación ocular conocida?', { placeholder: 'Conjuntivitis alérgica, blefaritis, orzuelos frecuentes, etc. Escriba "No" si no aplica.' }),
      f('select',   '¿Ha tenido reacciones adversas a extensiones de pestañas antes?', { options: ['No, primera vez', 'No, sin reacciones', 'Sí, tuve irritación leve', 'Sí, reacción alérgica'] }),
      f('checkbox', 'Entiendo que debo evitar mojar las pestañas durante las primeras 24–48 horas.', { required: true }),
      f('checkbox', 'Me comprometo a no frotar los ojos ni usar productos aceitosos en la zona.', { required: true }),
      f('checkbox', 'Comprendo que la duración del servicio depende de mi ciclo natural de caída de pestañas (retoque cada 2–4 semanas).', { required: true }),
      f('checkbox', 'Autorizo la realización del servicio y declaro haber completado esta ficha con veracidad.', { required: true }),
    ],
  },

  // ── 9. Dermapen / Microneedling ─────────────────────────────────────────────
  {
    id: 'dermapen-microneedling',
    name: 'Consentimiento Dermapen / Microneedling',
    description: 'Consentimiento para bioestimulación con microagujas. Incluye evaluación de cicatrización.',
    category: 'Medicina Estética',
    emoji: '🔬',
    color: 'from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50',
    iconColor: 'bg-teal-100 dark:bg-teal-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Zona a tratar',             { required: true, options: ['Rostro completo', 'Cuello', 'Escote', 'Cuero cabelludo (alopecia)', 'Estrías', 'Cicatrices de acné', 'Otro'] }),
      f('select',   'Objetivo del tratamiento',  { required: true, options: ['Rejuvenecimiento / Textura', 'Cicatrices de acné', 'Manchas / Hiperpigmentación', 'Alopecia / Caída de cabello', 'Flacidez', 'Estrías'] }),
      f('select',   '¿Tiene acné activo, rosácea activa o infección en la zona?', { required: true, options: ['No', 'Sí (contraindicación relativa)'] }),
      f('select',   '¿Tiene herpes activo o frecuente en la zona?',     { required: true, options: ['No', 'Sí, activo', 'Sí, recurrente'] }),
      f('select',   '¿Tiene tendencia a queloides o cicatrización anormal?', { required: true, options: ['No', 'Sí', 'No sé'] }),
      f('select',   '¿Toma anticoagulantes o aspirina?',                { options: ['No', 'Sí'] }),
      f('select',   '¿Usa isotretinoína oral actualmente o la dejó hace menos de 6 meses?', { required: true, options: ['No', 'Sí'] }),
      f('select',   '¿Está embarazada o en período de lactancia?',      { required: true, options: ['No', 'Sí'] }),
      f('select',   '¿Tuvo exposición solar intensa en los últimos 15 días?', { options: ['No', 'Sí'] }),
      f('checkbox', 'Comprendo que la zona puede estar eritematosa (enrojecida) durante 24–72 horas post-procedimiento.', { required: true }),
      f('checkbox', 'Entiendo que debo evitar el sol y usar FPS 50+ durante todo el tratamiento.', { required: true }),
      f('checkbox', 'Se recomienda una serie de 3 a 6 sesiones espaciadas 3–4 semanas para resultados óptimos.', { required: true }),
      f('checkbox', 'Autorizo la realización del procedimiento de microneedling y declaro haber recibido las instrucciones.', { required: true }),
    ],
  },

  // ── 10. Uñas Semipermanente / Gel / Acrílico ────────────────────────────────
  {
    id: 'unas-semipermanente',
    name: 'Ficha de Uñas (Semipermanente / Gel / Acrílico)',
    description: 'Evaluación de estado de uñas y piel para servicios de esmaltado semipermanente y extensiones.',
    category: 'Uñas',
    emoji: '💅',
    color: 'from-fuchsia-50 to-purple-50 dark:from-fuchsia-950/50 dark:to-purple-950/50',
    iconColor: 'bg-fuchsia-100 dark:bg-fuchsia-900/40',
    fields: [
      f('text',     'Nombre completo',           { required: true }),
      f('text',     'Teléfono',                  { required: true }),
      f('select',   'Servicio a realizar',       { required: true, options: ['Esmaltado semipermanente', 'Extensiones de gel', 'Extensiones acrílicas', 'Nail art / Decoración', 'Retiro de extensiones', 'Manicura tradicional'] }),
      f('select',   'Estado actual de las uñas', { required: true, options: ['Uñas naturales sin tratamiento', 'Con semipermanente (relleno)', 'Con gel (relleno o retiro)', 'Con acrílico (relleno o retiro)', 'Uñas muy dañadas o quebradizas'] }),
      f('select',   '¿Tiene hongos, psoriasis o infección en las uñas o cutículas?', { required: true, options: ['No', 'Sí (contraindicación)'] }),
      f('select',   '¿Es alérgica a methacrylatos, acetona u otros químicos de uñas?', { options: ['No', 'Sí', 'No sé / primera vez'] }),
      f('select',   '¿Tiene diabetes?',          { options: ['No', 'Sí (cuidados especiales en cutículas)'] }),
      f('select',   '¿Está embarazada?',         { options: ['No', 'Sí (se limita el uso de ciertos productos)'] }),
      f('checkbox', 'Entiendo que la duración del semipermanente varía entre 2 y 4 semanas según mis actividades.', { required: true }),
      f('checkbox', 'Comprendo que el retiro incorrecto puede dañar la uña natural y debo volver al estudio para el retiro.', { required: true }),
      f('checkbox', 'Autorizo la realización del servicio de uñas seleccionado.', { required: true }),
    ],
  },
];
