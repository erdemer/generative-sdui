/* SDUI Studio — Left-rail tabbed panels with real callbacks */

const HISTORY_KEY = 'sdui_prompt_history';
const MAX_HISTORY = 8;
var Icon = window.Icon;

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
}) {
  const t = window.SDUI.t;
  return (
    <div className="pane" style={{ width: 280, flexShrink: 0 }}>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', padding: '6px 6px 0' }}>
        {[
          { id: 'files',    icon: 'folder',  label: t(lang, 'files') },
          { id: 'generate', icon: 'sparkle', label: lang === 'tr' ? 'Üret' : 'Generate' },
          { id: 'publish',  icon: 'rocket',  label: t(lang, 'publish') },
        ].map(x => (
          <button key={x.id} onClick={() => onTab && onTab(x.id)} style={{
            flex: 1, height: 36,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, fontSize: 10, fontWeight: 500,
            color: tab === x.id ? 'var(--brand)' : 'var(--fg-3)',
            borderBottom: tab === x.id ? '2px solid var(--brand)' : '2px solid transparent',
            marginBottom: -1,
          }}>
            <Icon name={x.icon} size={14}/>
            {x.label}
          </button>
        ))}
      </div>

      <div className="pane-body" style={{ padding: 0 }}>
        {tab === 'files'    && <FilesContent lang={lang} files={files} selectedFilePath={selectedFilePath} onSelectFile={onSelectFile} onNewFolder={onNewFolder} onNewFile={onNewFile} platform={platform} onPlatform={onPlatform}/>}
        {tab === 'generate' && <GenerateContent lang={lang} state={generateState} promptText={promptText} onPromptChange={onPromptChange} imagePreview={imagePreview} onImageChange={onImageChange} onImageRemove={onImageRemove} smartCrop={smartCrop} onSmartCropChange={onSmartCropChange} onGenerate={onGenerate} selectedLabel={selectedLabel}/>}
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

/* ── Generate tab ──────────────────────────────────────────────────────────── */
function GenerateContent({ lang, state, promptText, onPromptChange, imagePreview, onImageChange, onImageRemove, smartCrop, onSmartCropChange, onGenerate, selectedLabel }) {
  const fileInputRef = React.useRef(null);
  const t = window.SDUI.t;
  const [history, setHistory] = useS2(loadHistory);

  const handleKey = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleGenerate = () => {
    if (promptText?.trim()) setHistory(saveToHistory(promptText));
    onGenerate && onGenerate();
  };

  return (
    <div>
      {/* Reference image */}
      <div style={{ padding: 12, borderBottom: '1px solid var(--line)' }}>
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

        {state === 'streaming' ? (
          <button className="btn lg primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} disabled>
            <span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}/>
            {lang === 'tr' ? 'AI üretiyor…' : 'AI generating…'}
          </button>
        ) : (
          <button className="btn lg primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={handleGenerate}>
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
