// JobsList Component
// Displays filtered and searchable job listings with real-time updates

import React, { useState, useMemo } from 'react'
import { JobCard } from './JobCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { 
  Search, 
  Filter, 
  RefreshCw,
  Play,
  Mail,
  Download,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grid,
  List
} from 'lucide-react'
import { JobDetailView } from '@/components/dashboard'
import { Job, JobStatus } from '@/types/algorithm'
import { 
  useApprovedJobs,
  useJobsByStatus,
  useJobStatusCounts,
  useJobsRealtime,
  useProcessRSS,
  useProcessAI,
  useDeliverEmails,
  useRunPipeline
} from '@/hooks/useJobs'

interface JobsListProps {
  defaultView?: 'approved' | 'all' | JobStatus
  showControls?: boolean
  showDetailView?: boolean
}

export function JobsList({ defaultView = 'approved', showControls = true, showDetailView = true }: JobsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all' | 'approved'>(defaultView)
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'company' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobDetail, setShowJobDetail] = useState(false)

  // Real-time updates
  useJobsRealtime()

  // Queries
  const approvedJobs = useApprovedJobs()
  const statusCounts = useJobStatusCounts()
  const newJobs = useJobsByStatus('new')
  const filteredJobs = useJobsByStatus('filtered_out')
  const emailedJobs = useJobsByStatus('emailed')
  const appliedJobs = useJobsByStatus('applied')
  const needsReviewJobs = useJobsByStatus('needs_review')

  // Mutations for algorithm control
  const processRSS = useProcessRSS()
  const processAI = useProcessAI()
  const deliverEmails = useDeliverEmails()
  const runPipeline = useRunPipeline()

  // Get current jobs based on selected status
  const getCurrentJobs = (): Job[] => {
    switch (selectedStatus) {
      case 'approved':
        return approvedJobs.data || []
      case 'new':
        return newJobs.data || []
      case 'filtered_out':
        return filteredJobs.data || []
      case 'emailed':
        return emailedJobs.data || []
      case 'applied':
        return appliedJobs.data || []
      case 'needs_review':
        return needsReviewJobs.data || []
      case 'all':
        // Combine all jobs (would need a separate query in real implementation)
        return [
          ...(approvedJobs.data || []),
          ...(newJobs.data || []),
          ...(filteredJobs.data || [])
        ]
      default:
        return approvedJobs.data || []
    }
  }

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    // Get current jobs based on selected status
    let jobs: Job[] = []
    switch (selectedStatus) {
      case 'approved':
        jobs = approvedJobs.data || []
        break
      case 'new':
        jobs = newJobs.data || []
        break
      case 'filtered_out':
        jobs = filteredJobs.data || []
        break
      case 'emailed':
        jobs = emailedJobs.data || []
        break
      case 'applied':
        jobs = appliedJobs.data || []
        break
      case 'needs_review':
        jobs = needsReviewJobs.data || []
        break
      case 'all':
        // Combine all jobs (would need a separate query in real implementation)
        jobs = [
          ...(approvedJobs.data || []),
          ...(newJobs.data || []),
          ...(filteredJobs.data || [])
        ]
        break
      default:
        jobs = approvedJobs.data || []
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term)
      )
    }

    // Sort jobs
    jobs.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'rating': {
          // Sort by AI rating (APPROVE > MAYBE > REJECT)
          const ratingOrder = { 'APPROVE': 3, 'MAYBE': 2, 'REJECT': 1 }
          const aRating = ratingOrder[a.rating as keyof typeof ratingOrder] || 0
          const bRating = ratingOrder[b.rating as keyof typeof ratingOrder] || 0
          return bRating - aRating
        }
        case 'company':
          return a.company.localeCompare(b.company)
        default:
          return 0
      }
    })

    return jobs
  }, [
    selectedStatus,
    approvedJobs.data,
    newJobs.data,
    filteredJobs.data,
    emailedJobs.data,
    appliedJobs.data,
    needsReviewJobs.data,
    searchTerm,
    sortBy
  ])

  // Get loading state
  const isLoading = useMemo(() => {
    switch (selectedStatus) {
      case 'approved':
        return approvedJobs.isLoading
      case 'new':
        return newJobs.isLoading
      case 'filtered_out':
        return filteredJobs.isLoading
      case 'emailed':
        return emailedJobs.isLoading
      case 'applied':
        return appliedJobs.isLoading
      case 'needs_review':
        return needsReviewJobs.isLoading
      default:
        return approvedJobs.isLoading
    }
  }, [selectedStatus, approvedJobs.isLoading, newJobs.isLoading, filteredJobs.isLoading, emailedJobs.isLoading, appliedJobs.isLoading, needsReviewJobs.isLoading])

  // Handle algorithm actions
  const handleProcessRSS = () => {
    processRSS.mutate()
  }

  const handleProcessAI = () => {
    processAI.mutate()
  }

  const handleDeliverEmails = () => {
    deliverEmails.mutate()
  }

  const handleRunFullPipeline = () => {
    runPipeline.mutate()
  }

  // Get status tab info
  const getStatusTabInfo = () => {
    const counts = statusCounts.data || {} as Record<string, number>
    return [
      { key: 'approved', label: 'Approved', count: (counts['approved'] || 0) + (counts['emailed'] || 0) },
      { key: 'new', label: 'New', count: counts['new'] || 0 },
      { key: 'filtered_out', label: 'Filtered', count: counts['filtered_out'] || 0 },
      { key: 'applied', label: 'Applied', count: counts['applied'] || 0 },
      { key: 'needs_review', label: 'Needs Review', count: counts['needs_review'] || 0 },
    ]
  }

  return (
    <div className="space-y-6">
      {/* Algorithm Controls */}
      {showControls && (
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Algorithm Controls</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleProcessRSS}
              disabled={processRSS.isPending}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${processRSS.isPending ? 'animate-spin' : ''}`} />
              {processRSS.isPending ? 'Processing...' : 'Process RSS'}
            </Button>
            
            <Button
              onClick={handleProcessAI}
              disabled={processAI.isPending}
              variant="outline"
              size="sm"
            >
              <Filter className={`w-4 h-4 mr-2 ${processAI.isPending ? 'animate-spin' : ''}`} />
              {processAI.isPending ? 'Filtering...' : 'AI Filter'}
            </Button>
            
            <Button
              onClick={handleDeliverEmails}
              disabled={deliverEmails.isPending}
              variant="outline"
              size="sm"
            >
              <Mail className={`w-4 h-4 mr-2 ${deliverEmails.isPending ? 'animate-spin' : ''}`} />
              {deliverEmails.isPending ? 'Sending...' : 'Send Emails'}
            </Button>
            
            <Button
              onClick={handleRunFullPipeline}
              disabled={runPipeline.isPending}
              variant="default"
              size="sm"
            >
              <Play className={`w-4 h-4 mr-2 ${runPipeline.isPending ? 'animate-spin' : ''}`} />
              {runPipeline.isPending ? 'Running...' : 'Run Full Pipeline'}
            </Button>
          </div>
          
          {/* Status indicators */}
          {(processRSS.isSuccess || processAI.isSuccess || deliverEmails.isSuccess || runPipeline.isSuccess) && (
            <div className="mt-3 text-sm text-green-600">
              ✓ Operation completed successfully
            </div>
          )}
          
          {(processRSS.isError || processAI.isError || deliverEmails.isError || runPipeline.isError) && (
            <div className="mt-3 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Operation failed. Please try again.
            </div>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search jobs, companies, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Latest</SelectItem>
                <SelectItem value="rating">AI Rating</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-600">
            {filteredAndSortedJobs.length} jobs
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as typeof selectedStatus)}>
        <TabsList className="grid w-full grid-cols-5">
          {getStatusTabInfo().map(tab => (
            <TabsTrigger key={tab.key} value={tab.key} className="flex items-center gap-2">
              {tab.label}
              {tab.count > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          {/* Jobs List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading jobs...
            </div>
          ) : filteredAndSortedJobs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">
                {searchTerm ? 'No jobs match your search.' : `No ${selectedStatus} jobs found.`}
              </div>
              {selectedStatus === 'new' && (
                <Button onClick={handleProcessRSS} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Process RSS Feeds
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAndSortedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onJobClick={(job) => console.log('Job clicked:', job)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 