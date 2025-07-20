-- Set timezone to Asia/Bangkok permanently for this database
ALTER DATABASE postgres SET timezone TO 'Asia/Bangkok';
-- Set timezone for current session
SET timezone = 'Asia/Bangkok';

-- Create User Profiles table
create table
  public.profiles (
    id uuid not null references auth.users on delete cascade,
    full_name text,
    email text unique,
    avatar_url text,
    primary key (id)
  );

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for
select
  using (true);

create policy "Users can insert their own profile." on profiles for insert
with
  check (auth.uid () = id);

create policy "Users can update own profile." on profiles
for update
  using (auth.uid () = id);

create function public.handle_new_user () returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'email'
    );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();




-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_code VARCHAR(50) NOT NULL UNIQUE,
  project_name VARCHAR(255) NOT NULL,
  contact_number VARCHAR(20) NOT NULL,
  sign_date DATE NOT NULL,
  suppliers JSONB NOT NULL DEFAULT '[]',
  sla_level JSONB NOT NULL DEFAULT '{"high": 4, "medium": 8, "low": 24}',
  project_manager JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok'),
  updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok')
);

-- สร้าง index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_projects_project_code ON projects(project_code);
CREATE INDEX IF NOT EXISTS idx_projects_project_name ON projects(project_name);
CREATE INDEX IF NOT EXISTS idx_projects_sign_date ON projects(sign_date);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- สร้าง function สำหรับ update timestamp อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW() AT TIME ZONE 'Asia/Bangkok';
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับ update timestamp อัตโนมัติ
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();




-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tickets table
CREATE TABLE tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  reporter_name VARCHAR(255) NOT NULL,
  reporter_email VARCHAR(255) NOT NULL,
  reporter_phone VARCHAR(50),
  category VARCHAR(100) NOT NULL,
  priority VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'Open',
  subject VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  project_id VARCHAR(255),
  assigned_to VARCHAR(255),
  sla_deadline TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok'),
  updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok')
);

-- Create ticket_attachments table
CREATE TABLE ticket_attachments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  type VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok')
);

-- Create ticket_comments table
CREATE TABLE ticket_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok'),
  updated_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok')
);

-- Create ticket_change_logs table
CREATE TABLE ticket_change_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok')
);

-- Create ticket_feedback table
CREATE TABLE ticket_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Bangkok')
);

-- Create indexes for better performance
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_category ON tickets(category);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_project_id ON tickets(project_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_ticket_number ON tickets(ticket_number);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_ticket_change_logs_ticket_id ON ticket_change_logs(ticket_id);
CREATE INDEX idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW() AT TIME ZONE 'Asia/Bangkok';
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ticket_comments_updated_at 
    BEFORE UPDATE ON ticket_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - customize based on your auth requirements)
CREATE POLICY "Allow all operations on tickets" ON tickets FOR ALL USING (true);
CREATE POLICY "Allow all operations on ticket_attachments" ON ticket_attachments FOR ALL USING (true);
CREATE POLICY "Allow all operations on ticket_comments" ON ticket_comments FOR ALL USING (true);
CREATE POLICY "Allow all operations on ticket_change_logs" ON ticket_change_logs FOR ALL USING (true);
CREATE POLICY "Allow all operations on ticket_feedback" ON ticket_feedback FOR ALL USING (true);

-- Create storage bucket for ticket attachments (run this in Supabase Storage dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', true);

-- Storage policy for ticket attachments
-- CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (bucket_id = 'ticket-attachments');
-- CREATE POLICY "Allow authenticated upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ticket-attachments');
