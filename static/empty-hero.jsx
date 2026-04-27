/* SDUI Studio — EmptyHero: shown when no layout is loaded */

var Icon = window.Icon;

function EmptyHero({ lang, onStart }) {
  const I = window.I18N[lang];
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', maxWidth:480, gap:28, padding:32 }}>
      <div style={{ width:72, height:72, borderRadius:20, background:'var(--bg-elev)', border:'1px solid var(--line)', display:'grid', placeItems:'center', position:'relative', boxShadow:'var(--shadow-md)' }}>
        <Icon name="sparkle" size={32} stroke={1.4} style={{ color:'var(--brand)' }}/>
        <span style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:9, background:'var(--brand)', color:'#fff', fontSize:9, fontWeight:700, display:'grid', placeItems:'center' }}>AI</span>
      </div>
      <div>
        <div style={{ fontSize:24, fontWeight:700, letterSpacing:'-0.02em', marginBottom:6 }}>{I.starterEmptyTitle}</div>
        <div style={{ fontSize:13, color:'var(--fg-3)', lineHeight:1.55, maxWidth:380, margin:'0 auto' }}>{I.starterEmptySub}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10, width:'100%' }}>
        {[
          { icon:'wand',   label:I.fromPrompt,   sub: lang==='tr' ? 'Yazıdan başla' : 'Describe it',      primary:true },
          { icon:'image',  label:I.fromImage,    sub: lang==='tr' ? 'Tasarımı yükle' : 'Upload mockup' },
          { icon:'layers', label:I.fromTemplate, sub: lang==='tr' ? '24+ hazır şablon' : '24+ ready' },
          { icon:'file',   label:I.blank,        sub: lang==='tr' ? 'Sıfırdan kur' : 'Start clean' },
        ].map((c, i) => (
          <div key={i} onClick={onStart} style={{ padding:14, background: c.primary ? 'var(--brand-soft)' : 'var(--bg-elev)', border: c.primary ? '1px solid var(--brand)' : '1px solid var(--line)', borderRadius:10, textAlign:'left', cursor:'pointer', display:'flex', flexDirection:'column', gap:4 }}>
            <div style={{ width:30, height:30, borderRadius:8, background: c.primary ? 'var(--brand)' : 'var(--panel-2)', color: c.primary ? '#fff' : 'var(--fg)', display:'grid', placeItems:'center', marginBottom:6 }}>
              <Icon name={c.icon} size={14}/>
            </div>
            <div style={{ fontSize:13, fontWeight:600, color: c.primary ? 'var(--brand)' : 'var(--fg)' }}>{c.label}</div>
            <div style={{ fontSize:11, color:'var(--fg-3)' }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ width:'100%' }}>
        <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--fg-3)', textAlign:'left', marginBottom:8 }}>{I.suggested}</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {(lang === 'tr'
            ? ['Ürün detay','Ödeme','Profil','Onboarding','Sepet','Akış']
            : ['Product detail','Checkout','Profile','Onboarding','Cart','Feed']
          ).map((s, i) => (
            <span key={i} className="chip" style={{ cursor:'pointer' }} onClick={onStart}>
              <Icon name="sparkle" size={10}/> {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
