-- Create gallery_items table
CREATE TABLE public.gallery_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  professional_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  before_url text,
  after_url text,
  treatment text,
  taken_at date DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

-- Gallery items policies
CREATE POLICY "Professionals can manage their own gallery items" ON public.gallery_items
  FOR ALL
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- Storage setup (Buckets)
-- Note: Buckets are usually created via UI or API, but can be done via SQL in some cases.
-- We will attempt to insert into storage.buckets if permissions allow, or just document the requirement.
INSERT INTO storage.buckets (id, name, public) VALUES ('signatures', 'signatures', false) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', false) ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Signatures access" ON storage.objects FOR ALL USING (bucket_id = 'signatures' AND auth.uid() = owner);
CREATE POLICY "Gallery access" ON storage.objects FOR ALL USING (bucket_id = 'gallery' AND auth.uid() = owner);
