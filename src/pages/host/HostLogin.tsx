import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail, signInWithPassword, signUp } from '../../hooks/useAuth';

type Mode = 'magic' | 'password' | 'signup';

export default function HostLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'magic') {
        await signInWithEmail(email);
        setSent(true);
      } else if (mode === 'password') {
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
        navigate('/host/dashboard');
      } else {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        setSent(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <nav className="px-8 py-5">
        <button onClick={() => navigate('/')} className="font-serif text-xl italic text-white hover:text-amber-500 transition-colors">
          ← RE:START
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-6">📬</div>
              <h1 className="font-serif text-3xl italic mb-3">Check your email</h1>
              <p className="text-zinc-500 text-sm">
                We've sent a {mode === 'signup' ? 'confirmation' : 'magic'} link to{' '}
                <strong className="text-white">{email}</strong>. Click it to sign in.
              </p>
            </div>
          ) : (
            <>
              <div className="text-amber-500 text-xs uppercase tracking-widest mb-3">Host Portal</div>
              <h1 className="font-serif text-3xl italic mb-8">
                {mode === 'signup' ? 'Create account' : 'Sign in'}
              </h1>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-6">
                {(['magic', 'password', 'signup'] as Mode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold uppercase tracking-widest transition-all border ${
                      mode === m
                        ? 'bg-amber-500 border-amber-500 text-black'
                        : 'border-zinc-800 text-zinc-600 hover:border-zinc-600'
                    }`}
                  >
                    {m === 'magic' ? 'Magic Link' : m === 'password' ? 'Password' : 'Sign Up'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {mode === 'signup' && (
                  <div>
                    <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">Name</label>
                    <input
                      type="text" required value={name} onChange={e => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">Email</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                  />
                </div>
                {(mode === 'password' || mode === 'signup') && (
                  <div>
                    <label className="text-xs text-zinc-600 uppercase tracking-widest block mb-1.5">Password</label>
                    <input
                      type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>
                )}

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-500 text-black font-bold py-4 rounded-xl hover:bg-amber-400 transition-all disabled:opacity-40 mt-2"
                >
                  {loading ? 'Please wait...' : mode === 'magic' ? 'Send Magic Link →' : mode === 'signup' ? 'Create Account →' : 'Sign In →'}
                </button>
              </form>

              <p className="text-zinc-700 text-xs text-center mt-6">
                Want to list a property?{' '}
                <button onClick={() => navigate('/host/listings/new')} className="text-amber-500 hover:underline">
                  Start the questionnaire
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
