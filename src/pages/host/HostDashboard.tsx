import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getPhotoUrl } from '../../lib/supabase';
import { useAuth, signOut } from '../../hooks/useAuth';
import { Property, PropertyStatus } from '../../types';

const STATUS_STYLES: Record<PropertyStatus, string> = {
  published: 'bg-green-900/40 text-green-400 border-green-800',
  pending: 'bg-amber-900/40 text-amber-400 border-amber-800',
  draft: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  rejected: 'bg-red-900/40 text-red-400 border-red-800',
};

export default function HostDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('properties')
      .select('*, property_photos(storage_path, order_index)')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProperties((data as Property[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  const getCover = (p: Property) => {
    const photos = [...(p.property_photos ?? [])].sort((a, b) => a.order_index - b.order_index);
    return photos[0] ? getPhotoUrl(photos[0].storage_path) : null;
  };

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <button onClick={() => navigate('/')} className="font-serif text-xl italic text-white hover:text-amber-500 transition-colors">
          RE:START
        </button>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-600">{profile?.full_name ?? user?.email}</span>
          <button onClick={handleSignOut} className="text-xs text-zinc-600 hover:text-zinc-400">Sign out</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-amber-500 text-xs uppercase tracking-widest mb-1">Host Portal</div>
            <h1 className="font-serif text-3xl italic">My Listings</h1>
          </div>
          <button
            onClick={() => navigate('/host/listings/new')}
            className="bg-amber-500 text-black font-bold px-5 py-2.5 rounded-lg hover:bg-amber-400 transition-all"
          >
            + New Listing
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-zinc-800 rounded-xl">
            <div className="text-4xl mb-4">🏠</div>
            <p className="text-zinc-500 mb-6">You haven't listed any properties yet.</p>
            <button
              onClick={() => navigate('/host/listings/new')}
              className="bg-amber-500 text-black font-bold px-6 py-3 rounded-lg hover:bg-amber-400 transition-all"
            >
              List your first property →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {properties.map(p => (
              <div key={p.id} className="flex gap-4 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
                {/* Cover photo */}
                <div className="w-32 h-28 flex-shrink-0 bg-zinc-900">
                  {getCover(p) ? (
                    <img src={getCover(p)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-2xl">🏠</div>
                  )}
                </div>

                <div className="flex-1 py-4 pr-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-white font-semibold">{p.title ?? `${p.area} ${p.property_type}`}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                    <div className="text-zinc-600 text-sm">
                      {p.area} · {p.property_type}
                      {p.price_eur ? ` · €${p.price_eur.toLocaleString()}/mo` : ''}
                    </div>
                    {p.status === 'pending' && (
                      <p className="text-amber-600 text-xs mt-1">⏳ Awaiting admin review before going live</p>
                    )}
                    {p.status === 'rejected' && (
                      <p className="text-red-500 text-xs mt-1">✗ Listing was rejected — edit and resubmit</p>
                    )}
                    {p.facebook_posted_at && (
                      <p className="text-blue-500 text-xs mt-1">📘 Posted to Facebook</p>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button
                      onClick={() => navigate(`/host/listings/${p.id}/edit`)}
                      className="text-xs text-zinc-500 hover:text-white border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Edit
                    </button>
                    {p.status === 'published' && (
                      <button
                        onClick={() => navigate(`/stays/${p.id}`)}
                        className="text-xs text-amber-500 hover:text-amber-400 border border-amber-800 hover:border-amber-600 px-3 py-1.5 rounded-lg transition-all"
                      >
                        View live →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
