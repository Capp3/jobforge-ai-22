// Settings Service
// Handles SMTP configuration and notification preferences

export interface SMTPConfig {
  id?: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string; // Optional in responses
  from: string;
  created_at?: string;
  updated_at?: string;
}

export interface NotificationPreferences {
  id?: string;
  email_enabled: boolean;
  email_frequency: 'immediate' | 'daily' | 'weekly';
  email_types: string[];
  digest_time: string; // HH:MM format
  created_at?: string;
  updated_at?: string;
}

export interface AIPrompts {
  id?: string;
  prompt1: string;
  prompt2: string;
  created_at?: string;
  updated_at?: string;
}

export interface SMTPTestResult {
  success: boolean;
  message: string;
  error?: string;
}

export class SettingsService {
  private static BASE_URL = '/api/settings';

  // === SMTP Configuration ===

  static async getSMTPConfig(): Promise<SMTPConfig> {
    const response = await fetch(`${this.BASE_URL}/smtp`);
    if (!response.ok) {
      throw new Error('Failed to fetch SMTP configuration');
    }
    return response.json();
  }

  static async saveSMTPConfig(config: SMTPConfig): Promise<{ message: string }> {
    const response = await fetch(`${this.BASE_URL}/smtp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save SMTP configuration');
    }
    
    return response.json();
  }

  static async testSMTPConnection(config: SMTPConfig): Promise<SMTPTestResult> {
    const response = await fetch(`${this.BASE_URL}/smtp/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    const result = await response.json();
    return result;
  }

  // === Notification Preferences ===

  static async getNotificationPreferences(): Promise<NotificationPreferences> {
    const response = await fetch(`${this.BASE_URL}/notifications`);
    if (!response.ok) {
      throw new Error('Failed to fetch notification preferences');
    }
    return response.json();
  }

  static async saveNotificationPreferences(preferences: NotificationPreferences): Promise<{ message: string }> {
    const response = await fetch(`${this.BASE_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save notification preferences');
    }
    
    return response.json();
  }

  // === Utility Methods ===

  static getEmailFrequencyOptions() {
    return [
      { value: 'immediate', label: 'Immediate (as they happen)' },
      { value: 'daily', label: 'Daily digest' },
      { value: 'weekly', label: 'Weekly summary' },
    ];
  }

  static getEmailTypeOptions() {
    return [
      { value: 'new_jobs', label: 'New job matches' },
      { value: 'status_changes', label: 'Application status changes' },
      { value: 'interviews', label: 'Interview reminders' },
      { value: 'follow_ups', label: 'Follow-up reminders' },
      { value: 'weekly_digest', label: 'Weekly activity digest' },
    ];
  }

  static getDigestTimeOptions() {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      const timeStr = `${hour.toString().padStart(2, '0')}:00`;
      const displayTime = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
      if (hour === 12) {
        times.push({ value: timeStr, label: '12:00 PM' });
      } else {
        times.push({ value: timeStr, label: displayTime });
      }
    }
    return times;
  }

  static validateDigestTime(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  // === AI Prompts ===

  static async getAIPrompts(): Promise<AIPrompts> {
    const response = await fetch(`${this.BASE_URL}/prompts`);
    if (!response.ok) {
      throw new Error('Failed to fetch AI prompts');
    }
    return response.json();
  }

  static async saveAIPrompts(prompts: AIPrompts): Promise<{ message: string }> {
    const response = await fetch(`${this.BASE_URL}/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompts),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save AI prompts');
    }
    
    return response.json();
  }

  static getAvailableVariables(): string[] {
    return [
      "{{biography}}", "{{job_title}}", "{{company}}", "{{location}}", 
      "{{job_description}}", "{{salary_range}}", "{{remote_preference}}", 
      "{{target_locations}}", "{{target_job_titles}}", "{{min_salary}}", 
      "{{max_salary}}", "{{currency}}", "{{requirements}}", "{{source}}"
    ];
  }
}