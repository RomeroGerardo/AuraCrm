-- Create form_templates table
CREATE TABLE public.form_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  fields jsonb DEFAULT '[]'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create form_submissions table
CREATE TABLE public.form_submissions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id uuid REFERENCES public.form_templates(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  answers jsonb DEFAULT '{}'::jsonb NOT NULL,
  signature_url text,
  signed_at timestamptz,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Form templates policies
CREATE POLICY "Professionals can manage their own templates" ON public.form_templates
  FOR ALL
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- Form submissions policies
CREATE POLICY "Professionals can manage their propias submissions" ON public.form_submissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.form_templates 
      WHERE id = template_id AND professional_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.form_templates 
      WHERE id = template_id AND professional_id = auth.uid()
    )
  );
