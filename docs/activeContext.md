# Active Context - JobForge AI Local Setup

## Current Focus
Setting up the JobForge AI application to run locally with a simplified backend setup.

## Key Information

1. The application is a React/TypeScript frontend using Supabase as a backend
2. The user wants to:
   - Run the application locally (self-hosted)
   - Simplify the backend (possibly just PostgreSQL)
   - Remove authentication requirements
   - Make minimal frontend changes

3. Current Supabase configuration:
   - URL: https://mlzzzamqmajwctbzueat.supabase.co
   - Project ID: mlzzzamqmajwctbzueat
   - Database schema includes jobs table with user authentication references
   - Row-level security policies are in place requiring authenticated users

## Required Decisions

1. Whether full Supabase functionality is needed or just PostgreSQL
2. How to modify authentication and security for local-only usage
3. Best approach to self-host required backend components
4. Minimal frontend changes needed to work with local backend

## Verification Status

- [x] Completed platform detection (Linux)
- [x] Created Memory Bank structure
- [x] Determined task complexity (Level 3 - Intermediate Feature)
- [ ] Analyzed backend requirements
- [ ] Proposed local setup solution 