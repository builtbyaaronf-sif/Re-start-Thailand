import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Property } from '../../types';

export default function StayEnquire() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    guest_name: '',
    guest_email: '',
    guest_whatsapp: '',
    check_in: '',
    check_out: '',
    message: '',
  });

  useEffect(() => {
    if (!id) return;
    supabase.from('properties').select('*').eq('id', id).single()
      .then(({ data }) => setProperty(data as Property));
  }, [id]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !form.guest_name || !form.guest_email) return;
    setSubmitting(true);
    const { error } = await supabase.from('enquiries').insert({
      property_id: id,
      ...form,
      check_in: form.check_in || null,
      check_out: form.check_out || null,
      guest_whatsapp: form.guest_whatsapp || null,
      message: form.message || null,
    });
    setSubmitting(false);
    if (!error) setSubmitted(true);
  }

  if (submitted) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="font-serif text-3xl italic mb-4">Enquiry sent!</h1>
        <p className="text-zinc-500 mb-8">
          The host will be in touch at <strong className="text-white">{form.guest_email}</strong> shortly.
        </p>
        {property?.contact_whatsapp && (
          <a
            href={`https://wa.me/${property.contact_whatsapp.replace(/\D/g, '')}?text=Hi, I'm interested in your property on RE:START Thailand.`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-500 transition-all mb-4"
          >
            💬 Follow up on WhatsApp
          </a>
        )}
        <div>
          <button onClick={() => navigate('/stays')} className="text-amber-500 hover:underline text-sm">
            ← Back to all stays
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center px-8 py-5 border-b border-zinc-800">
        <button onClick={() => navigate(`/stays/${id}`)} className="text-zinc-400 hover:text-white transition-colors">
          ← Back to listing
        </button>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-amber-500 text-xs uppercase tracking-widest mb-3">Enquire</div>
        <h1 className="font-serif text-3xl italic mb-2">
          {property ? `${property.area} ${property.property_type}` : 'This Property'}
        </h1>
        {property?.price_eur && (
          <p className="text-zinc-500 mb-8">From €{property.price_eur.toLocaleString()}/month</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">Your Name *</label>
            <input
              type="text" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">Email *</label>
            <input
              type="email" required value={form.guest_email} onChange={e => set('guest_email', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">WhatsApp</label>
            <input
              type="tel" value={form.guest_whatsapp} onChange={e => set('guest_whatsapp', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
              placeholder="+66 XX XXX XXXX"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">Move in</label>
              <input
                type="date" value={form.check_in} onChange={e => set('check_in', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">Move out</label>
              <input
                type="date" value={form.check_out} onChange={e => set('check_out', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">Message</label>
            <textarea
              value={form.message} onChange={e => set('message', e.target.value)} rows={4}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors resize-none"
              placeholder="Tell the host a bit about yourself and what you're looking for..."
            />
          </div>

          <button
            type="submit" disabled={submitting || !form.guest_name || !form.guest_email}
            className="w-full bg-amber-500 text-black font-bold py-4 rounded-lg hover:bg-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? 'Sending...' : 'Send Enquiry →'}
          </button>

          <p className="text-xs text-zinc-700 text-center">
            Your details are shared only with the host.
          </p>
        </form>
      </div>
    </div>
  );
}
