# Quick Start Guide

This guide provides minimal setup instructions for experienced developers who want to get JobForge AI running quickly.

## Prerequisites

- Node.js and npm
- Access to Supabase instance at `192.168.1.17:8000`
- Supabase Studio access at `192.168.1.17:3000`

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Update Supabase Configuration

Edit `src/integrations/supabase/client.ts`:

```typescript
const SUPABASE_URL = "http://192.168.1.17:8000";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
```

### 3. Set Up Database

Access Supabase Studio at `http://192.168.1.17:3000` and run:

```sql
-- Create jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
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
  source TEXT,
  date_posted TIMESTAMP WITH TIME ZONE,
  date_processed TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Disable RLS for local-only usage
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;

-- Add sample data
INSERT INTO public.jobs (title, company, location, salary_range, ai_rating, ai_notes, status, source)
VALUES 
  ('Senior Frontend Developer', 'TechCorp Inc', 'Remote', '$80k - $120k', 8, 'Great match for React skills', 'pending', 'RSS Feed 1'),
  ('Full Stack Engineer', 'StartupXYZ', 'San Francisco, CA', '$90k - $130k', 9, 'Perfect fit for full-stack experience', 'applied', 'RSS Feed 2');
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## What's Next?

- See the [Setup Guide](setup-guide.md) for detailed instructions
- Check [Architecture](architecture.md) for system design details
- Review [Tasks](tasks.md) for current development status

## Troubleshooting

- **Connection errors**: Verify Supabase URL and key are correct
- **Database errors**: Check that the jobs table exists and RLS is disabled
- **CORS issues**: Ensure your Supabase instance allows requests from localhost 