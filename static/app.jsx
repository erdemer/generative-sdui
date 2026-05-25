/* SDUI Studio — App root component */

const { useState, useEffect, useCallback } = React;

const SCREENSHOT_COLOR_PROPS = [
  'background', 'background-color', 'background-image',
  'border-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
  'box-shadow', 'caret-color', 'color', 'column-rule-color', 'fill', 'outline-color',
  'stroke', 'text-decoration-color', 'text-shadow',
];

function normalizeHue(h) {
  const value = parseFloat(h);
  if (!Number.isFinite(value)) return 0;
  if (h.endsWith('turn')) return value * 360;
  if (h.endsWith('rad')) return value * (180 / Math.PI);
  if (h.endsWith('grad')) return value * 0.9;
  return value;
}

function parseOklchPart(part, isLightness = false) {
  const value = parseFloat(part);
  if (!Number.isFinite(value)) return 0;
  if (isLightness && part.endsWith('%')) return value / 100;
  return value;
}

function linearToSrgb(value) {
  const v = Math.max(0, Math.min(1, value));
  return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

function oklchToRgb(color) {
  const match = color.match(/^oklch\((.*)\)$/i);
  if (!match) return color;

  const [main, alphaPart] = match[1].split('/').map(part => part.trim());
  const parts = main.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return color;

  const l = parseOklchPart(parts[0], true);
  const c = parseOklchPart(parts[1]);
  const h = normalizeHue(parts[2]) * Math.PI / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.2914855480 * b;
  const lmsL = lPrime * lPrime * lPrime;
  const lmsM = mPrime * mPrime * mPrime;
  const lmsS = sPrime * sPrime * sPrime;

  const r = Math.round(linearToSrgb(+4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS) * 255);
  const g = Math.round(linearToSrgb(-1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS) * 255);
  const blue = Math.round(linearToSrgb(-0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.7076147010 * lmsS) * 255);

  if (!alphaPart) return `rgb(${r}, ${g}, ${blue})`;
  const alpha = alphaPart.endsWith('%') ? parseFloat(alphaPart) / 100 : parseFloat(alphaPart);
  return `rgba(${r}, ${g}, ${blue}, ${Number.isFinite(alpha) ? alpha : 1})`;
}

function replaceUnsupportedColors(value) {
  if (!value || typeof value !== 'string' || !value.includes('oklch(')) return value;
  return value.replace(/oklch\([^)]*\)/gi, token => oklchToRgb(token));
}

function sanitizeCssRules(rules) {
  if (!rules) return;
  Array.from(rules).forEach(rule => {
    try {
      if (rule.style) {
        Array.from(rule.style).forEach(prop => {
          const rawValue = rule.style.getPropertyValue(prop);
          const normalized = replaceUnsupportedColors(rawValue);
          if (normalized && normalized !== rawValue) {
            rule.style.setProperty(prop, normalized, rule.style.getPropertyPriority(prop));
          }
        });
      }
      if (rule.cssRules) sanitizeCssRules(rule.cssRules);
    } catch {}
  });
}

function sanitizeClonedStylesheets(clonedDoc) {
  clonedDoc.querySelectorAll('style').forEach(styleNode => {
    styleNode.textContent = replaceUnsupportedColors(styleNode.textContent);
  });

  Array.from(clonedDoc.styleSheets).forEach(sheet => {
    try {
      sanitizeCssRules(sheet.cssRules);
    } catch {}
  });
}

function sanitizeClonedElement(sourceNode, cloneNode) {
  if (!sourceNode || !cloneNode?.style) return;

  const computed = window.getComputedStyle(sourceNode);
  Array.from(computed).forEach(prop => {
    const rawValue = computed.getPropertyValue(prop);
    const normalized = replaceUnsupportedColors(rawValue);
    if (normalized && normalized !== rawValue) {
      cloneNode.style.setProperty(prop, normalized);
    }
  });

  cloneNode.style.cssText = replaceUnsupportedColors(cloneNode.style.cssText);
  ['fill', 'stroke', 'style'].forEach(attr => {
    if (cloneNode.hasAttribute?.(attr)) {
      cloneNode.setAttribute(attr, replaceUnsupportedColors(cloneNode.getAttribute(attr)));
    }
  });
}

function prepareScreenshotClone(source, clonedDoc) {
  sanitizeClonedStylesheets(clonedDoc);

  const sourceAllNodes = [document.documentElement, ...document.documentElement.querySelectorAll('*')];
  const cloneAllNodes = [clonedDoc.documentElement, ...clonedDoc.documentElement.querySelectorAll('*')];
  cloneAllNodes.forEach((cloneNode, index) => sanitizeClonedElement(sourceAllNodes[index], cloneNode));

  const clonedSource = clonedDoc.querySelector('.device-screen');
  if (!clonedSource) return;

  const sourceNodes = [source, ...source.querySelectorAll('*')];
  const cloneNodes = [clonedSource, ...clonedSource.querySelectorAll('*')];

  cloneNodes.forEach((cloneNode, index) => {
    SCREENSHOT_COLOR_PROPS.forEach(prop => {
      const sourceNode = sourceNodes[index];
      if (!sourceNode || !cloneNode.style) return;
      const computed = window.getComputedStyle(sourceNode);
      const normalized = replaceUnsupportedColors(computed.getPropertyValue(prop));
      if (normalized && normalized !== 'none') cloneNode.style.setProperty(prop, normalized);
    });
    sanitizeClonedElement(sourceNodes[index], cloneNode);
  });
}

function captureDeviceScreen(deviceScreen) {
  return html2canvas(deviceScreen, {
    backgroundColor: '#FFFFFF',
    scale: 1,
    useCORS: true,
    logging: false,
    onclone: clonedDoc => prepareScreenshotClone(deviceScreen, clonedDoc),
  });
}

function App() {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const [auth, setAuth] = useState(() => window.SDUIAuth?.loadAuth?.() || null);
  const [showApprovals, setShowApprovals] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // ── View ─────────────────────────────────────────────────────────────────
  const [view, setView] = useState('studio'); // 'studio' | 'flows'

  // ── Core state ───────────────────────────────────────────────────────────
  const [appState, setAppState] = useState('empty'); // 'empty' | 'streaming' | 'editing'
  const [currentJson, setCurrentJson] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [generateProgress, setGenerateProgress] = useState(null);
  const [errorModal, setErrorModal] = useState(null);

  // ── UI preferences ───────────────────────────────────────────────────────
  const [lang, setLangRaw] = useState(pickLang);
  const setLang = (v) => { try { localStorage.setItem('sdui_lang', v); } catch {} setLangRaw(v); };
  const [theme, setTheme] = useState(pickTheme);
  const [leftTab, setLeftTab] = useState('generate');
  const [treeView, setTreeView] = useState('tree');
  const [device, setDevice] = useState('iphone');

  // ── Brand rules ─────────────────────────────────────────────────────────
  const [brandRules, setBrandRules] = useState('');
  useEffect(() => {
    fetch('/api/brand/rules').then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setBrandRules(d.rules ?? d.default ?? ''); })
      .catch(() => {});
  }, []);

  // ── Generate inputs ──────────────────────────────────────────────────────
  const [promptText, setPromptText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [smartCrop, setSmartCrop] = useState(false);
  const [platform, setPlatform] = useState('mobile');

  const handlePlatformChange = (p) => {
    setPlatform(p);
    if (p === 'web') setDevice('web');
    if (p === 'mobile' && device === 'web') setDevice('iphone');
  };

  // ── Publish / A/B ────────────────────────────────────────────────────────
  const [abActive, setAbActive] = useState(false);
  const [abVariantA, setAbVariantA] = useState(null);
  const [abVariantB, setAbVariantB] = useState(null);
  const [version, setVersion] = useState(1);
  const [savedAt, setSavedAt] = useState(null);
  const [zoom, setZoom] = useState(100);

  // ── Verify / improve ────────────────────────────────────────────────────
  const [verifyState, setVerifyState] = useState('idle'); // 'idle' | 'running'

  // ── File system ──────────────────────────────────────────────────────────
  const [files, setFiles] = useState([]);
  const [currentFilePath, setCurrentFilePath] = useState(null);

  // ── Design systems (multi) ────────────────────────────────────────────────
  const [designSystems, setDesignSystems] = useState([]);

  useEffect(() => {
    fetch('/api/design-system/list')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d?.design_systems)) setDesignSystems(d.design_systems); })
      .catch(() => {});
  }, []);

  // Tick for relative time display
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  // ── Boot ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/current-ui?platform=${platform}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.layout) { _uid = 0; tagIds(data.layout); setCurrentJson(data); setAppState('editing'); }
      })
      .catch(() => {});
    loadFiles();
  }, []);

  function loadFiles() {
    fetch('/api/fs/tree')
      .then(r => r.ok ? r.json() : null)
      .then(res => { if (res?.tree) setFiles(flattenFsTree(res.tree)); })
      .catch(() => {});
  }

  const cycleTheme = () => {
    const order = ['light','dark','vf-light','vf-dark'];
    setTheme(t => order[(order.indexOf(t) + 1) % order.length]);
  };

  // ── Image ────────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleImageRemove = () => { setImageFile(null); setImagePreview(null); };

  // ── Generate ─────────────────────────────────────────────────────────────
  const handleGenerate = async (overridePrompt) => {
    const effectivePrompt = (typeof overridePrompt === 'string') ? overridePrompt : promptText;
    if (!effectivePrompt && !imageFile) return;
    const progressText = {
      preparing: lang === 'tr' ? 'İstek hazırlanıyor…' : 'Preparing request…',
      image: lang === 'tr' ? 'Görsel işleniyor…' : 'Processing image…',
      waiting: lang === 'tr' ? 'AI tasarımı üretiyor…' : 'AI generating…',
      response: lang === 'tr' ? 'Yanıt alındı…' : 'Response received…',
      parsing: lang === 'tr' ? 'Tasarım işleniyor…' : 'Processing design…',
      rendering: lang === 'tr' ? 'Önizleme hazırlanıyor…' : 'Preparing preview…',
    };

    setAppState('streaming');
    setSelectedIds([]);
    setGenerateProgress({ current: 1, total: 12, phase: progressText.preparing });

    const fd = new FormData();
    if (effectivePrompt) fd.append('prompt', effectivePrompt);
    fd.append('platform', platform);
    if (imageFile) fd.append('image', imageFile);
    if (smartCrop) fd.append('smart_crop', 'true');
    if (currentJson) fd.append('current_json', JSON.stringify(currentJson));
    fd.append('language', lang);

    let progressTimer = null;
    try {
      setGenerateProgress({ current: imageFile ? 2 : 3, total: 12, phase: imageFile ? progressText.image : progressText.waiting, waiting: false });
      progressTimer = setInterval(() => {
        setGenerateProgress(prev => {
          const current = prev?.current || 1;
          // At 7 switch to indeterminate "waiting" mode — no frozen number shown
          if (current >= 7) return { ...prev, waiting: true };
          return { current: current + 1, total: 12, phase: progressText.waiting, waiting: false };
        });
      }, 900);

      const res = await fetch('/generate', { method:'POST', body:fd });
      if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
      setGenerateProgress({ current: 10, total: 12, phase: progressText.response });
      if (!res.ok) {
        let errMsg = 'HTTP ' + res.status;
        try {
          const errData = await res.json();
          if (errData?.detail) errMsg = errData.detail;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      console.log('[generate] response:', data);
      if (!data?.layout) throw new Error(data?.detail || 'Geçersiz yanıt — layout yok');

      setGenerateProgress({ current: 11, total: 12, phase: progressText.parsing });
      _uid = 0; tagIds(data.layout);
      setCurrentJson(data);
      setVersion(v => v + 1);
      setGenerateProgress({ current: 12, total: 12, phase: progressText.rendering });
      await new Promise(resolve => setTimeout(resolve, 180));
      setAppState('editing');
      setGenerateProgress(null);
      setSavedAt(Date.now());

      // Auto-save initial version
      if (currentFilePath) _saveFile(currentFilePath, data);

      // Auditor: screenshot + verify
      setTimeout(async () => {
        try {
          const deviceScreen = document.querySelector('.device-screen');
          if (!deviceScreen || typeof html2canvas === 'undefined') return;
          const canvas = await captureDeviceScreen(deviceScreen);
          canvas.toBlob(async (blob) => {
            if (!blob) return;
            const vfd = new FormData();
            vfd.append('json_data', JSON.stringify(data));
            vfd.append('screenshot', blob, 'preview.png');
            try {
              const vRes = await fetch('/verify', { method:'POST', body:vfd });
              if (!vRes.ok) return;
              const verified = await vRes.json();
              if (verified?.layout) {
                setSelectedIds(curIds => {
                  let pathIndices = [];
                  setCurrentJson(curLayout => {
                    if (curIds.length > 0 && curLayout?.layout) {
                      pathIndices = curIds.map(id => findIndexPath(curLayout.layout, id)).filter(Boolean);
                    }
                    _uid = 0; tagIds(verified.layout);
                    console.log('✅ Auditor: done');
                    return verified;
                  });
                  if (pathIndices.length > 0) {
                    const restored = pathIndices.map(p => getNodeByIndexPath(verified.layout, p)).filter(Boolean).map(n => n._id);
                    if (restored.length) return restored;
                  }
                  return curIds;
                });
                if (currentFilePath) _saveFile(currentFilePath, verified);
              }
            } catch (e) { console.warn('Auditor verify failed:', e); }
          }, 'image/png');
        } catch (e) { console.warn('Auditor screenshot failed:', e); }
      }, 800);

    } catch (err) {
      if (progressTimer) clearInterval(progressTimer);
      setGenerateProgress(null);
      setAppState(currentJson ? 'editing' : 'empty');
      setErrorModal((lang === 'tr' ? 'Hata: ' : 'Error: ') + err.message);
    }
  };

  // ── Flow-driven generation ───────────────────────────────────────────────
  const handleFlowGenerate = useCallback(async (dataContext, userPrompt) => {
    const effectivePrompt = userPrompt || (lang === 'tr' ? 'Kişiselleştirilmiş ana ekran oluştur' : 'Create personalized home screen');
    setView('studio');
    setAppState('streaming');
    setSelectedIds([]);
    setGenerateProgress({ current: 1, total: 12, phase: lang === 'tr' ? 'Kişiselleştirme verisi hazırlanıyor…' : 'Preparing personalization data…' });

    const fd = new FormData();
    fd.append('prompt', effectivePrompt);
    fd.append('platform', platform);
    fd.append('language', lang);
    fd.append('data_context', JSON.stringify(dataContext));

    let progressTimer = null;
    try {
      setGenerateProgress({ current: 3, total: 12, phase: lang === 'tr' ? 'AI kişiselleştiriyor…' : 'AI personalizing…', waiting: false });
      progressTimer = setInterval(() => {
        setGenerateProgress(prev => {
          const cur = prev?.current || 1;
          if (cur >= 7) return { ...prev, waiting: true };
          return { current: cur + 1, total: 12, phase: lang === 'tr' ? 'AI üretiyor…' : 'AI generating…', waiting: false };
        });
      }, 900);

      const res = await fetch('/generate', { method: 'POST', body: fd });
      if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
      setGenerateProgress({ current: 10, total: 12, phase: lang === 'tr' ? 'Yanıt alındı…' : 'Response received…' });
      if (!res.ok) {
        let errMsg = 'HTTP ' + res.status;
        try {
          const errData = await res.json();
          if (errData?.detail) errMsg = errData.detail;
        } catch (_) {}
        throw new Error(errMsg);
      }
      const data = await res.json();
      if (!data?.layout) throw new Error(data?.detail || 'Geçersiz yanıt');

      setGenerateProgress({ current: 11, total: 12, phase: lang === 'tr' ? 'İşleniyor…' : 'Processing…' });
      _uid = 0; tagIds(data.layout);
      setCurrentJson(data);
      setVersion(v => v + 1);
      setGenerateProgress({ current: 12, total: 12, phase: lang === 'tr' ? 'Önizleme hazırlanıyor…' : 'Preparing preview…' });
      await new Promise(r => setTimeout(r, 180));
      setAppState('editing');
      setGenerateProgress(null);
      setSavedAt(Date.now());
    } catch (err) {
      if (progressTimer) clearInterval(progressTimer);
      setGenerateProgress(null);
      setAppState(currentJson ? 'editing' : 'empty');
      setErrorModal((lang === 'tr' ? 'Hata: ' : 'Error: ') + err.message);
    }
  }, [platform, lang, currentJson]);

  // ── Manual verify / improve quality ─────────────────────────────────────
  const handleVerify = useCallback(async () => {
    if (!currentJson || verifyState === 'running') return;
    setVerifyState('running');
    try {
      const deviceScreen = document.querySelector('.device-screen');
      if (!deviceScreen || typeof html2canvas === 'undefined') { setVerifyState('idle'); return; }
      const canvas = await captureDeviceScreen(deviceScreen);
      canvas.toBlob(async (blob) => {
        if (!blob) { setVerifyState('idle'); return; }
        const vfd = new FormData();
        vfd.append('json_data', JSON.stringify(currentJson));
        vfd.append('screenshot', blob, 'preview.png');
        try {
          const vRes = await fetch('/verify', { method: 'POST', body: vfd });
          if (!vRes.ok) {
            let errMsg = 'HTTP ' + vRes.status;
            try {
              const errData = await vRes.json();
              if (errData?.detail) errMsg = errData.detail;
            } catch (_) {}
            throw new Error(errMsg);
          }
          const verified = await vRes.json();
          if (verified?.layout) {
            setCurrentJson(prev => {
              _uid = 0; tagIds(verified.layout);
              return verified;
            });
            setSavedAt(Date.now());
            if (currentFilePath) _saveFile(currentFilePath, verified);
          } else {
            throw new Error(lang === 'tr' ? 'Doğrulama başarısız oldu — layout yok' : 'Verification failed — no layout');
          }
        } catch (e) {
          console.warn('Verify failed:', e);
          setErrorModal((lang === 'tr' ? 'Hata (AI Denetim): ' : 'Error (AI Audit): ') + e.message);
        }
        setVerifyState('idle');
      }, 'image/png');
    } catch (e) {
      console.warn('Verify screenshot failed:', e);
      setVerifyState('idle');
    }
  }, [currentJson, verifyState, currentFilePath]);

  // ── Publish ──────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!currentJson) { alert(lang === 'tr' ? 'Yayınlanacak tasarım yok.' : 'No design to publish.'); return; }
    try {
      const res = await fetch('/update_layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(window.SDUIAuth?.authHeaders?.(auth) || {}) },
        body: JSON.stringify({
          layout: currentJson.layout ?? currentJson,
          screen_name: currentJson.screen_name || 'Untitled',
          platform,
        }),
      });
      if (res.status === 401) { handleLogout(); return; }
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json().catch(() => ({}));
      setSavedAt(Date.now());
      if (data?.status === 'pending_approval') {
        alert(lang === 'tr'
          ? '📝 Yayın isteği onaya gönderildi. Admin onayladığında yayına geçecek.'
          : '📝 Publish request sent for approval. It will go live after an admin approves.');
      } else {
        alert(lang === 'tr' ? '✅ Tasarım yayınlandı!' : '✅ Design published!');
      }
    } catch (err) { alert((lang === 'tr' ? 'Yayınlama başarısız: ' : 'Publish failed: ') + err.message); }
  };

  const handleLogout = () => {
    if (auth?.token) {
      fetch('/api/auth/logout', { method: 'POST', headers: window.SDUIAuth.authHeaders(auth) }).catch(() => {});
    }
    window.SDUIAuth?.clearAuth?.();
    setAuth(null);
    setShowApprovals(false);
  };

  // Poll pending count for admins so the badge stays fresh.
  useEffect(() => {
    if (auth?.role !== 'admin') { setPendingCount(0); return; }
    const fetchPending = () => {
      fetch('/api/approvals/list?status_filter=pending', { headers: window.SDUIAuth.authHeaders(auth) })
        .then(r => {
          if (r.status === 401) { window.SDUIAuth.clearAuth(); setAuth(null); return null; }
          return r.ok ? r.json() : null;
        })
        .then(d => { if (d) setPendingCount(d.total || 0); })
        .catch(() => {});
    };
    fetchPending();
    const id = setInterval(fetchPending, 10000);
    return () => clearInterval(id);
  }, [auth]);

  const handleSaveAsA = () => { if (currentJson) { setAbVariantA(currentJson); alert(lang === 'tr' ? 'Varyant A kaydedildi' : 'Variant A saved'); } };
  const handleSaveAsB = () => { if (currentJson) { setAbVariantB(currentJson); alert(lang === 'tr' ? 'Varyant B kaydedildi' : 'Variant B saved'); } };
  const handleStartAB = async () => {
    if (!abVariantA || !abVariantB) { alert(lang === 'tr' ? 'Önce A ve B kaydedin' : 'Save A and B first'); return; }
    await fetch('/publish_ab', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ variant_a:abVariantA, variant_b:abVariantB }) });
    setAbActive(true);
  };

  // ── File system ──────────────────────────────────────────────────────────
  const _saveFile = (path, data) => {
    fetch(`/api/fs/file?path=${encodeURIComponent(path)}`, { method:'PUT', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(data) }).catch(() => {});
  };

  const handleSelectFile = async (path) => {
    try {
      const res = await fetch(`/api/fs/file?path=${encodeURIComponent(path)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.layout) { _uid = 0; tagIds(data.layout); setCurrentJson(data); setCurrentFilePath(path); setAppState('editing'); setSelectedIds([]); }
    } catch (err) { console.error('File open failed', err); }
  };

  const handleNewFolder = async () => {
    const name = window.prompt(lang === 'tr' ? 'Klasör adı:' : 'Folder name:');
    if (!name) return;
    await fetch(`/api/fs/folder?path=${encodeURIComponent(name)}`, { method:'POST' });
    loadFiles();
  };

  const handleNewFile = async () => {
    const name = window.prompt(lang === 'tr' ? 'Dosya adı (uzantısız):' : 'File name (no extension):');
    if (!name) return;
    const path = name.endsWith('.json') ? name : name + '.json';
    await fetch(`/api/fs/file?path=${encodeURIComponent(path)}`, { method:'POST' });
    loadFiles();
    handleSelectFile(path);
  };

  // ── Zoom ─────────────────────────────────────────────────────────────────
  const handleZoomIn  = () => setZoom(z => Math.min(200, z + 10));
  const handleZoomOut = () => setZoom(z => Math.max(50,  z - 10));

  // ── Node interactions ────────────────────────────────────────────────────
  const handleSelectNode = useCallback((id, multi) => {
    setSelectedIds(prev => {
      if (!multi) return [id];
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  }, []);

  useEffect(() => {
    const onPreviewSelect = (e) => {
      const { id, multi } = e.detail || {};
      if (id) handleSelectNode(id, multi);
    };
    window.addEventListener('sdui-preview-select', onPreviewSelect);
    return () => window.removeEventListener('sdui-preview-select', onPreviewSelect);
  }, [handleSelectNode]);

  const handlePropChange = useCallback((propName, value) => {
    if (!selectedIds.length || !currentJson?.layout) return;
    const updateNode = (node) => {
      let changed = false;
      if (selectedIds.some(id => String(id) === String(node._id))) {
        if (!node.props) node.props = {};
        if (value === undefined) delete node.props[propName];
        else node.props[propName] = value;
        changed = true;
      }
      for (const c of (node.children || [])) if (updateNode(c)) changed = true;
      return changed;
    };
    const clone = JSON.parse(JSON.stringify(currentJson));
    _uid = 0; tagIds(clone.layout);
    updateNode(clone.layout);
    setCurrentJson(clone);
    if (propName === 'sduiLabel' && value) setLeftTab('generate');
  }, [selectedIds, currentJson]);

  const handleDuplicate = useCallback((nodeId) => {
    const id = nodeId || selectedIds[0];
    if (!id || !currentJson?.layout) return;
    const deepClone = (node) => { const c = JSON.parse(JSON.stringify(node)); delete c._id; (c.children||[]).forEach(ch => delete ch._id); return c; };
    const insertAfter = (parent) => {
      const kids = parent.children || [];
      for (let i = 0; i < kids.length; i++) {
        if (kids[i]._id === id) { kids.splice(i+1, 0, deepClone(kids[i])); return true; }
        if (insertAfter(kids[i])) return true;
      }
      return false;
    };
    const clone = JSON.parse(JSON.stringify(currentJson));
    if (clone.layout._id === id) return;
    insertAfter(clone.layout);
    _uid = 0; tagIds(clone.layout);
    setCurrentJson(clone);
  }, [selectedIds, currentJson]);

  const handleDelete = useCallback((nodeId) => {
    const ids = nodeId ? [nodeId] : selectedIds;
    if (!ids.length || !currentJson?.layout) return;
    const removeFrom = (parent) => {
      let changed = false;
      parent.children = (parent.children||[]).filter(k => { if (ids.includes(k._id)) { changed=true; return false; } return true; });
      for (const k of parent.children) if (removeFrom(k)) changed = true;
      return changed;
    };
    const clone = JSON.parse(JSON.stringify(currentJson));
    if (ids.includes(clone.layout._id)) return;
    if (removeFrom(clone.layout)) { _uid = 0; tagIds(clone.layout); setCurrentJson(clone); setSelectedIds(prev => prev.filter(id => !ids.includes(id))); }
  }, [selectedIds, currentJson]);

  const handleRefine = useCallback((nodeId) => {
    const ids = nodeId ? [nodeId] : selectedIds;
    if (!ids.length || !currentJson?.layout) return;
    const nodes = ids.map(id => findById(currentJson.layout, id)).filter(Boolean);
    const desc = nodes.map(n => n.props?.sduiLabel || n.type).join(', ');
    setPromptText(lang === 'tr' ? `Şu bileşenleri iyileştir (${desc}): daha modern yap.` : `Refine these components (${desc}): make more modern and professional.`);
    setLeftTab('generate');
  }, [selectedIds, currentJson, lang]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const tree = currentJson?.layout ? [buildTreeNode(currentJson.layout)] : null;
  const selectedPath = selectedIds.length > 0 && currentJson?.layout ? (findPath(currentJson.layout, selectedIds[0]) || []) : [];
  const selectedNodes = selectedIds.map(id => findById(currentJson?.layout, id)).filter(Boolean);
  const primaryNode = selectedNodes[0];
  const breadcrumb = currentFilePath ? {
    folder: currentFilePath.includes('/') ? currentFilePath.split('/').slice(0,-1).join('/') : (lang==='tr' ? 'Projeler' : 'Projects'),
    file: currentFilePath.split('/').pop(),
  } : null;
  const generateState = appState === 'streaming' ? 'streaming' : currentJson ? 'filled' : 'idle';
  const selectedLabel = primaryNode?.props?.sduiLabel || null;

  let attrSelection = null;
  if (selectedNodes.length === 1) {
    attrSelection = {
      isMulti: false, id: primaryNode._id, type: primaryNode.type,
      name: primaryNode.props?.sduiLabel || primaryNode.props?.text?.slice(0,22) || primaryNode.type,
      path: selectedPath.join(' › '),
      props: {
        sduiLabel: primaryNode.props?.sduiLabel, height: primaryNode.props?.height,
        padX: primaryNode.props?.horizontalPadding ?? primaryNode.props?.paddingLeft ?? primaryNode.props?.padding,
        padY: primaryNode.props?.verticalPadding ?? primaryNode.props?.paddingTop ?? primaryNode.props?.padding,
        radius: primaryNode.props?.cornerRadius, backgroundColor: primaryNode.props?.backgroundColor,
        bg: primaryNode.props?.backgroundColor, color: primaryNode.props?.color,
        fontSize: primaryNode.props?.fontSize, fontWeight: primaryNode.props?.fontWeight, shadow: primaryNode.props?.shadow,
      },
    };
  } else if (selectedNodes.length > 1) {
    attrSelection = {
      isMulti: true, count: selectedNodes.length,
      types: [...new Set(selectedNodes.map(n => n.type))].join(', '),
      props: {
        sduiLabel: selectedNodes.every(n => n.props?.sduiLabel === primaryNode.props?.sduiLabel) ? primaryNode.props?.sduiLabel : undefined,
        bg: selectedNodes.every(n => n.props?.backgroundColor === primaryNode.props?.backgroundColor) ? primaryNode.props?.backgroundColor : undefined,
      },
    };
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (!auth) {
    return <window.SDUIAuth.LoginOverlay lang={lang} onLogin={setAuth}/>;
  }

  return (
    <>
      <div className="studio" data-theme={theme}>
        <window.SDUI.TopBar lang={lang} theme={theme} onToggleTheme={cycleTheme} onToggleLang={setLang} breadcrumb={breadcrumb} savedAt={formatRelTime(savedAt, lang)} showAB={abActive} onPublish={handlePublish} platform={platform} onPlatform={handlePlatformChange}
          auth={auth}
          pendingCount={pendingCount}
          onOpenApprovals={() => setShowApprovals(true)}
          onLogout={handleLogout}
          onOpenFlows={(toFlows) => setView(toFlows ? 'flows' : 'studio')}
          flowsActive={view === 'flows'}
        />

        {view === 'flows' ? (
          <window.DataFlowPage
            lang={lang}
            onBack={() => setView('studio')}
            onFlowGenerate={handleFlowGenerate}
          />
        ) : null}

        <div className="workspace" style={{ display: view === 'flows' ? 'none' : undefined }}>
          <window.LeftRail lang={lang} tab={leftTab} onTab={setLeftTab} promptText={promptText} onPromptChange={setPromptText} imagePreview={imagePreview} onImageChange={handleImageChange} onImageRemove={handleImageRemove} smartCrop={smartCrop} onSmartCropChange={setSmartCrop} generateState={generateState} onGenerate={handleGenerate} files={files} selectedFilePath={currentFilePath} onSelectFile={handleSelectFile} onNewFolder={handleNewFolder} onNewFile={handleNewFile} platform={platform} onPlatform={handlePlatformChange} selectedLabel={selectedLabel} abActive={abActive} currentVersion={`v${version}`} onPublish={handlePublish} onSaveAsA={handleSaveAsA} onSaveAsB={handleSaveAsB} onStartAB={handleStartAB} designSystems={designSystems} onDesignSystemsChange={setDesignSystems} brandRules={brandRules} onBrandRulesChange={setBrandRules}/>

          {treeView === 'json' ? (
            <JsonPane lang={lang} json={currentJson} onView={setTreeView}/>
          ) : (
            <window.SDUI.TreePane lang={lang} view={treeView} onView={setTreeView} tree={tree} selectedPaths={selectedIds.map(id => findPath(currentJson?.layout, id) || [])} onSelectNode={(path, multi) => handleSelectNode(path[path.length-1], multi)} breadcrumb={selectedPath.length ? selectedPath.map(String) : null}/>
          )}

          <window.SDUI.CanvasPane lang={lang} device={device} onDevice={setDevice} zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} hideShell={appState === 'empty'}
            toolbarRight={appState === 'editing' ? (
              <button
                className="icon-btn"
                title={lang === 'tr' ? 'Kaliteyi İyileştir (AI Denetim)' : 'Improve Quality (AI Audit)'}
                onClick={handleVerify}
                disabled={verifyState === 'running'}
                style={verifyState === 'running' ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
              >
                {verifyState === 'running'
                  ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 1.5 }}/>
                  : <Icon name="sparkle" size={13}/>
                }
              </button>
            ) : null}
          >
            {appState === 'empty' && (
              <div style={{ width:'100%', height:'100%', overflowY:'auto', display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:24 }}>
                <EmptyHero lang={lang} onStart={() => setLeftTab('generate')}/>
              </div>
            )}
            {appState === 'streaming' && <window.SDUIMocks.MockStreamingScreen lang={lang} progress={generateProgress}/>}
            {appState === 'editing' && <SDUIRenderer layout={currentJson?.layout} selectedIds={selectedIds} onSelectId={handleSelectNode}/>}
          </window.SDUI.CanvasPane>

          <window.SDUI.AttributesPane lang={lang} selection={attrSelection} onChangeProp={handlePropChange} onDuplicate={handleDuplicate} onDelete={handleDelete} onRefine={handleRefine}/>
        </div>
      </div>

      {showApprovals && (
        <window.SDUIAuth.ApprovalsPanel
          lang={lang}
          auth={auth}
          theme={theme}
          onClose={() => setShowApprovals(false)}
          onApproved={() => {
            // Refresh current preview after a successful approval
            fetch(`/current-ui?platform=${platform}`).then(r => r.ok ? r.json() : null).then(data => {
              if (data?.layout) { _uid = 0; tagIds(data.layout); setCurrentJson(data); setAppState('editing'); }
            }).catch(() => {});
          }}
        />
      )}

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label={lang === 'tr' ? 'Görünüm' : 'Appearance'}>
          <window.TweakRadio label={lang==='tr'?'Tema':'Theme'} value={theme} onChange={setTheme} options={[{ value:'light', label:lang==='tr'?'Açık':'Light' },{ value:'dark', label:lang==='tr'?'Koyu':'Dark' },{ value:'vf-light', label:'Red · Light' },{ value:'vf-dark', label:'Red · Dark' }]}/>
          <window.TweakRadio label={lang==='tr'?'Dil':'Language'} value={lang} onChange={setLang} options={[{ value:'tr', label:'Türkçe' },{ value:'en', label:'English' }]}/>
        </window.TweakSection>
      </window.TweaksPanel>

      {errorModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 99999,
        }}>
          <div style={{
            background: 'var(--bg-elev)',
            border: '1px solid var(--line-strong)',
            borderRadius: 16,
            padding: 24,
            width: '90%',
            maxWidth: 420,
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--brand)', borderRadius: '16px 16px 0 0' }}/>
            
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--brand-soft)',
                color: 'var(--brand)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--fg)' }}>
                  {lang === 'tr' ? 'Yapay Zeka Tasarım Hatası' : 'AI Generation Error'}
                </h4>
                <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, wordBreak: 'break-word' }}>
                  {errorModal}
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                className="btn primary"
                onClick={() => setErrorModal(null)}
                style={{
                  background: 'var(--brand)',
                  color: '#fff',
                  border: 0,
                  borderRadius: 6,
                  padding: '6px 14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                {lang === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
