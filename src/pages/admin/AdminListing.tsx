import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase, getPhotoUrl } from '../../lib/supabase';
import { Property, PropertyStatus, PropertyType } from '../../types';

const AREAS = ['Chaweng','Chaweng Noi','Lamai','Bang Rak','Bophut','Maenam','Choeng Mon','Nathon','Lipa Noi','Taling Ngam'];
const PROPERTY_TYPES: PropertyType[] = ['Apartment','House','Villa','Studio'];
const AMENITIES = ['🏖️ Beach','🏊 Pool','🛒 Supermarket','🍜 Restaurants','🏥 Hospital','🏋️ Gym','🌙 Night Market','✈️ Airport','⛴️ Ferry Terminal','🧘 Yoga Studio','🥊 Muay Thai Gym','💊 Pharmacy','🏪 7-Eleven','💻 Co-working'];
const ADJECTIVES = ['Peaceful','Modern','Tropical','Spacious','Cozy','Private','Rustic','Sea-view','Romantic','Bright','Secluded','Stylish','Family-friendly','Garden','Minimalist','Pool','Traditional'];
const TERMS = ['1 week','2 weeks','1 month','3 months','6 months','1 year','Flexible'];
const TENANCY_OPTIONS = ['Pets allowed','No smoking','Bills included','Furnished','Couples only','Solo tenants only','Long-term preferred','Short-term welcome'];

const STATUS_STYLES: Record<string, string> = {
  active:    'bg-green-900/40 text-green-400 border-green-800',
  published: 'bg-green-900/40 text-green-400 border-green-800',
  pending:   'bg-amber-900/40 text-amber-400 border-amber-800',
  draft:     'bg-zinc-800 text-zinc-400 border-zinc-700',
  rejected:  'bg-red-900/40 text-red-400 border-red-800',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-zinc-800 rounded-xl p-6 mb-6">
      <h2 className="text-amber-500 text-xs uppercase tracking-widest mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none text-sm transition-colors";

export default function AdminListing() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('properties')
      .select('*, property_photos(id, storage_path, order_index)')
      .eq('id', id)
      .single()
      .then(({ data }) => setProperty(data as Property));
  }, [id]);

  const set = <K extends keyof Property>(key: K, val: Property[K]) =>
    setProperty(p => p ? { ...p, [key]: val } : p);

  const toggleArray = (key: 'amenities' | 'adjectives', val: string) => {
    const arr = (property?.[key] ?? []) as string[];
    set(key as keyof Property, (arr.includes(val)
      ? arr.filter(a => a !== val)
      : [...arr, val]) as Property[typeof key]);
  };

  const toggleTenancy = (term: string) => {
    const t = { ...(property?.tenancy_terms ?? {}) };
    t[term] = !t[term];
    set('tenancy_terms', t);
  };

  async function save() {
    if (!id || !property) return;
    setSaving(true);
    await supabase.from('properties').update({
      title: property.title,
      area: property.area,
      property_type: property.property_type,
      amenities: property.amenities,
      adjectives: property.adjectives,
      min_rental_term: property.min_rental_term,
      available_from: property.available_from,
      price_eur: property.price_eur,
      price_usd: property.price_usd,
      price_thb: property.price_thb,
      tenancy_terms: property.tenancy_terms,
      contact_name: property.contact_name,
      contact_email: property.contact_email,
      contact_whatsapp: property.contact_whatsapp,
      contact_facebook: property.contact_facebook,
    }).eq('id', id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function updateStatus(status: PropertyStatus) {
    if (!id) return;
    setSaving(true);
    await supabase.from('properties').update({ status }).eq('id', id);
    set('status', status);
    setSaving(false);
  }

  if (!property) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const photos = [...(property.property_photos ?? [])].sort((a, b) => a.order_index - b.order_index);
  const amenities = (property.amenities ?? []) as string[];
  const adjectives = (property.adjectives ?? []) as string[];
  const tenancy = property.tenancy_terms ?? {};

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800 sticky top-0 bg-black z-10">
        <button onClick={() => navigate('/admin/dashboard')} className="text-zinc-400 hover:text-white transition-colors text-sm">
          ← Dashboard
        </button>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-1 rounded-full border ${STATUS_STYLES[property.status] ?? STATUS_STYLES.draft}`}>
            {property.status}
          </span>
          <button
            onClick={save}
            disabled={saving}
            className="bg-amber-500 text-black font-bold px-5 py-2 rounded-lg hover:bg-amber-400 transition-all disabled:opacity-40 text-sm"
          >
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Photos */}
        {photos.length > 0 && (
          <div className="mb-8">
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-3 bg-zinc-900">
              <img src={getPhotoUrl(photos[activePhoto]?.storage_path)} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((ph, i) => (
                <button key={ph.id} onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === activePhoto ? 'border-amber-500' : 'border-zinc-800'}`}>
                  <img src={getPhotoUrl(ph.storage_path)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Property basics */}
        <Section title="Property">
          <Field label="Title / Listing Name">
            <input className={inputCls} value={property.title ?? ''} onChange={e => set('title', e.target.value)} placeholder="e.g. Bang Rak Studio" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Area">
              <select className={inputCls} value={property.area ?? ''} onChange={e => set('area', e.target.value)}>
                <option value="">Select area</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Property Type">
              <select className={inputCls} value={property.property_type ?? ''} onChange={e => set('property_type', e.target.value as PropertyType)}>
                <option value="">Select type</option>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        {/* Adjectives */}
        <Section title={`Description Words (${adjectives.length}/5)`}>
          <div className="flex flex-wrap gap-2">
            {ADJECTIVES.map(a => (
              <button key={a} onClick={() => toggleArray('adjectives', a)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                  adjectives.includes(a)
                    ? 'bg-amber-500 border-amber-500 text-black font-semibold'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}>
                {a}
              </button>
            ))}
          </div>
        </Section>

        {/* Amenities */}
        <Section title={`Nearby Amenities (${amenities.length}/4)`}>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <button key={a} onClick={() => toggleArray('amenities', a)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                  amenities.includes(a)
                    ? 'bg-amber-500 border-amber-500 text-black font-semibold'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}>
                {a}
              </button>
            ))}
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Price EUR / mo">
              <input type="number" className={inputCls} value={property.price_eur ?? ''} onChange={e => set('price_eur', parseFloat(e.target.value) || null)} />
            </Field>
            <Field label="Price USD / mo">
              <input type="number" className={inputCls} value={property.price_usd ?? ''} onChange={e => set('price_usd', parseFloat(e.target.value) || null)} />
            </Field>
            <Field label="Price THB / mo">
              <input type="number" className={inputCls} value={property.price_thb ?? ''} onChange={e => set('price_thb', parseFloat(e.target.value) || null)} />
            </Field>
          </div>
        </Section>

        {/* Rental terms */}
        <Section title="Rental Terms">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <Field label="Minimum Rental Term">
              <select className={inputCls} value={property.min_rental_term ?? ''} onChange={e => set('min_rental_term', e.target.value)}>
                <option value="">Select term</option>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Available From">
              <input type="date" className={inputCls} value={property.available_from ?? ''} onChange={e => set('available_from', e.target.value)} />
            </Field>
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Tenancy Rules</div>
          <div className="flex flex-wrap gap-2">
            {TENANCY_OPTIONS.map(opt => (
              <button key={opt} onClick={() => toggleTenancy(opt)}
                className={`px-3 py-1.5 rounded-full border text-sm transition-all ${
                  tenancy[opt]
                    ? 'bg-amber-500 border-amber-500 text-black font-semibold'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                }`}>
                {opt}
              </button>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section title="Host Contact">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name">
              <input className={inputCls} value={property.contact_name ?? ''} onChange={e => set('contact_name', e.target.value)} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} value={property.contact_email ?? ''} onChange={e => set('contact_email', e.target.value)} />
            </Field>
            <Field label="WhatsApp">
              <input className={inputCls} value={property.contact_whatsapp ?? ''} onChange={e => set('contact_whatsapp', e.target.value)} placeholder="+66..." />
            </Field>
            <Field label="Facebook">
              <input className={inputCls} value={property.contact_facebook ?? ''} onChange={e => set('contact_facebook', e.target.value)} placeholder="Profile URL or name" />
            </Field>
          </div>
        </Section>

        {/* Status controls */}
        <Section title="Listing Status">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => updateStatus('active')} disabled={saving || property.status === 'active'}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-all disabled:opacity-40">
              ✓ Publish (Active)
            </button>
            <button onClick={() => updateStatus('draft')} disabled={saving || property.status === 'draft'}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:border-zinc-500 transition-all disabled:opacity-40">
              Move to Draft
            </button>
            <button onClick={() => updateStatus('rejected')} disabled={saving || property.status === 'rejected'}
              className="px-4 py-2 rounded-lg border border-red-900 text-red-400 text-sm hover:bg-red-900/20 transition-all disabled:opacity-40">
              Reject
            </button>
          </div>
          {property.facebook_post_id && (
            <div className="mt-4 p-3 border border-blue-900 rounded-lg">
              <div className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Facebook Post</div>
              <div className="text-blue-400 text-sm">ID: {property.facebook_post_id}</div>
              {property.facebook_posted_at && (
                <div className="text-zinc-600 text-xs">{new Date(property.facebook_posted_at).toLocaleString()}</div>
              )}
            </div>
          )}
        </Section>

      </div>
    </div>
  );
}
