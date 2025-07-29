// AI Filtering Edge Function
// Implements the two-tier AI filtering algorithm from the project brief

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.1'
import { corsHeaders } from '../_shared/cors.ts'

// Types for AI processing
interface Job {
  id: string
  title: string
  company: string
  location?: string
  description: string
  job_url?: string
  unique_id: string
  published_date?: string
  source?: string
}

interface UserPreferences {
  preferred_locations: string[]
  work_mode: string[]
  travel_willingness: string
  salary_range: string
  career_level: string[]
  tech_stack: string[]
  company_size: string[]
}

interface InitialFilterResult {
  rating: 'REJECT' | 'MAYBE' | 'APPROVE'
  reasoning: string
  top_matches?: string[]
}

interface DetailedAnalysis {
  why_worth_reviewing?: string
  technical_challenges?: string
  career_growth?: string
  company_assessment?: string
  potential_concerns?: string
  application_recommendations?: string
}

interface ProcessingResult {
  success: boolean
  jobs_processed: number
  jobs_approved: number
  jobs_filtered: number
  errors: string[]
  message: string
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

    console.log('Starting AI filtering process...')

    // Get user preferences (using default for now)
    const { data: preferences, error: prefsError } = await supabase
      .from('preferences')
      .select('*')
      .limit(1)
      .single()

    if (prefsError) {
      throw new Error(`Failed to fetch preferences: ${prefsError.message}`)
    }

    // Get unprocessed jobs (status = 'new')
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'new')
      .limit(10) // Process in batches to avoid timeouts

    if (jobsError) {
      throw new Error(`Failed to fetch jobs: ${jobsError.message}`)
    }

    if (!jobs || jobs.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No new jobs to process',
        data: { jobs_processed: 0, jobs_approved: 0, jobs_filtered: 0, errors: [] }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    let jobsProcessed = 0
    let jobsApproved = 0
    let jobsFiltered = 0
    const allErrors: string[] = []

    console.log(`Processing ${jobs.length} jobs through AI filtering`)

    // Process each job through the two-tier AI system
    for (const job of jobs) {
      try {
        console.log(`Processing job: ${job.title} at ${job.company}`)

        // Step 1: Initial AI Filtering (would use Ollama in production)
        const initialResult = await performInitialFiltering(job, preferences)
        
        if (initialResult.rating === 'REJECT') {
          // Mark job as filtered out
          await supabase
            .from('jobs')
            .update({
              status: 'filtered_out',
              rating: initialResult.rating,
              reasoning: initialResult.reasoning,
              date_processed: new Date().toISOString()
            })
            .eq('id', job.id)

          console.log(`Job filtered out: ${job.title} - ${initialResult.reasoning}`)
          jobsFiltered++
        } else {
          // Step 2: Detailed AI Analysis for approved/maybe jobs
          const detailedAnalysis = await performDetailedAnalysis(job, preferences)
          
          // Mark job as approved
          await supabase
            .from('jobs')
            .update({
              status: 'approved',
              rating: initialResult.rating,
              reasoning: initialResult.reasoning,
              top_matches: initialResult.top_matches,
              detailed_analysis: detailedAnalysis,
              date_processed: new Date().toISOString()
            })
            .eq('id', job.id)

          console.log(`Job approved: ${job.title} - ${initialResult.rating}`)
          jobsApproved++
        }

        jobsProcessed++

        // Add small delay to avoid overwhelming APIs
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (jobError) {
        const errorMsg = `Error processing job "${job.title}": ${jobError.message}`
        console.error(errorMsg)
        allErrors.push(errorMsg)

        // Mark job for manual review
        await supabase
          .from('jobs')
          .update({
            status: 'needs_review',
            processing_error: jobError.message,
            date_processed: new Date().toISOString()
          })
          .eq('id', job.id)
      }
    }

    // Update processing statistics
    const today = new Date().toISOString().split('T')[0]
    const { error: statsError } = await supabase
      .from('processing_stats')
      .upsert({
        run_date: today,
        jobs_approved: jobsApproved,
        jobs_filtered: jobsFiltered
      }, {
        onConflict: 'run_date',
        ignoreDuplicates: false
      })

    if (statsError) {
      console.error('Failed to update processing stats:', statsError.message)
    }

    const result: ProcessingResult = {
      success: true,
      jobs_processed: jobsProcessed,
      jobs_approved: jobsApproved,
      jobs_filtered: jobsFiltered,
      errors: allErrors,
      message: `AI filtering complete. Processed ${jobsProcessed} jobs, ${jobsApproved} approved, ${jobsFiltered} filtered out.`
    }

    console.log('AI filtering complete:', result)

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('AI filtering failed:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'AI filtering failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// Perform initial AI filtering (would use Ollama in production)
async function performInitialFiltering(job: Job, preferences: UserPreferences): Promise<InitialFilterResult> {
  try {
    // Create AI prompt based on project brief template
    const prompt = createInitialFilteringPrompt(job, preferences)
    
    // In production, this would call Ollama API
    // For now, we'll simulate the AI response based on basic rules
    const result = simulateInitialFiltering(job, preferences)
    
    console.log(`Initial filtering result for ${job.title}: ${result.rating}`)
    return result

  } catch (error) {
    console.error('Initial filtering failed:', error)
    // Default to MAYBE for manual review if AI fails
    return {
      rating: 'MAYBE',
      reasoning: `AI filtering failed: ${error.message}. Requires manual review.`,
      top_matches: []
    }
  }
}

// Perform detailed AI analysis (would use advanced AI in production)
async function performDetailedAnalysis(job: Job, preferences: UserPreferences): Promise<DetailedAnalysis> {
  try {
    // Create detailed analysis prompt
    const prompt = createDetailedAnalysisPrompt(job, preferences)
    
    // In production, this would call OpenAI or similar advanced AI
    // For now, we'll simulate the detailed analysis
    const analysis = simulateDetailedAnalysis(job, preferences)
    
    console.log(`Detailed analysis complete for ${job.title}`)
    return analysis

  } catch (error) {
    console.error('Detailed analysis failed:', error)
    return {
      why_worth_reviewing: 'AI analysis failed. Manual review required.',
      technical_challenges: 'Unable to analyze due to processing error.',
      career_growth: 'Unknown - requires manual assessment.',
      company_assessment: 'Unable to assess company details.',
      potential_concerns: `Processing error: ${error.message}`,
      application_recommendations: 'Manual review recommended before applying.'
    }
  }
}

// Create initial filtering prompt based on project brief
function createInitialFilteringPrompt(job: Job, preferences: UserPreferences): string {
  return `You are a job filtering assistant. Review this job listing against the candidate's profile and determine if it's worth their attention.

CANDIDATE PREFERENCES:
- Preferred Locations: ${preferences.preferred_locations.join(', ')}
- Work Mode: ${preferences.work_mode.join(', ')}
- Travel Willingness: ${preferences.travel_willingness}
- Salary Range: £${preferences.salary_range}
- Career Level: ${preferences.career_level.join(', ')}
- Tech Stack: ${preferences.tech_stack.join(', ')}
- Company Size: ${preferences.company_size.join(', ')}

JOB LISTING:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Description: ${job.description}
URL: ${job.job_url || 'Not available'}

CRITERIA TO EVALUATE:
- Location compatibility with preferred locations
- Work mode alignment (remote/hybrid/onsite)
- Travel requirements vs. willingness
- Salary expectations (if mentioned)
- Career level match
- Technology stack alignment
- Company size preference

INSTRUCTIONS:
1. Rate this job as: REJECT, MAYBE, or APPROVE
2. Provide brief reasoning (1-2 sentences)
3. If APPROVE, list the top 3 reasons why it's a good match

OUTPUT FORMAT:
Rating: [REJECT/MAYBE/APPROVE]
Reasoning: [Brief explanation]
Top Matches: [If APPROVE, list 3 key reasons]`
}

// Create detailed analysis prompt
function createDetailedAnalysisPrompt(job: Job, preferences: UserPreferences): string {
  return `You are a senior career advisor. Provide a detailed analysis of this job opportunity for a candidate.

JOB DETAILS:
Title: ${job.title}
Company: ${job.company}
Location: ${job.location || 'Not specified'}
Full Description: ${job.description}
URL: ${job.job_url || 'Not available'}

ANALYSIS REQUIREMENTS:
1. **Why This Job is Worth Reviewing**: Explain the specific opportunities and benefits
2. **Technical Challenges**: Identify the main technical challenges and learning opportunities
3. **Career Growth Potential**: Assess how this role could advance their career
4. **Company Assessment**: Evaluate the company's stability, culture, and reputation
5. **Potential Red Flags**: Note any concerns or areas requiring investigation
6. **Application Strategy**: Suggest how to approach the application process`
}

// Simulate initial filtering based on basic rules (would be replaced by AI in production)
function simulateInitialFiltering(job: Job, preferences: UserPreferences): InitialFilterResult {
  const title = job.title.toLowerCase()
  const description = job.description.toLowerCase()
  const location = job.location?.toLowerCase() || ''
  
  let score = 0
  const matches: string[] = []
  
  // Check tech stack alignment
  const techMatches = preferences.tech_stack.filter(tech => 
    title.includes(tech.toLowerCase()) || description.includes(tech.toLowerCase())
  )
  if (techMatches.length > 0) {
    score += 3
    matches.push(`Tech stack match: ${techMatches.join(', ')}`)
  }
  
  // Check location compatibility
  const locationMatches = preferences.preferred_locations.some(loc =>
    location.includes(loc.toLowerCase()) || 
    description.includes('remote') ||
    description.includes('hybrid')
  )
  if (locationMatches) {
    score += 2
    matches.push('Location compatible with preferences')
  }
  
  // Check career level
  const careerMatches = preferences.career_level.some(level =>
    title.includes(level.toLowerCase()) || description.includes(level.toLowerCase())
  )
  if (careerMatches) {
    score += 2
    matches.push('Career level match')
  }
  
  // Determine rating based on score
  if (score >= 5) {
    return {
      rating: 'APPROVE',
      reasoning: 'Strong match across multiple criteria including tech stack and location.',
      top_matches: matches.slice(0, 3)
    }
  } else if (score >= 2) {
    return {
      rating: 'MAYBE',
      reasoning: 'Partial match with some relevant criteria. Worth considering.',
      top_matches: matches
    }
  } else {
    return {
      rating: 'REJECT',
      reasoning: 'Limited alignment with candidate preferences and requirements.',
      top_matches: []
    }
  }
}

// Simulate detailed analysis (would be replaced by AI in production)
function simulateDetailedAnalysis(job: Job, preferences: UserPreferences): DetailedAnalysis {
  const title = job.title.toLowerCase()
  const company = job.company
  const description = job.description
  
  return {
    why_worth_reviewing: `This ${title} position at ${company} offers relevant experience in your target technology areas and aligns with your career progression goals.`,
    
    technical_challenges: `The role likely involves working with modern technology stacks and could provide opportunities to develop skills in areas mentioned in the job description.`,
    
    career_growth: `This position appears to match your ${preferences.career_level.join('/')} level preferences and could provide advancement opportunities within ${company}.`,
    
    company_assessment: `${company} appears to be actively hiring and has posted this role through professional channels, indicating ongoing business operations.`,
    
    potential_concerns: `Consider researching the company culture, team structure, and specific project details before applying. Verify salary alignment with your ${preferences.salary_range} range.`,
    
    application_recommendations: `Tailor your application to highlight relevant experience with ${preferences.tech_stack.slice(0, 3).join(', ')} and emphasize your interest in ${preferences.preferred_locations[0]} opportunities.`
  }
} 