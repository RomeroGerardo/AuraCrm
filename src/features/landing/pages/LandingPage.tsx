import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ChevronRight, 
  Star, 
  CalendarClock, 
  Users, 
  FileText, 
  PenLine, 
  CreditCard, 
  BarChart3, 
  Check, 
  Menu, 
  X,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';

const AuraLogo = ({ size = "normal" }: { size?: "normal" | "large" }) => {
  const isLarge = size === "large";
  return (
    <div className="relative flex items-center shrink-0">
      {/* Glowing ring (Aura) */}
      <div className={`absolute ${isLarge ? 'left-[-8px] h-14 w-14 border-[3px]' : 'left-[-4px] h-10 w-10 border-[2px]'} top-1/2 -translate-y-1/2 rounded-full border-amber-300/60 shadow-[0_0_15px_5px_rgba(251,191,36,0.25)]`} />
      
      <div className="relative z-10 flex flex-col items-start leading-none mt-1">
        <div className="flex items-baseline">
          <span className={`${isLarge ? 'text-5xl' : 'text-3xl'} italic text-[#8B7369] font-serif`} style={{ transform: 'translateX(-4px)' }}>
            a
          </span>
          <span className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-light text-[#675652] tracking-wide ml-1`} style={{ fontFamily: 'system-ui, sans-serif' }}>
            Aura
          </span>
        </div>
        <span className={`${isLarge ? 'text-xs ml-[3.5rem]' : 'text-[10px] ml-[2.5rem]'} text-[#675652]/80 tracking-[0.25em] font-medium -mt-1`}>
          CRM
        </span>
      </div>
    </div>
  );
};

const navLinks = [
  { label: "Funciones", href: "#funciones" },
  { label: "Beneficios", href: "#beneficios" },
  { label: "Precios", href: "#precios" },
];

const features = [
  {
    icon: CalendarClock,
    title: "Agenda Inteligente",
    description: "Organiza tus turnos sin esfuerzo, envía recordatorios y reduce las inasistencias de tus clientes.",
  },
  {
    icon: Users,
    title: "Ficha de clientes",
    description: "Historial, preferencias y notas de cada cliente organizadas en un solo lugar.",
  },
  {
    icon: FileText,
    title: "Historias Clínicas",
    description: "Crea formularios dinámicos y mantén un registro detallado de la evolución de cada paciente.",
  },
  {
    icon: PenLine,
    title: "Firmas Digitales",
    description: "Recopila firmas para consentimientos informados directamente desde una tablet o smartphone.",
  },
  {
    icon: CreditCard,
    title: "Pagos y Gestión",
    description: "Lleva el control de tus ingresos, pagos y facturación fácilmente integrado a tu agenda.",
  },
  {
    icon: BarChart3,
    title: "Reportes de la clínica",
    description: "Visualiza ingresos, ocupación y rendimiento con paneles claros y en vivo.",
  },
];

const benefits = [
  "Reduce hasta un 40% las ausencias con recordatorios automáticos",
  "Elimina el papeleo con consentimientos y firmas 100% digitales",
  "Accede a la información de tus clientes desde cualquier lugar",
  "Cumple con la normativa de protección de datos y seguridad",
];

const stats = [
  { value: "+500", label: "Clínicas y spas activos" },
  { value: "50k", label: "Citas gestionadas al mes" },
  { value: "8 h", label: "Ahorradas por semana" },
  { value: "99.9%", label: "Tiempo de actividad" },
];



const plans = [
  {
    name: "Starter",
    price: "19",
    description: "Ideal para profesionales independientes.",
    features: [
      "Gestión de hasta 100 clientes",
      "Agenda básica",
      "Soporte por email"
    ],
    limitations: [
      "Sin formularios dinámicos",
      "Sin firmas digitales",
      "Sin recordatorios por WhatsApp"
    ],
    cta: "Empezar Básico",
    featured: false,
    href: '/register?plan=starter'
  },
  {
    name: "Pro",
    price: "39",
    description: "Para equipos pequeños en crecimiento.",
    features: [
      "Gestión de clientes ilimitados",
      "Formularios dinámicos",
      "Historias clínicas",
      "Firmas digitales",
      "Hasta 5 usuarios"
    ],
    limitations: [
      "Sin recordatorios por WhatsApp"
    ],
    cta: "Elegir Pro",
    featured: true,
    href: '/register?plan=pro'
  },
  {
    name: "Full",
    price: "59",
    description: "La experiencia completa para clínicas.",
    features: [
      "Usuarios ilimitados",
      "Formularios ilimitados",
      "Firmas Digitales Avanzadas",
      "Recordatorios por WhatsApp",
      "Galería completa",
      "Soporte prioritario 24/7"
    ],
    limitations: [],
    cta: "Prueba 14 días gratis",
    featured: false,
    href: '/register?plan=full'
  },
];

function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <AuraLogo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-indigo-600"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:text-indigo-600">
              Iniciar sesión
            </Button>
          </Link>
          <Link to="/register?plan=full">
            <Button className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white">Prueba gratis</Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Móvil">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-indigo-50 hover:text-indigo-600"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full">Iniciar sesión</Button>
              </Link>
              <Link to="/register?plan=full" className="w-full">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">Prueba gratis</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function DashboardMockup() {
  return (
    <div className="flex h-[550px] w-full overflow-hidden rounded-xl border border-border/50 bg-slate-50 shadow-2xl text-left select-none">
      {/* Sidebar */}
      <div className="w-56 border-r border-border bg-white flex flex-col hidden md:flex">
        <div className="flex h-16 items-center px-6 border-b border-border/50">
           <AuraLogo size="normal" />
        </div>
        <div className="flex-1 px-3 py-6 space-y-1">
          <div className="flex items-center gap-3 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white shadow-sm">
            <BarChart3 className="h-4 w-4" /> Dashboard
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Users className="h-4 w-4 text-slate-400" /> Clientes
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <FileText className="h-4 w-4 text-slate-400" /> Fichas
          </div>
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <CalendarClock className="h-4 w-4 text-slate-400" /> Citas
          </div>
        </div>
        <div className="border-t border-border/50 p-4 space-y-4">
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg">
             <Settings className="h-4 w-4 text-slate-400" /> Configuración
          </div>
          <div className="flex items-center gap-3 px-2">
             <div className="h-8 w-8 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
               AL
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-medium text-slate-900 truncate">Dra. Ana López</p>
               <p className="text-[10px] text-slate-500 truncate">ana@clinicavital.com</p>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border/50 bg-white px-6">
           <Menu className="h-5 w-5 text-slate-400" />
           <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-semibold text-slate-900">Dra. Ana López</p>
               <p className="text-xs text-slate-500">Clínica Vital</p>
             </div>
           </div>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-[#fafafa] p-4 sm:p-6 lg:p-8">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  <Star className="h-3.5 w-3.5" /> Panel de Control
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
                  ¡Buenas tardes, Ana! 👋
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">miércoles 22 de julio, 2026</p>
              </div>
              <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-sm shrink-0">
                 Nueva Cita
              </Button>
           </div>
           
           {/* Stats */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-xl border-t-[3px] border-t-purple-500 bg-white p-4 shadow-sm border border-x-border/60 border-b-border/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Clientes</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">842</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-50">
                    <Users className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">En tu base de datos</p>
              </div>
              <div className="rounded-xl border-t-[3px] border-t-amber-500 bg-white p-4 shadow-sm border border-x-border/60 border-b-border/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Citas Pendientes</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">12</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
                    <CalendarClock className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">Esperando confirmación</p>
              </div>
              <div className="rounded-xl border-t-[3px] border-t-blue-500 bg-white p-4 shadow-sm border border-x-border/60 border-b-border/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confirmadas</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">28</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50">
                    <Check className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">Listas para atender</p>
              </div>
              <div className="rounded-xl border-t-[3px] border-t-emerald-500 bg-white p-4 shadow-sm border border-x-border/60 border-b-border/60">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completadas</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-2xl font-bold text-slate-900">145</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">Este mes</p>
              </div>
           </div>

           {/* Panels */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                 <div className="flex justify-between items-center">
                   <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                     <Bell className="h-4 w-4 text-slate-500" /> Citas próximas
                   </h3>
                   <span className="text-xs font-medium text-indigo-600 cursor-pointer">Ver todas {'>'}</span>
                 </div>
                 
                 <div className="rounded-xl bg-white p-1 shadow-sm border border-border/60">
                   <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50 rounded-lg transition-colors">
                     <div className="flex items-center gap-3 sm:gap-4">
                       <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold text-sm sm:text-base">
                         MC
                       </div>
                       <div>
                         <p className="font-semibold text-slate-900 text-sm sm:text-base">María Castro</p>
                         <p className="text-xs text-slate-500">Consulta Inicial • Hoy 10:00 AM</p>
                       </div>
                     </div>
                     <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-semibold rounded-full border border-emerald-100">
                       Confirmada
                     </span>
                   </div>
                   
                   <div className="h-px w-full bg-border/40"></div>
                   
                   <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-slate-50 rounded-lg transition-colors">
                     <div className="flex items-center gap-3 sm:gap-4">
                       <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm sm:text-base">
                         RS
                       </div>
                       <div>
                         <p className="font-semibold text-slate-900 text-sm sm:text-base">Roberto Silva</p>
                         <p className="text-xs text-slate-500">Seguimiento • Mañana 09:30 AM</p>
                       </div>
                     </div>
                     <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] sm:text-xs font-semibold rounded-full border border-amber-100">
                       Pendiente
                     </span>
                   </div>
                 </div>
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                 <div>
                   <div className="flex justify-between items-center mb-4">
                     <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                       <Users className="h-4 w-4 text-slate-500" /> Clientes recientes
                     </h3>
                     <span className="text-xs font-medium text-indigo-600 cursor-pointer">Ver {'>'}</span>
                   </div>
                   <div className="rounded-xl bg-white p-4 shadow-sm border border-border/60">
                     <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
                         SM
                       </div>
                       <div>
                         <p className="text-sm font-semibold text-slate-900">Sofía Martínez</p>
                         <p className="text-[10px] text-slate-500">Registrada hace 2 horas</p>
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                        <PenLine className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Fichas firmadas</p>
                        <p className="text-[10px] text-slate-500">Consentimientos digitales</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-slate-900">45</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-14 sm:pt-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,oklch(0.9_0.045_30/0.6),transparent)]"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pb-24">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 lg:mx-0">
            <span className="h-2 w-2 rounded-full bg-indigo-600" aria-hidden="true" />
            La plataforma #1 para clínicas y spas
          </div>

          <h1 className="mx-auto max-w-xl font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl lg:mx-0">
            Gestiona tu clínica <br className="hidden md:block" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">de forma inteligente</span>
          </h1>

          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-pretty text-muted-foreground lg:mx-0">
            Aura CRM reúne tu agenda, la ficha de cada cliente, sus historias clínicas y los
            consentimientos con firma digital en un solo lugar. Menos papeleo, más
            tiempo para tus pacientes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Link to="/register?plan=full" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-14 w-full rounded-full bg-indigo-600 hover:bg-indigo-700 text-white px-8 text-base shadow-lg shadow-indigo-200 sm:w-auto"
              >
                Prueba 14 días gratis
                <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-14 w-full rounded-full border-border bg-card px-8 text-base sm:w-auto hover:bg-slate-50"
            >
              Ver Demo
            </Button>
          </div>

          <div className="mt-7 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground sm:flex-row sm:gap-5 lg:justify-start">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              ))}
              <span className="ml-1 font-medium text-foreground">4.9/5</span>
            </div>
            <span className="hidden sm:inline" aria-hidden="true">
              •
            </span>
            <span>Sin tarjeta de crédito · Cancela cuando quieras</span>
          </div>
        </div>

        {/* Image */}
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-indigo-100">
            <img
              src="/hero-lifestyle.png"
              alt="Profesional gestionando su agenda con Aura CRM en una tablet"
              className="aspect-[4/5] w-full object-cover sm:aspect-[5/4]"
            />
          </div>

          {/* Floating stat card */}
          <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-border bg-card/95 p-4 shadow-xl backdrop-blur sm:block">
            <p className="text-2xl font-semibold text-foreground">+8 h</p>
            <p className="text-sm text-muted-foreground">ahorradas por semana</p>
          </div>
        </div>
      </div>

      {/* Dashboard preview */}
      <div className="mx-auto -mt-2 max-w-5xl px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-indigo-100">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-500/10 via-transparent to-violet-500/10 pointer-events-none" />
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="border-y border-border bg-slate-50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {stat.value}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="funciones" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
          Todo en uno
        </span>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
          Una plataforma completa para tu clínica
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
          Deja de saltar entre cuadernos, hojas de cálculo y apps distintas. Aura CRM
          reúne todo lo que necesitas para operar tu negocio con calma.
        </p>
      </div>

      <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-center">
        {/* Feature image */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-indigo-50">
          <img
            src="/feature-firma.png"
            alt="Cliente firmando un consentimiento digital en una tablet con Aura CRM"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section id="beneficios" className="bg-slate-50">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2">
        <div>
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Menos administración, más pacientes
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Dedica tu tiempo a lo que de verdad importa
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
            Automatiza las tareas repetitivas y deja que tu equipo se concentre en dar
            la mejor atención. Aura CRM trabaja por ti en segundo plano.
          </p>

          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="leading-relaxed text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>
          
          <Link to="/register?plan=full">
            <Button className="mt-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white" size="lg">
              Empieza gratis hoy
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:mt-8">
            <div className="font-display text-4xl font-semibold text-indigo-600">40%</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Menos citas perdidas gracias a los recordatorios automáticos.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="font-display text-4xl font-semibold text-indigo-600">8 h</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Ahorradas cada semana en tareas administrativas.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:mt-[-1rem]">
            <div className="font-display text-4xl font-semibold text-indigo-600">100%</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sin papel: consentimientos y firmas totalmente digitales.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="font-display text-4xl font-semibold text-indigo-600">5 min</div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Es todo lo que necesitas para configurar tu clínica.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}



function Pricing() {
  return (
    <section id="precios" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            Precios
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance text-foreground sm:text-5xl">
            Planes simples y transparentes
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-pretty text-muted-foreground">
            Empieza gratis 14 días. Sin tarjeta de crédito requerida.
          </p>
        </div>

        <div className="mt-14 grid items-start gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={
                plan.featured
                  ? "relative rounded-2xl border-2 border-indigo-600 bg-white p-8 shadow-xl shadow-indigo-100 scale-105 z-10"
                  : "rounded-2xl border border-border bg-white p-8 shadow-sm"
              }
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Más popular
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground h-10">{plan.description}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-5xl font-semibold text-foreground">
                  ${plan.price}
                </span>
                <span className="mb-1.5 text-sm font-semibold text-foreground">USD</span>
                <span className="mb-1.5 text-sm text-muted-foreground">/mes</span>
              </div>
              <Link to={plan.href} className="block w-full">
                <Button
                  className={`mt-6 w-full h-12 rounded-full font-medium ${plan.featured ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                >
                  {plan.cta}
                </Button>
              </Link>
              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-400">
                    <div className="h-4 w-4 rounded-full border-2 border-slate-200 flex items-center justify-center shrink-0 mt-0.5" />
                    <span>{limit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 max-w-2xl mx-auto text-center rounded-xl bg-slate-100 p-4 border border-slate-200">
          <p className="text-sm text-slate-600">
            * Los precios están expresados en <strong>dólares americanos (USD)</strong>. <br className="sm:hidden" />
            Al momento de pagar, se cobrará el equivalente en <strong>pesos</strong> según la cotización del día.
          </p>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-6 py-16 text-center sm:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(1_0_0/0.15),transparent_55%)]"
        />
        <h2 className="relative mx-auto max-w-2xl font-display text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
          Simplifica la gestión de tu clínica hoy mismo
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg leading-relaxed text-pretty text-indigo-100">
          Únete a miles de profesionales que ya ahorran horas de trabajo cada semana.
          Prueba Aura CRM gratis durante 14 días.
        </p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/register?plan=full" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="h-12 w-full rounded-full bg-white px-8 text-base text-indigo-600 hover:bg-indigo-50 sm:w-auto"
            >
              Prueba 14 días gratis
              <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
          <a href="https://wa.me/543573402221" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full border-indigo-400 bg-transparent px-8 text-base text-white hover:bg-indigo-700 hover:text-white sm:w-auto transition-colors"
            >
              Desarrollo a la medida
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <Link to="/" className="flex items-center justify-center gap-2.5 hover:opacity-90 transition-opacity">
            <AuraLogo size="large" />
          </Link>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            El CRM todo en uno para gestionar tu clínica o centro médico
            con eficiencia y profesionalismo. Creado por Romero Labs.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Aura CRM (Romero Labs). Todos los derechos reservados.</p>
          <p>Diseñado para potenciar profesionales de la salud y el bienestar.</p>
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <SiteHeader />
      <main>
        <Hero />
        <Stats />
        <Features />
        <Benefits />
        <Pricing />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
}
