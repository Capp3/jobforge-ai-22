-- Enhanced JobForge AI Algorithm Schema
-- This migration adds the required tables and fields to support the algorithm from the project brief

-- Drop existing policies and constraints to recreate them
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can delete their own jobs" ON public.jobs;

-- Add new columns to jobs table for algorithm support
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS unique_id TEXT UNIQUE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS rating TEXT; -- REJECT, MAYBE, APPROVE
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS reasoning TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS top_matches JSONB;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS detailed_analysis JSONB;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS emailed BOOLEAN DEFAULT false;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS processing_error TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS published_date TIMESTAMP WITH TIME ZONE;

-- Update status column to support algorithm statuses
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check 
  CHECK (status IN ('new', 'filtered_out', 'approved', 'emailed', 'needs_review', 'pending', 'applied', 'interview', 'rejected', 'offer'));

-- Create user preferences table
CREATE TABLE IF NOT EXISTS public.preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_locations TEXT[],
  work_mode TEXT[],
  travel_willingness TEXT,
  salary_range TEXT,
  career_level TEXT[],
  tech_stack TEXT[],
  company_size TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create RSS feeds configuration table
CREATE TABLE IF NOT EXISTS public.rss_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  last_processed TIMESTAMP WITH TIME ZONE,
  processing_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create processing statistics table
CREATE TABLE IF NOT EXISTS public.processing_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE DEFAULT CURRENT_DATE,
  total_jobs_processed INTEGER DEFAULT 0,
  jobs_approved INTEGER DEFAULT 0,
  jobs_filtered INTEGER DEFAULT 0,
  jobs_emailed INTEGER DEFAULT 0,
  processing_time_seconds INTEGER,
  errors_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(run_date)
);

-- Enable RLS on new tables
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for jobs table (updated)
CREATE POLICY "Users can view all jobs" 
ON public.jobs 
FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "System can manage all jobs" 
ON public.jobs 
FOR ALL 
TO service_role
USING (true);

-- Create policies for preferences table
CREATE POLICY "Users can view their own preferences" 
ON public.preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" 
ON public.preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage all preferences" 
ON public.preferences 
FOR ALL 
TO service_role
USING (true);

-- Create policies for RSS feeds (system managed)
CREATE POLICY "Anyone can view RSS feeds" 
ON public.rss_feeds 
FOR SELECT 
TO authenticated, anon, service_role
USING (true);

CREATE POLICY "System can manage RSS feeds" 
ON public.rss_feeds 
FOR ALL 
TO service_role
USING (true);

-- Create policies for processing stats (read-only for users)
CREATE POLICY "Anyone can view processing stats" 
ON public.processing_stats 
FOR SELECT 
TO authenticated, anon, service_role
USING (true);

CREATE POLICY "System can manage processing stats" 
ON public.processing_stats 
FOR ALL 
TO service_role
USING (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_preferences_updated_at
  BEFORE UPDATE ON public.preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rss_feeds_updated_at
  BEFORE UPDATE ON public.rss_feeds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_processing_stats_updated_at
  BEFORE UPDATE ON public.processing_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default RSS feeds
INSERT INTO public.rss_feeds (url, name, active) 
VALUES 
  ('https://rss.app/feeds/_dut10XITtqVqfwp1.xml', 'Primary Job Feed', true)
ON CONFLICT (url) DO NOTHING;

-- Insert default user preferences (for anonymous usage)
INSERT INTO public.preferences (
  user_id,
  preferred_locations,
  work_mode,
  travel_willingness,
  salary_range,
  career_level,
  tech_stack,
  company_size
) VALUES (
  gen_random_uuid(), -- Default user ID for anonymous usage
  ARRAY['Belfast', 'Northern Ireland', 'UK', 'Remote'],
  ARRAY['hybrid', 'remote', 'onsite'],
  'limited',
  '40000-80000',
  ARRAY['senior', 'mid'],
  ARRAY['broadcast', 'media', 'production', 'networking', 'AV', 'IP'],
  ARRAY['startup', 'medium', 'large']
) ON CONFLICT (user_id) DO NOTHING;

-- Update existing jobs with unique_id if missing
UPDATE public.jobs 
SET unique_id = COALESCE(unique_id, gen_random_uuid()::text || '_' || extract(epoch from created_at)::text)
WHERE unique_id IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_unique_id ON public.jobs(unique_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_rating ON public.jobs(rating);
CREATE INDEX IF NOT EXISTS idx_jobs_emailed ON public.jobs(emailed);
CREATE INDEX IF NOT EXISTS idx_jobs_published_date ON public.jobs(published_date);
CREATE INDEX IF NOT EXISTS idx_preferences_user_id ON public.preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_rss_feeds_active ON public.rss_feeds(active);
CREATE INDEX IF NOT EXISTS idx_processing_stats_run_date ON public.processing_stats(run_date); 