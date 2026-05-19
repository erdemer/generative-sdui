/* SDUI Studio — Personalization Data Flow Canvas */

const { useState, useEffect, useRef, useCallback } = React;

const NODE_WIDTH = 240;
const PORT_R = 7;
const PORT_OFFSET_Y = 24; // port center y from top of node

/* ── Mock Data ─────────────────────────────────────────────────────────────── */
const MOCK_DATA = {
  user_profile: {
    name: 'Ayşe Kaya',
    segment: 'Premium',
    city: 'İstanbul',
    age: 32,
    interests: ['Teknoloji', 'Moda', 'Kahve'],
    loyaltyTier: 'Gold',
    loyaltyPoints: 4250,
    lastPurchase: '15 May 2026',
    monthlySpend: '₺1.200',
  },
  product_catalog: {
    recommended: [
      { name: 'iPhone 16 Pro', price: '₺89.999', rating: 4.9, badge: 'Çok Satan' },
      { name: 'AirPods Pro 2', price: '₺12.999', rating: 4.7, badge: null },
      { name: 'MacBook Air M4', price: '₺54.999', rating: 4.8, badge: 'Yeni' },
      { name: 'Apple Watch S10', price: '₺29.999', rating: 4.6, badge: null },
    ],
  },
  campaigns: {
    active: [
      { title: 'Gold Üye Özel', desc: 'Teknoloji ürünlerinde %20 indirim', expires: '31 May' },
      { title: 'Çift Puan Haftası', desc: 'Alışverişlerde çift sadakat puanı', expires: '25 May' },
      { title: 'Ücretsiz Kargo', desc: '₺500 üzeri siparişlerde geçerli', expires: null },
    ],
  },
  transactions: {
    recent: [
      { date: '15 May', product: 'AirPods 4', amount: '₺8.999', points: '+90 puan' },
      { date: '2 May', product: 'iPhone Kılıfı', amount: '₺499', points: '+5 puan' },
      { date: '28 Nis', product: 'Watch Band', amount: '₺1.299', points: '+13 puan' },
    ],
  },
  loyalty: {
    tier: 'Gold',
    points: 4250,
    nextTier: 'Platinum',
    toNextTier: 750,
    benefits: ['%20 Teknoloji İndirimi', 'Öncelikli Destek', 'Ücretsiz İade'],
    expiring: '500 puan 30 Haziran\'da sona eriyor',
  },
};

/* ── Node type configs ─────────────────────────────────────────────────────── */
const NODE_TYPES = {
  user_profile:    { label: 'Kullanıcı Profili',   icon: 'person',        color: '#7C3AED', isSource: true },
  product_catalog: { label: 'Ürün Kataloğu',       icon: 'inventory_2',   color: '#0891B2', isSource: true },
  campaigns:       { label: 'Kampanyalar',          icon: 'local_offer',   color: '#D97706', isSource: true },
  transactions:    { label: 'İşlem Geçmişi',       icon: 'receipt_long',  color: '#059669', isSource: true },
  loyalty:         { label: 'Sadakat & Puanlar',   icon: 'stars',         color: '#DC2626', isSource: true },
  ai_generator:    { label: 'AI Ekran Üreticisi',  icon: 'auto_awesome',  color: '#E11D48', isSource: false },
};

/* ── Default canvas state ──────────────────────────────────────────────────── */
const DEFAULT_NODES = [
  { id: 'user_profile_1',    type: 'user_profile',    position: { x: 60,  y: 55  } },
  { id: 'product_catalog_1', type: 'product_catalog', position: { x: 60,  y: 215 } },
  { id: 'campaigns_1',       type: 'campaigns',       position: { x: 60,  y: 375 } },
  { id: 'ai_generator_1',    type: 'ai_generator',    position: { x: 420, y: 210 } },
];

const DEFAULT_EDGES = [
  { id: 'e1', from: 'user_profile_1',    to: 'ai_generator_1' },
  { id: 'e2', from: 'product_catalog_1', to: 'ai_generator_1' },
  { id: 'e3', from: 'campaigns_1',       to: 'ai_generator_1' },
];

/* ── Geometry helpers ──────────────────────────────────────────────────────── */
function getPortPos(node, portType) {
  if (portType === 'output') return { x: node.position.x + NODE_WIDTH, y: node.position.y + PORT_OFFSET_Y };
  return { x: node.position.x, y: node.position.y + PORT_OFFSET_Y };
}

function bezierPath(x1, y1, x2, y2) {
  const cx = Math.max(60, Math.abs(x2 - x1) * 0.5);
  return `M ${x1} ${y1} C ${x1 + cx} ${y1}, ${x2 - cx} ${y2}, ${x2} ${y2}`;
}

/* ── GridBg ────────────────────────────────────────────────────────────────── */
function GridBg({ offset }) {
  const sp = 28;
  const ox = ((offset.x % sp) + sp) % sp;
  const oy = ((offset.y % sp) + sp) % sp;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <defs>
        <pattern id="df-grid" x={ox} y={oy} width={sp} height={sp} patternUnits="userSpaceOnUse">
          <circle cx={sp / 2} cy={sp / 2} r={1} fill="rgba(255,255,255,0.07)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#df-grid)" />
    </svg>
  );
}

/* ── EdgeLine ──────────────────────────────────────────────────────────────── */
function EdgeLine({ edge, nodes, onDelete }) {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode   = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;
  const p1  = getPortPos(fromNode, 'output');
  const p2  = getPortPos(toNode, 'input');
  const cfg = NODE_TYPES[fromNode.type];
  const d   = bezierPath(p1.x, p1.y, p2.x, p2.y);
  return (
    <g style={{ cursor: 'pointer' }} onClick={() => onDelete(edge.id)}>
      {/* Wide invisible hit area */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={12} />
      <path d={d} fill="none" stroke={cfg?.color || '#888'} strokeWidth={2} strokeOpacity={0.75} />
    </g>
  );
}

/* ── PendingEdgeLine ───────────────────────────────────────────────────────── */
function PendingEdgeLine({ fromNode, toPos }) {
  if (!fromNode) return null;
  const p1 = getPortPos(fromNode, 'output');
  return (
    <path
      d={bezierPath(p1.x, p1.y, toPos.x, toPos.y)}
      fill="none" stroke="white" strokeWidth={1.5}
      strokeOpacity={0.5} strokeDasharray="6,4"
      style={{ pointerEvents: 'none' }}
    />
  );
}

/* ── Data Preview (in node body) ───────────────────────────────────────────── */
function DataPreview({ nodeType }) {
  const data = MOCK_DATA[nodeType];
  if (!data) return null;

  if (nodeType === 'user_profile') return (
    <div>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>{data.name}</div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6, flexWrap: 'wrap' }}>
        <Tag color="#7C3AED">{data.loyaltyTier}</Tag>
        <Tag color="#0891B2">{data.segment}</Tag>
        <Tag color="#444">{data.city}</Tag>
      </div>
      <KV k="İlgi" v={data.interests.join(', ')} />
      <KV k="Puan" v={`${data.loyaltyPoints} · ${data.monthlySpend}/ay`} />
    </div>
  );

  if (nodeType === 'product_catalog') return (
    <div>
      {data.recommended.slice(0, 3).map((p, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
          <span style={{ color: '#ccc' }}>{p.name}</span>
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>{p.price}</span>
        </div>
      ))}
      <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>+{data.recommended.length - 3} ürün daha</div>
    </div>
  );

  if (nodeType === 'campaigns') return (
    <div>
      {data.active.slice(0, 2).map((c, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <div style={{ color: '#fbbf24', fontSize: 11, fontWeight: 600 }}>{c.title}</div>
          <div style={{ color: '#666', fontSize: 10 }}>{c.desc}</div>
        </div>
      ))}
    </div>
  );

  if (nodeType === 'transactions') return (
    <div>
      {data.recent.map((t, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 11 }}>
          <span style={{ color: '#ccc' }}>{t.product}</span>
          <span style={{ color: '#4ade80', fontWeight: 600 }}>{t.amount}</span>
        </div>
      ))}
    </div>
  );

  if (nodeType === 'loyalty') return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{ color: '#fbbf24', fontSize: 20, fontWeight: 800 }}>{data.points}</span>
        <span style={{ color: '#666', fontSize: 10 }}>puan</span>
        <Tag color="#DC2626">{data.tier}</Tag>
      </div>
      <KV k="Sonraki" v={`${data.toNextTier} puan → ${data.nextTier}`} />
      <div style={{ fontSize: 10, color: '#f87171', marginTop: 4 }}>⚠ {data.expiring}</div>
    </div>
  );

  return null;
}

function Tag({ color, children }) {
  return (
    <span style={{
      background: `${color}22`, border: `1px solid ${color}44`,
      color: color === '#444' ? '#888' : color,
      borderRadius: 4, padding: '1px 6px', fontSize: 10, fontWeight: 600,
    }}>{children}</span>
  );
}
function KV({ k, v }) {
  return (
    <div style={{ fontSize: 10, color: '#777', marginTop: 3 }}>
      <span style={{ color: '#555' }}>{k}: </span>{v}
    </div>
  );
}

/* ── FlowNode ──────────────────────────────────────────────────────────────── */
function FlowNode({ node, selected, onSelect, onMouseDown, onOutputPortClick, onInputPortClick, isPending }) {
  const cfg = NODE_TYPES[node.type];
  if (!cfg) return null;
  const isTarget = isPending && !cfg.isSource;

  return (
    <div
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: NODE_WIDTH,
        background: '#111126',
        border: `2px solid ${selected ? cfg.color : (isTarget ? '#ffffff55' : '#252545')}`,
        borderRadius: 12,
        boxShadow: selected
          ? `0 0 0 3px ${cfg.color}33, 0 8px 28px rgba(0,0,0,0.6)`
          : '0 4px 18px rgba(0,0,0,0.4)',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'border-color 0.12s, box-shadow 0.12s',
      }}
      onMouseDown={e => { e.stopPropagation(); onSelect(node.id); onMouseDown(e, node.id); }}
    >
      {/* Header */}
      <div style={{
        background: cfg.color,
        borderRadius: '10px 10px 0 0',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        minHeight: PORT_OFFSET_Y * 2,
      }}>
        <span className="material-icons" style={{ fontSize: 15, color: 'white' }}>{cfg.icon}</span>
        <span style={{ color: 'white', fontWeight: 700, fontSize: 11, flex: 1, letterSpacing: 0.2 }}>{cfg.label}</span>
        {!cfg.isSource && <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', background: 'rgba(0,0,0,0.2)', borderRadius: 4, padding: '2px 6px' }}>AI</span>}
      </div>

      {/* Body */}
      <div style={{ padding: '10px 12px 12px' }}>
        {cfg.isSource
          ? <DataPreview nodeType={node.type} />
          : <div style={{ color: '#444', fontSize: 11, fontStyle: 'italic', lineHeight: 1.5 }}>
              Veri kaynaklarını sol portuna bağla → AI kişiselleştirilmiş ekran üretir
            </div>
        }
      </div>

      {/* Output port */}
      {cfg.isSource && (
        <PortDot
          side="right"
          color={cfg.color}
          title="Bağlantı ekle"
          onClick={e => { e.stopPropagation(); onOutputPortClick(node.id); }}
          active={false}
        />
      )}

      {/* Input port */}
      {!cfg.isSource && (
        <PortDot
          side="left"
          color={isTarget ? '#fff' : '#333'}
          title="Veri bağlantısını buraya bırak"
          onClick={e => { e.stopPropagation(); onInputPortClick(node.id); }}
          active={isTarget}
          pulse={isTarget}
        />
      )}
    </div>
  );
}

function PortDot({ side, color, title, onClick, active, pulse }) {
  const pos = side === 'right'
    ? { right: -PORT_R, left: 'auto' }
    : { left: -PORT_R, right: 'auto' };
  return (
    <div
      title={title}
      onClick={onClick}
      style={{
        position: 'absolute',
        ...pos,
        top: PORT_OFFSET_Y - PORT_R,
        width: PORT_R * 2,
        height: PORT_R * 2,
        borderRadius: '50%',
        background: color,
        border: '2.5px solid #111126',
        cursor: 'crosshair',
        zIndex: 10,
        transition: 'transform 0.12s, background 0.12s',
        animation: pulse ? 'df-pulse 1.2s ease-in-out infinite' : 'none',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.4)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    />
  );
}

/* ── NodeLibrary (left panel) ──────────────────────────────────────────────── */
function NodeLibrary({ onAddNode }) {
  const sources    = Object.entries(NODE_TYPES).filter(([, c]) => c.isSource);
  const processors = Object.entries(NODE_TYPES).filter(([, c]) => !c.isSource);

  return (
    <div style={{ width: 196, borderRight: '1px solid #1a1a38', padding: '14px 10px', background: '#0c0c1e', overflowY: 'auto', flexShrink: 0 }}>
      <SectionLabel>Veri Kaynakları</SectionLabel>
      {sources.map(([type, cfg]) => (
        <LibraryItem key={type} cfg={cfg} onClick={() => onAddNode(type)} />
      ))}

      <div style={{ margin: '18px 0 12px', height: 1, background: '#1a1a38' }} />
      <SectionLabel>İşlemciler</SectionLabel>
      {processors.map(([type, cfg]) => (
        <LibraryItem key={type} cfg={cfg} onClick={() => onAddNode(type)} />
      ))}

      <div style={{ marginTop: 20, padding: 10, background: '#0a0a1a', borderRadius: 8, border: '1px solid #1a1a38' }}>
        <SectionLabel style={{ marginBottom: 6 }}>İpucu</SectionLabel>
        <div style={{ fontSize: 10, color: '#555', lineHeight: 1.6 }}>
          Listedeki öğeye tıkla → tuvale ekle.
          Çıkış portuna tıkla → bağlantı modu → giriş portuna tıkla.
          Bağlantıya tıkla → sil.
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color: '#444', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{children}</div>;
}

function LibraryItem({ cfg, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 10px', borderRadius: 8, marginBottom: 4,
        cursor: 'pointer',
        background: hover ? `${cfg.color}18` : '#111126',
        border: `1px solid ${hover ? cfg.color : '#1e1e42'}`,
        transition: 'all 0.12s',
      }}
    >
      <span className="material-icons" style={{ fontSize: 14, color: cfg.color }}>{cfg.icon}</span>
      <span style={{ fontSize: 11, color: hover ? '#eee' : '#aaa' }}>{cfg.label}</span>
    </div>
  );
}

/* ── NodeInspector (right panel) ───────────────────────────────────────────── */
function NodeInspector({ nodeId, nodes, edges, onDeleteEdge, onDeleteNode }) {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;
  const cfg = NODE_TYPES[node.type];
  if (!cfg) return null;

  const inputEdges  = edges.filter(e => e.to === nodeId);
  const outputEdges = edges.filter(e => e.from === nodeId);
  const inputNodes  = inputEdges.map(e => nodes.find(n => n.id === e.from)).filter(Boolean);
  const data        = MOCK_DATA[node.type];

  return (
    <div style={{ width: 256, borderLeft: '1px solid #1a1a38', background: '#0c0c1e', overflowY: 'auto', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a38', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span className="material-icons" style={{ fontSize: 15, color: 'white' }}>{cfg.icon}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#eee', fontSize: 12, fontWeight: 700 }}>{cfg.label}</div>
          <div style={{ color: '#444', fontSize: 10, marginTop: 1 }}>{cfg.isSource ? 'Mock Veri Kaynağı' : 'AI İşlemcisi'}</div>
        </div>
        <button onClick={() => onDeleteNode(nodeId)} style={{ background: 'none', border: '1px solid #2a2a4e', borderRadius: 6, color: '#555', padding: '3px 8px', cursor: 'pointer', fontSize: 10, flexShrink: 0 }}>Sil</button>
      </div>

      {/* Connections section */}
      {!cfg.isSource && (
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a38' }}>
          <SectionLabel>Bağlı Kaynaklar ({inputNodes.length})</SectionLabel>
          {inputNodes.length === 0
            ? <div style={{ color: '#333', fontSize: 11, fontStyle: 'italic' }}>Henüz bağlantı yok</div>
            : inputNodes.map(n => {
                const nc = NODE_TYPES[n.type];
                const edge = inputEdges.find(e => e.from === n.id);
                return (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: nc?.color, flexShrink: 0 }}/>
                    <span style={{ color: '#bbb', fontSize: 11, flex: 1 }}>{nc?.label}</span>
                    <button onClick={() => onDeleteEdge(edge?.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>×</button>
                  </div>
                );
              })
          }
        </div>
      )}

      {cfg.isSource && outputEdges.length > 0 && (
        <div style={{ padding: '12px 14px', borderBottom: '1px solid #1a1a38' }}>
          <SectionLabel>Bağlantılar</SectionLabel>
          {outputEdges.map(e => {
            const targetNode = nodes.find(n => n.id === e.to);
            const tc = targetNode ? NODE_TYPES[targetNode.type] : null;
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span className="material-icons" style={{ fontSize: 11, color: '#444' }}>arrow_forward</span>
                <span style={{ color: '#bbb', fontSize: 11, flex: 1 }}>{tc?.label}</span>
                <button onClick={() => onDeleteEdge(e.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 2px' }}>×</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Full data view */}
      {data && (
        <div style={{ padding: '12px 14px' }}>
          <SectionLabel>Mock Veri</SectionLabel>
          <FullDataView data={data} />
        </div>
      )}
    </div>
  );
}

function FullDataView({ data }) {
  const renderVal = (val, depth = 0) => {
    if (Array.isArray(val)) {
      return (
        <div style={{ marginLeft: depth ? 8 : 0 }}>
          {val.map((item, i) => (
            <div key={i} style={{ marginBottom: 6, paddingLeft: 8, borderLeft: '2px solid #1e1e42' }}>
              {typeof item === 'object' && item !== null
                ? Object.entries(item).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                      <span style={{ color: '#444', fontSize: 10, minWidth: 56 }}>{k}</span>
                      <span style={{ color: '#ccc', fontSize: 10 }}>{String(v)}</span>
                    </div>
                  ))
                : <span style={{ color: '#ccc', fontSize: 10 }}>{String(item)}</span>
              }
            </div>
          ))}
        </div>
      );
    }
    return <span style={{ color: '#ccc', fontSize: 10 }}>{String(val)}</span>;
  };

  return (
    <div>
      {Object.entries(data).map(([key, val]) => (
        <div key={key} style={{ marginBottom: 10 }}>
          <div style={{ color: '#555', fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{key}</div>
          {renderVal(val)}
        </div>
      ))}
    </div>
  );
}

/* ── Main DataFlowPage ─────────────────────────────────────────────────────── */
function DataFlowPage({ lang, onBack, onFlowGenerate }) {
  const [nodes,          setNodes         ] = useState(DEFAULT_NODES);
  const [edges,          setEdges         ] = useState(DEFAULT_EDGES);
  const [selected,       setSelected      ] = useState(null);
  const [dragging,       setDragging      ] = useState(null);   // { nodeId, offX, offY }
  const [pendingEdge,    setPendingEdge   ] = useState(null);   // { fromNodeId }
  const [canvasOffset,   setCanvasOffset  ] = useState({ x: 60, y: 60 });
  const [canvasDragging, setCanvasDragging] = useState(null);   // { startX, startY, offX, offY }
  const [mousePos,       setMousePos      ] = useState({ x: 0, y: 0 });
  const [generating,     setGenerating    ] = useState(false);
  const [prompt,         setPrompt        ] = useState('Bağlı kullanıcı profili ve veri kaynaklarına göre kişiselleştirilmiş bir ana ekran oluştur');
  const canvasRef = useRef();

  const toCanvas = useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left - canvasOffset.x, y: e.clientY - rect.top - canvasOffset.y };
  }, [canvasOffset]);

  /* Document-level drag tracking */
  useEffect(() => {
    const onMove = (e) => {
      if (dragging) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = Math.max(0, e.clientX - rect.left - canvasOffset.x - dragging.offX);
        const y = Math.max(0, e.clientY - rect.top  - canvasOffset.y - dragging.offY);
        setNodes(prev => prev.map(n => n.id === dragging.nodeId ? { ...n, position: { x, y } } : n));
      } else if (pendingEdge) {
        setMousePos(toCanvas(e));
      } else if (canvasDragging) {
        setCanvasOffset({
          x: e.clientX - canvasDragging.startX + canvasDragging.offX,
          y: e.clientY - canvasDragging.startY + canvasDragging.offY,
        });
      }
    };
    const onUp = () => { setDragging(null); setCanvasDragging(null); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [dragging, pendingEdge, canvasDragging, canvasOffset, toCanvas]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setPendingEdge(null); setSelected(null); }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selected && !e.target.matches('input, textarea')) {
        handleDeleteNode(selected);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selected]);

  /* ── Handlers ── */
  const handleNodeMouseDown = useCallback((e, nodeId) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDragging({
      nodeId,
      offX: e.clientX - rect.left - canvasOffset.x - node.position.x,
      offY: e.clientY - rect.top  - canvasOffset.y - node.position.y,
    });
  }, [nodes, canvasOffset]);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.currentTarget !== e.target && !e.target.classList.contains('df-canvas-bg')) return;
    if (pendingEdge) { setPendingEdge(null); return; }
    setSelected(null);
    setCanvasDragging({ startX: e.clientX, startY: e.clientY, offX: canvasOffset.x, offY: canvasOffset.y });
  }, [pendingEdge, canvasOffset]);

  const handleOutputPortClick = useCallback((nodeId) => {
    if (pendingEdge) { setPendingEdge(null); return; }
    const node = nodes.find(n => n.id === nodeId);
    if (node) setMousePos(getPortPos(node, 'output'));
    setPendingEdge({ fromNodeId: nodeId });
  }, [pendingEdge, nodes]);

  const handleInputPortClick = useCallback((nodeId) => {
    if (!pendingEdge) return;
    const { fromNodeId } = pendingEdge;
    if (fromNodeId !== nodeId) {
      const exists = edges.find(e => e.from === fromNodeId && e.to === nodeId);
      if (!exists) setEdges(prev => [...prev, { id: `e_${Date.now()}`, from: fromNodeId, to: nodeId }]);
    }
    setPendingEdge(null);
  }, [pendingEdge, edges]);

  const handleAddNode = useCallback((type) => {
    const id   = `${type}_${Date.now()}`;
    const rect = canvasRef.current?.getBoundingClientRect() || { width: 800, height: 600 };
    const x    = Math.max(10, (rect.width  / 2 - canvasOffset.x - NODE_WIDTH / 2) + (Math.random() - 0.5) * 100);
    const y    = Math.max(10, (rect.height / 2 - canvasOffset.y - 60)             + (Math.random() - 0.5) * 100);
    setNodes(prev => [...prev, { id, type, position: { x, y } }]);
    setSelected(id);
  }, [canvasOffset]);

  const handleDeleteEdge = useCallback((edgeId) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  }, []);

  const handleDeleteNode = useCallback((nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.from !== nodeId && e.to !== nodeId));
    setSelected(null);
  }, []);

  const handleAutoLayout = useCallback(() => {
    const sources    = nodes.filter(n => NODE_TYPES[n.type]?.isSource);
    const processors = nodes.filter(n => !NODE_TYPES[n.type]?.isSource);
    const spacing    = 160;
    const startY     = Math.max(0, (400 - sources.length * spacing) / 2);
    const updated = nodes.map(n => {
      const si = sources.findIndex(s => s.id === n.id);
      if (si >= 0) return { ...n, position: { x: 60, y: startY + si * spacing } };
      const pi = processors.findIndex(p => p.id === n.id);
      if (pi >= 0) return { ...n, position: { x: 420, y: startY + pi * spacing + (sources.length * spacing - processors.length * spacing) / 2 } };
      return n;
    });
    setNodes(updated);
    setCanvasOffset({ x: 60, y: 60 });
  }, [nodes]);

  const handleReset = useCallback(() => {
    if (window.confirm('Flow sıfırlansın mı?')) {
      setNodes(DEFAULT_NODES);
      setEdges(DEFAULT_EDGES);
      setSelected(null);
      setCanvasOffset({ x: 60, y: 60 });
    }
  }, []);

  const handleRunFlow = useCallback(async () => {
    const aiNode = nodes.find(n => n.type === 'ai_generator');
    if (!aiNode) { alert('Önce bir "AI Ekran Üreticisi" düğümü ekle (sol panelden)!'); return; }
    const sourceIds = edges.filter(e => e.to === aiNode.id).map(e => e.from);
    if (sourceIds.length === 0) { alert('AI Üretici\'ye en az bir veri kaynağı bağla!'); return; }

    const context = {};
    sourceIds.forEach(nid => {
      const node = nodes.find(n => n.id === nid);
      if (node && MOCK_DATA[node.type]) context[node.type] = MOCK_DATA[node.type];
    });

    setGenerating(true);
    try {
      await onFlowGenerate(context, prompt);
    } finally {
      setGenerating(false);
    }
  }, [nodes, edges, prompt, onFlowGenerate]);

  /* ── Derived ── */
  const fromNode           = pendingEdge ? nodes.find(n => n.id === pendingEdge.fromNodeId) : null;
  const aiNode             = nodes.find(n => n.type === 'ai_generator');
  const connectedSrcCount  = aiNode ? edges.filter(e => e.to === aiNode.id).length : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', background: '#09091a' }}>

      {/* ── Toolbar ── */}
      <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10, background: '#0c0c1e', borderBottom: '1px solid #1a1a38', flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid #252545', borderRadius: 8, color: '#777', padding: '5px 10px', cursor: 'pointer', fontSize: 11, transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#ccc'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#252545'; e.currentTarget.style.color = '#777'; }}
        >
          <span className="material-icons" style={{ fontSize: 13 }}>arrow_back</span> Studio
        </button>

        <div style={{ width: 1, height: 22, background: '#1a1a38' }} />

        <span className="material-icons" style={{ fontSize: 18, color: '#E11D48' }}>device_hub</span>
        <span style={{ color: '#eee', fontWeight: 700, fontSize: 13 }}>Personalization Flow</span>
        <span style={{ fontSize: 10, color: '#E11D4877', background: '#E11D4811', border: '1px solid #E11D4833', borderRadius: 4, padding: '1px 7px' }}>Mock Veri</span>

        <div style={{ flex: 1 }} />

        {/* Prompt input */}
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ekran için prompt…"
          style={{
            flex: '0 1 380px', background: '#111126', border: '1px solid #252545',
            borderRadius: 8, color: '#eee', fontSize: 11, padding: '7px 12px', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = '#E11D48'}
          onBlur={e => e.target.style.borderColor = '#252545'}
        />

        <button onClick={handleAutoLayout} title="Düğümleri otomatik düzenle"
          style={{ background: 'none', border: '1px solid #252545', borderRadius: 8, color: '#666', padding: '6px 10px', cursor: 'pointer', fontSize: 11 }}>
          <span className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle' }}>auto_fix_high</span>
        </button>

        <button onClick={handleReset} title="Flow'u sıfırla"
          style={{ background: 'none', border: '1px solid #252545', borderRadius: 8, color: '#666', padding: '6px 10px', cursor: 'pointer', fontSize: 11 }}>
          <span className="material-icons" style={{ fontSize: 13, verticalAlign: 'middle' }}>restart_alt</span>
        </button>

        <button onClick={handleRunFlow} disabled={generating}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: generating ? '#333' : '#E11D48',
            border: 'none', borderRadius: 8, color: 'white',
            padding: '7px 16px', cursor: generating ? 'not-allowed' : 'pointer',
            fontSize: 12, fontWeight: 700, opacity: generating ? 0.7 : 1, transition: 'all 0.15s',
          }}
        >
          {generating
            ? <><span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'df-spin 0.7s linear infinite', display: 'inline-block' }} /> Üretiliyor…</>
            : <><span className="material-icons" style={{ fontSize: 14 }}>auto_awesome</span> UI Üret ({connectedSrcCount} kaynak)</>
          }
        </button>
      </div>

      {/* ── Main body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <NodeLibrary onAddNode={handleAddNode} />

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="df-canvas-bg"
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            cursor: canvasDragging ? 'grabbing' : (pendingEdge ? 'crosshair' : 'default'),
          }}
          onMouseDown={handleCanvasMouseDown}
        >
          <GridBg offset={canvasOffset} />

          {/* SVG edge layer */}
          <div style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`, position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}>
            <svg style={{ position: 'absolute', overflow: 'visible' }}>
              {edges.map(e => (
                <EdgeLine key={e.id} edge={e} nodes={nodes} onDelete={edgeId => { setEdges(prev => prev.filter(ed => ed.id !== edgeId)); }} />
              ))}
              {fromNode && <PendingEdgeLine fromNode={fromNode} toPos={mousePos} />}
            </svg>
          </div>

          {/* Node layer */}
          <div style={{ transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px)`, position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
            {nodes.map(node => (
              <FlowNode
                key={node.id}
                node={node}
                selected={selected === node.id}
                onSelect={setSelected}
                onMouseDown={handleNodeMouseDown}
                onOutputPortClick={handleOutputPortClick}
                onInputPortClick={handleInputPortClick}
                isPending={!!pendingEdge}
              />
            ))}
          </div>

          {/* Pending edge hint */}
          {pendingEdge && (
            <div style={{
              position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
              background: '#111126cc', border: '1px solid #252545', backdropFilter: 'blur(8px)',
              borderRadius: 8, padding: '5px 14px', color: '#aaa', fontSize: 11, pointerEvents: 'none', zIndex: 20,
            }}>
              AI Üretici'nin giriş portuna tıkla &nbsp;·&nbsp; <kbd style={{ background: '#1e1e42', borderRadius: 3, padding: '1px 5px', fontSize: 10 }}>ESC</kbd> ile iptal
            </div>
          )}

          {/* Empty state hint */}
          {nodes.length === 0 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <div style={{ textAlign: 'center', color: '#333' }}>
                <span className="material-icons" style={{ fontSize: 48, display: 'block', marginBottom: 12 }}>device_hub</span>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Sol panelden düğüm ekle</div>
              </div>
            </div>
          )}
        </div>

        {/* Inspector */}
        {selected && (
          <NodeInspector
            nodeId={selected}
            nodes={nodes}
            edges={edges}
            onDeleteEdge={handleDeleteEdge}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>

      <style>{`
        @keyframes df-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.5); }
          50%       { transform: scale(1.3); box-shadow: 0 0 0 7px rgba(255,255,255,0); }
        }
        @keyframes df-spin { to { transform: rotate(360deg); } }
        .df-canvas-bg { background: #09091a; }
      `}</style>
    </div>
  );
}

window.DataFlowPage = DataFlowPage;
