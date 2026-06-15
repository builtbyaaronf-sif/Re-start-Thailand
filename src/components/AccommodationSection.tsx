import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Property } from '../types/property'

const TYPE_LABELS: Record<string, string> = {
  all: 'All',
  studio: 'Studio',
  house: 'House',
  villa: 'Villa',
  apartment: 'Apartment',
  bungalow: 'Bungalow',
  room: 'Room',
}

const PLACEHOLDER_IMAGES: Record<string, string> = {
  studio: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
  house: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
  villa: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
  apartment: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
  bungalow: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
  room: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
}

function formatPrice(p: Property): string {
  if (p.price_weekly) return `${p.price_weekly.toLocaleString()} THB / week`
  if (p.price_monthly_short) return `${p.price_monthly_short.toLocaleString()} THB / month`
  if (p.price_monthly) return `${p.price_monthly.toLocaleString()} THB / month`
  return 'POA'
}

function formatAvailable(dateStr?: string): string {
  if (!dateStr) return 'Available Now'
  const d = new Date(dateStr)
  const now = new Date()
  if (d <= now) return 'Available Now'
  return `Available ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

interface PropertyCardProps {
  property: Property
  selected: boolean
  onSelect: () => void
}

function PropertyCard({ property, selected, onSelect }: PropertyCardProps) {
  const image = property.hero_image || PLACEHOLDER_IMAGES[property.type] || PLACEHOLDER_IMAGES.studio

  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer border transition-all duration-200 ${
        selected
          ? 'border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
          : 'border-white/10 hover:border-white/30'
      } bg-[#1a1a1a]`}
    >
      {/* Hero image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={property.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Type badge */}
        <span className="absolute top-3 left-3 bg-black/70 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase px-2 py-1">
          {TYPE_LABELS[property.type] || property.type}
        </span>

        {/* Available badge */}
        <span className="absolute top-3 right-3 bg-black/70 border border-white/20 text-white/70 text-[10px] font-mono tracking-wide px-2 py-1">
          {formatAvailable(property.available_from)}
        </span>

        {/* Location on image */}
        <div className="absolute bottom-3 left-3">
          <p className="text-white/60 text-[10px] font-mono tracking-widest uppercase">
            📍 {property.area}, {property.island}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-light italic uppercase tracking-wide text-sm mb-1">
          {property.name}
        </h3>

        {/* Stats row */}
        <div className="flex gap-4 mb-3 mt-2">
          {property.bedrooms === 0 ? (
            <span className="text-white/50 text-xs font-mono">Studio</span>
          ) : (
            <span className="text-white/50 text-xs font-mono">{property.bedrooms} Bed</span>
          )}
          <span className="text-white/50 text-xs font-mono">{property.bathrooms} Bath</span>
          {property.size_sqm && (
            <span className="text-white/50 text-xs font-mono">{property.size_sqm} m²</span>
          )}
          {property.furnished && (
            <span className="text-white/50 text-xs font-mono">Furnished</span>
          )}
        </div>

        {/* Price */}
        <p className="text-[#D4AF37] font-mono text-sm font-medium mb-3">
          {formatPrice(property)}
        </p>

        {/* Short description */}
        {property.short_description && (
          <p className="text-white/50 text-xs leading-relaxed mb-3 line-clamp-2">
            {property.short_description}
          </p>
        )}

        {/* Facilities pills */}
        {property.facilities && property.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {property.facilities.slice(0, 4).map((f, i) => (
              <span key={i} className="text-[10px] font-mono text-white/40 border border-white/10 px-2 py-0.5">
                {f}
              </span>
            ))}
            {property.facilities.length > 4 && (
              <span className="text-[10px] font-mono text-white/30 px-1 py-0.5">
                +{property.facilities.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${property.contact_email}?subject=Enquiry: ${property.name}` }}
          className="w-full border border-[#D4AF37] text-[#D4AF37] text-xs font-mono tracking-widest uppercase py-2 hover:bg-[#D4AF37] hover:text-black transition-colors duration-150"
        >
          Enquire Now
        </button>
      </div>
    </div>
  )
}

interface PropertyDetailProps {
  property: Property
  onClose: () => void
}

function PropertyDetail({ property, onClose }: PropertyDetailProps) {
  const image = property.hero_image || PLACEHOLDER_IMAGES[property.type] || PLACEHOLDER_IMAGES.studio

  return (
    <div className="border border-[#D4AF37] bg-[#1a1a1a]">
      {/* Header */}
      <div className="relative h-64 overflow-hidden">
        <img src={image} alt={property.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/30" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 border border-white/30 text-white/60 text-xs font-mono px-3 py-1 hover:border-white hover:text-white"
        >
          ← Back
        </button>
        <div className="absolute bottom-4 left-4">
          <p className="text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase mb-1">
            {TYPE_LABELS[property.type]} · {property.area}, {property.island}
          </p>
          <h2 className="text-white text-xl font-light italic uppercase tracking-wide">
            {property.name}
          </h2>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left col */}
        <div>
          {/* Pricing */}
          <div className="border border-white/10 p-4 mb-4">
            <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-3">Pricing</p>
            {property.price_weekly && (
              <div className="flex justify-between mb-1">
                <span className="text-white/50 text-xs font-mono">Weekly</span>
                <span className="text-[#D4AF37] text-xs font-mono">{property.price_weekly.toLocaleString()} THB</span>
              </div>
            )}
            {property.price_monthly_short && (
              <div className="flex justify-between mb-1">
                <span className="text-white/50 text-xs font-mono">Monthly (1–6 months)</span>
                <span className="text-[#D4AF37] text-xs font-mono">{property.price_monthly_short.toLocaleString()} THB</span>
              </div>
            )}
            {property.price_monthly && !property.price_monthly_short && (
              <div className="flex justify-between mb-1">
                <span className="text-white/50 text-xs font-mono">Monthly</span>
                <span className="text-[#D4AF37] text-xs font-mono">{property.price_monthly.toLocaleString()} THB</span>
              </div>
            )}
            {property.price_monthly_long && (
              <div className="flex justify-between mb-1">
                <span className="text-white/50 text-xs font-mono">Long-term</span>
                <span className="text-[#D4AF37] text-xs font-mono">{property.price_monthly_long}</span>
              </div>
            )}
            <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
              <span className="text-white/50 text-xs font-mono">Security deposit</span>
              <span className="text-white/60 text-xs font-mono">{property.security_deposit_months} month</span>
            </div>
          </div>

          {/* About */}
          {property.description && (
            <div className="mb-4">
              <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-2">About</p>
              <p className="text-white/60 text-xs leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Utilities */}
          <div className="border border-white/10 p-4">
            <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-2">Utilities</p>
            <div className="flex justify-between mb-1">
              <span className="text-white/50 text-xs font-mono">Electricity</span>
              <span className="text-white/60 text-xs font-mono capitalize">{property.electricity_rate || 'Government rate'}</span>
            </div>
            {property.water_rate_min && (
              <div className="flex justify-between">
                <span className="text-white/50 text-xs font-mono">Water</span>
                <span className="text-white/60 text-xs font-mono">{property.water_rate_min}–{property.water_rate_max} THB/unit</span>
              </div>
            )}
          </div>
        </div>

        {/* Right col */}
        <div>
          {/* Facilities */}
          {property.facilities && (
            <div className="border border-white/10 p-4 mb-4">
              <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-3">Facilities</p>
              <ul className="space-y-1">
                {property.facilities.map((f, i) => (
                  <li key={i} className="text-white/60 text-xs font-mono flex items-center gap-2">
                    <span className="text-[#D4AF37]">✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Nearby */}
          {property.nearby && (
            <div className="border border-white/10 p-4 mb-4">
              <p className="text-white/40 text-[10px] font-mono tracking-widest uppercase mb-3">Nearby</p>
              <ul className="space-y-1">
                {Object.entries(property.nearby).map(([time, place], i) => (
                  <li key={i} className="flex justify-between">
                    <span className="text-white/60 text-xs font-mono">{place}</span>
                    <span className="text-[#D4AF37] text-xs font-mono">{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Availability */}
          <div className="border border-[#D4AF37]/30 p-4 mb-4 bg-[#D4AF37]/5">
            <p className="text-[#D4AF37] text-[10px] font-mono tracking-widest uppercase mb-1">Availability</p>
            <p className="text-white text-sm font-mono">{formatAvailable(property.available_from)}</p>
            <p className="text-white/40 text-xs font-mono mt-1">Min. stay: {property.min_stay_months} month{property.min_stay_months > 1 ? 's' : ''}</p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.href = `mailto:${property.contact_email}?subject=Enquiry: ${property.name}&body=Hi, I'm interested in ${property.name}. Please send me more details.`}
              className="w-full bg-[#D4AF37] text-black text-xs font-mono tracking-widest uppercase py-3 hover:bg-[#c49f2f] transition-colors"
            >
              📩 Enquire Now
            </button>
            {property.contact_whatsapp && (
              <button
                onClick={() => window.open(`https://wa.me/${property.contact_whatsapp}?text=Hi, I'm interested in ${property.name}`, '_blank')}
                className="w-full border border-green-500 text-green-400 text-xs font-mono tracking-widest uppercase py-3 hover:bg-green-500/10 transition-colors"
              >
                💬 WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AccommodationSection() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })

        if (error) throw error
        setProperties(data || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const types = ['all', ...Array.from(new Set(properties.map(p => p.type)))]
  const filtered = typeFilter === 'all' ? properties : properties.filter(p => p.type === typeFilter)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/40 text-xs font-mono tracking-widest uppercase">Loading properties...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-500/5 p-6 text-center">
        <p className="text-red-400 text-xs font-mono">Failed to load properties: {error}</p>
      </div>
    )
  }

  if (selectedProperty) {
    return <PropertyDetail property={selectedProperty} onClose={() => setSelectedProperty(null)} />
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-white/30 text-[10px] font-mono tracking-widest uppercase mb-1">
          Tropical Stays & Camps Lodgings
        </p>
        <h2 className="text-white text-xl font-light italic uppercase tracking-wide">
          Re:Start Properties
        </h2>
        <p className="text-white/40 text-xs mt-1">
          {filtered.length} propert{filtered.length !== 1 ? 'ies' : 'y'} available on Koh Samui
        </p>
      </div>

      {/* Type filters */}
      {types.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 border transition-colors ${
                typeFilter === t
                  ? 'border-[#D4AF37] bg-[#D4AF37] text-black'
                  : 'border-white/20 text-white/50 hover:border-white/40'
              }`}
            >
              {TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
      )}

      {/* Property grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-white/10">
          <p className="text-white/30 text-xs font-mono">No properties available in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => (
            <PropertyCard
              key={p.id}
              property={p}
              selected={selectedProperty?.id === p.id}
              onSelect={() => setSelectedProperty(p)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
