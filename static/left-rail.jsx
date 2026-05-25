/* SDUI Studio — Left-rail tabbed panels with real callbacks */

const HISTORY_KEY = 'sdui_prompt_history';
const MAX_HISTORY = 8;
var Icon = window.Icon;

/* ── Design palette map — keyed on style keywords from Q1 ─────────────────── */
const STYLE_PALETTES = [
  { match: ['koyu', 'dark', 'night', 'gece', 'premium', 'moody'],
    palette: { bg: '#0d0a08', surface: '#1c1410', accent: '#c8a45a', fg: '#f5ede0', fg3: '#a89070',
               imageKw: 'moody_dark_atmosphere,warm_candlelight,dark_background' } },
  { match: ['açık', 'light', 'minimal', 'clean', 'beyaz', 'white', 'aydınlık'],
    palette: { bg: '#ffffff', surface: '#f4f4f5', accent: '#18181b', fg: '#09090b', fg3: '#71717a',
               imageKw: 'bright_clean_studio,white_background,minimalist,natural_light' } },
  { match: ['sıcak', 'warm', 'organik', 'organic', 'doğal', 'natural', 'earth', 'toprak'],
    palette: { bg: '#fdf6ee', surface: '#fff8f0', accent: '#92400e', fg: '#451a03', fg3: '#78350f',
               imageKw: 'warm_earth_tones,natural_wood,cozy_atmosphere,golden_hour' } },
  { match: ['canlı', 'vibrant', 'renkli', 'colorful', 'bold', 'modern'],
    palette: { bg: '#f8faff', surface: '#ffffff', accent: '#6366f1', fg: '#1e1b4b', fg3: '#6b7280',
               imageKw: 'vibrant_colors,modern_design,bold_composition,colorful' } },
  { match: ['pastel', 'soft', 'yumuşak', 'gentle'],
    palette: { bg: '#fdf4ff', surface: '#ffffff', accent: '#a855f7', fg: '#4a1d96', fg3: '#9ca3af',
               imageKw: 'pastel_colors,soft_light,dreamy_aesthetic,gentle_tones' } },
  { match: ['mavi', 'blue', 'ocean', 'deniz', 'navy'],
    palette: { bg: '#f0f9ff', surface: '#ffffff', accent: '#0ea5e9', fg: '#0c4a6e', fg3: '#64748b',
               imageKw: 'ocean_blue,fresh_water,cool_tones,sky_background' } },
  { match: ['yeşil', 'green', 'nature', 'doğa', 'fresh'],
    palette: { bg: '#f0fdf4', surface: '#ffffff', accent: '#16a34a', fg: '#14532d', fg3: '#6b7280',
               imageKw: 'lush_green,fresh_nature,botanical,organic_textures' } },
];

function detectPalette(styleAnswer) {
  if (!styleAnswer) return null;
  const lower = styleAnswer.toLowerCase();
  for (const p of STYLE_PALETTES) {
    if (p.match.some(m => lower.includes(m))) return p.palette;
  }
  return null;
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveToHistory(text) {
  if (!text?.trim()) return;
  const prev = loadHistory().filter(e => e.text !== text);
  const updated = [{ text, at: Date.now() }, ...prev].slice(0, MAX_HISTORY);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
  return updated;
}
function relTime(ts, lang) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)   return lang === 'tr' ? 'Az önce' : 'Just now';
  if (hours < 1)  return lang === 'tr' ? `${mins}d önce` : `${mins}m ago`;
  if (hours < 24) return lang === 'tr' ? `${hours}s önce` : `${hours}h ago`;
  if (days === 1) return lang === 'tr' ? 'Dün' : 'Yesterday';
  return lang === 'tr' ? `${days}g önce` : `${days}d ago`;
}

function LeftRail({
  lang, tab, onTab,
  // Generate tab
  promptText = '', onPromptChange,
  imagePreview, onImageChange, onImageRemove,
  smartCrop = false, onSmartCropChange,
  generateState = 'idle', onGenerate,
  selectedLabel = null,
  // Files tab
  files = [], selectedFilePath, onSelectFile, onNewFolder, onNewFile,
  platform = 'mobile', onPlatform,
  // Publish tab
  abActive = false, currentVersion = 'v1',
  onPublish, onSaveAsA, onSaveAsB, onStartAB,
  // Design system
  designSystems, onDesignSystemsChange,
  // Brand rules
  brandRules, onBrandRulesChange,
}) {
  const t = window.SDUI.t;
  const hasDS = (designSystems || []).some(d => d.active);
  const hasBrand = !!brandRules && brandRules.trim().length > 0;
  return (
    <div className="pane" style={{ width: 280, flexShrink: 0 }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', padding: '6px 6px 0' }}>
        {[
          { id: 'files',    icon: 'folder',  label: t(lang, 'files') },
          { id: 'generate', icon: 'sparkle', label: lang === 'tr' ? 'Üret' : 'Generate' },
          { id: 'design',   icon: 'figma',   label: lang === 'tr' ? 'Tasarım' : 'Design', dot: hasDS || hasBrand },
          { id: 'publish',  icon: 'rocket',  label: t(lang, 'publish') },
        ].map(x => (
          <button key={x.id} onClick={() => onTab && onTab(x.id)} style={{
            flex: 1, height: 36, position: 'relative',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, fontSize: 10, fontWeight: 500,
            color: tab === x.id ? 'var(--brand)' : 'var(--fg-3)',
            borderBottom: tab === x.id ? '2px solid var(--brand)' : '2px solid transparent',
            marginBottom: -1,
          }}>
            <Icon name={x.icon} size={14}/>
            {x.label}
            {x.dot && (
              <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }}/>
            )}
          </button>
        ))}
      </div>

      <div className="pane-body" style={{ padding: 0 }}>
        {tab === 'files'    && <FilesContent lang={lang} files={files} selectedFilePath={selectedFilePath} onSelectFile={onSelectFile} onNewFolder={onNewFolder} onNewFile={onNewFile} platform={platform} onPlatform={onPlatform}/>}
        {tab === 'generate' && <GenerateContent lang={lang} state={generateState} promptText={promptText} onPromptChange={onPromptChange} imagePreview={imagePreview} onImageChange={onImageChange} onImageRemove={onImageRemove} smartCrop={smartCrop} onSmartCropChange={onSmartCropChange} onGenerate={onGenerate} selectedLabel={selectedLabel} platform={platform} designSystems={designSystems}/>}
        {tab === 'design'   && <DesignContent lang={lang} designSystems={designSystems} onDesignSystemsChange={onDesignSystemsChange} brandRules={brandRules} onBrandRulesChange={onBrandRulesChange}/>}
        {tab === 'publish'  && <PublishContent lang={lang} abActive={abActive} currentVersion={currentVersion} onPublish={onPublish} onSaveAsA={onSaveAsA} onSaveAsB={onSaveAsB} onStartAB={onStartAB}/>}
      </div>
    </div>
  );
}

/* ── Files tab ─────────────────────────────────────────────────────────────── */
function FilesContent({ lang, files, selectedFilePath, onSelectFile, onNewFolder, onNewFile, platform, onPlatform }) {
  const t = window.SDUI.t;
  return (
    <div>
      <div style={{ padding: 10, borderBottom: '1px solid var(--line)', display: 'flex', gap: 6 }}>
        <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onNewFolder && onNewFolder()}>
          <Icon name="folder" size={12}/> {t(lang, 'folder')}
        </button>
        <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onNewFile && onNewFile()}>
          <Icon name="file" size={12}/> {t(lang, 'file')}
        </button>
      </div>

      <div style={{ padding: 6 }}>
        {files.length === 0 ? (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--fg-3)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--panel-2)', margin: '0 auto 10px', display: 'grid', placeItems: 'center', color: 'var(--fg-mute)' }}>
              <Icon name="folder" size={18}/>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-2)', fontWeight: 500, marginBottom: 4 }}>{t(lang, 'workspaceEmpty')}</div>
            <div style={{ fontSize: 11, lineHeight: 1.5 }}>
              {lang === 'tr' ? 'Dosya oluştur ya da prompt yaz.' : 'Create a file or write a prompt.'}
            </div>
          </div>
        ) : (
          files.map((f, i) => (
            <window.SDUI.FileRow
              key={i} {...f}
              selected={f.path === selectedFilePath}
              onClick={() => onSelectFile && onSelectFile(f.path)}
              lang={lang}
            />
          ))
        )}
      </div>

      <div style={{ padding: '0 10px 10px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8, paddingTop: 10 }}>
          {t(lang, 'platform')}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button 
            className="btn" 
            style={{ flex: 1, justifyContent: 'center', ...(platform === 'mobile' ? { background: 'var(--brand-soft)', color: 'var(--brand)', borderColor: 'transparent', fontWeight: 600 } : {}) }}
            onClick={() => onPlatform && onPlatform('mobile')}
          >
            <Icon name="device-mobile" size={12}/> {t(lang, 'mobile')}
          </button>
          <button 
            className="btn" 
            style={{ flex: 1, justifyContent: 'center', ...(platform === 'web' ? { background: 'var(--brand-soft)', color: 'var(--brand)', borderColor: 'transparent', fontWeight: 600 } : {}) }}
            onClick={() => onPlatform && onPlatform('web')}
          >
            <Icon name="globe" size={12}/> {t(lang, 'web')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Clarify card ───────────────────────────────────────────────────────────── */
function ClarifyCard({ lang, questions, answers, onAnswer, onApply, onSkip }) {
  const answered = questions.filter(q => answers[q.id]).length;
  return (
    <div style={{ margin: '10px 0 0', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--brand-soft)' }}>
      <div style={{ padding: '8px 10px', background: 'var(--brand-soft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="sparkle" size={11} style={{ color: 'var(--brand)' }}/>
          <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--brand)' }}>
            {lang === 'tr' ? 'Tasarımı kişiselleştir' : 'Customize your design'}
          </span>
        </div>
        <span style={{ fontSize: 10, color: 'var(--brand)', opacity: 0.7 }}>
          {answered}/{questions.length} {lang === 'tr' ? 'seçildi' : 'selected'}
        </span>
      </div>

      <div style={{ padding: 10, background: 'var(--bg-elev)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions.map((q) => (
          <div key={q.id}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 4 }}>
              {answers[q.id] && <Icon name="check" size={10} style={{ color: 'var(--ok)' }}/>}
              {q.text}
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === opt;
                return (
                  <span
                    key={oi}
                    onClick={() => onAnswer(q.id, selected ? null : opt)}
                    className="chip"
                    style={{
                      cursor: 'pointer', fontSize: 10.5,
                      ...(selected ? { background: 'var(--brand)', color: '#fff', borderColor: 'transparent', fontWeight: 600 } : {}),
                    }}
                  >
                    {opt}
                  </span>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <button className="btn lg primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }} onClick={onApply}>
            <Icon name="sparkle" size={12}/> {lang === 'tr' ? 'Üret' : 'Generate'}
          </button>
          <button className="btn" style={{ fontSize: 11, padding: '0 10px' }} onClick={onSkip}>
            {lang === 'tr' ? 'Atla' : 'Skip'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Generate tab ──────────────────────────────────────────────────────────── */
function GenerateContent({ lang, state, promptText, onPromptChange, imagePreview, onImageChange, onImageRemove, smartCrop, onSmartCropChange, onGenerate, selectedLabel, platform, designSystems }) {
  const fileInputRef = React.useRef(null);
  const t = window.SDUI.t;
  const [history, setHistory] = React.useState(loadHistory);
  const [clarifyState, setClarifyState] = React.useState('idle'); // 'idle'|'loading'|'ready'
  const [clarifyQuestions, setClarifyQuestions] = React.useState([]);
  const [clarifyAnswers, setClarifyAnswers] = React.useState({});
  const prevPromptRef = React.useRef(promptText);

  React.useEffect(() => {
    if (prevPromptRef.current !== promptText) {
      prevPromptRef.current = promptText;
      if (clarifyState !== 'idle') { setClarifyState('idle'); setClarifyQuestions([]); setClarifyAnswers({}); }
    }
  }, [promptText]);

  const shouldClarify = () => {
    const p = promptText?.trim() || '';
    return p.length > 0 && p.length < 100 && !imagePreview;
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleGenerateClick(); }
  };

  const buildEnrichedPrompt = (answers) => {
    const lines = [];

    clarifyQuestions.forEach(q => {
      if (answers[q.id]) {
        const label = q.text.replace(/[?？]/g, '').trim();
        lines.push(`${label}: ${answers[q.id]}`);
      }
    });

    // Inject concrete hex palette from style answer (Q1)
    const styleAnswer = answers[clarifyQuestions[0]?.id];
    const palette = detectPalette(styleAnswer);
    if (palette) {
      lines.push(`Renk paleti: bg=${palette.bg}, surface=${palette.surface}, accent=${palette.accent}, fg=${palette.fg}, fg3=${palette.fg3}`);
      lines.push(`Görsel anahtar kelimeler: ${palette.imageKw}`);
    }

    if (!lines.length) return promptText;
    return `${promptText}\n\n${lines.join('\n')}`;
  };

  const handleGenerateClick = async () => {
    if (clarifyState === 'ready') {
      const enriched = buildEnrichedPrompt(clarifyAnswers);
      if (enriched !== promptText) onPromptChange && onPromptChange(enriched);
      if (enriched?.trim()) setHistory(saveToHistory(enriched));
      setClarifyState('idle'); setClarifyQuestions([]); setClarifyAnswers({});
      onGenerate && onGenerate(enriched);
      return;
    }

    if (shouldClarify() && clarifyState === 'idle') {
      setClarifyState('loading');
      try {
        const fd = new FormData();
        fd.append('prompt', promptText.trim());
        fd.append('platform', platform || 'mobile');
        fd.append('lang', lang);
        const res = await fetch('/clarify', { method: 'POST', body: fd });
        const data = await res.json();
        if (data?.questions?.length) {
          setClarifyQuestions(data.questions);
          setClarifyState('ready');
          return;
        }
      } catch {}
      setClarifyState('idle');
    }

    if (promptText?.trim()) setHistory(saveToHistory(promptText));
    onGenerate && onGenerate();
  };

  const handleSkip = () => {
    setClarifyState('idle'); setClarifyQuestions([]); setClarifyAnswers({});
    if (promptText?.trim()) setHistory(saveToHistory(promptText));
    onGenerate && onGenerate();
  };

  const activeDSList = (designSystems || []).filter(d => d.active);
  const allActiveColors = activeDSList.flatMap(d => Object.values(d.colors || {}));

  return (
    <div>
      {/* Design system badge */}
      {activeDSList.length > 0 && (
        <div style={{ margin: '8px 12px 0', padding: '6px 10px', background: 'var(--ok-soft, #f0fdf4)', border: '1px solid var(--ok, #16a34a)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok, #16a34a)', flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ok, #16a34a)' }}>
              {activeDSList.length === 1
                ? activeDSList[0].name
                : `${activeDSList.length} design system ${lang === 'tr' ? 'aktif' : 'active'}`}
            </div>
            <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
              {allActiveColors.slice(0, 8).map((hex, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: hex, border: '1px solid rgba(0,0,0,0.1)' }}/>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reference image */}
      <div style={{ padding: 12, borderBottom: '1px solid var(--line)', marginTop: activeDSList.length > 0 ? 8 : 0 }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="image" size={11}/> {t(lang, 'referenceImage')}
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onImageChange}/>

        {imagePreview ? (
          <div style={{ position: 'relative', height: 88, borderRadius: 8, overflow: 'hidden' }}>
            <img src={imagePreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
            <button onClick={onImageRemove} style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 10, background: 'rgba(0,0,0,0.65)', color: '#fff', display: 'grid', placeItems: 'center', border: 0 }}>
              <Icon name="x" size={10} stroke={2.5}/>
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{ height: 88, border: '1.5px dashed var(--input-line)', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--fg-3)', background: 'var(--bg-elev)', cursor: 'pointer' }}>
            <Icon name="upload" size={16} stroke={1.5}/>
            <span style={{ fontSize: 11.5 }}>{t(lang, 'chooseImage')}</span>
            <span style={{ fontSize: 10, color: 'var(--fg-mute)' }}>PNG · JPG · WebP</span>
          </div>
        )}

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={smartCrop} onChange={e => onSmartCropChange && onSmartCropChange(e.target.checked)} style={{ marginTop: 2 }}/>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="scissors" size={11}/> {t(lang, 'smartCrop')}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--fg-3)', lineHeight: 1.5, marginTop: 2 }}>{t(lang, 'smartCropHint')}</div>
          </div>
        </label>
      </div>

      {/* Prompt */}
      <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="wand" size={11}/> {t(lang, 'prompt')}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <textarea
            className="textarea"
            placeholder={t(lang, 'promptPlaceholder')}
            value={promptText}
            onChange={e => onPromptChange && onPromptChange(e.target.value)}
            onKeyDown={handleKey}
            style={{ minHeight: 82, fontSize: 12.5, lineHeight: 1.5 }}
          />
          <div style={{ position: 'absolute', bottom: 6, right: 6, display: 'flex', gap: 4 }}>
            <span className="kbd">⌘</span><span className="kbd">↵</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {/* Pre-ready prompt templates */}
          <div style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="sparkle" size={9}/> {lang === 'tr' ? 'Hazır Şablonlar' : 'Ready Templates'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Vodafone 5G Campaign — primary template */}
            <div
              onClick={() => onPromptChange && onPromptChange(lang === 'tr'
                ? `Vodafone 5G cihaz kampanyası ekranı tasarla.

EKRAN YAPISI:
1. Header: Vodafone logosu + "5G Cihazlar" başlığı, sağda sepet ve bildirim ikonu
2. Hero Banner: 5G teknoloji temalı etkileyici görsel, gradient overlay, "5G Hızıyla Tanışın — Yeni Nesil Hız, Uygun Taksitlerle" sloganı, "Fırsatları Keşfet" CTA butonu
3. Marka Filtresi: yatay scroll chip strip — Tümü (aktif), Samsung, iPhone, Xiaomi, Oppo
4. Öne Çıkan Cihazlar (2-sütun grid):
   - Samsung Galaxy S25 Ultra 256GB — eski fiyat: 74.999 TL → kampanya: ₺54.999 (₺2.291/ay × 24 taksit) — "5G" badge
   - iPhone 16 Pro 256GB — eski fiyat: 84.999 TL → kampanya: ₺69.999 (₺2.916/ay × 24 taksit) — "Yeni" badge
5. Takas Kampanyası Banner: gradient kırmızı arka plan, "Eski Cihazını Getir, Yenisini Al!" + "Ekstra 5.000 TL indirim" mesajı, "Başvur" butonu
6. Fırsat Cihazları (2-sütun grid):
   - Xiaomi 15 Ultra 512GB — ₺39.999 (₺1.666/ay × 24 taksit) — "%25 İndirim" badge
   - Samsung Galaxy A56 5G 128GB — ₺17.999 (₺749/ay × 24 taksit) — "5G" badge
7. BottomBar: Ana Sayfa, 5G Cihazlar (aktif), Kampanyalar, Hesabım

RENK PALETİ: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666
Her cihaz kartında: Box overlay içinde badge + ürün görseli + cihaz adı + özellik + yan yana Fiyat Satırı (Row içinde kampanya fiyatı ve üstü çizili eski fiyat) + taksit bilgisi + kırmızı gradyanlı "Sepete Ekle" butonu`
                : `Design a Vodafone 5G device campaign screen.

SCREEN STRUCTURE:
1. Header: Vodafone logo + "5G Devices" title, cart and notification icons on right
2. Hero Banner: 5G technology themed striking visual, gradient overlay, "Experience 5G Speed — Next Gen Speed, Affordable Installments" slogan, "Explore Deals" CTA button
3. Brand Filter: horizontal scroll chip strip — All (active), Samsung, iPhone, Xiaomi, Oppo
4. Featured Devices (2-column grid):
   - Samsung Galaxy S25 Ultra 256GB — old: $1,299 → campaign: $999 ($41.6/mo × 24) — "5G" badge
   - iPhone 16 Pro 256GB — old: $1,499 → campaign: $1,199 ($49.9/mo × 24) — "New" badge
5. Trade-in Banner: red gradient, "Trade in your old phone, get a new one!" + "$200 extra discount", "Apply" button
6. Deal Devices (2-column grid):
   - Xiaomi 15 Ultra 512GB — $699 ($29.1/mo × 24) — "25% Off" badge
   - Samsung Galaxy A56 5G 128GB — $349 ($14.5/mo × 24) — "5G" badge
7. BottomBar: Home, 5G Devices (active), Deals, Account

COLOR PALETTE: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666
For each device card: Box overlay with badge + product image + device name + specs + side-by-side Price Row (campaign price and old price with line-through) + installment info + red gradient "Add to Cart" button`
              )}
              style={{
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, #E6000012, #E6000006)',
                border: '1px solid #E6000030',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E60000'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000020, #E6000010)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6000030'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000012, #E6000006)'; }}
            >
              <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>📱</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E60000' }}>
                  {lang === 'tr' ? 'Vodafone 5G Cihaz Kampanyası' : 'Vodafone 5G Device Campaign'}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--fg-3)', marginTop: 1 }}>
                  {lang === 'tr' ? 'Production-ready kampanya ekranı — tıkla ve üret' : 'Production-ready campaign screen — click and generate'}
                </div>
              </div>
              <Icon name="chev-r" size={10} style={{ color: '#E6000080', flexShrink: 0 }}/>
            </div>

            {/* Secondary template: general e-commerce */}
            <div
              onClick={() => onPromptChange && onPromptChange(lang === 'tr'
                ? `E-ticaret ana ekranı: Hero banner + kategori strip + öne çıkan ürünler grid (2 sütun) + kampanya kartları + bottom bar. Premium ve modern tasarım.`
                : `E-commerce home screen: Hero banner + category strip + featured products grid (2 col) + campaign cards + bottom bar. Premium and modern design.`
              )}
              style={{
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'var(--bg-elev)', border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>🛍️</span>
              <span style={{ fontSize: 10.5, color: 'var(--fg-2)', fontWeight: 500 }}>
                {lang === 'tr' ? 'E-Ticaret Ana Ekranı' : 'E-Commerce Home'}
              </span>
            </div>
          </div>

          {/* Quick-add chips */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 2 }}>
            {selectedLabel && (
              <span
                className="chip"
                style={{ cursor: 'pointer', fontSize: 10.5, background: 'var(--brand-soft)', color: 'var(--brand)', borderColor: 'transparent', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={() => onPromptChange && onPromptChange((promptText ? promptText + ' ' : '') + selectedLabel + ' ')}
              >
                <Icon name="wand" size={10}/> {selectedLabel}
              </span>
            )}
            {(lang === 'tr'
              ? ['+ Koyu tema', '+ Taksit detayı', '+ Stok durumu', '+ Karşılaştır']
              : ['+ Dark theme', '+ Installment detail', '+ Stock status', '+ Compare']
            ).map((c, i) => (
              <span key={i} className="chip" style={{ cursor: 'pointer', fontSize: 10.5 }}
                onClick={() => onPromptChange && onPromptChange((promptText ? promptText + ', ' : '') + c.replace('+ ', ''))}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {clarifyState === 'ready' && (
          <ClarifyCard
            lang={lang}
            questions={clarifyQuestions}
            answers={clarifyAnswers}
            onAnswer={(id, val) => setClarifyAnswers(prev => ({ ...prev, [id]: val }))}
            onApply={handleGenerateClick}
            onSkip={handleSkip}
          />
        )}

        {state === 'streaming' ? (
          <button className="btn lg primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} disabled>
            <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}/>
            {lang === 'tr' ? 'AI üretiyor…' : 'AI generating…'}
          </button>
        ) : clarifyState === 'loading' ? (
          <button className="btn lg primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} disabled>
            <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}/>
            {lang === 'tr' ? 'Sorular hazırlanıyor…' : 'Preparing questions…'}
          </button>
        ) : clarifyState !== 'ready' && (
          <button className="btn lg primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={handleGenerateClick}>
            <Icon name="sparkle" size={13}/> {state === 'filled' ? t(lang, 'update') : t(lang, 'generate')}
          </button>
        )}
      </div>

      {/* History */}
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{t(lang, 'promptHistoryTitle')}</span>
          {history.length > 0 && (
            <button style={{ fontSize: 9.5, color: 'var(--fg-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }}>
              {lang === 'tr' ? 'Temizle' : 'Clear'}
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--fg-mute)', fontSize: 11 }}>
            {lang === 'tr' ? 'Henüz prompt yok' : 'No prompts yet'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.map((entry, i) => (
              <div key={i}
                onClick={() => onPromptChange && onPromptChange(entry.text)}
                style={{ display: 'flex', gap: 8, padding: 8, borderRadius: 8, background: 'var(--bg-elev)', border: '1px solid var(--line)', cursor: 'pointer' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon name="sparkle" size={12}/>
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 11.5, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{entry.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 2 }}>{relTime(entry.at, lang)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Design System tab ─────────────────────────────────────────────────────── */
function DSCard({ ds, lang, onToggle, onDelete, onRename }) {
  const [editing, setEditing] = React.useState(false);
  const [nameVal, setNameVal] = React.useState(ds.name || '');
  const [expanded, setExpanded] = React.useState(false);
  const colors = ds.colors || {};
  const comps = ds.components || {};

  const commitRename = async () => {
    if (nameVal.trim() && nameVal.trim() !== ds.name) await onRename(ds.id, nameVal.trim());
    setEditing(false);
  };

  return (
    <div style={{ border: `1.5px solid ${ds.active ? 'var(--ok,#16a34a)' : 'var(--line)'}`, borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
      {/* Header row */}
      <div style={{ padding: '8px 10px', background: ds.active ? 'var(--ok-soft,#f0fdf4)' : 'var(--bg-elev)', display: 'flex', alignItems: 'center', gap: 7 }}>
        {/* Active toggle */}
        <button
          onClick={() => onToggle(ds.id)}
          title={ds.active ? (lang === 'tr' ? 'Devre dışı bırak' : 'Disable') : (lang === 'tr' ? 'Etkinleştir' : 'Enable')}
          style={{ width: 28, height: 16, borderRadius: 8, background: ds.active ? 'var(--ok,#16a34a)' : 'var(--line-strong,#d1d5db)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.15s' }}
        >
          <span style={{ position: 'absolute', top: 2, left: ds.active ? 14 : 2, width: 12, height: 12, borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }}/>
        </button>

        {/* Name (editable) */}
        <div style={{ flex: 1, minWidth: 0 }} onDoubleClick={() => setEditing(true)}>
          {editing ? (
            <input
              autoFocus
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onBlur={commitRename}
              onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditing(false); }}
              style={{ width: '100%', fontSize: 11.5, fontWeight: 600, background: 'transparent', border: 'none', outline: 'none', color: 'var(--fg)' }}
            />
          ) : (
            <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ds.name}</div>
          )}
          <div style={{ fontSize: 9.5, color: 'var(--fg-3)', marginTop: 1 }}>
            {Object.keys(colors).length} {lang === 'tr' ? 'renk' : 'colors'} · {Object.keys(comps).length} {lang === 'tr' ? 'comp' : 'comp'}{ds.font_families?.[0] ? ` · ${ds.font_families[0]}` : ''}
          </div>
        </div>

        {/* Expand / Delete */}
        <button onClick={() => setExpanded(e => !e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-3)', padding: 2 }}>
          <Icon name={expanded ? 'chev-d' : 'chev-r'} size={12}/>
        </button>
        <button onClick={() => onDelete(ds.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-mute)', padding: 2 }}>
          <Icon name="trash" size={12}/>
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: '8px 10px', borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Color swatches */}
          {Object.keys(colors).length > 0 && (
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 5 }}>
                {lang === 'tr' ? 'Renkler' : 'Colors'}
              </div>
              {Object.entries(colors).map(([role, hex]) => (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: hex, border: '1px solid var(--line)', flexShrink: 0 }}/>
                  <span style={{ fontSize: 10, color: 'var(--fg-2)', flex: 1 }}>{role}</span>
                  <span style={{ fontSize: 9.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{hex}</span>
                </div>
              ))}
            </div>
          )}

          {/* Components */}
          {Object.keys(comps).length > 0 && (
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 5 }}>
                {lang === 'tr' ? 'Componentler' : 'Components'}
              </div>
              {Object.entries(comps).slice(0, 6).map(([key, comp]) => {
                const pills = [];
                if (comp.bg)      pills.push({ label: comp.bg, color: comp.bg });
                if (comp.corner)  pills.push({ label: `r${comp.corner}` });
                if (comp.height)  pills.push({ label: `h${comp.height}` });
                return (
                  <div key={key} style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg-2)' }}>{comp.name}</span>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
                      {pills.map((p, i) => (
                        <span key={i} style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: p.color ? p.color+'22' : 'var(--panel-2)', color: 'var(--fg-3)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 2 }}>
                          {p.color && <span style={{ width: 6, height: 6, borderRadius: 2, background: p.color }}/>}
                          {p.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {Object.keys(comps).length > 6 && (
                <div style={{ fontSize: 9.5, color: 'var(--fg-mute)' }}>+{Object.keys(comps).length - 6} {lang === 'tr' ? 'daha' : 'more'}</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Wrapper combining Brand Rules + Design System ── */
function DesignContent({ lang, designSystems, onDesignSystemsChange, brandRules, onBrandRulesChange }) {
  return (
    <div>
      <BrandRulesSection lang={lang} brandRules={brandRules} onBrandRulesChange={onBrandRulesChange}/>
      <DesignSystemContent lang={lang} designSystems={designSystems} onDesignSystemsChange={onDesignSystemsChange}/>
    </div>
  );
}

/* ── Brand Rules Section ── */
function BrandRulesSection({ lang, brandRules, onBrandRulesChange }) {
  const [open, setOpen] = React.useState(true);
  const [localText, setLocalText] = React.useState(brandRules || '');
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const saveTimer = React.useRef(null);
  const tr = lang === 'tr';
  const isVF = localText.trim().startsWith('Vodafone');

  // Sync when parent updates (e.g. initial load)
  React.useEffect(() => { setLocalText(brandRules || ''); }, [brandRules]);

  const handleChange = (v) => {
    setLocalText(v);
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveRules(v), 1200);
  };

  const saveRules = async (text) => {
    setSaving(true);
    try {
      await fetch('/api/brand/rules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: text }),
      });
      onBrandRulesChange && onBrandRulesChange(text);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/brand/rules/reset', { method: 'POST' });
      const data = await res.json();
      setLocalText(data.rules);
      onBrandRulesChange && onBrandRulesChange(data.rules);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <div className="section-head" style={{
        height: 34, padding: '0 12px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none',
      }} onClick={() => setOpen(o => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-2)' }}>
          <Icon name="bookmark" size={12}/>
          {tr ? 'Marka Kuralları' : 'Brand Rules'}
          {localText.trim() && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isVF ? '#E60000' : 'var(--ok)', flexShrink: 0 }}/>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {saved && <span style={{ fontSize: 10, color: 'var(--ok)', fontWeight: 600 }}>✓</span>}
          {saving && <span className="spinner" style={{ width: 10, height: 10 }}/>}
          <Icon name="chev-r" size={11} stroke={2} style={{ transition: 'transform .2s', transform: open ? 'rotate(90deg)' : 'none', color: 'var(--fg-3)' }}/>
        </div>
      </div>

      {open && (
        <div style={{ padding: '0 12px 12px' }}>
          {/* Vodafone quick-fill chip */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleChange('')}
              style={{
                height: 22, padding: '0 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
                background: !localText.trim() ? 'var(--brand-soft)' : 'var(--panel-2)',
                color: !localText.trim() ? 'var(--brand)' : 'var(--fg-3)',
                border: '1px solid var(--line)', cursor: 'pointer',
              }}
            >
              {tr ? 'Yok' : 'None'}
            </button>
            <button
              onClick={handleReset}
              style={{
                height: 22, padding: '0 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
                background: isVF ? '#E600001a' : 'var(--panel-2)',
                color: isVF ? '#E60000' : 'var(--fg-3)',
                border: `1px solid ${isVF ? '#E6000040' : 'var(--line)'}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>🔴</span> Vodafone
            </button>
          </div>

          <textarea
            className="textarea"
            style={{ width: '100%', minHeight: 160, fontSize: 11, fontFamily: 'var(--font-mono)', lineHeight: 1.5, resize: 'vertical' }}
            placeholder={tr ? 'Marka renklerini, tipografiyi ve tasarım kurallarını buraya yaz…' : 'Write your brand colors, typography and design rules here…'}
            value={localText}
            onChange={e => handleChange(e.target.value)}
          />
          <div style={{ fontSize: 10, color: 'var(--fg-mute)', marginTop: 4 }}>
            {tr ? 'Her üretimde AI\'ya enjekte edilir. Boş bırakırsan devre dışı.' : 'Injected into every AI generation. Leave empty to disable.'}
          </div>
        </div>
      )}
    </div>
  );
}

function DesignSystemContent({ lang, designSystems, onDesignSystemsChange }) {
  const [url, setUrl] = React.useState('');
  const [dsName, setDsName] = React.useState('');
  const [token, setToken] = React.useState(() => {
    try { return localStorage.getItem('figma_token') || ''; } catch { return ''; }
  });
  const [status, setStatus] = React.useState('idle');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);

  const saveToken = (v) => {
    setToken(v);
    try { localStorage.setItem('figma_token', v); } catch {}
  };

  const handleImport = async () => {
    if (!url.trim() || !token.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      const fd = new FormData();
      fd.append('figma_url', url.trim());
      fd.append('figma_token', token.trim());
      if (dsName.trim()) fd.append('name', dsName.trim());
      const res = await fetch('/api/design-system/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Import failed');
      onDesignSystemsChange && onDesignSystemsChange(data.all);
      setStatus('idle');
      setUrl('');
      setDsName('');
      setShowForm(false);
    } catch (e) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  const handleToggle = async (id) => {
    const res = await fetch(`/api/design-system/${id}/toggle`, { method: 'PUT' });
    const data = await res.json();
    if (data.all) onDesignSystemsChange && onDesignSystemsChange(data.all);
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/design-system/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.all) onDesignSystemsChange && onDesignSystemsChange(data.all);
  };

  const handleRename = async (id, name) => {
    const fd = new FormData(); fd.append('name', name);
    const res = await fetch(`/api/design-system/${id}/rename`, { method: 'PUT', body: fd });
    const data = await res.json();
    if (data.all) onDesignSystemsChange && onDesignSystemsChange(data.all);
  };

  const list = designSystems || [];
  const activeCount = list.filter(d => d.active).length;

  return (
    <div>
      {/* List */}
      <div style={{ padding: 12, borderBottom: list.length > 0 || showForm ? '1px solid var(--line)' : 'none' }}>
        {list.length > 0 && (
          <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{lang === 'tr' ? 'Design Systemler' : 'Design Systems'}</span>
            {activeCount > 0 && (
              <span style={{ fontSize: 9.5, background: 'var(--ok-soft,#f0fdf4)', color: 'var(--ok,#16a34a)', border: '1px solid var(--ok,#16a34a)', borderRadius: 10, padding: '1px 6px', fontWeight: 600 }}>
                {activeCount} {lang === 'tr' ? 'aktif' : 'active'}
              </span>
            )}
          </div>
        )}

        {list.length === 0 && !showForm && (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--fg-3)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--panel-2)', margin: '0 auto 8px', display: 'grid', placeItems: 'center', color: 'var(--fg-mute)' }}>
              <Icon name="figma" size={16}/>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-2)', fontWeight: 500, marginBottom: 3 }}>
              {lang === 'tr' ? 'Henüz design system yok' : 'No design systems yet'}
            </div>
            <div style={{ fontSize: 10.5, lineHeight: 1.5 }}>
              {lang === 'tr' ? 'Figma dosyandan içe aktar.' : 'Import from a Figma file.'}
            </div>
          </div>
        )}

        {list.map(ds => (
          <DSCard key={ds.id} ds={ds} lang={lang} onToggle={handleToggle} onDelete={handleDelete} onRename={handleRename}/>
        ))}

        <button
          className="btn"
          style={{ width: '100%', justifyContent: 'center', marginTop: list.length > 0 ? 4 : 0 }}
          onClick={() => setShowForm(f => !f)}
        >
          <Icon name={showForm ? 'x' : 'plus'} size={12}/>
          {showForm ? (lang === 'tr' ? 'İptal' : 'Cancel') : (lang === 'tr' ? 'Yeni Design System Ekle' : 'Add Design System')}
        </button>
      </div>

      {/* Import form */}
      {showForm && (
        <div style={{ padding: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              className="textarea"
              style={{ height: 32, fontSize: 11.5, padding: '0 8px', resize: 'none', minHeight: 'unset' }}
              placeholder={lang === 'tr' ? 'İsim (isteğe bağlı)' : 'Name (optional)'}
              value={dsName}
              onChange={e => setDsName(e.target.value)}
            />
            <input
              className="textarea"
              style={{ height: 32, fontSize: 11.5, padding: '0 8px', resize: 'none', minHeight: 'unset' }}
              placeholder={lang === 'tr' ? 'Figma dosya URL\'si' : 'Figma file URL'}
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
            <input
              className="textarea"
              style={{ height: 32, fontSize: 11.5, padding: '0 8px', resize: 'none', minHeight: 'unset' }}
              type="password"
              placeholder={lang === 'tr' ? 'Figma API token' : 'Figma API token'}
              value={token}
              onChange={e => saveToken(e.target.value)}
            />

            {status === 'error' && (
              <div style={{ fontSize: 10.5, color: 'var(--err,#ef4444)', padding: '4px 6px', background: 'var(--err-soft,#fef2f2)', borderRadius: 6, lineHeight: 1.4 }}>
                {errorMsg}
              </div>
            )}

            <button
              className="btn lg primary"
              style={{ width: '100%', justifyContent: 'center', opacity: (!url.trim() || !token.trim()) ? 0.5 : 1 }}
              disabled={!url.trim() || !token.trim() || status === 'loading'}
              onClick={handleImport}
            >
              {status === 'loading'
                ? <><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}/>{lang === 'tr' ? 'İçe aktarılıyor…' : 'Importing…'}</>
                : <><Icon name="figma" size={12}/>{lang === 'tr' ? 'İçe Aktar' : 'Import'}</>
              }
            </button>
          </div>

          <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--fg-3)', lineHeight: 1.55 }}>
              {lang === 'tr'
                ? 'Figma → Profil → Settings → Account → Personal access tokens → +'
                : 'Figma → Profile → Settings → Account → Personal access tokens → +'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Publish tab ───────────────────────────────────────────────────────────── */
function PublishContent({ lang, abActive, currentVersion, onPublish, onSaveAsA, onSaveAsB, onStartAB }) {
  const T = window.I18N[lang];
  const vNum = parseInt((currentVersion || 'v1').replace('v', '')) || 1;
  const prevV = 'v' + Math.max(1, vNum - 1);

  return (
    <div>
      <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8 }}>
          {T.publishingFlow}
        </div>

        <div style={{ padding: 10, background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 0 3px var(--ok-soft)' }}/>
            <span style={{ fontSize: 11.5, fontWeight: 600 }}>{currentVersion}</span>
            <span className="chip ok" style={{ marginLeft: 'auto', height: 18 }}>{T.productionTag}</span>
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>
            {lang === 'tr' ? 'Son güncelleme: Az önce' : 'Last update: just now'}
          </div>
        </div>

        <button className="btn lg primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 6 }} onClick={onPublish}>
          <Icon name="rocket" size={13}/> {T.publishOne}
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onSaveAsA}>
            <Icon name="git-branch" size={11}/> {T.saveAsA}
          </button>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onSaveAsB}>
            <Icon name="git-branch" size={11}/> {T.saveAsB}
          </button>
        </div>
        {abActive ? (
          <div style={{ marginTop: 6, height: 36, borderRadius: 8, background: 'var(--brand-soft)', color: 'var(--brand)', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, fontWeight: 500 }}>
            <Icon name="lightning" size={12}/> {T.abInProgress}
          </div>
        ) : (
          <button className="btn lg" style={{ width: '100%', justifyContent: 'center', marginTop: 6, background: 'var(--brand)', color: '#fff', borderColor: 'transparent' }} onClick={onStartAB}>
            <Icon name="lightning" size={12}/> {T.startAB}
          </button>
        )}
      </div>

      {/* Versions timeline */}
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 10 }}>{T.versions}</div>
        <div style={{ position: 'relative', paddingLeft: 16 }}>
          <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 1, background: 'var(--line)' }}/>
          {[
            { v: currentVersion, when: lang === 'tr' ? 'Az önce' : 'Just now', who: lang === 'tr' ? 'Sen' : 'You', tag: T.productionTag, current: true },
            { v: prevV, when: lang === 'tr' ? '1 sa önce' : '1h ago', who: lang === 'tr' ? 'AI üretim' : 'AI gen', tag: T.stagingTag },
          ].map((it, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: 12 }}>
              <span style={{
                position: 'absolute', left: -13, top: 4, width: 10, height: 10, borderRadius: '50%',
                background: it.current ? 'var(--brand)' : 'var(--panel)',
                border: it.current ? '2px solid var(--brand)' : '2px solid var(--line-strong)',
                boxShadow: it.current ? '0 0 0 3px var(--brand-soft)' : 'none',
              }}/>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 600 }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{it.v}</span>
                {it.tag && (
                  <span className={'chip ' + (it.tag === T.productionTag ? 'ok' : 'info')} style={{ height: 16, fontSize: 9.5 }}>{it.tag}</span>
                )}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--fg-3)', marginTop: 2 }}>{it.when} · {it.who}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.LeftRail = LeftRail;
