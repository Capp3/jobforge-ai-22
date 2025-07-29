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
  AlertTriangle
} from 'lucide-react'
import { Job, JobStatus } from '@/types/algorithm'
import { useMarkJobAsApplied, useMarkJobAsRejected, useUpdateJobStatus } from '@/hooks/useJobs'

interface JobCardProps {
  job: Job
  showFullDetails?: boolean
  onJobClick?: (job: Job) => void
}

export function JobCard({ job, showFullDetails = false, onJobClick }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(showFullDetails)
  const [showActions, setShowActions] = useState(false)

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

  // Get AI rating styling
  const getRatingBadge = (rating?: string) => {
    if (!rating) return null
    
    const ratingConfig = {
      APPROVE: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      MAYBE: { color: 'bg-yellow-100 text-yellow-800', label: 'Maybe' },
      REJECT: { color: 'bg-red-100 text-red-800', label: 'Rejected' }
    }
    
    const config = ratingConfig[rating as keyof typeof ratingConfig]
    if (!config) return null
    
    return (
      <Badge className={config.color}>
        AI: {config.label}
      </Badge>
    )
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle 
              className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => onJobClick?.(job)}
            >
              {job.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {job.company}
              </span>
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              )}
              {job.published_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(job.published_date), 'MMM d, yyyy')}
                </span>
              )}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(job.status)}
            {getRatingBadge(job.rating)}
            
            <DropdownMenu open={showActions} onOpenChange={setShowActions}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {job.job_url && (
                  <DropdownMenuItem onClick={() => window.open(job.job_url, '_blank')}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Job Listing
                  </DropdownMenuItem>
                )}
                {job.status === 'approved' && (
                  <DropdownMenuItem onClick={handleMarkAsApplied}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Applied
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleMarkAsRejected}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Not Interested
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {job.salary_range && (
          <div className="text-sm font-medium text-green-600">
            {job.salary_range}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* AI Analysis Summary */}
        {job.reasoning && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">AI Analysis</h4>
            <p className="text-sm text-blue-800">{job.reasoning}</p>
            {job.top_matches && job.top_matches.length > 0 && (
              <div className="mt-2">
                <span className="text-xs font-medium text-blue-700">Key Matches:</span>
                <ul className="text-xs text-blue-700 list-disc list-inside">
                  {job.top_matches.map((match, index) => (
                    <li key={index}>{match}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Job Description Preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-3">
            {job.description}
          </p>
        </div>

        {/* Detailed Analysis (Collapsible) */}
        {job.detailed_analysis && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Detailed AI Analysis</span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-3">
              {job.detailed_analysis.why_worth_reviewing && (
                <div>
                  <h5 className="font-medium text-sm text-gray-900">Why Worth Reviewing</h5>
                  <p className="text-sm text-gray-600 mt-1">{job.detailed_analysis.why_worth_reviewing}</p>
                </div>
              )}
              
              {job.detailed_analysis.technical_challenges && (
                <div>
                  <h5 className="font-medium text-sm text-gray-900">Technical Challenges</h5>
                  <p className="text-sm text-gray-600 mt-1">{job.detailed_analysis.technical_challenges}</p>
                </div>
              )}
              
              {job.detailed_analysis.career_growth && (
                <div>
                  <h5 className="font-medium text-sm text-gray-900">Career Growth</h5>
                  <p className="text-sm text-gray-600 mt-1">{job.detailed_analysis.career_growth}</p>
                </div>
              )}
              
              {job.detailed_analysis.company_assessment && (
                <div>
                  <h5 className="font-medium text-sm text-gray-900">Company Assessment</h5>
                  <p className="text-sm text-gray-600 mt-1">{job.detailed_analysis.company_assessment}</p>
                </div>
              )}
              
              {job.detailed_analysis.potential_concerns && (
                <div>
                  <h5 className="font-medium text-sm text-orange-700">Potential Concerns</h5>
                  <p className="text-sm text-orange-600 mt-1">{job.detailed_analysis.potential_concerns}</p>
                </div>
              )}
              
              {job.detailed_analysis.application_recommendations && (
                <div>
                  <h5 className="font-medium text-sm text-gray-900">Application Strategy</h5>
                  <p className="text-sm text-gray-600 mt-1">{job.detailed_analysis.application_recommendations}</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 pt-3 border-t">
          {job.job_url && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(job.job_url, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View Listing
            </Button>
          )}
          
          {job.status === 'approved' && (
            <Button 
              size="sm" 
              onClick={handleMarkAsApplied}
              disabled={markAsApplied.isPending}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {markAsApplied.isPending ? 'Applying...' : 'Mark Applied'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 