// JobDetailView Component
// Comprehensive job detail modal with AI analysis and application tracking

import React, { useState } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { 
  ExternalLink, 
  Building2, 
  MapPin, 
  Calendar, 
  DollarSign,
  Star,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  Video,
  Users,
  AlertTriangle,
  FileText,
  BookOpen,
  Target
} from 'lucide-react'
import { Job } from '@/types/algorithm'
import { useMarkJobAsApplied, useMarkJobAsRejected, useUpdateJobStatus } from '@/hooks/useJobs'
import { toast } from '@/hooks/use-toast'

interface JobDetailViewProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

export function JobDetailView({ job, isOpen, onClose }: JobDetailViewProps) {
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const markAsApplied = useMarkJobAsApplied()
  const markAsRejected = useMarkJobAsRejected()
  const updateStatus = useUpdateJobStatus()

  if (!job) return null

  const handleApply = async () => {
    setIsSubmitting(true)
    try {
      await markAsApplied.mutateAsync({ 
        id: job.id, 
        notes: notes || 'Applied via JobForge AI' 
      })
      toast({
        title: 'Application Submitted',
        description: `Marked job at ${job.company} as applied.`,
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update job status.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      await markAsRejected.mutateAsync({ 
        id: job.id, 
        reason: notes || 'Not interested' 
      })
      toast({
        title: 'Job Rejected',
        description: `Marked job at ${job.company} as not interested.`,
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update job status.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
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
    
    const config = statusConfig[job.status as keyof typeof statusConfig] || statusConfig.pending
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
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  const formatSalary = (salaryRange: string) => {
    if (!salaryRange) return 'Not specified'
    return salaryRange
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5" />
              {job.title}
            </div>
            {getStatusBadge()}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4 text-lg">
            <span className="font-medium">{job.company}</span>
            {job.location && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Job Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Job Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Salary:</span>
                    <span className="text-sm">{formatSalary(job.salary_range)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Posted:</span>
                    <span className="text-sm">
                      {job.date_posted ? format(new Date(job.date_posted), 'MMM dd, yyyy') : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Processed:</span>
                    <span className="text-sm">
                      {job.date_processed ? format(new Date(job.date_processed), 'MMM dd, yyyy') : 'Not processed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Source:</span>
                    <span className="text-sm">{job.source || 'Unknown'}</span>
                  </div>
                  {job.job_url && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.open(job.job_url, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Original Job Posting
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* AI Rating Card */}
              {job.ai_rating !== null && job.ai_rating !== undefined && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      AI Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Rating:</span>
                      <div className="flex items-center gap-1">
                        {getRatingStars(job.ai_rating)}
                        <span className="text-sm ml-2">{job.ai_rating}/5</span>
                      </div>
                    </div>
                    {job.ai_notes && (
                      <div>
                        <span className="text-sm font-medium">AI Notes:</span>
                        <p className="text-sm text-muted-foreground mt-1">{job.ai_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Job Description */}
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {job.description ? (
                    <div className="whitespace-pre-wrap text-sm">{job.description}</div>
                  ) : (
                    <p className="text-muted-foreground">No description available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            {job.ai_rating !== null && job.ai_rating !== undefined ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Detailed AI Analysis
                  </CardTitle>
                  <CardDescription>
                    AI-powered job matching and compatibility assessment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-2">Overall Rating</h4>
                      <div className="flex items-center gap-2">
                        {getRatingStars(job.ai_rating)}
                        <span className="text-lg font-bold ml-2">{job.ai_rating}/5</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Match Quality</h4>
                      <div className="text-lg font-bold text-green-600">
                        {job.ai_rating >= 4 ? 'Excellent' : 
                         job.ai_rating >= 3 ? 'Good' : 
                         job.ai_rating >= 2 ? 'Fair' : 'Poor'} Match
                      </div>
                    </div>
                  </div>
                  
                  {job.ai_notes && (
                    <div>
                      <h4 className="font-medium mb-2">Analysis Notes</h4>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{job.ai_notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No AI analysis available for this job</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requirements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Job Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job.requirements ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm">{job.requirements}</div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specific requirements listed</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Take Action</CardTitle>
                <CardDescription>
                  Update the job status or add notes about your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                  <Textarea
                    placeholder="Add notes about this job application..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleApply}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Mark as Applied
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Not Interested
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 