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
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Insert: {
          created_at?: string
          current_phase?: number | null
          id?: string
          name: string
          project_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_phase?: number | null
          id?: string
          name?: string
          project_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_current_phase_fkey"
            columns: ["current_phase"]
            isOneToOne: false
            referencedRelation: "phases"
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
            foreignKeyName: "providers_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
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
          status?: string
          title?: string
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
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
