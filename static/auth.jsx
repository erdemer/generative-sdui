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
function ApprovalsPanel({ lang, auth, theme, onClose, onApproved }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // 'pending' | 'approved' | 'rejected' | 'all'
  const [busyId, setBusyId] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [showJsonInModal, setShowJsonInModal] = useState(false);

  const tr = lang === 'tr';

  const closePreview = () => { setPreviewId(null); setPreviewData(null); setShowJsonInModal(false); };

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/approvals/list?status_filter=${filter}`, { headers: authHeaders(auth) });
      if (res.status === 401) {
        clearAuth();
        onClose?.();
        window.location.reload();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {}
    setLoading(false);
  }, [filter, auth, onClose]);

  useEffect(() => { refresh(); }, [refresh]);

  // Auto-refresh every 8s while panel is open
  useEffect(() => {
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  const openPreview = async (id) => {
    setPreviewId(id);
    setPreviewData(null);
    setShowJsonInModal(false);
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
  const isDark = theme && theme.includes('dark');

  const STATUS = isDark ? {
    pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)', accent: '#f59e0b', label: tr ? 'Bekliyor'    : 'Bekliyor'    },
    approved: { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.25)', accent: '#10b981', label: tr ? 'Onaylandı'   : 'Onaylandı'   },
    rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)',accent: '#ef4444', label: tr ? 'Reddedildi'  : 'Reddedildi'  },
  } : {
    pending:  { color: '#d97706', bg: '#fef3c7', border: '#fde68a', accent: '#f59e0b', label: tr ? 'Bekliyor'    : 'Bekliyor'    },
    approved: { color: '#059669', bg: '#d1fae5', border: '#a7f3d0', accent: '#10b981', label: tr ? 'Onaylandı'   : 'Onaylandı'   },
    rejected: { color: '#dc2626', bg: '#fee2e2', border: '#fecaca', accent: '#ef4444', label: tr ? 'Reddedildi'  : 'Reddedildi'  },
  };

  const statusBadge = (s) => {
    const c = STATUS[s] || STATUS.pending;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px',
        borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.01em',
        background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      }}>
        {c.label}
      </span>
    );
  };

  // Find the item being previewed (for modal meta info)
  const previewItem = previewId ? items.find(i => i.id === previewId) : null;

  return (
    <>
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.35)',
      display: 'flex', justifyContent: 'flex-end',
      backdropFilter: 'blur(2px)',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 460, height: '100%',
        background: isDark ? 'oklch(0.18 0.013 25)' : '#f8f9fb',
        borderLeft: isDark ? '1px solid oklch(0.30 0.018 25)' : '1px solid #e2e5ea',
        display: 'flex', flexDirection: 'column',
        boxShadow: isDark
          ? '-32px 0 80px rgba(0,0,0,0.7), -1px 0 0 rgba(255,255,255,0.04)'
          : '-32px 0 80px rgba(0,0,0,0.18), -1px 0 0 rgba(0,0,0,0.06)',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: isDark ? '1px solid oklch(0.28 0.018 25)' : '1px solid #e2e5ea',
          display: 'flex', alignItems: 'center', gap: 12,
          background: isDark ? 'oklch(0.20 0.016 25)' : '#ffffff',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'var(--brand)', display: 'grid', placeItems: 'center',
            boxShadow: '0 2px 8px rgba(220,38,38,0.35)',
          }}>
            <Icon name="rocket" size={16} style={{ color: '#fff' }}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)', letterSpacing: '-0.01em' }}>
              {isAdmin ? (tr ? 'Yayın Onayları' : 'Yayın Onayları') : (tr ? 'Yayın İsteklerim' : 'Yayın İsteklerim')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)', marginTop: 1 }}>
              {isAdmin ? (tr ? 'Kullanıcı isteklerini onayla veya reddet' : 'Kullanıcı isteklerini onayla veya reddet') : (tr ? 'Gönderdiğin istekler ve durumları' : 'Gönderdiğin istekler ve durumları')}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={14}/></button>
        </div>

        {/* Filter tabs */}
        <div style={{ padding: '8px 16px', borderBottom: isDark ? '1px solid oklch(0.28 0.018 25)' : '1px solid #e2e5ea', background: isDark ? 'oklch(0.20 0.016 25)' : '#ffffff' }}>
          <div className="seg" style={{ width: '100%', height: 30 }}>
            {[
              { id: 'pending',  label: tr ? 'Bekliyor' : 'Bekliyor' },
              { id: 'approved', label: tr ? 'Onaylı' : 'Onaylı' },
              { id: 'rejected', label: tr ? 'Reddedildi' : 'Reddedildi' },
              { id: 'all',      label: tr ? 'Tümü' : 'Tümü' },
            ].map(o => (
              <button key={o.id} className={filter === o.id ? 'on' : ''} onClick={() => setFilter(o.id)}
                      style={{ flex: 1, justifyContent: 'center', fontSize: 11, height: 24 }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', background: isDark ? 'oklch(0.15 0.010 25)' : '#eef0f4' }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32, color: 'var(--fg-3)', fontSize: 12 }}>
              <span className="spinner"/>
              {tr ? 'Yükleniyor…' : 'Yükleniyor…'}
            </div>
          )}
          {!loading && items.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--panel)', margin: '0 auto 12px', display: 'grid', placeItems: 'center', color: 'var(--fg-mute)', boxShadow: 'var(--shadow-sm)' }}>
                <Icon name="rocket" size={20}/>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 4 }}>İstek yok</div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>Bu durumda bekleyen istek bulunmuyor.</div>
            </div>
          )}

          {!loading && items.map((it) => {
            const sc = STATUS[it.status] || STATUS.pending;
            return (
              <div key={it.id} style={{
                background: isDark ? 'oklch(0.20 0.014 25)' : '#ffffff',
                border: isDark ? '1px solid oklch(0.28 0.018 25)' : '1px solid #e2e5ea',
                borderLeft: `3px solid ${sc.accent}`,
                borderRadius: 10,
                marginBottom: 8,
                boxShadow: isDark
                  ? '0 2px 8px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)'
                  : '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.07)',
                overflow: 'hidden',
              }}>
                {/* Card top */}
                <div style={{ padding: '12px 14px 10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {it.screen_name}
                      </div>
                    </div>
                    {statusBadge(it.status)}
                    <span style={{ fontSize: 10, color: 'var(--fg-mute)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                      #{it.id.slice(0, 6)}
                    </span>
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--fg-3)', marginBottom: 10 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 7px',
                      borderRadius: 4, background: 'var(--panel-2)', fontSize: 10, fontWeight: 600,
                      color: 'var(--fg-2)', border: '1px solid var(--line)',
                    }}>{it.platform}</span>
                    <Icon name="users" size={10}/>
                    <span style={{ fontWeight: 600, color: 'var(--fg-2)' }}>{it.user}</span>
                    <span>·</span>
                    <span>{new Date(it.submitted_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>

                  {it.reviewed_by && (
                    <div style={{
                      fontSize: 11, color: 'var(--fg-3)', marginBottom: 10,
                      padding: '6px 10px', background: 'var(--panel-2)',
                      borderRadius: 6, display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span>{it.status === 'approved' ? '✅' : '❌'}</span>
                      <span><b style={{ color: 'var(--fg-2)' }}>{it.reviewed_by}</b></span>
                      <span>·</span>
                      <span>{it.reviewed_at && new Date(it.reviewed_at).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                      {it.reject_reason && <span style={{ color: 'var(--fg-mute)', fontStyle: 'italic' }}>"{ it.reject_reason}"</span>}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button className="btn ghost" style={{ height: 26, fontSize: 11, padding: '0 10px' }} onClick={() => openPreview(it.id)}>
                      <Icon name="eye" size={11}/> Önizle
                    </button>
                    {isAdmin && it.status === 'pending' && (
                      <>
                        <span style={{ flex: 1 }}/>
                        <button className="btn" style={{ height: 28, fontSize: 11, padding: '0 12px' }}
                                disabled={busyId === it.id} onClick={() => handleReject(it.id)}>
                          <Icon name="x" size={11}/> Reddet
                        </button>
                        <button className="btn primary" style={{ height: 28, fontSize: 11, padding: '0 12px' }}
                                disabled={busyId === it.id} onClick={() => handleApprove(it.id)}>
                          <Icon name="check" size={11}/> Onayla
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* ── Rendered Preview Modal ─────────────────────────────── */}
    {previewId && (
      <div
        onClick={closePreview}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            display: 'flex', gap: 28, alignItems: 'flex-start',
            maxHeight: '94vh',
          }}
        >
          {/* Phone mockup */}
          <div style={{ flexShrink: 0, width: 248, height: 488, overflow: 'hidden', borderRadius: 40 }}>
            <div className="device-shell" style={{ transform: 'scale(0.70)', transformOrigin: 'top left' }}>
              <div className="device-screen" style={{ display: 'flex', flexDirection: 'column' }}>
                {previewData
                  ? <SDUIRenderer layout={previewData.layout}/>
                  : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: 'var(--fg-3)', fontSize: 12 }}>
                      <span className="spinner"/>
                      <span>Render ediliyor…</span>
                    </div>
                  )
                }
              </div>
            </div>
          </div>

          {/* Info + actions panel */}
          <div style={{
            width: 320, display: 'flex', flexDirection: 'column', gap: 12,
            maxHeight: '90vh',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'var(--brand)',
                display: 'grid', placeItems: 'center', flexShrink: 0,
                boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
              }}>
                <Icon name="eye" size={16} style={{ color: '#fff' }}/>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
                  {previewData?.screen_name || previewItem?.screen_name || 'Önizleme'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                  SDUI Render Önizlemesi
                </div>
              </div>
              <button
                onClick={closePreview}
                className="icon-btn"
                style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <Icon name="x" size={14}/>
              </button>
            </div>

            {/* Meta card */}
            {previewItem && (
              <div style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 7,
              }}>
                {[
                  ['Kullanıcı', previewItem.user],
                  ['Platform', previewItem.platform],
                  ['Durum', previewItem.status === 'pending' ? '⏳ Bekliyor' : previewItem.status === 'approved' ? '✅ Onaylandı' : '❌ Reddedildi'],
                  ['Gönderim', new Date(previewItem.submitted_at).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)', width: 72, flexShrink: 0 }}>{label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* JSON toggle */}
            <button
              className="btn ghost"
              style={{ height: 30, fontSize: 11, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)' }}
              onClick={() => setShowJsonInModal(v => !v)}
            >
              <Icon name="code" size={11}/> {showJsonInModal ? 'JSON Gizle' : 'JSON Göster'}
            </button>

            {showJsonInModal && (
              <div style={{
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 10, overflow: 'auto', maxHeight: 220,
              }}>
                <pre style={{ margin: 0, padding: '10px 14px', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.7)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                  {previewData ? JSON.stringify(previewData.layout, null, 2) : '…'}
                </pre>
              </div>
            )}

            {/* Admin actions for pending items */}
            {isAdmin && previewItem?.status === 'pending' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  className="btn"
                  style={{ flex: 1, height: 40, fontSize: 13, fontWeight: 600, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)', borderRadius: 10 }}
                  disabled={busyId === previewItem.id}
                  onClick={async () => { await handleReject(previewItem.id); closePreview(); }}
                >
                  <Icon name="x" size={13}/> Reddet
                </button>
                <button
                  className="btn primary"
                  style={{ flex: 1, height: 40, fontSize: 13, fontWeight: 600, borderRadius: 10 }}
                  disabled={busyId === previewItem.id}
                  onClick={async () => { await handleApprove(previewItem.id); closePreview(); }}
                >
                  <Icon name="check" size={13}/> Onayla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
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
