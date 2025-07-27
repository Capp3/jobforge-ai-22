-- Create jobs table for storing processed job applications
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary_range TEXT,
  job_url TEXT,
  description TEXT,
  requirements TEXT,
  ai_rating INTEGER CHECK (ai_rating >= 1 AND ai_rating <= 10),
  ai_notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'interview', 'rejected', 'offer')),
  source TEXT, -- RSS feed or manual entry
  date_posted TIMESTAMP WITH TIME ZONE,
  date_processed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own jobs" 
ON public.jobs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs" 
ON public.jobs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs" 
ON public.jobs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add some sample data for testing
INSERT INTO public.jobs (user_id, title, company, location, salary_range, job_url, ai_rating, ai_notes, status, source, date_posted)
VALUES 
  (gen_random_uuid(), 'Senior Frontend Developer', 'TechCorp Inc', 'Remote', '$80k - $120k', 'https://example.com/job1', 8, 'Great match for React skills', 'pending', 'RSS Feed 1', now() - interval '2 days'),
  (gen_random_uuid(), 'Full Stack Engineer', 'StartupXYZ', 'San Francisco, CA', '$90k - $130k', 'https://example.com/job2', 9, 'Perfect fit for full-stack experience', 'applied', 'RSS Feed 2', now() - interval '1 day'),
  (gen_random_uuid(), 'React Developer', 'BigTech Solutions', 'New York, NY', '$70k - $100k', 'https://example.com/job3', 6, 'Good opportunity but lower salary', 'interview', 'Manual Entry', now() - interval '3 days');