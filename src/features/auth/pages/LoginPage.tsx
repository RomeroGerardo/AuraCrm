import { LoginForm } from '../components/LoginForm'
import loginCover from '@/assets/login-cover.png'

export const LoginPage = () => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={loginCover}
          alt="Login Cover"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary drop-shadow-md">Aura CRM</h1>
          <p className="text-muted-foreground font-medium italic">Simplifica la gestión de tu estudio</p>
        </div>
        
        <div className="backdrop-blur-xl bg-white/30 dark:bg-black/30 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
