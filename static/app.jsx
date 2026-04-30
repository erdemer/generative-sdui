/* SDUI Studio — App root component */

const { useState, useEffect, useCallback } = React;

function App() {
  // ── Core state ───────────────────────────────────────────────────────────
  const [appState, setAppState] = useState('empty'); // 'empty' | 'streaming' | 'editing'
  const [currentJson, setCurrentJson] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [generateProgress, setGenerateProgress] = useState(null);

  // ── UI preferences ───────────────────────────────────────────────────────
  const [lang, setLangRaw] = useState(pickLang);
  const setLang = (v) => { try { localStorage.setItem('sdui_lang', v); } catch {} setLangRaw(v); };
  const [theme, setTheme] = useState(pickTheme);
  const [leftTab, setLeftTab] = useState('generate');
  const [treeView, setTreeView] = useState('tree');
  const [device, setDevice] = useState('iphone');

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

  // ── File system ──────────────────────────────────────────────────────────
  const [files, setFiles] = useState([]);
  const [currentFilePath, setCurrentFilePath] = useState(null);

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
      setGenerateProgress({ current: imageFile ? 2 : 3, total: 12, phase: imageFile ? progressText.image : progressText.waiting });
      progressTimer = setInterval(() => {
        setGenerateProgress(prev => {
          const current = prev?.current || 1;
          if (current >= 9) return prev;
          return {
            current: current + 1,
            total: 12,
            phase: progressText.waiting,
          };
        });
      }, 900);

      const res = await fetch('/generate', { method:'POST', body:fd });
      if (progressTimer) { clearInterval(progressTimer); progressTimer = null; }
      setGenerateProgress({ current: 10, total: 12, phase: progressText.response });
      if (!res.ok) throw new Error('HTTP ' + res.status);
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
          const canvas = await html2canvas(deviceScreen, { backgroundColor:'#FFFFFF', scale:1, useCORS:true, logging:false });
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
      alert((lang === 'tr' ? 'Hata: ' : 'Error: ') + err.message);
    }
  };

  // ── Publish ──────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!currentJson) { alert(lang === 'tr' ? 'Yayınlanacak tasarım yok.' : 'No design to publish.'); return; }
    try {
      const res = await fetch('/update_layout', { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify({ layout:currentJson, platform }) });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setSavedAt(Date.now());
      alert(lang === 'tr' ? '✅ Tasarım yayınlandı!' : '✅ Design published!');
    } catch (err) { alert((lang === 'tr' ? 'Yayınlama başarısız: ' : 'Publish failed: ') + err.message); }
  };

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

  const handlePropChange = useCallback((propName, value) => {
    if (!selectedIds.length || !currentJson?.layout) return;
    const updateNode = (node) => {
      let changed = false;
      if (selectedIds.includes(node._id)) {
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
  return (
    <>
      <div className="studio" data-theme={theme}>
        <window.SDUI.TopBar lang={lang} theme={theme} onToggleTheme={cycleTheme} onToggleLang={setLang} breadcrumb={breadcrumb} savedAt={formatRelTime(savedAt, lang)} showAB={abActive} onPublish={handlePublish} platform={platform} onPlatform={handlePlatformChange}/>

        <div className="workspace">
          <window.LeftRail lang={lang} tab={leftTab} onTab={setLeftTab} promptText={promptText} onPromptChange={setPromptText} imagePreview={imagePreview} onImageChange={handleImageChange} onImageRemove={handleImageRemove} smartCrop={smartCrop} onSmartCropChange={setSmartCrop} generateState={generateState} onGenerate={handleGenerate} files={files} selectedFilePath={currentFilePath} onSelectFile={handleSelectFile} onNewFolder={handleNewFolder} onNewFile={handleNewFile} platform={platform} onPlatform={handlePlatformChange} selectedLabel={selectedLabel} abActive={abActive} currentVersion={`v${version}`} onPublish={handlePublish} onSaveAsA={handleSaveAsA} onSaveAsB={handleSaveAsB} onStartAB={handleStartAB}/>

          {treeView === 'json' ? (
            <JsonPane lang={lang} json={currentJson} onView={setTreeView}/>
          ) : (
            <window.SDUI.TreePane lang={lang} view={treeView} onView={setTreeView} tree={tree} selectedPaths={selectedIds.map(id => findPath(currentJson?.layout, id) || [])} onSelectNode={(path, multi) => handleSelectNode(path[path.length-1], multi)} breadcrumb={selectedPath.length ? selectedPath.map(String) : null}/>
          )}

          <window.SDUI.CanvasPane lang={lang} device={device} onDevice={setDevice} zoom={zoom} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} hideShell={appState === 'empty'}>
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

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection label={lang === 'tr' ? 'Görünüm' : 'Appearance'}>
          <window.TweakRadio label={lang==='tr'?'Tema':'Theme'} value={theme} onChange={setTheme} options={[{ value:'light', label:lang==='tr'?'Açık':'Light' },{ value:'dark', label:lang==='tr'?'Koyu':'Dark' },{ value:'vf-light', label:'Red · Light' },{ value:'vf-dark', label:'Red · Dark' }]}/>
          <window.TweakRadio label={lang==='tr'?'Dil':'Language'} value={lang} onChange={setLang} options={[{ value:'tr', label:'Türkçe' },{ value:'en', label:'English' }]}/>
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
