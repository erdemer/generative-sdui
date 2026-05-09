/* SDUI Studio — Login overlay + Admin approvals panel */

const { useState, useEffect, useCallback } = React;
var Icon = window.Icon;

const AUTH_STORAGE_KEY = 'sdui_auth';

function loadAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.role) return parsed;
  } catch {}
  return null;
}

function saveAuth(auth) {
  try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth)); } catch {}
}

function clearAuth() {
  try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
}

function authHeaders(auth) {
  return auth?.token ? { 'Authorization': `Bearer ${auth.token}` } : {};
}

/* =================== LOGIN OVERLAY =================== */
function LoginOverlay({ lang, onLogin }) {
  const [role, setRole] = useState('user');           // 'user' | 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const tr = lang === 'tr';

  // Pre-fill username when admin role is selected the first time
  useEffect(() => {
    if (role === 'admin' && !username) setUsername('admin');
  }, [role]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (busy) return;
    if (!username.trim() || !password.trim()) {
      setError(tr ? 'Kullanıcı adı ve şifre gerekli.' : 'Username and password required.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.detail || (tr ? 'Giriş başarısız' : 'Login failed'));
        setBusy(false);
        return;
      }
      // If user picked admin tab but server gave them user role, reject
      if (role === 'admin' && data.role !== 'admin') {
        setError(tr ? 'Admin yetkisi yok.' : 'Not an admin account.');
        setBusy(false);
        return;
      }
      saveAuth(data);
      onLogin?.(data);
    } catch (err) {
      setError((tr ? 'Bağlantı hatası: ' : 'Network error: ') + err.message);
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%', height: 42,
    background: '#fff',
    border: '1.5px solid #e2e5ea',
    borderRadius: 10,
    padding: '0 14px',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    transition: 'border-color .15s, box-shadow .15s',
    boxSizing: 'border-box',
  };

  const roleBtnBase = {
    flex: 1, height: 38, borderRadius: 8, fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    cursor: 'pointer', border: '1.5px solid transparent', transition: 'all .15s',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(135deg, #1a0a0a 0%, #2d0f0f 30%, #1c1c2e 70%, #0f172a 100%)',
      display: 'grid', placeItems: 'center',
    }}>
      {/* Decorative glow spots */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }}/>
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }}/>
      </div>

      <form onSubmit={handleSubmit} style={{
        position: 'relative', zIndex: 1,
        width: 400,
        background: '#ffffff',
        borderRadius: 20,
        padding: '32px 32px 28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <img src="/static/logo.png" alt="" style={{ width: 40, height: 40, borderRadius: 10 }}/>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>SDUI Studio</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{tr ? 'Devam etmek için giriş yapın' : 'Sign in to continue'}</div>
          </div>
        </div>

        {/* Role toggle */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', marginBottom: 8 }}>
          {tr ? 'Giriş Tipi' : 'Login Type'}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, background: '#f3f4f6', borderRadius: 10, padding: 4 }}>
          <button type="button" onClick={() => setRole('user')} style={{
            ...roleBtnBase,
            background: role === 'user' ? '#fff' : 'transparent',
            color: role === 'user' ? '#111827' : '#6b7280',
            boxShadow: role === 'user' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            border: role === 'user' ? '1.5px solid #e5e7eb' : '1.5px solid transparent',
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {tr ? 'Kullanıcı' : 'User'}
          </button>
          <button type="button" onClick={() => setRole('admin')} style={{
            ...roleBtnBase,
            background: role === 'admin' ? '#dc2626' : 'transparent',
            color: role === 'admin' ? '#fff' : '#6b7280',
            boxShadow: role === 'admin' ? '0 2px 8px rgba(220,38,38,0.35)' : 'none',
            border: role === 'admin' ? '1.5px solid #dc2626' : '1.5px solid transparent',
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5L10 6h4.5l-3.6 2.6 1.4 4.4L8 10.5l-4.3 2.5 1.4-4.4L1.5 6H6L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            Admin
          </button>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            {tr ? 'Kullanıcı Adı' : 'Kullanıcı Adı'}
          </label>
          <input
            style={inputStyle}
            value={username} autoFocus
            placeholder={role === 'admin' ? 'admin' : (tr ? 'örn: ali' : 'e.g. alice')}
            onChange={e => setUsername(e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#dc2626'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e5ea'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
            {tr ? 'Şifre' : 'Şifre'}
          </label>
          <input
            style={inputStyle}
            type="password"
            value={password}
            placeholder="••••••••"
            onChange={e => setPassword(e.target.value)}
            onFocus={e => { e.target.style.borderColor = '#dc2626'; e.target.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e5ea'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, fontSize: 12.5, fontWeight: 500, marginBottom: 14, border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={busy} style={{
          width: '100%', height: 46, borderRadius: 12,
          background: busy ? '#f87171' : '#dc2626',
          color: '#fff', border: 'none', fontSize: 15, fontWeight: 700,
          cursor: busy ? 'not-allowed' : 'pointer',
          boxShadow: busy ? 'none' : '0 4px 14px rgba(220,38,38,0.4)',
          transition: 'all .15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          letterSpacing: '-0.01em',
        }}>
          {busy ? (
            <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }}/>{tr ? 'Giriş yapılıyor…' : 'Giriş yapılıyor…'}</>
          ) : (tr ? 'Giriş Yap' : 'Giriş Yap')}
        </button>

        {/* Demo hint */}
        <div style={{ marginTop: 20, padding: '12px 14px', background: '#f9fafb', borderRadius: 10, fontSize: 11.5, color: '#6b7280', lineHeight: 1.6, border: '1px solid #e5e7eb' }}>
          <div style={{ fontWeight: 700, color: '#374151', marginBottom: 4 }}>Demo bilgileri</div>
          <div>Admin → <code style={{ background: '#e5e7eb', padding: '1px 5px', borderRadius: 4, fontSize: 11, color: '#111827', fontFamily: 'monospace' }}>admin / admin123</code></div>
          <div style={{ marginTop: 2 }}>{tr ? 'Kullanıcı → herhangi bir ad ve şifre. Yayın istekleri admin onayına düşer.' : 'User → any username & password. Publish requests need admin approval.'}</div>
        </div>
      </form>
    </div>
  );
}

/* =================== APPROVALS PANEL =================== */
function ApprovalsPanel({ lang, auth, onClose, onApproved }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [busyId, setBusyId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const tr = lang === 'tr';

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approvals/list?status_filter=${filter}`, { headers: authHeaders(auth) });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {}
    setLoading(false);
  }, [filter, auth]);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-refresh every 8s while panel is open
  useEffect(() => {
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  const openPreview = async (id) => {
    setPreviewId(id);
    setPreviewData(null);
    try {
      const res = await fetch(`/api/approvals/${id}`, { headers: authHeaders(auth) });
      if (res.ok) setPreviewData(await res.json());
    } catch {}
  };

  const handleApprove = async (id) => {
    if (busyId) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/approvals/${id}/approve`, { method: 'POST', headers: authHeaders(auth) });
      if (res.ok) { await refresh(); onApproved?.(); }
      else { const d = await res.json().catch(() => ({})); alert(d.detail || 'Approve failed'); }
    } catch (err) { alert(err.message); }
    setBusyId(null);
  };

  const handleReject = async (id) => {
    if (busyId) return;
    const reason = window.prompt(tr ? 'Red sebebi (opsiyonel):' : 'Reject reason (optional):') ?? '';
    setBusyId(id);
    try {
      const res = await fetch(`/api/approvals/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(auth) },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) await refresh();
      else { const d = await res.json().catch(() => ({})); alert(d.detail || 'Reject failed'); }
    } catch (err) { alert(err.message); }
    setBusyId(null);
  };

  const isAdmin = auth?.role === 'admin';
  const statusBadge = (s) => {
    const map = {
      pending:  { bg: 'rgba(234,179,8,0.15)',   fg: '#ca8a04',  darkFg: '#fbbf24', label: tr ? 'Bekliyor' : 'Pending' },
      approved: { bg: 'rgba(34,197,94,0.15)',   fg: '#16a34a',  darkFg: '#4ade80', label: tr ? 'Onaylandı' : 'Approved' },
      rejected: { bg: 'rgba(239,68,68,0.15)',   fg: '#dc2626',  darkFg: '#f87171', label: tr ? 'Reddedildi' : 'Rejected' },
    };
    const c = map[s] || map.pending;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px',
        borderRadius: 999, fontSize: 11, fontWeight: 600,
        background: c.bg, color: 'var(--fg-2)',
        border: '1px solid currentColor', opacity: 0.9,
      }}>
        {c.label}
      </span>
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 480, height: '100%',
        background: 'var(--bg-elev)',
        borderLeft: '1px solid var(--line-strong)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-20px 0 48px rgba(0,0,0,0.35)',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--panel)',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--brand-soft)', display: 'grid', placeItems: 'center',
          }}>
            <Icon name="rocket" size={16} style={{ color: 'var(--brand)' }}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.01em' }}>
              {isAdmin ? (tr ? 'Yayın Onayları' : 'Publish Approvals') : (tr ? 'Yayın İsteklerim' : 'My Publish Requests')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>
              {isAdmin ? (tr ? 'Kullanıcı isteklerini onayla veya reddet' : 'Approve or reject incoming requests') : (tr ? 'Gönderdiğin istekler ve durumları' : 'Your submitted requests and their status')}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* Filter tabs */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}>
          <div className="seg" style={{ width: '100%' }}>
            {[
              { id: 'pending',  label: tr ? 'Bekliyor' : 'Bekliyor' },
              { id: 'approved', label: tr ? 'Onaylı' : 'Onaylı' },
              { id: 'rejected', label: tr ? 'Reddedildi' : 'Reddedildi' },
              { id: 'all',      label: tr ? 'Tümü' : 'Tümü' },
            ].map(o => (
              <button key={o.id} className={filter === o.id ? 'on' : ''} onClick={() => setFilter(o.id)}
                      style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', background: 'var(--canvas)' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32, color: 'var(--fg-3)', fontSize: 12 }}>
              <span className="spinner"/>
              {tr ? 'Yükleniyor…' : 'Yükleniyor…'}
            </div>
          )}
          {!loading && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--panel-2)', margin: '0 auto 12px', display: 'grid', placeItems: 'center', color: 'var(--fg-mute)' }}>
                <Icon name="rocket" size={18}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 4 }}>
                {tr ? 'İstek yok' : 'İstek yok'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                {tr ? 'Bu durumda bekleyen istek bulunmuyor.' : 'Bu durumda bekleyen istek bulunmuyor.'}
              </div>
            </div>
          )}
          {!loading && items.map((it) => (
            <div key={it.id} style={{
              background: 'var(--bg-elev)',
              border: '1px solid var(--line-strong)',
              borderRadius: 12, padding: '14px 14px 10px',
              marginBottom: 10,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Card header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {it.screen_name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span className="chip" style={{ fontSize: 10, height: 18, padding: '0 7px' }}>{it.platform}</span>
                    {statusBadge(it.status)}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', flexShrink: 0, marginTop: 2 }}>
                  #{it.id.slice(0, 6)}
                </span>
              </div>

              {/* Meta */}
              <div style={{
                fontSize: 11, color: 'var(--fg-3)', marginBottom: 8,
                padding: '8px 10px', background: 'var(--panel-2)', borderRadius: 7,
              }}>
                <span style={{ fontWeight: 600, color: 'var(--fg-2)' }}>{it.user}</span>
                {' · '}
                {new Date(it.submitted_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}
              </div>

              {it.reviewed_by && (
                <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{it.status === 'approved' ? '✅' : '❌'}</span>
                  <span><b style={{ color: 'var(--fg-2)' }}>{it.reviewed_by}</b> · {it.reviewed_at && new Date(it.reviewed_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  {it.reject_reason && <span style={{ color: 'var(--fg-mute)' }}> — "{it.reject_reason}"</span>}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button className="btn ghost" style={{ height: 26, fontSize: 11, padding: '0 10px' }} onClick={() => openPreview(it.id)}>
                  <Icon name="code" size={11}/> JSON
                </button>
                {isAdmin && it.status === 'pending' && (
                  <>
                    <span style={{ flex: 1 }}/>
                    <button className="btn" style={{ height: 26, fontSize: 11, padding: '0 10px' }}
                            disabled={busyId === it.id} onClick={() => handleReject(it.id)}>
                      <Icon name="x" size={11}/> {tr ? 'Reddet' : 'Reddet'}
                    </button>
                    <button className="btn primary" style={{ height: 26, fontSize: 11, padding: '0 10px' }}
                            disabled={busyId === it.id} onClick={() => handleApprove(it.id)}>
                      <Icon name="check" size={11}/> {tr ? 'Onayla' : 'Onayla'}
                    </button>
                  </>
                )}
              </div>

              {previewId === it.id && (
                <div style={{ marginTop: 10, background: 'var(--canvas)', border: '1px solid var(--line)', borderRadius: 8, maxHeight: 200, overflow: 'auto' }}>
                  {previewData ? (
                    <pre style={{ margin: 0, padding: '10px 12px', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(previewData.layout, null, 2)}
                    </pre>
                  ) : (
                    <div style={{ padding: 12, fontSize: 11, color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="spinner"/>{tr ? 'Yükleniyor…' : 'Yükleniyor…'}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.SDUIAuth = {
  LoginOverlay,
  ApprovalsPanel,
  loadAuth,
  saveAuth,
  clearAuth,
  authHeaders,
};
