import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, getPhotoUrl } from '../../lib/supabase';
import { Property } from '../../types';

export default function StayDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('properties')
      .select('*, property_photos(id, storage_path, order_index)')
      .eq('id', id)
      .in('status', ['active', 'published'])
      .single()
      .then(({ data }) => {
        setProperty(data as Property);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!property) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🏠</div>
        <p className="text-zinc-500">Property not found.</p>
        <button onClick={() => navigate('/stays')} className="mt-4 text-amber-500 hover:underline">← Back to stays</button>
      </div>
    </div>
  );

  const photos = [...(property.property_photos ?? [])].sort((a, b) => a.order_index - b.order_index);
  const tenancyOn = Object.entries(property.tenancy_terms ?? {}).filter(([, v]) => v).map(([k]) => k);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <button onClick={() => navigate('/stays')} className="font-serif text-xl italic text-white hover:text-amber-500 transition-colors">
          ← All Stays
        </button>
        <button
          onClick={() => navigate(`/stays/${id}/enquire`)}
          className="bg-amber-500 text-black font-bold px-6 py-2.5 rounded-lg hover:bg-amber-400 transition-all"
        >
          Enquire Now
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Photos */}
        {photos.length > 0 && (
          <div className="mb-10">
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-zinc-900">
              <img
                src={getPhotoUrl(photos[activePhoto]?.storage_path)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((ph, i) => (
                  <button
                    key={ph.id}
                    onClick={() => setActivePhoto(i)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activePhoto ? 'border-amber-500' : 'border-transparent'
                    }`}
                  >
                    <img src={getPhotoUrl(ph.storage_path)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main info */}
          <div className="lg:col-span-2">
            <div className="text-amber-500 text-xs uppercase tracking-widest mb-2">
              {property.property_type} · {property.area}, Koh Samui
            </div>
            <h1 className="font-serif text-4xl italic mb-6">
              {property.title ?? `${property.area} ${property.property_type}`}
            </h1>

            {/* Adjectives */}
            {property.adjectives?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {property.adjectives.map(adj => (
                  <span key={adj} className="px-3 py-1 border border-zinc-700 rounded-full text-sm text-zinc-300">
                    {adj}
                  </span>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {property.min_rental_term && (
                <div className="bg-zinc-900 rounded-lg p-4">
                  <div className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Min. Stay</div>
                  <div className="text-white font-semibold">{property.min_rental_term}</div>
                </div>
              )}
              {property.available_from && (
                <div className="bg-zinc-900 rounded-lg p-4">
                  <div className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Available</div>
                  <div className="text-white font-semibold">
                    {new Date(property.available_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              )}
            </div>

            {/* Nearby amenities */}
            {property.amenities?.length > 0 && (
              <div className="mb-8">
                <div className="text-xs text-zinc-600 uppercase tracking-widest mb-3">Nearby</div>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map(a => (
                    <span key={a} className="px-3 py-1.5 bg-zinc-900 rounded-lg text-sm text-zinc-300">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Tenancy terms */}
            {tenancyOn.length > 0 && (
              <div className="mb-8">
                <div className="text-xs text-zinc-600 uppercase tracking-widest mb-3">Terms</div>
                <div className="flex flex-wrap gap-2">
                  {tenancyOn.map(t => (
                    <span key={t} className="px-3 py-1.5 border border-green-800 text-green-400 rounded-lg text-sm">✓ {t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: price + contact */}
          <div className="lg:col-span-1">
            <div className="border border-zinc-800 rounded-xl p-6 sticky top-6">
              {property.price_eur && (
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white">€{property.price_eur.toLocaleString()}</div>
                  <div className="text-zinc-600 text-sm">per month</div>
                  <div className="mt-1 text-zinc-700 text-xs">
                    ≈ ${property.price_usd?.toLocaleString()} USD · ฿{property.price_thb?.toLocaleString()} THB
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/stays/${id}/enquire`)}
                className="w-full bg-amber-500 text-black font-bold py-3.5 rounded-lg hover:bg-amber-400 transition-all mb-3"
              >
                Enquire Now
              </button>

              {property.contact_whatsapp && (
                <a
                  href={`https://wa.me/${property.contact_whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 border border-green-700 text-green-400 font-semibold py-3 rounded-lg hover:bg-green-900/20 transition-all"
                >
                  <span>💬</span> WhatsApp
                </a>
              )}

              {property.contact_facebook && (
                <a
                  href={property.contact_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 w-full flex items-center justify-center gap-2 border border-blue-800 text-blue-400 font-semibold py-3 rounded-lg hover:bg-blue-900/20 transition-all"
                >
                  <span>📘</span> Facebook
                </a>
              )}

              {property.contact_name && (
                <div className="mt-4 pt-4 border-t border-zinc-800 text-sm text-zinc-600 text-center">
                  Listed by {property.contact_name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
