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
  designSystem, onDesignSystemChange,
}) {
  const t = window.SDUI.t;
  const hasDS = !!designSystem;
  return (
    <div className="pane" style={{ width: 280, flexShrink: 0 }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', padding: '6px 6px 0' }}>
        {[
          { id: 'files',    icon: 'folder',  label: t(lang, 'files') },
          { id: 'generate', icon: 'sparkle', label: lang === 'tr' ? 'Üret' : 'Generate' },
          { id: 'design',   icon: 'figma',   label: lang === 'tr' ? 'Tasarım' : 'Design', dot: hasDS },
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
        {tab === 'generate' && <GenerateContent lang={lang} state={generateState} promptText={promptText} onPromptChange={onPromptChange} imagePreview={imagePreview} onImageChange={onImageChange} onImageRemove={onImageRemove} smartCrop={smartCrop} onSmartCropChange={onSmartCropChange} onGenerate={onGenerate} selectedLabel={selectedLabel} platform={platform} designSystem={designSystem}/>}
        {tab === 'design'   && <DesignSystemContent lang={lang} designSystem={designSystem} onDesignSystemChange={onDesignSystemChange}/>}
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
function GenerateContent({ lang, state, promptText, onPromptChange, imagePreview, onImageChange, onImageRemove, smartCrop, onSmartCropChange, onGenerate, selectedLabel, platform, designSystem }) {
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

  const dsColors = designSystem?.colors || {};

  return (
    <div>
      {/* Design system badge */}
      {designSystem && (
        <div style={{ margin: '8px 12px 0', padding: '6px 10px', background: 'var(--ok-soft, #f0fdf4)', border: '1px solid var(--ok, #16a34a)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok, #16a34a)', flexShrink: 0 }}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ok, #16a34a)' }}>
              {lang === 'tr' ? 'Figma Design System aktif' : 'Figma Design System active'}
            </div>
            <div style={{ display: 'flex', gap: 3, marginTop: 3 }}>
              {Object.values(dsColors).slice(0, 6).map((hex, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: 3, background: hex, border: '1px solid rgba(0,0,0,0.1)' }}/>
              ))}
              {designSystem.font_families?.[0] && (
                <span style={{ fontSize: 9.5, color: 'var(--fg-3)', marginLeft: 4, alignSelf: 'center' }}>{designSystem.font_families[0]}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reference image */}
      <div style={{ padding: 12, borderBottom: '1px solid var(--line)', marginTop: designSystem ? 8 : 0 }}>
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

        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {selectedLabel && (
            <span
              className="chip"
              style={{ cursor: 'pointer', fontSize: 10.5, background: 'var(--brand-soft)', color: 'var(--brand)', borderColor: 'transparent', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => onPromptChange && onPromptChange((promptText ? promptText + ' ' : '') + selectedLabel + ' ')}
            >
              <Icon name="wand" size={10}/> {selectedLabel}
            </span>
          )}
          {(lang === 'tr' ? ['+ Tipografi', '+ Koyu tema', '+ Animasyon'] : ['+ Typography', '+ Dark theme', '+ Animations']).map((c, i) => (
            <span key={i} className="chip" style={{ cursor: 'pointer', fontSize: 10.5 }}
              onClick={() => onPromptChange && onPromptChange((promptText ? promptText + ', ' : '') + c.replace('+ ', ''))}>
              {c}
            </span>
          ))}
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
function DesignSystemContent({ lang, designSystem, onDesignSystemChange }) {
  const [url, setUrl] = React.useState('');
  const [token, setToken] = React.useState(() => {
    try { return localStorage.getItem('figma_token') || ''; } catch { return ''; }
  });
  const [status, setStatus] = React.useState('idle'); // 'idle' | 'loading' | 'error'
  const [errorMsg, setErrorMsg] = React.useState('');

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
      const res = await fetch('/api/design-system/import', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Import failed');
      onDesignSystemChange && onDesignSystemChange(data.design_system);
      setStatus('idle');
      setUrl('');
    } catch (e) {
      setErrorMsg(e.message);
      setStatus('error');
    }
  };

  const handleClear = async () => {
    await fetch('/api/design-system', { method: 'DELETE' });
    onDesignSystemChange && onDesignSystemChange(null);
  };

  const ds = designSystem;
  const colors = ds?.colors || {};
  const typo = ds?.typography || {};
  const fonts = ds?.font_families || [];

  return (
    <div>
      {/* Active design system summary */}
      {ds ? (
        <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }}/>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ok)' }}>
                {lang === 'tr' ? 'Design system aktif' : 'Design system active'}
              </span>
            </div>
            <button
              onClick={handleClear}
              style={{ fontSize: 10, color: 'var(--fg-mute)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {lang === 'tr' ? 'Kaldır' : 'Remove'}
            </button>
          </div>

          <div style={{ fontSize: 10, color: 'var(--fg-3)', marginBottom: 10 }}>
            {ds.raw_color_count || 0} {lang === 'tr' ? 'renk' : 'colors'} · {ds.raw_typo_count || 0} {lang === 'tr' ? 'metin stili' : 'text styles'}
            {fonts.length > 0 && ` · ${fonts[0]}`}
          </div>

          {/* Color swatches */}
          {Object.keys(colors).length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 5 }}>
                {lang === 'tr' ? 'Renk paleti' : 'Color palette'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {Object.entries(colors).map(([role, hex]) => (
                  <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 4, background: hex, border: '1px solid var(--line)', flexShrink: 0 }}/>
                    <span style={{ fontSize: 10.5, color: 'var(--fg-2)', flex: 1, fontWeight: 500 }}>{role}</span>
                    <span style={{ fontSize: 9.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Typography summary */}
          {Object.keys(typo).length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 5 }}>
                {lang === 'tr' ? 'Tipografi' : 'Typography'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {Object.entries(typo).slice(0, 5).map(([role, t]) => (
                  <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--fg-3)', width: 40, flexShrink: 0 }}>{role}</span>
                    <span style={{ fontSize: 10, color: 'var(--fg-2)' }}>
                      {t.fontFamily || ''}{t.fontSize ? ` ${t.fontSize}sp` : ''}{t.fontWeight ? ` ·${t.fontWeight}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--fg-3)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--panel-2)', margin: '0 auto 10px', display: 'grid', placeItems: 'center', color: 'var(--fg-mute)' }}>
            <Icon name="figma" size={18}/>
          </div>
          <div style={{ fontSize: 12, color: 'var(--fg-2)', fontWeight: 500, marginBottom: 4 }}>
            {lang === 'tr' ? 'Design system yok' : 'No design system'}
          </div>
          <div style={{ fontSize: 11, lineHeight: 1.5 }}>
            {lang === 'tr'
              ? 'Figma dosya URL\'si ve token ile içe aktar.'
              : 'Import from a Figma file URL and token.'}
          </div>
        </div>
      )}

      {/* Import form */}
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-3)', marginBottom: 8 }}>
          {ds
            ? (lang === 'tr' ? 'Farklı dosyadan içe aktar' : 'Import from another file')
            : (lang === 'tr' ? 'Figma\'dan içe aktar' : 'Import from Figma')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
            <div style={{ fontSize: 10.5, color: 'var(--err, #ef4444)', lineHeight: 1.4, padding: '4px 6px', background: 'var(--err-soft, #fef2f2)', borderRadius: 6 }}>
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
              : <><Icon name="figma" size={12}/>{lang === 'tr' ? 'Design System\'i İçe Aktar' : 'Import Design System'}</>
            }
          </button>
        </div>

        <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg-elev)', border: '1px solid var(--line)', borderRadius: 8 }}>
          <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--fg-2)', marginBottom: 4 }}>
            {lang === 'tr' ? 'Nasıl token alınır?' : 'How to get a token?'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--fg-3)', lineHeight: 1.55 }}>
            {lang === 'tr'
              ? 'Figma → Profil → Settings → Account → Personal access tokens → + bölümünden oluştur.'
              : 'Figma → Profile → Settings → Account → Personal access tokens → +.'}
          </div>
        </div>
      </div>
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
