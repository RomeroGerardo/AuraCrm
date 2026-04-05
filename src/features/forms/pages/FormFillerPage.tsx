import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTemplate, useTemplates, useSubmitForm } from '../hooks/useForms';
import { useClient } from '@/features/clients/hooks/useClients';
import { FormRenderer } from '../components/FormRenderer';
import { SignaturePad } from '@/features/signatures/components/SignaturePad';
import { useSignature } from '@/features/signatures/hooks/useSignature';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { generateDynamicSchema } from '../schemas/formSchema';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSettings } from '@/features/settings/hooks/useSettings';

export const FormFillerPage: React.FC = () => {
  const { id: clientId, templateId } = useParams<{ id: string; templateId?: string }>();
  const navigate = useNavigate();
  
  const { data: client, isLoading: loadingClient } = useClient(clientId!);
  const { data: template, isLoading: loadingTemplate } = useTemplate(templateId);
  const { data: allTemplates = [], isLoading: loadingAll } = useTemplates();
  const { mutateAsync: submitForm, isPending: isSubmitting } = useSubmitForm();
  const { uploadSignature, isUploading } = useSignature();
  const { data: businessProfile } = useSettings();

  const fields = React.useMemo(() => template?.fields || [], [template]);
  const dynamicSchema = React.useMemo(() => generateDynamicSchema(fields), [fields]);

  const methods = useForm({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      signature_url: '',
    }
  });

  const { setValue, handleSubmit } = methods;

  // Inicializar valores por defecto cuando se carga la plantilla
  React.useEffect(() => {
    if (template) {
      const defaultValues = template.fields.reduce((acc, field) => {
        acc[field.id] = field.type === 'checkbox' ? false : '';
        return acc;
      }, { signature_url: '' } as Record<string, any>);
      methods.reset(defaultValues);
    }
  }, [template, methods]);

  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP", error);
      return "0.0.0.0";
    }
  };

  const handleFinish = async (data: Record<string, any>) => {
    if (!clientId || !templateId) return;

    // data ya contiene todos los campos dinámicos + signature_url (Base64)
    const base64Signature = data.signature_url;

    try {
      // 1. Generar ID de submission para nombrar el archivo de firma
      const submissionId = crypto.randomUUID();
      
      // 2. Subir firma a Storage
      const signatureUrl = await uploadSignature(base64Signature, submissionId);
      if (!signatureUrl) return;

      // 3. Capturar IP
      const ipAddress = await getIpAddress();

      // 4. Extraer respuestas (todo excepto metadatos del formulario)
      const { signature_url, ...answers } = data;

      // 5. Enviar todo a DB
      await submitForm({
        // @ts-ignore - Forzamos el ID generado para que coincida con el nombre del archivo
        id: submissionId,
        client_id: clientId,
        template_id: templateId,
        answers,
        signature_url: signatureUrl,
        signed_at: new Date().toISOString(),
        ip_address: ipAddress,
      });

      navigate(`/clients/${clientId}`);
    } catch (error) {
      console.error("Error submitting form", error);
    }
  };

  if (loadingClient || (templateId && loadingTemplate) || (!templateId && loadingAll)) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Cliente no encontrado</h2>
        <Button onClick={() => navigate('/clients')} className="mt-4">Volver a Clientes</Button>
      </div>
    );
  }

  // Si no hay templateId, mostrar selector de plantillas
  if (!templateId) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${clientId}`)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Rellenar Ficha</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allTemplates.length === 0 ? (
            <Card className="col-span-full py-12 text-center border-dashed">
              <p className="text-muted-foreground">No hay plantillas disponibles.</p>
              <Button variant="link" onClick={() => navigate('/forms')}>Gestionar plantillas</Button>
            </Card>
          ) : (
            allTemplates.map((t) => (
              <Card 
                key={t.id} 
                className="hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(`/clients/${clientId}/forms/${t.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {t.name}
                    <FileText className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>{t.fields.length} campos</CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Plantilla no encontrada</h2>
        <Button onClick={() => navigate(`/clients/${clientId}`)} className="mt-4">Volver al cliente</Button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto py-8 px-4 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/clients/${clientId}/forms`)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{template.name}</h1>
            <p className="text-muted-foreground text-sm">Cliente: {client.full_name}</p>
          </div>
        </div>

        <FormRenderer
          title="Datos de la Ficha"
          description="Completa la información solicitada a continuación."
          fields={template.fields}
          logoUrl={businessProfile?.logo_url || undefined}
        />

        <div id="signature-section" className="mt-8 space-y-4">
          <SignaturePad 
            onConfirm={(base64) => {
              setValue('signature_url', base64);
              if (base64) toast.success("Firma capturada correctamente");
            }} 
          />
          
          <p className="text-xs text-muted-foreground text-center px-4">
            Al confirmar esta ficha, el cliente otorga su consentimiento legal mediante la firma digital adjunta.
          </p>
        </div>

        <div className="mt-12 mb-20 flex flex-col gap-3">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-bold shadow-lg"
            onClick={handleSubmit(handleFinish)}
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              'Guardar y Finalizar Ficha'
            )}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => navigate(`/clients/${clientId}/forms`)}
            disabled={isSubmitting || isUploading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </FormProvider>
  );
};
