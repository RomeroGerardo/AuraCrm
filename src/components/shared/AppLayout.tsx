import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { 
  Users, 
  FileText, 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  Menu, 
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSettings } from '@/features/settings/hooks/useSettings'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Fichas', href: '/forms', icon: FileText },
  { name: 'Citas', href: '/appointments', icon: Calendar },
]

export const AppLayout = () => {
  const { logout, user } = useAuth()
  const { data: businessProfile } = useSettings()
  const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  // Salon name from profiles table, fallback to user metadata or default
  const salonName = businessProfile?.salon_name || user?.user_metadata?.salon_name || 'Aura CRM'
  const logoUrl = businessProfile?.logo_url
  const fullName = businessProfile?.full_name || user?.user_metadata?.full_name || 'Profesional'

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
      else setSidebarOpen(true)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-card border-r transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-0 lg:w-20 overflow-hidden lg:overflow-visible"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="h-16 flex items-center px-6 border-b shrink-0 gap-3">
            {isSidebarOpen ? (
              <>
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded-md" />
                )}
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent truncate">
                  {salonName}
                </span>
              </>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 mx-auto flex items-center justify-center overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-primary font-black">A</span>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className={cn("shrink-0", isActive ? "h-5 w-5" : "h-5 w-5 group-hover:scale-110 transition-transform")} />
                  {isSidebarOpen && <span className="font-medium truncate">{item.name}</span>}
                  
                  {/* Tooltip for collapsed sidebar */}
                  {!isSidebarOpen && !isMobile && (
                    <div className="absolute left-14 invisible group-hover:visible bg-popover text-popover-foreground px-2 py-1 rounded border shadow-md text-xs z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section (Bottom) */}
          <div className={cn("p-4 border-t space-y-2", !isSidebarOpen && "items-center")}>
            {/* Settings Link */}
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative mb-1",
                isSidebarOpen ? "w-full justify-start" : "mx-auto justify-center",
                location.pathname === "/settings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Settings className={cn("shrink-0", location.pathname === "/settings" ? "h-5 w-5" : "h-5 w-5 group-hover:scale-110 transition-transform")} />
              {isSidebarOpen && <span className="font-medium truncate">Configuración</span>}
              {!isSidebarOpen && !isMobile && (
                <div className="absolute left-14 invisible group-hover:visible bg-popover text-popover-foreground px-2 py-1 rounded border shadow-md text-xs z-50 whitespace-nowrap">
                  Configuración
                </div>
              )}
            </Link>

            {isSidebarOpen ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-accent/50 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground shrink-0">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5 shrink-0" />
                  <span>Cerrar Sesión</span>
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="mx-auto flex hover:bg-destructive/10 hover:text-destructive"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Header & Main Content */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-md px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="lg:flex"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h2 className="font-semibold text-lg lg:hidden truncate">
               {salonName}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-medium leading-none">{fullName}</p>
              <p className="text-xs text-muted-foreground mt-1">{salonName}</p>
            </div>
            {/* Header shortcuts or notifications could go here */}
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
