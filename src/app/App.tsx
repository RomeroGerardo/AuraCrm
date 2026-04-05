import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { PrivateRoute } from '@/components/shared/PrivateRoute'
import { AppLayout } from '@/components/shared/AppLayout'
import { Toaster } from '@/components/ui/sonner'

// Lazy Loading de Páginas
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ClientsPage = lazy(() => import('@/features/clients/pages/ClientsPage').then(m => ({ default: m.ClientsPage })))
const ClientDetailPage = lazy(() => import('@/features/clients/pages/ClientDetailPage').then(m => ({ default: m.ClientDetailPage })))
const FormsPage = lazy(() => import('@/features/forms/pages/FormsPage').then(m => ({ default: m.FormsPage })))
const FormFillerPage = lazy(() => import('@/features/forms/pages/FormFillerPage').then(m => ({ default: m.FormFillerPage })))
const AppointmentsPage = lazy(() => import('@/features/appointments/pages/AppointmentsPage').then(m => ({ default: m.AppointmentsPage })))
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

function App() {
  return (
    <>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Cargando...</div>}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas Privadas Protegidas y con Layout */}
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/forms" element={<FormsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/clients/:id/forms" element={<FormFillerPage />} />
            <Route path="/clients/:id/forms/:templateId" element={<FormFillerPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            
            {/* Redirección dentro del Layout si se accede a la raíz autenticado */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>

          {/* Fallback general */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" richColors closeButton />
    </>
  )
}

export default App
