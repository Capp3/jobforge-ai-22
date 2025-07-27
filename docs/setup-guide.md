# JobForge AI - Local Setup Guide

This guide provides comprehensive instructions for setting up and running the JobForge AI application with a local self-hosted Supabase backend.

## Overview

JobForge AI is a job application tracking system built with:
- **Frontend**: React, TypeScript, Vite, shadcn/ui
- **Backend**: Supabase (PostgreSQL database + API)

This guide will help you set up the application to work with your self-hosted Supabase instance.

## Prerequisites

- Node.js and npm installed
- Access to a self-hosted Supabase instance running at 192.168.1.17
- Basic understanding of PostgreSQL and Supabase

## Setup Steps

### 1. Clone and Install the Repository

```bash
# Clone the repository
git clone <repository-url> jobforge-ai
cd jobforge-ai

# Install dependencies
npm install
```

### 2. Configure Database Schema

Follow the instructions in `docs/database-setup-guide.md` to set up your database schema. In summary:

1. Access the Supabase Studio dashboard at http://192.168.1.17:3000
2. Use the SQL Editor to create the required tables and policies
3. Add sample data for testing

### 3. Configure Frontend to Use Local Supabase

Follow the instructions in `docs/frontend-update-guide.md` to update the frontend code to connect to your local Supabase instance. The key change is updating the Supabase client configuration in `src/integrations/supabase/client.ts`:

```typescript
// Update these values
const SUPABASE_URL = "http://192.168.1.17:8000";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE";
```

### 4. Handle Authentication for Local-Only App

Since this is intended as a local-only micro app without authentication requirements, you have two main options:

#### Option 1: Disable Row-Level Security (RLS)

The simplest approach is to disable row-level security in your Supabase database:

```sql
ALTER TABLE public.jobs DISABLE ROW LEVEL SECURITY;
```

#### Option 2: Update Frontend Code to Use Default User

If you prefer to keep RLS enabled, modify the frontend code to use a default user ID for all operations. See the `docs/frontend-update-guide.md` for detailed instructions.

### 5. Start the Development Server

```bash
npm run dev
```

The application should now be running and connected to your local Supabase instance.

## Verification Steps

1. Open the application in your browser (typically at http://localhost:5173)
2. Navigate to the Jobs page
3. Verify that you can see the sample jobs from your database
4. Test creating a new job entry
5. Test updating the status of an existing job

## Troubleshooting

### Connection Issues

If you're having trouble connecting to your local Supabase instance:

1. Verify that the Supabase URL and key are correctly configured
2. Check that your Supabase instance is running and accessible
3. Look for CORS errors in the browser console
4. Try accessing the Supabase API directly using a tool like curl or Postman

### Database Issues

If you're seeing database-related errors:

1. Verify that the database schema is correctly set up
2. Check if the Row-Level Security policies are properly configured
3. Ensure that the sample data is inserted correctly
4. Test queries directly in the Supabase SQL Editor

### Authentication Issues

If you're experiencing authentication problems:

1. Check if anonymous authentication is enabled in your Supabase instance
2. Verify that the Row-Level Security policies allow the operations you're trying to perform
3. Consider disabling RLS for simplicity in a local-only setup

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/learn)

## Next Steps

After successfully setting up the local environment, you might want to:

1. Add more features to the application
2. Customize the UI to match your preferences
3. Add automated testing for critical functionality
4. Set up a CI/CD pipeline for development

---

For any questions or issues, please refer to the project repository or contact the maintainers. 