// JobCard Component
// Displays individual job listings with AI analysis and user actions

import React, { useState } from 'react'
import { format } from 'date-fns'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Building,
  MapPin,
  Calendar,
  Star,
  AlertTriangle,
  Eye,
  DollarSign
} from 'lucide-react'
import { Job, JobStatus } from '@/types/algorithm'
import { useMarkJobAsApplied, useMarkJobAsRejected, useUpdateJobStatus } from '@/hooks/useJobs'
import { JobDetailView } from '@/components/dashboard'

interface JobCardProps {
  job: Job
  showFullDetails?: boolean
  onJobClick?: (job: Job) => void
}

export function JobCard({ job, showFullDetails = false, onJobClick }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullDetails)
  const [showActions, setShowActions] = useState(false)
  const [showDetailView, setShowDetailView] = useState(false)

  const markAsApplied = useMarkJobAsApplied()
  const markAsRejected = useMarkJobAsRejected()
  const updateStatus = useUpdateJobStatus()

  // Handle job status updates
  const handleStatusUpdate = async (newStatus: JobStatus, notes?: string) => {
    try {
      await updateStatus.mutateAsync({ id: job.id, status: newStatus, notes })
    } catch (error) {
      console.error('Failed to update job status:', error)
    }
  }

  const handleMarkAsApplied = () => {
    markAsApplied.mutate({ id: job.id, notes: 'Applied via JobForge AI' })
    setShowActions(false)
  }

  const handleMarkAsRejected = () => {
    markAsRejected.mutate({ id: job.id, reason: 'Not interested' })
    setShowActions(false)
  }

  const handleViewDetails = () => {
    if (onJobClick) {
      onJobClick(job)
    } else {
      setShowDetailView(true)
    }
  }

  // Get status styling
  const getStatusBadge = (status: JobStatus) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'New' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
      filtered_out: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Filtered Out' },
      emailed: { color: 'bg-purple-100 text-purple-800', icon: Mail, label: 'Emailed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      applied: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Applied' },
      interview: { color: 'bg-orange-100 text-orange-800', icon: Calendar, label: 'Interview' },
      rejected: { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Rejected' },
      offer: { color: 'bg-green-100 text-green-800', icon: Star, label: 'Offer' },
      needs_review: { color: 'bg-amber-100 text-amber-800', icon: AlertTriangle, label: 'Needs Review' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  const formatSalary = (salaryRange: string) => {
    if (!salaryRange) return null
    return salaryRange
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-2">
                {job.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Building className="w-4 h-4" />
                <span className="font-medium">{job.company}</span>
                {job.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </span>
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {getStatusBadge(job.status)}
              <DropdownMenu open={showActions} onOpenChange={setShowActions}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleViewDetails}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  {job.job_url && (
                    <DropdownMenuItem onClick={() => window.open(job.job_url, '_blank')}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Original
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleMarkAsApplied}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Applied
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMarkAsRejected}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Not Interested
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Job metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {job.date_posted && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(job.date_posted), 'MMM dd')}
                </span>
              )}
              {formatSalary(job.salary_range) && (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {formatSalary(job.salary_range)}
                </span>
              )}
              {job.source && (
                <span className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {job.source}
                  </Badge>
                </span>
              )}
            </div>

            {/* AI Rating */}
            {job.ai_rating !== null && job.ai_rating !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">AI Rating:</span>
                <div className="flex items-center gap-1">
                  {getRatingStars(job.ai_rating)}
                  <span className="text-sm ml-1">{job.ai_rating}/5</span>
                </div>
              </div>
            )}

            {/* Job description preview */}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {job.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleViewDetails}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Full Details
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-xs">
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Show More
                        </>
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
              </div>
              
              <CollapsibleContent className="space-y-3">
                {job.description && (
                  <div className="text-sm whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
                    {job.description.length > 500 
                      ? `${job.description.substring(0, 500)}...` 
                      : job.description
                    }
                  </div>
                )}
                
                {job.ai_notes && (
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">AI Analysis</span>
                    </div>
                    <p className="text-sm text-blue-800">{job.ai_notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleMarkAsApplied}
                    disabled={markAsApplied.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleMarkAsRejected}
                    disabled={markAsRejected.isPending}
                    className="flex-1"
                  >
                    <XCircle className="w-3 h-3 mr-1" />
                    Pass
                  </Button>
                  {job.job_url && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(job.job_url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Job Detail Modal */}
      <JobDetailView 
        job={job}
        isOpen={showDetailView}
        onClose={() => setShowDetailView(false)}
      />
    </>
  )
} 