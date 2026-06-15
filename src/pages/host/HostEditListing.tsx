import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Property } from '../../types';

export default function HostEditListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from('properties').select('*').eq('id', id).single()
      .then(({ data }) => setProperty(data as Property));
  }, [id]);

  async function handleSave() {
    if (!id || !property) return;
    setSaving(true);
    await supabase.from('properties').update({
      area: property.area,
      property_type: property.property_type,
      min_rental_term: property.min_rental_term,
      price_eur: property.price_eur,
      contact_name: property.contact_name,
      contact_email: property.contact_email,
      contact_whatsapp: property.contact_whatsapp,
      contact_facebook: property.contact_facebook,
      // Re-submit for review if it was rejected
      status: property.status === 'rejected' ? 'pending' : property.status,
    }).eq('id', id);
    setSaving(false);
    navigate('/host/dashboard');
  }

  if (!property) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <button onClick={() => navigate('/host/dashboard')} className="text-zinc-400 hover:text-white transition-colors">
          ← Dashboard
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 text-black font-bold px-5 py-2.5 rounded-lg hover:bg-amber-400 transition-all disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-10">
        <div className="text-amber-500 text-xs uppercase tracking-widest mb-2">Edit Listing</div>
        <h1 className="font-serif text-3xl italic mb-8">{property.title}</h1>

        <div className="flex flex-col gap-5">
          {[
            { label: 'Contact Name', key: 'contact_name', type: 'text' },
            { label: 'Contact Email', key: 'contact_email', type: 'email' },
            { label: 'WhatsApp', key: 'contact_whatsapp', type: 'tel' },
            { label: 'Facebook URL', key: 'contact_facebook', type: 'url' },
            { label: 'Price (EUR)', key: 'price_eur', type: 'number' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">{label}</label>
              <input
                type={type}
                value={(property as Record<string, unknown>)[key]?.toString() ?? ''}
                onChange={e => setProperty(p => p ? { ...p, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value } : p)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
              />
            </div>
          ))}
        </div>

        {property.status === 'rejected' && (
          <div className="mt-8 p-4 border border-amber-800 rounded-xl bg-amber-900/10">
            <p className="text-amber-400 text-sm">
              This listing was rejected. Saving will resubmit it for admin review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
