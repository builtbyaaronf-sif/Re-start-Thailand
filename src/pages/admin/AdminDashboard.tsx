import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, getPhotoUrl } from '../../lib/supabase';
import { useAuth, signOut } from '../../hooks/useAuth';
import { Property, PropertyStatus } from '../../types';

const TABS: { label: string; status: PropertyStatus | 'all' }[] = [
  { label: 'All', status: 'all' },
  { label: 'Pending', status: 'pending' },
  { label: 'Published', status: 'published' },
  { label: 'Rejected', status: 'rejected' },
  { label: 'Draft', status: 'draft' },
];

const STATUS_STYLES: Record<PropertyStatus, string> = {
  published: 'bg-green-900/40 text-green-400 border-green-800',
  pending: 'bg-amber-900/40 text-amber-400 border-amber-800',
  draft: 'bg-zinc-800 text-zinc-400 border-zinc-700',
  rejected: 'bg-red-900/40 text-red-400 border-red-800',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tab, setTab] = useState<PropertyStatus | 'all'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAll(); }, [tab]);

  async function fetchAll() {
    setLoading(true);
    let q = supabase
      .from('properties')
      .select('*, property_photos(storage_path, order_index)')
      .order('created_at', { ascending: false });
    if (tab !== 'all') q = q.eq('status', tab);
    const { data } = await q;
    setProperties((data as Property[]) ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: PropertyStatus) {
    await supabase.from('properties').update({ status }).eq('id', id);
    fetchAll();
  }

  const getCover = (p: Property) => {
    const photos = [...(p.property_photos ?? [])].sort((a, b) => a.order_index - b.order_index);
    return photos[0] ? getPhotoUrl(photos[0].storage_path) : null;
  };

  const counts = properties.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <div className="font-serif text-xl italic text-white">RE:START <span className="text-amber-500 text-sm not-italic">Admin</span></div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/settings')} className="text-xs text-zinc-500 hover:text-white border border-zinc-800 px-3 py-1.5 rounded-lg transition-all">
            ⚙️ Settings
          </button>
          <span className="text-xs text-zinc-600">{profile?.full_name}</span>
          <button onClick={() => signOut().then(() => navigate('/'))} className="text-xs text-zinc-600 hover:text-zinc-400">Sign out</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl italic mb-8">Listings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-zinc-800 pb-0">
          {TABS.map(t => (
            <button
              key={t.status}
              onClick={() => setTab(t.status)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-all ${
                tab === t.status
                  ? 'border-amber-500 text-white'
                  : 'border-transparent text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {t.label}
              {t.status !== 'all' && counts[t.status] ? (
                <span className="ml-1.5 text-xs text-zinc-600">({counts[t.status]})</span>
              ) : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 text-zinc-700">
            No {tab === 'all' ? '' : tab} listings.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {properties.map(p => (
              <div key={p.id} className="flex gap-4 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
                <div className="w-28 h-24 flex-shrink-0 bg-zinc-900">
                  {getCover(p) ? (
                    <img src={getCover(p)!} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700 text-2xl">🏠</div>
                  )}
                </div>
                <div className="flex-1 py-3 pr-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-white font-semibold text-sm">{p.title ?? `${p.area} ${p.property_type}`}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status]}`}>{p.status}</span>
                    </div>
                    <div className="text-zinc-600 text-xs">
                      {p.area} · {p.property_type} {p.price_eur ? `· €${p.price_eur.toLocaleString()}/mo` : ''}
                    </div>
                    <div className="text-zinc-700 text-xs mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <button
                      onClick={() => navigate(`/admin/listings/${p.id}`)}
                      className="text-xs border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all"
                    >
                      Review →
                    </button>
                    {p.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(p.id, 'published')}
                          className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-500 transition-all"
                        >
                          Publish ✓
                        </button>
                        <button
                          onClick={() => updateStatus(p.id, 'rejected')}
                          className="text-xs border border-red-900 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-900/20 transition-all"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {p.status === 'published' && (
                      <button
                        onClick={() => navigate(`/stays/${p.id}`)}
                        className="text-xs text-amber-500 border border-amber-800 px-3 py-1.5 rounded-lg hover:border-amber-600 transition-all"
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
