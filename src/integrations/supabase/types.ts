export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      jobs: {
        Row: {
          ai_notes: string | null
          ai_rating: number | null
          company: string
          created_at: string
          date_posted: string | null
          date_processed: string | null
          description: string | null
          id: string
          job_url: string | null
          location: string | null
          requirements: string | null
          salary_range: string | null
          source: string | null
          status: string | null
          title: string
          updated_at: string
          user_id: string | null
          
          // Algorithm enhancement fields
          unique_id: string | null
          rating: string | null
          reasoning: string | null
          top_matches: Json | null
          detailed_analysis: Json | null
          emailed: boolean
          processing_error: string | null
          published_date: string | null
        }
        Insert: {
          ai_notes?: string | null
          ai_rating?: number | null
          company: string
          created_at?: string
          date_posted?: string | null
          date_processed?: string | null
          description?: string | null
          id?: string
          job_url?: string | null
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          source?: string | null
          status?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
          
          // Algorithm enhancement fields
          unique_id?: string | null
          rating?: string | null
          reasoning?: string | null
          top_matches?: Json | null
          detailed_analysis?: Json | null
          emailed?: boolean
          processing_error?: string | null
          published_date?: string | null
        }
        Update: {
          ai_notes?: string | null
          ai_rating?: number | null
          company?: string
          created_at?: string
          date_posted?: string | null
          date_processed?: string | null
          description?: string | null
          id?: string
          job_url?: string | null
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          source?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          
          // Algorithm enhancement fields
          unique_id?: string | null
          rating?: string | null
          reasoning?: string | null
          top_matches?: Json | null
          detailed_analysis?: Json | null
          emailed?: boolean
          processing_error?: string | null
          published_date?: string | null
        }
        Relationships: []
      }
      preferences: {
        Row: {
          id: string
          user_id: string | null
          preferred_locations: string[] | null
          work_mode: string[] | null
          travel_willingness: string | null
          salary_range: string | null
          career_level: string[] | null
          tech_stack: string[] | null
          company_size: string[] | null
          ollama_endpoint: string | null
          ollama_model: string | null
          advanced_ai_model: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          preferred_locations?: string[] | null
          work_mode?: string[] | null
          travel_willingness?: string | null
          salary_range?: string | null
          career_level?: string[] | null
          tech_stack?: string[] | null
          company_size?: string[] | null
          ollama_endpoint?: string | null
          ollama_model?: string | null
          advanced_ai_model?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          preferred_locations?: string[] | null
          work_mode?: string[] | null
          travel_willingness?: string | null
          salary_range?: string | null
          career_level?: string[] | null
          tech_stack?: string[] | null
          company_size?: string[] | null
          ollama_endpoint?: string | null
          ollama_model?: string | null
          advanced_ai_model?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      processing_stats: {
        Row: {
          id: string
          run_date: string | null
          total_jobs_processed: number | null
          jobs_approved: number | null
          jobs_filtered: number | null
          jobs_emailed: number | null
          processing_time_seconds: number | null
          errors_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          run_date?: string | null
          total_jobs_processed?: number | null
          jobs_approved?: number | null
          jobs_filtered?: number | null
          jobs_emailed?: number | null
          processing_time_seconds?: number | null
          errors_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          run_date?: string | null
          total_jobs_processed?: number | null
          jobs_approved?: number | null
          jobs_filtered?: number | null
          jobs_emailed?: number | null
          processing_time_seconds?: number | null
          errors_count?: number | null
          created_at?: string
        }
        Relationships: []
      }
      rss_feeds: {
        Row: {
          id: string
          url: string
          name: string
          active: boolean | null
          last_processed: string | null
          processing_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          name: string
          active?: boolean | null
          last_processed?: string | null
          processing_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          name?: string
          active?: boolean | null
          last_processed?: string | null
          processing_error?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
