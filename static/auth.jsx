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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(15, 17, 21, 0.55)', backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center',
    }}>
      <form onSubmit={handleSubmit} style={{
        width: 360, background: 'var(--panel)', border: '1px solid var(--line)',
        borderRadius: 14, padding: 24, boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <img src="/static/logo.png" alt="" style={{ width: 32, height: 32 }}/>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg)' }}>SDUI Studio</div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{tr ? 'Devam etmek için giriş yapın' : 'Sign in to continue'}</div>
          </div>
        </div>

        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 6 }}>
          {tr ? 'Giriş Tipi' : 'Login Type'}
        </div>
        <div className="seg" style={{ width: '100%', marginBottom: 14 }}>
          <button type="button" className={role === 'user' ? 'on' : ''} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRole('user')}>
            <Icon name="users" size={12}/> {tr ? 'Kullanıcı' : 'User'}
          </button>
          <button type="button" className={role === 'admin' ? 'on' : ''} style={{ flex: 1, justifyContent: 'center' }} onClick={() => setRole('admin')}>
            <Icon name="lightning" size={12}/> Admin
          </button>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: 'var(--fg-3)', display: 'block', marginBottom: 4 }}>{tr ? 'Kullanıcı Adı' : 'Username'}</label>
          <input className="input" style={{ width: '100%', height: 32 }} value={username} autoFocus
                 placeholder={role === 'admin' ? 'admin' : (tr ? 'örn: ali' : 'e.g. alice')}
                 onChange={e => setUsername(e.target.value)}/>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 11, color: 'var(--fg-3)', display: 'block', marginBottom: 4 }}>{tr ? 'Şifre' : 'Password'}</label>
          <input className="input" type="password" style={{ width: '100%', height: 32 }} value={password}
                 placeholder={role === 'admin' ? 'admin123' : '••••'}
                 onChange={e => setPassword(e.target.value)}/>
        </div>

        {error && (
          <div style={{ padding: '8px 10px', background: 'var(--err-soft, #fde8e8)', color: 'var(--err, #b42318)', borderRadius: 6, fontSize: 11.5, marginBottom: 10 }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn primary" disabled={busy}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
          {busy ? (tr ? 'Giriş yapılıyor…' : 'Signing in…') : (tr ? 'Giriş Yap' : 'Sign In')}
        </button>

        <div style={{ marginTop: 14, padding: 10, background: 'var(--panel-2)', borderRadius: 8, fontSize: 10.5, color: 'var(--fg-3)', lineHeight: 1.5 }}>
          {tr ? (
            <>
              <b>Demo bilgileri:</b><br/>
              Admin → <code>admin / admin123</code><br/>
              Kullanıcı → herhangi bir ad ve şifre. Yayın istekleri admin onayına düşer.
            </>
          ) : (
            <>
              <b>Demo credentials:</b><br/>
              Admin → <code>admin / admin123</code><br/>
              User → any username & password. Publish requests need admin approval.
            </>
          )}
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
      pending:  { bg: 'oklch(0.94 0.05 80)',  fg: 'oklch(0.45 0.13 80)',  label: tr ? 'Bekliyor' : 'Pending' },
      approved: { bg: 'oklch(0.94 0.06 145)', fg: 'oklch(0.42 0.14 145)', label: tr ? 'Onaylandı' : 'Approved' },
      rejected: { bg: 'oklch(0.94 0.06 25)',  fg: 'oklch(0.46 0.16 25)',  label: tr ? 'Reddedildi' : 'Rejected' },
    };
    const c = map[s] || map.pending;
    return <span className="chip" style={{ background: c.bg, color: c.fg, fontWeight: 600, fontSize: 10 }}>{c.label}</span>;
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(15, 17, 21, 0.45)',
      display: 'flex', justifyContent: 'flex-end',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 540, height: '100%', background: 'var(--panel)',
        borderLeft: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-12px 0 32px rgba(0,0,0,0.18)',
      }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="rocket" size={16} style={{ color: 'var(--brand)' }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>
              {isAdmin ? (tr ? 'Yayın Onayları' : 'Publish Approvals') : (tr ? 'Yayın İsteklerim' : 'My Publish Requests')}
            </div>
            <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
              {isAdmin ? (tr ? 'Kullanıcı yayın istekleri burada onaylanır.' : 'Approve or reject incoming publish requests.') : (tr ? 'Gönderdiğin istekler ve durumları.' : 'Your submitted requests and their status.')}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} title={tr ? 'Kapat' : 'Close'}><Icon name="x" size={14}/></button>
        </div>

        <div style={{ padding: '8px 18px', borderBottom: '1px solid var(--line)' }}>
          <div className="seg" style={{ height: 26 }}>
            {[
              { id: 'pending',  label: tr ? 'Bekliyor' : 'Pending' },
              { id: 'approved', label: tr ? 'Onaylı' : 'Approved' },
              { id: 'rejected', label: tr ? 'Reddedildi' : 'Rejected' },
              { id: 'all',      label: tr ? 'Tümü' : 'All' },
            ].map(o => (
              <button key={o.id} className={filter === o.id ? 'on' : ''} onClick={() => setFilter(o.id)} style={{ height: 20, flex: 1, justifyContent: 'center' }}>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
          {loading && <div style={{ textAlign: 'center', color: 'var(--fg-3)', padding: 24, fontSize: 12 }}>{tr ? 'Yükleniyor…' : 'Loading…'}</div>}
          {!loading && items.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--fg-3)', padding: 36, fontSize: 12 }}>
              {tr ? 'Bu durumda istek yok.' : 'No requests in this state.'}
            </div>
          )}
          {!loading && items.map((it) => (
            <div key={it.id} style={{
              border: '1px solid var(--line)', borderRadius: 10, padding: 12, marginBottom: 8,
              background: 'var(--panel)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)' }}>{it.screen_name}</span>
                <span className="chip" style={{ fontSize: 10 }}>{it.platform}</span>
                {statusBadge(it.status)}
                <span style={{ flex: 1 }}/>
                <span style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>#{it.id.slice(0, 6)}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--fg-3)', marginBottom: 8 }}>
                <Icon name="users" size={10}/> <b>{it.user}</b> · {new Date(it.submitted_at).toLocaleString()}
              </div>
              {it.reviewed_by && (
                <div style={{ fontSize: 10.5, color: 'var(--fg-3)', marginBottom: 6 }}>
                  {it.status === 'approved' ? '✅' : '❌'} {it.reviewed_by} · {it.reviewed_at && new Date(it.reviewed_at).toLocaleString()}
                  {it.reject_reason ? <> — <i>"{it.reject_reason}"</i></> : null}
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <button className="btn ghost" style={{ height: 24, fontSize: 11 }} onClick={() => openPreview(it.id)}>
                  <Icon name="code" size={11}/> JSON
                </button>
                {isAdmin && it.status === 'pending' && (
                  <>
                    <button className="btn primary" style={{ height: 24, fontSize: 11, marginLeft: 'auto' }}
                            disabled={busyId === it.id} onClick={() => handleApprove(it.id)}>
                      <Icon name="check" size={11}/> {tr ? 'Onayla' : 'Approve'}
                    </button>
                    <button className="btn" style={{ height: 24, fontSize: 11 }}
                            disabled={busyId === it.id} onClick={() => handleReject(it.id)}>
                      <Icon name="x" size={11}/> {tr ? 'Reddet' : 'Reject'}
                    </button>
                  </>
                )}
              </div>

              {previewId === it.id && (
                <div style={{ marginTop: 10, padding: 10, background: 'var(--panel-2)', borderRadius: 8, maxHeight: 220, overflow: 'auto' }}>
                  {previewData ? (
                    <pre style={{ margin: 0, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(previewData.layout, null, 2)}
                    </pre>
                  ) : (
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{tr ? 'Yükleniyor…' : 'Loading…'}</div>
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
