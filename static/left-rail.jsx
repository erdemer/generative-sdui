/* SDUI Studio — Left-rail tabbed panels with real callbacks */

const HISTORY_KEY = 'sdui_prompt_history';
const MAX_HISTORY = 8;
var Icon = window.Icon;

/* ── Pre-built template: Vodafone Red Konsol — MAAC Marketplace ───────────── */
const MAAC_TEMPLATE_JSON = {"screen_name":"RedKonsol","layout":{"type":"Column","props":{"fillMaxSize":"true","backgroundColor":"#0B0B18","scrollable":"true"},"children":[{"type":"Spacer","props":{"height":10}},{"type":"Row","props":{"fillMaxWidth":"true","padding":"0,20,0,16","verticalAlignment":"center","horizontalArrangement":"spaceBetween"},"children":[{"type":"Row","props":{"verticalAlignment":"center","gap":8},"children":[{"type":"Image","props":{"url":"/static/logo.png","w":28,"h":28}},{"type":"Text","props":{"text":"Red Konsol","fontSize":20,"bold":"true","color":"#E60000"}}]},{"type":"Row","props":{"verticalAlignment":"center","gap":10},"children":[{"type":"Box","props":{"w":36,"h":36,"corner":18,"backgroundColor":"#1E1E2E","contentAlignment":"center"},"children":[{"type":"Icon","props":{"name":"bell","size":18,"color":"#AAAACC"}}]},{"type":"Box","props":{"w":36,"h":36,"corner":18,"backgroundColor":"#E60000","contentAlignment":"center"},"children":[{"type":"Text","props":{"text":"MT","fontSize":12,"bold":"true","color":"#FFFFFF"}}]}]}]},{"type":"Spacer","props":{"height":16}},{"type":"Box","props":{"fillMaxWidth":"true","marginStart":16,"marginEnd":16,"corner":18,"backgroundColor":"linear-gradient(135deg,#2A0808,#160404)"},"children":[{"type":"Column","props":{"fillMaxWidth":"true","padding":"18,18,18,18","gap":14},"children":[{"type":"Row","props":{"fillMaxWidth":"true","verticalAlignment":"flex-start","horizontalArrangement":"spaceBetween"},"children":[{"type":"Column","props":{"gap":4,"weight":1},"children":[{"type":"Text","props":{"text":"Mehmet Teknoloji A.Ş.","fontSize":16,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"Red Business Premium · 47 Lisans","fontSize":12,"color":"#88889A"}}]},{"type":"Column","props":{"horizontalAlignment":"end","gap":1},"children":[{"type":"Text","props":{"text":"Aylık toplam","fontSize":10,"color":"#88889A"}},{"type":"Text","props":{"text":"₺12.340","fontSize":22,"bold":"true","color":"#E60000"}}]}]},{"type":"Box","props":{"fillMaxWidth":"true","height":1,"backgroundColor":"#FFFFFF18"}},{"type":"Row","props":{"fillMaxWidth":"true","verticalAlignment":"center","horizontalArrangement":"spaceBetween"},"children":[{"type":"Row","props":{"verticalAlignment":"center","gap":6},"children":[{"type":"Box","props":{"w":7,"h":7,"corner":4,"backgroundColor":"#00B012"}},{"type":"Text","props":{"text":"Tüm hizmetler aktif","fontSize":12,"color":"#00B012"}}]},{"type":"Row","props":{"gap":20,"verticalAlignment":"center"},"children":[{"type":"Column","props":{"horizontalAlignment":"center","gap":1},"children":[{"type":"Text","props":{"text":"47","fontSize":15,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"Lisans","fontSize":10,"color":"#88889A"}}]},{"type":"Box","props":{"w":1,"height":24,"backgroundColor":"#FFFFFF22"}},{"type":"Column","props":{"horizontalAlignment":"center","gap":1},"children":[{"type":"Text","props":{"text":"6","fontSize":15,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"Çözüm","fontSize":10,"color":"#88889A"}}]},{"type":"Box","props":{"w":1,"height":24,"backgroundColor":"#FFFFFF22"}},{"type":"Column","props":{"horizontalAlignment":"center","gap":1},"children":[{"type":"Text","props":{"text":"Haz","fontSize":15,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"Fatura","fontSize":10,"color":"#88889A"}}]}]}]}]}]},{"type":"Spacer","props":{"height":20}},{"type":"Row","props":{"fillMaxWidth":"true","paddingStart":16,"paddingEnd":16,"gap":8,"scrollable":"true"},"children":[{"type":"Box","props":{"padding":"7,16,7,16","corner":20,"backgroundColor":"#E60000"},"children":[{"type":"Text","props":{"text":"Tümü","fontSize":13,"bold":"true","color":"#FFFFFF"}}]},{"type":"Box","props":{"padding":"7,16,7,16","corner":20,"backgroundColor":"#1A1A2E"},"children":[{"type":"Text","props":{"text":"Microsoft","fontSize":13,"color":"#AAAACC"}}]},{"type":"Box","props":{"padding":"7,16,7,16","corner":20,"backgroundColor":"#1A1A2E"},"children":[{"type":"Text","props":{"text":"Google","fontSize":13,"color":"#AAAACC"}}]},{"type":"Box","props":{"padding":"7,16,7,16","corner":20,"backgroundColor":"#1A1A2E"},"children":[{"type":"Text","props":{"text":"Güvenlik","fontSize":13,"color":"#AAAACC"}}]},{"type":"Box","props":{"padding":"7,16,7,16","corner":20,"backgroundColor":"#1A1A2E"},"children":[{"type":"Text","props":{"text":"Depolama","fontSize":13,"color":"#AAAACC"}}]}]},{"type":"Spacer","props":{"height":20}},{"type":"Row","props":{"fillMaxWidth":"true","paddingStart":16,"paddingEnd":16,"verticalAlignment":"center","horizontalArrangement":"spaceBetween"},"children":[{"type":"Text","props":{"text":"Öne Çıkan Çözümler","fontSize":17,"bold":"true","color":"#FFFFFF"}},{"type":"Row","props":{"verticalAlignment":"center","gap":3},"children":[{"type":"Text","props":{"text":"Tümü","fontSize":13,"color":"#E60000"}},{"type":"Icon","props":{"name":"chev-r","size":13,"color":"#E60000"}}]}]},{"type":"Spacer","props":{"height":12}},{"type":"Row","props":{"fillMaxWidth":"true","paddingStart":16,"gap":12,"scrollable":"true"},"children":[{"type":"Box","props":{"w":190,"corner":16,"backgroundColor":"#13131F","elevation":3},"children":[{"type":"Column","props":{"fillMaxWidth":"true"},"children":[{"type":"Box","props":{"fillMaxWidth":"true","h":90,"backgroundColor":"#1C1C2E","contentAlignment":"center"},"children":[{"type":"Image","props":{"url":"https://image.pollinations.ai/prompt/microsoft_office_365_logo_colorful_on_dark_background_clean?nologo=true&width=200&height=200&model=flux","w":52,"h":52,"contentScale":"fit"}}]},{"type":"Column","props":{"padding":"12,12,12,12","gap":7},"children":[{"type":"Text","props":{"text":"Microsoft 365 Business Standard","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"Word · Excel · Teams · 1TB","fontSize":11,"color":"#88889A"}},{"type":"Box","props":{"padding":"3,8,3,8","corner":5,"backgroundColor":"#2D1515"},"children":[{"type":"Text","props":{"text":"Microsoft","fontSize":10,"bold":"true","color":"#E60000"}}]},{"type":"Row","props":{"verticalAlignment":"baseline","gap":1},"children":[{"type":"Text","props":{"text":"₺350","fontSize":17,"bold":"true","color":"#E60000"}},{"type":"Text","props":{"text":"/kullanıcı/ay","fontSize":10,"color":"#88889A"}}]}]}]}]},{"type":"Box","props":{"w":190,"corner":16,"backgroundColor":"#13131F","elevation":3},"children":[{"type":"Column","props":{"fillMaxWidth":"true"},"children":[{"type":"Box","props":{"fillMaxWidth":"true","h":90,"backgroundColor":"#1C1C2E","contentAlignment":"center"},"children":[{"type":"Image","props":{"url":"https://image.pollinations.ai/prompt/google_workspace_logo_clean_white_background_colorful?nologo=true&width=200&height=200&model=flux","w":52,"h":52,"contentScale":"fit"}}]},{"type":"Column","props":{"padding":"12,12,12,12","gap":7},"children":[{"type":"Text","props":{"text":"Google Workspace Business Plus","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"Gmail · Drive · Meet · 5TB","fontSize":11,"color":"#88889A"}},{"type":"Box","props":{"padding":"3,8,3,8","corner":5,"backgroundColor":"#0D1C2D"},"children":[{"type":"Text","props":{"text":"Google","fontSize":10,"bold":"true","color":"#4285F4"}}]},{"type":"Row","props":{"verticalAlignment":"baseline","gap":1},"children":[{"type":"Text","props":{"text":"₺280","fontSize":17,"bold":"true","color":"#E60000"}},{"type":"Text","props":{"text":"/kullanıcı/ay","fontSize":10,"color":"#88889A"}}]}]}]}]},{"type":"Box","props":{"w":190,"corner":16,"backgroundColor":"#13131F","elevation":3},"children":[{"type":"Column","props":{"fillMaxWidth":"true"},"children":[{"type":"Box","props":{"fillMaxWidth":"true","h":90,"backgroundColor":"#1C1C2E","contentAlignment":"center"},"children":[{"type":"Image","props":{"url":"https://image.pollinations.ai/prompt/dropbox_business_logo_blue_clean_dark_background?nologo=true&width=200&height=200&model=flux","w":52,"h":52,"contentScale":"fit"}}]},{"type":"Column","props":{"padding":"12,12,12,12","gap":7},"children":[{"type":"Text","props":{"text":"Dropbox Business Plus","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"9TB Depolama · Akıllı Sync · Admin","fontSize":11,"color":"#88889A"}},{"type":"Box","props":{"padding":"3,8,3,8","corner":5,"backgroundColor":"#0D152D"},"children":[{"type":"Text","props":{"text":"Depolama","fontSize":10,"bold":"true","color":"#0061FF"}}]},{"type":"Row","props":{"verticalAlignment":"baseline","gap":1},"children":[{"type":"Text","props":{"text":"₺195","fontSize":17,"bold":"true","color":"#E60000"}},{"type":"Text","props":{"text":"/kullanıcı/ay","fontSize":10,"color":"#88889A"}}]}]}]}]}]},{"type":"Spacer","props":{"height":24}},{"type":"Row","props":{"fillMaxWidth":"true","paddingStart":16,"paddingEnd":16,"verticalAlignment":"center","horizontalArrangement":"spaceBetween"},"children":[{"type":"Text","props":{"text":"Aktif Hizmetlerim","fontSize":17,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"6 hizmet","fontSize":12,"color":"#88889A"}}]},{"type":"Spacer","props":{"height":10}},{"type":"Column","props":{"fillMaxWidth":"true","paddingStart":16,"paddingEnd":16,"gap":8},"children":[{"type":"Row","props":{"fillMaxWidth":"true","backgroundColor":"#13131F","corner":14,"padding":"14,14,14,14","verticalAlignment":"center"},"children":[{"type":"Box","props":{"w":42,"h":42,"corner":10,"backgroundColor":"#1E1E30","contentAlignment":"center"},"children":[{"type":"Image","props":{"url":"https://image.pollinations.ai/prompt/microsoft_office_365_logo_colorful?nologo=true&width=100&height=100&model=flux","w":26,"h":26,"contentScale":"fit"}}]},{"type":"Spacer","props":{"width":12}},{"type":"Column","props":{"weight":1,"gap":3},"children":[{"type":"Text","props":{"text":"Microsoft 365 Business Standard","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"47 lisans · Yenileme: 15 Haz","fontSize":11,"color":"#88889A"}}]},{"type":"Column","props":{"horizontalAlignment":"end","gap":4},"children":[{"type":"Text","props":{"text":"₺16.450","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Box","props":{"padding":"2,7,2,7","corner":4,"backgroundColor":"#0A1F0D"},"children":[{"type":"Text","props":{"text":"Aktif","fontSize":10,"bold":"true","color":"#00B012"}}]}]}]},{"type":"Row","props":{"fillMaxWidth":"true","backgroundColor":"#13131F","corner":14,"padding":"14,14,14,14","verticalAlignment":"center"},"children":[{"type":"Box","props":{"w":42,"h":42,"corner":10,"backgroundColor":"#1E1E30","contentAlignment":"center"},"children":[{"type":"Image","props":{"url":"https://image.pollinations.ai/prompt/google_workspace_logo_colorful?nologo=true&width=100&height=100&model=flux","w":26,"h":26,"contentScale":"fit"}}]},{"type":"Spacer","props":{"width":12}},{"type":"Column","props":{"weight":1,"gap":3},"children":[{"type":"Text","props":{"text":"Google Workspace Business Plus","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"12 lisans · Yenileme: 20 Haz","fontSize":11,"color":"#88889A"}}]},{"type":"Column","props":{"horizontalAlignment":"end","gap":4},"children":[{"type":"Text","props":{"text":"₺3.360","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Box","props":{"padding":"2,7,2,7","corner":4,"backgroundColor":"#0A1F0D"},"children":[{"type":"Text","props":{"text":"Aktif","fontSize":10,"bold":"true","color":"#00B012"}}]}]}]},{"type":"Row","props":{"fillMaxWidth":"true","backgroundColor":"#13131F","corner":14,"padding":"14,14,14,14","verticalAlignment":"center"},"children":[{"type":"Box","props":{"w":42,"h":42,"corner":10,"backgroundColor":"#1E1E30","contentAlignment":"center"},"children":[{"type":"Image","props":{"url":"https://image.pollinations.ai/prompt/kaspersky_security_shield_logo_green?nologo=true&width=100&height=100&model=flux","w":26,"h":26,"contentScale":"fit"}}]},{"type":"Spacer","props":{"width":12}},{"type":"Column","props":{"weight":1,"gap":3},"children":[{"type":"Text","props":{"text":"Kaspersky Endpoint Security","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Text","props":{"text":"47 lisans · Yenileme: 1 Tem","fontSize":11,"color":"#88889A"}}]},{"type":"Column","props":{"horizontalAlignment":"end","gap":4},"children":[{"type":"Text","props":{"text":"₺5.640","fontSize":13,"bold":"true","color":"#FFFFFF"}},{"type":"Box","props":{"padding":"2,7,2,7","corner":4,"backgroundColor":"#0A1F0D"},"children":[{"type":"Text","props":{"text":"Aktif","fontSize":10,"bold":"true","color":"#00B012"}}]}]}]}]},{"type":"Spacer","props":{"height":90}},{"type":"BottomBar","props":{"fillMaxWidth":"true","backgroundColor":"#13131F","items":[{"icon":"home","label":"Ana Sayfa","active":true,"onClick":{"type":"navigate","destination":"home"}},{"icon":"grid","label":"Çözümler","onClick":{"type":"navigate","destination":"solutions"}},{"icon":"history","label":"Fatura","onClick":{"type":"navigate","destination":"billing"}},{"icon":"person","label":"Hesabım","onClick":{"type":"navigate","destination":"profile"}}]}}]}};

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
  generateState = 'idle', onGenerate, onLoadTemplate,
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
        {tab === 'generate' && <GenerateContent lang={lang} state={generateState} promptText={promptText} onPromptChange={onPromptChange} imagePreview={imagePreview} onImageChange={onImageChange} onImageRemove={onImageRemove} smartCrop={smartCrop} onSmartCropChange={onSmartCropChange} onGenerate={onGenerate} onLoadTemplate={onLoadTemplate} selectedLabel={selectedLabel} platform={platform} designSystems={designSystems}/>}
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
function GenerateContent({ lang, state, promptText, onPromptChange, imagePreview, onImageChange, onImageRemove, smartCrop, onSmartCropChange, onGenerate, onLoadTemplate, selectedLabel, platform, designSystems }) {
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
1. Header: Vodafone logosu (Image, w:28, h:28, url:"/static/logo.png") + "5G Cihazlar" başlığı, sağda sepet ve bildirim ikonu
2. Hero Banner: 5G teknoloji temalı görsel (Pollinations: "futuristic_5g_network_speed_concept,glowing_red_neon,city_night,cinematic"), gradient overlay, "5G Hızıyla Tanışın" h1 + "Yeni Nesil Hız, Uygun Taksitlerle" body, "Fırsatları Keşfet" CTA butonu
3. Marka Filtresi: yatay scroll chip strip — Tümü (aktif/accent), Samsung, iPhone, Xiaomi, Oppo
4. Öne Çıkan Cihazlar başlık satırı + "Tümü →" link
5. 2-sütun cihaz grid (pattern ⑥):
   - Samsung Galaxy S25 Ultra 256GB (url: search://Samsung Galaxy S25 Ultra) — eski: 74.999 TL, kampanya: ₺54.999, taksit: ₺2.291/ay × 24, badge: "5G"
   - iPhone 16 Pro 256GB (url: search://iPhone 16 Pro) — eski: 84.999 TL, kampanya: ₺69.999, taksit: ₺2.916/ay × 24, badge: "Yeni"
6. Takas Kampanyası Banner (pattern ⑦ — sadece gradient Card, image YOK): "Eski Cihazını Getir, Yenisini Al!" + "Ekstra 5.000 TL indirim kazan", "Başvur" beyaz buton
7. Fırsat Cihazları başlık satırı
8. 2-sütun cihaz grid (pattern ⑥):
   - Xiaomi 15 Ultra 512GB (url: search://Xiaomi 15 Ultra) — ₺39.999, ₺1.666/ay × 24, badge: "%25 İndirim"
   - Samsung Galaxy A56 5G 128GB (url: search://Samsung Galaxy A56 5G) — ₺17.999, ₺749/ay × 24, badge: "5G"

RENK PALETİ: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
                : `Design a Vodafone 5G device campaign screen.

SCREEN STRUCTURE:
1. Header: Vodafone logo (Image, w:28, h:28, url:"/static/logo.png") + "5G Devices" title, cart and notification icons on right
2. Hero Banner: 5G tech visual (Pollinations: "futuristic_5g_network_speed_concept,glowing_red_neon,city_night,cinematic"), gradient overlay, "Experience 5G Speed" h1 + "Next Gen Speed, Affordable Installments" body, "Explore Deals" CTA
3. Brand Filter: horizontal scroll chip strip — All (active/accent), Samsung, iPhone, Xiaomi, Oppo
4. Featured Devices section header + "All →" link
5. 2-column device grid (pattern ⑥):
   - Samsung Galaxy S25 Ultra 256GB (url: search://Samsung Galaxy S25 Ultra) — old: $1,299, campaign: $999, installment: $41.6/mo × 24, badge: "5G"
   - iPhone 16 Pro 256GB (url: search://iPhone 16 Pro) — old: $1,499, campaign: $1,199, installment: $49.9/mo × 24, badge: "New"
6. Trade-in Banner (pattern ⑦ — gradient Card only, NO image): "Trade in your old phone, get a new one!" + "$200 extra discount", white "Apply" button
7. Deal Devices section header
8. 2-column device grid (pattern ⑥):
   - Xiaomi 15 Ultra 512GB (url: search://Xiaomi 15 Ultra) — $699, $29.1/mo × 24, badge: "25% Off"
   - Samsung Galaxy A56 5G 128GB (url: search://Samsung Galaxy A56 5G) — $349, $14.5/mo × 24, badge: "5G"

COLOR PALETTE: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
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
                  {lang === 'tr' ? 'Hero + filtre + 4 cihaz + takas banner' : 'Hero + filter + 4 devices + trade-in banner'}
                </div>
              </div>
              <Icon name="chev-r" size={10} style={{ color: '#E6000080', flexShrink: 0 }}/>
            </div>

            {/* Vodafone Tarife Karşılaştırma */}
            <div
              onClick={() => onPromptChange && onPromptChange(lang === 'tr'
                ? `Vodafone tarife karşılaştırma ekranı tasarla.

EKRAN YAPISI:
1. Header: Vodafone logosu (Image, w:28, h:28, url:"/static/logo.png") + "Tarifeler" başlığı, sağda profil ikonu
2. Hero: Kırmızı gradient arka plan, "Sana Özel Tarife Bul" h1, "İhtiyacına göre seç, her ay değiştir" body, sağda internet paketi animasyonu (Icon: wifi, size:64, color:#FFFFFF40)
3. Dönem seçici: yatay chip strip — Aylık (aktif), 6 Aylık, Yıllık
4. Tarife Kartları (dikey liste, 3 kart):
   - Başlangıç (url: search://Vodafone Red tarife): 10GB, Sınırsız Arama, ₺199/ay — "En Çok Satan" badge
   - Orta (url: search://Vodafone Red tarife): 30GB, Sınırsız Arama+SMS, ₺299/ay — "Önerilen" badge (accent bg)
   - Tam (url: search://Vodafone Red tarife): Sınırsız GB, Sınırsız Arama+SMS+Uygulama, ₺449/ay
   Her kart: paket adı + GB badge + özellik listesi (Icon:check + Text) + fiyat + "Seç" butonu
5. Avantajlar satırı: 3 icon+text chip — Ücretsiz aktivasyon, Sözleşmesiz, 7/24 Destek
6. BottomBar: Ana Sayfa, Tarifeler (aktif), Cihazlar, Hesabım

RENK PALETİ: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
                : `Design a Vodafone plan comparison screen.

SCREEN STRUCTURE:
1. Header: Vodafone logo (Image, w:28, h:28, url:"/static/logo.png") + "Plans" title, profile icon on right
2. Hero: Red gradient background, "Find Your Perfect Plan" h1, "Pick by need, change monthly" body, wifi icon decoration (Icon: wifi, size:64, color:#FFFFFF40)
3. Period selector: horizontal chip strip — Monthly (active), 6-Month, Annual
4. Plan Cards (vertical list, 3 cards):
   - Starter: 10GB, Unlimited Calls, $9.99/mo — "Best Seller" badge
   - Mid: 30GB, Unlimited Calls+SMS, $19.99/mo — "Recommended" badge (accent bg)
   - Full: Unlimited GB, Unlimited Calls+SMS+Apps, $29.99/mo
   Each card: plan name + GB badge + feature list (Icon:check + Text) + price + "Select" button
5. Benefits row: 3 icon+text chips — Free activation, No contract, 24/7 Support
6. BottomBar: Home, Plans (active), Devices, Account

COLOR PALETTE: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
              )}
              style={{
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, #E6000012, #E6000006)',
                border: '1px solid #E6000030',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E60000'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000020, #E6000010)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6000030'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000012, #E6000006)'; }}
            >
              <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>📶</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E60000' }}>
                  {lang === 'tr' ? 'Vodafone Tarife Karşılaştırma' : 'Vodafone Plan Comparison'}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--fg-3)', marginTop: 1 }}>
                  {lang === 'tr' ? 'Hero + dönem seçici + 3 tarife kartı' : 'Hero + period selector + 3 plan cards'}
                </div>
              </div>
              <Icon name="chev-r" size={10} style={{ color: '#E6000080', flexShrink: 0 }}/>
            </div>

            {/* Vodafone Fatura & Hesabım */}
            <div
              onClick={() => onPromptChange && onPromptChange(lang === 'tr'
                ? `Vodafone Hesabım / Fatura ekranı tasarla.

EKRAN YAPISI:
1. Header: Vodafone logosu (Image, w:28, h:28, url:"/static/logo.png") + "Hesabım" başlığı, sağda ayarlar ikonu
2. Kullanıcı Kartı: Kırmızı gradient Card, kullanıcı adı "Ahmet Yılmaz" (h2, bold, #FFFFFF) + numara "0532 XXX XX XX" (caption, #FFFFFFaa) + "Red Business" tarife etiketi (beyaz pill) — sağda büyük Icon(person, size:48, color:#FFFFFF20)
3. Kullanım Özeti (yatay 3 kutu, Row):
   - İnternet: kullanılan/toplam (dairesel progress bar efekti Icon:wifi + Text "18.4 / 30 GB")
   - Dakika: Icon:phone + Text "Sınırsız"
   - SMS: Icon:message + Text "Sınırsız"
4. Bu Ay Fatura Kartı (Card, elevation:2): "Mayıs 2025 Faturası" başlık + ₺299,00 (h1, bold, accent) + son ödeme: 25 Mayıs (caption, fg3) + "Faturayı Öde" kırmızı gradient buton + "İndir" secondary buton (outlined)
5. Hızlı İşlemler: 2×2 grid Card'lar — Fatura Geçmişi (Icon:receipt), Tarife Değiştir (Icon:swap), Ek Paket Al (Icon:add_circle), Destek (Icon:headset)
6. BottomBar: Ana Sayfa, Tarifeler, Cihazlar, Hesabım (aktif, accent)

RENK PALETİ: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
                : `Design a Vodafone My Account / Bill screen.

SCREEN STRUCTURE:
1. Header: Vodafone logo (Image, w:28, h:28, url:"/static/logo.png") + "My Account" title, settings icon on right
2. User Card: Red gradient Card, user name "John Smith" (h2, bold, #FFFFFF) + number "0532 XXX XX XX" (caption, #FFFFFFaa) + "Red Business" plan pill (white) — right side large Icon(person, size:48, color:#FFFFFF20)
3. Usage Summary (horizontal 3-box Row):
   - Data: Icon:wifi + Text "18.4 / 30 GB"
   - Minutes: Icon:phone + Text "Unlimited"
   - SMS: Icon:message + Text "Unlimited"
4. Current Bill Card (elevation:2): "May 2025 Invoice" title + $29.99 (h1, bold, accent) + due: May 25 (caption, fg3) + "Pay Bill" red gradient button + "Download" outlined button
5. Quick Actions: 2×2 Card grid — Bill History (Icon:receipt), Change Plan (Icon:swap), Add Package (Icon:add_circle), Support (Icon:headset)
6. BottomBar: Home, Plans, Devices, My Account (active, accent)

COLOR PALETTE: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
              )}
              style={{
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, #E6000012, #E6000006)',
                border: '1px solid #E6000030',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E60000'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000020, #E6000010)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6000030'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000012, #E6000006)'; }}
            >
              <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>🧾</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E60000' }}>
                  {lang === 'tr' ? 'Vodafone Hesabım & Fatura' : 'Vodafone Account & Bill'}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--fg-3)', marginTop: 1 }}>
                  {lang === 'tr' ? 'Kullanıcı kartı + kullanım + fatura + hızlı işlemler' : 'User card + usage + invoice + quick actions'}
                </div>
              </div>
              <Icon name="chev-r" size={10} style={{ color: '#E6000080', flexShrink: 0 }}/>
            </div>

            {/* Vodafone Mağaza Bulucu */}
            <div
              onClick={() => onPromptChange && onPromptChange(lang === 'tr'
                ? `Vodafone Mağaza Bulucu ekranı tasarla.

EKRAN YAPISI:
1. Header: Vodafone logosu (Image, w:28, h:28, url:"/static/logo.png") + "Mağaza Bul" başlığı, sağda arama ikonu
2. Arama Kutusu: Card(elevation:1), Icon(search) + placeholder "Şehir, ilçe veya adres ara..." + sağda Icon(my_location, accent)
3. Filtre Chip Strip (scroll): Tümü (aktif), Açık Mağazalar, Geniş Hizmet, Premium Mağaza
4. Harita Alanı (Box, h:200, bg:#E8F0FE, corner:12): Icon(map, size:48, color:#4285F4) ortada, üstte "İstanbul Bölgesi — 24 Mağaza" Text, Pollinations harita görseli (url: "istanbul_city_map_top_view_minimal_clean_blue_white")
5. Yakın Mağazalar listesi (3 kart, pattern ⑤ LIST ROW):
   - Vodafone Cevahir AVM (url: search://Vodafone store interior): Şişli, 0.8 km — "Açık · 10:00–22:00" yeşil badge — "Yol Tarifi" buton
   - Vodafone Bağcılar (url: search://Vodafone store interior): Bağcılar, 2.1 km — "Açık · 09:00–21:00" yeşil badge — "Yol Tarifi" buton
   - Vodafone Kadıköy (url: search://Vodafone store interior): Kadıköy, 3.4 km — "Kapalı · 10:00–20:00" gri badge — "Detay" buton
6. BottomBar: Ana Sayfa, Tarifeler, Mağazalar (aktif, accent), Hesabım

RENK PALETİ: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
                : `Design a Vodafone Store Finder screen.

SCREEN STRUCTURE:
1. Header: Vodafone logo (Image, w:28, h:28, url:"/static/logo.png") + "Find a Store" title, search icon on right
2. Search Box: Card(elevation:1), Icon(search) + placeholder "Search city, district or address..." + Icon(my_location, accent) on right
3. Filter Chip Strip (scroll): All (active), Open Now, Full Service, Premium Store
4. Map Area (Box, h:200, bg:#E8F0FE, corner:12): Icon(map, size:48, color:#4285F4) centered, "Istanbul Region — 24 Stores" text above, Pollinations map (url: "istanbul_city_map_top_view_minimal_clean_blue_white")
5. Nearby Stores list (3 cards, pattern ⑤ LIST ROW):
   - Vodafone Cevahir Mall (url: search://Vodafone store interior): Sisli, 0.8 km — "Open · 10:00–22:00" green badge — "Directions" button
   - Vodafone Bagcilar (url: search://Vodafone store interior): Bagcilar, 2.1 km — "Open · 09:00–21:00" green badge — "Directions" button
   - Vodafone Kadikoy (url: search://Vodafone store interior): Kadikoy, 3.4 km — "Closed · 10:00–20:00" grey badge — "Details" button
6. BottomBar: Home, Plans, Stores (active, accent), Account

COLOR PALETTE: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
              )}
              style={{
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, #E6000012, #E6000006)',
                border: '1px solid #E6000030',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E60000'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000020, #E6000010)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6000030'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000012, #E6000006)'; }}
            >
              <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>📍</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E60000' }}>
                  {lang === 'tr' ? 'Vodafone Mağaza Bulucu' : 'Vodafone Store Finder'}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--fg-3)', marginTop: 1 }}>
                  {lang === 'tr' ? 'Arama + harita + yakın mağaza listesi' : 'Search + map + nearby store list'}
                </div>
              </div>
              <Icon name="chev-r" size={10} style={{ color: '#E6000080', flexShrink: 0 }}/>
            </div>

            {/* Vodafone Happy Loyalty */}
            <div
              onClick={() => onPromptChange && onPromptChange(lang === 'tr'
                ? `Vodafone Happy sadakat platformu ana ekranı tasarla.

PLATFORM HAKKINDA: Vodafone Happy, Vodafone Yanımda uygulaması içindeki dijital sadakat platformudur. 48 marka indirimi, Hediye Çarkı, Yanımda Puanları ve yıl dönümü sürprizleri sunar. Tüm faturalı müşterilere açık, Red müşterilere ekstra ayrıcalıklar verir.

EKRAN YAPISI:
1. Header: Vodafone logosu (Image, w:28, h:28, url:"/static/logo.png") + "Happy 🎉" başlığı, sağda bildirim ikonu
2. Kullanıcı Karşılama Kartı: Kırmızı gradient Card — "Merhaba, Ahmet! 👋" h2 + "Red ⭐ Müşteri · 3. Yılın" caption (#FFFFFFaa) + sağda büyük "Happy" yazısı (h1, #FFFFFF20) — altta "Bu ay ₺1.840 kazandın" body bold #FFFFFF
3. Hediye Çarkı Kartı (Card, elevation:3, corner:16): Row içinde — sol taraf: "Hediye Çarkı" h3 bold + "Her hafta döndür, kazan!" caption fg3 + "Çarkı Döndür" accent buton; sağ taraf: dönen çark görseli (Pollinations: "colorful_spin_wheel_prize_wheel_red_white_segments_isolated_on_white?nologo=true&width=200&height=200&model=flux", w:80, h:80, contentScale:"fit")
4. Yanımda Puanlarım: Row(spacebetween) — "Yanımda Puanlarım" h3 + "Tümü →" caption accent; altında Row(spacedby:12) — 3 stat Box(surface, corner:12, padding:"12,12,12,12", center): [Icon(star,accent,24)+"1.240 Puan"], [Icon(emoji_events,#F59E0B,24)+"Seviye 4"], [Icon(calendar_today,accent,24)+"3 Yıl"]
5. Kategori Filtresi (yatay scroll chip strip): Tümü (aktif/accent), Yeme-İçme, Giyim, Eğlence, Seyahat, Teknoloji
6. Öne Çıkan Fırsatlar başlık + "48 Marka →" link
7. Marka İndirim Kartları (2-sütun grid, 4 kart — pattern ⑤ benzeri yatay liste kartı):
   - Kahve Dünyası (url: search://Kahve Dunyasi coffee logo): "%20 İndirim" — "Yeme-İçme" chip — "Kuponu Al" buton
   - Little Caesars (url: search://Little Caesars pizza logo): "2 Al 1 Öde" — "Yeme-İçme" chip — "Kuponu Al" buton
   - Loft (url: search://Loft fashion brand logo): "%30 İndirim" — "Giyim" chip — "Kuponu Al" buton
   - Hepsiburada (url: search://Hepsiburada logo): "Premium Üyelik" — "Teknoloji" chip — "Aktive Et" buton
   Her kart: marka logosu (h:56, w:56, contentScale:"fit", corner:12) + marka adı h3 bold + indirim badge (accent) + kategori chip (surface) + CTA buton (outlined, accent renk, corner:8)
8. Yıl Dönümü Sürprizi Banner (pattern ⑦): "3. Yılını Kutluyoruz! 🎂" h3 + "Sürpriz hediyeni talep et — bugün son gün!" caption #FFFFFFcc + "Hediyemi Al" beyaz buton
9. BottomBar: Ana Sayfa, Happy (aktif, accent, heart ikonu), Faturalar, Hesabım

RENK PALETİ: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
                : `Design a Vodafone Happy loyalty platform home screen.

PLATFORM CONTEXT: Vodafone Happy is the digital loyalty platform inside the Vodafone Yanımda app. It offers 48 brand discounts, Gift Wheel, Yanımda Points, and anniversary surprises. Open to all postpaid customers; Red customers get extra privileges.

SCREEN STRUCTURE:
1. Header: Vodafone logo (Image, w:28, h:28, url:"/static/logo.png") + "Happy 🎉" title, notification icon on right
2. User Welcome Card: Red gradient Card — "Hello, John! 👋" h2 + "Red ⭐ Customer · Year 3" caption (#FFFFFFaa) + large "Happy" text right side (h1, #FFFFFF20) — bottom: "You saved $184 this month" body bold #FFFFFF
3. Gift Wheel Card (Card, elevation:3, corner:16): Row — left: "Gift Wheel" h3 bold + "Spin weekly, win rewards!" caption fg3 + "Spin Now" accent button; right: wheel image (Pollinations: "colorful_spin_wheel_prize_wheel_red_white_segments_isolated_on_white?nologo=true&width=200&height=200&model=flux", w:80, h:80, contentScale:"fit")
4. My Points: Row(spacebetween) — "My Points" h3 + "All →" caption accent; below Row(spacedby:12) — 3 stat Boxes(surface, corner:12, padding:"12,12,12,12", center): [Icon(star,accent,24)+"1,240 Pts"], [Icon(emoji_events,#F59E0B,24)+"Level 4"], [Icon(calendar_today,accent,24)+"3 Years"]
5. Category Filter (horizontal scroll chips): All (active/accent), Food, Fashion, Entertainment, Travel, Tech
6. Top Deals header + "48 Brands →" link
7. Brand Discount Cards (2-col grid, 4 cards):
   - Starbucks (url: search://Starbucks logo): "20% Off" — "Food" chip — "Get Coupon" button
   - H&M (url: search://HM fashion brand logo): "30% Off" — "Fashion" chip — "Get Coupon" button
   - Hepsiburada (url: search://Hepsiburada logo): "Premium Membership" — "Tech" chip — "Activate" button
   - CGV Cinema (url: search://CGV cinema logo): "Buy 2 Get 1" — "Entertainment" chip — "Get Coupon" button
   Each card: brand logo (h:56, w:56, contentScale:"fit", corner:12) + brand name h3 bold + discount badge (accent) + category chip (surface) + outlined CTA button (accent, corner:8)
8. Anniversary Banner (pattern ⑦): "Celebrating Your 3rd Year! 🎂" h3 + "Claim your surprise gift — today's the last day!" caption #FFFFFFcc + "Claim Gift" white button
9. BottomBar: Home, Happy (active, accent, heart icon), Bills, Account

COLOR PALETTE: bg:#FFFFFF, surface:#F4F4F4, accent:#E60000, fg:#1A1A1A, fg3:#666666`
              )}
              style={{
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, #E6000012, #E6000006)',
                border: '1px solid #E6000030',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E60000'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000020, #E6000010)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6000030'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000012, #E6000006)'; }}
            >
              <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>🎉</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E60000' }}>
                  {lang === 'tr' ? 'Vodafone Happy Sadakat' : 'Vodafone Happy Loyalty'}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--fg-3)', marginTop: 1 }}>
                  {lang === 'tr' ? 'Çark + puan + 48 marka indirimi + yıl dönümü' : 'Wheel + points + 48 brand discounts + anniversary'}
                </div>
              </div>
              <Icon name="chev-r" size={10} style={{ color: '#E6000080', flexShrink: 0 }}/>
            </div>

            {/* Vodafone Red Konsol — MAAC Marketplace */}
            <div
              onClick={() => {
                if (onLoadTemplate) {
                  onLoadTemplate(MAAC_TEMPLATE_JSON);
                  return;
                }
                onPromptChange && onPromptChange(lang === 'tr'
                ? `Vodafone Red Konsol — MAAC (Marketplace as a Channel) kurumsal yazılım pazaryeri ekranı tasarla.

PLATFORM HAKKINDA: Vodafone Red Konsol, kurumsal müşterilerin Microsoft 365, Google Workspace, Cisco, Sophos ve benzeri SaaS lisanslarını doğrudan Vodafone üzerinden satın aldığı B2B dijital pazaryeri platformudur. Tek fatura, merkezi lisans yönetimi ve 7/24 Red Business desteği sunar. Tasarım koyu kurumsal konsol temasında olmalı.

EKRAN YAPISI:
1. Header: Vodafone logosu (Image, w:28, h:28, url:"/static/logo.png") + "Red Konsol" başlığı (color:accent, bold), sağda Row(spacedby:8,verticalAlignment:center): [Box(w:30,h:30,corner:15,backgroundColor:accent,contentAlignment:center)>Text(caption,bold,#FFFFFF,"MT"), Icon(notifications,fg3)]
2. Şirket Özet Kartı (Card, backgroundColor:"linear-gradient(135deg,#1E0A0A,#2D1218)", corner:16, padding:"16,16,16,16", margin:"0,0,12,0"): Row(horizontalArrangement:spacebetween,verticalAlignment:center) children: [Column(verticalArrangement:spacedby:4)>[Text(h3,bold,#FFFFFF,"Mehmet Teknoloji A.Ş."),Text(caption,#FFFFFF80,"Red Business Premium · 47 Aktif Lisans"),Row(spacedby:6,verticalAlignment:center)>[Icon(circle,color:#22C55E,size:8),Text(caption,color:#22C55E,"Tüm hizmetler aktif")]], Column(horizontalAlignment:end,verticalArrangement:spacedby:2)>[Text(caption,#FFFFFF60,"Aylık toplam"),Text(h2,bold,#E60000,"₺12.340")]]
3. Kategori Filtresi (yatay scroll chip strip): Tümü (aktif, backgroundColor:accent, color:#FFFFFF), Microsoft (backgroundColor:#1A2332,color:#94A3B8), Google (backgroundColor:#1A2332,color:#94A3B8), Güvenlik (backgroundColor:#1A2332,color:#94A3B8), Bulut (backgroundColor:#1A2332,color:#94A3B8), İletişim (backgroundColor:#1A2332,color:#94A3B8)
4. "Öne Çıkan Çözümler" section header + "Tümü →" link (color:accent)
5. 2-sütun kurumsal SaaS ürün grid — HER KART (weight:1, corner:16, elevation:3, backgroundColor:#131C28):
   Box(fillMaxWidth:"true", height:100, backgroundColor:"#0D1117", contentAlignment:"center") >
     Image(w:60, h:60, contentScale:"fit", url:"search://Microsoft 365")
   Column(fillMaxWidth:"true", weight:1, padding:"10,12,14,12", verticalArrangement:"spacedby:4"):
     Text(h3, bold, #FFFFFF, "Microsoft 365 Business Standard")
     Text(caption, #94A3B8, "Word · Excel · Teams · 1TB OneDrive")
     Row(spacedby:4): [Card(corner:4,backgroundColor:#E6000025,padding:"2,8,2,8")>Text(caption,bold,color:#E60000,"Microsoft")]
     Spacer(weight:1)
     Row(horizontalArrangement:spacebetween, verticalAlignment:center): [Text(body,bold,color:#E60000,"₺350"), Text(caption,color:#94A3B8,"/ kullanıcı / ay")]
     Text(caption, #94A3B8, "Min. 1 · Max. sınırsız kullanıcı")
     Button(backgroundColor:"linear-gradient(135deg,#E60000,#BE0000)", color:#FFFFFF, corner:8, fillMaxWidth:"true", padding:"10,0,10,0", "Lisans Ekle")
   İKİNCİ KART: Google Workspace Business Plus (url: search://Google Workspace) — Gmail, Drive, Meet, 5TB — Google badge (#4285F425/#4285F4) — ₺280/kullanıcı/ay — "Lisans Ekle" buton
6. "Aktif Abonelikler" section header + "Yönet →" link (color:accent)
7. 3 aktif abonelik satırı (Card, backgroundColor:#131C28, corner:12, padding:"14,14,14,14", margin:"0,0,8,0") — her satır Row(horizontalArrangement:spacedby:12,verticalAlignment:center):
   - Image(w:44,h:44,corner:10,contentScale:"fit", url:"search://Microsoft 365") + Column(weight:1): [Text(h3,bold,#FFFFFF,"Microsoft 365 Business"),Text(caption,#94A3B8,"25 kullanıcı · Otomatik yenileme")] + Column(horizontalAlignment:end): [Card(corner:6,backgroundColor:#22C55E20,padding:"3,8,3,8")>Text(caption,bold,color:#22C55E,"Aktif"), Text(body,bold,color:#E60000,"₺8.750/ay")]
   - Image(w:44,h:44,corner:10,contentScale:"fit", url:"search://Google Workspace") + Column(weight:1): [Text(h3,bold,#FFFFFF,"Google Workspace"),Text(caption,#94A3B8,"12 kullanıcı · Yıllık plan")] + Column(horizontalAlignment:end): [Card(corner:6,backgroundColor:#22C55E20,padding:"3,8,3,8")>Text(caption,bold,color:#22C55E,"Aktif"), Text(body,bold,color:#E60000,"₺2.160/ay")]
   - Image(w:44,h:44,corner:10,contentScale:"fit", url:"search://Sophos security") + Column(weight:1): [Text(h3,bold,#FFFFFF,"Sophos Intercept X"),Text(caption,#94A3B8,"47 cihaz · 14 gün kaldı")] + Column(horizontalAlignment:end): [Card(corner:6,backgroundColor:#F59E0B20,padding:"3,8,3,8")>Text(caption,bold,color:#F59E0B,"Yenile"), Text(body,bold,color:#E60000,"₺1.410/ay")]
8. BottomBar: Konsol (Icon:dashboard), Ürünler (aktif, accent, Icon:store), Faturalar (Icon:receipt), Destek (Icon:headset_mic)

RENK PALETİ (Kurumsal Koyu Konsol): bg:#0F1724, surface:#131C28, accent:#E60000, fg:#FFFFFF, fg3:#94A3B8
TASARIM NOTU: Koyu arka plan zorunlu. Kartlar #131C28. Tüm metinler beyaz/gri tonlarında. Sadece fiyatlar ve aktif CTA'lar accent kırmızı.`
                : `Design a Vodafone Red Console — MAAC (Marketplace as a Channel) enterprise software marketplace screen.

PLATFORM CONTEXT: Vodafone Red Console is a B2B digital marketplace where enterprise customers purchase Microsoft 365, Google Workspace, Cisco, Sophos and other SaaS licenses directly through Vodafone. Single invoice, central license management, 24/7 Red Business support. Design should use dark enterprise console theme.

SCREEN STRUCTURE:
1. Header: Vodafone logo (Image, w:28, h:28, url:"/static/logo.png") + "Red Console" title (color:accent, bold), right side Row(spacedby:8,verticalAlignment:center): [Box(w:30,h:30,corner:15,backgroundColor:accent)>Text(caption,bold,#FFFFFF,"MT"), Icon(notifications,fg3)]
2. Company Summary Card (Card, backgroundColor:"linear-gradient(135deg,#1E0A0A,#2D1218)", corner:16, padding:"16,16,16,16"): Row(spacebetween,center): [Column>[Text(h3,bold,#FFFFFF,"Mehmet Tech Ltd."),Text(caption,#FFFFFF80,"Red Business Premium · 47 Active Licenses"),Row>[Icon(circle,#22C55E,8),Text(caption,#22C55E,"All services active")]], Column(end)>[Text(caption,#FFFFFF60,"Monthly total"),Text(h2,bold,#E60000,"$1,240")]]
3. Category Filter (horizontal scroll chips): All (active, bg:accent, color:#FFFFFF), Microsoft (#1A2332/#94A3B8), Google, Security, Cloud, Communication
4. "Featured Solutions" section header + "All →" link (color:accent)
5. 2-column enterprise SaaS product grid — EACH CARD (weight:1, corner:16, elevation:3, backgroundColor:#131C28):
   Box(fillMaxWidth:"true", height:100, backgroundColor:"#0D1117", contentAlignment:"center") > Image(w:60, h:60, contentScale:"fit", url:"search://Microsoft 365")
   Column(weight:1, padding:"10,12,14,12", verticalArrangement:"spacedby:4"):
     Text(h3, bold, #FFFFFF, "Microsoft 365 Business Standard")
     Text(caption, #94A3B8, "Word · Excel · Teams · 1TB OneDrive")
     Row: [Card(corner:4, bg:#E6000025, padding:"2,8,2,8")>Text(caption,bold,#E60000,"Microsoft")]
     Spacer(weight:1)
     Row(spacebetween,center): [Text(body,bold,#E60000,"$35"), Text(caption,#94A3B8,"/ user / month")]
     Text(caption, #94A3B8, "Min. 1 · Unlimited users")
     Button(bg:"linear-gradient(135deg,#E60000,#BE0000)", color:#FFFFFF, corner:8, fillMaxWidth:"true", "Add License")
   SECOND CARD: Google Workspace Business Plus (url: search://Google Workspace) — Gmail, Drive, Meet, 5TB — Google badge — $28/user/mo — "Add License"
6. "Active Subscriptions" section header + "Manage →" link (color:accent)
7. 3 active subscription rows (Card, bg:#131C28, corner:12, padding:"14,14,14,14"):
   - Image(w:44,h:44,url:"search://Microsoft 365") + Col>[Text(h3,bold,#FFF,"Microsoft 365 Business"),Text(caption,#94A3B8,"25 users · Auto-renew")] + Col(end)>[Card(bg:#22C55E20)>Text(caption,bold,#22C55E,"Active"), Text(body,bold,#E60000,"$875/mo")]
   - Image(w:44,h:44,url:"search://Google Workspace") + Col>[Text(h3,bold,#FFF,"Google Workspace"),Text(caption,#94A3B8,"12 users · Annual plan")] + Col(end)>[Card(bg:#22C55E20)>Text(caption,bold,#22C55E,"Active"), Text(body,bold,#E60000,"$336/mo")]
   - Image(w:44,h:44,url:"search://Sophos security") + Col>[Text(h3,bold,#FFF,"Sophos Intercept X"),Text(caption,#94A3B8,"47 devices · 14 days left")] + Col(end)>[Card(bg:#F59E0B20)>Text(caption,bold,#F59E0B,"Renew"), Text(body,bold,#E60000,"$141/mo")]
8. BottomBar: Console (Icon:dashboard), Products (active, accent, Icon:store), Invoices (Icon:receipt), Support (Icon:headset_mic)

COLOR PALETTE (Dark Enterprise Console): bg:#0F1724, surface:#131C28, accent:#E60000, fg:#FFFFFF, fg3:#94A3B8`
                );
              }}
              style={{
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'linear-gradient(135deg, #0F172420, #1E293B15)',
                border: '1px solid #E6000030',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#E60000'; e.currentTarget.style.background = 'linear-gradient(135deg, #E6000020, #0F172430)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E6000030'; e.currentTarget.style.background = 'linear-gradient(135deg, #0F172420, #1E293B15)'; }}
            >
              <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>🏢</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#E60000' }}>
                  {lang === 'tr' ? 'Red Konsol · MAAC Marketplace' : 'Red Console · MAAC Marketplace'}
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--fg-3)', marginTop: 1 }}>
                  {lang === 'tr' ? 'Kurumsal SaaS · Microsoft · Google · Güvenlik' : 'Enterprise SaaS · Microsoft · Google · Security'}
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
