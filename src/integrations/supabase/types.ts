export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string
          id: number
          name: string
          phase_id: number
          popularity_count: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon: string
          id?: never
          name: string
          phase_id: number
          popularity_count?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: never
          name?: string
          phase_id?: number
          popularity_count?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplines: {
        Row: {
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          stage_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          stage_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          stage_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disciplines_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplines_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_messages: {
        Row: {
          created_at: string
          id: string
          lead_id: string
          message: string
          sender_role: string
          sender_user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id: string
          message: string
          sender_role: string
          sender_user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string
          message?: string
          sender_role?: string
          sender_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          closed_at: string | null
          contacted_at: string | null
          created_at: string
          estimated_budget: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          message: string
          provider_id: string
          provider_last_read_at: string | null
          provider_reply: string | null
          requested_discipline_id: number | null
          requested_service_id: number | null
          requested_stage_id: number | null
          requested_work_type_id: number | null
          requester_archived_at: string | null
          requester_cancelled_at: string | null
          requester_contact: string | null
          requester_last_read_at: string | null
          requester_name: string | null
          requester_state: string
          requester_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          contacted_at?: string | null
          created_at?: string
          estimated_budget?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          message: string
          provider_id: string
          provider_last_read_at?: string | null
          provider_reply?: string | null
          requested_discipline_id?: number | null
          requested_service_id?: number | null
          requested_stage_id?: number | null
          requested_work_type_id?: number | null
          requester_archived_at?: string | null
          requester_cancelled_at?: string | null
          requester_contact?: string | null
          requester_last_read_at?: string | null
          requester_name?: string | null
          requester_state?: string
          requester_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          contacted_at?: string | null
          created_at?: string
          estimated_budget?: string | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          message?: string
          provider_id?: string
          provider_last_read_at?: string | null
          provider_reply?: string | null
          requested_discipline_id?: number | null
          requested_service_id?: number | null
          requested_stage_id?: number | null
          requested_work_type_id?: number | null
          requester_archived_at?: string | null
          requester_cancelled_at?: string | null
          requester_contact?: string | null
          requester_last_read_at?: string | null
          requester_name?: string | null
          requester_state?: string
          requester_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_trust_signals"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "leads_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_requested_discipline_id_fkey"
            columns: ["requested_discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_requested_service_id_fkey"
            columns: ["requested_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_requested_stage_id_fkey"
            columns: ["requested_stage_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_requested_stage_id_fkey"
            columns: ["requested_stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_requested_work_type_id_fkey"
            columns: ["requested_work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_category_mappings: {
        Row: {
          ambiguity_reason: string | null
          confidence: number
          created_at: string
          discipline_id: number
          id: number
          is_ambiguous: boolean
          legacy_category_slug: string
          legacy_phase_id: number | null
          mapping_source: string
          notes: string | null
          service_id: number
          updated_at: string
          work_type_id: number | null
        }
        Insert: {
          ambiguity_reason?: string | null
          confidence?: number
          created_at?: string
          discipline_id: number
          id?: never
          is_ambiguous?: boolean
          legacy_category_slug: string
          legacy_phase_id?: number | null
          mapping_source?: string
          notes?: string | null
          service_id: number
          updated_at?: string
          work_type_id?: number | null
        }
        Update: {
          ambiguity_reason?: string | null
          confidence?: number
          created_at?: string
          discipline_id?: number
          id?: never
          is_ambiguous?: boolean
          legacy_category_slug?: string
          legacy_phase_id?: number | null
          mapping_source?: string
          notes?: string | null
          service_id?: number
          updated_at?: string
          work_type_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "legacy_category_mappings_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_category_mappings_legacy_category_slug_fkey"
            columns: ["legacy_category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "legacy_category_mappings_legacy_category_slug_fkey"
            columns: ["legacy_category_slug"]
            isOneToOne: false
            referencedRelation: "legacy_category_mapping_report"
            referencedColumns: ["legacy_category_slug"]
          },
          {
            foreignKeyName: "legacy_category_mappings_legacy_phase_id_fkey"
            columns: ["legacy_phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_category_mappings_legacy_phase_id_fkey"
            columns: ["legacy_phase_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_category_mappings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legacy_category_mappings_work_type_id_fkey"
            columns: ["work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          bulk_price: number | null
          bulk_unit: string | null
          category: string
          created_at: string
          delivery: boolean
          description: string
          id: string
          location: string
          name: string
          price: number
          supplier: string
          unit: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          bulk_price?: number | null
          bulk_unit?: string | null
          category: string
          created_at?: string
          delivery?: boolean
          description: string
          id?: string
          location: string
          name: string
          price: number
          supplier: string
          unit: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          bulk_price?: number | null
          bulk_unit?: string | null
          category?: string
          created_at?: string
          delivery?: boolean
          description?: string
          id?: string
          location?: string
          name?: string
          price?: number
          supplier?: string
          unit?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          bucket_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          object_path: string
          owner_user_id: string
          public_url: string | null
          updated_at: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          object_path: string
          owner_user_id: string
          public_url?: string | null
          updated_at?: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          object_path?: string
          owner_user_id?: string
          public_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          lead_id: string | null
          metadata: Json
          read_at: string | null
          recipient_user_id: string
          title: string
          type: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json
          read_at?: string | null
          recipient_user_id: string
          title: string
          type: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          metadata?: Json
          read_at?: string | null
          recipient_user_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      outbound_messages: {
        Row: {
          attempts: number
          body: string
          channel: string
          created_at: string
          id: string
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          notification_id: string
          payload: Json
          recipient: string
          recipient_user_id: string
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          attempts?: number
          body: string
          channel: string
          created_at?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          notification_id: string
          payload?: Json
          recipient: string
          recipient_user_id: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          attempts?: number
          body?: string
          channel?: string
          created_at?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_attempt_at?: string
          notification_id?: string
          payload?: Json
          recipient?: string
          recipient_user_id?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outbound_messages_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
            referencedColumns: ["id"]
          },
        ]
      }
      phases: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: never
          name: string
          slug: string
          sort_order: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: never
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          budget_range: string | null
          completed_on: string | null
          cover_media_asset_id: string | null
          created_at: string
          discipline_id: number | null
          id: string
          is_featured: boolean
          location: string | null
          primary_service_id: number | null
          primary_work_type_id: number | null
          provider_id: string
          stage_id: number | null
          started_on: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_range?: string | null
          completed_on?: string | null
          cover_media_asset_id?: string | null
          created_at?: string
          discipline_id?: number | null
          id?: string
          is_featured?: boolean
          location?: string | null
          primary_service_id?: number | null
          primary_work_type_id?: number | null
          provider_id: string
          stage_id?: number | null
          started_on?: string | null
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_range?: string | null
          completed_on?: string | null
          cover_media_asset_id?: string | null
          created_at?: string
          discipline_id?: number | null
          id?: string
          is_featured?: boolean
          location?: string | null
          primary_service_id?: number | null
          primary_work_type_id?: number | null
          provider_id?: string
          stage_id?: number | null
          started_on?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_projects_cover_media_asset_id_fkey"
            columns: ["cover_media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_primary_service_id_fkey"
            columns: ["primary_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_primary_work_type_id_fkey"
            columns: ["primary_work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_trust_signals"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "portfolio_projects_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_projects_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      project_phases: {
        Row: {
          created_at: string
          id: number
          phase_id: number
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          phase_id: number
          project_id: string
        }
        Update: {
          created_at?: string
          id?: never
          phase_id?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_phases_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_phases_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          current_phase: number | null
          id: string
          name: string
          project_type: string
          updated_at: string
          work_type_id: number | null
        }
        Insert: {
          created_at?: string
          current_phase?: number | null
          id?: string
          name: string
          project_type: string
          updated_at?: string
          work_type_id?: number | null
        }
        Update: {
          created_at?: string
          current_phase?: number | null
          id?: string
          name?: string
          project_type?: string
          updated_at?: string
          work_type_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_current_phase_fkey"
            columns: ["current_phase"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_current_phase_fkey"
            columns: ["current_phase"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_work_type_id_fkey"
            columns: ["work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_plans: {
        Row: {
          code: string
          created_at: string
          featured_slots: number
          monthly_lead_quota: number | null
          name: string
          price_dop: number
          price_usd: number
          priority_support: boolean
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          featured_slots?: number
          monthly_lead_quota?: number | null
          name: string
          price_dop?: number
          price_usd?: number
          priority_support?: boolean
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          featured_slots?: number
          monthly_lead_quota?: number | null
          name?: string
          price_dop?: number
          price_usd?: number
          priority_support?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      provider_services: {
        Row: {
          created_at: string
          id: number
          is_primary: boolean
          min_price: number | null
          provider_id: string
          service_id: number
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          id?: never
          is_primary?: boolean
          min_price?: number | null
          provider_id: string
          service_id: number
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          id?: never
          is_primary?: boolean
          min_price?: number | null
          provider_id?: string
          service_id?: number
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_trust_signals"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: number
          plan_code: string
          provider_user_id: string
          starts_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: never
          plan_code: string
          provider_user_id: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: never
          plan_code?: string
          provider_user_id?: string
          starts_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_subscriptions_plan_code_fkey"
            columns: ["plan_code"]
            isOneToOne: false
            referencedRelation: "provider_plans"
            referencedColumns: ["code"]
          },
        ]
      }
      provider_verifications: {
        Row: {
          created_at: string
          evidence_media_asset_id: string | null
          expires_at: string | null
          id: string
          metadata: Json
          notes: string | null
          provider_id: string
          status: string
          updated_at: string
          verification_type: string
          verified_at: string | null
          verified_by_user_id: string | null
        }
        Insert: {
          created_at?: string
          evidence_media_asset_id?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          provider_id: string
          status?: string
          updated_at?: string
          verification_type: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Update: {
          created_at?: string
          evidence_media_asset_id?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json
          notes?: string | null
          provider_id?: string
          status?: string
          updated_at?: string
          verification_type?: string
          verified_at?: string | null
          verified_by_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_verifications_evidence_media_asset_id_fkey"
            columns: ["evidence_media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_verifications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_trust_signals"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_verifications_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_work_types: {
        Row: {
          created_at: string
          id: number
          provider_id: string
          work_type_id: number
        }
        Insert: {
          created_at?: string
          id?: never
          provider_id: string
          work_type_id: number
        }
        Update: {
          created_at?: string
          id?: never
          provider_id?: string
          work_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "provider_work_types_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_trust_signals"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "provider_work_types_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_work_types_work_type_id_fkey"
            columns: ["work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          category_slug: string
          city: string
          completed_projects: number
          created_at: string
          description: string
          id: string
          is_featured: boolean
          location: string
          name: string
          owner_user_id: string | null
          phase_id: number
          portfolio_images: string[]
          primary_discipline_id: number | null
          primary_service_id: number | null
          rating: number
          review_count: number
          service_areas: string[]
          starting_price: number | null
          trade: string
          updated_at: string
          verified: boolean
          whatsapp: string
          years_experience: number
        }
        Insert: {
          category_slug: string
          city: string
          completed_projects?: number
          created_at?: string
          description: string
          id?: string
          is_featured?: boolean
          location: string
          name: string
          owner_user_id?: string | null
          phase_id: number
          portfolio_images?: string[]
          primary_discipline_id?: number | null
          primary_service_id?: number | null
          rating?: number
          review_count?: number
          service_areas?: string[]
          starting_price?: number | null
          trade: string
          updated_at?: string
          verified?: boolean
          whatsapp: string
          years_experience?: number
        }
        Update: {
          category_slug?: string
          city?: string
          completed_projects?: number
          created_at?: string
          description?: string
          id?: string
          is_featured?: boolean
          location?: string
          name?: string
          owner_user_id?: string | null
          phase_id?: number
          portfolio_images?: string[]
          primary_discipline_id?: number | null
          primary_service_id?: number | null
          rating?: number
          review_count?: number
          service_areas?: string[]
          starting_price?: number | null
          trade?: string
          updated_at?: string
          verified?: boolean
          whatsapp?: string
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "providers_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "providers_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "legacy_category_mapping_report"
            referencedColumns: ["legacy_category_slug"]
          },
          {
            foreignKeyName: "providers_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_primary_discipline_id_fkey"
            columns: ["primary_discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "providers_primary_service_id_fkey"
            columns: ["primary_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_providers: {
        Row: {
          created_at: string
          id: number
          is_shortlisted: boolean
          note: string | null
          provider_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          is_shortlisted?: boolean
          note?: string | null
          provider_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          is_shortlisted?: boolean
          note?: string | null
          provider_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "provider_trust_signals"
            referencedColumns: ["provider_id"]
          },
          {
            foreignKeyName: "saved_providers_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_posts: {
        Row: {
          created_at: string
          description: string
          estimated_budget: string | null
          id: string
          location: string
          post_type: string
          requested_discipline_id: number | null
          requested_service_id: number | null
          requested_stage_id: number | null
          requested_work_type_id: number | null
          status: string
          title: string
          updated_at: string
          whatsapp: string
        }
        Insert: {
          created_at?: string
          description: string
          estimated_budget?: string | null
          id?: string
          location: string
          post_type: string
          requested_discipline_id?: number | null
          requested_service_id?: number | null
          requested_stage_id?: number | null
          requested_work_type_id?: number | null
          status?: string
          title: string
          updated_at?: string
          whatsapp: string
        }
        Update: {
          created_at?: string
          description?: string
          estimated_budget?: string | null
          id?: string
          location?: string
          post_type?: string
          requested_discipline_id?: number | null
          requested_service_id?: number | null
          requested_stage_id?: number | null
          requested_work_type_id?: number | null
          status?: string
          title?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_posts_requested_discipline_id_fkey"
            columns: ["requested_discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_posts_requested_service_id_fkey"
            columns: ["requested_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_posts_requested_stage_id_fkey"
            columns: ["requested_stage_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_posts_requested_stage_id_fkey"
            columns: ["requested_stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_posts_requested_work_type_id_fkey"
            columns: ["requested_work_type_id"]
            isOneToOne: false
            referencedRelation: "work_types"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          discipline_id: number
          id: number
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          stage_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discipline_id: number
          id?: never
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          stage_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discipline_id?: number
          id?: never
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          stage_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_discipline_id_fkey"
            columns: ["discipline_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_discipline_stage_fkey"
            columns: ["discipline_id", "stage_id"]
            isOneToOne: false
            referencedRelation: "disciplines"
            referencedColumns: ["id", "stage_id"]
          },
          {
            foreignKeyName: "services_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          notification_email_enabled: boolean
          notification_whatsapp_enabled: boolean
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          notification_email_enabled?: boolean
          notification_whatsapp_enabled?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          notification_email_enabled?: boolean
          notification_whatsapp_enabled?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      work_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: number
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: never
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      legacy_category_mapping_report: {
        Row: {
          legacy_category_name: string | null
          legacy_category_slug: string | null
          mapping_count: number | null
          mapping_status: string | null
          max_confidence: number | null
          phase_id: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "project_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_category_mapping_summary: {
        Row: {
          category_count: number | null
          mapping_status: string | null
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          created_at: string | null
          description: string | null
          id: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number | null
          name?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_trust_signals: {
        Row: {
          active_this_month: boolean | null
          identity_confirmed: boolean | null
          portfolio_validated: boolean | null
          project_registered: boolean | null
          provider_id: string | null
          provider_verified: boolean | null
          rapid_response: boolean | null
        }
        Relationships: []
      }
    }
    Functions: {
      complete_outbound_message: {
        Args: {
          p_error?: string
          p_id: string
          p_retry_after_seconds?: number
          p_success: boolean
        }
        Returns: undefined
      }
      dequeue_outbound_messages: {
        Args: { max_items?: number }
        Returns: {
          attempts: number
          body: string
          channel: string
          created_at: string
          id: string
          last_error: string | null
          max_attempts: number
          next_attempt_at: string
          notification_id: string
          payload: Json
          recipient: string
          recipient_user_id: string
          sent_at: string | null
          status: string
          subject: string | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "outbound_messages"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_my_provider_plan_snapshot: {
        Args: never
        Returns: {
          is_quota_unlimited: boolean
          leads_remaining_this_month: number
          leads_used_this_month: number
          monthly_lead_quota: number
          period_end: string
          period_start: string
          plan_code: string
          plan_name: string
          status: string
        }[]
      }
      mark_my_lead_thread_read: {
        Args: { p_lead_id: string }
        Returns: undefined
      }
      send_lead_message: {
        Args: { p_lead_id: string; p_message: string }
        Returns: {
          created_at: string
          id: string
          lead_id: string
          message: string
          sender_role: string
          sender_user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "lead_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_my_lead_state: {
        Args: { p_lead_id: string; p_requester_state: string }
        Returns: {
          closed_at: string | null
          contacted_at: string | null
          created_at: string
          estimated_budget: string | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          message: string
          provider_id: string
          provider_last_read_at: string | null
          provider_reply: string | null
          requested_discipline_id: number | null
          requested_service_id: number | null
          requested_stage_id: number | null
          requested_work_type_id: number | null
          requester_archived_at: string | null
          requester_cancelled_at: string | null
          requester_contact: string | null
          requester_last_read_at: string | null
          requester_name: string | null
          requester_state: string
          requester_user_id: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "leads"
          isOneToOne: true
          isSetofReturn: false
        }
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
