export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      adoption_requests: {
        Row: {
          created_at: string | null;
          id: string;
          message: string | null;
          pet_id: string | null;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          pet_id?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          message?: string | null;
          pet_id?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "adoption_requests_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "adoption_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      comments: {
        Row: {
          content: string | null;
          created_at: string | null;
          id: string;
          parent_id: string | null;
          post_id: string | null;
          reply_to_user_id: string | null;
          thread_level: number;
          thread_path: string | null;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          parent_id?: string | null;
          post_id?: string | null;
          reply_to_user_id?: string | null;
          thread_level?: number;
          thread_path?: string | null;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          parent_id?: string | null;
          post_id?: string | null;
          reply_to_user_id?: string | null;
          thread_level?: number;
          thread_path?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "comments";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_reply_to_user_id_fkey";
            columns: ["reply_to_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      conversations: {
        Row: {
          analysis: Json;
          conversation_text: string;
          created_at: string | null;
          id: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          analysis: Json;
          conversation_text: string;
          created_at?: string | null;
          id?: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          analysis?: Json;
          conversation_text?: string;
          created_at?: string | null;
          id?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          created_at: string | null;
          follower_id: string | null;
          following_id: string | null;
          id: string;
        };
        Insert: {
          created_at?: string | null;
          follower_id?: string | null;
          following_id?: string | null;
          id?: string;
        };
        Update: {
          created_at?: string | null;
          follower_id?: string | null;
          following_id?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      journal_entries: {
        Row: {
          content: string;
          created_at: string;
          date: string;
          flags: Json | null;
          growth_score: number | null;
          id: string;
          mood: string;
          reflections: string | null;
          title: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          content: string;
          created_at?: string;
          date: string;
          flags?: Json | null;
          growth_score?: number | null;
          id?: string;
          mood: string;
          reflections?: string | null;
          title: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string;
          date?: string;
          flags?: Json | null;
          growth_score?: number | null;
          id?: string;
          mood?: string;
          reflections?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          created_at: string | null;
          id: string;
          post_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          post_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          post_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      pattern_entries: {
        Row: {
          behavior: string;
          created_at: string;
          date: string;
          emotion: string;
          id: string;
          outcome: string;
          trigger: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          behavior: string;
          created_at?: string;
          date: string;
          emotion: string;
          id?: string;
          outcome: string;
          trigger: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          behavior?: string;
          created_at?: string;
          date?: string;
          emotion?: string;
          id?: string;
          outcome?: string;
          trigger?: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      pets: {
        Row: {
          age: number | null;
          breed: string | null;
          created_at: string | null;
          description: string | null;
          gender: string | null;
          id: string;
          image_urls: string[] | null;
          is_adopted: boolean | null;
          location: string | null;
          name: string | null;
          owner_id: string | null;
          type: string | null;
        };
        Insert: {
          age?: number | null;
          breed?: string | null;
          created_at?: string | null;
          description?: string | null;
          gender?: string | null;
          id?: string;
          image_urls?: string[] | null;
          is_adopted?: boolean | null;
          location?: string | null;
          name?: string | null;
          owner_id?: string | null;
          type?: string | null;
        };
        Update: {
          age?: number | null;
          breed?: string | null;
          created_at?: string | null;
          description?: string | null;
          gender?: string | null;
          id?: string;
          image_urls?: string[] | null;
          is_adopted?: boolean | null;
          location?: string | null;
          name?: string | null;
          owner_id?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pets_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          content: string | null;
          created_at: string | null;
          id: string;
          image_urls: string[] | null;
          is_repost: boolean | null;
          original_post_id: string | null;
          pet_id: string | null;
          repost_comment: string | null;
          user_id: string | null;
        };
        Insert: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          image_urls?: string[] | null;
          is_repost?: boolean | null;
          original_post_id?: string | null;
          pet_id?: string | null;
          repost_comment?: string | null;
          user_id?: string | null;
        };
        Update: {
          content?: string | null;
          created_at?: string | null;
          id?: string;
          image_urls?: string[] | null;
          is_repost?: boolean | null;
          original_post_id?: string | null;
          pet_id?: string | null;
          repost_comment?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "posts_original_post_id_fkey";
            columns: ["original_post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          last_active: string | null;
          name: string;
          persona_type: string | null;
          preferences: Json | null;
          quiz_completed: boolean;
          streak_count: number;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          last_active?: string | null;
          name: string;
          persona_type?: string | null;
          preferences?: Json | null;
          quiz_completed?: boolean;
          streak_count?: number;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          last_active?: string | null;
          name?: string;
          persona_type?: string | null;
          preferences?: Json | null;
          quiz_completed?: boolean;
          streak_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      reposts: {
        Row: {
          created_at: string | null;
          id: string;
          original_post_id: string | null;
          post_id: string | null;
          repost_comment: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          original_post_id?: string | null;
          post_id?: string | null;
          repost_comment?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          original_post_id?: string | null;
          post_id?: string | null;
          repost_comment?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reposts_original_post_id_fkey";
            columns: ["original_post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reposts_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reposts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      care_applications: {
        Row: {
          applicant_id: string;
          created_at: string;
          id: string;
          message: string;
          proposed_rate: number | null;
          request_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          applicant_id: string;
          created_at?: string;
          id?: string;
          message: string;
          proposed_rate?: number | null;
          request_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          applicant_id?: string;
          created_at?: string;
          id?: string;
          message?: string;
          proposed_rate?: number | null;
          request_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "care_applications_applicant_id_fkey";
            columns: ["applicant_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_applications_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "care_requests";
            referencedColumns: ["id"];
          }
        ];
      };
      care_requests: {
        Row: {
          assigned_caretaker_id: string | null;
          compensation: number | null;
          compensation_type: string | null;
          created_at: string;
          description: string | null;
          end_date: string;
          id: string;
          instructions: string | null;
          location: string;
          owner_id: string;
          pet_id: string;
          start_date: string;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          assigned_caretaker_id?: string | null;
          compensation?: number | null;
          compensation_type?: string | null;
          created_at?: string;
          description?: string | null;
          end_date: string;
          id?: string;
          instructions?: string | null;
          location: string;
          owner_id: string;
          pet_id: string;
          start_date: string;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          assigned_caretaker_id?: string | null;
          compensation?: number | null;
          compensation_type?: string | null;
          created_at?: string;
          description?: string | null;
          end_date?: string;
          id?: string;
          instructions?: string | null;
          location?: string;
          owner_id?: string;
          pet_id?: string;
          start_date?: string;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "care_requests_assigned_caretaker_id_fkey";
            columns: ["assigned_caretaker_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_requests_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "care_requests_pet_id_fkey";
            columns: ["pet_id"];
            isOneToOne: false;
            referencedRelation: "pets";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_items: {
        Row: {
          created_at: string | null;
          id: string;
          item_id: string | null;
          item_type: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          item_id?: string | null;
          item_type?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          item_id?: string | null;
          item_type?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saved_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      self_coaching_entries: {
        Row: {
          created_at: string;
          id: string;
          response: string;
          step: number;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          response: string;
          step: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          response?: string;
          step?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          id: string;
          location: string | null;
          name: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          id: string;
          location?: string | null;
          name?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          id?: string;
          location?: string | null;
          name?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_follower_count: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_following_count: {
        Args: { user_uuid: string };
        Returns: number;
      };
      get_next_thread_path: {
        Args: { parent_comment_id: string; target_post_id: string };
        Returns: string;
      };
      get_post_comment_tree: {
        Args: { target_post_id: string };
        Returns: {
          id: string;
          user_id: string;
          post_id: string;
          parent_id: string;
          reply_to_user_id: string;
          content: string;
          created_at: string;
          thread_level: number;
          thread_path: string;
          user_name: string;
          user_avatar_url: string;
          reply_to_user_name: string;
          reply_count: number;
        }[];
      };
      get_reply_count: {
        Args: { comment_uuid: string };
        Returns: number;
      };
      get_repost_count: {
        Args: { post_uuid: string };
        Returns: number;
      };
      get_thread_level: {
        Args: { parent_comment_id: string };
        Returns: number;
      };
      has_user_reposted: {
        Args: { user_uuid: string; post_uuid: string };
        Returns: boolean;
      };
      is_following: {
        Args: { follower_uuid: string; following_uuid: string };
        Returns: boolean;
      };
      get_care_requests_with_details: {
        Args: Record<PropertyKey, never>;
        Returns: {
          id: string;
          pet_id: string;
          owner_id: string;
          title: string;
          description: string | null;
          location: string;
          start_date: string;
          end_date: string;
          compensation: number | null;
          compensation_type: string | null;
          instructions: string | null;
          status: string;
          assigned_caretaker_id: string | null;
          created_at: string;
          updated_at: string;
          pet_name: string;
          pet_type: string;
          pet_image_url: string | null;
          owner_name: string;
          owner_avatar_url: string | null;
          applications_count: number;
        }[];
      };
      approve_care_application: {
        Args: { application_id: string };
        Returns: boolean;
      };
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

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
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

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
