-- SQL Schema for Lala Tracker — Client Request Tracking System

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE request_status AS ENUM ('new', 'in_progress', 'waiting_on_client', 'done');
CREATE TYPE request_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 3. Users Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Clients Table
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type_of_work TEXT NOT NULL DEFAULT 'General',
  status request_status NOT NULL DEFAULT 'new',
  priority request_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Activity Log Table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'status_changed', 'reassigned', 'comment_added', 'created', 'priority_changed', 'due_date_changed'
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. TRIGGERS

-- Auto-update updated_at on requests table
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Auto-update last_activity_at on requests table whenever comments are added
CREATE OR REPLACE FUNCTION update_request_last_activity_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.requests
  SET last_activity_at = NOW()
  WHERE id = NEW.request_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_last_activity
AFTER INSERT ON public.comments
FOR EACH ROW
EXECUTE FUNCTION update_request_last_activity_on_comment();

-- Auto-sync auth.users to public.users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member'::user_role)
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      name = EXCLUDED.name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users full read/write access to org workspace data
CREATE POLICY "Authenticated users can read users" ON public.users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read clients" ON public.clients FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert clients" ON public.clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can select requests" ON public.requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert requests" ON public.requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update requests" ON public.requests FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin users can delete requests" ON public.requests FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Authenticated users can read comments" ON public.comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin users can delete comments" ON public.comments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Authenticated users can read activity_log" ON public.activity_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert activity_log" ON public.activity_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 10. Enable Supabase Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
