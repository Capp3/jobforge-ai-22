// Preferences Service
// Handles user job filtering preferences for the algorithm

import { 
  UserPreferences, 
  PreferencesCreate, 
  PreferencesUpdate 
} from '@/types/algorithm'

export class PreferencesService {
  
  // Get user preferences (placeholder implementation)
  // TODO: Implement with actual Supabase calls once types are updated
  static async getUserPreferences(): Promise<UserPreferences | null> {
    // Return default preferences for now
    return {
      id: 'default-preferences',
      user_id: 'default-user',
      preferred_locations: ['Belfast', 'Northern Ireland', 'UK', 'Remote'],
      work_mode: ['hybrid', 'remote', 'onsite'],
      travel_willingness: 'limited',
      salary_range: '40000-80000',
      career_level: ['senior', 'mid'],
      tech_stack: ['broadcast', 'media', 'production', 'networking', 'AV', 'IP'],
      company_size: ['startup', 'medium', 'large'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Create new user preferences (placeholder)
  static async createUserPreferences(preferences: PreferencesCreate): Promise<UserPreferences> {
    // TODO: Implement with actual Supabase calls
    return {
      id: crypto.randomUUID(),
      user_id: crypto.randomUUID(),
      ...preferences,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Update user preferences (placeholder)
  static async updateUserPreferences(id: string, updates: PreferencesUpdate): Promise<UserPreferences> {
    // TODO: Implement with actual Supabase calls
    const current = await this.getUserPreferences()
    if (!current) {
      throw new Error('No preferences found to update')
    }
    
    return {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    }
  }

  // Get or create default preferences
  static async getOrCreateDefaults(): Promise<UserPreferences> {
    let preferences = await this.getUserPreferences()
    
    if (!preferences) {
      // Create default preferences
      preferences = await this.createUserPreferences({
        preferred_locations: ['Belfast', 'Northern Ireland', 'UK', 'Remote'],
        work_mode: ['hybrid', 'remote', 'onsite'],
        travel_willingness: 'limited',
        salary_range: '40000-80000',
        career_level: ['senior', 'mid'],
        tech_stack: ['broadcast', 'media', 'production', 'networking', 'AV', 'IP'],
        company_size: ['startup', 'medium', 'large']
      })
    }

    return preferences
  }

  // Validate preferences data
  static validatePreferences(preferences: Partial<PreferencesCreate>): string[] {
    const errors: string[] = []

    if (preferences.preferred_locations && preferences.preferred_locations.length === 0) {
      errors.push('At least one preferred location is required')
    }

    if (preferences.work_mode && preferences.work_mode.length === 0) {
      errors.push('At least one work mode preference is required')
    }

    if (preferences.salary_range && !preferences.salary_range.match(/^\d+(-\d+)?$/)) {
      errors.push('Salary range must be in format "min-max" or "amount"')
    }

    if (preferences.travel_willingness && 
        !['limited', 'moderate', 'extensive'].includes(preferences.travel_willingness)) {
      errors.push('Travel willingness must be limited, moderate, or extensive')
    }

    if (preferences.career_level && preferences.career_level.length === 0) {
      errors.push('At least one career level is required')
    }

    if (preferences.tech_stack && preferences.tech_stack.length === 0) {
      errors.push('At least one technology skill is required')
    }

    return errors
  }

  // Get available option lists for UI
  static getPreferenceOptions() {
    return {
      workModes: [
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'onsite', label: 'On-site' }
      ],
      travelWillingness: [
        { value: 'limited', label: 'Limited (occasional)' },
        { value: 'moderate', label: 'Moderate (monthly)' },
        { value: 'extensive', label: 'Extensive (weekly)' }
      ],
      careerLevels: [
        { value: 'junior', label: 'Junior' },
        { value: 'mid', label: 'Mid-level' },
        { value: 'senior', label: 'Senior' },
        { value: 'lead', label: 'Lead' },
        { value: 'principal', label: 'Principal' }
      ],
      companySizes: [
        { value: 'startup', label: 'Startup (1-50)' },
        { value: 'medium', label: 'Medium (51-500)' },
        { value: 'large', label: 'Large (500+)' },
        { value: 'enterprise', label: 'Enterprise (1000+)' }
      ],
      commonTechStacks: [
        'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java',
        'broadcast', 'media', 'production', 'networking', 'AV', 'IP',
        'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB'
      ],
      commonLocations: [
        'Belfast', 'Northern Ireland', 'UK', 'Remote', 'London', 'Manchester',
        'Edinburgh', 'Dublin', 'Cardiff', 'Birmingham'
      ]
    }
  }

  // Format preferences for display
  static formatPreferencesForDisplay(preferences: UserPreferences) {
    return {
      'Preferred Locations': preferences.preferred_locations.join(', '),
      'Work Mode': preferences.work_mode.join(', '),
      'Travel Willingness': preferences.travel_willingness,
      'Salary Range': `£${preferences.salary_range}`,
      'Career Level': preferences.career_level.join(', '),
      'Tech Stack': preferences.tech_stack.join(', '),
      'Company Size': preferences.company_size.join(', ')
    }
  }

  // Export preferences for backup
  static async exportPreferences(): Promise<string> {
    const preferences = await this.getUserPreferences()
    return JSON.stringify(preferences, null, 2)
  }

  // Import preferences from backup
  static async importPreferences(jsonData: string): Promise<UserPreferences> {
    try {
      const parsed = JSON.parse(jsonData) as PreferencesCreate
      
      // Validate the imported data
      const errors = this.validatePreferences(parsed)
      if (errors.length > 0) {
        throw new Error(`Invalid preferences data: ${errors.join(', ')}`)
      }

      // Get current preferences to update, or create new ones
      const current = await this.getUserPreferences()
      if (current) {
        return this.updateUserPreferences(current.id, parsed)
      } else {
        return this.createUserPreferences(parsed)
      }

    } catch (error) {
      throw new Error(`Failed to import preferences: ${error.message}`)
    }
  }
} 