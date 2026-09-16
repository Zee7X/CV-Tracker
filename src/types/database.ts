export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offering'
  | 'accepted'
  | 'rejected'

export type CVTemplate = 'ats' | 'professional' | 'modern'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cvs: {
        Row: {
          id: string
          user_id: string
          name: string
          template: CVTemplate
          personal_info: Json
          summary: string | null
          skills: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          template?: CVTemplate
          personal_info?: Json
          summary?: string | null
          skills?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          template?: CVTemplate
          personal_info?: Json
          summary?: string | null
          skills?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cv_experiences: {
        Row: {
          id: string
          cv_id: string
          company: string
          position: string
          location: string | null
          start_date: string
          end_date: string | null
          is_current: boolean
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          company: string
          position: string
          location?: string | null
          start_date: string
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          company?: string
          position?: string
          location?: string | null
          start_date?: string
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cv_educations: {
        Row: {
          id: string
          cv_id: string
          institution: string
          degree: string | null
          field_of_study: string | null
          start_date: string | null
          end_date: string | null
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          institution: string
          degree?: string | null
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          institution?: string
          degree?: string | null
          field_of_study?: string | null
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cv_projects: {
        Row: {
          id: string
          cv_id: string
          name: string
          description: string | null
          project_url: string | null
          start_date: string | null
          end_date: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          name: string
          description?: string | null
          project_url?: string | null
          start_date?: string | null
          end_date?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          name?: string
          description?: string | null
          project_url?: string | null
          start_date?: string | null
          end_date?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      cv_certifications: {
        Row: {
          id: string
          cv_id: string
          name: string
          issuer: string | null
          issue_date: string | null
          credential_url: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cv_id: string
          name: string
          issuer?: string | null
          issue_date?: string | null
          credential_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cv_id?: string
          name?: string
          issuer?: string | null
          issue_date?: string | null
          credential_url?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          id: string
          user_id: string
          cv_id: string | null
          company_name: string
          position: string
          applied_date: string
          status: ApplicationStatus
          job_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cv_id?: string | null
          company_name: string
          position: string
          applied_date: string
          status?: ApplicationStatus
          job_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cv_id?: string | null
          company_name?: string
          position?: string
          applied_date?: string
          status?: ApplicationStatus
          job_url?: string | null
          notes?: string | null
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
      create_cv_with_relations: {
        Args: {
          p_name: string
          p_template: string
          p_personal_info: Json
          p_summary: string | null
          p_skills: Json
          p_experiences: Json
          p_educations: Json
          p_projects: Json
          p_certifications: Json
        }
        Returns: string
      }
      update_cv_with_relations: {
        Args: {
          p_cv_id: string
          p_name: string
          p_template: string
          p_personal_info: Json
          p_summary: string | null
          p_skills: Json
          p_experiences: Json
          p_educations: Json
          p_projects: Json
          p_certifications: Json
        }
        Returns: string
      }
      duplicate_cv_with_relations: {
        Args: { p_source_cv_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
