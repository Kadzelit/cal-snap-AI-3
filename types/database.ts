export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          gender: "male" | "female" | "other" | null;
          birth_date: string | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level: "sedentary" | "light" | "active" | "very_active" | null;
          goal: "lose" | "maintain" | "gain" | null;
          daily_calorie_target: number | null;
          daily_protein_g: number | null;
          daily_carbs_g: number | null;
          daily_fat_g: number | null;
          goals_description: string | null;
          target_weight_kg: number | null;
          target_body_fat_pct: number | null;
          target_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          gender?: "male" | "female" | "other" | null;
          birth_date?: string | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: "sedentary" | "light" | "active" | "very_active" | null;
          goal?: "lose" | "maintain" | "gain" | null;
          daily_calorie_target?: number | null;
          daily_protein_g?: number | null;
          daily_carbs_g?: number | null;
          daily_fat_g?: number | null;
          goals_description?: string | null;
          target_weight_kg?: number | null;
          target_body_fat_pct?: number | null;
          target_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          photo_url: string | null;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack" | null;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          portion_size: number;
          recipe_id: string | null;
          logged_at: string;
          ai_confidence: number | null;
          ai_provider: string | null;
          ai_raw_response: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          photo_url?: string | null;
          meal_type?: "breakfast" | "lunch" | "dinner" | "snack" | null;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          portion_size?: number;
          recipe_id?: string | null;
          logged_at?: string;
          ai_confidence?: number | null;
          ai_provider?: string | null;
          ai_raw_response?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["meals"]["Insert"]>;
        Relationships: [];
      };
      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          logged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          logged_at: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weight_logs"]["Insert"]>;
        Relationships: [];
      };
      recipes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          photo_url: string | null;
          servings: number;
          total_calories: number | null;
          total_protein_g: number | null;
          total_carbs_g: number | null;
          total_fat_g: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          photo_url?: string | null;
          servings?: number;
          total_calories?: number | null;
          total_protein_g?: number | null;
          total_carbs_g?: number | null;
          total_fat_g?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["recipes"]["Insert"]>;
        Relationships: [];
      };
      recipe_ingredients: {
        Row: {
          id: string;
          recipe_id: string;
          name: string;
          quantity_g: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          position: number;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          name: string;
          quantity_g: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          position?: number;
        };
        Update: Partial<Database["public"]["Tables"]["recipe_ingredients"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
