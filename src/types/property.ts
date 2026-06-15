export interface Property {
  id: string
  created_at: string
  name: string
  slug: string
  type: 'studio' | 'apartment' | 'bungalow' | 'villa' | 'house' | 'room'
  status: 'active' | 'rented' | 'draft' | 'archived'
  area: string
  island: string
  country: string
  lat?: number
  lng?: number
  size_sqm?: number
  floor_level?: string
  bedrooms: number
  bathrooms: number
  price_weekly?: number
  price_monthly?: number
  price_monthly_short?: number
  price_monthly_long?: string
  price_nightly?: number
  security_deposit_months: number
  available_from?: string
  min_stay_months: number
  description?: string
  short_description?: string
  furnished: boolean
  electricity_rate?: string
  water_rate_min?: number
  water_rate_max?: number
  facilities?: string[]
  nearby?: Record<string, string>
  images?: string[]
  hero_image?: string
  fb_post_id?: string
  fb_listed_at?: string
  contact_email?: string
  contact_whatsapp?: string
}
