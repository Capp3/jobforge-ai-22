// React Query hooks for job operations
// Provides hooks for job data fetching and mutations with caching and real-time updates

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { JobService } from '@/services/jobService'
import { Job, JobStatus, JobCreate, JobUpdate } from '@/types/algorithm'

// Query keys for React Query
export const jobQueryKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...jobQueryKeys.lists(), filters] as const,
  details: () => [...jobQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobQueryKeys.details(), id] as const,
  stats: () => [...jobQueryKeys.all, 'stats'] as const,
  pipeline: () => [...jobQueryKeys.all, 'pipeline'] as const,
}

// Get all jobs with optional filtering
export function useJobs(options?: {
  status?: JobStatus[]
  limit?: number
  search?: string
}) {
  return useQuery({
    queryKey: jobQueryKeys.list(options || {}),
    queryFn: () => JobService.getJobs(options),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

// Get approved jobs (main view)
export function useApprovedJobs() {
  return useQuery({
    queryKey: jobQueryKeys.list({ status: ['approved', 'emailed'] }),
    queryFn: () => JobService.getApprovedJobs(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true, // Refresh when user returns to tab
  })
}

// Get jobs by specific status
export function useJobsByStatus(status: JobStatus) {
  return useQuery({
    queryKey: jobQueryKeys.list({ status: [status] }),
    queryFn: () => JobService.getJobsByStatus(status),
    staleTime: 5 * 60 * 1000,
    enabled: !!status, // Only run query if status is provided
  })
}

// Get a single job by ID
export function useJob(id: string) {
  return useQuery({
    queryKey: jobQueryKeys.detail(id),
    queryFn: () => JobService.getJob(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id, // Only run query if ID is provided
  })
}

// Get job status counts for dashboard
export function useJobStatusCounts() {
  return useQuery({
    queryKey: jobQueryKeys.stats(),
    queryFn: () => JobService.getJobStatusCounts(),
    staleTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  })
}

// Get processing statistics
export function useProcessingStats(days = 7) {
  return useQuery({
    queryKey: [...jobQueryKeys.stats(), 'processing', days],
    queryFn: () => JobService.getProcessingStats(days),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

// Infinite query for paginated jobs
export function useInfiniteJobs(options?: {
  status?: JobStatus[]
  search?: string
  limit?: number
}) {
  const limit = options?.limit || 20

  return useInfiniteQuery({
    queryKey: [...jobQueryKeys.lists(), 'infinite', options || {}],
    queryFn: ({ pageParam = 0 }) => 
      JobService.getJobs({
        ...options,
        limit,
        offset: pageParam * limit
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length : undefined
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Mutations for job operations

// Create a new job
export function useCreateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (job: JobCreate) => JobService.createJob(job),
    onSuccess: (newJob) => {
      // Add the new job to the cache
      queryClient.setQueryData(
        jobQueryKeys.list({}),
        (old: Job[] | undefined) => old ? [newJob, ...old] : [newJob]
      )
      
      // Invalidate job lists to refresh counts
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() })
    },
    onError: (error) => {
      console.error('Failed to create job:', error)
    }
  })
}

// Update a job
export function useUpdateJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: JobUpdate }) => 
      JobService.updateJob(id, updates),
    onSuccess: (updatedJob) => {
      // Update job in all relevant queries
      queryClient.setQueryData(
        jobQueryKeys.detail(updatedJob.id),
        updatedJob
      )

      // Update job in lists
      queryClient.setQueriesData(
        { queryKey: jobQueryKeys.lists() },
        (old: Job[] | undefined) => {
          if (!old) return [updatedJob]
          return old.map(job => job.id === updatedJob.id ? updatedJob : job)
        }
      )

      // Invalidate stats to refresh counts
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() })
    },
    onError: (error) => {
      console.error('Failed to update job:', error)
    }
  })
}

// Delete a job
export function useDeleteJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => JobService.deleteJob(id),
    onSuccess: (_, deletedId) => {
      // Remove job from all lists
      queryClient.setQueriesData(
        { queryKey: jobQueryKeys.lists() },
        (old: Job[] | undefined) => {
          if (!old) return []
          return old.filter(job => job.id !== deletedId)
        }
      )

      // Remove job detail from cache
      queryClient.removeQueries({ queryKey: jobQueryKeys.detail(deletedId) })

      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() })
    },
    onError: (error) => {
      console.error('Failed to delete job:', error)
    }
  })
}

// Update job status (with optimistic updates)
export function useUpdateJobStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: JobStatus; notes?: string }) => 
      JobService.updateJobStatus(id, status, notes),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: jobQueryKeys.detail(id) })

      // Snapshot the previous value
      const previousJob = queryClient.getQueryData(jobQueryKeys.detail(id))

      // Optimistically update the job status
      queryClient.setQueryData(jobQueryKeys.detail(id), (old: Job | undefined) => {
        if (!old) return old
        return { ...old, status, updated_at: new Date().toISOString() }
      })

      // Return a context object with the snapshotted value
      return { previousJob }
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJob) {
        queryClient.setQueryData(jobQueryKeys.detail(id), context.previousJob)
      }
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() })
    }
  })
}

// Mark job as applied
export function useMarkJobAsApplied() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => 
      JobService.markAsApplied(id, notes),
    onSuccess: (updatedJob) => {
      // Update caches similar to updateJobStatus
      queryClient.setQueryData(jobQueryKeys.detail(updatedJob.id), updatedJob)
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() })
    },
    onError: (error) => {
      console.error('Failed to mark job as applied:', error)
    }
  })
}

// Mark job as rejected
export function useMarkJobAsRejected() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      JobService.markAsRejected(id, reason),
    onSuccess: (updatedJob) => {
      // Update caches similar to updateJobStatus
      queryClient.setQueryData(jobQueryKeys.detail(updatedJob.id), updatedJob)
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() })
    },
    onError: (error) => {
      console.error('Failed to mark job as rejected:', error)
    }
  })
}

// Algorithm pipeline operations

// Trigger RSS processing
export function useProcessRSS() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => JobService.triggerRSSProcessing(),
    onSuccess: () => {
      // Invalidate all job queries to show new jobs
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
    },
    onError: (error) => {
      console.error('RSS processing failed:', error)
    }
  })
}

// Trigger AI filtering
export function useProcessAI() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => JobService.triggerAIFiltering(),
    onSuccess: () => {
      // Invalidate job queries to show updated statuses
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
    },
    onError: (error) => {
      console.error('AI processing failed:', error)
    }
  })
}

// Trigger email delivery
export function useDeliverEmails() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => JobService.triggerEmailDelivery(),
    onSuccess: () => {
      // Invalidate job queries to show updated email status
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
    },
    onError: (error) => {
      console.error('Email delivery failed:', error)
    }
  })
}

// Run full algorithm pipeline
export function useRunPipeline() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => JobService.runFullPipeline(),
    onSuccess: () => {
      // Invalidate all job data after pipeline completion
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.all })
    },
    onError: (error) => {
      console.error('Pipeline execution failed:', error)
    }
  })
}

// Real-time updates hook
export function useJobsRealtime() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = JobService.subscribeToJobUpdates((updatedJob) => {
      // Update the specific job in cache
      queryClient.setQueryData(
        jobQueryKeys.detail(updatedJob.id),
        updatedJob
      )

      // Update job in all relevant lists
      queryClient.setQueriesData(
        { queryKey: jobQueryKeys.lists() },
        (old: Job[] | undefined) => {
          if (!old) return [updatedJob]
          
          const existingIndex = old.findIndex(job => job.id === updatedJob.id)
          if (existingIndex >= 0) {
            // Update existing job
            const newJobs = [...old]
            newJobs[existingIndex] = updatedJob
            return newJobs
          } else {
            // Add new job
            return [updatedJob, ...old]
          }
        }
      )

      // Invalidate stats to refresh counts
      queryClient.invalidateQueries({ queryKey: jobQueryKeys.stats() })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient])
} 