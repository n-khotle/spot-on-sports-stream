export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ad_banners: {
        Row: {
          click_url: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          click_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          click_url?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          created_at: string
          description: string | null
          featured: boolean
          featured_image_url: string | null
          game_date: string | null
          game_time: string | null
          id: string
          live_stream_url: string | null
          status: string
          tags: string[] | null
          title: string
          trailer_video_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_image_url?: string | null
          game_date?: string | null
          game_time?: string | null
          id?: string
          live_stream_url?: string | null
          status?: string
          tags?: string[] | null
          title: string
          trailer_video_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          featured?: boolean
          featured_image_url?: string | null
          game_date?: string | null
          game_time?: string | null
          id?: string
          live_stream_url?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          trailer_video_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      news_articles: {
        Row: {
          author_id: string
          author_name: string
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean
          featured_image_url: string | null
          id: string
          published: boolean
          tags: string[] | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author_id: string
          author_name: string
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          published?: boolean
          tags?: string[] | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author_id?: string
          author_name?: string
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          published?: boolean
          tags?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          game_id: string | null
          id: string
          status: string | null
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          game_id?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          game_id?: string | null
          id?: string
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string
          created_at: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allocated_subscription_products: string[] | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone_number: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allocated_subscription_products?: string[] | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allocated_subscription_products?: string[] | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          contact_address: string | null
          contact_description: string | null
          contact_email: string | null
          contact_hours: string | null
          contact_phone: string | null
          created_at: string
          facebook_handle: string | null
          google_analytics_id: string | null
          id: string
          instagram_handle: string | null
          logo_url: string | null
          meta_pixel_id: string | null
          site_name: string
          tiktok_handle: string | null
          updated_at: string
          x_handle: string | null
        }
        Insert: {
          contact_address?: string | null
          contact_description?: string | null
          contact_email?: string | null
          contact_hours?: string | null
          contact_phone?: string | null
          created_at?: string
          facebook_handle?: string | null
          google_analytics_id?: string | null
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          meta_pixel_id?: string | null
          site_name?: string
          tiktok_handle?: string | null
          updated_at?: string
          x_handle?: string | null
        }
        Update: {
          contact_address?: string | null
          contact_description?: string | null
          contact_email?: string | null
          contact_hours?: string | null
          contact_phone?: string | null
          created_at?: string
          facebook_handle?: string | null
          google_analytics_id?: string | null
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          meta_pixel_id?: string | null
          site_name?: string
          tiktok_handle?: string | null
          updated_at?: string
          x_handle?: string | null
        }
        Relationships: []
      }
      streaming_settings: {
        Row: {
          auto_record: boolean | null
          created_at: string
          description: string | null
          framerate: number | null
          hls_url: string | null
          id: string
          is_active: boolean | null
          max_bitrate: number | null
          name: string
          quality_preset: string | null
          resolution: string | null
          rtmp_url: string | null
          stream_key: string | null
          stream_url: string | null
          thumbnail_url: string | null
          updated_at: string
        }
        Insert: {
          auto_record?: boolean | null
          created_at?: string
          description?: string | null
          framerate?: number | null
          hls_url?: string | null
          id?: string
          is_active?: boolean | null
          max_bitrate?: number | null
          name: string
          quality_preset?: string | null
          resolution?: string | null
          rtmp_url?: string | null
          stream_key?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Update: {
          auto_record?: boolean | null
          created_at?: string
          description?: string | null
          framerate?: number | null
          hls_url?: string | null
          id?: string
          is_active?: boolean | null
          max_bitrate?: number | null
          name?: string
          quality_preset?: string | null
          resolution?: string | null
          rtmp_url?: string | null
          stream_key?: string | null
          stream_url?: string | null
          thumbnail_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_prices: {
        Row: {
          active: boolean
          created_at: string
          currency: string
          id: string
          interval: string
          interval_count: number
          nickname: string | null
          product_id: string
          stripe_price_id: string | null
          unit_amount: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          interval: string
          interval_count?: number
          nickname?: string | null
          product_id: string
          stripe_price_id?: string | null
          unit_amount: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          currency?: string
          id?: string
          interval?: string
          interval_count?: number
          nickname?: string | null
          product_id?: string
          stripe_price_id?: string | null
          unit_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "subscription_products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_products: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      allocate_product_to_user: {
        Args: { target_user_id: string; product_id: string }
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_any_admins: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      remove_product_from_user: {
        Args: { target_user_id: string; product_id: string }
        Returns: undefined
      }
      user_has_product_access: {
        Args: { user_id: string; product_id: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
