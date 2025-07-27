# Guide: Connecting Frontend to Local Supabase Instance

This document outlines the necessary changes to connect the JobForge AI frontend application to your self-hosted Supabase instance.

## Required Changes

### 1. Update Supabase Client Configuration

**File to modify:** `src/integrations/supabase/client.ts`

**Current configuration:**
```typescript
const SUPABASE_URL = "https://mlzzzamqmajwctbzueat.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1senp6YW1xbWFqd2N0Ynp1ZWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTkxMDUsImV4cCI6MjA2OTE5NTEwNX0.uj-Gl5UUZhPCIqh1ppEIeAhLjubhEFusfDEbcQoEmLk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

**Required changes:**
1. Replace the `SUPABASE_URL` with your local Supabase API URL
2. Replace the `SUPABASE_PUBLISHABLE_KEY` with your local anonymous key

**New configuration should look like:**
```typescript
const SUPABASE_URL = "http://192.168.1.17:8000";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### 2. Update Environment Variables (Optional)

If you prefer to use environment variables instead of hardcoded values:

**Create/Update `.env` file:**
```
VITE_SUPABASE_URL=http://192.168.1.17:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
```

**Then modify client.ts to use them:**
```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## Authentication Considerations

### 1. Anonymous Access for Local-Only App

If you want to remove authentication requirements for a local-only app, you have a few options:

#### Option 1: Use a default user ID for all operations
Modify any component that uses auth state to provide a default user ID:

```typescript
// Example modification in a component that fetches data
const fetchJobs = async () => {
  try {
    // Original code with user auth
    // const { data, error } = await supabase
    //   .from('jobs')
    //   .select('*')
    //   .order('date_processed', { ascending: false });

    // Modified code with hardcoded user ID for local-only usage
    const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000"; // Replace with a valid UUID
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID) // Filter by the default user
      .order('date_processed', { ascending: false });

    if (error) throw error;
    setJobs(data || []);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    toast({
      title: "Error",
      description: "Failed to fetch jobs from database",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
```

#### Option 2: Modify RLS policies in the local Supabase instance
Using the Studio Dashboard at http://192.168.1.17:3000, you can modify Row Level Security policies to allow anonymous access:

1. Go to Authentication > Policies
2. Update policies for the `jobs` table to allow operations without authentication
3. Example policy modification:
   ```sql
   CREATE POLICY "Allow anonymous access to jobs"
   ON public.jobs
   FOR SELECT
   USING (true); -- Allow anyone to view
   ```

### 2. Cross-Origin Issues

If you encounter CORS (Cross-Origin Resource Sharing) issues:

1. Make sure your Supabase instance has the appropriate CORS configuration
2. You may need to add your frontend origin to the allowed list in the Supabase dashboard

## Testing the Connection

After making the changes, test the connection:

1. Start the development server with `npm run dev`
2. Open the browser console and check for connection errors
3. Try to fetch data from the `jobs` table
4. Verify that the data is being displayed correctly

## Troubleshooting

1. **Connection Error**: Verify that the Supabase URL and keys are correct, and that your Supabase instance is running
2. **Authentication Error**: Check if you need to modify RLS policies or update authentication flow
3. **CORS Error**: Update your Supabase CORS configuration to allow requests from your frontend
4. **Database Schema Issues**: Verify that your local database schema matches what the frontend expects 