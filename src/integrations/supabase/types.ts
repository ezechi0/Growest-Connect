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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_matches: {
        Row: {
          created_at: string
          id: string
          match_reasons: Json
          match_score: number
          preferences_used: Json | null
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_reasons?: Json
          match_score?: number
          preferences_used?: Json | null
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_reasons?: Json
          match_score?: number
          preferences_used?: Json | null
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      connection_requests: {
        Row: {
          created_at: string
          entrepreneur_id: string
          id: string
          investor_id: string
          message: string | null
          project_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entrepreneur_id: string
          id?: string
          investor_id: string
          message?: string | null
          project_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entrepreneur_id?: string
          id?: string
          investor_id?: string
          message?: string | null
          project_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          entrepreneur_id: string
          id: string
          investor_id: string
          last_message_at: string | null
          project_id: string
        }
        Insert: {
          created_at?: string | null
          entrepreneur_id: string
          id?: string
          investor_id: string
          last_message_at?: string | null
          project_id: string
        }
        Update: {
          created_at?: string | null
          entrepreneur_id?: string
          id?: string
          investor_id?: string
          last_message_at?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          created_at: string | null
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          bank_details: Json | null
          created_at: string | null
          currency: string | null
          entrepreneur_id: string
          id: string
          notes: string | null
          payout_method: string | null
          payout_reference: string | null
          processed_at: string | null
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          bank_details?: Json | null
          created_at?: string | null
          currency?: string | null
          entrepreneur_id: string
          id?: string
          notes?: string | null
          payout_method?: string | null
          payout_reference?: string | null
          processed_at?: string | null
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          bank_details?: Json | null
          created_at?: string | null
          currency?: string | null
          entrepreneur_id?: string
          id?: string
          notes?: string | null
          payout_method?: string | null
          payout_reference?: string | null
          processed_at?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          full_name: string
          id: string
          is_public: boolean | null
          is_verified: boolean | null
          kyc_document_url: string | null
          kyc_rejected_reason: string | null
          kyc_status: string | null
          kyc_verified_at: string | null
          location: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          user_type: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          full_name: string
          id: string
          is_public?: boolean | null
          is_verified?: boolean | null
          kyc_document_url?: string | null
          kyc_rejected_reason?: string | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          location?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_type: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          is_public?: boolean | null
          is_verified?: boolean | null
          kyc_document_url?: string | null
          kyc_rejected_reason?: string | null
          kyc_status?: string | null
          kyc_verified_at?: string | null
          location?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_type?: string
          website?: string | null
        }
        Relationships: []
      }
      project_favorites: {
        Row: {
          created_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_favorites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_interests: {
        Row: {
          created_at: string | null
          id: string
          interest_level: string | null
          investment_amount: number | null
          investor_id: string
          message: string | null
          project_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interest_level?: string | null
          investment_amount?: number | null
          investor_id: string
          message?: string | null
          project_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interest_level?: string | null
          investment_amount?: number | null
          investor_id?: string
          message?: string | null
          project_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_interests_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          admin_notes: string | null
          approval_date: string | null
          business_model: string | null
          close_date: string | null
          created_at: string | null
          current_funding: number | null
          description: string
          documents: Json | null
          end_date: string | null
          expected_roi: number | null
          funding_goal: number
          id: string
          images: Json | null
          launch_date: string | null
          location: string
          max_investment: number | null
          min_investment: number | null
          owner_id: string
          pitch_deck_url: string | null
          rejection_reason: string | null
          revenue_model: string | null
          risk_level: string | null
          sector: string
          stage: string | null
          start_date: string | null
          status: string | null
          submission_date: string | null
          tags: string[] | null
          target_market: string | null
          team_size: number | null
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          approval_date?: string | null
          business_model?: string | null
          close_date?: string | null
          created_at?: string | null
          current_funding?: number | null
          description: string
          documents?: Json | null
          end_date?: string | null
          expected_roi?: number | null
          funding_goal: number
          id?: string
          images?: Json | null
          launch_date?: string | null
          location: string
          max_investment?: number | null
          min_investment?: number | null
          owner_id: string
          pitch_deck_url?: string | null
          rejection_reason?: string | null
          revenue_model?: string | null
          risk_level?: string | null
          sector: string
          stage?: string | null
          start_date?: string | null
          status?: string | null
          submission_date?: string | null
          tags?: string[] | null
          target_market?: string | null
          team_size?: number | null
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          approval_date?: string | null
          business_model?: string | null
          close_date?: string | null
          created_at?: string | null
          current_funding?: number | null
          description?: string
          documents?: Json | null
          end_date?: string | null
          expected_roi?: number | null
          funding_goal?: number
          id?: string
          images?: Json | null
          launch_date?: string | null
          location?: string
          max_investment?: number | null
          min_investment?: number | null
          owner_id?: string
          pitch_deck_url?: string | null
          rejection_reason?: string | null
          revenue_model?: string | null
          risk_level?: string | null
          sector?: string
          stage?: string | null
          start_date?: string | null
          status?: string | null
          submission_date?: string | null
          tags?: string[] | null
          target_market?: string | null
          team_size?: number | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          features: Json | null
          id: string
          interval_type: string
          is_active: boolean | null
          name: string
          plan_id: string
          price: number
          target_role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_type?: string
          is_active?: boolean | null
          name: string
          plan_id: string
          price: number
          target_role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval_type?: string
          is_active?: boolean | null
          name?: string
          plan_id?: string
          price?: number
          target_role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          end_date: string | null
          id: string
          paystack_customer_code: string | null
          paystack_subscription_code: string | null
          plan_type: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan_type: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          end_date?: string | null
          id?: string
          paystack_customer_code?: string | null
          paystack_subscription_code?: string | null
          plan_type?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          commission_amount: number | null
          created_at: string | null
          currency: string | null
          id: string
          investor_id: string
          net_amount: number | null
          notes: string | null
          payment_method: string | null
          payout_date: string | null
          payout_reference: string | null
          payout_status: string | null
          paystack_reference: string | null
          project_id: string
          receipt_number: string | null
          receipt_url: string | null
          status: string | null
          transaction_type: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          commission_amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          investor_id: string
          net_amount?: number | null
          notes?: string | null
          payment_method?: string | null
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          paystack_reference?: string | null
          project_id: string
          receipt_number?: string | null
          receipt_url?: string | null
          status?: string | null
          transaction_type?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          commission_amount?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          investor_id?: string
          net_amount?: number | null
          notes?: string | null
          payment_method?: string | null
          payout_date?: string | null
          payout_reference?: string | null
          payout_status?: string | null
          paystack_reference?: string | null
          project_id?: string
          receipt_number?: string | null
          receipt_url?: string | null
          status?: string | null
          transaction_type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_commission: {
        Args: { amount: number; commission_rate?: number }
        Returns: number
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_project_interest_stats: {
        Args: { project_uuid: string }
        Returns: {
          avg_investment_amount: number
          interest_breakdown: Json
          total_interests: number
          total_potential_investment: number
        }[]
      }
      get_project_stats: {
        Args: { project_uuid: string }
        Returns: {
          funding_percentage: number
          total_investors: number
        }[]
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
