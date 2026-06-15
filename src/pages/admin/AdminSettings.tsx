import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [autoApprove, setAutoApprove] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'auto_approve_listings').single()
      .then(({ data }) => {
        setAutoApprove(data?.value === 'true');
        setLoading(false);
      });
  }, []);

  async function handleToggle() {
    const newVal = !autoApprove;
    setAutoApprove(newVal);
    setSaving(true);
    await supabase.from('site_settings').update({
      value: newVal ? 'true' : 'false',
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    }).eq('key', 'auto_approve_listings');
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-zinc-800">
        <button onClick={() => navigate('/admin/dashboard')} className="text-zinc-400 hover:text-white transition-colors">
          ← Admin Dashboard
        </button>
        {saved && <span className="text-green-400 text-sm">Saved ✓</span>}
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="text-amber-500 text-xs uppercase tracking-widest mb-2">Admin Settings</div>
        <h1 className="font-serif text-3xl italic mb-10">Site Configuration</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Auto-approve toggle */}
            <div className="border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-white font-semibold mb-1">Auto-approve listings</div>
                  <div className="text-zinc-500 text-sm leading-relaxed">
                    {autoApprove
                      ? '⚡ ON — Host submissions go live immediately and trigger Facebook posting automatically. No admin review required.'
                      : '🔒 OFF — Host submissions enter a pending queue. You review each one before it goes live and posts to Facebook.'}
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={saving}
                  className={`flex-shrink-0 w-14 h-8 rounded-full relative transition-colors duration-300 ${
                    autoApprove ? 'bg-green-600' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-1.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${
                    autoApprove ? 'left-8' : 'left-1.5'
                  }`} />
                </button>
              </div>

              <div className={`mt-4 p-3 rounded-lg text-xs ${autoApprove ? 'bg-green-900/20 text-green-400 border border-green-900' : 'bg-zinc-900 text-zinc-600'}`}>
                {autoApprove
                  ? '✓ New listings publish instantly. n8n Facebook post fires on submission.'
                  : 'New listings wait in the Pending tab. You publish manually to trigger the Facebook post.'}
              </div>
            </div>

            {/* n8n status */}
            <div className="border border-zinc-800 rounded-xl p-6">
              <div className="text-white font-semibold mb-1">n8n Automation</div>
              <div className="text-zinc-500 text-sm mb-4">Facebook posting workflow status</div>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Workflow URL</span>
                  <span className="text-zinc-400 text-xs">n8n-gp8y.sliplane.app</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Facebook Page</span>
                  <span className="text-zinc-400 text-xs">Re:Start Samui</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Token expires</span>
                  <span className="text-amber-400 text-xs">⚠️ ~August 2026 — refresh soon</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
