import { RegisterForm } from '../components/RegisterForm'

export const RegisterPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Aura CRM</h1>
          <p className="text-muted-foreground">Únete a la nueva era de gestión digital</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
