# Database Setup Guide for Local Supabase Instance

This document outlines the steps to set up your local Supabase database with the correct schema for the JobForge AI application.

## Prerequisites

- Access to the Supabase Studio dashboard at http://192.168.1.17:3000
- Login credentials (Username: `supabase`, Password: `homeland`)

## Database Schema Setup

### Option 1: Running Migration Scripts

The application includes migration scripts in the `supabase/migrations` directory that can be used to set up the database schema.

1. Log in to the Supabase Studio dashboard
2. Navigate to the SQL Editor
3. Copy the contents of each migration file and execute them in order:
   - First run `20250727125308-b7288ae2-d15c-4860-8d10-f28122251b9b.sql`
   - Then run `20250727125340-0022f869-e980-4f80-8c12-17e759f78917.sql`

### Option 2: Manual Table Creation

If you prefer to set up the schema manually or modify it for a local-only setup, follow these steps:

1. Log in to the Supabase Studio dashboard
2. Navigate to the SQL Editor
3. Create the jobs table with the following SQL:

```sql
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID, -- Removed the reference to auth.users for local-only setup
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
```

## Setting Up Row-Level Security (RLS)

For a local-only application without authentication, you can either disable RLS or set up policies that allow all operations.

### Option 1: Disable RLS (Recommended for Local-Only Apps)

```sql
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
```

### Option 2: Create Open RLS Policies

```sql
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view jobs" 
ON public.jobs 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update jobs" 
ON public.jobs 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete jobs" 
ON public.jobs 
FOR DELETE 
USING (true);
```

## Sample Data for Testing

Add some sample jobs to test the application:

```sql
INSERT INTO public.jobs (title, company, location, salary_range, job_url, ai_rating, ai_notes, status, source, date_posted)
VALUES 
  ('Senior Frontend Developer', 'TechCorp Inc', 'Remote', '$80k - $120k', 'https://example.com/job1', 8, 'Great match for React skills', 'pending', 'RSS Feed 1', now() - interval '2 days'),
  ('Full Stack Engineer', 'StartupXYZ', 'San Francisco, CA', '$90k - $130k', 'https://example.com/job2', 9, 'Perfect fit for full-stack experience', 'applied', 'RSS Feed 2', now() - interval '1 day'),
  ('React Developer', 'BigTech Solutions', 'New York, NY', '$70k - $100k', 'https://example.com/job3', 6, 'Good opportunity but lower salary', 'interview', 'Manual Entry', now() - interval '3 days');
```

## Verifying Database Setup

To verify that your database is set up correctly:

1. Navigate to the Table Editor in Supabase Studio
2. You should see the `jobs` table with the sample data
3. Test making a query using the SQL Editor:
   ```sql
   SELECT * FROM public.jobs;
   ```

## Troubleshooting

1. **Migration Issues**: If you encounter errors during migration, try running the statements one by one to identify the problematic one
2. **RLS Issues**: If you have trouble accessing data, make sure RLS is either disabled or properly configured
3. **Foreign Key Constraints**: The original schema references `auth.users` - if you're getting errors, you may need to modify these references
4. **UUID Generation**: If `gen_random_uuid()` function is not available, you might need to install the `pgcrypto` extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS pgcrypto;
   ```

## Next Steps

After setting up the database, you'll need to:

1. Configure the frontend to connect to your local Supabase instance
2. Test creating, reading, updating, and deleting jobs
3. Verify all features work as expected 