# 🚀 JobForge AI Production Deployment

## Quick Start

For complete step-by-step deployment instructions, see:
**[📋 Production Deployment Guide](docs/production-deployment.md)**

## Overview

JobForge AI requires these main deployment steps:

1. **Database Migration** - Apply schema changes to Supabase
2. **Edge Functions** - Deploy AI processing functions
3. **Environment Setup** - Configure API keys and secrets
4. **Frontend Build** - Create production build
5. **Testing** - Verify complete pipeline

## Prerequisites

- ✅ Supabase Cloud account with active project
- ✅ Ollama instance running (for AI filtering)
- ✅ Node.js installed (v18+)

## Quick Commands

```bash
# Build application
npm run build

# Serve locally  
npm run serve

# Deploy Edge Functions (after Supabase CLI setup)
npx supabase functions deploy process-rss
npx supabase functions deploy ai-filtering
npx supabase functions deploy email-delivery
```

## Important Files

- `supabase/migrations/20250728140000_algorithm_enhancement.sql` - Database migration
- `src/integrations/supabase/client.ts` - Production credentials
- `docs/production-deployment.md` - **Complete deployment guide**

## Need Help?

📖 **Read the full guide**: [docs/production-deployment.md](docs/production-deployment.md)

The comprehensive guide includes:
- Step-by-step instructions
- Troubleshooting section
- Security considerations
- Monitoring setup
- Maintenance procedures 