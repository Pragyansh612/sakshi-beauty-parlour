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
          full_name: string;
          phone: string;
          email: string | null;
          role: 'customer' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone: string;
          email?: string | null;
          role?: 'customer' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          role?: 'customer' | 'admin';
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon_shape: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon_shape?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          icon_shape?: string | null;
          display_order?: number;
        };
      };
      services: {
        Row: {
          id: string;
          category_id: string;
          sub_category: string | null;
          name: string;
          description: string | null;
          duration_minutes: number | null;
          duration_label: string | null;
          price_from: number;
          price_to: number | null;
          is_appointment_eligible: boolean;
          is_booking_eligible: boolean;
          status: 'active' | 'draft' | 'archived';
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          sub_category?: string | null;
          name: string;
          description?: string | null;
          duration_minutes?: number | null;
          duration_label?: string | null;
          price_from: number;
          price_to?: number | null;
          is_appointment_eligible?: boolean;
          is_booking_eligible?: boolean;
          status?: 'active' | 'draft' | 'archived';
          display_order?: number;
        };
        Update: {
          category_id?: string;
          sub_category?: string | null;
          name?: string;
          description?: string | null;
          duration_minutes?: number | null;
          duration_label?: string | null;
          price_from?: number;
          price_to?: number | null;
          is_appointment_eligible?: boolean;
          is_booking_eligible?: boolean;
          status?: 'active' | 'draft' | 'archived';
          display_order?: number;
          updated_at?: string;
        };
      };
      combo_offers: {
        Row: {
          id: string;
          name: string;
          tag_line: string | null;
          price: number;
          price_original: number;
          save_percent: number;
          is_featured: boolean;
          status: 'active' | 'draft';
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          tag_line?: string | null;
          price: number;
          price_original: number;
          save_percent: number;
          is_featured?: boolean;
          status?: 'active' | 'draft';
          display_order?: number;
        };
        Update: {
          name?: string;
          tag_line?: string | null;
          price?: number;
          price_original?: number;
          save_percent?: number;
          is_featured?: boolean;
          status?: 'active' | 'draft';
          display_order?: number;
        };
      };
      combo_offer_items: {
        Row: {
          id: string;
          combo_id: string;
          description: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          combo_id: string;
          description: string;
          display_order?: number;
        };
        Update: {
          description?: string;
          display_order?: number;
        };
      };
      time_slots: {
        Row: {
          id: string;
          slot_date: string;
          slot_time: string;
          status: 'open' | 'blocked';
          created_at: string;
        };
        Insert: {
          id?: string;
          slot_date: string;
          slot_time: string;
          status?: 'open' | 'blocked';
          created_at?: string;
        };
        Update: {
          status?: 'open' | 'blocked';
        };
      };
      appointments: {
        Row: {
          id: string;
          reference: string;
          customer_id: string;
          service_id: string;
          slot_id: string;
          artist: string | null;
          status: 'pending' | 'confirmed' | 'checked_in' | 'in_chair' | 'completed' | 'cancelled' | 'no_show';
          notes: string | null;
          confirmed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference?: string;
          customer_id: string;
          service_id: string;
          slot_id: string;
          artist?: string | null;
          status?: 'pending' | 'confirmed' | 'checked_in' | 'in_chair' | 'completed' | 'cancelled' | 'no_show';
          notes?: string | null;
        };
        Update: {
          artist?: string | null;
          status?: 'pending' | 'confirmed' | 'checked_in' | 'in_chair' | 'completed' | 'cancelled' | 'no_show';
          notes?: string | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          reference: string;
          customer_id: string;
          service_id: string;
          event_date: string;
          event_type: string | null;
          guests_count: string | null;
          venue: string | null;
          style_notes: string | null;
          wants_trial: boolean;
          artist: string | null;
          agreed_price: number | null;
          status: 'pending_approval' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          sessions_total: number | null;
          sessions_completed: number;
          admin_notes: string | null;
          confirmed_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference?: string;
          customer_id: string;
          service_id: string;
          event_date: string;
          event_type?: string | null;
          guests_count?: string | null;
          venue?: string | null;
          style_notes?: string | null;
          wants_trial?: boolean;
          artist?: string | null;
          agreed_price?: number | null;
          status?: 'pending_approval' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          sessions_total?: number | null;
          sessions_completed?: number;
          admin_notes?: string | null;
        };
        Update: {
          event_date?: string;
          event_type?: string | null;
          guests_count?: string | null;
          venue?: string | null;
          style_notes?: string | null;
          wants_trial?: boolean;
          artist?: string | null;
          agreed_price?: number | null;
          status?: 'pending_approval' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
          sessions_total?: number | null;
          sessions_completed?: number;
          admin_notes?: string | null;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
          updated_at?: string;
        };
      };
      gallery_images: {
        Row: {
          id: string;
          title: string;
          category: string;
          tag: string;
          section: 'work' | 'achievement';
          storage_path: string;
          alt_text: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          tag: string;
          section: 'work' | 'achievement';
          storage_path: string;
          alt_text?: string | null;
          display_order?: number;
        };
        Update: {
          title?: string;
          category?: string;
          tag?: string;
          section?: 'work' | 'achievement';
          storage_path?: string;
          alt_text?: string | null;
          display_order?: number;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          phone: string;
          service_interest: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          service_interest?: string | null;
          message: string;
          is_read?: boolean;
        };
        Update: {
          is_read?: boolean;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type ComboOffer = Database['public']['Tables']['combo_offers']['Row'];
export type ComboOfferItem = Database['public']['Tables']['combo_offer_items']['Row'];
export type TimeSlot = Database['public']['Tables']['time_slots']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type Booking = Database['public']['Tables']['bookings']['Row'];
export type GalleryImage = Database['public']['Tables']['gallery_images']['Row'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
