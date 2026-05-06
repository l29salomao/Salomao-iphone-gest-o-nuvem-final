import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// ─── FIREBASE CONFIG ────────────────────────────────────────────────
// PASSO 1: Após criar seu projeto no Firebase, cole suas chaves aqui:
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBpMuD38KnyvnoB2FQmgP-IOkrf19QWGBc",
  authDomain: "salomao-iphones-gestao.firebaseapp.com",
  projectId: "salomao-iphones-gestao",
  storageBucket: "salomao-iphones-gestao.firebasestorage.app",
  messagingSenderId: "127689521136",
  appId: "1:127689521136:web:775ef6d0c8517c2f9e8f35",
};

// ─── FIREBASE INTEGRATION ────────────────────────────────────────────
// Detecta se Firebase está configurado (chaves reais coladas)
const FIREBASE_CONFIGURED = !FIREBASE_CONFIG.apiKey.includes("COLE_");

// Carrega Firebase dinamicamente apenas se configurado
let db = null;
let firebaseReady = false;

async function initFirebase() {
  if (!FIREBASE_CONFIGURED || firebaseReady) return;
  try {
    const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
    const { getFirestore, doc, setDoc, getDoc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    if (!getApps().length) initializeApp(FIREBASE_CONFIG);
    db = getFirestore();
    firebaseReady = true;
    window._fsDoc = doc;
    window._fsSetDoc = setDoc;
    window._fsGetDoc = getDoc;
    window._fsOnSnapshot = onSnapshot;
    console.log("✅ Firebase conectado!");
  } catch(e) {
    console.warn("Firebase não disponível:", e.message);
  }
}

const FIREBASE_DOC_ID = "salomao_iphones_main";

async function saveToFirebase(data) {
  if (!firebaseReady || !db) return false;
  try {
    await window._fsSetDoc(window._fsDoc(db, "appdata", FIREBASE_DOC_ID), { data: JSON.stringify(data), updatedAt: Date.now() });
    return true;
  } catch(e) { console.warn("Erro ao salvar Firebase:", e); return false; }
}

async function loadFromFirebase() {
  if (!firebaseReady || !db) return null;
  try {
    const snap = await window._fsGetDoc(window._fsDoc(db, "appdata", FIREBASE_DOC_ID));
    if (snap.exists()) return JSON.parse(snap.data().data);
    return null;
  } catch(e) { console.warn("Erro ao carregar Firebase:", e); return null; }
}

function subscribeFirebase(callback) {
  if (!firebaseReady || !db) return () => {};
  try {
    return window._fsOnSnapshot(window._fsDoc(db, "appdata", FIREBASE_DOC_ID), (snap) => {
      if (snap.exists()) {
        try { callback(JSON.parse(snap.data().data)); } catch {}
      }
    });
  } catch { return () => {}; }
}


const STORAGE_KEY = "salomao_iphones_v2";
const MESES_LISTA = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmt = (v) => `R$ ${Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtN = (v) => Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const mesAtual = () => { const d=new Date(); return `${MESES_LISTA[d.getMonth()]}/${d.getFullYear()}`; };
const hoje = () => new Date().toLocaleDateString("pt-BR");
const getMes = (data) => {
  if(!data)return"";
  const p=data.split("/");
  if(p.length===3){const d=new Date(`${p[2]}-${p[1]}-${p[0]}`);if(!isNaN(d))return`${MESES_LISTA[d.getMonth()]}/${d.getFullYear()}`;}
  return"";
};

const defaultConfig = {
  metaFaturamento: 15000,
  metaLucro: 10000,
  origens: ["Indicação","Vizinho","Parceiro","Tráfego pago","Instagram","Network","Loja","Outros"],
  modos: ["Laboratório","Leva e traz","Delivery"],
  tiposCusto: ["Peças","Marketing","Gasolina","Garantia","Investimentos","Outros"],
};

const defaultData = {
  config: defaultConfig,
  registros: [
    {id:1,data:"13/01/2025",mes:"Jan/2025",cliente:"Valdir",cidade:"BC",aparelho:"G24",servico:"Conector de carga",origem:"Indicação",modo:"Laboratório",tipoCliente:"Novo",peca:"",valor:120,custo:0,lucro:120,pagamento:"Pix",obs:""},
    {id:2,data:"13/01/2025",mes:"Jan/2025",cliente:"André Taio",cidade:"BC",aparelho:"iPhone 12",servico:"Tela",origem:"Vizinho",modo:"Laboratório",tipoCliente:"Antigo",peca:"Tela",valor:200,custo:110,lucro:90,pagamento:"Pix",obs:""},
    {id:3,data:"20/01/2025",mes:"Jan/2025",cliente:"Danilo Junior",cidade:"Camboriú",aparelho:"iPhone 13 Pro Max",servico:"Tela e tampa",origem:"Tráfego pago",modo:"Leva e traz",tipoCliente:"Novo",peca:"Tela e tampa",valor:1080,custo:580,lucro:500,pagamento:"Pix",obs:""},
  ],
  aparelhos: [
    {id:1,nome:"iPhone 13 Pro Max",dataCompra:"",valorCompra:0,valorReparo:0,valorVenda:2200,status:"Vendido",obs:""},
    {id:2,nome:"A14",dataCompra:"",valorCompra:0,valorReparo:258,valorVenda:450,status:"Vendido",obs:""},
    {id:3,nome:"iPhone XR",dataCompra:"",valorCompra:0,valorReparo:300,valorVenda:0,status:"Em estoque",obs:"Tela e carcaça"},
  ],
  estoque: [
    {id:1,peca:"A31 tela quebrada",quantidade:1,valor:0,obs:""},
    {id:2,peca:"One macro tela quebrada",quantidade:1,valor:0,obs:""},
    {id:3,peca:"G10 tela quebrada",quantidade:2,valor:0,obs:""},
    {id:4,peca:"A14 tela original",quantidade:1,valor:0,obs:""},
    {id:5,peca:"Redmi note 11s tela China",quantidade:1,valor:0,obs:""},
  ],
  investimentos: [
    {id:1,data:"17/01/2025",objeto:"Tíner",valor:30},
    {id:2,data:"18/01/2025",objeto:"Borneo",valor:252},
    {id:3,data:"28/01/2025",objeto:"Curso Fernando Santos",valor:250},
  ],
  garantias: [
    {id:1,data:"05/02/2025",cliente:"Júnior Itapema",motivo:"Aparelho reiniciando. Troquei o dock",custo:200,status:"Resolvida"},
    {id:2,data:"06/02/2025",cliente:"Naira",motivo:"Quebrando a tela. Troquei câmera e tela.",custo:410,status:"Resolvida"},
  ],
  custos: [
    {id:1,data:"13/01/2025",descricao:"Parceria sorteio",tipo:"Marketing",valor:20},
    {id:2,data:"22/01/2025",descricao:"Aluguel",tipo:"Outros",valor:1260},
    {id:3,data:"19/01/2025",descricao:"Internet",tipo:"Outros",valor:123},
  ],
  devedores: [],
};

// ─── GOLD THEME ──────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --bg:#050505;
    --surf:#0a0a0a;
    --card:#0f0f0f;
    --border:#1f1a0e;
    --gold:#c9933a;
    --gold2:#f5d485;
    --gold-dim:#c9933a18;
    --gold-glow:#c9933a40;
    --silver:#d0d0d8;
    --red:#e53e3e;--red-dim:#e53e3e15;
    --green:#22c55e;--green-dim:#22c55e15;
    --blue:#3b82f6;--blue-dim:#3b82f615;
    --orange:#f97316;--orange-dim:#f9731615;
    --purple:#a855f7;--purple-dim:#a855f715;
    --muted:#4a4030;
    --text:#f0e8d8;
    --font:'Montserrat',sans-serif;
    --mono:'JetBrains Mono',monospace;
  }
  body{background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}
  input,select,button,textarea{font-family:var(--font)}
  input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
  ::-webkit-scrollbar{width:3px;height:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#2a2010;border-radius:99px}
  .fi{animation:fi .2s ease both}
  @keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .mo{position:fixed;inset:0;background:rgba(0,0,0,.92);backdrop-filter:blur(8px);z-index:1000;display:flex;align-items:flex-start;justify-content:center;padding:16px 16px 40px;overflow-y:auto}
  .mb{background:#0f0f0f;border:1px solid var(--gold-glow);border-radius:18px;padding:22px;width:100%;max-width:520px;}
  input::placeholder,textarea::placeholder{color:var(--muted)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  .gold-card{background:linear-gradient(135deg,#0f0f0f,#1a1408);border:1px solid var(--gold-glow)!important}
`;

// ─── PRIMITIVES ──────────────────────────────────────────────────────
const Card = ({children,style={},cn="",gold=false,onClick,onMouseEnter,onMouseLeave}) => (
  <div className={`fi ${cn} ${gold?"gold-card":""}`}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:16,...style}}>
    {children}
  </div>
);

const Badge = ({color="gold",children,style={}}) => {
  const colors = {
    gold: {bg:"var(--gold-dim)",color:"var(--gold)",border:"var(--gold-glow)"},
    green: {bg:"var(--green-dim)",color:"var(--green)",border:"#22c55e30"},
    red: {bg:"var(--red-dim)",color:"var(--red)",border:"#e53e3e30"},
    blue: {bg:"var(--blue-dim)",color:"var(--blue)",border:"#3b82f630"},
    purple: {bg:"var(--purple-dim)",color:"var(--purple)",border:"#a855f730"},
    orange: {bg:"var(--orange-dim)",color:"var(--orange)",border:"#f9731630"},
    silver: {bg:"#d0d0d815",color:"var(--silver)",border:"#d0d0d830"},
  };
  const c = colors[color] || colors.gold;
  return (
    <span style={{background:c.bg,color:c.color,border:`1px solid ${c.border}`,borderRadius:5,padding:"2px 8px",fontSize:10,fontWeight:700,letterSpacing:".8px",textTransform:"uppercase",...style}}>
      {children}
    </span>
  );
};

const Btn = ({onClick,color="gold",children,style={},sm=false,disabled=false}) => {
  const colors = {
    gold: {bg:"var(--gold-dim)",fg:"var(--gold)",border:"var(--gold-glow)",hover:"var(--gold)"},
    green: {bg:"var(--green-dim)",fg:"var(--green)",border:"#22c55e30",hover:"var(--green)"},
    red: {bg:"var(--red-dim)",fg:"var(--red)",border:"#e53e3e30",hover:"var(--red)"},
    blue: {bg:"var(--blue-dim)",fg:"var(--blue)",border:"#3b82f630",hover:"var(--blue)"},
    orange: {bg:"var(--orange-dim)",fg:"var(--orange)",border:"#f9731630",hover:"var(--orange)"},
    silver: {bg:"#d0d0d815",fg:"var(--silver)",border:"#d0d0d830",hover:"var(--silver)"},
  };
  const c = colors[color] || colors.gold;
  return (
    <button disabled={disabled} onClick={onClick}
      style={{background:c.bg,color:c.fg,border:`1px solid ${c.border}`,borderRadius:8,padding:sm?"4px 12px":"9px 18px",fontSize:sm?11:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",transition:"all .15s",opacity:disabled?.5:1,...style}}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.background=c.hover;e.currentTarget.style.color="#000";}}}
      onMouseLeave={e=>{if(!disabled){e.currentTarget.style.background=c.bg;e.currentTarget.style.color=c.fg;}}}
    >{children}</button>
  );
};

const Inp = ({value,onChange,placeholder,type="text",style={},onKeyDown,rows}) => rows
  ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{background:"#080808",border:"1px solid #2a2010",borderRadius:8,padding:"8px 11px",color:"var(--gold2)",fontSize:12,width:"100%",outline:"none",fontFamily:"var(--mono)",resize:"vertical",...style}}/>
  : <input value={value} onChange={onChange} placeholder={placeholder} type={type} onKeyDown={onKeyDown}
      style={{background:"#080808",border:"1px solid #2a2010",borderRadius:8,padding:"8px 11px",color:"var(--gold2)",fontSize:12,width:"100%",outline:"none",fontFamily:"var(--mono)",...style}}/>;

const Sel = ({value,onChange,options,style={}}) => (
  <select value={value} onChange={onChange}
    style={{background:"#080808",border:"1px solid #2a2010",borderRadius:8,padding:"8px 11px",color:"var(--text)",fontSize:12,width:"100%",outline:"none",...style}}>
    {options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

const Lbl = ({children}) => (
  <div style={{fontSize:9,color:"var(--muted)",marginBottom:3,textTransform:"uppercase",letterSpacing:1.4,fontWeight:700}}>{children}</div>
);

const Sec = ({children,color="gold"}) => {
  const fg = color==="gold"?"var(--gold)":color==="silver"?"var(--silver)":`var(--${color})`;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
      <div style={{width:3,height:14,borderRadius:99,background:fg,flexShrink:0,boxShadow:`0 0 8px ${fg}`}}/>
      <span style={{fontSize:11,fontWeight:800,color:fg,textTransform:"uppercase",letterSpacing:2}}>{children}</span>
    </div>
  );
};

const Stat = ({label,value,color="gold",sub,delta}) => {
  const fg = color==="gold"?"var(--gold)":color==="silver"?"var(--silver)":`var(--${color})`;
  return (
    <Card gold={color==="gold"} style={{flex:1,minWidth:100}}>
      <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:1.3,fontWeight:700,marginBottom:5}}>{label}</div>
      <div style={{fontSize:15,fontWeight:800,color:fg,fontFamily:"var(--mono)",lineHeight:1}}>{value}</div>
      {sub&&<div style={{fontSize:9,color:"var(--muted)",marginTop:3}}>{sub}</div>}
      {delta!==undefined&&<div style={{fontSize:10,fontWeight:700,color:delta>=0?"var(--green)":"var(--red)",marginTop:3}}>{delta>=0?"▲":"▼"} {Math.abs(delta).toFixed(0)}%</div>}
    </Card>
  );
};

const Modal = ({title,onClose,children,color="gold"}) => {
  const fg = color==="gold"?"var(--gold)":`var(--${color})`;
  return (
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mb fi">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <span style={{fontWeight:800,fontSize:15,color:fg}}>{title}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:18}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── LOGO SVG ────────────────────────────────────────────────────────
const Logo = ({size=28}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f5d485"/>
        <stop offset="50%" stopColor="#c9933a"/>
        <stop offset="100%" stopColor="#8b6010"/>
      </linearGradient>
    </defs>
    {/* Apple shape */}
    <path d="M50 20 C30 20 18 35 18 52 C18 72 32 85 50 85 C68 85 82 72 82 52 C82 35 70 20 50 20Z" stroke="url(#g1)" strokeWidth="4" fill="none"/>
    {/* Stem */}
    <path d="M50 20 C50 20 52 10 60 8" stroke="url(#g1)" strokeWidth="3" strokeLinecap="round" fill="none"/>
    {/* Leaf */}
    <path d="M60 8 C68 6 72 12 65 16 C60 18 56 14 60 8Z" fill="url(#g1)"/>
    {/* Bite */}
    <path d="M82 45 C88 45 90 52 88 58" stroke="#050505" strokeWidth="8" strokeLinecap="round"/>
  </svg>
);

// ─── TABS ────────────────────────────────────────────────────────────
const TABS = [
  {key:"dashboard",label:"Dashboard",emoji:"📊"},
  {key:"registros",label:"Registros",emoji:"📝"},
  {key:"caixa",label:"Caixa",emoji:"💵"},
  {key:"aparelhos",label:"Aparelhos",emoji:"📱"},
  {key:"ranking",label:"Ranking",emoji:"🏆"},
  {key:"clientes",label:"Clientes",emoji:"👥"},
  {key:"estoque",label:"Estoque",emoji:"📦"},
  {key:"investimentos",label:"Invest.",emoji:"💰"},
  {key:"garantias",label:"Garantias",emoji:"🛡"},
  {key:"custos",label:"Custos",emoji:"🧾"},
  {key:"devedores",label:"Devedores",emoji:"⚠️"},
  {key:"config",label:"Config",emoji:"⚙️"},
];

const PAGAMENTOS = ["Pix","Dinheiro","Débito","Crédito","Pendente"];
const TIPOS_CLIENTE = ["Novo","Antigo"];

// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab,setTab] = useState("dashboard");
  const [syncStatus,setSyncStatus] = useState("local"); // "local" | "syncing" | "synced" | "error"
  const [data,setData] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if(!s) return defaultData;
      const p = JSON.parse(s);
      return {...defaultData,...p,config:{...defaultConfig,...(p.config||{})}};
    } catch { return defaultData; }
  });
  const saveTimeout = useRef(null);

  // Init Firebase and load cloud data on mount
  useEffect(() => {
    if (!FIREBASE_CONFIGURED) return;
    setSyncStatus("syncing");
    initFirebase().then(async () => {
      const cloudData = await loadFromFirebase();
      if (cloudData) {
        const merged = {...defaultData,...cloudData,config:{...defaultConfig,...(cloudData.config||{})}};
        setData(merged);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
      }
      setSyncStatus("synced");
      // Subscribe to real-time updates
      subscribeFirebase((cloudData) => {
        const merged = {...defaultData,...cloudData,config:{...defaultConfig,...(cloudData.config||{})}};
        setData(merged);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch {}
        setSyncStatus("synced");
      });
    }).catch(() => setSyncStatus("error"));
  }, []);

  const save = useCallback((nd) => {
    setData(nd);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nd)); } catch {}
    // Debounce Firebase save — waits 1.5s after last change
    if (FIREBASE_CONFIGURED) {
      setSyncStatus("syncing");
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(async () => {
        const ok = await saveToFirebase(nd);
        setSyncStatus(ok ? "synced" : "error");
      }, 1500);
    }
  }, []);

  const exportData = () => {
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download=`salomao-iphones-${new Date().toISOString().slice(0,10)}.json`;
    a.click();URL.revokeObjectURL(url);
  };
  const importData = (e) => {
    const file=e.target.files[0];if(!file)return;
    const r=new FileReader();
    r.onload=(ev)=>{try{save({...defaultData,...JSON.parse(ev.target.result)});alert("✅ Importado!");}catch{alert("❌ Arquivo inválido.");}};
    r.readAsText(file);e.target.value="";
  };

  const mes = mesAtual();
  const regMes = data.registros.filter(r=>r.mes===mes);
  const fatMes = regMes.reduce((s,r)=>s+r.valor,0);
  const lucroLiqMes = regMes.reduce((s,r)=>s+r.lucro,0);

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",paddingBottom:80}}>
      <style>{css}</style>
      <input type="file" id="imp" accept=".json" style={{display:"none"}} onChange={importData}/>

      {/* HEADER */}
      <div style={{background:"linear-gradient(180deg,#0f0c05,#050505)",borderBottom:"1px solid var(--gold-glow)",padding:"10px 16px",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <Logo size={32}/>
            <div>
              <div style={{fontWeight:900,fontSize:13,background:"linear-gradient(90deg,var(--gold2),var(--gold))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"1px"}}>SALOMÃO iPHONES</div>
              <div style={{fontSize:8,color:"var(--muted)",letterSpacing:2,marginTop:1}}>GESTÃO DO NEGÓCIO</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{textAlign:"right",marginRight:4}}>
              <div style={{fontSize:8,color:"var(--muted)",letterSpacing:1}}>{mes.toUpperCase()}</div>
              <div style={{fontFamily:"var(--mono)",fontWeight:800,fontSize:13,color:"var(--gold)"}}>{fmt(lucroLiqMes)}</div>
            </div>
            {FIREBASE_CONFIGURED && (
              <div style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,background:syncStatus==="synced"?"var(--green-dim)":syncStatus==="syncing"?"var(--gold-dim)":syncStatus==="error"?"var(--red-dim)":"#1a1a1a",border:`1px solid ${syncStatus==="synced"?"#22c55e30":syncStatus==="syncing"?"var(--gold-glow)":syncStatus==="error"?"#e53e3e30":"#333"}`}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:syncStatus==="synced"?"var(--green)":syncStatus==="syncing"?"var(--gold)":syncStatus==="error"?"var(--red)":"#666",animation:syncStatus==="syncing"?"pulse 1s infinite":"none"}}/>
                <span style={{fontSize:9,fontWeight:700,color:syncStatus==="synced"?"var(--green)":syncStatus==="syncing"?"var(--gold)":syncStatus==="error"?"var(--red)":"#666",letterSpacing:1}}>
                  {syncStatus==="synced"?"NUVEM":syncStatus==="syncing"?"SALVANDO...":syncStatus==="error"?"OFFLINE":"LOCAL"}
                </span>
              </div>
            )}
            {!FIREBASE_CONFIGURED && (
              <div style={{fontSize:9,color:"var(--muted)",padding:"3px 8px",background:"#111",borderRadius:20,border:"1px solid #222"}}>📴 LOCAL</div>
            )}
            <Btn sm color="silver" onClick={exportData}>⬇ Export</Btn>
            <Btn sm color="gold" onClick={()=>document.getElementById("imp").click()}>⬆ Import</Btn>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#050505",borderBottom:"1px solid #1a1408",overflowX:"auto",position:"sticky",top:51,zIndex:99}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex"}}>
          {TABS.map(t=>{
            const active=tab===t.key;
            return (
              <button key={t.key} onClick={()=>setTab(t.key)} style={{background:"none",border:"none",padding:"9px 10px",color:active?"var(--gold)":"var(--muted)",borderBottom:active?"2px solid var(--gold)":"2px solid transparent",cursor:"pointer",fontSize:9,fontWeight:800,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,letterSpacing:".5px",textTransform:"uppercase",transition:"color .15s"}}>
                <span style={{fontSize:11}}>{t.emoji}</span>{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"14px 12px"}}>
        {tab==="dashboard"    &&<Dashboard data={data} mes={mes} fatMes={fatMes} lucroLiqMes={lucroLiqMes}/>}
        {tab==="registros"    &&<Registros data={data} save={save}/>}
        {tab==="caixa"        &&<Caixa data={data}/>}
        {tab==="aparelhos"    &&<Aparelhos data={data} save={save}/>}
        {tab==="ranking"      &&<Ranking data={data}/>}
        {tab==="clientes"     &&<Clientes data={data}/>}
        {tab==="estoque"      &&<Estoque data={data} save={save}/>}
        {tab==="investimentos"&&<Investimentos data={data} save={save}/>}
        {tab==="garantias"    &&<Garantias data={data} save={save}/>}
        {tab==="custos"       &&<Custos data={data} save={save}/>}
        {tab==="devedores"    &&<Devedores data={data} save={save}/>}
        {tab==="config"       &&<Config data={data} save={save}/>}
      </div>
    </div>
  );
}

// ══ DASHBOARD ════════════════════════════════════════════════════════
function Dashboard({data,mes,fatMes,lucroLiqMes}) {
  const cfg = data.config;

  // Mês anterior
  const mesesUnicos = [...new Set(data.registros.map(r=>r.mes))].sort();
  const idxMes = mesesUnicos.indexOf(mes);
  const mesAnt = idxMes>0?mesesUnicos[idxMes-1]:null;
  const regAnt = mesAnt?data.registros.filter(r=>r.mes===mesAnt):[];
  const fatAnt = regAnt.reduce((s,r)=>s+r.valor,0);
  const lucroAnt = regAnt.reduce((s,r)=>s+r.lucro,0);
  const deltaFat = fatAnt>0?((fatMes-fatAnt)/fatAnt)*100:0;
  const deltaLucro = lucroAnt>0?((lucroLiqMes-lucroAnt)/lucroAnt)*100:0;

  const regMes = data.registros.filter(r=>r.mes===mes);
  const qtd = regMes.length;
  const ticket = qtd>0?fatMes/qtd:0;

  // Custos do mês por tipo
  const custosMes = data.custos.filter(c=>getMes(c.data)===mes);
  const custoTotal = (tipo) => custosMes.filter(c=>c.tipo===tipo).reduce((s,c)=>s+c.valor,0);
  const pecasCusto = regMes.reduce((s,r)=>s+r.custo,0);
  const marketingCusto = custoTotal("Marketing");
  const gasolinaCusto = custoTotal("Gasolina");
  const garantiaCusto = data.garantias.filter(g=>getMes(g.data)===mes).reduce((s,g)=>s+g.custo,0);
  const investCusto = data.investimentos.filter(i=>getMes(i.data)===mes).reduce((s,i)=>s+i.valor,0);
  const outrosCusto = custoTotal("Outros") + custoTotal("Peças");
  const totalCustosSemInvest = pecasCusto+marketingCusto+gasolinaCusto+garantiaCusto+outrosCusto;
  const lucroReal = lucroLiqMes - marketingCusto - gasolinaCusto - garantiaCusto - outrosCusto;

  const pctFat = cfg.metaFaturamento>0?Math.min((fatMes/cfg.metaFaturamento)*100,100):0;
  const pctLucro = cfg.metaLucro>0?Math.min((lucroLiqMes/cfg.metaLucro)*100,100):0;
  const novos = regMes.filter(r=>r.tipoCliente==="Novo").length;
  const antigos = regMes.filter(r=>r.tipoCliente==="Antigo").length;

  return (
    <div className="fi">
      {/* STATS PRINCIPAIS */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:12}}>
        <Stat label="Faturamento" value={fmt(fatMes)} color="gold" sub={mes} delta={deltaFat}/>
        <Stat label="Lucro Líquido" value={fmt(lucroLiqMes)} color="green" sub="soma dos lucros" delta={deltaLucro}/>
        <Stat label="Lucro Real" value={fmt(lucroReal)} color={lucroReal>=0?"green":"red"} sub="- todos os custos"/>
        <Stat label="Ticket Médio" value={`R$ ${fmtN(ticket)}`} color="silver" sub={`${qtd} serviços`}/>
      </div>

      {/* METAS */}
      <Card gold style={{marginBottom:10}}>
        <Sec color="gold">Metas do Mês</Sec>
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11,color:"var(--muted)"}}>Faturamento — meta {fmt(cfg.metaFaturamento)}</span>
            <span style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--gold)",fontSize:12}}>{pctFat.toFixed(0)}%</span>
          </div>
          <div style={{background:"#1a1408",borderRadius:99,height:7,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pctFat}%`,background:"linear-gradient(90deg,var(--gold),var(--gold2))",borderRadius:99,transition:"width .5s",boxShadow:"0 0 10px var(--gold-glow)"}}/>
          </div>
        </div>
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11,color:"var(--muted)"}}>Lucro Líquido — meta {fmt(cfg.metaLucro)}</span>
            <span style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--green)",fontSize:12}}>{pctLucro.toFixed(0)}%</span>
          </div>
          <div style={{background:"#1a1408",borderRadius:99,height:7,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${pctLucro}%`,background:"linear-gradient(90deg,var(--green),var(--gold2))",borderRadius:99,transition:"width .5s"}}/>
          </div>
        </div>
      </Card>

      {/* CUSTOS DO MÊS */}
      <Card style={{marginBottom:10}}>
        <Sec color="red">Custos do Mês</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
          {[
            {l:"Peças",v:pecasCusto,c:"var(--muted)"},
            {l:"Marketing",v:marketingCusto,c:"var(--orange)"},
            {l:"Gasolina",v:gasolinaCusto,c:"var(--gold)"},
            {l:"Garantias",v:garantiaCusto,c:"var(--red)"},
            {l:"Investimentos",v:investCusto,c:"var(--purple)"},
            {l:"Outros",v:outrosCusto,c:"var(--muted)"},
          ].map(({l,v,c})=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 8px",background:"#0a0a0a",borderRadius:8}}>
              <span style={{fontSize:11,color:"var(--muted)"}}>{l}</span>
              <span style={{fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:c}}>{fmt(v)}</span>
            </div>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:8,padding:"7px 8px",background:"var(--red-dim)",borderRadius:8}}>
          <span style={{fontSize:11,fontWeight:800}}>Total (sem invest.)</span>
          <span style={{fontFamily:"var(--mono)",fontWeight:800,color:"var(--red)",fontSize:12}}>{fmt(totalCustosSemInvest)}</span>
        </div>
      </Card>

      {/* COMPARATIVO + CLIENTES */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {mesAnt&&(
          <Card>
            <Sec color="silver">vs {mesAnt}</Sec>
            {[{l:"Faturamento",v1:fatMes,v2:fatAnt},{l:"Lucro",v1:lucroLiqMes,v2:lucroAnt},{l:"Serviços",v1:qtd,v2:regAnt.length,raw:true}].map(({l,v1,v2,raw})=>{
              const d=v2>0?((v1-v2)/v2)*100:0;
              return(
                <div key={l} style={{padding:"5px 0",borderBottom:"1px solid var(--border)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                    <span style={{fontSize:10,color:"var(--muted)"}}>{l}</span>
                    <span style={{fontFamily:"var(--mono)",fontSize:10,fontWeight:700}}>{raw?v1:fmt(v1)}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:9,color:"var(--muted)"}}>ant: {raw?v2:fmt(v2)}</span>
                    <span style={{fontSize:10,fontWeight:700,color:d>=0?"var(--green)":"var(--red)"}}>{d>=0?"▲":"▼"}{Math.abs(d).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
        <Card>
          <Sec color="gold">Clientes</Sec>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:12,color:"var(--muted)"}}>Novos</span>
            <Badge color="green">{novos}</Badge>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
            <span style={{fontSize:12,color:"var(--muted)"}}>Recorrentes</span>
            <Badge color="gold">{antigos}</Badge>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0"}}>
            <span style={{fontSize:12,color:"var(--muted)"}}>Total serviços</span>
            <Badge color="silver">{qtd}</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ══ REGISTROS ════════════════════════════════════════════════════════
function Registros({data,save}) {
  const [modal,setModal] = useState(false);
  const [form,setForm] = useState({data:hoje(),mes:mesAtual(),cliente:"",cidade:"BC",aparelho:"",servico:"",origem:data.config.origens[0],modo:data.config.modos[0],tipoCliente:"Novo",peca:"",valor:"",custo:"",pagamento:"Pix",obs:""});
  const [filtroMes,setFiltroMes] = useState(mesAtual());
  const [busca,setBusca] = useState("");

  const meses = [...new Set([mesAtual(),...data.registros.map(r=>r.mes)])];
  const lista = data.registros.filter(r=>{
    const mesOk = filtroMes==="Todos"||r.mes===filtroMes;
    const b = busca.toLowerCase();
    const bOk = !busca||[r.cliente,r.aparelho,r.servico,r.cidade].some(x=>x?.toLowerCase().includes(b));
    return mesOk&&bOk;
  });
  const sorted = [...lista].sort((a,b)=>b.id-a.id);
  const tFat = lista.reduce((s,r)=>s+r.valor,0);
  const tLucro = lista.reduce((s,r)=>s+r.lucro,0);

  const add = () => {
    if(!form.cliente||!form.valor)return;
    const custo=+form.custo||0,valor=+form.valor||0;
    const mes=getMes(form.data)||form.mes;
    save({...data,registros:[...data.registros,{...form,id:Date.now(),valor,custo,lucro:valor-custo,mes}]});
    setForm(f=>({...f,cliente:"",aparelho:"",servico:"",peca:"",valor:"",custo:"",obs:""}));
    setModal(false);
  };
  const del = (id) => save({...data,registros:data.registros.filter(r=>r.id!==id)});

  const pagColor = {Pix:"green",Dinheiro:"gold",Débito:"blue",Crédito:"purple",Pendente:"red"};

  return (
    <div className="fi">
      <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <Inp value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Buscar cliente, aparelho ou serviço..." style={{flex:1,minWidth:200}}/>
        <Btn color="gold" onClick={()=>setModal(true)}>+ Novo Registro</Btn>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
        {["Todos",...meses].map(m=>(
          <button key={m} onClick={()=>setFiltroMes(m)} style={{background:filtroMes===m?"var(--gold)":"var(--card)",color:filtroMes===m?"#000":"var(--muted)",border:"1px solid var(--border)",borderRadius:20,padding:"4px 11px",fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",letterSpacing:".5px"}}>{m}</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <Stat label="Faturamento" value={fmt(tFat)} color="gold"/>
        <Stat label="Lucro líquido" value={fmt(tLucro)} color="green"/>
        <Stat label="Serviços" value={sorted.length} color="silver"/>
      </div>

      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {sorted.length===0&&<Card><div style={{textAlign:"center",color:"var(--muted)",padding:20,fontSize:12}}>Nenhum registro encontrado.</div></Card>}
        {sorted.map(r=>(
          <Card key={r.id} style={{padding:"11px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,flexWrap:"wrap"}}>
                  <span style={{fontWeight:800,fontSize:13,color:"var(--text)"}}>{r.cliente}</span>
                  <Badge color="silver" style={{fontSize:8}}>{r.cidade}</Badge>
                  <Badge color={r.tipoCliente==="Novo"?"green":"gold"} style={{fontSize:8}}>{r.tipoCliente}</Badge>
                  <span style={{fontSize:9,color:"var(--muted)"}}>{r.data}</span>
                </div>
                <div style={{fontSize:12,color:"var(--text)",marginBottom:4}}>{r.aparelho} — <span style={{color:"var(--gold)"}}>{r.servico}</span></div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  <Badge color="orange" style={{fontSize:8}}>{r.origem}</Badge>
                  <Badge color="blue" style={{fontSize:8}}>{r.modo}</Badge>
                  <Badge color={pagColor[r.pagamento]||"silver"} style={{fontSize:8}}>{r.pagamento}</Badge>
                </div>
                {r.obs&&<div style={{fontSize:10,color:"var(--muted)",marginTop:4,fontStyle:"italic"}}>💬 {r.obs}</div>}
              </div>
              <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
                <div style={{fontFamily:"var(--mono)",fontWeight:900,fontSize:15,color:"var(--gold)"}}>{fmt(r.valor)}</div>
                <div style={{fontSize:9,color:"var(--muted)"}}>custo {fmt(r.custo)}</div>
                <div style={{fontFamily:"var(--mono)",fontWeight:700,fontSize:13,color:"var(--green)"}}>{fmt(r.lucro)}</div>
                <button onClick={()=>del(r.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:12,marginTop:4}}>🗑</button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {modal&&(
        <Modal title="➕ Novo Registro" onClose={()=>setModal(false)} color="gold">
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><Lbl>Data</Lbl><Inp value={form.data} onChange={e=>{const m=getMes(e.target.value);setForm(f=>({...f,data:e.target.value,mes:m||f.mes}))}} placeholder="DD/MM/AAAA"/></div>
              <div><Lbl>Mês/Ano</Lbl><Inp value={form.mes} onChange={e=>setForm(f=>({...f,mes:e.target.value}))} placeholder="Mai/2025"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><Lbl>Cliente</Lbl><Inp value={form.cliente} onChange={e=>setForm(f=>({...f,cliente:e.target.value}))} placeholder="Nome"/></div>
              <div><Lbl>Cidade</Lbl><Inp value={form.cidade} onChange={e=>setForm(f=>({...f,cidade:e.target.value}))} placeholder="Ex: BC"/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div><Lbl>Aparelho</Lbl><Inp value={form.aparelho} onChange={e=>setForm(f=>({...f,aparelho:e.target.value}))} placeholder="Ex: iPhone 14"/></div>
              <div><Lbl>Serviço</Lbl><Inp value={form.servico} onChange={e=>setForm(f=>({...f,servico:e.target.value}))} placeholder="Ex: Tela"/></div>
            </div>
            <div><Lbl>Peça utilizada</Lbl><Inp value={form.peca} onChange={e=>setForm(f=>({...f,peca:e.target.value}))} placeholder="Opcional..."/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div><Lbl>Valor (R$)</Lbl><Inp type="number" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} placeholder="0"/></div>
              <div><Lbl>Custo peça</Lbl><Inp type="number" value={form.custo} onChange={e=>setForm(f=>({...f,custo:e.target.value}))} placeholder="0"/></div>
              <div><Lbl>Pagamento</Lbl><Sel value={form.pagamento} options={PAGAMENTOS} onChange={e=>setForm(f=>({...f,pagamento:e.target.value}))}/></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div><Lbl>Origem</Lbl><Sel value={form.origem} options={data.config.origens} onChange={e=>setForm(f=>({...f,origem:e.target.value}))}/></div>
              <div><Lbl>Modo</Lbl><Sel value={form.modo} options={data.config.modos} onChange={e=>setForm(f=>({...f,modo:e.target.value}))}/></div>
              <div><Lbl>Tipo cliente</Lbl><Sel value={form.tipoCliente} options={TIPOS_CLIENTE} onChange={e=>setForm(f=>({...f,tipoCliente:e.target.value}))}/></div>
            </div>
            <div><Lbl>Observação</Lbl><Inp value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))} placeholder="Opcional..." rows={2}/></div>
            <div style={{background:"var(--gold-dim)",border:"1px solid var(--gold-glow)",borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,fontWeight:700}}>Lucro estimado</span>
              <span style={{fontFamily:"var(--mono)",fontWeight:900,color:"var(--gold)",fontSize:14}}>{fmt((+form.valor||0)-(+form.custo||0))}</span>
            </div>
            <Btn onClick={add} color="gold" style={{width:"100%",marginTop:2}}>✓ REGISTRAR</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══ CAIXA DIÁRIO ═════════════════════════════════════════════════════
function Caixa({data}) {
  const [filtroMes,setFiltroMes] = useState(mesAtual());
  const meses = [...new Set([mesAtual(),...data.registros.map(r=>r.mes)])];
  const regFiltro = data.registros.filter(r=>r.mes===filtroMes);
  const custosFiltro = data.custos.filter(c=>getMes(c.data)===filtroMes);

  const porDia = useMemo(()=>{
    const map={};
    regFiltro.forEach(r=>{
      if(!map[r.data])map[r.data]={data:r.data,fat:0,custo:0,lucro:0,qtd:0};
      map[r.data].fat+=r.valor;
      map[r.data].custo+=r.custo;
      map[r.data].lucro+=r.lucro;
      map[r.data].qtd+=1;
    });
    return Object.values(map).sort((a,b)=>a.data.localeCompare(b.data));
  },[regFiltro]);

  const totalFat = regFiltro.reduce((s,r)=>s+r.valor,0);
  const totalLucroLiq = regFiltro.reduce((s,r)=>s+r.lucro,0);
  const totalCustoPeca = regFiltro.reduce((s,r)=>s+r.custo,0);
  const qtdServicos = regFiltro.length;
  const ticket = qtdServicos>0?totalFat/qtdServicos:0;
  const maxLucro = Math.max(...porDia.map(d=>d.lucro),1);

  return (
    <div className="fi">
      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
        {meses.map(m=>(
          <button key={m} onClick={()=>setFiltroMes(m)} style={{background:filtroMes===m?"var(--gold)":"var(--card)",color:filtroMes===m?"#000":"var(--muted)",border:"1px solid var(--border)",borderRadius:20,padding:"4px 11px",fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>{m}</button>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginBottom:10}}>
        <Stat label="Faturamento" value={fmt(totalFat)} color="gold"/>
        <Stat label="Lucro Líquido" value={fmt(totalLucroLiq)} color="green"/>
        <Stat label="Custo de Peças" value={fmt(totalCustoPeca)} color="red"/>
        <Stat label="Qtd Serviços" value={qtdServicos} color="silver" sub={`Ticket: R$ ${fmtN(ticket)}`}/>
      </div>

      {porDia.length>0&&(
        <Card gold style={{marginBottom:10}}>
          <Sec color="gold">Lucro Líquido por Dia — {filtroMes}</Sec>
          <div style={{display:"flex",alignItems:"flex-end",gap:3,height:80,marginBottom:6}}>
            {porDia.map(d=>{
              const h=Math.max((d.lucro/maxLucro)*76,2);
              return(
                <div key={d.data} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:"100%",height:`${h}px`,background:d.lucro>0?"linear-gradient(180deg,var(--gold2),var(--gold))":"var(--red)",borderRadius:"3px 3px 0 0",minHeight:2,transition:"height .4s",boxShadow:d.lucro>0?"0 0 6px var(--gold-glow)":"none"}}/>
                  <span style={{fontSize:7,color:"var(--muted)",textAlign:"center",whiteSpace:"nowrap"}}>{d.data.slice(0,5)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card>
        <Sec color="gold">Detalhamento Diário</Sec>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead>
              <tr>{["Data","Faturamento","Custo Peça","Lucro Líq.","Qtd","Ticket"].map(h=>(
                <th key={h} style={{padding:"6px 8px",textAlign:"right",color:"var(--muted)",fontWeight:700,fontSize:9,textTransform:"uppercase",letterSpacing:.8,borderBottom:"1px solid var(--border)"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {porDia.map(d=>(
                <tr key={d.data} style={{borderBottom:"1px solid var(--border)"}}>
                  <td style={{padding:"7px 8px",color:"var(--gold2)",fontFamily:"var(--mono)",fontSize:11}}>{d.data}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"var(--mono)",color:"var(--gold)",fontWeight:700}}>{fmt(d.fat)}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"var(--mono)",color:"var(--muted)"}}>{fmt(d.custo)}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"var(--mono)",color:d.lucro>0?"var(--green)":"var(--red)",fontWeight:700}}>{fmt(d.lucro)}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",color:"var(--silver)",fontWeight:700}}>{d.qtd}</td>
                  <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"var(--mono)",color:"var(--muted)"}}>{fmt(d.qtd>0?d.fat/d.qtd:0)}</td>
                </tr>
              ))}
              <tr style={{background:"#1a1408"}}>
                <td style={{padding:"7px 8px",fontWeight:900,fontSize:11,color:"var(--gold)"}}>TOTAL</td>
                <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"var(--mono)",color:"var(--gold)",fontWeight:900}}>{fmt(totalFat)}</td>
                <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"var(--mono)",color:"var(--muted)",fontWeight:700}}>{fmt(totalCustoPeca)}</td>
                <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"var(--mono)",color:"var(--green)",fontWeight:900}}>{fmt(totalLucroLiq)}</td>
                <td style={{padding:"7px 8px",textAlign:"right",color:"var(--silver)",fontWeight:900}}>{qtdServicos}</td>
                <td style={{padding:"7px 8px",textAlign:"right",fontFamily:"var(--mono)",color:"var(--muted)",fontWeight:700}}>{fmt(ticket)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ══ APARELHOS ════════════════════════════════════════════════════════
function Aparelhos({data,save}) {
  const [modal,setModal] = useState(false);
  const [form,setForm] = useState({nome:"",dataCompra:hoje(),valorCompra:"",valorReparo:"",valorVenda:"",status:"Em estoque",obs:""});

  const add=()=>{if(!form.nome)return;save({...data,aparelhos:[...data.aparelhos,{...form,id:Date.now(),valorCompra:+form.valorCompra||0,valorReparo:+form.valorReparo||0,valorVenda:+form.valorVenda||0}]});setForm({nome:"",dataCompra:hoje(),valorCompra:"",valorReparo:"",valorVenda:"",status:"Em estoque",obs:""});setModal(false);};
  const del=(id)=>save({...data,aparelhos:data.aparelhos.filter(a=>a.id!==id)});
  const updStatus=(id,s)=>save({...data,aparelhos:data.aparelhos.map(a=>a.id===id?{...a,status:s}:a)});

  const emEstoque=data.aparelhos.filter(a=>a.status==="Em estoque");
  const vendidos=data.aparelhos.filter(a=>a.status==="Vendido");
  const lucroTotal=vendidos.reduce((s,a)=>s+(a.valorVenda-(a.valorCompra+a.valorReparo)),0);

  return (
    <div className="fi">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <Stat label="Em estoque" value={emEstoque.length} color="gold"/>
        <Stat label="Vendidos" value={vendidos.length} color="green"/>
        <Stat label="Lucro total" value={fmt(lucroTotal)} color="green"/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:10}}>
        <Btn color="gold" onClick={()=>setModal(true)}>+ Adicionar Aparelho</Btn>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {data.aparelhos.length===0&&<Card><div style={{textAlign:"center",color:"var(--muted)",padding:16}}>Nenhum aparelho cadastrado.</div></Card>}
        {[...data.aparelhos].reverse().map(a=>{
          const custo=a.valorCompra+a.valorReparo;
          const lucro=a.valorVenda-custo;
          const statusColor={Vendido:"green","Em estoque":"gold","Em reparo":"orange"};
          return(
            <Card key={a.id} style={{padding:"11px 14px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
                    <span style={{fontWeight:800,fontSize:13}}>{a.nome}</span>
                    <Badge color={statusColor[a.status]||"silver"}>{a.status}</Badge>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                    {[{l:"Compra",v:a.valorCompra,c:"var(--muted)"},{l:"Reparo",v:a.valorReparo,c:"var(--orange)"},{l:"Venda",v:a.valorVenda,c:"var(--gold)"}].map(({l,v,c})=>(
                      <div key={l}><div style={{fontSize:9,color:"var(--muted)",marginBottom:2}}>{l}</div><div style={{fontFamily:"var(--mono)",fontSize:12,color:c,fontWeight:700}}>{fmt(v)}</div></div>
                    ))}
                  </div>
                  {a.obs&&<div style={{fontSize:10,color:"var(--muted)",marginTop:5,fontStyle:"italic"}}>💬 {a.obs}</div>}
                </div>
                <div style={{textAlign:"right",marginLeft:10}}>
                  <div style={{fontFamily:"var(--mono)",fontWeight:900,fontSize:15,color:lucro>=0?"var(--green)":"var(--red)"}}>{fmt(lucro)}</div>
                  <div style={{fontSize:9,color:"var(--muted)",marginBottom:6}}>lucro</div>
                  <Sel value={a.status} options={["Em estoque","Em reparo","Vendido"]} onChange={e=>updStatus(a.id,e.target.value)} style={{fontSize:10,padding:"3px 7px",width:100}}/>
                  <button onClick={()=>del(a.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:12,display:"block",marginTop:4,marginLeft:"auto"}}>🗑</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {modal&&(
        <Modal title="📱 Novo Aparelho" onClose={()=>setModal(false)} color="gold">
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <div><Lbl>Nome</Lbl><Inp value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: iPhone 14 Pro Max"/></div>
            <div><Lbl>Data compra</Lbl><Inp value={form.dataCompra} onChange={e=>setForm(f=>({...f,dataCompra:e.target.value}))} placeholder="DD/MM/AAAA"/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div><Lbl>Valor compra</Lbl><Inp type="number" value={form.valorCompra} onChange={e=>setForm(f=>({...f,valorCompra:e.target.value}))} placeholder="0"/></div>
              <div><Lbl>Valor reparo</Lbl><Inp type="number" value={form.valorReparo} onChange={e=>setForm(f=>({...f,valorReparo:e.target.value}))} placeholder="0 (opcional)"/></div>
              <div><Lbl>Valor venda</Lbl><Inp type="number" value={form.valorVenda} onChange={e=>setForm(f=>({...f,valorVenda:e.target.value}))} placeholder="0"/></div>
            </div>
            <div><Lbl>Status</Lbl><Sel value={form.status} options={["Em estoque","Em reparo","Vendido"]} onChange={e=>setForm(f=>({...f,status:e.target.value}))}/></div>
            <div><Lbl>Observação</Lbl><Inp value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))} placeholder="Opcional..." rows={2}/></div>
            <div style={{background:"var(--gold-dim)",border:"1px solid var(--gold-glow)",borderRadius:8,padding:"8px 12px",display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,fontWeight:700}}>Lucro estimado</span>
              <span style={{fontFamily:"var(--mono)",fontWeight:900,color:"var(--gold)",fontSize:14}}>{fmt((+form.valorVenda||0)-(+form.valorCompra||0)-(+form.valorReparo||0))}</span>
            </div>
            <Btn onClick={add} color="gold" style={{width:"100%"}}>ADICIONAR</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ══ RANKING ══════════════════════════════════════════════════════════
function Ranking({data}) {
  const [filtroMes,setFiltroMes] = useState("Todos");
  const meses = [...new Set(data.registros.map(r=>r.mes))];
  const regs = filtroMes==="Todos"?data.registros:data.registros.filter(r=>r.mes===filtroMes);

  const topByValue = (campo,n=8) => {
    const map={};
    regs.forEach(r=>{const k=r[campo];if(!k)return;if(!map[k])map[k]={nome:k,qtd:0,valor:0};map[k].qtd++;map[k].valor+=r.valor;});
    return Object.values(map).sort((a,b)=>b.valor-a.valor).slice(0,n);
  };
  const topByQtd = (campo,n=8) => {
    const map={};
    regs.forEach(r=>{const k=r[campo];if(!k)return;if(!map[k])map[k]={nome:k,qtd:0,valor:0};map[k].qtd++;map[k].valor+=r.valor;});
    return Object.values(map).sort((a,b)=>b.qtd-a.qtd).slice(0,n);
  };

  const RankList = ({title,items,color,byQtd=false}) => (
    <Card>
      <Sec color={color}>{title}</Sec>
      {items.length===0&&<div style={{fontSize:11,color:"var(--muted)",padding:"8px 0"}}>Sem dados</div>}
      {items.map((item,i)=>(
        <div key={item.nome} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid var(--border)"}}>
          <span style={{fontFamily:"var(--mono)",fontWeight:900,fontSize:11,color:"var(--gold)",minWidth:20}}>#{i+1}</span>
          <div style={{flex:1}}>
            <div style={{fontSize:12,fontWeight:700}}>{item.nome}</div>
            <div style={{fontSize:9,color:"var(--muted)"}}>{item.qtd} serviço{item.qtd!==1?"s":""}</div>
          </div>
          <span style={{fontFamily:"var(--mono)",fontWeight:700,fontSize:12,color:`var(--${color==="gold"?"gold":color})`}}>
            {byQtd?item.qtd:fmt(item.valor)}
          </span>
        </div>
      ))}
    </Card>
  );

  return (
    <div className="fi">
      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
        {["Todos",...meses].map(m=>(
          <button key={m} onClick={()=>setFiltroMes(m)} style={{background:filtroMes===m?"var(--gold)":"var(--card)",color:filtroMes===m?"#000":"var(--muted)",border:"1px solid var(--border)",borderRadius:20,padding:"4px 11px",fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>{m}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <RankList title="🏆 Top Clientes" items={topByValue("cliente")} color="gold"/>
        <RankList title="📡 Top Origens" items={topByValue("origem")} color="blue"/>
        <RankList title="🔧 Top Serviços" items={topByValue("servico")} color="orange"/>
        <RankList title="📱 Top Aparelhos" items={topByQtd("aparelho")} color="purple" byQtd/>
      </div>
    </div>
  );
}

// ══ CLIENTES ═════════════════════════════════════════════════════════
function Clientes({data}) {
  const [busca,setBusca] = useState("");
  const [detalhe,setDetalhe] = useState(null);

  const clientesMap = useMemo(()=>{
    const map={};
    data.registros.forEach(r=>{
      const k=r.cliente;if(!k)return;
      if(!map[k])map[k]={nome:k,cidade:r.cidade,qtd:0,total:0,ultimaVisita:"",servicos:[]};
      map[k].qtd++;
      map[k].total+=r.valor;
      if(!map[k].ultimaVisita||r.data>map[k].ultimaVisita)map[k].ultimaVisita=r.data;
      map[k].servicos.push({data:r.data,aparelho:r.aparelho,servico:r.servico,valor:r.valor,lucro:r.lucro,pagamento:r.pagamento});
    });
    return Object.values(map).sort((a,b)=>b.total-a.total);
  },[data.registros]);

  const filtrados = busca?clientesMap.filter(c=>c.nome.toLowerCase().includes(busca.toLowerCase())||c.cidade.toLowerCase().includes(busca.toLowerCase())):clientesMap;

  return (
    <div className="fi">
      <div style={{marginBottom:10}}>
        <Inp value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Buscar cliente ou cidade..."/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        <Stat label="Total clientes" value={clientesMap.length} color="gold"/>
        <Stat label="Novos" value={[...new Set(data.registros.filter(r=>r.tipoCliente==="Novo").map(r=>r.cliente))].length} color="green"/>
        <Stat label="Recorrentes" value={clientesMap.filter(c=>c.qtd>1).length} color="silver"/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:7}}>
        {filtrados.length===0&&<Card><div style={{textAlign:"center",color:"var(--muted)",padding:16}}>Nenhum cliente encontrado.</div></Card>}
        {filtrados.map(c=>(
          <Card key={c.nome} style={{padding:"11px 14px",cursor:"pointer",transition:"border-color .2s"}}
            onClick={()=>setDetalhe(c)}
            onMouseEnter={e=>e.currentTarget.style.borderColor="var(--gold-glow)"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                  <span style={{fontWeight:800,fontSize:13}}>{c.nome}</span>
                  <Badge color="silver" style={{fontSize:8}}>{c.cidade}</Badge>
                  {c.qtd>1&&<Badge color="gold" style={{fontSize:8}}>recorrente</Badge>}
                </div>
                <div style={{fontSize:10,color:"var(--muted)"}}>Última visita: {c.ultimaVisita} · {c.qtd} serviço{c.qtd!==1?"s":""}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"var(--mono)",fontWeight:900,fontSize:14,color:"var(--gold)"}}>{fmt(c.total)}</div>
                <div style={{fontSize:9,color:"var(--muted)"}}>total gasto</div>
                <div style={{fontSize:10,color:"var(--gold)",marginTop:3}}>ver histórico →</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {detalhe&&(
        <Modal title={`👤 ${detalhe.nome}`} onClose={()=>setDetalhe(null)} color="gold">
          <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            <Badge color="silver">{detalhe.cidade}</Badge>
            <Badge color="gold">{detalhe.qtd} serviço{detalhe.qtd!==1?"s":""}</Badge>
            <Badge color="green">total {fmt(detalhe.total)}</Badge>
          </div>
          <Sec color="gold">Histórico de Serviços</Sec>
          {[...detalhe.servicos].reverse().map((s,i)=>(
            <div key={i} style={{padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:12,fontWeight:800}}>{s.aparelho}</span>
                <span style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--gold)",fontSize:13}}>{fmt(s.valor)}</span>
              </div>
              <div style={{fontSize:11,color:"var(--gold2)",marginBottom:3}}>{s.servico}</div>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:10,color:"var(--muted)"}}>{s.data} · {s.pagamento}</span>
                <span style={{fontSize:10,color:"var(--green)",fontWeight:700}}>lucro {fmt(s.lucro)}</span>
              </div>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}

// ══ ESTOQUE ══════════════════════════════════════════════════════════
function Estoque({data,save}) {
  const [form,setForm] = useState({peca:"",quantidade:"1",valor:"",obs:""});
  const [busca,setBusca] = useState("");
  const add=()=>{if(!form.peca)return;save({...data,estoque:[...data.estoque,{...form,id:Date.now(),quantidade:+form.quantidade||1,valor:+form.valor||0}]});setForm({peca:"",quantidade:"1",valor:"",obs:""});};
  const del=(id)=>save({...data,estoque:data.estoque.filter(e=>e.id!==id)});
  const upd=(id,f,v)=>save({...data,estoque:data.estoque.map(e=>e.id===id?{...e,[f]:["quantidade","valor"].includes(f)?+v:v}:e)});
  const filtrado=busca?data.estoque.filter(e=>e.peca.toLowerCase().includes(busca.toLowerCase())):data.estoque;
  const totalPecas=data.estoque.reduce((s,e)=>s+e.quantidade,0);
  const valorTotal=data.estoque.reduce((s,e)=>s+(e.valor*e.quantidade),0);

  return (
    <div className="fi">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Stat label="Total peças" value={totalPecas} color="gold"/>
        <Stat label="Valor estoque" value={fmt(valorTotal)} color="green"/>
      </div>
      <Card style={{marginBottom:10}}>
        <Sec color="gold">Adicionar Peça</Sec>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>Peça</Lbl><Inp value={form.peca} onChange={e=>setForm(f=>({...f,peca:e.target.value}))} placeholder="Ex: Tela iPhone 12"/></div>
          <div><Lbl>Qtd</Lbl><Inp type="number" value={form.quantidade} onChange={e=>setForm(f=>({...f,quantidade:e.target.value}))} placeholder="1"/></div>
          <div><Lbl>Valor (R$)</Lbl><Inp type="number" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} placeholder="0 (opcional)"/></div>
        </div>
        <div style={{marginBottom:8}}><Lbl>Obs</Lbl><Inp value={form.obs} onChange={e=>setForm(f=>({...f,obs:e.target.value}))} placeholder="Opcional..."/></div>
        <Btn onClick={add} color="gold" style={{width:"100%"}}>+ ADICIONAR</Btn>
      </Card>
      <div style={{marginBottom:10}}>
        <Inp value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Pesquisar peça por nome..."/>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtrado.length===0&&<Card><div style={{textAlign:"center",color:"var(--muted)",padding:16}}>Nenhuma peça encontrada.</div></Card>}
        {filtrado.map(e=>(
          <Card key={e.id} style={{padding:"10px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:e.obs?3:0}}>{e.peca}</div>
                {e.obs&&<div style={{fontSize:10,color:"var(--muted)"}}>{e.obs}</div>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{textAlign:"center"}}>
                  <Lbl>Qtd</Lbl>
                  <Inp type="number" value={e.quantidade} onChange={ev=>upd(e.id,"quantidade",ev.target.value)} style={{width:50,padding:"3px 6px",fontSize:11,textAlign:"center"}}/>
                </div>
                <div style={{textAlign:"center"}}>
                  <Lbl>Valor R$</Lbl>
                  <Inp type="number" value={e.valor} onChange={ev=>upd(e.id,"valor",ev.target.value)} style={{width:80,padding:"3px 6px",fontSize:11}}/>
                </div>
                <button onClick={()=>del(e.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:14}}>🗑</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══ INVESTIMENTOS ════════════════════════════════════════════════════
function Investimentos({data,save}) {
  const [form,setForm] = useState({data:hoje(),objeto:"",valor:""});
  const add=()=>{if(!form.objeto||!form.valor)return;save({...data,investimentos:[...data.investimentos,{...form,id:Date.now(),valor:+form.valor}]});setForm({data:hoje(),objeto:"",valor:""});};
  const del=(id)=>save({...data,investimentos:data.investimentos.filter(i=>i.id!==id)});
  const total=data.investimentos.reduce((s,i)=>s+i.valor,0);
  return (
    <div className="fi">
      <Stat label="Total Investido" value={fmt(total)} color="gold" style={{marginBottom:10}}/>
      <Card gold style={{marginBottom:10}}>
        <Sec color="gold">Novo Investimento</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 2fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>Data</Lbl><Inp value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))} placeholder="DD/MM/AAAA"/></div>
          <div><Lbl>Objeto</Lbl><Inp value={form.objeto} onChange={e=>setForm(f=>({...f,objeto:e.target.value}))} placeholder="Ex: Ferro de solda"/></div>
          <div><Lbl>Valor R$</Lbl><Inp type="number" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} placeholder="0"/></div>
        </div>
        <Btn onClick={add} color="gold" style={{width:"100%"}}>+ ADICIONAR</Btn>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {[...data.investimentos].reverse().map(i=>(
          <Card key={i.id} style={{padding:"9px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontWeight:700,fontSize:13}}>{i.objeto}</div><div style={{fontSize:10,color:"var(--muted)"}}>{i.data}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--gold)",fontSize:13}}>{fmt(i.valor)}</span>
                <button onClick={()=>del(i.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:13}}>🗑</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══ GARANTIAS ════════════════════════════════════════════════════════
function Garantias({data,save}) {
  const [form,setForm] = useState({data:hoje(),cliente:"",motivo:"",custo:"",status:"Em andamento"});
  const add=()=>{if(!form.cliente)return;save({...data,garantias:[...data.garantias,{...form,id:Date.now(),custo:+form.custo||0}]});setForm({data:hoje(),cliente:"",motivo:"",custo:"",status:"Em andamento"});};
  const del=(id)=>save({...data,garantias:data.garantias.filter(g=>g.id!==id)});
  const updStatus=(id,s)=>save({...data,garantias:data.garantias.map(g=>g.id===id?{...g,status:s}:g)});
  const total=data.garantias.reduce((s,g)=>s+g.custo,0);
  return (
    <div className="fi">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Stat label="Total garantias" value={data.garantias.length} color="red"/>
        <Stat label="Custo total" value={fmt(total)} color="red"/>
      </div>
      <Card style={{marginBottom:10}}>
        <Sec color="red">Registrar Garantia</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>Data</Lbl><Inp value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))} placeholder="DD/MM/AAAA"/></div>
          <div><Lbl>Cliente</Lbl><Inp value={form.cliente} onChange={e=>setForm(f=>({...f,cliente:e.target.value}))} placeholder="Nome"/></div>
        </div>
        <div style={{marginBottom:8}}><Lbl>Motivo</Lbl><Inp value={form.motivo} onChange={e=>setForm(f=>({...f,motivo:e.target.value}))} placeholder="O que aconteceu?" rows={2}/></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>Custo R$ (opcional)</Lbl><Inp type="number" value={form.custo} onChange={e=>setForm(f=>({...f,custo:e.target.value}))} placeholder="0"/></div>
          <div><Lbl>Status</Lbl><Sel value={form.status} options={["Em andamento","Resolvida"]} onChange={e=>setForm(f=>({...f,status:e.target.value}))}/></div>
        </div>
        <Btn onClick={add} color="red" style={{width:"100%"}}>+ REGISTRAR</Btn>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {data.garantias.map(g=>(
          <Card key={g.id} style={{padding:"10px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4}}>
                  <span style={{fontWeight:800,fontSize:13}}>{g.cliente}</span>
                  <Badge color={g.status==="Resolvida"?"green":"orange"}>{g.status}</Badge>
                  <span style={{fontSize:9,color:"var(--muted)"}}>{g.data}</span>
                </div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{g.motivo}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginLeft:8}}>
                <span style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--red)",fontSize:13}}>{fmt(g.custo)}</span>
                <Sel value={g.status} options={["Em andamento","Resolvida"]} onChange={e=>updStatus(g.id,e.target.value)} style={{fontSize:10,padding:"3px 7px",width:110}}/>
                <button onClick={()=>del(g.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:13}}>🗑</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══ CUSTOS ═══════════════════════════════════════════════════════════
function Custos({data,save}) {
  const tiposCusto = data.config.tiposCusto||["Peças","Marketing","Gasolina","Garantia","Investimentos","Outros"];
  const [form,setForm] = useState({data:hoje(),descricao:"",tipo:tiposCusto[0],valor:""});
  const [filtroMes,setFiltroMes] = useState(mesAtual());
  const add=()=>{if(!form.descricao||!form.valor)return;save({...data,custos:[...data.custos,{...form,id:Date.now(),valor:+form.valor}]});setForm(f=>({...f,descricao:"",valor:""}));};
  const del=(id)=>save({...data,custos:data.custos.filter(c=>c.id!==id)});
  const meses=[...new Set([mesAtual(),...data.custos.map(c=>getMes(c.data)).filter(Boolean)])];
  const lista=filtroMes==="Todos"?data.custos:data.custos.filter(c=>getMes(c.data)===filtroMes);
  const total=lista.reduce((s,c)=>s+c.valor,0);
  const tipoColor={Peças:"silver",Marketing:"orange",Gasolina:"gold",Garantia:"red",Investimentos:"purple",Outros:"blue"};
  return (
    <div className="fi">
      <div style={{display:"flex",gap:6,marginBottom:10,overflowX:"auto",paddingBottom:4}}>
        {["Todos",...meses].map(m=>(
          <button key={m} onClick={()=>setFiltroMes(m)} style={{background:filtroMes===m?"var(--gold)":"var(--card)",color:filtroMes===m?"#000":"var(--muted)",border:"1px solid var(--border)",borderRadius:20,padding:"4px 11px",fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap"}}>{m}</button>
        ))}
      </div>
      <Stat label="Total custos" value={fmt(total)} color="orange" style={{marginBottom:10}}/>
      <Card style={{marginBottom:10}}>
        <Sec color="orange">Novo Custo</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>Data</Lbl><Inp value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))} placeholder="DD/MM/AAAA"/></div>
          <div><Lbl>Tipo</Lbl><Sel value={form.tipo} options={tiposCusto} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>Descrição</Lbl><Inp value={form.descricao} onChange={e=>setForm(f=>({...f,descricao:e.target.value}))} placeholder="Ex: Aluguel"/></div>
          <div><Lbl>Valor R$</Lbl><Inp type="number" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} placeholder="0"/></div>
        </div>
        <Btn onClick={add} color="orange" style={{width:"100%"}}>+ ADICIONAR</Btn>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {lista.map(c=>(
          <Card key={c.id} style={{padding:"9px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                  <span style={{fontWeight:700,fontSize:13}}>{c.descricao}</span>
                  <Badge color={tipoColor[c.tipo]||"silver"} style={{fontSize:8}}>{c.tipo||"Outros"}</Badge>
                </div>
                <div style={{fontSize:10,color:"var(--muted)"}}>{c.data}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontFamily:"var(--mono)",fontWeight:700,color:"var(--orange)",fontSize:13}}>{fmt(c.valor)}</span>
                <button onClick={()=>del(c.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:13}}>🗑</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══ DEVEDORES ════════════════════════════════════════════════════════
function Devedores({data,save}) {
  const [form,setForm] = useState({nome:"",data:hoje(),valor:"",referente:"",status:"Pendente"});
  const add=()=>{if(!form.nome||!form.valor)return;save({...data,devedores:[...data.devedores,{...form,id:Date.now(),valor:+form.valor}]});setForm({nome:"",data:hoje(),valor:"",referente:"",status:"Pendente"});};
  const del=(id)=>save({...data,devedores:data.devedores.filter(d=>d.id!==id)});
  const updStatus=(id,s)=>save({...data,devedores:data.devedores.map(d=>d.id===id?{...d,status:s}:d)});
  const pendentes=data.devedores.filter(d=>d.status==="Pendente").reduce((s,d)=>s+d.valor,0);
  return (
    <div className="fi">
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
        <Stat label="A receber" value={fmt(pendentes)} color="red"/>
        <Stat label="Total registrado" value={fmt(data.devedores.reduce((s,d)=>s+d.valor,0))} color="orange"/>
      </div>
      <Card style={{marginBottom:10}}>
        <Sec color="red">Novo Devedor</Sec>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>Nome</Lbl><Inp value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Nome"/></div>
          <div><Lbl>Data</Lbl><Inp value={form.data} onChange={e=>setForm(f=>({...f,data:e.target.value}))} placeholder="DD/MM/AAAA"/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
          <div><Lbl>Valor R$</Lbl><Inp type="number" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))} placeholder="0"/></div>
          <div><Lbl>Referente</Lbl><Inp value={form.referente} onChange={e=>setForm(f=>({...f,referente:e.target.value}))} placeholder="Ex: Conserto tela"/></div>
        </div>
        <Btn onClick={add} color="red" style={{width:"100%"}}>+ ADICIONAR</Btn>
      </Card>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {data.devedores.length===0&&<Card><div style={{textAlign:"center",color:"var(--muted)",padding:16,fontSize:12}}>Nenhum devedor. 👍</div></Card>}
        {[...data.devedores].reverse().map(d=>(
          <Card key={d.id} style={{padding:"10px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                  <span style={{fontWeight:800,fontSize:13}}>{d.nome}</span>
                  <Badge color={d.status==="Recebido"?"green":"red"}>{d.status}</Badge>
                </div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{d.referente} · {d.data}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontFamily:"var(--mono)",fontWeight:900,color:d.status==="Recebido"?"var(--green)":"var(--red)",fontSize:14}}>{fmt(d.valor)}</span>
                <Sel value={d.status} options={["Pendente","Recebido"]} onChange={e=>updStatus(d.id,e.target.value)} style={{fontSize:10,padding:"3px 7px",width:100}}/>
                <button onClick={()=>del(d.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:13}}>🗑</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ══ CONFIG ═══════════════════════════════════════════════════════════
function Config({data,save}) {
  const cfg = data.config;
  const [loc,setLoc] = useState({metaFaturamento:cfg.metaFaturamento,metaLucro:cfg.metaLucro});
  const [saved,setSaved] = useState(false);
  const [newOrigem,setNewOrigem] = useState("");
  const [newModo,setNewModo] = useState("");
  const [newTipoCusto,setNewTipoCusto] = useState("");

  const saveMetas=()=>{save({...data,config:{...cfg,...loc}});setSaved(true);setTimeout(()=>setSaved(false),2000);};
  const addOrigem=()=>{if(!newOrigem||cfg.origens.includes(newOrigem))return;save({...data,config:{...cfg,origens:[...cfg.origens,newOrigem]}});setNewOrigem("");};
  const delOrigem=(o)=>save({...data,config:{...cfg,origens:cfg.origens.filter(x=>x!==o)}});
  const addModo=()=>{if(!newModo||cfg.modos.includes(newModo))return;save({...data,config:{...cfg,modos:[...cfg.modos,newModo]}});setNewModo("");};
  const delModo=(m)=>save({...data,config:{...cfg,modos:cfg.modos.filter(x=>x!==m)}});
  const addTipoCusto=()=>{if(!newTipoCusto||(cfg.tiposCusto||[]).includes(newTipoCusto))return;save({...data,config:{...cfg,tiposCusto:[...(cfg.tiposCusto||[]),newTipoCusto]}});setNewTipoCusto("");};
  const delTipoCusto=(t)=>save({...data,config:{...cfg,tiposCusto:(cfg.tiposCusto||[]).filter(x=>x!==t)}});
  const exportData=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`salomao-iphones-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);};

  const ListEditor=({title,items,onAdd,onDel,value,onChange,placeholder,color="gold"})=>(
    <Card style={{marginBottom:10}}>
      <Sec color={color}>{title}</Sec>
      <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:10}}>
        {items.map(item=>(
          <div key={item} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"var(--gold-dim)",border:"1px solid var(--gold-glow)",borderRadius:8}}>
            <span style={{fontSize:12,color:"var(--gold)"}}>{item}</span>
            <button onClick={()=>onDel(item)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",fontSize:12}}>✕</button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:7}}>
        <Inp value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onKeyDown={e=>e.key==="Enter"&&onAdd()}/>
        <Btn color={color} sm onClick={onAdd} style={{whiteSpace:"nowrap"}}>+ Add</Btn>
      </div>
    </Card>
  );

  return (
    <div className="fi">
      <Card gold style={{marginBottom:10}}>
        <Sec color="gold">Metas do Negócio</Sec>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {[{label:"Meta Faturamento Mensal (R$)",key:"metaFaturamento"},{label:"Meta Lucro Mensal (R$)",key:"metaLucro"}].map(({label,key})=>(
            <div key={key}><Lbl>{label}</Lbl>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <Inp type="number" value={loc[key]} onChange={e=>setLoc(f=>({...f,[key]:+e.target.value}))} style={{color:"var(--gold)"}}/>
                <span style={{fontFamily:"var(--mono)",fontSize:12,color:"var(--gold)",fontWeight:800,minWidth:110}}>{fmt(loc[key])}</span>
              </div>
            </div>
          ))}
          <Btn onClick={saveMetas} color={saved?"green":"gold"}>{saved?"✅ Salvo!":"💾 Salvar Metas"}</Btn>
        </div>
      </Card>

      <ListEditor title="Origens do Serviço" items={cfg.origens} onAdd={addOrigem} onDel={delOrigem} value={newOrigem} onChange={setNewOrigem} placeholder="Nova origem..." color="gold"/>
      <ListEditor title="Modos de Atendimento" items={cfg.modos} onAdd={addModo} onDel={delModo} value={newModo} onChange={setNewModo} placeholder="Novo modo..." color="silver"/>
      <ListEditor title="Tipos de Custo" items={cfg.tiposCusto||[]} onAdd={addTipoCusto} onDel={delTipoCusto} value={newTipoCusto} onChange={setNewTipoCusto} placeholder="Novo tipo..." color="orange"/>

      <Card>
        <Sec color="silver">Backup dos Dados</Sec>
        <div style={{fontSize:12,color:"var(--muted)",marginBottom:12,lineHeight:1.7}}>
          Exporte seus dados como JSON. Use o botão <strong style={{color:"var(--gold)"}}>Import</strong> no topo para restaurar.
        </div>
        <Btn color="gold" onClick={exportData} style={{display:"flex",alignItems:"center",gap:6}}>⬇️ Exportar Dados</Btn>
        <div style={{marginTop:10,padding:"9px 12px",background:"#1a1408",borderRadius:8,fontSize:11,color:"var(--muted)"}}>
          ⚠️ Dados salvos neste navegador. Exporte regularmente para não perder nada.
        </div>
      </Card>
    </div>
  );
}
