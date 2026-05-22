export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: "doctor" | "patient" | "admin" | "internal_admin";
          first_name: string | null;
          last_name: string | null;
          email: string;
          mobile: string | null;
          phone_number: string | null;
          display_name: string | null;
          age: number | null;
          sex: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: "doctor" | "patient" | "admin" | "internal_admin";
          first_name?: string | null;
          last_name?: string | null;
          email: string;
          mobile?: string | null;
          phone_number?: string | null;
          display_name?: string | null;
          age?: number | null;
          sex?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: "doctor" | "patient" | "admin" | "internal_admin";
          first_name?: string | null;
          last_name?: string | null;
          email?: string;
          mobile?: string | null;
          phone_number?: string | null;
          display_name?: string | null;
          age?: number | null;
          sex?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      doctor_clinics: {
        Row: {
          id: string;
          doctor_id: string;
          clinic_name: string;
          city: string;
          province: string;
          specialty: string;
          clinic_slug: string;
          qr_code_url: string | null;
          qr_activation_status: "inactive" | "active";
          qr_activated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          clinic_name: string;
          city: string;
          province: string;
          specialty: string;
          clinic_slug: string;
          qr_code_url?: string | null;
          qr_activation_status?: "inactive" | "active";
          qr_activated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          clinic_name?: string;
          city?: string;
          province?: string;
          specialty?: string;
          clinic_slug?: string;
          qr_code_url?: string | null;
          qr_activation_status?: "inactive" | "active";
          qr_activated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_clinics_doctor_id_fkey";
            columns: ["doctor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      doctor_verifications: {
        Row: {
          id: string;
          doctor_id: string;
          prc_license_number: string;
          prc_id_file_path: string | null;
          verification_status: "pending" | "approved" | "rejected";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          prc_license_number: string;
          prc_id_file_path?: string | null;
          verification_status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          prc_license_number?: string;
          prc_id_file_path?: string | null;
          verification_status?: "pending" | "approved" | "rejected";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctor_verifications_doctor_id_fkey";
            columns: ["doctor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      onboarding_status: {
        Row: {
          doctor_id: string;
          status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
          submitted_at: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          doctor_id: string;
          status?: "draft" | "submitted" | "under_review" | "approved" | "rejected";
          submitted_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          doctor_id?: string;
          status?: "draft" | "submitted" | "under_review" | "approved" | "rejected";
          submitted_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "onboarding_status_doctor_id_fkey";
            columns: ["doctor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      patient_profiles: {
        Row: {
          id: string;
          date_of_birth: string | null;
          gender: "male" | "female" | "other" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date_of_birth?: string | null;
          gender?: "male" | "female" | "other" | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patient_profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      bioscan_reviews: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          data: Json;
          status: "pending" | "reviewed" | "approved";
          review_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id: string;
          data: Json;
          status?: "pending" | "reviewed" | "approved";
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string;
          data?: Json;
          status?: "pending" | "reviewed" | "approved";
          review_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bioscan_reviews_patient_id_fkey";
            columns: ["patient_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bioscan_reviews_doctor_id_fkey";
            columns: ["doctor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      physician_messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          subject: string;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          subject: string;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          subject?: string;
          message?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "physician_messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "physician_messages_recipient_id_fkey";
            columns: ["recipient_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      physician_credits: {
        Row: {
          id: string;
          doctor_id: string;
          balance: number;
          total_purchased: number;
          total_used: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          doctor_id: string;
          balance?: number;
          total_purchased?: number;
          total_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          doctor_id?: string;
          balance?: number;
          total_purchased?: number;
          total_used?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "physician_credits_doctor_id_fkey";
            columns: ["doctor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      orders: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          total_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_patient_id_fkey";
            columns: ["patient_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_doctor_id_fkey";
            columns: ["doctor_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      lab_results: {
        Row: {
          id: string;
          patient_id: string;
          provider: string;
          test_date: string;
          results_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          provider: string;
          test_date: string;
          results_data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          provider?: string;
          test_date?: string;
          results_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lab_results_patient_id_fkey";
            columns: ["patient_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "doctor" | "patient" | "admin" | "internal_admin";
      verification_status: "pending" | "approved" | "rejected";
      onboarding_state: "draft" | "submitted" | "under_review" | "approved" | "rejected";
      qr_activation_status: "inactive" | "active";
      patient_gender: "male" | "female" | "other";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
