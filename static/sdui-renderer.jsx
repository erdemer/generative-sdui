/* SDUI Studio — SDUI JSON renderer: computeSDUIStyle + SDUINode + SDUIRenderer */

function computeSDUIStyle(node, p) {
  const s = {};
  const type = node.type;

  // Container layout
  if (type === 'Column' || type === 'LazyColumn') {
    s.display = 'flex'; s.flexDirection = 'column';
  } else if (type === 'Row' || type === 'LazyRow') {
    s.display = 'flex'; s.flexDirection = 'row'; s.flexWrap = 'nowrap';
  } else if (type === 'Card') {
    s.display = 'flex'; s.flexDirection = 'column'; s.overflow = 'hidden';
    const cardBg = p.backgroundColor || '#ffffff';
    if (cardBg.includes('gradient')) s.background = cardBg; else s.backgroundColor = cardBg;
    s.borderRadius = (p.corner ?? p.cornerRadius ?? 12) + 'px';
    if (!p.elevation) s.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
  } else if (type === 'Box') {
    s.position = 'relative';
  } else if (type === 'BottomBar') {
    s.display = 'flex'; s.flexDirection = 'row';
    s.position = 'sticky'; s.bottom = 0; s.left = 0; s.right = 0;
    s.width = '100%'; s.zIndex = 100; s.flexShrink = 0;
    s.backgroundColor = p.backgroundColor || '#ffffff';
  } else if (type === 'BottomSheet') {
    s.display = 'flex'; s.flexDirection = 'column';
    s.position = 'absolute'; s.bottom = 0; s.left = 0; s.right = 0;
    s.borderRadius = '20px 20px 0 0';
    if (!p.backgroundColor) s.backgroundColor = '#ffffff';
  }

  // Size
  if (p.fillMaxSize === 'true' || p.fillMaxSize === true) { s.width = '100%'; s.flex = '1'; s.minHeight = 0; s.alignSelf = 'stretch'; }
  if (p.fillWidth === 'true' || p.fillWidth === true) s.width = '100%';
  else if (p.width != null) s.width = typeof p.width === 'number' ? p.width + 'px' : p.width;
  if (p.weight != null) { s.flex = String(p.weight); s.minWidth = 0; s.minHeight = 0; }
  if (p.fillHeight === 'true' || p.fillHeight === true) s.flex = '1';
  else if (p.height != null) s.height = typeof p.height === 'number' ? p.height + 'px' : p.height;
  if (p.minHeight != null) s.minHeight = p.minHeight + 'px';
  if (p.maxHeight != null) s.maxHeight = p.maxHeight + 'px';

  // Colors
  if (p.backgroundColor && type !== 'Card') {
    if (p.backgroundColor.includes('gradient')) s.background = p.backgroundColor;
    else s.backgroundColor = p.backgroundColor;
  }
  if (p.color) s.color = p.color;

  // Padding — integer or "t, r, b, l" string
  const toPx = (v) => {
    if (v == null) return undefined;
    const str = String(v).trim();
    return /^\d+(\.\d+)?$/.test(str) ? str + 'px' : str;
  };
  const parsePadding = (v) => {
    if (v == null) return undefined;
    if (typeof v === 'number') return v + 'px';
    const parts = String(v).split(',').map(x => x.trim());
    return parts.map(x => (/^\d+$/.test(x) ? x + 'px' : x)).join(' ');
  };
  if (p.padding != null) s.padding = parsePadding(p.padding);
  if (p.horizontalPadding != null) { s.paddingLeft = toPx(p.horizontalPadding); s.paddingRight = toPx(p.horizontalPadding); }
  if (p.verticalPadding != null) { s.paddingTop = toPx(p.verticalPadding); s.paddingBottom = toPx(p.verticalPadding); }
  if (p.paddingTop != null) s.paddingTop = toPx(p.paddingTop);
  if (p.paddingBottom != null) s.paddingBottom = toPx(p.paddingBottom);
  if (p.paddingStart != null) s.paddingLeft = toPx(p.paddingStart);
  if (p.paddingEnd != null) s.paddingRight = toPx(p.paddingEnd);
  if (p.paddingLeft != null) s.paddingLeft = toPx(p.paddingLeft);
  if (p.paddingRight != null) s.paddingRight = toPx(p.paddingRight);

  // Margin
  if (p.margin != null) s.margin = toPx(p.margin);
  if (p.marginTop != null) s.marginTop = toPx(p.marginTop);
  if (p.marginBottom != null) s.marginBottom = toPx(p.marginBottom);
  if (p.marginStart != null) s.marginLeft = toPx(p.marginStart);
  if (p.marginEnd != null) s.marginRight = toPx(p.marginEnd);
  if (p.marginLeft != null) s.marginLeft = toPx(p.marginLeft);
  if (p.marginRight != null) s.marginRight = toPx(p.marginRight);

  // Border radius
  const radius = p.corner ?? p.cornerRadius;
  if (radius != null && type !== 'Card') s.borderRadius = radius + 'px';

  // Typography
  if (type === 'Text' && p.style) {
    const ts = { h1: ['24px','700'], h2: ['20px','700'], h3: ['17px','600'], body: ['14px','400'], caption: ['12px','400'] };
    const [fs, fw] = ts[p.style] || [];
    if (fs && !p.fontSize) s.fontSize = fs;
    if (fw && !p.fontWeight) s.fontWeight = fw;
  }
  if (p.fontSize != null) s.fontSize = p.fontSize + 'px';
  if (p.fontWeight === 'bold') s.fontWeight = '700';
  else if (p.fontWeight === 'semibold') s.fontWeight = '600';
  else if (p.fontWeight === 'medium') s.fontWeight = '500';
  else if (p.fontWeight === 'normal') s.fontWeight = '400';
  else if (p.fontWeight) s.fontWeight = p.fontWeight;
  if (p.textAlign) s.textAlign = p.textAlign;
  if (p.lineHeight) s.lineHeight = p.lineHeight;
  if (p.letterSpacing) s.letterSpacing = p.letterSpacing;

  // Column arrangement
  if (type === 'Column' || type === 'LazyColumn') {
    const va = p.verticalArrangement;
    if (va === 'center') s.justifyContent = 'center';
    else if (va === 'bottom') s.justifyContent = 'flex-end';
    else if (va === 'spacebetween') s.justifyContent = 'space-between';
    else if (va === 'spaceevenly') s.justifyContent = 'space-evenly';
    else if (va === 'spacearound') s.justifyContent = 'space-around';
    else if (va?.startsWith('spacedby:')) s.gap = va.split(':')[1].trim() + 'px';
    const ha = p.horizontalAlignment;
    if (ha === 'center') s.alignItems = 'center';
    else if (ha === 'end') s.alignItems = 'flex-end';
  }

  // Row / BottomBar arrangement
  if (type === 'Row' || type === 'BottomBar' || type === 'LazyRow') {
    const ha = p.horizontalArrangement;
    if (ha === 'center') s.justifyContent = 'center';
    else if (ha === 'end') s.justifyContent = 'flex-end';
    else if (ha === 'start' || ha === 'starts') s.justifyContent = 'flex-start';
    else if (ha === 'spacebetween') s.justifyContent = 'space-between';
    else if (ha === 'spaceevenly') s.justifyContent = 'space-evenly';
    else if (ha === 'spacearound') s.justifyContent = 'space-around';
    else if (ha?.startsWith('spacedby:')) { s.gap = ha.split(':')[1].trim() + 'px'; s.flexWrap = 'nowrap'; }
    const va = p.verticalAlignment;
    if (va === 'center') s.alignItems = 'center';
    else if (va === 'bottom') s.alignItems = 'flex-end';
    else if (va === 'top') s.alignItems = 'flex-start';
  }

  // Elevation
  if (p.elevation != null) {
    const e = parseInt(p.elevation);
    if (e > 0) s.boxShadow = `0 ${Math.floor(e / 2) + 2}px ${e * 3}px rgba(0,0,0,${Math.min(0.25, 0.05 + e * 0.015)})`;
  }

  // Image
  if (type === 'Image') {
    s.objectFit = p.contentScale === 'fit' ? 'contain' : 'cover';
    if (!p.width) s.width = '100%';
    s.display = 'block';
  }

  // Spacer
  if (type === 'Spacer') {
    if (s.flex == null && s.height == null) s.flex = '1';
  }

  // Scroll
  if (p.scroll === 'true' || p.scroll === true) {
    s.overflow = 'auto';
    s.WebkitOverflowScrolling = 'touch';
    s.minHeight = 0;
    s.flexShrink = 1;
  }

  // Border
  if (p.borderWidth != null && p.borderColor) {
    s.border = `${p.borderWidth}px solid ${p.borderColor}`;
  }

  if (p.alpha != null) s.opacity = p.alpha;

  return s;
}

function SDUINode({ node, selectedIds, onSelectId }) {
  if (!node) return null;
  const p = node.props || {};
  const isSelected = selectedIds && selectedIds.includes(node._id);
  const baseStyle = computeSDUIStyle(node, p);
  const selStyle = isSelected
    ? { outline: '2px solid var(--brand)', outlineOffset: 1, position: 'relative', zIndex: 1 }
    : {};
  const style = { ...baseStyle, ...selStyle };

  const onClick = (e) => { e.stopPropagation(); onSelectId && onSelectId(node._id, e.shiftKey || e.metaKey); };

  const children = (node.children || []).map((c, i) => (
    <SDUINode key={i} node={c} selectedIds={selectedIds} onSelectId={onSelectId}/>
  ));

  const handleAction = (e) => {
    if (!p.onClick) return;
    e.stopPropagation();
    const a = p.onClick;
    if (a.type === 'toast' || a.type === 'alert') {
      const msg = a.message || a.destination || '';
      if (msg) {
        const el = document.createElement('div');
        el.textContent = msg;
        Object.assign(el.style, { position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', background:'#1a1a1a', color:'#fff', padding:'8px 16px', borderRadius:'8px', fontSize:'13px', zIndex:9999, pointerEvents:'none', transition:'opacity 0.4s' });
        document.body.appendChild(el);
        setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 400); }, 2000);
      }
    }
  };
  const combinedClick = (e) => { handleAction(e); onClick(e); };

  switch (node.type) {
    case 'Text':
      return <div onClick={combinedClick} style={{ ...style, cursor: p.onClick ? 'pointer' : undefined }}>{p.text || ''}</div>;

    case 'Image': {
      const seed = node._id || 42;
      const onErr = (e) => { if (!e.target.dataset.fb) { e.target.dataset.fb = '1'; e.target.src = `https://picsum.photos/seed/${seed}/400/300`; } };
      return <img onClick={combinedClick} style={style} src={p.url || ''} alt={p.contentDescription || ''} onError={onErr}/>;
    }

    case 'Button': {
      const bs = { ...style, display:'flex', alignItems:'center', justifyContent: p.textAlign === 'start' ? 'flex-start' : p.textAlign === 'end' ? 'flex-end' : 'center', cursor:'pointer', userSelect:'none', border:0, fontFamily:'inherit', fontWeight: style.fontWeight || '600', padding: style.padding || '10px 20px', borderRadius: style.borderRadius || '8px' };
      return <div onClick={combinedClick} style={bs}>{p.text || ''}</div>;
    }

    case 'Icon': {
      const is = { ...style, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor: p.onClick ? 'pointer' : undefined };
      if (p.size) is.fontSize = p.size + 'px';
      if (p.color) is.color = p.color;
      return <span onClick={combinedClick} style={is} className="material-icons" aria-hidden="true">{p.name || 'help_outline'}</span>;
    }

    case 'Card':
      return <div onClick={combinedClick} style={{ ...style, cursor: p.onClick ? 'pointer' : undefined }}>{children}</div>;

    case 'BottomBar':
      return <div onClick={onClick} style={style}>{children}</div>;

    case 'HorizontalDivider':
    case 'Divider':
      return <div style={{ width:'100%', height: (p.thickness ?? 1) + 'px', backgroundColor: p.color || 'rgba(0,0,0,0.08)', flexShrink:0 }}/>;

    case 'LazyColumn':
    case 'Column':
    case 'LazyRow':
    case 'Row':
    case 'Box':
    case 'BottomSheet':
    default:
      return <div onClick={onClick} style={style}>{children}</div>;
  }
}

function SDUIRenderer({ layout, selectedIds, onSelectId }) {
  if (!layout) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:10, color:'var(--fg-3)', fontSize:12, textAlign:'center', padding:24 }}>
      <span style={{ fontSize:24, opacity:0.3 }}>✦</span>
      <span>{window.I18N?.tr?.selectComponent || 'No layout'}</span>
    </div>
  );
  return (
    <div className="sdui-device-content">
      <SDUINode node={layout} selectedIds={selectedIds} onSelectId={onSelectId}/>
    </div>
  );
}
