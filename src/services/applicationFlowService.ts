// Application Logic Flow Service
// Orchestrates the complete job hunting workflow based on job-hunting-journey.md

import type { 
  Job, 
  JobStatus, 
  JobUpdate, 
  UserPreferences
} from '../types/algorithm';
import { STATUS_TRANSITIONS } from '../types/algorithm';

// Application Flow Events for notifications and triggers
export interface ApplicationFlowEvent {
  id: string;
  job_id: string;
  event_type: ApplicationEventType;
  scheduled_date?: string;
  completed_date?: string;
  notes?: string;
  created_at: string;
}

export type ApplicationEventType = 
  | 'status_changed'
  | 'follow_up_due'
  | 'interview_scheduled'
  | 'application_deadline'
  | 'reminder_sent'
  | 'ai_analysis_complete'
  | 'manual_review_needed';

// Follow-up tracking interface
export interface FollowUpAction {
  id: string;
  job_id: string;
  action_type: 'follow_up_email' | 'check_status' | 'prepare_interview' | 'send_thank_you';
  due_date: string;
  completed: boolean;
  notes?: string;
  created_at: string;
}

// Interview tracking interface
export interface Interview {
  id: string;
  job_id: string;
  interview_type: 'phone' | 'video' | 'in_person' | 'technical' | 'panel';
  scheduled_date: string;
  duration_minutes?: number;
  interviewer_name?: string;
  interviewer_email?: string;
  location?: string;
  meeting_link?: string;
  preparation_notes?: string;
  feedback_notes?: string;
  outcome?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  next_steps?: string;
  created_at: string;
  updated_at: string;
}

class ApplicationFlowService {
  private static instance: ApplicationFlowService;
  private baseUrl = (typeof window !== 'undefined' && (window as any).__VITE_API_BASE_URL__) || 'http://localhost:3001/api';

  public static getInstance(): ApplicationFlowService {
    if (!ApplicationFlowService.instance) {
      ApplicationFlowService.instance = new ApplicationFlowService();
    }
    return ApplicationFlowService.instance;
  }

  // Core Workflow Management
  async processJobStatusChange(
    jobId: string, 
    newStatus: JobStatus, 
    notes?: string
  ): Promise<ApplicationFlowEvent[]> {
    const events: ApplicationFlowEvent[] = [];
    
    try {
      // Update job status
      await this.updateJobStatus(jobId, newStatus, notes);
      
      // Create status change event
      const statusEvent = await this.createEvent(jobId, 'status_changed', undefined, notes);
      events.push(statusEvent);
      
      // Trigger workflow-specific actions based on new status
      const workflowEvents = await this.triggerWorkflowActions(jobId, newStatus);
      events.push(...workflowEvents);
      
      return events;
    } catch (error) {
      console.error('Error processing job status change:', error);
      throw error;
    }
  }

  // Workflow Actions Based on Job-Hunting Journey
  private async triggerWorkflowActions(
    jobId: string, 
    status: JobStatus
  ): Promise<ApplicationFlowEvent[]> {
    const events: ApplicationFlowEvent[] = [];
    
    switch (status) {
      case 'applied': {
        // Schedule follow-up in 1 week
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + 7);
        
        await this.scheduleFollowUp(jobId, 'follow_up_email', followUpDate.toISOString(), 
          'Follow up on application status');
        
        const followUpEvent = await this.createEvent(
          jobId, 
          'follow_up_due', 
          followUpDate.toISOString(),
          'Follow-up scheduled for 1 week after application'
        );
        events.push(followUpEvent);
        break;
      }
        
      case 'interview': {
        // Create reminder to prepare for interview
        const reminderEvent = await this.createEvent(
          jobId,
          'interview_scheduled',
          undefined,
          'Interview scheduled - prepare questions and research company'
        );
        events.push(reminderEvent);
        break;
      }
        
      case 'rejected': {
        // Schedule follow-up to ask for feedback
        const feedbackDate = new Date();
        feedbackDate.setDate(feedbackDate.getDate() + 2);
        
        await this.scheduleFollowUp(jobId, 'send_thank_you', feedbackDate.toISOString(),
          'Send thank you note and request feedback');
        break;
      }
        
      case 'offer': {
        // Create reminder to negotiate and respond
        const negotiationEvent = await this.createEvent(
          jobId,
          'application_deadline',
          undefined,
          'Offer received - review terms and prepare negotiation if needed'
        );
        events.push(negotiationEvent);
        break;
      }
    }
    
    return events;
  }

  // Interview Management
  async scheduleInterview(interview: Omit<Interview, 'id' | 'created_at' | 'updated_at'>): Promise<Interview> {
    try {
      const response = await fetch(`${this.baseUrl}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interview)
      });
      
      if (!response.ok) throw new Error('Failed to schedule interview');
      
      const scheduledInterview = await response.json();
      
      // Update job status to 'interview'
      await this.updateJobStatus(interview.job_id, 'interview');
      
      // Create notification events
      await this.createEvent(
        interview.job_id,
        'interview_scheduled',
        interview.scheduled_date,
        `${interview.interview_type} interview scheduled`
      );
      
      return scheduledInterview;
    } catch (error) {
      console.error('Error scheduling interview:', error);
      throw error;
    }
  }

  async getInterviewsForJob(jobId: string): Promise<Interview[]> {
    try {
      const response = await fetch(`${this.baseUrl}/interviews?job_id=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch interviews');
      return await response.json();
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error;
    }
  }

  // Follow-up Management
  async scheduleFollowUp(
    jobId: string,
    actionType: FollowUpAction['action_type'],
    dueDate: string,
    notes?: string
  ): Promise<FollowUpAction> {
    try {
      const followUp = {
        job_id: jobId,
        action_type: actionType,
        due_date: dueDate,
        completed: false,
        notes,
        created_at: new Date().toISOString()
      };
      
      const response = await fetch(`${this.baseUrl}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUp)
      });
      
      if (!response.ok) throw new Error('Failed to schedule follow-up');
      return await response.json();
    } catch (error) {
      console.error('Error scheduling follow-up:', error);
      throw error;
    }
  }

  async getFollowUpsForJob(jobId: string): Promise<FollowUpAction[]> {
    try {
      const response = await fetch(`${this.baseUrl}/follow-ups?job_id=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch follow-ups');
      return await response.json();
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      throw error;
    }
  }

  async markFollowUpCompleted(followUpId: string, notes?: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/follow-ups/${followUpId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          completed: true, 
          notes,
          completed_date: new Date().toISOString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to mark follow-up as completed');
    } catch (error) {
      console.error('Error marking follow-up as completed:', error);
      throw error;
    }
  }

  // Event Management
  async createEvent(
    jobId: string,
    eventType: ApplicationEventType,
    scheduledDate?: string,
    notes?: string
  ): Promise<ApplicationFlowEvent> {
    try {
      const event = {
        job_id: jobId,
        event_type: eventType,
        scheduled_date: scheduledDate,
        notes,
        created_at: new Date().toISOString()
      };
      
      const response = await fetch(`${this.baseUrl}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      if (!response.ok) throw new Error('Failed to create event');
      return await response.json();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getEventsForJob(jobId: string): Promise<ApplicationFlowEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/events?job_id=${jobId}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return await response.json();
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  // Dashboard Data Aggregation
  async getDashboardData(): Promise<{
    upcoming_interviews: Interview[];
    pending_follow_ups: FollowUpAction[];
    recent_events: ApplicationFlowEvent[];
    job_stats: {
      total: number;
      by_status: Record<JobStatus, number>;
      this_week: number;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  // Status Validation
  validateStatusTransition(currentStatus: JobStatus, newStatus: JobStatus): boolean {
    const allowedTransitions = STATUS_TRANSITIONS[currentStatus];
    return allowedTransitions.includes(newStatus);
  }

  // Utility Methods
  private async updateJobStatus(jobId: string, status: JobStatus, notes?: string): Promise<void> {
    const updateData: JobUpdate = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (notes) {
      // Append notes to existing notes
      const job = await this.getJob(jobId);
      updateData.ai_notes = job.ai_notes ? `${job.ai_notes}\n\n${notes}` : notes;
    }
    
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) throw new Error('Failed to update job status');
  }

  private async getJob(jobId: string): Promise<Job> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}`);
    if (!response.ok) throw new Error('Failed to fetch job');
    return await response.json();
  }
}

// Export singleton instance
export const applicationFlowService = ApplicationFlowService.getInstance();
export default applicationFlowService; 