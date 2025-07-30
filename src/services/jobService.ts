// Job Service
// Handles all job-related API operations for the algorithm implementation

import { supabase } from '@/integrations/supabase/client'
import { 
  Job, 
  JobCreate, 
  JobUpdate, 
  JobStatus, 
  ProcessingStats,
  RSSProcessingResult,
  AIFilteringResult,
  EmailDeliveryResult,
  TABLE_NAMES 
} from '@/types/algorithm'

export class JobService {
  
  // Get all jobs with optional filtering
  static async getJobs(options?: {
    status?: JobStatus[]
    limit?: number
    offset?: number
    search?: string
  }) {
    let query = supabase
      .from(TABLE_NAMES.JOBS)
      .select('*')
      .order('created_at', { ascending: false })

    // Apply status filter
    if (options?.status && options.status.length > 0) {
      query = query.in('status', options.status)
    }

    // Apply search filter
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,company.ilike.%${options.search}%`)
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`)
    }

    return data as Job[]
  }

  // Get approved jobs (main user view)
  static async getApprovedJobs() {
    return this.getJobs({ status: ['approved', 'emailed'] })
  }

  // Get jobs by status for filtering
  static async getJobsByStatus(status: JobStatus) {
    return this.getJobs({ status: [status] })
  }

  // Get a single job by ID
  static async getJob(id: string) {
    const { data, error } = await supabase
      .from(TABLE_NAMES.JOBS)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch job: ${error.message}`)
    }

    return data as Job
  }

  // Create a new job (manual entry)
  static async createJob(job: JobCreate) {
    const insertData = {
      ...job,
      status: 'pending', // Manual entries start as pending
      emailed: false,
      unique_id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      // Cast complex types to Json for Supabase
      detailed_analysis: job.detailed_analysis ? JSON.parse(JSON.stringify(job.detailed_analysis)) : null,
      top_matches: job.top_matches ? JSON.parse(JSON.stringify(job.top_matches)) : null
    }

    const { data, error } = await supabase
      .from(TABLE_NAMES.JOBS)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`)
    }

    return data as Job
  }

  // Update a job (user actions like apply, reject, etc.)
  static async updateJob(id: string, updates: JobUpdate) {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
      // Cast complex types to Json for Supabase
      detailed_analysis: updates.detailed_analysis ? JSON.parse(JSON.stringify(updates.detailed_analysis)) : undefined,
      top_matches: updates.top_matches ? JSON.parse(JSON.stringify(updates.top_matches)) : undefined
    }

    const { data, error } = await supabase
      .from(TABLE_NAMES.JOBS)
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`)
    }

    return data as Job
  }

  // Delete a job
  static async deleteJob(id: string) {
    const { error } = await supabase
      .from(TABLE_NAMES.JOBS)
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete job: ${error.message}`)
    }

    return true
  }

  // Update job status (user workflow actions)
  static async updateJobStatus(id: string, status: JobStatus, notes?: string) {
    const updates: JobUpdate = { 
      status,
      updated_at: new Date().toISOString()
    }

    // Add notes to ai_notes if provided
    if (notes) {
      updates.ai_notes = notes
    }

    return this.updateJob(id, updates)
  }

  // Mark job as applied
  static async markAsApplied(id: string, applicationNotes?: string) {
    return this.updateJobStatus(id, 'applied', applicationNotes)
  }

  // Mark job as rejected by user
  static async markAsRejected(id: string, rejectionReason?: string) {
    return this.updateJobStatus(id, 'rejected', rejectionReason)
  }

  // Get processing statistics
  static async getProcessingStats(days = 7): Promise<ProcessingStats[]> {
    const { data, error } = await supabase
      .from('processing_stats')
      .select('*')
      .order('run_date', { ascending: false })
      .limit(days)

    if (error) {
      throw new Error(`Failed to fetch processing stats: ${error.message}`)
    }

    return data as ProcessingStats[]
  }

  // Get job counts by status
  static async getJobStatusCounts() {
    const { data, error } = await supabase
      .from(TABLE_NAMES.JOBS)
      .select('status')

    if (error) {
      throw new Error(`Failed to fetch job status counts: ${error.message}`)
    }

    // Count jobs by status
    const counts = data.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1
      return acc
    }, {} as Record<JobStatus, number>)

    return counts
  }

  // Subscribe to real-time job updates
  static subscribeToJobUpdates(callback: (job: Job) => void) {
    const subscription = supabase
      .channel('jobs-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: TABLE_NAMES.JOBS 
        }, 
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            callback(payload.new as Job)
          }
        })
      .subscribe()

    return subscription
  }

  // Trigger algorithm processing (calls Edge Functions)
  static async triggerRSSProcessing(): Promise<RSSProcessingResult> {
    const { data, error } = await supabase.functions.invoke('process-rss', {
      method: 'POST'
    })

    if (error) {
      throw new Error(`RSS processing failed: ${error.message}`)
    }

    return data as RSSProcessingResult
  }

  static async triggerAIFiltering(): Promise<AIFilteringResult[]> {
    const { data, error } = await supabase.functions.invoke('ai-filtering', {
      method: 'POST'
    })

    if (error) {
      throw new Error(`AI filtering failed: ${error.message}`)
    }

    return data as AIFilteringResult[]
  }

  static async triggerEmailDelivery(): Promise<EmailDeliveryResult> {
    const { data, error } = await supabase.functions.invoke('email-delivery', {
      method: 'POST'
    })

    if (error) {
      throw new Error(`Email delivery failed: ${error.message}`)
    }

    return data as EmailDeliveryResult
  }

  // Run full algorithm pipeline
  static async runFullPipeline() {
    try {
      // Step 1: Process RSS feeds
      const rssResult = await this.triggerRSSProcessing()
      
      // Step 2: AI filtering (only if new jobs found)
      let aiResult = null
      if (rssResult.jobs_new > 0) {
        aiResult = await this.triggerAIFiltering()
      }

      // Step 3: Email delivery (only if jobs approved)
      let emailResult = null
      if (aiResult && Array.isArray(aiResult) && aiResult.length > 0) {
        emailResult = await this.triggerEmailDelivery()
      }

      return {
        rss: rssResult,
        ai: aiResult,
        email: emailResult,
        success: true,
        message: `Pipeline complete: ${rssResult.jobs_new} new jobs processed`
      }

    } catch (error) {
      throw new Error(`Pipeline execution failed: ${error.message}`)
    }
  }
} 