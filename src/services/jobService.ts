// Job Service
// Handles all job-related API operations using SQLite backend

import { apiClient } from './apiClient'
import { 
  Job, 
  JobCreate, 
  JobUpdate, 
  JobStatus, 
  ProcessingStats,
  RSSProcessingResult,
  AIFilteringResult,
  EmailDeliveryResult 
} from '@/types/algorithm'

export class JobService {
  
  // Get all jobs with optional filtering
  static async getJobs(options?: {
    status?: JobStatus[]
    limit?: number
    offset?: number
    search?: string
  }) {
    try {
      const data = await apiClient.getJobs(options)
      return data as Job[]
    } catch (error) {
      throw new Error(`Failed to fetch jobs: ${error.message}`)
    }
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
    try {
      const data = await apiClient.getJob(id)
      return data as Job
    } catch (error) {
      throw new Error(`Failed to fetch job: ${error.message}`)
    }
  }

  // Create a new job (manual entry)
  static async createJob(job: JobCreate) {
    try {
      const jobData = {
        ...job,
        status: job.status || 'pending',
        emailed: job.emailed || false,
        unique_id: job.unique_id || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      const data = await apiClient.createJob(jobData)
      return data as Job
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`)
    }
  }

  // Update a job (user actions like apply, reject, etc.)
  static async updateJob(id: string, updates: JobUpdate) {
    try {
      const data = await apiClient.updateJob(id, updates)
      return data as Job
    } catch (error) {
      throw new Error(`Failed to update job: ${error.message}`)
    }
  }

  // Delete a job
  static async deleteJob(id: string) {
    try {
      await apiClient.deleteJob(id)
      return true
    } catch (error) {
      throw new Error(`Failed to delete job: ${error.message}`)
    }
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
    // TODO: Implement processing stats API endpoint
    // For now, return empty array
    return []
  }

  // Get job counts by status
  static async getJobStatusCounts() {
    try {
      const data = await apiClient.getJobStatusCounts()
      return data as Record<JobStatus, number>
    } catch (error) {
      throw new Error(`Failed to fetch job status counts: ${error.message}`)
    }
  }

  // Subscribe to real-time job updates (simplified for SQLite)
  static subscribeToJobUpdates(callback: (job: Job) => void) {
    // For SQLite, we'll use polling instead of real-time subscriptions
    // This is simpler and sufficient for a local application
    const interval = setInterval(async () => {
      try {
        // This is a simple implementation - you could enhance it to only fetch new/updated jobs
        // For now, we'll just trigger a callback to refresh the data
      } catch (error) {
        console.error('Error in job update polling:', error)
      }
    }, 5000) // Poll every 5 seconds

    return {
      unsubscribe: () => clearInterval(interval)
    }
  }

  // Trigger algorithm processing (placeholder for future implementation)
  static async triggerRSSProcessing(): Promise<RSSProcessingResult> {
    // TODO: Implement RSS processing logic
    // For now, return a mock result
    return {
      success: true,
      jobs_found: 0,
      jobs_new: 0,
      jobs_duplicate: 0,
      errors: []
    }
  }

  static async triggerAIFiltering(): Promise<AIFilteringResult[]> {
    // TODO: Implement AI filtering logic  
    // For now, return empty array
    return []
  }

  static async triggerEmailDelivery(): Promise<EmailDeliveryResult> {
    // TODO: Implement email delivery logic
    // For now, return a mock result
    return {
      success: true,
      jobs_included: 0,
      recipient: '',
      subject: '',
      sent_at: new Date().toISOString()
    }
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