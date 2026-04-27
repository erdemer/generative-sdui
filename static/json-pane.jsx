/* SDUI Studio — JsonPane: raw JSON view */

var Icon = window.Icon;

function JsonPane({ lang, json, onView }) {
  const t = window.SDUI.t;
  return (
    <div className="pane">
      <div className="pane-header">
        <div className="seg" style={{ height:24 }}>
          <button style={{ height:18 }} onClick={() => onView('tree')}>
            <Icon name="layers" size={11}/> {t(lang,'tree')}
          </button>
          <button className="on" style={{ height:18 }}>
            <Icon name="code" size={11}/> {t(lang,'json')}
          </button>
        </div>
        <div className="actions">
          <button className="icon-btn" title="Copy" onClick={() => navigator.clipboard?.writeText(JSON.stringify(json, null, 2))}>
            <Icon name="duplicate" size={13}/>
          </button>
        </div>
      </div>
      <div className="pane-body flush" style={{ overflow:'hidden' }}>
        <div className="json-pane" style={{ height:'100%', overflow:'auto' }}>
          <pre>{json ? JSON.stringify(json, null, 2) : ''}</pre>
        </div>
      </div>
    </div>
  );
}
