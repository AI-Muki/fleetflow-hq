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
      assets: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"] | null
          id: string
          image_url: string | null
          make: string | null
          model: string | null
          name: string
          notes: string | null
          odometer: number
          plate: string | null
          status: Database["public"]["Enums"]["asset_status"]
          updated_at: string
          vehicle_type: string | null
          vin: string | null
          year: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          image_url?: string | null
          make?: string | null
          model?: string | null
          name: string
          notes?: string | null
          odometer?: number
          plate?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"] | null
          id?: string
          image_url?: string | null
          make?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          odometer?: number
          plate?: string | null
          status?: Database["public"]["Enums"]["asset_status"]
          updated_at?: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_photos: {
        Row: {
          assignment_id: string
          company_id: string
          created_at: string
          id: string
          phase: Database["public"]["Enums"]["assignment_phase"]
          storage_path: string
        }
        Insert: {
          assignment_id: string
          company_id: string
          created_at?: string
          id?: string
          phase: Database["public"]["Enums"]["assignment_phase"]
          storage_path: string
        }
        Update: {
          assignment_id?: string
          company_id?: string
          created_at?: string
          id?: string
          phase?: Database["public"]["Enums"]["assignment_phase"]
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_photos_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          asset_id: string
          checkin_notes: string | null
          checkin_odometer: number | null
          checkin_signature_url: string | null
          checkout_notes: string | null
          checkout_odometer: number | null
          checkout_signature_url: string | null
          company_id: string
          created_at: string
          created_by: string | null
          driver_id: string
          end_at: string | null
          id: string
          start_at: string
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
        }
        Insert: {
          asset_id: string
          checkin_notes?: string | null
          checkin_odometer?: number | null
          checkin_signature_url?: string | null
          checkout_notes?: string | null
          checkout_odometer?: number | null
          checkout_signature_url?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          driver_id: string
          end_at?: string | null
          id?: string
          start_at?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Update: {
          asset_id?: string
          checkin_notes?: string | null
          checkin_odometer?: number | null
          checkin_signature_url?: string | null
          checkout_notes?: string | null
          checkout_odometer?: number | null
          checkout_signature_url?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          driver_id?: string
          end_at?: string | null
          id?: string
          start_at?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      damage_reports: {
        Row: {
          asset_id: string
          assignment_id: string | null
          company_id: string
          cost: number | null
          created_at: string
          description: string
          id: string
          reported_at: string
          reported_by: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["damage_severity"]
        }
        Insert: {
          asset_id: string
          assignment_id?: string | null
          company_id: string
          cost?: number | null
          created_at?: string
          description: string
          id?: string
          reported_at?: string
          reported_by?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["damage_severity"]
        }
        Update: {
          asset_id?: string
          assignment_id?: string | null
          company_id?: string
          cost?: number | null
          created_at?: string
          description?: string
          id?: string
          reported_at?: string
          reported_by?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["damage_severity"]
        }
        Relationships: [
          {
            foreignKeyName: "damage_reports_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "damage_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          asset_id: string | null
          company_id: string
          created_at: string
          created_by: string | null
          driver_id: string | null
          expiry_date: string | null
          id: string
          kind: Database["public"]["Enums"]["document_kind"]
          name: string
          storage_path: string | null
        }
        Insert: {
          asset_id?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          driver_id?: string | null
          expiry_date?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          name: string
          storage_path?: string | null
        }
        Update: {
          asset_id?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          driver_id?: string | null
          expiry_date?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["document_kind"]
          name?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          avatar_url: string | null
          company_id: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          license_expiry: string | null
          license_number: string | null
          notes: string | null
          phone: string | null
          status: Database["public"]["Enums"]["driver_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_number?: string | null
          notes?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["driver_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          asset_id: string | null
          category: string
          company_id: string
          created_at: string
          created_by: string | null
          description: string | null
          expense_date: string
          id: string
          receipt_path: string | null
        }
        Insert: {
          amount: number
          asset_id?: string | null
          category: string
          company_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          receipt_path?: string | null
        }
        Update: {
          amount?: number
          asset_id?: string | null
          category?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          expense_date?: string
          id?: string
          receipt_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_logs: {
        Row: {
          asset_id: string
          company_id: string
          cost: number
          created_at: string
          driver_id: string | null
          id: string
          liters: number
          logged_at: string
          odometer: number | null
          station: string | null
        }
        Insert: {
          asset_id: string
          company_id: string
          cost: number
          created_at?: string
          driver_id?: string | null
          id?: string
          liters: number
          logged_at?: string
          odometer?: number | null
          station?: string | null
        }
        Update: {
          asset_id?: string
          company_id?: string
          cost?: number
          created_at?: string
          driver_id?: string | null
          id?: string
          liters?: number
          logged_at?: string
          odometer?: number | null
          station?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          asset_id: string
          company_id: string
          completed_date: string | null
          cost: number | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          odometer: number | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["maintenance_status"]
          type: Database["public"]["Enums"]["maintenance_type"]
          updated_at: string
          vendor: string | null
        }
        Insert: {
          asset_id: string
          company_id: string
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          odometer?: number | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          type?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          asset_id?: string
          company_id?: string
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          odometer?: number | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["maintenance_status"]
          type?: Database["public"]["Enums"]["maintenance_type"]
          updated_at?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_company_role: {
        Args: {
          _company_id: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id: string }
        Returns: boolean
      }
      user_companies: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role:
        | "admin"
        | "owner"
        | "manager"
        | "mechanic"
        | "driver"
        | "accountant"
      asset_status: "active" | "in_maintenance" | "retired" | "unavailable"
      assignment_phase: "checkout" | "checkin"
      assignment_status: "active" | "returned" | "cancelled"
      damage_severity: "low" | "medium" | "high" | "critical"
      document_kind:
        | "registration"
        | "insurance"
        | "inspection"
        | "license"
        | "other"
      driver_status: "active" | "suspended" | "inactive"
      fuel_type: "gasoline" | "diesel" | "electric" | "hybrid" | "lpg"
      maintenance_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      maintenance_type: "scheduled" | "repair" | "inspection"
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
      app_role: [
        "admin",
        "owner",
        "manager",
        "mechanic",
        "driver",
        "accountant",
      ],
      asset_status: ["active", "in_maintenance", "retired", "unavailable"],
      assignment_phase: ["checkout", "checkin"],
      assignment_status: ["active", "returned", "cancelled"],
      damage_severity: ["low", "medium", "high", "critical"],
      document_kind: [
        "registration",
        "insurance",
        "inspection",
        "license",
        "other",
      ],
      driver_status: ["active", "suspended", "inactive"],
      fuel_type: ["gasoline", "diesel", "electric", "hybrid", "lpg"],
      maintenance_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      maintenance_type: ["scheduled", "repair", "inspection"],
    },
  },
} as const
