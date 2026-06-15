import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, uploadPhoto, convertPrice } from '../../lib/supabase';
import { useAuth, signUp, signInWithEmail } from '../../hooks/useAuth';
import { WizardData, PropertyType } from '../../types';

const AREAS = ['Chaweng','Chaweng Noi','Lamai','Bang Rak','Bophut','Maenam','Choeng Mon','Nathon','Lipa Noi','Taling Ngam'];
const AMENITIES = ['🏖️ Beach','🏊 Pool','🛒 Supermarket','🍜 Restaurants','🏥 Hospital','🏋️ Gym','🌙 Night Market','✈️ Airport','⛴️ Ferry Terminal','🧘 Yoga Studio','🥊 Muay Thai Gym','💊 Pharmacy','🏪 7-Eleven','💻 Co-working'];
const ADJECTIVES = ['Peaceful','Modern','Tropical','Spacious','Cozy','Private','Rustic','Sea-view','Romantic','Bright','Secluded','Stylish','Family-friendly','Garden','Minimalist','Pool','Traditional'];
const TERMS = ['1 week','2 weeks','1 month','3 months','6 months','1 year','Flexible'];
const TENANCY_OPTIONS = ['Pets allowed','No smoking','Bills included','Furnished','Couples only','Solo tenants only','Long-term preferred','Short-term welcome'];
const TOTAL_STEPS = 11;

const PROPERTY_TYPES: { type: PropertyType; icon: string }[] = [
  { type: 'Apartment', icon: '🏢' },
  { type: 'House', icon: '🏠' },
  { type: 'Villa', icon: '🏖️' },
  { type: 'Studio', icon: '🛏️' },
];

export default function HostWizard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({});
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [converted, setConverted] = useState<{ usd: number; thb: number; eur: number } | null>(null);
  const [currency, setCurrency] = useState<'EUR' | 'USD' | 'THB'>('EUR');
  const [priceInput, setPriceInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSent, setAuthSent] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const set = (k: keyof WizardData, v: unknown) => setData(d => ({ ...d, [k]: v }));

  const goNext = () => { setDirection('forward'); setStep(s => Math.min(s + 1, TOTAL_STEPS)); };
  const goBack = () => { setDirection('back'); setStep(s => Math.max(s - 1, 1)); };

  const toggleMulti = (key: 'amenities' | 'adjectives', val: string, max: number) => {
    const arr = (data[key] ?? []) as string[];
    if (arr.includes(val)) {
      set(key, arr.filter(a => a !== val));
    } else if (arr.length < max) {
      set(key, [...arr, val]);
    }
  };

  const toggleTenancy = (term: string) => {
    const t = { ...(data.tenancy_terms ?? {}) };
    t[term] = !t[term];
    set('tenancy_terms', t);
  };

  const handlePrice = async (val: string) => {
    setPriceInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      const conv = await convertPrice(num, currency);
      setConverted(conv);
      set('price', num);
      set('currency', currency);
    }
  };

  const handleCurrency = async (c: 'EUR' | 'USD' | 'THB') => {
    setCurrency(c);
    const num = parseFloat(priceInput);
    if (!isNaN(num) && num > 0) {
      const conv = await convertPrice(num, c);
      setConverted(conv);
      set('currency', c);
    }
  };

  const handlePhotos = (files: FileList) => {
    const newFiles = Array.from(files).slice(0, 12 - photoFiles.length);
    setPhotoFiles(f => [...f, ...newFiles]);
    newFiles.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setPhotoPreviews(p => [...p, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const isValid = () => {
    switch (step) {
      case 1: return !!data.area;
      case 2: return !!data.property_type;
      case 3: return (data.amenities?.length ?? 0) === 4;
      case 4: return (data.adjectives?.length ?? 0) === 5;
      case 5: return !!data.min_rental_term;
      case 6: return !!data.available_from;
      case 7: return !!(data.price && data.price > 0);
      case 8: return true;
      case 9: return !!(data.contact_name && data.contact_email);
      case 10: return photoFiles.length >= 1;
      case 11: return true;
      default: return true;
    }
  };

  async function handleSubmit() {
    if (!user) { setShowAuth(true); return; }
    setSubmitting(true);

    // Check auto-approve setting
    const { data: setting } = await supabase.from('site_settings').select('value').eq('key', 'auto_approve_listings').single();
    const autoApprove = setting?.value === 'true';

    // Get price in all currencies
    const prices = await convertPrice(data.price!, data.currency ?? 'EUR');

    // Create property record
    const title = `${data.area} ${data.property_type}`;
    const { data: property, error } = await supabase.from('properties').insert({
      host_id: user.id,
      title,
      area: data.area,
      property_type: data.property_type,
      amenities: data.amenities ?? [],
      adjectives: data.adjectives ?? [],
      min_rental_term: data.min_rental_term,
      available_from: data.available_from,
      price_eur: prices.eur,
      price_usd: prices.usd,
      price_thb: prices.thb,
      tenancy_terms: data.tenancy_terms ?? {},
      contact_name: data.contact_name ?? profile?.full_name,
      contact_email: data.contact_email,
      contact_whatsapp: data.contact_whatsapp,
      contact_facebook: data.contact_facebook,
      status: autoApprove ? 'published' : 'pending',
    }).select().single();

    if (error || !property) { setSubmitting(false); return; }

    // Upload photos
    await Promise.all(
      photoFiles.map((file, i) =>
        uploadPhoto(file, property.id, i).then(path =>
          supabase.from('property_photos').insert({ property_id: property.id, storage_path: path, order_index: i })
        )
      )
    );

    setSubmitting(false);
    navigate('/host/dashboard');
  }

  async function handleSignUp() {
    if (!authEmail || !authName) return;
    await signUp(authEmail, authPassword, authName);
    set('contact_name', authName);
    set('contact_email', authEmail);
    setAuthSent(true);
  }

  const progress = (step / TOTAL_STEPS) * 100;
  const amenities = (data.amenities ?? []) as string[];
  const adjectives = (data.adjectives ?? []) as string[];

  const stepLabel = [
    'Location', 'Type', 'Amenities', 'Description',
    'Rental Term', 'Availability', 'Price', 'Terms',
    'Contact', 'Photos', 'Review',
  ][step - 1];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-lg mx-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-0 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={step === 1 ? () => navigate('/') : goBack}
            className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
          >
            ←
          </button>
          <span className="text-xs text-zinc-600 uppercase tracking-widest">
            Step {step} of {TOTAL_STEPS} · {stepLabel}
          </span>
          {step === 8 || step === 9 ? (
            <button onClick={goNext} className="text-xs text-zinc-600 hover:text-zinc-400 px-2 py-1">Skip</button>
          ) : <div className="w-9" />}
        </div>
        <div className="h-0.5 bg-zinc-900 rounded-full mb-8">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-y-auto">

        {/* Step 1: Area */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">Where is your property?</h2>
            <p className="text-zinc-500 text-sm mb-8">Tap your area on Koh Samui</p>
            <div className="flex flex-wrap gap-3">
              {AREAS.map(a => (
                <button
                  key={a}
                  onClick={() => set('area', a)}
                  className={`px-4 py-2.5 rounded-full border text-sm transition-all ${
                    data.area === a
                      ? 'bg-amber-500 border-amber-500 text-black font-semibold'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >{a}</button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Type */}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">What type of property?</h2>
            <p className="text-zinc-500 text-sm mb-8">Tap one</p>
            <div className="grid grid-cols-2 gap-4">
              {PROPERTY_TYPES.map(({ type, icon }) => (
                <button
                  key={type}
                  onClick={() => set('property_type', type)}
                  className={`p-6 rounded-xl border text-center transition-all ${
                    data.property_type === type
                      ? 'border-amber-500 bg-amber-500/10'
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="text-4xl mb-3">{icon}</div>
                  <div className={`font-semibold ${data.property_type === type ? 'text-amber-500' : 'text-white'}`}>{type}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Amenities */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">What's closest to you?</h2>
            <p className="text-zinc-500 text-sm mb-2">Pick your top 4 nearby amenities</p>
            <p className={`text-xs mb-6 font-medium ${amenities.length === 4 ? 'text-amber-500' : 'text-zinc-600'}`}>
              {amenities.length} of 4 selected{amenities.length === 4 ? ' ✓' : ''}
            </p>
            <div className="flex flex-wrap gap-3">
              {AMENITIES.map(a => {
                const sel = amenities.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleMulti('amenities', a, 4)}
                    className={`px-4 py-2.5 rounded-full border text-sm transition-all ${
                      sel
                        ? 'bg-green-600 border-green-600 text-white font-semibold'
                        : amenities.length === 4
                        ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >{a}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Adjectives */}
        {step === 4 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">Describe it in 5 words</h2>
            <p className="text-zinc-500 text-sm mb-2">Pick the 5 that fit best</p>
            <p className={`text-xs mb-6 font-medium ${adjectives.length === 5 ? 'text-amber-500' : 'text-zinc-600'}`}>
              {adjectives.length} of 5 selected{adjectives.length === 5 ? ' ✓' : ''}
            </p>
            <div className="flex flex-wrap gap-3">
              {ADJECTIVES.map(a => {
                const sel = adjectives.includes(a);
                return (
                  <button
                    key={a}
                    onClick={() => toggleMulti('adjectives', a, 5)}
                    className={`px-4 py-2.5 rounded-full border text-sm transition-all ${
                      sel
                        ? 'bg-purple-600 border-purple-600 text-white font-semibold'
                        : adjectives.length === 5
                        ? 'border-zinc-800 text-zinc-700 cursor-not-allowed'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >{a}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Rental term */}
        {step === 5 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">Minimum rental term?</h2>
            <p className="text-zinc-500 text-sm mb-8">Tap one</p>
            <div className="flex flex-wrap gap-3">
              {TERMS.map(t => (
                <button
                  key={t}
                  onClick={() => set('min_rental_term', t)}
                  className={`px-5 py-3 rounded-full border text-sm transition-all ${
                    data.min_rental_term === t
                      ? 'bg-amber-500 border-amber-500 text-black font-semibold'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Availability */}
        {step === 6 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">Available from when?</h2>
            <p className="text-zinc-500 text-sm mb-8">Quick pick or choose a date</p>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Now', 'In 2 weeks', 'Next month'].map(opt => {
                const dates: Record<string, string> = {
                  'Now': new Date().toISOString().split('T')[0],
                  'In 2 weeks': new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                  'Next month': new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
                };
                return (
                  <button
                    key={opt}
                    onClick={() => set('available_from', dates[opt])}
                    className={`px-5 py-3 rounded-full border text-sm transition-all ${
                      data.available_from === dates[opt]
                        ? 'bg-amber-500 border-amber-500 text-black font-semibold'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                    }`}
                  >{opt}</button>
                );
              })}
            </div>
            <div>
              <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-2">Or choose a specific date</label>
              <input
                type="date"
                value={data.available_from ?? ''}
                onChange={e => set('available_from', e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 7: Price */}
        {step === 7 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">Monthly price?</h2>
            <p className="text-zinc-500 text-sm mb-8">Pick your currency — we'll show the rest</p>

            <div className="flex gap-3 mb-6">
              {(['EUR', 'USD', 'THB'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => handleCurrency(c)}
                  className={`flex-1 py-3 rounded-lg border font-semibold transition-all ${
                    currency === c
                      ? 'bg-amber-500 border-amber-500 text-black'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {c === 'EUR' ? '€ EUR' : c === 'USD' ? '$ USD' : '฿ THB'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 border-2 border-amber-500 rounded-xl px-5 py-4 mb-4">
              <span className="text-amber-500 text-2xl font-bold">
                {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '฿'}
              </span>
              <input
                type="number"
                value={priceInput}
                onChange={e => handlePrice(e.target.value)}
                placeholder="0"
                className="bg-transparent text-4xl font-bold text-white outline-none w-full"
              />
            </div>

            {converted && (
              <div className="grid grid-cols-2 gap-3">
                {currency !== 'USD' && (
                  <div className="bg-zinc-900 rounded-lg p-3 text-center">
                    <div className="text-xs text-zinc-600 uppercase tracking-widest mb-1">USD</div>
                    <div className="text-xl font-bold text-white">${converted.usd.toLocaleString()}</div>
                  </div>
                )}
                {currency !== 'THB' && (
                  <div className="bg-zinc-900 rounded-lg p-3 text-center">
                    <div className="text-xs text-zinc-600 uppercase tracking-widest mb-1">THB</div>
                    <div className="text-xl font-bold text-white">฿{converted.thb.toLocaleString()}</div>
                  </div>
                )}
                {currency !== 'EUR' && (
                  <div className="bg-zinc-900 rounded-lg p-3 text-center">
                    <div className="text-xs text-zinc-600 uppercase tracking-widest mb-1">EUR</div>
                    <div className="text-xl font-bold text-white">€{converted.eur.toLocaleString()}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 8: Tenancy terms */}
        {step === 8 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">Tenancy terms</h2>
            <p className="text-zinc-500 text-sm mb-8">Toggle everything that applies — optional</p>
            <div className="flex flex-col gap-3">
              {TENANCY_OPTIONS.map(term => {
                const on = data.tenancy_terms?.[term];
                return (
                  <button
                    key={term}
                    onClick={() => toggleTenancy(term)}
                    className={`flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${
                      on ? 'border-green-600 bg-green-900/20' : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span className={`font-medium ${on ? 'text-green-400' : 'text-zinc-400'}`}>{term}</span>
                    <div className={`w-10 h-6 rounded-full relative transition-colors ${on ? 'bg-green-600' : 'bg-zinc-700'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-5' : 'left-1'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 9: Contact */}
        {step === 9 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">How can guests reach you?</h2>
            <p className="text-zinc-500 text-sm mb-8">
              {user ? 'Pre-filled from your profile — edit if needed' : 'Your contact details for this listing'}
            </p>
            <div className="flex flex-col gap-4">
              {[
                { label: 'Name *', key: 'contact_name', type: 'text', placeholder: 'Full name', defaultVal: profile?.full_name ?? '' },
                { label: 'Email *', key: 'contact_email', type: 'email', placeholder: 'your@email.com', defaultVal: user?.email ?? '' },
                { label: 'WhatsApp', key: 'contact_whatsapp', type: 'tel', placeholder: '+66 XX XXX XXXX', defaultVal: profile?.whatsapp ?? '' },
                { label: 'Facebook (optional)', key: 'contact_facebook', type: 'url', placeholder: 'https://facebook.com/yourpage', defaultVal: '' },
              ].map(({ label, key, type, placeholder, defaultVal }) => (
                <div key={key}>
                  <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">{label}</label>
                  <input
                    type={type}
                    defaultValue={(data as Record<string, string>)[key] ?? defaultVal}
                    onChange={e => set(key as keyof WizardData, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 10: Photos */}
        {step === 10 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">Add your photos</h2>
            <p className="text-zinc-500 text-sm mb-8">Min 3 · Max 12 · JPG, PNG or WEBP · 5MB each</p>

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-zinc-700 rounded-xl py-10 text-center hover:border-amber-500 transition-colors mb-4"
            >
              <div className="text-4xl mb-2">📸</div>
              <div className="text-zinc-400 font-medium">Tap to browse or drag photos</div>
              <div className="text-zinc-700 text-sm mt-1">Great photos get more enquiries</div>
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files && handlePhotos(e.target.files)}
            />

            {photoPreviews.length > 0 && (
              <>
                <p className={`text-xs mb-3 ${photoFiles.length >= 3 ? 'text-green-500' : 'text-zinc-600'}`}>
                  {photoFiles.length} photo{photoFiles.length !== 1 ? 's' : ''} added
                  {photoFiles.length < 3 ? ` (${3 - photoFiles.length} more needed)` : ' ✓'}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((src, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-zinc-900">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 11: Summary */}
        {step === 11 && (
          <div>
            <h2 className="font-serif text-3xl italic mb-2">Almost done!</h2>
            <p className="text-zinc-500 text-sm mb-8">Review your listing before submitting</p>
            <div className="flex flex-col gap-3">
              {[
                ['Area', data.area],
                ['Type', data.property_type],
                ['Amenities', (data.amenities ?? []).join(', ')],
                ['Description', (data.adjectives ?? []).join(' · ')],
                ['Min. term', data.min_rental_term],
                ['Available', data.available_from ? new Date(data.available_from).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) : ''],
                ['Price', data.price ? `${currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '฿'}${data.price.toLocaleString()} ${currency}/mo` : ''],
                ['Photos', `${photoFiles.length} uploaded`],
                ['Contact', data.contact_name ?? ''],
              ].map(([k, v]) => v ? (
                <div key={k} className="flex justify-between items-start bg-zinc-900 rounded-lg px-4 py-3">
                  <span className="text-xs text-zinc-600 uppercase tracking-widest">{k}</span>
                  <span className="text-sm text-white font-medium text-right max-w-[220px]">{v}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

      </div>

      {/* Footer button */}
      <div className="px-6 py-6 flex-shrink-0">
        {step < 11 ? (
          <button
            onClick={goNext}
            disabled={!isValid()}
            className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl hover:bg-amber-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-500 transition-all disabled:opacity-40"
          >
            {submitting ? 'Submitting...' : user ? 'Submit Listing ✓' : 'Create Account & Submit →'}
          </button>
        )}
      </div>

      {/* Auth modal — shown if not logged in at submit */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center px-6 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm">
            {authSent ? (
              <div className="text-center">
                <div className="text-4xl mb-4">📬</div>
                <h3 className="font-serif text-2xl italic mb-3">Check your email</h3>
                <p className="text-zinc-500 text-sm">We've sent a magic link to <strong className="text-white">{authEmail}</strong>. Click it to verify and your listing will be submitted automatically.</p>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl italic mb-2">Create an account</h3>
                <p className="text-zinc-500 text-sm mb-6">Your listing is ready. Create a free account to publish it and manage future listings.</p>
                <div className="flex flex-col gap-4">
                  <input
                    type="text" placeholder="Your name" value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    className="bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none"
                  />
                  <input
                    type="email" placeholder="Email address" value={authEmail}
                    onChange={e => setAuthEmail(e.target.value)}
                    className="bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none"
                  />
                  <button
                    onClick={handleSignUp}
                    disabled={!authEmail || !authName}
                    className="w-full bg-amber-500 text-black font-bold py-3.5 rounded-lg hover:bg-amber-400 transition-all disabled:opacity-40"
                  >
                    Send magic link →
                  </button>
                  <button onClick={() => setShowAuth(false)} className="text-zinc-600 text-sm text-center hover:text-zinc-400">
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
