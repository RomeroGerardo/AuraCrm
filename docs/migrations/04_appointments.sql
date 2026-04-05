-- Create appointments table
CREATE TABLE public.appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  service text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  reminder_sent boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments policies
CREATE POLICY "Professionals can manage their own appointments" ON public.appointments
  FOR ALL
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());
