// Dashboard Data Hook
// Provides real-time dashboard data from the backend API

import { useQuery } from '@tanstack/react-query'

export interface DashboardData {
  upcoming_interviews: Array<{
    id: number
    job_id: number
    scheduled_date: string
    interview_type: string
    location?: string
    notes?: string
    outcome: string
    title: string
    company: string
  }>
  pending_follow_ups: Array<{
    id: number
    job_id: number
    action_type: string
    due_date: string
    completed: boolean
    notes?: string
    title: string
    company: string
  }>
  recent_events: Array<{
    id: number
    job_id: number
    event_type: string
    description: string
    created_at: string
    title: string
    company: string
  }>
  job_stats: {
    total: number
    by_status: Record<string, number>
    this_week: number
  }
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        return await response.json();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Return empty data structure on error
        return {
          upcoming_interviews: [],
          pending_follow_ups: [],
          recent_events: [],
          job_stats: {
            total: 0,
            by_status: {},
            this_week: 0
          }
        };
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Consider data stale after 15 seconds
  })
}

export function useDashboardStats() {
  const { data } = useDashboardData()
  
  if (!data) {
    return {
      totalJobs: 0,
      approvedJobs: 0,
      filteredJobs: 0,
      thisWeekJobs: 0,
      approvalRate: 0,
      upcomingInterviews: 0,
      pendingFollowUps: 0,
      recentActivity: 0
    }
  }

  const totalJobs = data.job_stats.total
  const approvedJobs = data.job_stats.by_status.approved || 0
  const filteredJobs = data.job_stats.by_status.filtered_out || 0
  const thisWeekJobs = data.job_stats.this_week
  const approvalRate = totalJobs > 0 ? Math.round((approvedJobs / totalJobs) * 100) : 0
  const upcomingInterviews = data.upcoming_interviews.length
  const pendingFollowUps = data.pending_follow_ups.length
  const recentActivity = data.recent_events.length

  return {
    totalJobs,
    approvedJobs,
    filteredJobs,
    thisWeekJobs,
    approvalRate,
    upcomingInterviews,
    pendingFollowUps,
    recentActivity
  }
} 