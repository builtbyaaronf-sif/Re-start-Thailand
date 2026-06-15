import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, getPhotoUrl } from '../../lib/supabase';
import { Property, PropertyStatus } from '../../types';

export default function AdminListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase.from('properties')
      .select('*, property_photos(id, storage_path, order_index)')
      .eq('id', id).single()
      .then(({ data }) => setProperty(data as Property));
  }, [id]);

  async function updateStatus(status: PropertyStatus) {
    if (!id) return;
    setSaving(true);
    await supabase.from('properties').update({ status }).eq('id', id);
    setProperty(p => p ? { ...p, status } : p);
    setSaving(false);
  }

  async function saveEdits() {
    if (!id || !property) return;
    setSaving(true);
    await supabase.from('properties').update({
      title: property.title,
      contact_name: property.contact_name,
      contact_email: property.contact_email,
      contact_whatsapp: property.contact_whatsapp,
      price_eur: property.price_eur,
    }).eq('id', id);
    setSaving(false);
  }

  if (!property) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const photos = [...(property.property_photos ?? [])].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <button onClick={() => navigate('/admin/dashboard')} className="text-zinc-400 hover:text-white transition-colors">
          ← Admin Dashboard
        </button>
        <div className="flex gap-3">
          {property.status === 'pending' && (
            <>
              <button
                onClick={() => updateStatus('published')}
                disabled={saving}
                className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-green-500 transition-all disabled:opacity-40"
              >
                ✓ Publish
              </button>
              <button
                onClick={() => updateStatus('rejected')}
                disabled={saving}
                className="border border-red-800 text-red-400 font-bold px-5 py-2.5 rounded-lg hover:bg-red-900/20 transition-all disabled:opacity-40"
              >
                Reject
              </button>
            </>
          )}
          {property.status === 'published' && (
            <button
              onClick={() => updateStatus('rejected')}
              disabled={saving}
              className="border border-red-800 text-red-400 px-5 py-2.5 rounded-lg hover:bg-red-900/20 transition-all disabled:opacity-40"
            >
              Unpublish
            </button>
          )}
          {property.status === 'rejected' && (
            <button
              onClick={() => updateStatus('published')}
              disabled={saving}
              className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-lg hover:bg-green-500 transition-all disabled:opacity-40"
            >
              ✓ Publish anyway
            </button>
          )}
          <button
            onClick={saveEdits}
            disabled={saving}
            className="bg-amber-500 text-black font-bold px-5 py-2.5 rounded-lg hover:bg-amber-400 transition-all disabled:opacity-40"
          >
            {saving ? 'Saving...' : 'Save Edits'}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Photos */}
        {photos.length > 0 && (
          <div className="mb-10">
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-zinc-900">
              <img src={getPhotoUrl(photos[activePhoto]?.storage_path)} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {photos.map((ph, i) => (
                <button key={ph.id} onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-amber-500' : 'border-transparent'}`}>
                  <img src={getPhotoUrl(ph.storage_path)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listing info */}
          <div>
            <div className="text-amber-500 text-xs uppercase tracking-widest mb-1">{property.property_type} · {property.area}</div>
            <div className="mb-4">
              <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1">Title (editable)</label>
              <input
                value={property.title ?? ''}
                onChange={e => setProperty(p => p ? { ...p, title: e.target.value } : p)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white font-serif text-xl italic focus:border-amber-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {(property.adjectives ?? []).map(a => (
                <span key={a} className="px-3 py-1 border border-zinc-700 rounded-full text-sm text-zinc-400">{a}</span>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-zinc-900 rounded-lg p-3">
                <div className="text-zinc-600 text-xs uppercase tracking-widest mb-1">Min. term</div>
                <div className="text-white">{property.min_rental_term}</div>
              </div>
              <div className="bg-zinc-900 rounded-lg p-3">
                <div className="text-zinc-600 text-xs uppercase tracking-widest mb-1">Available</div>
                <div className="text-white">{property.available_from ?? '—'}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-zinc-600 text-xs uppercase tracking-widest mb-2">Nearby</div>
              <div className="flex flex-wrap gap-2">
                {(property.amenities ?? []).map(a => (
                  <span key={a} className="text-xs px-2 py-1 bg-zinc-900 rounded text-zinc-400">{a}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="flex flex-col gap-4">
            {[
              { label: 'Contact Name', key: 'contact_name', type: 'text' },
              { label: 'Contact Email', key: 'contact_email', type: 'email' },
              { label: 'WhatsApp', key: 'contact_whatsapp', type: 'tel' },
              { label: 'Price EUR', key: 'price_eur', type: 'number' },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">{label}</label>
                <input
                  type={type}
                  value={(property as Record<string, unknown>)[key]?.toString() ?? ''}
                  onChange={e => setProperty(p => p ? { ...p, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value } : p)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none text-sm"
                />
              </div>
            ))}

            {property.facebook_post_id && (
              <div className="p-3 border border-blue-900 rounded-lg">
                <div className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Facebook Post</div>
                <div className="text-blue-400 text-sm">Posted · ID: {property.facebook_post_id}</div>
                {property.facebook_posted_at && (
                  <div className="text-zinc-600 text-xs">{new Date(property.facebook_posted_at).toLocaleString()}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
