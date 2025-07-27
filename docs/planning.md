# JobForge AI Local Setup - Planning Document

## Requirements Analysis

### Core Requirements:
- [ ] Run the application locally on a self-hosted system
- [ ] Simplify the backend (possibly just PostgreSQL without full Supabase)
- [ ] Minimize changes to the frontend code
- [ ] Remove need for authentication (local-only micro app)
- [ ] Self-host any required backend services instead of using Supabase servers

### Technical Constraints:
- [ ] Current frontend is built with React, TypeScript, and Vite
- [ ] Current backend uses Supabase with PostgreSQL database
- [ ] Database includes authentication and row-level security policies
- [ ] Frontend directly calls Supabase client for data operations

## Component Analysis

### Affected Components:

#### 1. Backend Infrastructure
- **Changes needed:** 
  - Replace remote Supabase with local backend
  - Configure PostgreSQL database locally
  - Handle authentication removal
- **Dependencies:**
  - PostgreSQL
  - Possibly Docker for containerization

#### 2. Frontend Supabase Integration
- **Changes needed:**
  - Update Supabase client configuration to point to local backend
  - Modify authentication logic to work without auth
  - Update data access to work without row-level security
- **Dependencies:**
  - src/integrations/supabase/client.ts
  - Any components that rely on auth state

#### 3. Database Schema
- **Changes needed:**
  - Adapt schema to work without auth.users dependency
  - Remove or modify row-level security policies
  - Maintain data structure for jobs table
- **Dependencies:**
  - Current migration files in supabase/migrations/

## Design Decisions

### Architecture:
- [ ] **Backend Option 1:** Self-hosted Supabase with local PostgreSQL
  - Maintains most compatibility with current code
  - Requires more setup/infrastructure
- [ ] **Backend Option 2:** Standalone PostgreSQL without Supabase features
  - Simplifies backend but requires more frontend changes
  - Could use a lightweight API layer (Express) between frontend and database
- [ ] **Backend Option 3:** Mock/Local storage without database
  - Minimal backend requirements but loses persistence
  - Biggest departure from current architecture

### Authentication Alternatives:
- [ ] **No Auth:** Remove all authentication and security constraints
- [ ] **Simplified Auth:** Basic local authentication for demonstration
- [ ] **Environment Toggle:** Switch between authenticated and non-authenticated modes

### Development Environment:
- [ ] **Docker Compose:** Container setup with PostgreSQL and optional Supabase
- [ ] **Direct Install:** Local PostgreSQL installation with manual configuration
- [ ] **Hybrid:** Docker for database, direct install for application

## Implementation Strategy

### Phase 1: Local Database Setup
- [ ] Install PostgreSQL locally or set up Docker container
- [ ] Create database schema from existing migrations
- [ ] Modify schema to remove authentication dependencies
- [ ] Test database connectivity

### Phase 2: Backend Configuration
- [ ] Determine final backend architecture (Supabase vs PostgreSQL vs hybrid)
- [ ] Set up selected backend infrastructure
- [ ] Configure connection settings
- [ ] Create sample data for testing

### Phase 3: Frontend Modifications
- [ ] Update Supabase client configuration to point to local backend
- [ ] Modify authentication flow to work without auth
- [ ] Update components that rely on user authentication
- [ ] Test data operations with local backend

### Phase 4: Documentation and Testing
- [ ] Create setup documentation for local environment
- [ ] Test all application features with local backend
- [ ] Document any behavioral differences from original version
- [ ] Create simplified deployment guide

## Testing Strategy

### Unit Tests:
- [ ] Test database connection and operations
- [ ] Test modified authentication flow
- [ ] Test frontend components with local backend

### Integration Tests:
- [ ] Verify full application workflow with local backend
- [ ] Test job creation, viewing, and status updates
- [ ] Validate data persistence between application restarts

### Manual Testing Checklist:
- [ ] Application startup and connection to local database
- [ ] View existing jobs
- [ ] Create new job entries
- [ ] Update job status
- [ ] Filter and search functionality
- [ ] Any AI rating features if applicable

## Documentation Plan

- [ ] Updated README with local setup instructions
- [ ] Environment configuration guide
- [ ] Database setup instructions
- [ ] Architectural changes documentation
- [ ] Frontend modification notes 