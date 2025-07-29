// Enhanced TypeScript types for JobForge AI Algorithm

// Job status types based on algorithm workflow
export type JobStatus = 
  | 'new'           // Just processed from RSS
  | 'filtered_out'  // Rejected by AI filtering
  | 'approved'      // Approved by AI filtering
  | 'emailed'       // Included in email delivery
  | 'needs_review'  // Processing error, needs manual review
  | 'pending'       // User status: waiting for action
  | 'applied'       // User status: application submitted
  | 'interview'     // User status: interview scheduled
  | 'rejected'      // User status: rejected by company
  | 'offer'         // User status: received offer

// AI rating types from initial filtering
export type AIRating = 'REJECT' | 'MAYBE' | 'APPROVE'

// Enhanced Job interface with algorithm fields
export interface Job {
  id: string
  user_id?: string
  title: string
  company: string
  location?: string
  salary_range?: string
  job_url?: string
  description?: string
  requirements?: string
  ai_rating?: number // 1-10 scale
  ai_notes?: string
  status: JobStatus
  source?: string
  date_posted?: string
  date_processed?: string
  created_at: string
  updated_at: string
  
  // Algorithm-specific fields
  unique_id: string              // RSS GUID or generated hash
  rating?: AIRating              // AI filtering result
  reasoning?: string             // AI reasoning for rating
  top_matches?: string[]         // Top reasons for approval
  detailed_analysis?: DetailedAnalysis // Advanced AI analysis
  emailed: boolean               // Included in email delivery
  processing_error?: string      // Error during processing
  published_date?: string        // Original job posting date
}

// Detailed AI analysis structure
export interface DetailedAnalysis {
  why_worth_reviewing?: string   // Opportunities and benefits
  technical_challenges?: string  // Main technical challenges
  career_growth?: string         // Career advancement potential
  company_assessment?: string    // Company evaluation
  potential_concerns?: string    // Red flags or concerns
  application_recommendations?: string // How to approach application
}

// User preferences for job filtering
export interface UserPreferences {
  id: string
  user_id?: string
  preferred_locations: string[]  // Geographic preferences
  work_mode: string[]           // remote, hybrid, onsite
  travel_willingness: string    // limited, moderate, extensive
  salary_range: string          // e.g., "40000-80000"
  career_level: string[]        // junior, mid, senior
  tech_stack: string[]          // Technology preferences
  company_size: string[]        // startup, medium, large
  created_at: string
  updated_at: string
}

// RSS feed configuration
export interface RSSFeed {
  id: string
  url: string
  name: string
  active: boolean
  last_processed?: string
  processing_error?: string
  created_at: string
  updated_at: string
}

// Daily processing statistics
export interface ProcessingStats {
  id: string
  run_date: string              // Date of processing run
  total_jobs_processed: number  // Total jobs processed
  jobs_approved: number         // Jobs approved by AI
  jobs_filtered: number         // Jobs filtered out
  jobs_emailed: number          // Jobs included in email
  processing_time_seconds?: number // Time taken to process
  errors_count: number          // Number of errors encountered
  created_at: string
}

// AI prompt templates
export interface AIPromptData {
  job: Job
  preferences: UserPreferences
  context?: string              // Additional context for AI
}

// RSS processing result
export interface RSSProcessingResult {
  success: boolean
  jobs_found: number
  jobs_new: number
  jobs_duplicate: number
  errors: string[]
}

// AI filtering result
export interface AIFilteringResult {
  job_id: string
  rating: AIRating
  reasoning: string
  top_matches?: string[]
  detailed_analysis?: DetailedAnalysis
  processing_time_ms: number
  error?: string
}

// Email delivery result
export interface EmailDeliveryResult {
  success: boolean
  jobs_included: number
  recipient: string
  subject: string
  sent_at: string
  error?: string
}

// Edge Function response types
export interface EdgeFunctionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Configuration for algorithm processing
export interface AlgorithmConfig {
  rss_feeds: string[]
  ai_config: {
    initial_model: string
    detailed_model: string
    temperature: number
    max_tokens: number
  }
  email_config: {
    recipient: string
    sender: string
    template: string
  }
  processing_limits: {
    max_jobs_per_run: number
    rate_limit_ms: number
    timeout_ms: number
  }
}

// Database table names for type safety
export const TABLE_NAMES = {
  JOBS: 'jobs',
  PREFERENCES: 'preferences',
  RSS_FEEDS: 'rss_feeds',
  PROCESSING_STATS: 'processing_stats'
} as const

// Status transitions for job workflow
export const STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  new: ['filtered_out', 'approved', 'needs_review'],
  filtered_out: ['needs_review'],
  approved: ['emailed', 'needs_review'],
  emailed: ['pending', 'applied'],
  needs_review: ['new', 'filtered_out', 'approved'],
  pending: ['applied', 'rejected'],
  applied: ['interview', 'rejected'],
  interview: ['offer', 'rejected'],
  rejected: [],
  offer: []
}

// Export utility types
export type JobCreate = Omit<Job, 'id' | 'created_at' | 'updated_at'>
export type JobUpdate = Partial<Omit<Job, 'id' | 'created_at'>>
export type PreferencesCreate = Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>
export type PreferencesUpdate = Partial<Omit<UserPreferences, 'id' | 'created_at'>> 