/* SDUI Studio — Shared shell components
   Topbar, panes, tree node, device frame, prompt panel, etc.
*/

const { useState, useMemo, useEffect, useRef } = React;

var Icon = window.Icon;
const t = (lang, key) => (window.I18N[lang] && window.I18N[lang][key]) || key;

/* =================== TOPBAR =================== */
function TopBar({ lang, theme, onToggleTheme, onToggleLang, breadcrumb, savedAt = "1m", showAB = false, onPublish, platform = 'mobile', onPlatform }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="brand-mark" style={{ display: 'grid', placeItems: 'center', padding: 0, background: 'transparent', border: 'none' }}><img src="/static/logo.png" alt="Vodafone" style={{ width: 28, height: 28 }}/></div>
        <div className="brand-name">
          SDUI <em>Studio</em>
        </div>
        {breadcrumb && (
          <div className="crumb">
            <Icon name="folder" size={12}/>
            <span>{breadcrumb.folder}</span>
            <Icon name="chev-r" size={11} stroke={2}/>
            <b>{breadcrumb.file}</b>
          </div>
        )}
      </div>
      <div className="topbar-center">
        <div className="seg">
          <button className={platform==='mobile'?'on':''} onClick={()=>onPlatform && onPlatform('mobile')}><Icon name="device-mobile" size={13}/> {t(lang,"mobile")}</button>
          <button className={platform==='web'?'on':''} onClick={()=>onPlatform && onPlatform('web')}><Icon name="device-desktop" size={13}/> {t(lang,"web")}</button>
        </div>
        <div className="seg" style={{ marginLeft: 4 }}>
          <button className={lang==='tr'?'on':''} onClick={()=>onToggleLang && onToggleLang('tr')}>TR</button>
          <button className={lang==='en'?'on':''} onClick={()=>onToggleLang && onToggleLang('en')}>EN</button>
        </div>
      </div>
      <div className="topbar-right">
        <div className="chip ok" style={{ marginRight: 4 }}>
          <Icon name="check" size={11} stroke={2.4}/> {t(lang,"saved")} · {savedAt}
        </div>
        {showAB && <div className="chip brand"><Icon name="git-branch" size={11}/> {t(lang,"abInProgress")}</div>}
        <button className="icon-btn" onClick={onToggleTheme} title={lang==='tr'?'Tema değiştir':'Cycle theme'}>
          <Icon name={theme && theme.indexOf('dark')>=0 ? 'moon' : 'sun'} size={15}/>
        </button>
        <button className="icon-btn" onClick={() => alert("Invite / Share coming soon!")}><Icon name="users" size={15}/></button>
        <div style={{ display: 'flex', marginLeft: 4 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'oklch(0.65 0.15 25)', border: '2px solid var(--panel)', color: '#fff', fontSize: 10, fontWeight: 600, display: 'grid', placeItems: 'center' }}>EA</div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'oklch(0.62 0.13 240)', border: '2px solid var(--panel)', color: '#fff', fontSize: 10, fontWeight: 600, display: 'grid', placeItems: 'center', marginLeft: -8 }}>MK</div>
        </div>
        <button className="btn primary" onClick={onPublish}><Icon name="rocket" size={13}/> {t(lang,"publish")}</button>
      </div>
    </div>
  );
}

/* =================== LEFT PANE: Files + Settings + Reference + Prompt + Publish =================== */
function FilesPane({ lang, files = [], selectedId, onSelect, onNewFile, density = "default" }) {
  const [search, setSearch] = useState("");
  const filteredFiles = useMemo(() => files.filter(f => f.name.toLowerCase().includes(search.toLowerCase())), [files, search]);

  return (
    <div className="pane">
      <div className="pane-header">
        <h3>{t(lang,"files")}</h3>
        <div className="actions">
          <button className="icon-btn" title={t(lang,"newProject")} onClick={onNewFile}><Icon name="plus" size={14}/></button>
          <button className="icon-btn"><Icon name="search" size={14}/></button>
          <button className="icon-btn"><Icon name="more-h" size={14}/></button>
        </div>
      </div>
      <div className="pane-body" style={{ padding: 0 }}>
        {/* Search */}
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={13} className="" style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)' }}/>
            <input className="input" style={{ paddingLeft: 28, height: 28 }} placeholder={lang==='tr'?'Dosyalarda ara…':'Search files…'} value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
        </div>

        {/* File tree */}
        <div style={{ padding: '8px 6px' }}>
          {filteredFiles.length === 0 ? (
            <EmptyFiles lang={lang}/>
          ) : (
            filteredFiles.map((f, i) => (
              <FileRow key={i} {...f} selected={f.id === selectedId} onClick={() => onSelect && onSelect(f.id)} lang={lang}/>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyFiles({ lang }) {
  return (
    <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--fg-3)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--panel-2)', margin: '0 auto 10px', display: 'grid', placeItems: 'center', color: 'var(--fg-mute)' }}>
        <Icon name="folder" size={18}/>
      </div>
      <div style={{ fontSize: 12, color: 'var(--fg-2)', fontWeight: 500, marginBottom: 4 }}>{t(lang,"workspaceEmpty")}</div>
      <div style={{ fontSize: 11, lineHeight: 1.5, marginBottom: 12 }}>
        {lang==='tr' ? 'Dosya oluştur ya da hazır şablondan başla.' : 'Create a file or start from a template.'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }}>
          <Icon name="plus" size={13}/> {t(lang,"newFile")}
        </button>
        <button className="btn ghost" style={{ width: '100%', justifyContent: 'center' }}>
          <Icon name="layers" size={13}/> {t(lang,"templates")}
        </button>
      </div>
    </div>
  );
}

function FileRow({ name, type = "file", level = 0, selected, open, lang, onClick, badge, modified }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        height: 28,
        padding: `0 8px 0 ${8 + level * 12}px`,
        borderRadius: 6,
        cursor: 'pointer',
        background: selected ? 'var(--brand-soft)' : 'transparent',
        color: selected ? 'var(--brand)' : 'var(--fg)',
        fontWeight: selected ? 600 : 400,
        fontSize: 12.5,
        position: 'relative',
      }}
      onMouseEnter={e => !selected && (e.currentTarget.style.background = 'var(--hover)')}
      onMouseLeave={e => !selected && (e.currentTarget.style.background = 'transparent')}
    >
      {type === 'folder' ? (
        <>
          <Icon name={open ? "chev-d" : "chev-r"} size={11} stroke={2}/>
          <Icon name="folder" size={13} style={{ color: selected ? 'var(--brand)' : 'oklch(0.65 0.13 60)' }}/>
        </>
      ) : (
        <>
          <span style={{ width: 11 }}/>
          <Icon name="file" size={13} style={{ color: 'var(--fg-3)' }}/>
        </>
      )}
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
      {modified && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand)' }}/>}
      {badge && <span className="chip" style={{ height: 16, fontSize: 9, padding: '0 5px' }}>{badge}</span>}
    </div>
  );
}

/* =================== TREE PANE =================== */
function TreePane({ lang, view = "tree", onView, hasSelection = true, tree, selectedPaths = [], onSelectNode, breadcrumb }) {
  return (
    <div className="pane">
      <div className="pane-header">
        <div className="seg" style={{ height: 24 }}>
          <button className={view==='tree'?'on':''} onClick={()=>onView && onView('tree')} style={{ height: 18 }}>
            <Icon name="layers" size={11}/> {t(lang,"tree")}
          </button>
          <button className={view==='json'?'on':''} onClick={()=>onView && onView('json')} style={{ height: 18 }}>
            <Icon name="code" size={11}/> {t(lang,"json")}
          </button>
        </div>
        <div className="actions">
          <button className="icon-btn"><Icon name="more-h" size={14}/></button>
        </div>
      </div>

      {/* Breadcrumb of selection */}
      {breadcrumb && (
        <div style={{ height: 28, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, borderBottom: '1px solid var(--line)', overflow: 'hidden', fontSize: 11, color: 'var(--fg-3)' }}>
          {breadcrumb.map((c, i) => (
            <React.Fragment key={i}>
              <span style={{ color: i === breadcrumb.length-1 ? 'var(--fg)' : 'var(--fg-3)', fontWeight: i === breadcrumb.length-1 ? 600 : 400 }}>{c}</span>
              {i < breadcrumb.length-1 && <Icon name="chev-r" size={10} stroke={2.2}/>}
            </React.Fragment>
          ))}
        </div>
      )}

      <div className="pane-body" style={{ padding: 4 }}>
        {!tree ? (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: 'var(--fg-3)', fontSize: 11.5, lineHeight: 1.6 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--panel-2)', margin: '0 auto 10px', display: 'grid', placeItems: 'center' }}>
              <Icon name="layers" size={16}/>
            </div>
            {lang==='tr' ? 'Bir dosya açtığında bileşen ağacı burada görünür.' : 'Open a file to see the component tree here.'}
          </div>
        ) : (
          <div className="tree">
            {tree.map((n, i) => <TreeNode key={i} node={n} level={0} selectedPaths={selectedPaths} onSelect={onSelectNode} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TreeNode({ node, level, selectedPaths = [], onSelect, path = [] }) {
  const rowRef = useRef(null);
  const myPath = [...path, node.id];
  const myPathStr = myPath.join('/');
  const selected = selectedPaths.some(p => p.join('/') === myPathStr);
  const open = node.open !== false;
  const indent = level * 14;
  useEffect(() => {
    if (selected) rowRef.current?.scrollIntoView({ block: 'nearest' });
  }, [selected]);
  return (
    <>
      <div
        ref={rowRef}
        className={"tree-node" + (selected ? " selected" : "")}
        style={{ paddingLeft: 6 + indent }}
        onClick={(e) => { e.stopPropagation(); onSelect && onSelect(myPath, e.shiftKey || e.metaKey); }}
      >
        {node.children?.length ? <Icon name={open?"chev-d":"chev-r"} size={11} stroke={2.2} className="chev"/> : <span style={{ width: 14 }}/>}
        <span className={`type-tag tt-${(node.type||'unknown').toLowerCase()}`}>{node.type||'?'}</span>
        <span className="name">{node.name || node.label || ""}</span>
        {node.sduiLabel && <span className="chip" style={{ marginLeft: 'auto', background: 'var(--brand-soft)', color: 'var(--brand)' }}>{node.sduiLabel}</span>}
        {node.children?.length ? <span style={{ fontSize: 10, color: 'var(--fg-3)', marginLeft: !node.sduiLabel ? 'auto' : 4 }}>{node.children.length}</span> : null}
      </div>
      {open && node.children?.map((c, i) => (
        <TreeNode key={i} node={c} level={level+1} selectedPaths={selectedPaths} onSelect={onSelect} path={myPath}/>
      ))}
    </>
  );
}

/* =================== DEVICE STAGE =================== */
function PreviewScrollbar({ metrics, onTrack, onThumbStart }) {
  const scrollable = metrics.scrollHeight > metrics.clientHeight + 1;
  const thumbHeight = scrollable
    ? Math.max(28, Math.min(100, (metrics.clientHeight / metrics.scrollHeight) * 100))
    : 100;
  const maxTop = 100 - thumbHeight;
  const thumbTop = scrollable
    ? (metrics.scrollTop / Math.max(1, metrics.scrollHeight - metrics.clientHeight)) * maxTop
    : 0;

  return (
    <div
      className={`preview-scrollbar ${scrollable ? '' : 'disabled'}`}
      aria-hidden="true"
      onMouseDown={onTrack}
    >
      <div
        className="preview-scrollbar-thumb"
        style={{ height: `${thumbHeight}%`, top: `${thumbTop}%` }}
        onMouseDown={onThumbStart}
      />
    </div>
  );
}

function CanvasPane({ lang, children, device = "iphone", onDevice, zoom = 100, onZoomIn, onZoomOut, showGrid = true, toolbarRight, footer, hideShell = false }) {
  const [interactive, setInteractive] = useState(false);
  const stageRef = useRef(null);
  const dragRef = useRef(null);
  const [scrollMetrics, setScrollMetrics] = useState({ scrollTop: 0, clientHeight: 1, scrollHeight: 1 });
  const [fitScale, setFitScale] = useState(1);

  // Auto-fit: shrink the device frame when stage is too small to show it fully
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const FRAME_H = device === 'web' ? 512 : 688; // approx rendered height incl shell
    const FRAME_W = device === 'web' ? 604 : 368;
    const PADDING = 64; // breathing room
    const calc = () => {
      const scaleH = Math.min(1, (el.offsetHeight - PADDING) / FRAME_H);
      const scaleW = Math.min(1, (el.offsetWidth  - PADDING) / FRAME_W);
      setFitScale(Math.min(scaleH, scaleW));
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [device]);

  const getPreviewScroller = () => stageRef.current?.querySelector('.sdui-device-content');

  const syncScrollMetrics = () => {
    const scroller = getPreviewScroller();
    if (!scroller) {
      setScrollMetrics({ scrollTop: 0, clientHeight: 1, scrollHeight: 1 });
      return;
    }
    setScrollMetrics({
      scrollTop: scroller.scrollTop,
      clientHeight: scroller.clientHeight || 1,
      scrollHeight: scroller.scrollHeight || 1,
    });
  };

  useEffect(() => {
    const scroller = getPreviewScroller();
    syncScrollMetrics();
    if (!scroller) return;

    const onScroll = () => syncScrollMetrics();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    const resizeObserver = new ResizeObserver(syncScrollMetrics);
    resizeObserver.observe(scroller);
    if (scroller.firstElementChild) resizeObserver.observe(scroller.firstElementChild);
    const timeout = setTimeout(syncScrollMetrics, 80);

    return () => {
      scroller.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [children, device, hideShell]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragRef.current) return;
      const scroller = getPreviewScroller();
      if (!scroller) return;
      const { startY, startScrollTop, trackHeight } = dragRef.current;
      const maxScroll = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
      const thumbHeight = Math.max(28, (scroller.clientHeight / scroller.scrollHeight) * trackHeight);
      const maxThumbTop = Math.max(1, trackHeight - thumbHeight);
      scroller.scrollTop = startScrollTop + ((e.clientY - startY) / maxThumbTop) * maxScroll;
    };
    const onMouseUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const passWheelToPreview = (e) => {
    // Temporarily hide the overlay so elementsFromPoint can see through it,
    // then find the first actually-scrollable element underneath.
    const overlay = e.currentTarget;
    overlay.style.pointerEvents = 'none';
    const hits = document.elementsFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = '';

    for (const el of hits) {
      const st = window.getComputedStyle(el);
      const oy = st.overflowY;
      if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) {
        el.scrollTop += e.deltaY;
        e.preventDefault();
        return;
      }
    }
  };

  const selectPreviewNodeAtPoint = (e) => {
    const overlay = e.currentTarget;
    overlay.style.pointerEvents = 'none';
    const target = document.elementFromPoint(e.clientX, e.clientY);
    overlay.style.pointerEvents = '';
    const nodeEl = target?.closest?.('[data-sdui-id]');
    const id = nodeEl?.dataset?.sduiId;
    if (!id) return;
    window.dispatchEvent(new CustomEvent('sdui-preview-select', {
      detail: { id, multi: e.shiftKey || e.metaKey },
    }));
  };

  const handleScrollbarTrack = (e) => {
    if (e.target.classList.contains('preview-scrollbar-thumb')) return;
    const scroller = getPreviewScroller();
    if (!scroller) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / Math.max(1, rect.height);
    scroller.scrollTop = ratio * (scroller.scrollHeight - scroller.clientHeight);
  };

  const handleScrollbarThumbStart = (e) => {
    const scroller = getPreviewScroller();
    if (!scroller) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      startY: e.clientY,
      startScrollTop: scroller.scrollTop,
      trackHeight: e.currentTarget.parentElement.getBoundingClientRect().height,
    };
  };
  
  return (
    <div className="pane canvas">
      <div className="canvas-toolbar">
        <div className="seg" style={{ height: 26 }}>
          <button className={device==='iphone'?'on':''} onClick={()=>onDevice && onDevice('iphone')} style={{ height: 20 }}>
            <Icon name="device-mobile" size={12}/> iOS
          </button>
          <button className={device==='pixel'?'on':''} onClick={()=>onDevice && onDevice('pixel')} style={{ height: 20 }}>
            <Icon name="device-mobile" size={12}/> Android
          </button>
          <button className={device==='web'?'on':''} onClick={()=>onDevice && onDevice('web')} style={{ height: 20 }}>
            <Icon name="globe" size={12}/> Web
          </button>
        </div>
        <span style={{ width: 1, height: 16, background: 'var(--line)' }}/>
        <button className={`icon-btn ${interactive?'active':''}`} title={t(lang,"interactive")} onClick={() => setInteractive(!interactive)}><Icon name="play" size={12}/></button>
        <span style={{ width: 1, height: 16, background: 'var(--line)' }}/>
        <span style={{ fontSize: 11, color: 'var(--fg-3)', padding: '0 6px' }}>{t(lang,"livePreview")}</span>
        {toolbarRight}
      </div>

      <div className="device-stage" ref={stageRef}>
        {hideShell ? (
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s', width: '100%', height: '100%', pointerEvents: interactive ? 'auto' : 'none' }}>
            {children}
          </div>
        ) : device === 'web' ? (
          /* Web: browser-like frame */
          <div className="preview-frame-wrap" style={{ transform: `scale(${(zoom / 100) * fitScale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
            <div style={{
              width: 580, background: 'var(--device-bezel)', borderRadius: 12, padding: 0,
              boxShadow: 'var(--shadow-lg)', overflow: 'hidden'
            }}>
              {/* Browser chrome bar */}
              <div style={{ height: 32, background: 'var(--device-bezel)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }}/>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }}/>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }}/>
                <div style={{ flex: 1, height: 18, background: 'rgba(255,255,255,0.1)', borderRadius: 4, marginLeft: 8 }}/>
              </div>
              <div style={{ width: '100%', height: 480, background: 'var(--device-screen)', overflow: 'hidden', position: 'relative' }}>
                {children}
                {!interactive && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'default' }}
                       onMouseDown={e => e.preventDefault()}
                       onClick={e => { e.stopPropagation(); selectPreviewNodeAtPoint(e); }}
                       onWheel={passWheelToPreview}
                  />
                )}
              </div>
            </div>
            <PreviewScrollbar metrics={scrollMetrics} onTrack={handleScrollbarTrack} onThumbStart={handleScrollbarThumbStart}/>
          </div>
        ) : (
          /* iPhone / Android phone frame */
          <div className="preview-frame-wrap" style={{ transform: `scale(${(zoom / 100) * fitScale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' }}>
            <div className={`device-shell ${device === 'pixel' ? 'device-android' : ''}`}>
              <div className="device-screen">
                {children}
                {/* Click-blocker overlay: blocks tap interactions but lets scroll events through */}
                {!interactive && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'default' }}
                       onMouseDown={e => e.preventDefault()}
                       onClick={e => { e.stopPropagation(); selectPreviewNodeAtPoint(e); }}
                       onWheel={passWheelToPreview}
                  />
                )}
              </div>
            </div>
            <PreviewScrollbar metrics={scrollMetrics} onTrack={handleScrollbarTrack} onThumbStart={handleScrollbarThumbStart}/>
          </div>
        )}
      </div>

      <div className="canvas-zoom">
        <button onClick={onZoomOut}><Icon name="x" size={11}/></button>
        <span className="val">{zoom}%</span>
        <button onClick={onZoomIn}><Icon name="plus" size={11}/></button>
      </div>

      {footer}
    </div>
  );
}

/* =================== ATTRIBUTES PANE =================== */
function AttributesPane({ lang, selection, onChangeProp, onDuplicate, onDelete, onRefine }) {
  return (
    <div className="pane">
      <div className="pane-header">
        <h3>{t(lang,"attributes")}</h3>
        <div className="actions">
          <button className="icon-btn" onClick={() => selection && onDuplicate && onDuplicate()} disabled={!selection}><Icon name="duplicate" size={13}/></button>
          <button className="icon-btn" onClick={() => selection && onDelete && onDelete()} disabled={!selection}><Icon name="trash" size={13}/></button>
          <button className="icon-btn"><Icon name="more-h" size={14}/></button>
        </div>
      </div>
      <div className="pane-body">
        {!selection ? (
          <div style={{ padding: '32px 16px 16px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--panel-2)', margin: '0 auto 14px', display: 'grid', placeItems: 'center', color: 'var(--fg-mute)' }}>
              <Icon name="grid" size={22} stroke={1.5}/>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', marginBottom: 6 }}>{t(lang,"selectComponent")}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.55 }}>{t(lang,"selectComponentHint")}</div>
            <div style={{ marginTop: 16, padding: 10, background: 'var(--panel-2)', borderRadius: 8, fontSize: 11, color: 'var(--fg-3)', textAlign: 'left', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 600, color: 'var(--fg-2)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="lightning" size={11}/> {t(lang,"quickActions")}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => onDuplicate && onDuplicate()}><span>{lang==='tr'?'Çoğalt':'Duplicate'}</span><span className="kbd">⌘D</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => onDelete && onDelete()}><span>{lang==='tr'?'Sil':'Delete'}</span><span className="kbd">⌫</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{lang==='tr'?'Üret':'Generate'}</span><span className="kbd">⌘↵</span></div>
              </div>
            </div>
          </div>
        ) : (
          <SelectedAttributes selection={selection} lang={lang} onChangeProp={onChangeProp} onRefine={onRefine} />
        )}
      </div>
    </div>
  );
}

function AttrSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div className={"section-head " + (open?"open":"")} onClick={()=>setOpen(!open)}>
        <span className="label">{title}</span>
        <Icon name="chev-r" size={11} stroke={2.2} className="chev"/>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

function AttrRow({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '86px 1fr', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <label style={{ fontSize: 11, color: 'var(--fg-3)' }}>{label}</label>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

function NumInput({ value, unit = "px", onChange }) {
  const [val, setVal] = useState(value || '');
  useEffect(() => { setVal(value || ''); }, [value]);
  
  const handleBlur = () => { if (val != value && onChange) onChange(Number(val) || val); };
  const handleKey = (e) => { if (e.key === 'Enter') handleBlur(); };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input className="input" value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={handleKey} style={{ height: 26, width: '100%', paddingRight: 26, fontSize: 11, fontFamily: 'var(--font-mono)' }}/>
      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 10, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{unit}</span>
    </div>
  );
}

function ColorRow({ value, onChange }) {
  const [val, setVal] = useState(value || '');
  useEffect(() => { setVal(value || ''); }, [value]);
  
  const handleBlur = () => { if (val != value && onChange) onChange(val); };
  const handleKey = (e) => { if (e.key === 'Enter') handleBlur(); };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 26, padding: '0 4px 0 6px', border: '1px solid var(--input-line)', borderRadius: 6, background: 'var(--input)', width: '100%' }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: value, border: '1px solid var(--line)', flexShrink: 0 }}/>
      <input 
        style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg)', flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none' }}
        value={val} onChange={e => setVal(e.target.value)} onBlur={handleBlur} onKeyDown={handleKey}
      />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>100%</span>
    </div>
  );
}

function SelectedAttributes({ selection, lang, onChangeProp, onRefine }) {
  // selection = { isMulti, count, types, props, name, path, id }
  const isMulti = selection.isMulti;
  const p = selection.props || {};

  return (
    <div style={{ margin: '-12px' }}>
      {/* selected header */}
      <div style={{ padding: '12px', borderBottom: '1px solid var(--line)', background: isMulti ? 'var(--bg-elev)' : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          {isMulti ? (
            <>
              <Icon name="layers" size={12} style={{ color: 'var(--brand)' }}/>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--fg)' }}>{selection.count} {lang === 'tr' ? 'Bileşen Seçildi' : 'Components Selected'}</span>
            </>
          ) : (
            <>
              <span className={`type-tag tt-${selection.type.toLowerCase()}`}>{selection.type}</span>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 13, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selection.name}</span>
            </>
          )}
        </div>
        {!isMulti && <div style={{ fontSize: 10.5, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{selection.path || "/"}</div>}
        {isMulti && <div style={{ fontSize: 10.5, color: 'var(--fg-3)' }}>{selection.types}</div>}
      </div>

      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', background: 'var(--panel-2)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-3)', marginBottom: 6 }}>{lang === 'tr' ? 'KİMLİK VE ETİKET' : 'IDENTITY & LABEL'}</div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 700, color: 'var(--brand)' }}>$</span>
          <input 
            className="input" 
            placeholder={lang === 'tr' ? 'Etiket (örn: topCard)' : 'Label (ex: topCard)'}
            style={{ height: 28, width: '100%', paddingLeft: 18, fontSize: 12, fontWeight: 600, border: '1px solid var(--brand-soft)' }}
            value={(p.sduiLabel || "").replace('$', '')}
            onChange={e => {
              const val = e.target.value.replace('$', '');
              onChangeProp && onChangeProp('sduiLabel', val ? '$' + val : undefined);
            }}
          />
        </div>
        <div style={{ fontSize: 9.5, color: 'var(--fg-3)', marginTop: 4, lineHeight: 1.4 }}>
          {lang === 'tr' ? 'Promptta bu bileşenleri hedeflemek için kullanılır.' : 'Use this to target these components in prompts.'}
        </div>
      </div>

      <AttrSection title={t(lang,"layout")}>
        <AttrRow label={t(lang,"width")}>
          <div className="seg" style={{ height: 26, width: '100%' }}>
            <button className="on" style={{ height: 20, flex: 1, justifyContent: 'center' }}>{t(lang,"fill")}</button>
            <button style={{ height: 20, flex: 1, justifyContent: 'center' }}>{t(lang,"auto")}</button>
            <button style={{ height: 20, flex: 1, justifyContent: 'center' }}>{t(lang,"fixed")}</button>
          </div>
        </AttrRow>
        {!isMulti && <AttrRow label={t(lang,"height")}><NumInput value={p.height || 64} onChange={v => onChangeProp && onChangeProp('height', v)}/></AttrRow>}
        <AttrRow label={t(lang,"padding")}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
            <NumInput value={p.padX || 16} onChange={v => onChangeProp && onChangeProp('padX', v)}/>
            <NumInput value={p.padY || 12} onChange={v => onChangeProp && onChangeProp('padY', v)}/>
          </div>
        </AttrRow>
      </AttrSection>

      {!isMulti && selection.type === 'Text' && (
        <AttrSection title={t(lang,"typography")}>
          <AttrRow label={t(lang,"fontSize")}><NumInput value={p.fontSize || 16} onChange={v => onChangeProp && onChangeProp('fontSize', v)}/></AttrRow>
          <AttrRow label={t(lang,"fontWeight")}>
            <select className="select" style={{ height: 26, fontSize: 11, width: '100%', textOverflow: 'ellipsis' }} value={p.fontWeight || "600"} onChange={e => onChangeProp && onChangeProp('fontWeight', e.target.value)}>
              <option value="400">Regular · 400</option>
              <option value="500">Medium · 500</option>
              <option value="600">Semibold · 600</option>
              <option value="700">Bold · 700</option>
            </select>
          </AttrRow>
          <AttrRow label={t(lang,"color")}><ColorRow value={p.color || "#0F1115"} onChange={v => onChangeProp && onChangeProp('color', v)}/></AttrRow>
        </AttrSection>
      )}

      <AttrSection title={t(lang,"appearance")}>
        <AttrRow label={t(lang,"background")}><ColorRow value={p.backgroundColor || p.bg || (isMulti ? '' : "#FFFFFF")} onChange={v => onChangeProp && onChangeProp('backgroundColor', v)}/></AttrRow>
        {!isMulti && <AttrRow label={t(lang,"radius")}><NumInput value={p.radius || p.borderRadius || 12} onChange={v => onChangeProp && onChangeProp('borderRadius', v)}/></AttrRow>}
        {!isMulti && (
          <AttrRow label={lang==='tr'?'Gölge':'Shadow'}>
            <select className="select" style={{ height: 26, fontSize: 11, width: '100%', textOverflow: 'ellipsis' }} value={p.shadow || "sm"} onChange={e => onChangeProp && onChangeProp('shadow', e.target.value)}>
              <option value="none">None</option>
              <option value="sm">Soft · sm</option>
              <option value="md">Medium · md</option>
              <option value="lg">Elevated · lg</option>
            </select>
          </AttrRow>
        )}
      </AttrSection>

      {!isMulti && (
        <AttrSection title={t(lang,"interactions")} defaultOpen={false}>
          <AttrRow label={t(lang,"onTap")}>
            <select className="select" style={{ height: 26, fontSize: 11, width: '100%', textOverflow: 'ellipsis' }} defaultValue="navigate">
              <option value="none">{t(lang,"none")}</option>
              <option value="navigate">{t(lang,"navigate")}</option>
              <option value="track">{t(lang,"track")}</option>
            </select>
          </AttrRow>
          <AttrRow label={lang==='tr'?'Hedef':'Target'}>
            <input className="input" style={{ height: 26, fontSize: 11, fontFamily: 'var(--font-mono)', width: '100%' }} defaultValue="/product/123"/>
          </AttrRow>
        </AttrSection>
      )}

      <div style={{ padding: 12, borderTop: '1px solid var(--line)', display: 'flex', gap: 6 }}>
        <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onRefine && onRefine()}>
          <Icon name="sparkle" size={11}/> {lang==='tr'?'AI ile İyileştir':'Refine with AI'}
        </button>
      </div>
    </div>
  );
}

/* =================== MINIMAP =================== */
function Minimap({ tree, selectedPath }) {
  // Render tree as little stacked blocks
  const flat = [];
  const walk = (n, d = 0, idx = []) => {
    flat.push({ type: n.type, depth: d, path: [...idx, n.id] });
    n.children?.forEach((c, i) => walk(c, d+1, [...idx, n.id]));
  };
  tree?.forEach((n, i) => walk(n, 0, []));
  return (
    <div style={{ background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 8, padding: 8, fontSize: 10, color: 'var(--fg-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, fontSize: 9.5 }}>Minimap</span>
        <Icon name="grid" size={10}/>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {flat.map((n, i) => {
          const sel = selectedPath && selectedPath.join('/') === n.path.join('/');
          return (
            <div key={i} style={{
              height: 4,
              marginLeft: n.depth * 6,
              background: sel ? 'var(--brand)' : 'var(--line-strong)',
              borderRadius: 2,
              opacity: sel ? 1 : 0.6,
              width: `${Math.max(20, 90 - n.depth * 8)}%`
            }}/>
          );
        })}
      </div>
    </div>
  );
}

window.SDUI = { TopBar, FilesPane, FileRow, TreePane, CanvasPane, AttributesPane, Minimap, t, Icon };
