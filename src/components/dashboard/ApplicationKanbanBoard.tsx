// ApplicationKanbanBoard Component
// Drag-and-drop kanban board for managing job application statuses

import React, { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CheckCircle,
  Clock,
  Mail,
  Calendar,
  Star,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Building2,
  MapPin,
  ExternalLink,
  Eye
} from 'lucide-react'
import { Job, JobStatus } from '@/types/algorithm'
import { useJobsByStatus, useUpdateJobStatus } from '@/hooks/useJobs'
import { JobDetailView } from './JobDetailView'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'

interface KanbanColumn {
  id: JobStatus
  title: string
  color: string
  icon: React.ElementType
  maxItems?: number
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'new',
    title: 'New Jobs',
    color: 'bg-blue-50 border-blue-200',
    icon: Clock,
  },
  {
    id: 'approved',
    title: 'Approved',
    color: 'bg-green-50 border-green-200',
    icon: CheckCircle,
  },
  {
    id: 'applied',
    title: 'Applied',
    color: 'bg-purple-50 border-purple-200',
    icon: Mail,
  },
  {
    id: 'interview',
    title: 'Interview',
    color: 'bg-orange-50 border-orange-200',
    icon: Calendar,
  },
  {
    id: 'offer',
    title: 'Offer',
    color: 'bg-green-100 border-green-300',
    icon: Star,
  },
  {
    id: 'rejected',
    title: 'Rejected',
    color: 'bg-gray-50 border-gray-200',
    icon: XCircle,
  },
]

interface KanbanCardProps {
  job: Job
  onViewDetails: (job: Job) => void
}

function KanbanCard({ job, onViewDetails }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ))
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium line-clamp-2 mb-1">
              {job.title}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-xs">
              <Building2 className="w-3 h-3" />
              <span className="truncate">{job.company}</span>
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewDetails(job)}>
                <Eye className="mr-2 h-3 w-3" />
                View Details
              </DropdownMenuItem>
              {job.job_url && (
                <DropdownMenuItem onClick={() => window.open(job.job_url, '_blank')}>
                  <ExternalLink className="mr-2 h-3 w-3" />
                  View Original
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        {job.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{job.location}</span>
          </div>
        )}
        
        {job.ai_rating !== null && job.ai_rating !== undefined && (
          <div className="flex items-center gap-1">
            {getRatingStars(job.ai_rating)}
            <span className="text-xs text-muted-foreground ml-1">{job.ai_rating}/5</span>
          </div>
        )}
        
        {job.date_posted && (
          <div className="text-xs text-muted-foreground">
            Posted: {format(new Date(job.date_posted), 'MMM dd')}
          </div>
        )}
        
        {job.salary_range && (
          <Badge variant="outline" className="text-xs">
            {job.salary_range}
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}

interface KanbanColumnProps {
  column: KanbanColumn
  jobs: Job[]
  onViewDetails: (job: Job) => void
}

function KanbanColumnComponent({ column, jobs, onViewDetails }: KanbanColumnProps) {
  const Icon = column.icon

  return (
    <div className={`rounded-lg border-2 border-dashed ${column.color} p-4 min-h-[500px]`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4" />
        <h3 className="font-medium">{column.title}</h3>
        <Badge variant="outline" className="ml-auto">
          {jobs.length}
        </Badge>
      </div>
      
      <ScrollArea className="h-[400px]">
        <SortableContext items={jobs.map(job => job.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {jobs.map((job) => (
              <KanbanCard 
                key={job.id} 
                job={job} 
                onViewDetails={onViewDetails}
              />
            ))}
            {jobs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No jobs in this stage</p>
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  )
}

interface ApplicationKanbanBoardProps {
  className?: string
}

export function ApplicationKanbanBoard({ className }: ApplicationKanbanBoardProps) {
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)

  // Fetch jobs for each status
  const newJobs = useJobsByStatus('new')
  const approvedJobs = useJobsByStatus('approved')
  const appliedJobs = useJobsByStatus('applied')
  const interviewJobs = useJobsByStatus('interview')
  const offerJobs = useJobsByStatus('offer')
  const rejectedJobs = useJobsByStatus('rejected')

  const updateJobStatus = useUpdateJobStatus()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Organize jobs by status
  const jobsByStatus = useMemo(() => {
    return {
      new: newJobs.data || [],
      approved: approvedJobs.data || [],
      applied: appliedJobs.data || [],
      interview: interviewJobs.data || [],
      offer: offerJobs.data || [],
      rejected: rejectedJobs.data || [],
    }
  }, [newJobs.data, approvedJobs.data, appliedJobs.data, interviewJobs.data, offerJobs.data, rejectedJobs.data])

  // Get all jobs for drag overlay
  const allJobs = useMemo(() => {
    return Object.values(jobsByStatus).flat()
  }, [jobsByStatus])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const job = allJobs.find(j => j.id === active.id)
    setActiveJob(job || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !activeJob) {
      setActiveJob(null)
      return
    }

    // Determine target status from over container
    const targetStatus = over.id as JobStatus
    
    // Check if it's a valid status column
    if (!KANBAN_COLUMNS.find(col => col.id === targetStatus)) {
      setActiveJob(null)
      return
    }

    // Only update if status actually changed
    if (activeJob.status !== targetStatus) {
      try {
        await updateJobStatus.mutateAsync({
          id: activeJob.id,
          status: targetStatus,
          notes: `Moved to ${targetStatus} via kanban board`
        })

        toast({
          title: 'Status Updated',
          description: `Job moved to ${targetStatus} stage.`,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to update job status.',
          variant: 'destructive',
        })
      }
    }

    setActiveJob(null)
  }

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job)
    setShowDetailView(true)
  }

  const isLoading = newJobs.isLoading || approvedJobs.isLoading || appliedJobs.isLoading || 
                   interviewJobs.isLoading || offerJobs.isLoading || rejectedJobs.isLoading

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-muted-foreground">Loading kanban board...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Application Pipeline</h2>
          <p className="text-muted-foreground">
            Drag and drop jobs between stages to update their status
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Total: {allJobs.length} jobs</span>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {KANBAN_COLUMNS.map((column) => (
            <SortableContext
              key={column.id}
              id={column.id}
              items={jobsByStatus[column.id].map(job => job.id)}
              strategy={verticalListSortingStrategy}
            >
              <KanbanColumnComponent
                column={column}
                jobs={jobsByStatus[column.id]}
                onViewDetails={handleViewDetails}
              />
            </SortableContext>
          ))}
        </div>

        <DragOverlay>
          {activeJob ? (
            <KanbanCard 
              job={activeJob} 
              onViewDetails={handleViewDetails}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Job Detail Modal */}
      <JobDetailView 
        job={selectedJob}
        isOpen={showDetailView}
        onClose={() => setShowDetailView(false)}
      />
    </div>
  )
}