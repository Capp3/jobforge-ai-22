// Email Delivery Edge Function
// Implements the email delivery system from the project brief

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'
import { corsHeaders } from '../_shared/cors.ts'

// Types for email delivery
interface Job {
  id: string
  title: string
  company: string
  location?: string
  salary_range?: string
  job_url?: string
  description: string
  rating: string
  reasoning: string
  top_matches?: string[]
  detailed_analysis?: DetailedAnalysis
  published_date?: string
}

interface DetailedAnalysis {
  why_worth_reviewing?: string
  technical_challenges?: string
  career_growth?: string
  company_assessment?: string
  potential_concerns?: string
  application_recommendations?: string
}

interface UserPreferences {
  preferred_locations: string[]
  work_mode: string[]
  salary_range: string
  tech_stack: string[]
}

interface EmailResult {
  success: boolean
  jobs_emailed: number
  recipient: string
  message: string
  error?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('Starting email delivery process...')

    // Get approved jobs that haven't been emailed yet
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'approved')
      .eq('emailed', false)

    if (jobsError) {
      throw new Error(`Failed to fetch approved jobs: ${jobsError.message}`)
    }

    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No approved jobs to email',
        data: { jobs_emailed: 0, recipient: '', message: 'No new jobs to send' }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Get user preferences for email personalization
    const { data: preferences, error: prefsError } = await supabase
      .from('preferences')
      .select('*')
      .limit(1)
      .single()

    if (prefsError) {
      console.warn('Failed to fetch preferences, using defaults:', prefsError.message)
    }

    console.log(`Preparing to email ${jobs.length} approved jobs`)

    // Create email content
    const emailContent = createEmailContent(jobs, preferences)
    const emailSubject = `New Job Opportunities: ${jobs.length} positions matching your profile`
    
    // Get recipient email from environment variables
    const recipientEmail = Deno.env.get('RECIPIENT_EMAIL') || 'user@example.com'

    // Send email (using a placeholder service - would integrate with actual email service)
    const emailSent = await sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html: emailContent.html,
      text: emailContent.text
    })

    if (emailSent.success) {
      // Mark jobs as emailed
      const jobIds = jobs.map(job => job.id)
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ 
          emailed: true,
          status: 'emailed'
        })
        .in('id', jobIds)

      if (updateError) {
        console.error('Failed to update job email status:', updateError.message)
      }

      // Update processing statistics
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('processing_stats')
        .upsert({
          run_date: today,
          jobs_emailed: jobs.length
        }, {
          onConflict: 'run_date',
          ignoreDuplicates: false
        })

      console.log(`Successfully emailed ${jobs.length} jobs to ${recipientEmail}`)
    }

    const result: EmailResult = {
      success: emailSent.success,
      jobs_emailed: emailSent.success ? jobs.length : 0,
      recipient: recipientEmail,
      message: emailSent.success 
        ? `Successfully sent ${jobs.length} job recommendations`
        : `Failed to send email: ${emailSent.error}`,
      error: emailSent.error
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: emailSent.success ? 200 : 500,
    })

  } catch (error) {
    console.error('Email delivery failed:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Email delivery failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// Create email content based on project brief template
function createEmailContent(jobs: Job[], preferences?: UserPreferences) {
  const timestamp = new Date().toLocaleString()
  const totalJobs = jobs.length

  // Create HTML version
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>New Job Opportunities</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background-color: #f4f4f4; padding: 20px; border-radius: 5px; }
    .job { border: 1px solid #ddd; margin: 20px 0; padding: 15px; border-radius: 5px; }
    .job-title { color: #2c3e50; font-size: 18px; font-weight: bold; }
    .company { color: #34495e; font-size: 16px; margin: 5px 0; }
    .location { color: #7f8c8d; }
    .rating { color: #27ae60; font-weight: bold; }
    .section { margin: 10px 0; }
    .section-title { font-weight: bold; color: #2c3e50; }
    .footer { background-color: #f4f4f4; padding: 15px; margin-top: 30px; border-radius: 5px; }
    .btn { background-color: #3498db; color: white; padding: 10px 15px; text-decoration: none; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>New Job Opportunities</h1>
    <p>Hi there! I found <strong>${totalJobs}</strong> new job opportunities that match your profile and criteria:</p>
  </div>

  ${jobs.map(job => `
    <div class="job">
      <div class="job-title">${job.title}</div>
      <div class="company">🏢 ${job.company}</div>
      <div class="location">📍 ${job.location || 'Location not specified'} ${job.salary_range ? `| 💰 ${job.salary_range}` : ''}</div>
      <div class="rating">⭐ Rating: ${job.rating}</div>
      
      <div class="section">
        <div class="section-title">Why This Role:</div>
        <p>${job.detailed_analysis?.why_worth_reviewing || job.reasoning}</p>
      </div>

      ${job.detailed_analysis?.technical_challenges ? `
        <div class="section">
          <div class="section-title">Key Challenges:</div>
          <p>${job.detailed_analysis.technical_challenges}</p>
        </div>
      ` : ''}

      ${job.detailed_analysis?.career_growth ? `
        <div class="section">
          <div class="section-title">Career Growth:</div>
          <p>${job.detailed_analysis.career_growth}</p>
        </div>
      ` : ''}

      ${job.job_url ? `
        <p><a href="${job.job_url}" class="btn">View Job Listing</a></p>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <h3>Next Steps:</h3>
    <ul>
      <li>Review each listing in detail</li>
      <li>Research company websites for additional context</li>
      <li>Prepare tailored applications for roles of interest</li>
    </ul>

    ${preferences ? `
      <h3>Your Profile Summary:</h3>
      <ul>
        <li><strong>Preferred locations:</strong> ${preferences.preferred_locations.join(', ')}</li>
        <li><strong>Work mode:</strong> ${preferences.work_mode.join(', ')}</li>
        <li><strong>Target salary range:</strong> £${preferences.salary_range}</li>
        <li><strong>Key skills:</strong> ${preferences.tech_stack.join(', ')}</li>
      </ul>
    ` : ''}

    <p><small>Generated on: ${timestamp}<br>
    This email was automatically generated by your JobForge AI assistant.</small></p>
  </div>
</body>
</html>`

  // Create plain text version
  const text = `New Job Opportunities

Hi there! I found ${totalJobs} new job opportunities that match your profile:

${jobs.map((job, index) => `
${index + 1}. ${job.title} at ${job.company}
   📍 ${job.location || 'Location not specified'}
   ⭐ Rating: ${job.rating}
   
   Why This Role: ${job.detailed_analysis?.why_worth_reviewing || job.reasoning}
   
   ${job.job_url ? `🔗 View Job: ${job.job_url}` : ''}
   
   ---
`).join('')}

Next Steps:
- Review each listing in detail
- Research company websites for additional context  
- Prepare tailored applications for roles of interest

${preferences ? `
Your Profile Summary:
- Preferred locations: ${preferences.preferred_locations.join(', ')}
- Work mode: ${preferences.work_mode.join(', ')}
- Target salary range: £${preferences.salary_range}
- Key skills: ${preferences.tech_stack.join(', ')}
` : ''}

Generated on: ${timestamp}
This email was automatically generated by your JobForge AI assistant.`

  return { html, text }
}

// Send email (placeholder implementation - would integrate with actual email service)
async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Sending email to: ${params.to}`)
    console.log(`Subject: ${params.subject}`)
    
    // In production, this would integrate with services like:
    // - SendGrid
    // - Resend
    // - AWS SES
    // - Postmark
    // etc.
    
    // For now, we'll simulate email sending
    const emailApiKey = Deno.env.get('EMAIL_API_KEY')
    if (!emailApiKey) {
      console.warn('No EMAIL_API_KEY configured, simulating email send')
      return { success: true }
    }

    // Example integration with a hypothetical email service
    const emailResponse = await fetch('https://api.emailservice.com/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        from: 'jobforge-ai@example.com'
      })
    })

    if (emailResponse.ok) {
      console.log('Email sent successfully')
      return { success: true }
    } else {
      const errorText = await emailResponse.text()
      console.error('Email service error:', errorText)
      return { success: false, error: `Email service error: ${errorText}` }
    }

  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error: error.message }
  }
} 