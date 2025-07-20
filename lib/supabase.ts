import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      tickets: {
        Row: {
          id: string
          ticket_number: string
          reporter_name: string
          reporter_email: string
          reporter_phone: string | null
          category: string
          priority: string
          status: string
          subject: string
          description: string
          project_id: string | null
          assigned_to: string | null
          sla_deadline: string
          resolved_at: string | null
          closed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_number: string
          reporter_name: string
          reporter_email: string
          reporter_phone?: string | null
          category: string
          priority: string
          status?: string
          subject: string
          description: string
          project_id?: string | null
          assigned_to?: string | null
          sla_deadline: string
          resolved_at?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_number?: string
          reporter_name?: string
          reporter_email?: string
          reporter_phone?: string | null
          category?: string
          priority?: string
          status?: string
          subject?: string
          description?: string
          project_id?: string | null
          assigned_to?: string | null
          sla_deadline?: string
          resolved_at?: string | null
          closed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_attachments: {
        Row: {
          id: string
          ticket_id: string
          filename: string
          url: string
          size: number
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          filename: string
          url: string
          size: number
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          filename?: string
          url?: string
          size?: number
          type?: string
          created_at?: string
        }
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          user_name: string
          content: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          user_name: string
          content: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          user_name?: string
          content?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ticket_change_logs: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          user_name: string
          action: string
          old_value: string | null
          new_value: string | null
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          user_name: string
          action: string
          old_value?: string | null
          new_value?: string | null
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          user_name?: string
          action?: string
          old_value?: string | null
          new_value?: string | null
          description?: string
          created_at?: string
        }
      }
      ticket_feedback: {
        Row: {
          id: string
          ticket_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
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
  }
}
