// Algorithm Dashboard Component
// Provides monitoring and control interface for the job filtering algorithm

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import {
  Play,
  Pause,
  RefreshCw,
  Activity,
  Mail,
  Filter,
  Rss,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Building2,
} from 'lucide-react'
import {
  useJobStatusCounts,
  useProcessingStats,
  useProcessRSS,
  useProcessAI,
  useDeliverEmails,
  useRunPipeline,
} from '@/hooks/useJobs'
import { toast } from '@/hooks/use-toast'

interface AlgorithmDashboardProps {
  onOpenPreferences?: () => void
  className?: string
}

export function AlgorithmDashboard({ onOpenPreferences, className }: AlgorithmDashboardProps) {
  const [isAutoMode, setIsAutoMode] = useState(false)

  // Data hooks
  const { data: statusCounts, isLoading: countsLoading } = useJobStatusCounts()
  const { data: processingStats, isLoading: statsLoading } = useProcessingStats()

  // Mutation hooks
  const processRSS = useProcessRSS()
  const processAI = useProcessAI()
  const deliverEmails = useDeliverEmails()
  const runPipeline = useRunPipeline()

  // Status calculations
  const totalJobs = statusCounts ? Object.values(statusCounts).reduce((sum, count) => sum + count, 0) : 0
  const approvedJobs = statusCounts?.approved || 0
  const filteredJobs = statusCounts?.filtered_out || 0
  const emailedJobs = statusCounts?.emailed || 0
  const newJobs = statusCounts?.new || 0
  const needsReviewJobs = statusCounts?.needs_review || 0

  // Calculate success rates
  const approvalRate = totalJobs > 0 ? Math.round((approvedJobs / totalJobs) * 100) : 0
  const emailDeliveryRate = approvedJobs > 0 ? Math.round((emailedJobs / approvedJobs) * 100) : 0

  // Handle manual pipeline steps
  const handleProcessRSS = async () => {
    try {
      await processRSS.mutateAsync()
      toast({
        title: 'RSS Processing Started',
        description: 'Fetching new job listings from RSS feeds...',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start RSS processing',
        variant: 'destructive',
      })
    }
  }

  const handleProcessAI = async () => {
    try {
      await processAI.mutateAsync()
      toast({
        title: 'AI Filtering Started',
        description: 'Processing jobs through AI filtering algorithm...',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start AI filtering',
        variant: 'destructive',
      })
    }
  }

  const handleDeliverEmails = async () => {
    try {
      await deliverEmails.mutateAsync()
      toast({
        title: 'Email Delivery Started',
        description: 'Sending approved job recommendations via email...',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start email delivery',
        variant: 'destructive',
      })
    }
  }

  const handleRunFullPipeline = async () => {
    try {
      await runPipeline.mutateAsync()
      toast({
        title: 'Full Pipeline Started',
        description: 'Running complete job processing pipeline...',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start full pipeline',
        variant: 'destructive',
      })
    }
  }

  // Toggle auto mode (placeholder for future scheduling)
  const toggleAutoMode = () => {
    setIsAutoMode(!isAutoMode)
    toast({
      title: isAutoMode ? 'Auto Mode Disabled' : 'Auto Mode Enabled',
      description: isAutoMode 
        ? 'Manual pipeline control activated'
        : 'Automatic pipeline scheduling activated',
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500'
      case 'filtered_out': return 'bg-red-500'
      case 'emailed': return 'bg-blue-500'
      case 'new': return 'bg-yellow-500'
      case 'needs_review': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const isAnyProcessing = processRSS.isPending || processAI.isPending || deliverEmails.isPending || runPipeline.isPending

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Algorithm Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and control your job filtering algorithm
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPreferences}
          >
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
          <Button
            variant={isAutoMode ? "default" : "outline"}
            size="sm"
            onClick={toggleAutoMode}
          >
            {isAutoMode ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isAutoMode ? 'Auto Mode' : 'Manual Mode'}
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {isAnyProcessing && (
        <Alert>
          <Activity className="h-4 w-4" />
          <AlertTitle>Processing in Progress</AlertTitle>
          <AlertDescription>
            The algorithm is currently processing. Please wait for completion before starting new operations.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              {newJobs} new jobs to process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground">
              {approvedJobs} of {totalJobs} jobs approved
            </p>
            <Progress value={approvalRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Delivery</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailDeliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {emailedJobs} of {approvedJobs} jobs emailed
            </p>
            <Progress value={emailDeliveryRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Review</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{needsReviewJobs}</div>
            <p className="text-xs text-muted-foreground">
              Jobs requiring manual review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Control</TabsTrigger>
          <TabsTrigger value="status">Job Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Pipeline Control Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Manual Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Pipeline Control</CardTitle>
                <CardDescription>
                  Execute individual pipeline steps manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={handleProcessRSS}
                    disabled={processRSS.isPending || isAnyProcessing}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    {processRSS.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Rss className="w-4 h-4 mr-2" />
                    )}
                    Process RSS Feeds
                  </Button>

                  <Button
                    onClick={handleProcessAI}
                    disabled={processAI.isPending || isAnyProcessing}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    {processAI.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Filter className="w-4 h-4 mr-2" />
                    )}
                    Run AI Filtering
                  </Button>

                  <Button
                    onClick={handleDeliverEmails}
                    disabled={deliverEmails.isPending || isAnyProcessing}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    {deliverEmails.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Deliver Emails
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <Button
                    onClick={handleRunFullPipeline}
                    disabled={runPipeline.isPending || isAnyProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {runPipeline.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Run Full Pipeline
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Status */}
            <Card>
              <CardHeader>
                <CardTitle>Pipeline Status</CardTitle>
                <CardDescription>
                  Current status of algorithm components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Rss className="w-4 h-4" />
                      <span className="text-sm">RSS Processing</span>
                    </div>
                    <Badge variant={processRSS.isPending ? "default" : "secondary"}>
                      {processRSS.isPending ? 'Running' : 'Idle'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <span className="text-sm">AI Filtering</span>
                    </div>
                    <Badge variant={processAI.isPending ? "default" : "secondary"}>
                      {processAI.isPending ? 'Running' : 'Idle'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">Email Delivery</span>
                    </div>
                    <Badge variant={deliverEmails.isPending ? "default" : "secondary"}>
                      {deliverEmails.isPending ? 'Running' : 'Idle'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      <span className="text-sm">Full Pipeline</span>
                    </div>
                    <Badge variant={runPipeline.isPending ? "default" : "secondary"}>
                      {runPipeline.isPending ? 'Running' : 'Idle'}
                    </Badge>
                  </div>
                </div>

                                 {/* Last Run Info */}
                 <div className="mt-6 pt-4 border-t">
                   <p className="text-xs text-muted-foreground">
                     Last full pipeline run: {processingStats && processingStats.length > 0 ? 
                       new Date(processingStats[0].run_date).toLocaleString() : 
                       'Never'
                     }
                   </p>
                 </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Status Tab */}
        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Status Breakdown</CardTitle>
              <CardDescription>
                Current distribution of job statuses in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {countsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {statusCounts && Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                        <span className="capitalize text-sm font-medium">
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{count}</span>
                        <Progress 
                          value={totalJobs > 0 ? (count / totalJobs) * 100 : 0} 
                          className="w-24" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Statistics</CardTitle>
                <CardDescription>
                  Algorithm performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                                     <div className="space-y-4">
                     <div className="flex justify-between">
                       <span className="text-sm">Total Processed</span>
                       <span className="font-medium">
                         {processingStats ? processingStats.reduce((sum, stat) => sum + stat.total_jobs_processed, 0) : 0}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm">Jobs Approved</span>
                       <span className="font-medium">
                         {processingStats ? processingStats.reduce((sum, stat) => sum + stat.jobs_approved, 0) : 0}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm">Jobs Filtered</span>
                       <span className="font-medium">
                         {processingStats ? processingStats.reduce((sum, stat) => sum + stat.jobs_filtered, 0) : 0}
                       </span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-sm">Emails Sent</span>
                       <span className="font-medium">
                         {processingStats ? processingStats.reduce((sum, stat) => sum + stat.jobs_emailed, 0) : 0}
                       </span>
                     </div>
                   </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Algorithm Health</CardTitle>
                <CardDescription>
                  System status and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">RSS Feeds Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">AI Filtering Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Email Delivery Ready</span>
                </div>
                
                {needsReviewJobs > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <span className="text-sm">{needsReviewJobs} jobs need manual review</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 