export type UserRole = 'guest' | 'host' | 'admin';
export type PropertyStatus = 'draft' | 'pending' | 'published' | 'rejected';
export type PropertyType = 'Apartment' | 'House' | 'Villa' | 'Studio';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  whatsapp: string | null;
  created_at: string;
}

export interface Property {
  id: string;
  host_id: string | null;
  title: string | null;
  area: string | null;
  property_type: PropertyType | null;
  amenities: string[];
  adjectives: string[];
  min_rental_term: string | null;
  available_from: string | null;
  price_eur: number | null;
  price_usd: number | null;
  price_thb: number | null;
  tenancy_terms: Record<string, boolean>;
  contact_name: string | null;
  contact_email: string | null;
  contact_whatsapp: string | null;
  contact_facebook: string | null;
  status: PropertyStatus;
  facebook_post_id: string | null;
  facebook_posted_at: string | null;
  created_at: string;
  updated_at: string;
  // joined
  property_photos?: PropertyPhoto[];
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  storage_path: string;
  order_index: number;
  created_at: string;
}

export interface Enquiry {
  id: string;
  property_id: string;
  guest_name: string;
  guest_email: string;
  guest_whatsapp: string | null;
  check_in: string | null;
  check_out: string | null;
  message: string | null;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  updated_by: string | null;
  updated_at: string;
}

// Wizard state shape
export interface WizardData {
  area?: string;
  property_type?: PropertyType;
  amenities?: string[];
  adjectives?: string[];
  min_rental_term?: string;
  available_from?: string;
  price?: number;
  currency?: 'EUR' | 'USD' | 'THB';
  tenancy_terms?: Record<string, boolean>;
  contact_name?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  contact_facebook?: string;
  photos?: File[];
}
