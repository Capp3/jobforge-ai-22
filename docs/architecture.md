# Architecture Decision Record - JobForge AI Local Setup

## Context

### System Requirements:
- Run the application locally on a self-hosted system
- Simplify the backend (minimal dependencies)
- Minimize changes to the frontend code
- Remove authentication requirements (local-only app)
- Self-host any required backend services

### Technical Constraints:
- Current frontend is built with React, TypeScript, and Vite
- Frontend directly calls Supabase client for data operations
- Database schema includes authentication and row-level security dependencies
- PostgreSQL database is required for data storage
- Frontend expects Supabase API structure for queries

## Component Analysis

### Core Components:

#### 1. Frontend Application (React/TypeScript)
- **Purpose/Role:** User interface for job management
- **Current Dependencies:** Supabase client, authentication

#### 2. Database (PostgreSQL)
- **Purpose/Role:** Store job records and user data
- **Current Structure:** Includes auth tables and RLS policies

#### 3. Backend Services
- **Purpose/Role:** API access, authentication, security
- **Current Implementation:** Supabase hosted service

### Interactions:
- Frontend directly queries Supabase API for data operations
- Row-level security filters data based on authenticated user
- Database triggers maintain timestamps and data integrity

## Architecture Options

### Option 1: Self-hosted Supabase
- **Description:** Set up complete Supabase stack locally
- **Pros:**
  - Maintains compatibility with existing frontend code
  - Provides full feature set of current implementation
  - Requires minimal frontend changes
- **Cons:**
  - Complex setup with multiple services
  - Higher resource requirements
  - May be overkill for a simple local application
- **Technical Fit:** High
- **Complexity:** High
- **Scalability:** High

### Option 2: PostgreSQL + Express API
- **Description:** Standalone PostgreSQL with lightweight Express API
- **Pros:**
  - Simpler architecture than full Supabase
  - Can mimic required Supabase API endpoints
  - More control over backend implementation
- **Cons:**
  - Requires creating a custom API layer
  - More frontend changes to adapt to new API
  - Need to recreate some Supabase functionality
- **Technical Fit:** Medium
- **Complexity:** Medium
- **Scalability:** Medium

### Option 3: Direct PostgreSQL + Modified Frontend
- **Description:** Connect frontend directly to PostgreSQL with modified client
- **Pros:**
  - Eliminates middleware layer
  - Simplest backend setup
  - Focused on just database functionality
- **Cons:**
  - Requires more significant frontend changes
  - Loses Supabase features like realtime updates
  - May require security compromises
- **Technical Fit:** Low
- **Complexity:** Medium (due to frontend changes)
- **Scalability:** Low

## Decision

### Chosen Option: Self-hosted Supabase (Option 1)

### Rationale:
After evaluating the options, self-hosted Supabase provides the best balance of maintaining frontend compatibility while meeting the requirement to run locally. This approach allows us to keep frontend changes minimal (a key requirement) while still providing all the functionality of the current application.

While it requires more backend setup, the Supabase team has provided Docker configurations that simplify this process. The PostgreSQL database will be part of this setup, and we can modify the authentication requirements within Supabase rather than rebuilding this functionality.

### Implementation Considerations:
- Set up Supabase using Docker for local development
- Modify authentication to allow anonymous access
- Adjust RLS policies to work without user authentication
- Update frontend configuration to point to local Supabase instance
- Create a simplified setup script to make deployment easier

## Validation

### Requirements Met:
- [✓] Run locally on self-hosted system
- [✓] Self-host backend services
- [✓] Minimize frontend code changes
- [✓] Simplify backend (relative to custom implementation)
- [✓] Remove authentication requirement (via configuration)

### Technical Feasibility:
High - Supabase provides Docker configurations for local development, making this approach technically feasible with reasonable effort.

### Risk Assessment:
- **Setup Complexity:** Medium risk - Supabase has multiple components but offers Docker configurations
- **Performance:** Low risk - Local setup should provide good performance
- **Maintenance:** Medium risk - Updates to Supabase might require maintenance

## Implementation Plan

### Phase 1: Local Supabase Setup
1. Set up Docker with Supabase configuration
2. Initialize PostgreSQL database
3. Configure Supabase services for local access

### Phase 2: Authentication Modification
1. Configure anonymous access
2. Modify row-level security policies
3. Update database schema to remove auth dependencies

### Phase 3: Frontend Integration
1. Update Supabase client configuration to use local URL
2. Test database operations
3. Address any authentication-related issues

### Phase 4: Documentation & Testing
1. Create setup documentation
2. Test all application features
3. Document any behavioral differences 