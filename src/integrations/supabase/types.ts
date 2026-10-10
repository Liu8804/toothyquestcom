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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_name: string
          id: string
          page_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_name: string
          id?: string
          page_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_name?: string
          id?: string
          page_path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string
          emoji: string
          id: string
          name: string
          quest_count_required: number
          xp_required: number
        }
        Insert: {
          created_at?: string
          description: string
          emoji: string
          id?: string
          name: string
          quest_count_required?: number
          xp_required?: number
        }
        Update: {
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          name?: string
          quest_count_required?: number
          xp_required?: number
        }
        Relationships: []
      }
      brushing_sessions: {
        Row: {
          child_id: string
          completed_at: string
          duration_seconds: number
          id: string
          session_type: string
        }
        Insert: {
          child_id: string
          completed_at?: string
          duration_seconds: number
          id?: string
          session_type?: string
        }
        Update: {
          child_id?: string
          completed_at?: string
          duration_seconds?: number
          id?: string
          session_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "brushing_sessions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          avatar_emoji: string | null
          birth_year: number | null
          created_at: string
          id: string
          name: string
          parent_id: string
        }
        Insert: {
          avatar_emoji?: string | null
          birth_year?: number | null
          created_at?: string
          id?: string
          name: string
          parent_id: string
        }
        Update: {
          avatar_emoji?: string | null
          birth_year?: number | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string
        }
        Relationships: []
      }
      code_redemptions: {
        Row: {
          code_id: string
          id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          code_id: string
          id?: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          code_id?: string
          id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_redemptions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "unlock_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenge_progress: {
        Row: {
          challenge_date: string
          challenge_id: string
          child_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          current_count: number
          id: string
        }
        Insert: {
          challenge_date?: string
          challenge_id: string
          child_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_count?: number
          id?: string
        }
        Update: {
          challenge_date?: string
          challenge_id?: string
          child_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          current_count?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_challenge_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          emoji: string
          id: string
          is_active: boolean
          target_count: number
          title: string
          xp_reward: number
        }
        Insert: {
          challenge_type: string
          created_at?: string
          description: string
          emoji?: string
          id?: string
          is_active?: boolean
          target_count?: number
          title: string
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          emoji?: string
          id?: string
          is_active?: boolean
          target_count?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      dental_clinics: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          hours: Json | null
          id: string
          is_active: boolean
          kid_tip: string | null
          logo_url: string | null
          name: string
          phone: string | null
          services: string[] | null
          updated_at: string
          website: string | null
          welcome_message: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          hours?: Json | null
          id?: string
          is_active?: boolean
          kid_tip?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          services?: string[] | null
          updated_at?: string
          website?: string | null
          welcome_message?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          hours?: Json | null
          id?: string
          is_active?: boolean
          kid_tip?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          services?: string[] | null
          updated_at?: string
          website?: string | null
          welcome_message?: string | null
        }
        Relationships: []
      }
      earned_achievements: {
        Row: {
          achievement_id: string
          child_id: string
          earned_at: string
          id: string
        }
        Insert: {
          achievement_id: string
          child_id: string
          earned_at?: string
          id?: string
        }
        Update: {
          achievement_id?: string
          child_id?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earned_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "game_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earned_achievements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      earned_badges: {
        Row: {
          badge_id: string
          child_id: string
          earned_at: string
          id: string
        }
        Insert: {
          badge_id: string
          child_id: string
          earned_at?: string
          id?: string
        }
        Update: {
          badge_id?: string
          child_id?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earned_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earned_badges_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      game_achievements: {
        Row: {
          created_at: string
          description: string
          emoji: string
          game_id: string | null
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string
          description: string
          emoji: string
          game_id?: string | null
          id?: string
          name: string
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          created_at?: string
          description?: string
          emoji?: string
          game_id?: string | null
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      game_scores: {
        Row: {
          child_id: string
          game_id: string
          id: string
          played_at: string
          score: number
          stars_earned: number
        }
        Insert: {
          child_id: string
          game_id: string
          id?: string
          played_at?: string
          score?: number
          stars_earned?: number
        }
        Update: {
          child_id?: string
          game_id?: string
          id?: string
          played_at?: string
          score?: number
          stars_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_scores_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_profiles: {
        Row: {
          child_id: string
          consent_given_at: string | null
          created_at: string
          display_name: string
          id: string
          is_public: boolean
          parent_acknowledged: boolean | null
          updated_at: string
        }
        Insert: {
          child_id: string
          consent_given_at?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_public?: boolean
          parent_acknowledged?: boolean | null
          updated_at?: string
        }
        Update: {
          child_id?: string
          consent_given_at?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_public?: boolean
          parent_acknowledged?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_profiles_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_entitlements: {
        Row: {
          granted_at: string
          granted_via: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_via?: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_via?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          daily_task_reminder: boolean
          daily_task_reminder_time: string
          email_reminders: boolean
          evening_reminder: boolean
          evening_time: string
          id: string
          last_reminder_sent_at: string | null
          morning_reminder: boolean
          morning_time: string
          streak_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_task_reminder?: boolean
          daily_task_reminder_time?: string
          email_reminders?: boolean
          evening_reminder?: boolean
          evening_time?: string
          id?: string
          last_reminder_sent_at?: string | null
          morning_reminder?: boolean
          morning_time?: string
          streak_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_task_reminder?: boolean
          daily_task_reminder_time?: string
          email_reminders?: boolean
          evening_reminder?: boolean
          evening_time?: string
          id?: string
          last_reminder_sent_at?: string | null
          morning_reminder?: boolean
          morning_time?: string
          streak_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_emoji: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_emoji?: string | null
          created_at?: string
          display_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_emoji?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      quest_progress: {
        Row: {
          child_id: string
          completed_at: string
          id: string
          quest_id: string
          xp_earned: number
        }
        Insert: {
          child_id: string
          completed_at?: string
          id?: string
          quest_id: string
          xp_earned?: number
        }
        Update: {
          child_id?: string
          completed_at?: string
          id?: string
          quest_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "quest_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          endpoint: string
          id: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_user_id: string
          reward_type: string | null
          rewarded_at: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_user_id: string
          reward_type?: string | null
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          reward_type?: string | null
          rewarded_at?: string | null
          status?: string
        }
        Relationships: []
      }
      streak_recoveries: {
        Row: {
          created_at: string
          id: string
          parent_confirmed: boolean
          previous_streak: number
          recovered_at: string
          recovered_date: string
          restored_streak: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parent_confirmed?: boolean
          previous_streak?: number
          recovered_at?: string
          recovered_date: string
          restored_streak?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parent_confirmed?: boolean
          previous_streak?: number
          recovered_at?: string
          recovered_date?: string
          restored_streak?: number
          user_id?: string
        }
        Relationships: []
      }
      tester_accounts: {
        Row: {
          created_at: string
          created_by: string | null
          day6_reminder_sent: boolean
          expiry_shown: boolean
          id: string
          is_active: boolean
          note: string | null
          trial_end_at: string
          trial_start_at: string
          updated_at: string
          user_id: string
          welcome_shown: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day6_reminder_sent?: boolean
          expiry_shown?: boolean
          id?: string
          is_active?: boolean
          note?: string | null
          trial_end_at?: string
          trial_start_at?: string
          updated_at?: string
          user_id: string
          welcome_shown?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day6_reminder_sent?: boolean
          expiry_shown?: boolean
          id?: string
          is_active?: boolean
          note?: string | null
          trial_end_at?: string
          trial_start_at?: string
          updated_at?: string
          user_id?: string
          welcome_shown?: boolean
        }
        Relationships: []
      }
      tester_activity_summary: {
        Row: {
          games_played: number
          id: string
          last_activity_at: string | null
          quests_completed: number
          total_screens_visited: number
          total_time_spent_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          games_played?: number
          id?: string
          last_activity_at?: string | null
          quests_completed?: number
          total_screens_visited?: number
          total_time_spent_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          games_played?: number
          id?: string
          last_activity_at?: string | null
          quests_completed?: number
          total_screens_visited?: number
          total_time_spent_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tester_invitations: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          email: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number
          note: string | null
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          note?: string | null
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number
          note?: string | null
          uses_count?: number
        }
        Relationships: []
      }
      tester_usage_logs: {
        Row: {
          id: string
          metadata: Json | null
          screen_name: string
          session_id: string | null
          time_spent_seconds: number
          user_id: string
          visited_at: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          screen_name: string
          session_id?: string | null
          time_spent_seconds?: number
          user_id: string
          visited_at?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          screen_name?: string
          session_id?: string | null
          time_spent_seconds?: number
          user_id?: string
          visited_at?: string
        }
        Relationships: []
      }
      unlock_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_redemptions: number | null
          note: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          redemption_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          note?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          redemption_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_redemptions?: number | null
          note?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          redemption_count?: number | null
        }
        Relationships: []
      }
      user_clinic_selections: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          is_favorite: boolean
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          is_favorite?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_clinic_selections_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "dental_clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          email_reminder_sent_at: string | null
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          email_reminder_sent_at?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          email_reminder_sent_at?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
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
      admin_get_all_children: {
        Args: never
        Returns: {
          age_group: string
          avatar_emoji: string
          created_at: string
          id: string
          name: string
          parent_id: string
        }[]
      }
      admin_get_all_profiles: {
        Args: never
        Returns: {
          avatar_emoji: string
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }[]
      }
      current_user_has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      generate_referral_code: { Args: never; Returns: string }
      generate_tester_invite_code: { Args: never; Returns: string }
      get_admin_audit_logs: {
        Args: never
        Returns: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json
          id: string
          target_id: string
          target_table: string
        }[]
      }
      get_admin_stats: {
        Args: never
        Returns: {
          total_badges: number
          total_brushing_sessions: number
          total_children: number
          total_quests_completed: number
          total_users: number
          total_xp_earned: number
        }[]
      }
      get_child_total_xp: { Args: { child_uuid: string }; Returns: number }
      get_public_leaderboard: {
        Args: { limit_count?: number }
        Returns: {
          avatar_emoji: string
          badges_earned: number
          child_id: string
          display_name: string
          quests_completed: number
          total_xp: number
        }[]
      }
      get_tester_info: {
        Args: { check_user_id?: string }
        Returns: {
          days_remaining: number
          expiry_shown: boolean
          is_active: boolean
          is_tester: boolean
          trial_end_at: string
          trial_start_at: string
          welcome_shown: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_rate_limit: {
        Args: { p_endpoint: string; p_user_id: string }
        Returns: boolean
      }
      is_active_tester: { Args: { check_user_id?: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_safe_analytics_event_data: { Args: { _data: Json }; Returns: boolean }
    }
    Enums: {
      app_role: "parent" | "child" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["parent", "child", "admin"],
    },
  },
} as const
