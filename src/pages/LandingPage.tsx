import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div>
          <div className="font-serif text-2xl font-bold tracking-tight italic">RE:START</div>
          <div className="text-amber-500 text-xs tracking-[0.2em] uppercase">Thailand Travel Concierge</div>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <p className="text-amber-500 text-xs tracking-[0.3em] uppercase mb-6">Koh Samui, Thailand</p>
        <h1 className="font-serif text-5xl md:text-7xl font-bold italic leading-tight mb-6">
          What brings<br />you here?
        </h1>
        <p className="text-zinc-400 text-lg max-w-md mb-16">
          Find your perfect stay, list your property, or plan the ultimate Muay Thai reset.
        </p>

        {/* Three paths */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-3xl">
          {/* Find a Stay */}
          <button
            onClick={() => navigate('/stays')}
            className="group relative border border-zinc-700 hover:border-amber-500 rounded-xl p-8 text-left transition-all duration-300 hover:bg-zinc-900"
          >
            <div className="text-3xl mb-4">🏠</div>
            <div className="text-white font-semibold text-lg mb-2">Find a Stay</div>
            <div className="text-zinc-500 text-sm leading-relaxed">
              Browse handpicked properties across Koh Samui. Filter by area, price, and type.
            </div>
            <div className="mt-6 text-amber-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Browse properties →
            </div>
          </button>

          {/* List Your Property */}
          <button
            onClick={() => navigate('/host/listings/new')}
            className="group relative border border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl p-8 text-left transition-all duration-300"
          >
            <div className="absolute top-4 right-4 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">
              FREE
            </div>
            <div className="text-3xl mb-4">📋</div>
            <div className="text-white font-semibold text-lg mb-2">List Your Property</div>
            <div className="text-zinc-500 text-sm leading-relaxed">
              Answer 10 quick questions. We post it to Facebook and list it on the site automatically.
            </div>
            <div className="mt-6 text-amber-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Start listing →
            </div>
          </button>

          {/* Muay Thai */}
          <button
            onClick={() => navigate('/muay-thai')}
            className="group relative border border-zinc-700 hover:border-amber-500 rounded-xl p-8 text-left transition-all duration-300 hover:bg-zinc-900"
          >
            <div className="text-3xl mb-4">🥊</div>
            <div className="text-white font-semibold text-lg mb-2">Muay Thai Reset</div>
            <div className="text-zinc-500 text-sm leading-relaxed">
              Custom combative retreats with elite gyms, beachfront training, and curated itineraries.
            </div>
            <div className="mt-6 text-amber-500 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Build your retreat →
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex gap-6 text-xs text-zinc-600 uppercase tracking-widest">
          <span>Terms of Concierge Service</span>
          <span>Retreat Insurance Coverage</span>
          <span>Local Health &amp; Sport Protocol</span>
        </div>
        <div className="text-xs text-zinc-700">© 2026 RE:START THAILAND — ALL RIGHTS RESERVED</div>
      </footer>
    </div>
  );
}
