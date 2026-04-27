/* SDUI Studio — Mock content for the device screen previews */

const { useState: useS2, useEffect: useE2 } = React;

/* ============ EMPTY DEVICE — initial canvas state ============ */
function MockEmptyScreen({ lang }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: 24,
      background: 'oklch(0.985 0.002 250)',
      color: 'oklch(0.45 0.005 250)',
      textAlign: 'center'
    }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: 'oklch(0.94 0.005 250)', display: 'grid', placeItems: 'center' }}>
        <Icon name="sparkle" size={26} stroke={1.4}/>
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'oklch(0.25 0.005 250)' }}>
        {lang==='tr'?'Ekran boş':'Empty screen'}
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.55, maxWidth: 220 }}>
        {lang==='tr'
          ? 'Sol panelden bir prompt yaz ya da görsel yükle. AI tasarımı buraya akıtacak.'
          : 'Write a prompt on the left or drop an image. AI will stream the design here.'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 11, color: 'oklch(0.55 0.005 250)' }}>
        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'oklch(0.94 0.005 250)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>⌘</span>
        <span style={{ padding: '2px 6px', borderRadius: 4, background: 'oklch(0.94 0.005 250)', fontFamily: 'var(--font-mono)', fontSize: 10 }}>↵</span>
        <span>{lang==='tr'?'üretmek için':'to generate'}</span>
      </div>
    </div>
  );
}

/* ============ STREAMING — AI generating ============ */
const TOTAL = 12;

function MockStreamingScreen({ lang }) {
  const [count, setCount] = useS2(1);

  useE2(() => {
    setCount(1);
    let current = 1;
    let timer;
    const tick = () => {
      if (current >= TOTAL - 1) return; // dur at 11, never show 12/12
      current += 1;
      setCount(current);
      const delay = 400 + current * 180; // 580ms → 2360ms giderek yavaşlar
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  const label = lang === 'tr'
    ? `AI tasarımı üretiyor… ${count} / ${TOTAL} bileşen`
    : `AI generating… ${count} / ${TOTAL} components`;

  return (
    <div style={{ width: '100%', height: '100%', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid oklch(0.94 0.005 250)' }}>
        <div className="m-skeleton" style={{ width: 80, height: 14 }}/>
        <div className="m-skeleton" style={{ width: 28, height: 28, borderRadius: 14 }}/>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
        <div className="m-skeleton" style={{ width: '100%', height: 140, borderRadius: 12 }}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="m-skeleton" style={{ width: '70%', height: 16 }}/>
          <div className="m-skeleton" style={{ width: '90%', height: 12 }}/>
          <div className="m-skeleton" style={{ width: '50%', height: 12 }}/>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="m-skeleton" style={{ flex: 1, height: 80, borderRadius: 10 }}/>
          <div className="m-skeleton" style={{ flex: 1, height: 80, borderRadius: 10 }}/>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, padding: '10px 12px', background: 'oklch(0.18 0.006 250)', borderRadius: 10, color: '#fff', fontSize: 11, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="spinner" style={{ borderColor: 'oklch(1 0 0 / 0.2)', borderTopColor: '#fff' }}/>
        <span style={{ flex: 1 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', opacity: 0.6, fontSize: 10 }}>{count}/{TOTAL}</span>
      </div>
    </div>
  );
}

/* ============ PRODUCT CARD — fully rendered SDUI screen ============ */
function MockProductScreen({ lang, selectedPath }) {
  const isSel = (id) => selectedPath && selectedPath[selectedPath.length-1] === id;
  const sel = (id, child) => (
    <div data-id={id} style={{ position: 'relative', borderRadius: 'inherit', outline: isSel(id) ? '2px solid var(--brand)' : 'none', outlineOffset: 1 }}>
      {isSel(id) && <span style={{ position: 'absolute', top: -16, left: 0, fontSize: 9, fontFamily: 'var(--font-mono)', background: 'var(--brand)', color: '#fff', padding: '1px 5px', borderRadius: 3, zIndex: 5 }}>{id}</span>}
      {child}
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', background: 'oklch(0.97 0.005 250)', overflow: 'hidden', position: 'relative', fontFamily: 'var(--font-sans)', color: '#0F1115' }}>
      {/* status bar */}
      <div style={{ height: 36, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 4 }}>
          <span>􀙇</span><span>􀛨</span>
        </span>
      </div>

      {/* nav */}
      {sel("nav", (
        <div style={{ height: 44, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 10, display: 'grid', placeItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F1115" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{lang==='tr'?'Ürün':'Product'}</div>
          <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 10, display: 'grid', placeItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F1115" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, background: 'oklch(0.58 0.20 25)', borderRadius: 7, color: '#fff', fontSize: 9, fontWeight: 700, display: 'grid', placeItems: 'center' }}>2</span>
          </div>
        </div>
      ))}

      {/* hero image */}
      {sel("hero", (
        <div style={{ margin: '8px 16px 0', height: 200, borderRadius: 16, background: 'linear-gradient(135deg, oklch(0.78 0.10 25), oklch(0.68 0.14 25))', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 70% 30%, oklch(0.92 0.08 25 / 0.5), transparent 60%)' }}/>
          <div style={{ position: 'absolute', bottom: 12, left: 12, padding: '4px 8px', background: 'rgba(255,255,255,0.85)', borderRadius: 999, fontSize: 10, fontWeight: 600, backdropFilter: 'blur(8px)' }}>
            {lang==='tr'?'Yeni':'New'}
          </div>
          <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 4 }}>
            {[0,1,2].map(i => <span key={i} style={{ width: i===0?16:6, height: 6, borderRadius: 3, background: i===0?'#fff':'rgba(255,255,255,0.5)' }}/>)}
          </div>
        </div>
      ))}

      {/* title block */}
      {sel("title", (
        <div style={{ padding: '16px 16px 0' }}>
          <div style={{ fontSize: 11, color: 'oklch(0.55 0.005 250)', marginBottom: 4, fontWeight: 500 }}>{lang==='tr'?'Yeni Sezon':'New Season'}</div>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            {lang==='tr'?'Premium Hava Spor Ayakkabı':'Premium Air Sport Sneaker'}
          </div>
        </div>
      ))}

      {/* price + rating row */}
      {sel("priceRow", (
        <div style={{ padding: '10px 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{lang==='tr'?'2.499 ₺':'$249'}</span>
            <span style={{ fontSize: 12, color: 'oklch(0.55 0.005 250)', textDecoration: 'line-through' }}>{lang==='tr'?'2.999 ₺':'$299'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'oklch(0.35 0.005 250)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="oklch(0.75 0.14 75)" stroke="none"><path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/></svg>
            <b>4.8</b><span style={{ color: 'oklch(0.55 0.005 250)' }}>(312)</span>
          </div>
        </div>
      ))}

      {/* spec chips */}
      {sel("specs", (
        <div style={{ padding: '12px 16px 0', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {(lang==='tr' ? ['Beden 42','Beyaz','Hızlı Kargo'] : ['Size 42','White','Fast ship']).map((c, i) => (
            <span key={i} style={{ padding: '6px 10px', background: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 500, border: '1px solid oklch(0.92 0.005 250)' }}>{c}</span>
          ))}
        </div>
      ))}

      {/* CTA — selected sample */}
      {sel("cta", (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 20px', background: 'linear-gradient(to top, #fff 60%, transparent)', display: 'flex', gap: 8 }}>
          <button style={{ width: 44, height: 44, background: '#fff', borderRadius: 12, border: '1px solid oklch(0.92 0.005 250)', display: 'grid', placeItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F1115" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button style={{ flex: 1, height: 44, background: '#0F1115', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {lang==='tr'?'Sepete Ekle · 2.499 ₺':'Add to cart · $249'}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============ B variant — different layout ============ */
function MockProductScreenB({ lang }) {
  return (
    <div style={{ width: '100%', height: '100%', background: '#0F1115', overflow: 'hidden', position: 'relative', color: '#fff' }}>
      <div style={{ height: 36, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, color: '#fff' }}>
        <span>9:41</span><span>􀛨</span>
      </div>
      <div style={{ height: 280, background: 'linear-gradient(180deg, oklch(0.42 0.18 25), oklch(0.20 0.05 25))', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 10, display: 'grid', placeItems: 'center', backdropFilter: 'blur(10px)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 16, left: 16, fontSize: 11, fontWeight: 600, opacity: 0.8 }}>
          {lang==='tr'?'YENİ SEZON':'NEW SEASON'}
        </div>
      </div>
      <div style={{ padding: '20px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          {lang==='tr'?'Premium Hava Spor Ayakkabı':'Premium Air Sport Sneaker'}
        </div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5 }}>
          {lang==='tr'?'Hafif yapı, premium deri ve hava destekli taban.':'Lightweight build, premium leather and air-cushion sole.'}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px 24px', background: 'rgba(15,17,21,0.95)', display: 'flex', gap: 10, alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{lang==='tr'?'Fiyat':'Price'}</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{lang==='tr'?'2.499 ₺':'$249'}</div>
        </div>
        <button style={{ flex: 1, height: 48, background: 'oklch(0.66 0.21 25)', borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 600, border: 0 }}>
          {lang==='tr'?'Sepete Ekle':'Add to cart'}
        </button>
      </div>
    </div>
  );
}

window.SDUIMocks = { MockEmptyScreen, MockStreamingScreen, MockProductScreen, MockProductScreenB };
