import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getPhotoUrl } from '../../lib/supabase';
import { Property } from '../../types';

const AREAS = ['All', 'Chaweng', 'Chaweng Noi', 'Lamai', 'Bang Rak', 'Bophut', 'Maenam', 'Choeng Mon', 'Nathon', 'Lipa Noi', 'Taling Ngam'];
const TYPES = ['All', 'Apartment', 'House', 'Villa', 'Studio'];

export default function StaysBrowse() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [area, setArea] = useState('All');
  const [type, setType] = useState('All');

  useEffect(() => {
    fetchProperties();
  }, [area, type]);

  async function fetchProperties() {
    setLoading(true);
    let query = supabase
      .from('properties')
      .select('*, property_photos(storage_path, order_index)')
      .in('status', ['active', 'published'])
      .order('created_at', { ascending: false });

    if (area !== 'All') query = query.eq('area', area);
    if (type !== 'All') query = query.eq('property_type', type);

    const { data } = await query;
    setProperties((data as Property[]) ?? []);
    setLoading(false);
  }

  const getCoverPhoto = (p: Property) => {
    const photos = p.property_photos ?? [];
    const sorted = [...photos].sort((a, b) => a.order_index - b.order_index);
    return sorted[0] ? getPhotoUrl(sorted[0].storage_path) : null;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <button onClick={() => navigate('/')} className="font-serif text-xl italic text-white hover:text-amber-500 transition-colors">
          ← RE:START
        </button>
        <button onClick={() => navigate('/host/listings/new')} className="border border-amber-500 text-amber-500 text-sm px-4 py-2 rounded-lg hover:bg-amber-500 hover:text-black transition-all">
          List Your Property
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl italic mb-2">Stays on Koh Samui</h1>
        <p className="text-zinc-500 mb-10">{properties.length} propert{properties.length !== 1 ? 'ies' : 'y'} available</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-6 mb-10">
          <div>
            <div className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Area</div>
            <div className="flex flex-wrap gap-2">
              {AREAS.map(a => (
                <button
                  key={a}
                  onClick={() => setArea(a)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                    area === a
                      ? 'bg-amber-500 border-amber-500 text-black font-semibold'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-zinc-600 uppercase tracking-widest mb-2">Type</div>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
                    type === t
                      ? 'bg-white border-white text-black font-semibold'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 text-zinc-600">
            <div className="text-4xl mb-4">🏠</div>
            <p>No properties found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/stays/${p.id}`)}
                className="group text-left border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all"
              >
                {/* Cover photo */}
                <div className="aspect-[4/3] bg-zinc-900 overflow-hidden">
                  {getCoverPhoto(p) ? (
                    <img
                      src={getCoverPhoto(p)!}
                      alt={p.title ?? ''}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-4xl">🏠</div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-xs text-amber-500 uppercase tracking-widest mb-1">
                        {p.property_type} · {p.area}
                      </div>
                      <div className="text-white font-semibold text-lg leading-tight">
                        {p.title ?? `${p.area} ${p.property_type}`}
                      </div>
                    </div>
                    {p.price_eur && (
                      <div className="text-right flex-shrink-0 ml-3">
                        <div className="text-white font-bold">€{p.price_eur.toLocaleString()}</div>
                        <div className="text-zinc-600 text-xs">/month</div>
                      </div>
                    )}
                  </div>

                  {/* Adjectives */}
                  {p.adjectives?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {p.adjectives.slice(0, 3).map(adj => (
                        <span key={adj} className="text-xs text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded-full">
                          {adj}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 text-amber-500 text-sm group-hover:translate-x-1 transition-transform">
                    View details →
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
