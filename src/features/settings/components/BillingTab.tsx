import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Check, CreditCard, ExternalLink, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useSubscription, type PlanType } from '@/hooks/useSubscription';
import { toast } from 'sonner';

export const BillingTab = () => {
  const { planType, status, trialEnd, isLoading, refetch } = useSubscription();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState<string | null>(null);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleUpgrade = async (selectedPlan: PlanType) => {
    try {
      setIsCheckoutLoading(selectedPlan);
      
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId: selectedPlan }
      });

      if (error) {
        let detailedMsg = error.message;
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            if (body?.error) detailedMsg = body.error;
          }
        } catch (_) {}
        throw new Error(detailedMsg || 'Error al conectar con la pasarela de pagos');
      }

      if (data?.init_point) {
        toast.info('Redirigiendo a Mercado Pago para completar tu suscripción...');
        window.location.href = data.init_point; // Redirect to MercadoPago
      } else if (data?.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error al generar el link de pago:', error);
      toast.error(error.message || 'Error al generar el pago. Intenta de nuevo.');
    } finally {
      setIsCheckoutLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setIsCancelLoading(true);
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase.functions.invoke('cancel-subscription');

      if (error) {
        let detailedMsg = error.message;
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            if (body?.error) detailedMsg = body.error;
          }
        } catch (_) {}
        throw new Error(detailedMsg || 'Error al cancelar la suscripción');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success('Tu suscripción ha sido cancelada correctamente.');
      setIsCancelDialogOpen(false);
      await refetch();
    } catch (error: any) {
      console.error('Error cancelando suscripción:', error);
      toast.error(error.message || 'No se pudo cancelar la suscripción.');
    } finally {
      setIsCancelLoading(false);
    }
  };

  const isTrialActive = status === 'trialing' && trialEnd && new Date(trialEnd) > new Date();
  const hasActivePaidPlan = (planType === 'pro' || planType === 'full') && status === 'active';
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Estado de tu Suscripción
          </CardTitle>
          <CardDescription>
            Administra tu plan actual y mejora para obtener más beneficios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border p-5 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="font-medium text-base">
                Plan actual: <span className="uppercase text-primary font-bold">{planType}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Estado: {' '}
                <span className={`font-semibold ${status === 'active' ? 'text-green-600' : isTrialActive ? 'text-amber-600' : 'text-red-600'}`}>
                  {status === 'active' ? 'Activo' : isTrialActive ? 'En periodo de prueba (14 días)' : 'Inactivo / Cancelado'}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              {isTrialActive && (
                <div className="text-left md:text-right">
                  <p className="text-sm font-medium text-amber-600">Prueba Finaliza</p>
                  <p className="text-xs text-muted-foreground">{new Date(trialEnd!).toLocaleDateString()}</p>
                </div>
              )}

              {/* Cancel Subscription Button & Confirmation Dialog */}
              {hasActivePaidPlan && (
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Cancelar suscripción
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[450px] rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        ¿Cancelar suscripción?
                      </DialogTitle>
                      <DialogDescription className="pt-2 text-slate-600">
                        Si cancelas tu suscripción, tu cuenta volverá al <b>Plan Free</b> y perderás el acceso a las funciones avanzadas como recordatorios automáticos por WhatsApp, firmas digitales y almacenamiento ampliado.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsCancelDialogOpen(false)}
                        disabled={isCancelLoading}
                      >
                        Mantener mi plan
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelSubscription}
                        disabled={isCancelLoading}
                      >
                        {isCancelLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          'Confirmar cancelación'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Pro */}
        <Card className={`relative ${planType === 'pro' && status === 'active' ? 'border-primary ring-2 ring-primary shadow-md' : ''}`}>
          {planType === 'pro' && status === 'active' && (
            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-semibold">
              Tu plan actual
            </div>
          )}
          <CardHeader>
            <CardTitle>Plan Pro</CardTitle>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">$39.000</span>
              <span className="text-sm text-muted-foreground"> ARS /mes</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Historias clínicas ilimitadas</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Agenda compartida</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> <b>Firmas Digitales</b></li>
            </ul>
          </CardContent>
          <CardFooter>
            {planType === 'pro' && status === 'active' ? (
              <Button disabled variant="outline" className="w-full">Plan Actual Activo</Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => handleUpgrade('pro')}
                disabled={isCheckoutLoading !== null}
              >
                {isCheckoutLoading === 'pro' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Mejorar a Pro <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Plan Full */}
        <Card className={`relative ${planType === 'full' && status === 'active' ? 'border-primary ring-2 ring-primary shadow-md' : ''}`}>
           {planType === 'full' && status === 'active' && (
            <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg font-semibold">
              Tu plan actual
            </div>
          )}
          <CardHeader>
            <CardTitle>Plan Full</CardTitle>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold">$59.000</span>
              <span className="text-sm text-muted-foreground"> ARS /mes</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Todo lo del plan Pro</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> Plantillas de mensajes</li>
              <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500" /> <b>Recordatorios por WhatsApp</b></li>
            </ul>
          </CardContent>
          <CardFooter>
             {planType === 'full' && status === 'active' ? (
              <Button disabled variant="outline" className="w-full">Plan Actual Activo</Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600" 
                onClick={() => handleUpgrade('full')}
                disabled={isCheckoutLoading !== null}
              >
                 {isCheckoutLoading === 'full' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Mejorar a Full <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
