export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4";
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          icon: string;
          id: number;
          name: string;
          phase_id: number;
          popularity_count: number;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          icon: string;
          id?: never;
          name: string;
          phase_id: number;
          popularity_count?: number;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          icon?: string;
          id?: never;
          name?: string;
          phase_id?: number;
          popularity_count?: number;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_phase_id_fkey";
            columns: ["phase_id"];
            isOneToOne: false;
            referencedRelation: "phases";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          closed_at: string | null;
          contacted_at: string | null;
          created_at: string;
          estimated_budget: string | null;
          id: string;
          message: string;
          provider_id: string;
          provider_reply: string | null;
          requester_contact: string | null;
          requester_name: string | null;
          requester_user_id: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          closed_at?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          estimated_budget?: string | null;
          id?: string;
          message: string;
          provider_id: string;
          provider_reply?: string | null;
          requester_contact?: string | null;
          requester_name?: string | null;
          requester_user_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          closed_at?: string | null;
          contacted_at?: string | null;
          created_at?: string;
          estimated_budget?: string | null;
          id?: string;
          message?: string;
          provider_id?: string;
          provider_reply?: string | null;
          requester_contact?: string | null;
          requester_name?: string | null;
          requester_user_id?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "providers";
            referencedColumns: ["id"];
          },
        ];
      };
      materials: {
        Row: {
          bulk_price: number | null;
          bulk_unit: string | null;
          category: string;
          created_at: string;
          delivery: boolean;
          description: string;
          id: string;
          location: string;
          name: string;
          price: number;
          supplier: string;
          unit: string;
          updated_at: string;
          whatsapp: string;
        };
        Insert: {
          bulk_price?: number | null;
          bulk_unit?: string | null;
          category: string;
          created_at?: string;
          delivery?: boolean;
          description: string;
          id?: string;
          location: string;
          name: string;
          price: number;
          supplier: string;
          unit: string;
          updated_at?: string;
          whatsapp: string;
        };
        Update: {
          bulk_price?: number | null;
          bulk_unit?: string | null;
          category?: string;
          created_at?: string;
          delivery?: boolean;
          description?: string;
          id?: string;
          location?: string;
          name?: string;
          price?: number;
          supplier?: string;
          unit?: string;
          updated_at?: string;
          whatsapp?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          lead_id: string | null;
          metadata: Json;
          read_at: string | null;
          recipient_user_id: string;
          title: string;
          type: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          metadata?: Json;
          read_at?: string | null;
          recipient_user_id: string;
          title: string;
          type: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          metadata?: Json;
          read_at?: string | null;
          recipient_user_id?: string;
          title?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      outbound_messages: {
        Row: {
          attempts: number;
          body: string;
          channel: string;
          created_at: string;
          id: string;
          last_error: string | null;
          max_attempts: number;
          next_attempt_at: string;
          notification_id: string;
          payload: Json;
          recipient: string;
          recipient_user_id: string;
          sent_at: string | null;
          status: string;
          subject: string | null;
          updated_at: string;
        };
        Insert: {
          attempts?: number;
          body: string;
          channel: string;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          max_attempts?: number;
          next_attempt_at?: string;
          notification_id: string;
          payload?: Json;
          recipient: string;
          recipient_user_id: string;
          sent_at?: string | null;
          status?: string;
          subject?: string | null;
          updated_at?: string;
        };
        Update: {
          attempts?: number;
          body?: string;
          channel?: string;
          created_at?: string;
          id?: string;
          last_error?: string | null;
          max_attempts?: number;
          next_attempt_at?: string;
          notification_id?: string;
          payload?: Json;
          recipient?: string;
          recipient_user_id?: string;
          sent_at?: string | null;
          status?: string;
          subject?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "outbound_messages_notification_id_fkey";
            columns: ["notification_id"];
            isOneToOne: false;
            referencedRelation: "notifications";
            referencedColumns: ["id"];
          },
        ];
      };
      phases: {
        Row: {
          created_at: string;
          description: string;
          id: number;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: never;
          name: string;
          slug: string;
          sort_order: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: never;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_phases: {
        Row: {
          created_at: string;
          id: number;
          phase_id: number;
          project_id: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          phase_id: number;
          project_id: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          phase_id?: number;
          project_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_phases_phase_id_fkey";
            columns: ["phase_id"];
            isOneToOne: false;
            referencedRelation: "phases";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_phases_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_providers: {
        Row: {
          created_at: string;
          id: number;
          is_shortlisted: boolean;
          note: string | null;
          provider_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: never;
          is_shortlisted?: boolean;
          note?: string | null;
          provider_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: never;
          is_shortlisted?: boolean;
          note?: string | null;
          provider_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_providers_provider_id_fkey";
            columns: ["provider_id"];
            isOneToOne: false;
            referencedRelation: "providers";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string;
          current_phase: number | null;
          id: string;
          name: string;
          project_type: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          current_phase?: number | null;
          id?: string;
          name: string;
          project_type: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          current_phase?: number | null;
          id?: string;
          name?: string;
          project_type?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_current_phase_fkey";
            columns: ["current_phase"];
            isOneToOne: false;
            referencedRelation: "phases";
            referencedColumns: ["id"];
          },
        ];
      };
      providers: {
        Row: {
          category_slug: string;
          city: string;
          completed_projects: number;
          created_at: string;
          description: string;
          id: string;
          location: string;
          name: string;
          owner_user_id: string | null;
          phase_id: number;
          portfolio_images: string[];
          rating: number;
          review_count: number;
          service_areas: string[];
          starting_price: number | null;
          trade: string;
          updated_at: string;
          verified: boolean;
          whatsapp: string;
          years_experience: number;
        };
        Insert: {
          category_slug: string;
          city: string;
          completed_projects?: number;
          created_at?: string;
          description: string;
          id?: string;
          location: string;
          name: string;
          owner_user_id?: string | null;
          phase_id: number;
          portfolio_images?: string[];
          rating?: number;
          review_count?: number;
          service_areas?: string[];
          starting_price?: number | null;
          trade: string;
          updated_at?: string;
          verified?: boolean;
          whatsapp: string;
          years_experience?: number;
        };
        Update: {
          category_slug?: string;
          city?: string;
          completed_projects?: number;
          created_at?: string;
          description?: string;
          id?: string;
          location?: string;
          name?: string;
          owner_user_id?: string | null;
          phase_id?: number;
          portfolio_images?: string[];
          rating?: number;
          review_count?: number;
          service_areas?: string[];
          starting_price?: number | null;
          trade?: string;
          updated_at?: string;
          verified?: boolean;
          whatsapp?: string;
          years_experience?: number;
        };
        Relationships: [
            {
              foreignKeyName: "providers_phase_id_fkey";
              columns: ["phase_id"];
              isOneToOne: false;
              referencedRelation: "phases";
              referencedColumns: ["id"];
            },
            {
              foreignKeyName: "providers_owner_user_id_fkey";
              columns: ["owner_user_id"];
              isOneToOne: false;
              referencedRelation: "user_profiles";
              referencedColumns: ["user_id"];
            },
          ];
        };
      user_profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          notification_email_enabled: boolean;
          notification_whatsapp_enabled: boolean;
          phone: string | null;
          role: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          notification_email_enabled?: boolean;
          notification_whatsapp_enabled?: boolean;
          phone?: string | null;
          role?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          notification_email_enabled?: boolean;
          notification_whatsapp_enabled?: boolean;
          phone?: string | null;
          role?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
        service_posts: {
        Row: {
          created_at: string;
          description: string;
          estimated_budget: string | null;
          id: string;
          location: string;
          post_type: string;
          status: string;
          title: string;
          updated_at: string;
          whatsapp: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          estimated_budget?: string | null;
          id?: string;
          location: string;
          post_type: string;
          status?: string;
          title: string;
          updated_at?: string;
          whatsapp: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          estimated_budget?: string | null;
          id?: string;
          location?: string;
          post_type?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          whatsapp?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
