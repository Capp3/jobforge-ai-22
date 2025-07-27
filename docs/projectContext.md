# JobForge AI Project Context

## Current State

This project is a job hunting automation system built with:
- Frontend: React with TypeScript, Vite, shadcn/ui components
- Backend: Currently configured to use Supabase
- Database: PostgreSQL (managed by Supabase)

## User Requirements

1. Run the application locally on a self-hosted system
2. Simplify the backend - possibly use just PostgreSQL without full Supabase
3. Make minimal changes to the frontend code
4. Eliminate the need for authentication (local-only micro app)
5. Self-host any required backend services instead of using Supabase servers

## Technical Context

The application is designed to help users manage job applications with features including:
- Job listing display
- Job tracking by status
- AI ratings for job matches

## Analysis Notes

1. The application is currently using Supabase for:
   - Database storage of job records
   - User authentication
   - Row-level security policies

2. The frontend makes direct Supabase client calls to fetch and manage data

3. The database schema includes a jobs table with the following structure:
   - id (UUID)
   - user_id (UUID, references auth.users)
   - title (TEXT)
   - company (TEXT)
   - location (TEXT)
   - salary_range (TEXT)
   - job_url (TEXT)
   - description (TEXT)
   - requirements (TEXT)
   - ai_rating (INTEGER)
   - ai_notes (TEXT)
   - status (TEXT)
   - source (TEXT)
   - date_posted (TIMESTAMP)
   - date_processed (TIMESTAMP)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP) 