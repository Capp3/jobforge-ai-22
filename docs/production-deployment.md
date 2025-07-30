# JobForge AI Production Deployment Guide

This guide walks you through deploying JobForge AI to production using Supabase Cloud. Follow these steps in order to ensure a successful deployment.

## Prerequisites

Before starting, ensure you have:
- ✅ Supabase Cloud account (https://supabase.com)
- ✅ Supabase project created 
- ✅ Node.js installed (v18+)
- ✅ Ollama instance running (for AI filtering)
- ✅ Email service provider account (optional, for notifications)

## Step 1: Apply Database Migration

### 1.1 Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Sign in to your account
3. Select your JobForge AI project

### 1.2 Open SQL Editor
1. In the left sidebar, click **"SQL Editor"**
2. Click **"New Query"** to create a new SQL script

### 1.3 Apply the Migration
1. Copy the migration SQL from `supabase/migrations/20250728140000_algorithm_enhancement.sql`
2. Paste the entire content into the SQL Editor
3. Click **"Run"** to execute the migration
4. Verify success - you should see "Success. No rows returned" message

### 1.4 Verify Tables Created
1. Go to **"Table Editor"** in the sidebar
2. Confirm these tables exist:
   - `jobs` (with new algorithm columns)
   - `preferences` 
   - `rss_feeds`
   - `processing_stats`

## Step 2: Deploy Edge Functions

### 2.1 Install Supabase CLI
```bash
npm install supabase --save-dev
```

### 2.2 Login to Supabase
```bash
npx supabase login
```
Follow the prompts to authenticate with your Supabase account.

### 2.3 Link Your Project
```bash
npx supabase link --project-ref YOUR_PROJECT_ID
```
Replace `YOUR_PROJECT_ID` with your actual Supabase project reference ID (found in project settings).

### 2.4 Deploy Each Edge Function
Deploy the three main algorithm functions:

```bash
# Deploy RSS processing function
npx supabase functions deploy process-rss

# Deploy AI filtering function  
npx supabase functions deploy ai-filtering

# Deploy email delivery function
npx supabase functions deploy email-delivery
```

### 2.5 Verify Deployment
1. Go to **"Edge Functions"** in your Supabase dashboard
2. Confirm all three functions are deployed and active:
   - `process-rss`
   - `ai-filtering`  
   - `email-delivery`

## Step 3: Configure Environment Variables

### 3.1 Set Edge Function Secrets
In your Supabase dashboard, go to **"Settings"** → **"API"** → **"Environment Variables"**

Add these secrets for your Edge Functions:

```bash
# Ollama Configuration
OLLAMA_ENDPOINT=http://your-ollama-server:11434

# Advanced AI Configuration (choose one)
OPENAI_API_KEY=sk-your-openai-key
# OR
ANTHROPIC_API_KEY=your-anthropic-key

# Email Service (optional - choose one)
SENDGRID_API_KEY=your-sendgrid-key
# OR  
RESEND_API_KEY=your-resend-key
# OR
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### 3.2 Update Function Environment
After adding secrets, redeploy functions to pick up new environment variables:

```bash
npx supabase functions deploy process-rss
npx supabase functions deploy ai-filtering
npx supabase functions deploy email-delivery
```

## Step 4: Configure Frontend Application

### 4.1 Update Supabase Client Configuration
Ensure `src/integrations/supabase/client.ts` has your production credentials:

```typescript
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "your-anon-public-key";
```

### 4.2 Build Production Application
```bash
npm run build
```

### 4.3 Test Local Production Build
```bash
npm run serve
```
Visit http://localhost:8080 to test the production build locally.

## Step 5: Configure RSS Feeds

### 5.1 Access RSS Feeds Table
1. Go to **"Table Editor"** → **"rss_feeds"**
2. A default feed should already be inserted from the migration

### 5.2 Add Additional Feeds (Optional)
Insert additional RSS feeds for job sources:

```sql
INSERT INTO public.rss_feeds (url, name, active) 
VALUES 
  ('https://your-job-board.com/rss', 'Job Board Name', true),
  ('https://another-source.com/jobs.xml', 'Another Source', true);
```

## Step 6: Set Up User Preferences

### 6.1 Default Preferences
The migration automatically creates default preferences. To customize:

1. Go to **"Table Editor"** → **"preferences"**
2. Edit the default row to match your job filtering criteria
3. Or add new preference sets for different users

### 6.2 LLM Configuration
Users can configure LLM settings through the application:
- Ollama endpoint URL
- Model selection
- Advanced AI model choice

## Step 7: Configure Ollama Integration

### 7.1 Ensure Ollama is Running
Your Ollama instance must be accessible from Supabase Edge Functions:

```bash
# Test Ollama connectivity
curl http://your-ollama-server:11434/api/tags
```

### 7.2 Install Required Models
Ensure these models are available in Ollama:

```bash
ollama pull llama2        # For initial filtering
ollama pull mistral       # Alternative model
ollama pull codellama     # For technical jobs
```

### 7.3 Configure CORS (if needed)
If Ollama is on a different domain, ensure CORS is configured:

```bash
# Set OLLAMA_ORIGINS environment variable
export OLLAMA_ORIGINS="https://your-project-id.supabase.co"
```

## Step 8: Test the Complete Pipeline

### 8.1 Test RSS Processing
1. In your Supabase dashboard, go to **"Edge Functions"** → **"process-rss"**
2. Click **"Invoke"** to manually trigger RSS processing
3. Check the **"logs"** for successful execution
4. Verify new jobs appear in the `jobs` table

### 8.2 Test AI Filtering  
1. Invoke the **"ai-filtering"** function
2. Check logs for AI processing results
3. Verify jobs have updated `rating` and `reasoning` fields

### 8.3 Test Email Delivery
1. Invoke the **"email-delivery"** function  
2. Check logs for email sending attempts
3. Verify `emailed` flag is updated on processed jobs

### 8.4 Test Frontend Application
1. Open your deployed application
2. Test these features:
   - Dashboard shows job statistics
   - Job listing displays processed jobs
   - Preferences form saves LLM configuration
   - Manual pipeline controls work
   - Real-time updates function

## Step 9: Set Up Automated Processing

### 9.1 Create Database Functions for Automation
Add this function to run the complete pipeline:

```sql
CREATE OR REPLACE FUNCTION run_job_pipeline()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- This will be called by a scheduled Edge Function
  PERFORM pg_notify('job_pipeline', 'run');
END;
$$;
```

### 9.2 Set Up Cron Jobs (Optional)
Use Supabase's cron extension or external cron service to trigger pipeline:

```sql
-- Enable pg_cron (contact Supabase support)
SELECT cron.schedule('job-pipeline', '0 */6 * * *', 'SELECT run_job_pipeline();');
```

## Step 10: Monitor and Maintain

### 10.1 Set Up Monitoring
1. Monitor Edge Function logs for errors
2. Set up alerts for failed pipeline runs
3. Monitor database performance and storage usage

### 10.2 Regular Maintenance Tasks
- **Weekly**: Review AI filtering accuracy and adjust prompts
- **Monthly**: Clean up old processing statistics
- **Quarterly**: Update AI models and retrain preferences

### 10.3 Backup Configuration
Ensure you have backups of:
- Database schema and data
- Edge Function code
- Environment variables/secrets
- RSS feed configurations

## Troubleshooting

### Common Issues and Solutions

#### RSS Processing Fails
- **Check RSS feed URLs** are accessible
- **Verify CORS** settings if feeds require authentication
- **Review logs** for specific error messages

#### AI Filtering Not Working
- **Test Ollama connectivity** from Edge Functions
- **Verify model availability** in Ollama instance
- **Check API keys** for advanced AI services

#### Email Delivery Issues
- **Verify email service** credentials and quotas
- **Check spam folders** for test emails
- **Review email templates** for formatting issues

#### Frontend Connection Issues
- **Verify Supabase URL** and API keys
- **Check browser console** for JavaScript errors
- **Test API connectivity** using Supabase dashboard

#### Performance Issues
- **Monitor database query performance**
- **Check Edge Function execution times**
- **Review table indexes** and optimize as needed

## Security Considerations

### Production Security Checklist
- ✅ RLS policies are enabled on all tables
- ✅ API keys are stored as secrets, not in code
- ✅ Ollama instance is secured and not publicly accessible
- ✅ Email service has proper authentication
- ✅ Frontend uses HTTPS in production
- ✅ Regular security updates are applied

### Data Privacy
- User preferences are protected by RLS
- Job data access is controlled
- Email addresses are handled securely
- API keys are encrypted in storage

## Support and Resources

### Documentation Links
- [Supabase Documentation](https://supabase.com/docs)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Ollama Documentation](https://ollama.ai/docs)

### Getting Help
- **Supabase Support**: Contact through dashboard
- **JobForge AI Issues**: Check project documentation
- **Community**: Supabase Discord and forums

---

## Deployment Complete ✅

Once all steps are completed successfully, your JobForge AI application is production-ready with:

- ✅ Automated job processing pipeline
- ✅ AI-powered job filtering and analysis  
- ✅ User preference management
- ✅ Real-time dashboard and analytics
- ✅ Email delivery system
- ✅ Ollama LLM integration
- ✅ Scalable cloud infrastructure

Your application should now be processing jobs automatically and providing intelligent job recommendations to users!