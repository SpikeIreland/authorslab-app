export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      author_profiles: {
        Row: {
          id: string
          auth_user_id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          genre: string | null
          writing_experience: string | null
          onboarding_complete: boolean
          portal_setup_token: string | null
          token_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          genre?: string | null
          writing_experience?: string | null
          onboarding_complete?: boolean
          portal_setup_token?: string | null
          token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          genre?: string | null
          writing_experience?: string | null
          onboarding_complete?: boolean
          portal_setup_token?: string | null
          token_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export type AuthorProfile = Database['public']['Tables']['author_profiles']['Row']