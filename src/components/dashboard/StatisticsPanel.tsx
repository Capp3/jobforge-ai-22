// StatisticsPanel Component
// Displays comprehensive job statistics and insights with data visualization

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
  Building2,
  Briefcase,
  Star,
  Activity
} from 'lucide-react'
import { useDashboardData, useDashboardStats } from '@/hooks/useDashboardData'
import { useJobStatusCounts } from '@/hooks/useJobs'

interface StatisticsPanelProps {
  className?: string
}

export function StatisticsPanel({ className }: StatisticsPanelProps) {
  const { data: dashboardData, isLoading } = useDashboardData()
  const stats = useDashboardStats()
  const { data: statusCounts } = useJobStatusCounts()

  const calculateTrends = () => {
    if (!dashboardData) return { weeklyGrowth: 0, approvalTrend: 0, activityTrend: 0 }
    
    const thisWeek = stats.thisWeekJobs
    const totalJobs = stats.totalJobs
    const weeklyGrowth = totalJobs > 0 ? Math.round((thisWeek / totalJobs) * 100) : 0
    
    return {
      weeklyGrowth,
      approvalTrend: stats.approvalRate,
      activityTrend: stats.recentActivity
    }
  }

  const trends = calculateTrends()

  const getStatusBreakdown = () => {
    if (!statusCounts) return []
    
    const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: getStatusColor(status)
    }))
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-500',
      approved: 'bg-green-500',
      filtered_out: 'bg-red-500',
      emailed: 'bg-purple-500',
      applied: 'bg-blue-600',
      interview: 'bg-orange-500',
      rejected: 'bg-gray-500',
      offer: 'bg-green-600',
      needs_review: 'bg-amber-500'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-400'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      new: 'New',
      approved: 'Approved',
      filtered_out: 'Filtered Out',
      emailed: 'Emailed',
      applied: 'Applied',
      interview: 'Interview',
      rejected: 'Rejected',
      offer: 'Offer',
      needs_review: 'Needs Review'
    }
    return labels[status as keyof typeof labels] || status
  }

  const statusBreakdown = getStatusBreakdown()

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-muted-foreground">Loading statistics...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{stats.thisWeekJobs} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvalRate}%</div>
            <Progress value={stats.approvalRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pipeline</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingInterviews + stats.pendingFollowUps}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingInterviews} interviews, {stats.pendingFollowUps} follow-ups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisWeekJobs}</div>
            <p className="text-xs text-muted-foreground">
              {trends.weeklyGrowth}% of total pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Job Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Job Status Breakdown
          </CardTitle>
          <CardDescription>
            Distribution of jobs across different stages of the pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusBreakdown.length > 0 ? (
              statusBreakdown.map(({ status, count, percentage, color }) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm font-medium">{getStatusLabel(status)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count} jobs</span>
                      <Badge variant="outline" className="text-xs">
                        {percentage}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No job data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Application Success
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Jobs Approved</span>
                <span>{stats.approvedJobs}</span>
              </div>
              <Progress value={stats.approvalRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stats.approvalRate}% of total jobs processed
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Conversion Rate</span>
                <span>{Math.round((stats.approvedJobs / Math.max(stats.totalJobs, 1)) * 100)}%</span>
              </div>
              <Progress value={Math.round((stats.approvedJobs / Math.max(stats.totalJobs, 1)) * 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activity Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Recent Events</span>
              <Badge variant="outline">{stats.recentActivity}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Upcoming Interviews</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                {stats.upcomingInterviews}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Pending Actions</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                {stats.pendingFollowUps}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.approvalRate > 80 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Excellent Approval Rate</p>
                  <p className="text-xs text-green-800">
                    Your {stats.approvalRate}% approval rate is outstanding! Keep up the great work.
                  </p>
                </div>
              </div>
            )}
            
            {stats.approvalRate < 30 && stats.totalJobs > 10 && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Low Approval Rate</p>
                  <p className="text-xs text-amber-800">
                    Consider refining your job search criteria or LLM settings to improve match quality.
                  </p>
                </div>
              </div>
            )}
            
            {stats.upcomingInterviews > 0 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Upcoming Interviews</p>
                  <p className="text-xs text-blue-800">
                    You have {stats.upcomingInterviews} interview{stats.upcomingInterviews > 1 ? 's' : ''} scheduled. Good luck!
                  </p>
                </div>
              </div>
            )}
            
            {stats.pendingFollowUps > 0 && (
              <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900">Action Required</p>
                  <p className="text-xs text-purple-800">
                    You have {stats.pendingFollowUps} follow-up action{stats.pendingFollowUps > 1 ? 's' : ''} that need attention.
                  </p>
                </div>
              </div>
            )}

            {stats.totalJobs === 0 && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <Building2 className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Getting Started</p>
                  <p className="text-xs text-gray-800">
                    No jobs in your pipeline yet. Start by running the job search automation or adding jobs manually.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}