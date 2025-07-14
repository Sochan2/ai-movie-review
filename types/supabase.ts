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
    PostgrestVersion: "12"
  }
  public: {
    Tables: {
      masterpieces: {
        Row: {
          created_at: string | null
          id: string
          movie_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movie_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movie_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "masterpieces_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "masterpieces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          created_at: string | null
          emotions: Json | null
          features: Json | null
          genres: string[] | null
          id: string
          overview: string | null
          popularity: number | null
          poster_url: string | null
          providers: string[] | null
          themes: Json | null
          title: string
          view_availability_score: number | null
        }
        Insert: {
          created_at?: string | null
          emotions?: Json | null
          features?: Json | null
          genres?: string[] | null
          id: string
          overview?: string | null
          popularity?: number | null
          poster_url?: string | null
          providers?: string[] | null
          themes?: Json | null
          title: string
          view_availability_score?: number | null
        }
        Update: {
          created_at?: string | null
          emotions?: Json | null
          features?: Json | null
          genres?: string[] | null
          id?: string
          overview?: string | null
          popularity?: number | null
          poster_url?: string | null
          providers?: string[] | null
          themes?: Json | null
          title?: string
          view_availability_score?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          emotions: string[] | null
          id: string
          movie_id: string | null
          rating: number | null
          review_text: string | null
          tag_sentiment: Json | null
          tags: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          emotions?: string[] | null
          id?: string
          movie_id?: string | null
          rating?: number | null
          review_text?: string | null
          tag_sentiment?: Json | null
          tags?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          emotions?: string[] | null
          id?: string
          movie_id?: string | null
          rating?: number | null
          review_text?: string | null
          tag_sentiment?: Json | null
          tags?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      unavailable_votes: {
        Row: {
          created_at: string | null
          id: string
          movie_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          movie_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          movie_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unavailable_votes_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unavailable_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          ai_analysis_count: number
          dislikes: Json | null
          last_analysis_date: string | null
          likes: Json | null
          updated_at: string | null
          user_id: string
          selected_subscriptions: string[] | null;
          favorite_genres: string[] | null;
        }
        Insert: {
          ai_analysis_count?: number
          dislikes?: Json | null
          last_analysis_date?: string | null
          likes?: Json | null
          updated_at?: string | null
          user_id: string
          selected_subscriptions?: string[] | null;
          favorite_genres?: string[] | null;
        }
        Update: {
          ai_analysis_count?: number
          dislikes?: Json | null
          last_analysis_date?: string | null
          likes?: Json | null
          updated_at?: string | null
          user_id?: string
          selected_subscriptions?: string[] | null;
          favorite_genres?: string[] | null;
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          display_name: string | null
          favorite_genres: string[] | null
          id: string
          is_anonymous: boolean | null
          last_login: string | null
          selected_subscriptions: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          favorite_genres?: string[] | null
          id: string
          is_anonymous?: boolean | null
          last_login?: string | null
          selected_subscriptions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          favorite_genres?: string[] | null
          id?: string
          is_anonymous?: boolean | null
          last_login?: string | null
          selected_subscriptions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fetch_new_movies: {
        Args: { providers: string[]; genres: string[] }
        Returns: {
          created_at: string | null
          emotions: Json | null
          features: Json | null
          genres: string[] | null
          id: string
          overview: string | null
          popularity: number | null
          poster_url: string | null
          providers: string[] | null
          themes: Json | null
          title: string
          view_availability_score: number | null
        }[]
      }
      fetch_trending_movies: {
        Args: { providers: string[]; genres: string[] }
        Returns: {
          created_at: string | null
          emotions: Json | null
          features: Json | null
          genres: string[] | null
          id: string
          overview: string | null
          popularity: number | null
          poster_url: string | null
          providers: string[] | null
          themes: Json | null
          title: string
          view_availability_score: number | null
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
