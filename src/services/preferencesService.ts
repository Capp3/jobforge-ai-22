// Preferences Service
// Handles user job filtering preferences for the algorithm

import { 
  UserPreferences, 
  PreferencesCreate, 
  PreferencesUpdate 
} from '@/types/algorithm'
import { apiClient } from './apiClient'

export class PreferencesService {
  
  // Get user preferences (simplified for single-user)
  static async getUserPreferences(userId?: string): Promise<UserPreferences | null> {
    try {
      const data = await apiClient.getPreferences()
      return data as UserPreferences
    } catch (error) {
      if (error.message.includes('404') || error.message.includes('No preferences found')) {
        return null
      }
      throw new Error(`Failed to fetch preferences: ${error.message}`)
    }
  }

  // Create new user preferences
  static async createUserPreferences(preferences: PreferencesCreate): Promise<UserPreferences> {
    try {
      const data = await apiClient.createPreferences(preferences)
      return data as UserPreferences
    } catch (error) {
      throw new Error(`Failed to create preferences: ${error.message}`)
    }
  }

  // Update user preferences
  static async updateUserPreferences(id: string, updates: PreferencesUpdate): Promise<UserPreferences> {
    try {
      const data = await apiClient.updatePreferences(id, updates)
      return data as UserPreferences
    } catch (error) {
      throw new Error(`Failed to update preferences: ${error.message}`)
    }
  }

  // Get or create default preferences
  static async getOrCreateDefaults(): Promise<UserPreferences> {
    try {
      const data = await apiClient.getOrCreateDefaults()
      return data as UserPreferences
    } catch (error) {
      throw new Error(`Failed to get or create default preferences: ${error.message}`)
    }
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