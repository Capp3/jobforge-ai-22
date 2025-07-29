# JobForge AI - Setup Guide

This guide provides comprehensive instructions for setting up and running the JobForge AI application with Supabase Cloud as the backend.

## Overview

JobForge AI is a job application tracking system built with:
- **Frontend**: React, TypeScript, Vite, shadcn/ui
- **Backend**: Supabase Cloud (PostgreSQL database + API)

This guide will help you set up the application to work with your Supabase Cloud project.

## Prerequisites

- Node.js and npm installed
- Supabase Cloud account (free tier available at [supabase.com](https://supabase.com))
- Basic understanding of PostgreSQL and Supabase

## Setup Steps

### 1. Create a Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com)
2. Create a new project and note your project URL and anon key
3. The project URL will look like: `https://[your-project-id].supabase.co`
4. The anon key will be available in your project settings under API

### 2. Clone and Install the Repository

```bash
# Clone the repository
git clone <repository-url> jobforge-ai
cd jobforge-ai

# Install dependencies
npm install
```

### 3. Configure Database Schema

1. Access the Supabase dashboard for your project
2. Go to the SQL Editor section
3. Use the SQL Editor to create the required tables and policies
4. Follow the instructions in `docs/database-setup-guide.md` for specific SQL commands to run
5. Add sample data for testing

### 4. Configure Frontend to Use Supabase Cloud

Update the Supabase client configuration in `src/integrations/supabase/client.ts`:

```typescript
// Update these values with your Supabase project credentials
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-key";
```

### 5. Authentication Setup

Supabase Cloud provides several authentication options. For a simple setup:

1. Go to the Authentication section in your Supabase dashboard
2. Enable Email authentication under Providers
3. Optionally, enable "Confirm email" if you want users to verify their email

For development purposes, you can also:

1. Create a test user in the Authentication > Users section
2. Use this user to test the application

### 6. Start the Development Server

```bash
npm run dev
```

The application should now be running and connected to your Supabase Cloud project.

### 7. Build the Application for Production

When you're ready to deploy:

```bash
npm run build
```

This will create a production-ready build in the `dist` folder.

### 8. Install http-server

To serve the built application locally:

```bash
# Install http-server globally
npm install -g http-server

# Or add it as a dev dependency
npm install --save-dev http-server
```

### 9. Create a Start Script

Add a new script to your package.json file:

```bash
# Open package.json and add to the "scripts" section:
# "serve": "http-server dist -p 8080"
```

Your package.json scripts section should include:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "serve": "http-server dist -p 8080",
  ...
}
```

### 10. Serve the Built Application

```bash
# Using the npm script
npm run serve

# Or directly with http-server
http-server dist -p 8080
```

The built application will be available at http://localhost:8080

## Verification Steps

1. Open the application in your browser
2. Sign in with your test account
3. Navigate to the Jobs page
4. Verify that you can see the sample jobs from your database
5. Test creating a new job entry
6. Test updating the status of an existing job

## Troubleshooting

### Connection Issues

If you're having trouble connecting to your Supabase Cloud instance:

1. Verify that the Supabase URL and key are correctly configured
2. Check for CORS errors in the browser console
3. Ensure your Supabase project is active
4. Verify that you're using the correct project credentials

### Database Issues

If you're seeing database-related errors:

1. Verify that the database schema is correctly set up
2. Check if the Row-Level Security policies are properly configured
3. Ensure that the sample data is inserted correctly
4. Test queries directly in the Supabase SQL Editor

### Authentication Issues

If you're experiencing authentication problems:

1. Check the enabled auth providers in your Supabase dashboard
2. Verify that the Row-Level Security policies allow the operations you're trying to perform
3. Check browser console for any auth-related errors

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/learn)
- [http-server Documentation](https://github.com/http-party/http-server#readme)

## Next Steps

After successfully setting up your environment, you might want to:

1. Add more features to the application
2. Customize the UI to match your preferences
3. Add automated testing for critical functionality
4. Deploy to a production hosting service like Vercel, Netlify, or GitHub Pages

---

For any questions or issues, please refer to the project repository or contact the maintainers. 