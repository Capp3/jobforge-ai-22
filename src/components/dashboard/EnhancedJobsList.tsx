// EnhancedJobsList Component
// Advanced job listing with comprehensive filtering, sorting, and search capabilities

import React, { useState, useMemo, useCallback } from 'react'
import { JobCard } from '@/components/jobs/JobCard'
import { JobDetailView } from './JobDetailView'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Grid,
  List,
  SlidersHorizontal,
  X
} from 'lucide-react'
import { Job, JobStatus } from '@/types/algorithm'
import { 
  useApprovedJobs,
  useJobsByStatus,
  useJobStatusCounts,
  useJobsRealtime,
} from '@/hooks/useJobs'

interface EnhancedJobsListProps {
  className?: string
  defaultView?: JobStatus | 'all' | 'approved'
}

interface FilterOptions {
  minRating?: number
  maxRating?: number
  salaryRange?: string
  location?: string
  source?: string
}

export function EnhancedJobsList({ className, defaultView = 'approved' }: EnhancedJobsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | 'all' | 'approved'>(defaultView)
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'company' | 'title'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobDetail, setShowJobDetail] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})

  // Real-time updates
  useJobsRealtime()

  // Data hooks
  const approvedJobs = useApprovedJobs()
  const statusCounts = useJobStatusCounts()
  const newJobs = useJobsByStatus('new')
  const filteredJobs = useJobsByStatus('filtered_out')
  const emailedJobs = useJobsByStatus('emailed')
  const appliedJobs = useJobsByStatus('applied')
  const interviewJobs = useJobsByStatus('interview')
  const offerJobs = useJobsByStatus('offer')
  const rejectedJobs = useJobsByStatus('rejected')
  const needsReviewJobs = useJobsByStatus('needs_review')

  // Get current jobs based on selected status - moved inside useMemo to fix dependency warning
  const getCurrentJobs = useCallback((): Job[] => {
    switch (selectedStatus) {
      case 'approved':
        return [...(approvedJobs.data || []), ...(emailedJobs.data || [])]
      case 'new':
        return newJobs.data || []
      case 'filtered_out':
        return filteredJobs.data || []
      case 'emailed':
        return emailedJobs.data || []
      case 'applied':
        return appliedJobs.data || []
      case 'interview':
        return interviewJobs.data || []
      case 'offer':
        return offerJobs.data || []
      case 'rejected':
        return rejectedJobs.data || []
      case 'needs_review':
        return needsReviewJobs.data || []
      case 'all':
        return [
          ...(approvedJobs.data || []),
          ...(newJobs.data || []),
          ...(emailedJobs.data || []),
          ...(appliedJobs.data || []),
          ...(interviewJobs.data || []),
          ...(offerJobs.data || []),
          ...(rejectedJobs.data || []),
          ...(needsReviewJobs.data || [])
        ]
      default:
        return approvedJobs.data || []
    }
  }, [
    selectedStatus,
    approvedJobs.data,
    newJobs.data,
    filteredJobs.data,
    emailedJobs.data,
    appliedJobs.data,
    interviewJobs.data,
    offerJobs.data,
    rejectedJobs.data,
    needsReviewJobs.data
  ])

  // Apply filters, search, and sorting
  const processedJobs = useMemo(() => {
    let jobs = getCurrentJobs()

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.description?.toLowerCase().includes(term) ||
        job.location?.toLowerCase().includes(term) ||
        job.requirements?.toLowerCase().includes(term) ||
        job.salary_range?.toLowerCase().includes(term)
      )
    }

    // Apply filters
    if (filters.minRating !== undefined) {
      jobs = jobs.filter(job => (job.ai_rating || 0) >= filters.minRating!)
    }
    if (filters.maxRating !== undefined) {
      jobs = jobs.filter(job => (job.ai_rating || 0) <= filters.maxRating!)
    }
    if (filters.location) {
      jobs = jobs.filter(job => 
        job.location?.toLowerCase().includes(filters.location!.toLowerCase())
      )
    }
    if (filters.source) {
      jobs = jobs.filter(job => 
        job.source?.toLowerCase().includes(filters.source!.toLowerCase())
      )
    }

    // Apply sorting
    jobs.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date': {
          const dateA = new Date(a.date_posted || a.created_at || 0).getTime()
          const dateB = new Date(b.date_posted || b.created_at || 0).getTime()
          comparison = dateB - dateA
          break
        }
        case 'rating': {
          const ratingA = a.ai_rating || 0
          const ratingB = b.ai_rating || 0
          comparison = ratingB - ratingA
          break
        }
        case 'company':
          comparison = a.company.localeCompare(b.company)
          break
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        default:
          comparison = 0
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return jobs
  }, [getCurrentJobs, searchTerm, filters, sortBy, sortOrder])

  // Status tab info
  const getStatusTabInfo = () => {
    const counts = statusCounts.data || {} as Record<string, number>
    return [
      { key: 'all', label: 'All Jobs', count: Object.values(counts).reduce((sum, count) => sum + count, 0) },
      { key: 'approved', label: 'Approved', count: (counts['approved'] || 0) + (counts['emailed'] || 0) },
      { key: 'new', label: 'New', count: counts['new'] || 0 },
      { key: 'applied', label: 'Applied', count: counts['applied'] || 0 },
      { key: 'interview', label: 'Interview', count: counts['interview'] || 0 },
      { key: 'offer', label: 'Offer', count: counts['offer'] || 0 },
      { key: 'needs_review', label: 'Review', count: counts['needs_review'] || 0 },
    ]
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setShowJobDetail(true)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'asc' ? 'desc' : 'asc')
  }

  const getSortIcon = () => {
    if (sortOrder === 'asc') return <ArrowUp className="w-4 h-4" />
    if (sortOrder === 'desc') return <ArrowDown className="w-4 h-4" />
    return <ArrowUpDown className="w-4 h-4" />
  }

  const isLoading = approvedJobs.isLoading || newJobs.isLoading || appliedJobs.isLoading

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Job Listings</h2>
          <p className="text-muted-foreground">
            {processedJobs.length} job{processedJobs.length !== 1 ? 's' : ''} found
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, company, location, requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: 'date' | 'rating' | 'company' | 'title') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="rating">AI Rating</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm" onClick={toggleSortOrder}>
                {getSortIcon()}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Min AI Rating</label>
                  <Select 
                    value={filters.minRating?.toString() || ''} 
                    onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, minRating: value ? parseInt(value) : undefined }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="1">1+ Stars</SelectItem>
                      <SelectItem value="2">2+ Stars</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <Input
                    placeholder="Filter by location"
                    value={filters.location || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Source</label>
                  <Input
                    placeholder="Filter by source"
                    value={filters.source || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Tabs */}
      <Tabs value={selectedStatus} onValueChange={(value: JobStatus | 'all' | 'approved') => setSelectedStatus(value)}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {getStatusTabInfo().map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="text-sm">
              {tab.label}
              <Badge variant="outline" className="ml-2">
                {tab.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedStatus} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : processedJobs.length > 0 ? (
            <div className={
              viewMode === 'grid' 
                ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' 
                : 'space-y-4'
            }>
              {processedJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onJobClick={handleJobClick}
                  showFullDetails={viewMode === 'list'}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || Object.keys(filters).length > 0
                      ? 'Try adjusting your search or filters'
                      : 'No jobs available in this category'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Detail Modal */}
      <JobDetailView 
        job={selectedJob}
        isOpen={showJobDetail}
        onClose={() => setShowJobDetail(false)}
      />
    </div>
  )
}