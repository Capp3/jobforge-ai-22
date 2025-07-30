// Simple API Client for JobForge Backend
const API_BASE_URL = 'http://localhost:3001/api';

// Type definitions for API data
interface JobData {
  id?: string;
  title: string;
  company: string;
  status: string;
  url?: string;
  description?: string;
  location?: string;
  date_applied?: string;
  follow_up_date?: string;
  notes?: string;
}

interface PreferencesData {
  id?: string;
  key: string;
  value: string;
  category?: string;
}

type JobUpdates = Partial<JobData>;
type PreferencesUpdates = Partial<PreferencesData>;

class APIClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Jobs endpoints
  async getJobs(params?: {
    status?: string[]
    limit?: number
    offset?: number
    search?: string
  }) {
    const searchParams = new URLSearchParams();
    
    if (params?.status) {
      params.status.forEach(status => searchParams.append('status', status));
    }
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    if (params?.search) searchParams.set('search', params.search);

    const queryString = searchParams.toString();
    return this.request(`/jobs${queryString ? `?${queryString}` : ''}`);
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`);
  }

  async createJob(jobData: JobData) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async updateJob(id: string, updates: JobUpdates) {
    return this.request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteJob(id: string) {
    return this.request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getJobStatusCounts() {
    return this.request('/jobs/stats/status-counts');
  }

  // Preferences endpoints
  async getPreferences() {
    return this.request('/preferences');
  }

  async createPreferences(preferencesData: PreferencesData) {
    return this.request('/preferences', {
      method: 'POST',
      body: JSON.stringify(preferencesData),
    });
  }

  async updatePreferences(id: string, updates: PreferencesUpdates) {
    return this.request(`/preferences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getOrCreateDefaults() {
    return this.request('/preferences/defaults', {
      method: 'POST',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new APIClient();