import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// ─── FIREBASE ─────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBpMuD38KnyvnoB2FQmgP-IOkrf19QWGBc",
  authDomain: "salomao-iphones-gestao.firebaseapp.com",
  projectId: "salomao-iphones-gestao",
  storageBucket: "salomao-iphones-gestao.firebasestorage.app",
  messagingSenderId: "127689521136",
  appId: "1:127689521136:web:775ef6d0c8517c2f9e8f35",
};
const FIREBASE_CONFIGURED = !FIREBASE_CONFIG.apiKey.includes("COLE_");
const FIREBASE_DOC_ID = "salomao_iphones_main";
let db = null;
let firebaseReady = false;

async function initFirebase() {
  if (!FIREBASE_CONFIGURED || firebaseReady) return;
  const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
  const { getFirestore, doc, setDoc, getDoc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
  if (!getApps().length) initializeApp(FIREBASE_CONFIG);
  db = getFirestore();
  window._fsDoc = doc; window._fsSetDoc = setDoc; window._fsGetDoc = getDoc; window._fsOnSnapshot = onSnapshot;
  firebaseReady = true;
}
async function saveToFirebase(data) {
  if (!firebaseReady || !db) return false;
  try {
    await window._fsSetDoc(window._fsDoc(db, "appdata", FIREBASE_DOC_ID), { data: JSON.stringify(data), updatedAt: Date.now() });
    return true;
  } catch (e) { console.warn("Erro ao salvar na nuvem:", e); return false; }
}
async function loadFromFirebase() {
  if (!firebaseReady || !db) return null;
  const snap = await window._fsGetDoc(window._fsDoc(db, "appdata", FIREBASE_DOC_ID));
  return snap.exists() ? JSON.parse(snap.data().data) : null;
}
function subscribeFirebase(cb) {
  if (!firebaseReady || !db) return () => {};
  try {
    return window._fsOnSnapshot(window._fsDoc(db, "appdata", FIREBASE_DOC_ID), (snap) => {
      if (!snap.exists()) return;
      try { cb(JSON.parse(snap.data().data), snap.metadata.hasPendingWrites); } catch { /* ignora */ }
    });
  } catch { return () => {}; }
}

// ─── LOGOS ─────────────────────────────────────────────────────────────
const OS_LOGO="data:image/jpeg;base64,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";
const MARK="data:image/jpeg;base64,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";

// ─── CONSTANTES E HELPERS ─────────────────────────────────────────────
const STORAGE_KEY = "salomao_iphones_v2";
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DIAS_SEMANA = ["dom","seg","ter","qua","qui","sex","sáb"];
const PAGAMENTOS = ["Pix","Dinheiro","Débito","Crédito","Pendente"];
const STATUS_APARELHO = ["Em estoque","Em reparo","Vendido"];
const DEFAULT_CONFIG = {
  metaFaturamento: 15000,
  metaLucro: 10000,
  origens: ["Indicação","Vizinho","Parceiro","Tráfego pago","Instagram","Network","Loja","Outros"],
  modos: ["Laboratório","Leva e traz","Delivery"],
  tiposCusto: ["Transporte","Marketing","Acessório","Peças","Outros"],
};
const TIPOS_CONHECIDOS = ["Transporte","Acessório","Marketing","Peças","Garantia","Investimentos"];

const uid = () => Date.now() + Math.floor(Math.random() * 1000);
const toNum = (s) => {
  if (typeof s === "number") return isFinite(s) ? s : 0;
  let t = String(s || "").trim();
  if (!t) return 0;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(t);
  return isFinite(n) ? n : 0;
};
const fmt = (v) => {
  const n = Number(v || 0);
  const s = Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (n < 0 ? "−R$ " : "R$ ") + s;
};
const fmtK = (v) => {
  const n = Math.round(Number(v || 0));
  return (n < 0 ? "−R$ " : "R$ ") + Math.abs(n).toLocaleString("pt-BR");
};
const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
const capitalize = (s) => { const t = String(s || "").trim(); return t ? t[0].toUpperCase() + t.slice(1) : t; };
const isUpperStart = (s) => { const c = String(s || "").trim()[0]; return !!c && c !== c.toLowerCase(); };

const parseDMY = (s) => {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(String(s || "").trim());
  if (!m) return null;
  let y = +m[3]; if (y < 100) y += 2000;
  const d = new Date(y, +m[2] - 1, +m[1]);
  return isNaN(d) ? null : d;
};
const pad = (n) => String(n).padStart(2, "0");
const toDMY = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const hoje = () => toDMY(new Date());
const dmyToISO = (s) => { const d = parseDMY(s); return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : ""; };
const isoToDMY = (s) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); return m ? `${m[3]}/${m[2]}/${m[1]}` : ""; };
const labelMes = (y, m) => `${MESES[m]}/${y}`;
const mesAtual = () => { const d = new Date(); return labelMes(d.getFullYear(), d.getMonth()); };
const parseMes = (l) => { const [a, b] = String(l || "").split("/"); const m = MESES.indexOf(a); return m < 0 || !+b ? null : { y: +b, m }; };
const chaveMes = (l) => { const p = parseMes(l); return p ? p.y * 12 + p.m : -1; };
const mesAnterior = (l) => { const p = parseMes(l); if (!p) return ""; const d = new Date(p.y, p.m - 1, 1); return labelMes(d.getFullYear(), d.getMonth()); };
const diasNoMes = (l) => { const p = parseMes(l); return p ? new Date(p.y, p.m + 1, 0).getDate() : 30; };
const mesDe = (data, fallback) => { const d = parseDMY(data); return d ? labelMes(d.getFullYear(), d.getMonth()) : (fallback || ""); };
const tempo = (item) => { const d = parseDMY(item.data); return d ? d.getTime() : 0; };
const porDataDesc = (a, b) => (tempo(b) - tempo(a)) || ((Number(b.id) || 0) - (Number(a.id) || 0));
const rotuloDia = (data) => {
  const d = parseDMY(data);
  if (!d) return data || "Sem data";
  const h = new Date(); h.setHours(0, 0, 0, 0);
  const diff = Math.round((h - d) / 86400000);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return `${capitalize(DIAS_SEMANA[d.getDay()])}, ${d.getDate()} ${MESES[d.getMonth()].toLowerCase()}`;
};

const lucroOS = (r) => toNum(r.valor) - toNum(r.custo) - toNum(r.taxaCartao);
const lucroVenda = (v) => toNum(v.valor) - toNum(v.custo);
const lucroAparelho = (a) => toNum(a.valorVenda) - toNum(a.valorCompra) - toNum(a.valorReparo);
const splitServ = (s) => String(s || "").split(/\s*\+\s*/).map((x) => x.trim()).filter(Boolean);

// Escolhe o nome de exibição de um grupo (ex.: "tela" e "Tela" → "Tela")
function escolherNome(variantes, preferirMaiuscula) {
  const lista = [...variantes.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
  if (!preferirMaiuscula) return lista[0];
  return lista.find(isUpperStart) || capitalize(lista[0]);
}
// Lista de sugestões sem repetição (ignora maiúsculas/acentos), mais usadas primeiro
function sugestoesDe(valores, preferirMaiuscula = true) {
  const mapa = new Map();
  valores.forEach((v) => {
    const t = String(v || "").trim(); if (!t) return;
    const k = norm(t);
    const e = mapa.get(k) || { n: 0, vars: new Map() };
    e.n++; e.vars.set(t, (e.vars.get(t) || 0) + 1); mapa.set(k, e);
  });
  return [...mapa.values()].sort((a, b) => b.n - a.n).map((e) => escolherNome(e.vars, preferirMaiuscula));
}

// ─── NORMALIZAÇÃO E MIGRAÇÃO DOS DADOS ────────────────────────────────
function normalize(raw) {
  const d = raw && typeof raw === "object" ? raw : {};
  const cfg = { ...DEFAULT_CONFIG, ...(d.config || {}) };
  cfg.metaFaturamento = toNum(cfg.metaFaturamento) || DEFAULT_CONFIG.metaFaturamento;
  cfg.metaLucro = toNum(cfg.metaLucro) || DEFAULT_CONFIG.metaLucro;
  cfg.origens = Array.isArray(cfg.origens) && cfg.origens.length ? cfg.origens : DEFAULT_CONFIG.origens;
  cfg.modos = Array.isArray(cfg.modos) && cfg.modos.length ? cfg.modos : DEFAULT_CONFIG.modos;
  let tipos = (Array.isArray(cfg.tiposCusto) ? cfg.tiposCusto : [])
    .map((t) => (t === "Gasolina" ? "Transporte" : t))
    .filter((t) => t && t !== "Garantia" && t !== "Investimentos");
  DEFAULT_CONFIG.tiposCusto.forEach((t) => { if (!tipos.includes(t)) tipos.push(t); });
  cfg.tiposCusto = [...new Set(tipos)];

  const registros = (Array.isArray(d.registros) ? d.registros : []).map((r) => {
    const { servicos, servicoInput, gasolina, lucro, ...rest } = r;
    let servico = r.servico;
    if (!servico && Array.isArray(servicos) && servicos.length) servico = servicos.join(" + ");
    const kind = r.kind || "os";
    return {
      ...rest,
      kind,
      servico: servico || "",
      mes: mesDe(r.data, r.mes),
      valor: toNum(r.valor), custo: toNum(r.custo), taxaCartao: toNum(r.taxaCartao),
      transporte: toNum(r.transporte != null ? r.transporte : gasolina),
      acessorio: toNum(r.acessorio),
      custoGar: toNum(r.custoGar),
      tipoCliente: r.tipoCliente === "Antigo" ? "Recorrente" : (r.tipoCliente || "Novo"),
    };
  });

  // Garantias antigas viram OS de garantia na lista
  (Array.isArray(d.garantias) ? d.garantias : []).forEach((g) => {
    const id = "gar_" + g.id;
    if (registros.some((r) => r.id === id)) return;
    const ant = registros.filter((r) => r.kind === "os" && norm(r.cliente) === norm(g.cliente)).sort(porDataDesc)[0];
    registros.push({
      id, kind: "garantia", data: g.data || "", mes: mesDe(g.data, ""), cliente: g.cliente || "",
      cidade: ant ? ant.cidade : "", aparelho: ant ? ant.aparelho : "", servico: ant ? ant.servico : "",
      refId: ant ? ant.id : null, motivo: g.motivo || "", fornecedor: "", custoGar: toNum(g.custo),
      valor: 0, custo: 0, taxaCartao: 0, transporte: 0, acessorio: 0,
    });
  });

  // Custos: Gasolina → Transporte e remove cópias automáticas antigas (agora vêm direto da OS)
  const custos = (Array.isArray(d.custos) ? d.custos : [])
    .map((c) => ({
      ...c,
      tipo: c.tipo === "Gasolina" ? "Transporte" : (c.tipo || "Outros"),
      descricao: String(c.descricao || "").replace(/^Gasolina —/, "Transporte —"),
      valor: toNum(c.valor),
    }))
    .filter((c) => {
      const m = /^(Transporte|Acessório) — (.+)$/.exec(c.descricao);
      if (!m) return true;
      const campo = m[1] === "Transporte" ? "transporte" : "acessorio";
      return !registros.some((r) => r.kind === "os" && r.data === c.data && r.cliente === m[2] && Math.abs(toNum(r[campo]) - c.valor) < 0.01);
    });

  const aparelhos = (Array.isArray(d.aparelhos) ? d.aparelhos : []).map((a) => ({
    ...a, dataCompra: a.dataCompra || "", dataVenda: a.dataVenda || "",
    valorCompra: toNum(a.valorCompra), valorReparo: toNum(a.valorReparo), valorVenda: toNum(a.valorVenda),
    status: STATUS_APARELHO.includes(a.status) ? a.status : "Em estoque",
  }));
  const estoque = (Array.isArray(d.estoque) ? d.estoque : []).map((e) => ({
    id: e.id, item: e.item != null ? e.item : (e.peca || ""), quantidade: toNum(e.quantidade), valor: toNum(e.valor), obs: e.obs || "",
  }));
  const vendas = (Array.isArray(d.vendas) ? d.vendas : []).map((v) => ({
    ...v, mes: mesDe(v.data, v.mes), qtd: toNum(v.qtd) || 1, valor: toNum(v.valor), custo: toNum(v.custo),
  }));
  const investimentos = (Array.isArray(d.investimentos) ? d.investimentos : []).map((i) => ({ ...i, valor: toNum(i.valor) }));
  const devedores = (Array.isArray(d.devedores) ? d.devedores : []).map((x) => ({ ...x, valor: toNum(x.valor), status: x.status || "Pendente" }));

  return {
    config: cfg, registros, vendas, aparelhos, estoque, investimentos, custos, devedores,
    clientesInfo: d.clientesInfo && typeof d.clientesInfo === "object" ? d.clientesInfo : {},
    garantias: [],
    _ts: d._ts || 0,
  };
}

// ─── CÁLCULOS DO MÊS ──────────────────────────────────────────────────
function calcMes(data, mes) {
  const noMes = (dt, fb) => mesDe(dt, fb) === mes;
  const os = data.registros.filter((r) => r.kind === "os" && noMes(r.data, r.mes));
  const gar = data.registros.filter((r) => r.kind === "garantia" && noMes(r.data, r.mes));
  const vendas = data.vendas.filter((v) => noMes(v.data, v.mes));
  const aps = data.aparelhos.filter((a) => a.status === "Vendido" && noMes(a.dataVenda));
  const soma = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  const bloco = (fat, lucro, qtd) => ({ fat, lucro, qtd, ticket: qtd ? fat / qtd : 0 });

  const serv = bloco(soma(os, (r) => r.valor), soma(os, lucroOS), os.length);
  const vend = { ...bloco(soma(vendas, (v) => v.valor), soma(vendas, lucroVenda), vendas.length), itens: soma(vendas, (v) => v.qtd) };
  const apar = bloco(soma(aps, (a) => a.valorVenda), soma(aps, lucroAparelho), aps.length);

  const custosM = data.custos.filter((c) => noMes(c.data));
  const manual = (t) => soma(custosM.filter((c) => c.tipo === t), (c) => c.valor);
  const pecas = soma(os, (r) => r.custo);
  const taxas = soma(os, (r) => r.taxaCartao);
  const transporte = soma(os, (r) => r.transporte) + manual("Transporte");
  const acessorios = soma(os, (r) => r.acessorio) + manual("Acessório");
  const marketing = manual("Marketing");
  const pecasAvulsas = manual("Peças");
  const garantias = soma(gar, (g) => g.custoGar) + manual("Garantia");
  const garantiasQtd = gar.length + custosM.filter((c) => c.tipo === "Garantia").length;
  const investimentos = soma(data.investimentos.filter((i) => noMes(i.data)), (i) => i.valor) + manual("Investimentos");
  const outros = soma(custosM.filter((c) => !TIPOS_CONHECIDOS.includes(c.tipo)), (c) => c.valor);

  const fatTotal = serv.fat + vend.fat + apar.fat;
  const lucroTotal = serv.lucro + vend.lucro + apar.lucro;
  const lucroReal = lucroTotal - transporte - acessorios - marketing - garantias - outros - pecasAvulsas;
  const custoTotal = pecas + taxas + transporte + acessorios + marketing + garantias + outros + pecasAvulsas;

  return {
    os, gar, vendas, aps, serv, vend, apar, fatTotal, lucroTotal, lucroReal, custoTotal,
    custos: { pecas, pecasAvulsas, taxas, transporte, acessorios, marketing, garantias, garantiasQtd, investimentos, outros },
  };
}

// Movimento por dia (serviços + vendas + aparelhos)
function movimentoPorDia(c) {
  const mapa = new Map();
  const add = (data, fat, lucro) => {
    const d = parseDMY(data); if (!d) return;
    const k = d.getDate();
    const e = mapa.get(k) || { dia: k, data: toDMY(d), fat: 0, lucro: 0, qtd: 0 };
    e.fat += fat; e.lucro += lucro; e.qtd += 1; mapa.set(k, e);
  };
  c.os.forEach((r) => add(r.data, r.valor, lucroOS(r)));
  c.vendas.forEach((v) => add(v.data, v.valor, lucroVenda(v)));
  c.aps.forEach((a) => add(a.dataVenda, a.valorVenda, lucroAparelho(a)));
  return mapa;
}

// ─── PDF DA ORDEM DE SERVIÇO ──────────────────────────────────────────
const GARANTIAS = [
  { v: "Sem garantia", t: "" },
  { v: "30 dias", t: "30 (trinta) dias" },
  { v: "3 meses", t: "3 (três) meses" },
  { v: "6 meses", t: "6 (seis) meses" },
  { v: "1 ano", t: "1 (um) ano" },
];
const garantiaTexto = (v) => (GARANTIAS.find((g) => g.v === v) || {}).t || v;

function termosPadrao(peca, garantia) {
  if (!garantia || garantia === "Sem garantia") return "Este serviço não possui garantia.";
  const gt = garantiaTexto(garantia);
  const p1 = peca
    ? `A peça utilizada neste serviço (${peca}) possui ${gt} de garantia, contados a partir da data de realização do serviço. A garantia cobre exclusivamente defeitos de fabricação da peça, desde que constatados pela assistência técnica.`
    : `O serviço realizado possui ${gt} de garantia, contados a partir da data de sua realização. A garantia cobre exclusivamente defeitos decorrentes do serviço executado, desde que constatados pela assistência técnica.`;
  const p2 = "A garantia NÃO cobre: quebra, trincas ou rachaduras na tela; arranhões profundos ou danos físicos; marcas de pressão, amassados ou danos causados por impacto; quedas ou acidentes; contato com água, líquidos ou umidade; oxidação ou corrosão; mau uso ou uso inadequado do aparelho; danos provocados por acessórios, carregadores ou fontes inadequadas; tentativas de abertura, reparo ou manutenção realizadas por terceiros; danos decorrentes de outros componentes ou defeitos preexistentes no aparelho; e qualquer dano decorrente de fatores externos que não caracterizem defeito de fabricação.";
  const p3 = "Para acionamento da garantia, o aparelho deverá ser apresentado à assistência técnica para avaliação. A garantia será válida somente após a constatação de que o problema apresentado é decorrente de defeito de fabricação da peça.";
  return [p1, p2, p3].join("\n\n");
}

function buildOSPdf(JsPDF, f, logo) {
  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const NAVY = [15, 27, 42], GOLD = [201, 147, 58], INK = [32, 32, 36], GRAY = [112, 112, 118];
  const X = 15, W = 180, LW = 50, BOTTOM = 280;
  const money = (v) => "R$ " + Number(v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const moldura = () => {
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.3); doc.rect(8, 8, 194, 281);
    doc.setLineWidth(1.1);
    doc.line(8, 8, 24, 8); doc.line(8, 8, 8, 24);
    doc.line(202, 289, 186, 289); doc.line(202, 289, 202, 273);
  };
  moldura();
  let y = 14;
  const novaPaginaSe = (h) => { if (y + h > BOTTOM) { doc.addPage(); moldura(); y = 16; } };

  if (logo) { try { doc.addImage(logo, "JPEG", 86.5, y, 37, 37); } catch (e) { /* segue sem logo */ } }
  y += 46;
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(...NAVY);
  doc.text("ORDEM DE SERVIÇO", 105, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY);
  doc.text("ASSISTÊNCIA TÉCNICA ESPECIALIZADA EM IPHONES", 105, y, { align: "center" });
  y += 6;

  const cabecalho = (titulo) => {
    novaPaginaSe(16);
    doc.setFillColor(...NAVY); doc.rect(X, y, W, 7.5, "F");
    doc.setFillColor(...GOLD); doc.rect(X, y + 7.5, W, 0.6, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(255, 255, 255);
    doc.text(titulo, X + 5, y + 5.1);
    y += 8.1;
  };

  const secao = (titulo, linhas) => {
    const validas = linhas.filter(([, v, obrig]) => obrig || (v && String(v).trim()));
    if (!validas.length) return;
    cabecalho(titulo);
    validas.forEach(([rotulo, valor]) => {
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      const txt = doc.splitTextToSize(String(valor || "—"), W - LW - 8);
      const h = Math.max(7.4, txt.length * 4.3 + 3.2);
      novaPaginaSe(h);
      doc.setFillColor(244, 245, 247); doc.rect(X, y, LW, h, "F");
      doc.setDrawColor(226, 228, 232); doc.setLineWidth(0.2);
      doc.rect(X, y, W, h); doc.line(X + LW, y, X + LW, y + h);
      doc.setFont("helvetica", "bold"); doc.setFontSize(7.8); doc.setTextColor(...NAVY);
      doc.text(rotulo, X + 4, y + 4.8);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(...INK);
      txt.forEach((l, i) => doc.text(l, X + LW + 4, y + 4.8 + i * 4.3));
      y += h;
    });
    y += 3;
  };

  secao("DADOS DO CLIENTE", [
    ["NOME", f.nome, true],
    ["TELEFONE", f.telefone],
    ["ENDEREÇO", f.endereco],
  ]);
  secao("DADOS DO APARELHO", [
    ["APARELHO", f.aparelho, true],
    ["DEFEITO INFORMADO", f.defeito],
    ["MODALIDADE", f.modalidade],
  ]);
  secao("SERVIÇO REALIZADO", [
    ["SERVIÇO", f.servico, true],
    ["PEÇA UTILIZADA", f.peca],
    ["GARANTIA DA PEÇA", f.garantia === "Sem garantia" ? "Sem garantia" : garantiaTexto(f.garantia)],
    ["VALOR DO SERVIÇO", money(f.valor), true],
    ["PAGAMENTO", f.pagamento],
    ["DATA", f.data, true],
  ]);

  // Termos de garantia
  const termos = (f.termos || "").trim();
  if (termos) {
    const largura = W - 10, lh = 3.5, fs = 7.6;
    const blocos = [];
    termos.split(/\n\s*\n/).forEach((par) => {
      const p = par.trim(); if (!p) return;
      const m = p.match(/^(A garantia NÃO cobre:)\s*([\s\S]*)$/i);
      if (m) {
        doc.setFont("helvetica", "bold"); doc.setFontSize(fs);
        blocos.push({ bold: true, linhas: doc.splitTextToSize(m[1], largura) });
        doc.setFont("helvetica", "normal");
        if (m[2]) blocos.push({ bold: false, linhas: doc.splitTextToSize(m[2], largura), cola: true });
      } else {
        doc.setFont("helvetica", "normal"); doc.setFontSize(fs);
        blocos.push({ bold: false, linhas: doc.splitTextToSize(p, largura) });
      }
    });
    const altura = blocos.reduce((s, b, i) => s + b.linhas.length * lh + (i > 0 && !b.cola ? 2.4 : 0), 0) + 7;
    cabecalho("TERMOS DE GARANTIA");
    novaPaginaSe(altura);
    doc.setFillColor(250, 248, 243); doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
    doc.rect(X, y, W, altura, "FD");
    let ty = y + 5;
    doc.setTextColor(...INK); doc.setFontSize(fs);
    blocos.forEach((b, i) => {
      if (i > 0 && !b.cola) ty += 2.4;
      doc.setFont("helvetica", b.bold ? "bold" : "normal");
      b.linhas.forEach((l) => { doc.text(l, X + 5, ty); ty += lh; });
    });
    y += altura + 7;
  }

  novaPaginaSe(8);
  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(...GOLD);
  doc.text("SALOMÃO IPHONES • Tecnologia, confiança e serviço especializado", 105, y, { align: "center" });
  return doc;
}

let jspdfPromise = null;
function loadJsPDF() {
  if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  if (jspdfPromise) return jspdfPromise;
  const urls = [
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
  ];
  jspdfPromise = new Promise((resolve, reject) => {
    const tentar = (i) => {
      if (i >= urls.length) { jspdfPromise = null; reject(new Error("Não deu para carregar o gerador de PDF. Confira a internet e tente de novo.")); return; }
      const s = document.createElement("script");
      s.src = urls[i]; s.async = true;
      s.onload = () => (window.jspdf && window.jspdf.jsPDF ? resolve(window.jspdf.jsPDF) : tentar(i + 1));
      s.onerror = () => { s.remove(); tentar(i + 1); };
      document.head.appendChild(s);
    };
    tentar(0);
  });
  return jspdfPromise;
}
const modalidadeTexto = (modo) => {
  if (!modo) return "";
  if (norm(modo) === "laboratorio") return "Atendimento no laboratório";
  if (norm(modo) === "delivery") return "Atendimento via Delivery";
  return modo;
};
const servicosTexto = (s) => {
  const p = splitServ(s);
  if (p.length <= 1) return p[0] || "";
  return p.slice(0, -1).join(", ") + " e " + p[p.length - 1];
};

// ─── ÍCONES ───────────────────────────────────────────────────────────
const ICONS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  cash: "M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6 12h.01M18 12h.01",
  wallet: "M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M21 10h-5a2 2 0 0 0 0 4h5zM3 7h16",
  more: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  phone: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM11 18h2",
  box: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  sliders: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  edit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h5",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6",
  x: "M18 6 6 18M6 6l12 12",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  down: "M6 9l6 6 6-6",
  cart: "M6 6h15l-1.5 9h-12zM6 6 5 3H2M9 20h.01M18 20h.01",
  wrench: "M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z",
  check: "M20 6 9 17l-5-5",
  share: "M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13",
};
function Icon({ n, s = 20, w = 1.8 }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[n]} />
    </svg>
  );
}

// ─── ESTILO ───────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
:root{
  --bg:#070707;--s0:#0b0a08;--s1:#11100d;--s2:#181610;--s3:#211d14;
  --line:#2a2417;--line2:#3b3220;
  --gold:#c9933a;--gold2:#f0d08a;--goldDim:rgba(201,147,58,.13);
  --ivory:#f4ece0;--t2:#c2b7a2;--t3:#958a75;
  --pos:#41d394;--neg:#ff6464;--warn:#f6a93b;--blue:#7fb0ff;--violet:#c3a1ff;
}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{background:var(--bg);color:var(--ivory);font-family:'Montserrat',system-ui,sans-serif;font-size:14px;line-height:1.45;-webkit-font-smoothing:antialiased;overscroll-behavior-y:none}
button,input,select,textarea{font:inherit;color:inherit}
button{background:none;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent}
:focus-visible{outline:2px solid var(--gold2);outline-offset:2px;border-radius:8px}
.num{font-variant-numeric:tabular-nums}
.pos{color:var(--pos)}.neg{color:var(--neg)}.gold{color:var(--gold2)}.muted{color:var(--t3)}.t2{color:var(--t2)}

/* estrutura */
.hdr{position:sticky;top:0;z-index:50;background:rgba(7,7,7,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom:1px solid var(--line);padding:calc(env(safe-area-inset-top) + 8px) 14px 8px}
.hdr-in{display:flex;align-items:center;gap:10px;max-width:1080px;margin:0 auto}
.mark{width:36px;height:36px;border-radius:10px;object-fit:cover;flex-shrink:0}
.month-pill{display:inline-flex;align-items:center;gap:6px;padding:7px 12px 7px 14px;border:1px solid var(--line2);border-radius:999px;font-weight:700;font-size:15px;color:var(--gold2);background:var(--s1)}
.spacer{flex:1}
.sync{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--t2)}
.dot{width:8px;height:8px;border-radius:50%;background:var(--t3)}
.dot.ok{background:var(--pos)}.dot.wait{background:var(--gold);animation:pulse 1s infinite}.dot.err{background:var(--neg)}
@keyframes pulse{50%{opacity:.35}}
.icon-btn{width:38px;height:38px;display:grid;place-items:center;border-radius:10px;color:var(--t2)}
.icon-btn:hover{background:var(--s2);color:var(--ivory)}
.main{max-width:1080px;margin:0 auto;padding:14px 16px calc(120px + env(safe-area-inset-bottom))}
.page-title{font-size:24px;font-weight:800;letter-spacing:-.015em;margin:4px 0 14px}
.bnav{position:fixed;left:0;right:0;bottom:0;z-index:60;background:rgba(9,8,6,.96);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(5,1fr);padding:6px 4px calc(6px + env(safe-area-inset-bottom))}
.bnav button{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 0;font-size:11px;font-weight:600;color:var(--t3)}
.bnav button.on{color:var(--gold2)}
.fab{position:fixed;right:18px;bottom:calc(80px + env(safe-area-inset-bottom));z-index:61;width:58px;height:58px;border-radius:50%;background:linear-gradient(145deg,var(--gold2),var(--gold));color:#170f03;display:grid;place-items:center;box-shadow:0 10px 28px rgba(201,147,58,.32)}
.side{display:none}
.side-brand{display:flex;align-items:center;gap:10px;padding:4px 8px 22px}
.side-brand b{display:block;font-size:14px;font-weight:800;color:var(--gold2);letter-spacing:.02em}
.side-brand span{font-size:12px;color:var(--t3)}
.side nav{display:flex;flex-direction:column;gap:2px}
.side nav button{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;font-weight:600;color:var(--t2);text-align:left}
.side nav button:hover{background:var(--s2);color:var(--ivory)}
.side nav button.on{background:var(--goldDim);color:var(--gold2)}
@media (min-width:900px){
  .bnav{display:none}
  .side{display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;width:236px;padding:22px 14px;border-right:1px solid var(--line);background:var(--s0);z-index:55}
  .hdr,.main{margin-left:236px}
  .main{padding-bottom:60px}
  .mark-m{display:none}
  .fab{bottom:28px;right:28px}
}

/* cartões */
.card{background:var(--s1);border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:12px}
.card-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin-bottom:12px}
.card-head h3{font-size:15px;font-weight:700}
.card-head .muted{font-size:12px}
.hero{border:1px solid transparent;border-radius:20px;padding:20px 18px;margin-bottom:12px;background:linear-gradient(var(--s1),var(--s1)) padding-box,linear-gradient(135deg,var(--gold2),rgba(201,147,58,.15) 45%,var(--gold)) border-box}
.hero-lbl{font-size:13px;color:var(--t2);font-weight:600}
.hero-big{font-size:36px;font-weight:800;letter-spacing:-.02em;line-height:1.1;margin:2px 0 4px}
.hero-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid var(--line)}
.hero-mid{font-size:22px;font-weight:800;letter-spacing:-.01em;line-height:1.15;margin:2px 0 3px}
.delta{font-size:12px;font-weight:600}
.delta.up{color:var(--pos)}.delta.down{color:var(--neg)}.delta.flat{color:var(--t3)}
.streams{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -16px 12px;padding:0 16px 2px;scrollbar-width:none}
.streams::-webkit-scrollbar{display:none}
.stream{flex:0 0 80%;scroll-snap-align:start;background:var(--s1);border:1px solid var(--line);border-radius:16px;padding:16px}
.stream h4{font-size:14px;font-weight:700;color:var(--gold2);display:flex;align-items:center;gap:8px}
.stream .big{font-size:26px;font-weight:800;margin:6px 0 10px;letter-spacing:-.01em}
.kv{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:7px 0;border-top:1px solid var(--line);font-size:13px}
.kv span:first-child{color:var(--t2)}
.kv b{font-weight:700}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.stat{background:var(--s1);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
.stat .l{font-size:12px;color:var(--t2);font-weight:600}
.stat .v{font-size:18px;font-weight:800;margin-top:2px}
.stat .s{font-size:12px;color:var(--t3);margin-top:1px}
@media (min-width:900px){
  .streams{display:grid;grid-template-columns:repeat(3,1fr);overflow:visible;margin:0 0 12px;padding:0}
  .dash-cols{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}
  .dash-cols .card{margin-bottom:12px}
  .grid4{grid-template-columns:repeat(4,1fr)}
}

/* gráfico */
.chart{display:flex;align-items:stretch;gap:2px;height:150px}
.bar-col{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;padding:0;border-radius:4px}
.bar-track{flex:1;width:100%;display:flex;align-items:flex-end;justify-content:center}
.bar{width:100%;max-width:16px;border-radius:3px 3px 0 0;background:linear-gradient(180deg,var(--gold2),var(--gold))}
.bar.zero{background:var(--line2)}
.bar.neg{background:var(--neg)}
.bar-col.on .bar{box-shadow:0 0 0 2px var(--ivory)}
.bar-lbl{font-size:8px;font-weight:600;color:#fff;margin-top:5px;line-height:1}
@media (min-width:420px){.bar-lbl{font-size:9px}}

/* rankings */
.rank{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}
.rank:first-of-type{border-top:0}
.rank .pos-n{width:22px;font-size:12px;font-weight:700;color:var(--t3);text-align:right;flex-shrink:0}
.rank .info{flex:1;min-width:0}
.rank .nome{font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rank .sub{font-size:12px;color:var(--t3)}
.rank .val{font-weight:800;font-size:14px;white-space:nowrap}
.meter{height:3px;border-radius:2px;background:var(--line);margin-top:5px;overflow:hidden}
.meter i{display:block;height:100%;background:var(--gold);border-radius:2px}
.prog{height:8px;border-radius:99px;background:var(--s3);overflow:hidden;margin:6px 0 2px}
.prog i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--gold),var(--gold2))}

/* botões */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:0 16px;border-radius:12px;font-weight:700;font-size:14px;border:1px solid var(--line2);background:var(--s2);color:var(--ivory)}
.btn:hover{border-color:var(--gold)}
.btn-gold{background:linear-gradient(145deg,var(--gold2),var(--gold));border-color:transparent;color:#170f03}
.btn-gold:hover{filter:brightness(1.05)}
.btn-ghost{background:transparent}
.btn-danger{color:var(--neg);border-color:rgba(255,100,100,.35);background:transparent}
.btn-sm{min-height:36px;padding:0 12px;font-size:13px;border-radius:10px}
.btn[disabled]{opacity:.5;cursor:default}
.row{display:flex;gap:8px;align-items:center}
.row-wrap{display:flex;gap:8px;flex-wrap:wrap}
.grow{flex:1}

/* formulário */
.form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fld{grid-column:span 2;display:flex;flex-direction:column;gap:5px;min-width:0}
.fld.half{grid-column:span 1}
.fld label{font-size:13px;font-weight:600;color:var(--t2)}
.inp{width:100%;min-height:46px;padding:10px 12px;border-radius:12px;border:1px solid var(--line2);background:var(--s0);color:var(--ivory);font-size:16px;outline:none;-webkit-appearance:none;appearance:none}
.inp:focus{border-color:var(--gold)}
.inp::placeholder{color:#6f6656}
textarea.inp{min-height:84px;resize:vertical;line-height:1.4}
select.inp{background-image:linear-gradient(45deg,transparent 50%,var(--t2) 50%),linear-gradient(135deg,var(--t2) 50%,transparent 50%);background-position:calc(100% - 18px) 50%,calc(100% - 13px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:32px}
input[type=date].inp{color-scheme:dark;display:block;text-align:left}
input[type=date].inp::-webkit-date-and-time-value{text-align:left}
.stat.sm .v{font-size:15px}
.hint{font-size:12px;color:var(--t3)}
.err{grid-column:span 2;color:var(--neg);font-size:13px;font-weight:600}
.preview{grid-column:span 2;background:var(--goldDim);border:1px solid rgba(201,147,58,.35);border-radius:12px;padding:12px 14px}
.preview .kv{border-top-color:rgba(201,147,58,.25)}
.preview .kv:first-child{border-top:0;padding-top:0}
.auto{position:relative}
.auto-list{position:absolute;left:0;right:0;top:calc(100% + 4px);z-index:20;list-style:none;background:var(--s2);border:1px solid var(--line2);border-radius:12px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,.6)}
.auto-list button{display:block;width:100%;text-align:left;padding:12px 14px;font-size:15px;border-top:1px solid var(--line)}
.auto-list li:first-child button{border-top:0}
.auto-list button:hover{background:var(--goldDim)}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}
.tag{display:inline-flex;align-items:center;gap:6px;padding:6px 8px 6px 12px;border-radius:999px;background:var(--goldDim);border:1px solid rgba(201,147,58,.4);color:var(--gold2);font-weight:700;font-size:13px}
.tag button{display:grid;place-items:center;color:var(--t2)}
.seg{display:flex;background:var(--s1);border:1px solid var(--line);border-radius:12px;padding:3px;margin-bottom:12px}
.seg button{flex:1;min-height:38px;border-radius:9px;font-weight:700;font-size:13px;color:var(--t2)}
.seg button.on{background:var(--s3);color:var(--gold2)}
.chip-row{display:flex;gap:6px;flex-wrap:wrap}
.chip{padding:8px 12px;border-radius:999px;border:1px solid var(--line2);font-size:13px;font-weight:600;color:var(--t2);background:var(--s1)}
.chip.on{border-color:var(--gold);color:var(--gold2);background:var(--goldDim)}

/* listas */
.day{font-size:13px;font-weight:700;color:var(--t2);margin:16px 2px 8px}
.item{background:var(--s1);border:1px solid var(--line);border-radius:14px;margin-bottom:8px;overflow:hidden}
.item.open{border-color:var(--line2)}
.item-top{display:flex;gap:12px;align-items:flex-start;width:100%;text-align:left;padding:12px 14px}
.item-main{flex:1;min-width:0}
.item-title{font-weight:700;font-size:15px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.item-sub{font-size:13px;color:var(--t2);margin-top:2px}
.item-val{text-align:right;flex-shrink:0}
.item-val .a{font-weight:800;font-size:15px;color:var(--gold2)}
.item-val .b{font-weight:700;font-size:13px;margin-top:2px}
.item-detail{padding:0 14px 12px;border-top:1px solid var(--line)}
.det{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;padding:12px 0}
.det div{font-size:13px;min-width:0}
.det span{display:block;font-size:12px;color:var(--t3)}
.det .full{grid-column:span 2}
.actions{display:flex;gap:6px;flex-wrap:wrap}
.badge{display:inline-flex;align-items:center;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700;border:1px solid}
.b-gold{color:var(--gold2);border-color:rgba(201,147,58,.45);background:var(--goldDim)}
.b-green{color:var(--pos);border-color:rgba(65,211,148,.4);background:rgba(65,211,148,.1)}
.b-red{color:var(--neg);border-color:rgba(255,100,100,.4);background:rgba(255,100,100,.1)}
.b-blue{color:var(--blue);border-color:rgba(127,176,255,.4);background:rgba(127,176,255,.1)}
.b-violet{color:var(--violet);border-color:rgba(195,161,255,.4);background:rgba(195,161,255,.1)}
.b-gray{color:var(--t2);border-color:var(--line2);background:var(--s2)}
.empty{text-align:center;color:var(--t3);padding:28px 16px;border:1px dashed var(--line2);border-radius:14px;font-size:14px}
.search{position:relative;margin-bottom:12px}
.search .inp{padding-left:42px}
.search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--t3)}
.line-item{display:flex;align-items:center;gap:12px;padding:12px 14px;background:var(--s1);border:1px solid var(--line);border-radius:14px;margin-bottom:8px;width:100%;text-align:left}
.line-item .info{flex:1;min-width:0}
.line-item .t{font-weight:700;font-size:15px}
.line-item .s{font-size:13px;color:var(--t3);margin-top:1px}
.stepper{display:flex;align-items:center;border:1px solid var(--line2);border-radius:10px;overflow:hidden}
.stepper button{width:36px;height:36px;display:grid;place-items:center;color:var(--t2)}
.stepper b{min-width:30px;text-align:center;font-size:15px}
.table-wrap{overflow-x:auto;margin:0 -16px;padding:0 16px}
table.tbl{width:100%;border-collapse:collapse;font-size:13px;min-width:520px}
.tbl th{font-size:12px;font-weight:600;color:var(--t3);text-align:right;padding:8px 8px;border-bottom:1px solid var(--line2)}
.tbl th:first-child,.tbl td:first-child{text-align:left}
.tbl td{padding:10px 8px;border-bottom:1px solid var(--line);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.tbl tr.total td{font-weight:800;background:var(--s2);border-bottom:0}

/* folha (janela que sobe) */
.sheet-wrap{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;justify-content:center;animation:fade .18s ease}
.sheet{width:100%;max-width:600px;max-height:92vh;max-height:92dvh;display:flex;flex-direction:column;background:var(--s1);border:1px solid var(--line2);border-bottom:0;border-radius:22px 22px 0 0;animation:up .22s ease}
.sheet-grab{width:40px;height:4px;border-radius:4px;background:var(--line2);margin:8px auto 0;flex-shrink:0}
.sheet-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 10px 8px 18px;flex-shrink:0}
.sheet-head h2{font-size:18px;font-weight:800}
.sheet-body{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:6px 18px 18px;flex:1;overscroll-behavior:contain}
.sheet-foot{display:flex;gap:8px;padding:12px 18px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--line);flex-shrink:0}
.sheet-foot .btn-gold{flex:1}
.menu-btn{display:flex;align-items:center;gap:14px;width:100%;padding:14px;border-radius:14px;border:1px solid var(--line);background:var(--s2);margin-bottom:8px;text-align:left;font-weight:700;font-size:15px}
.menu-btn small{display:block;font-weight:500;font-size:13px;color:var(--t3)}
.menu-btn .ic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--goldDim);color:var(--gold2);flex-shrink:0}
.menu-btn.on{border-color:var(--gold)}
@keyframes up{from{transform:translateY(40px);opacity:.6}to{transform:none;opacity:1}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@media (min-width:900px){
  .sheet-wrap{align-items:center;padding:24px}
  .sheet{border-radius:20px;border-bottom:1px solid var(--line2);max-height:88vh}
  .sheet-grab{display:none}
}
.toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(150px + env(safe-area-inset-bottom));z-index:200;background:var(--ivory);color:#141008;font-weight:700;font-size:14px;padding:10px 18px;border-radius:999px;box-shadow:0 10px 30px rgba(0,0,0,.5);animation:fade .2s ease}
@media (min-width:900px){.toast{bottom:36px}}
.splash{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:var(--t2);font-weight:600}
.splash img{width:120px;height:120px;border-radius:28px}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

// ─── COMPONENTES BASE ────────────────────────────────────────────────
function Sheet({ title, onClose, children, footer }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, []);
  return (
    <div className="sheet-wrap" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar"><Icon n="x" /></button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

function AutoInput({ value, onChange, onPick, suggestions, placeholder, onKeyDown, enterKeyHint, id }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const lista = useMemo(() => {
    const q = norm(value);
    if (!q) return [];
    return (suggestions || []).filter((s) => { const k = norm(s); return k.includes(q) && k !== q; }).slice(0, 6);
  }, [value, suggestions]);
  useEffect(() => {
    const h = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", h);
    return () => document.removeEventListener("pointerdown", h);
  }, []);
  return (
    <div className="auto" ref={wrap}>
      <input id={id} className="inp" value={value} placeholder={placeholder} autoComplete="off" autoCorrect="off" spellCheck={false}
        enterKeyHint={enterKeyHint}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => { if (e.key === "Enter") setOpen(false); if (onKeyDown) onKeyDown(e); }} />
      {open && lista.length > 0 && (
        <ul className="auto-list" role="listbox">
          {lista.map((s) => (
            <li key={s}>
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { if (onPick) onPick(s); else onChange(s); setOpen(false); }}>{s}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function NumInput({ value, onChange, placeholder = "0,00", id }) {
  return <input id={id} className="inp num" type="text" inputMode="decimal" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />;
}
function DateInput({ value, onChange, id }) {
  return <input id={id} className="inp" type="date" value={dmyToISO(value)} onChange={(e) => onChange(isoToDMY(e.target.value))} />;
}
function Fld({ label, half, children, hint }) {
  return (
    <div className={`fld ${half ? "half" : ""}`}>
      {label && <label>{label}</label>}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
const numStr = (v) => (v ? String(v).replace(".", ",") : "");

// Folha genérica para formulários simples (custos, investimentos, estoque...)
function EntrySheet({ title, fields, initial, onSave, onDelete, onClose, preview, saveLabel = "Salvar" }) {
  const [v, setV] = useState(initial);
  const [err, setErr] = useState("");
  const set = (k, val) => setV((p) => ({ ...p, [k]: val }));
  const salvar = () => { const e = onSave(v); if (typeof e === "string") { setErr(e); return; } onClose(); };
  return (
    <Sheet title={title} onClose={onClose} footer={<>
      {onDelete && <button className="btn btn-danger" aria-label="Excluir" onClick={() => { if (window.confirm("Excluir este item?")) { onDelete(); onClose(); } }}><Icon n="trash" s={18} /></button>}
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className="btn btn-gold" onClick={salvar}>{saveLabel}</button>
    </>}>
      <div className="form">
        {fields.map((f) => (
          <Fld key={f.k} label={f.label} half={f.half} hint={f.hint}>
            {f.type === "num" ? <NumInput value={v[f.k]} onChange={(x) => set(f.k, x)} placeholder={f.placeholder} />
              : f.type === "date" ? <DateInput value={v[f.k]} onChange={(x) => set(f.k, x)} />
              : f.type === "select" ? <select className="inp" value={v[f.k]} onChange={(e) => set(f.k, e.target.value)}>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>
              : f.type === "textarea" ? <textarea className="inp" value={v[f.k]} placeholder={f.placeholder} onChange={(e) => set(f.k, e.target.value)} />
              : f.type === "auto" ? <AutoInput value={v[f.k]} onChange={(x) => set(f.k, x)} suggestions={f.suggestions} placeholder={f.placeholder} />
              : <input className="inp" value={v[f.k]} placeholder={f.placeholder} onChange={(e) => set(f.k, e.target.value)} />}
          </Fld>
        ))}
        {preview && preview(v)}
        {err && <p className="err">{err}</p>}
      </div>
    </Sheet>
  );
}

function Delta({ atual, anterior, rotulo }) {
  if (!anterior) return null;
  const p = ((atual - anterior) / Math.abs(anterior)) * 100;
  const cls = p > 0.5 ? "up" : p < -0.5 ? "down" : "flat";
  return <span className={`delta ${cls}`}>{p > 0 ? "+" : ""}{p.toFixed(0)}% vs {rotulo}</span>;
}

function RankList({ titulo, itens, valor, vazio = "Sem dados neste mês." }) {
  const max = Math.max(1, ...itens.map((i) => Math.abs(i.v)));
  return (
    <div className="card">
      <div className="card-head"><h3>{titulo}</h3></div>
      {itens.length === 0 ? <p className="muted">{vazio}</p> : itens.map((i, idx) => (
        <div className="rank" key={i.nome}>
          <span className="pos-n">{idx + 1}</span>
          <div className="info">
            <div className="nome">{i.nome}</div>
            <div className="sub">{i.sub}</div>
            <div className="meter"><i style={{ width: `${Math.max(3, (Math.abs(i.v) / max) * 100)}%` }} /></div>
          </div>
          <span className={`val num ${i.v < 0 ? "neg" : ""}`}>{valor(i)}</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
export default function App() {
  const [data, setData] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return normalize(s ? JSON.parse(s) : null); } catch { return normalize(null); }
  });
  const [booting, setBooting] = useState(FIREBASE_CONFIGURED);
  const [sync, setSync] = useState(FIREBASE_CONFIGURED ? "wait" : "local");
  const [tab, setTab] = useState("dashboard");
  const [mes, setMes] = useState(mesAtual());
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState("");
  const dataRef = useRef(data);
  const loadedRef = useRef(!FIREBASE_CONFIGURED);
  const timer = useRef(null);
  const toastTimer = useRef(null);

  const persistLocal = (nd) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nd)); } catch { /* cheio */ } };

  const save = useCallback((next) => {
    const base = typeof next === "function" ? next(dataRef.current) : next;
    const nd = { ...base, _ts: Date.now() };
    dataRef.current = nd;
    setData(nd);
    persistLocal(nd);
    if (FIREBASE_CONFIGURED && loadedRef.current) {
      setSync("wait");
      clearTimeout(timer.current);
      timer.current = setTimeout(async () => { const ok = await saveToFirebase(dataRef.current); setSync(ok ? "ok" : "err"); }, 1200);
    }
  }, []);

  const notify = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  }, []);

  // Carrega da nuvem ao abrir
  useEffect(() => {
    if (!FIREBASE_CONFIGURED) return;
    let vivo = true;
    let unsub = () => {};
    const limite = setTimeout(() => { if (vivo) setBooting(false); }, 8000);
    (async () => {
      try {
        await initFirebase();
        const cloud = await loadFromFirebase();
        if (!vivo) return;
        const local = dataRef.current;
        if (cloud && (toNum(cloud._ts) >= toNum(local._ts))) {
          const n = normalize(cloud);
          dataRef.current = n; setData(n); persistLocal(n);
        } else if (local._ts || !cloud) {
          await saveToFirebase(local);
        }
        loadedRef.current = true;
        setSync("ok");
        unsub = subscribeFirebase((cd, pendente) => {
          if (pendente) return;
          if (toNum(cd._ts) < toNum(dataRef.current._ts)) return;
          const n = normalize(cd);
          dataRef.current = n; setData(n); persistLocal(n); setSync("ok");
        });
      } catch (e) {
        console.warn("Nuvem indisponível:", e);
        if (vivo) setSync("err");
      } finally {
        clearTimeout(limite);
        if (vivo) setBooting(false);
      }
    })();
    return () => { vivo = false; unsub(); };
  }, []);

  // Rolagem suave com a rodinha do mouse no computador
  useEffect(() => {
    if (!window.matchMedia || !window.matchMedia("(pointer:fine)").matches) return;
    let alvo = window.scrollY, animando = false;
    const passo = () => {
      const atual = window.scrollY, dif = alvo - atual;
      if (Math.abs(dif) < 1) { window.scrollTo(0, alvo); animando = false; return; }
      window.scrollTo(0, atual + dif * 0.2);
      requestAnimationFrame(passo);
    };
    const onWheel = (e) => {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.target.closest && e.target.closest(".sheet-wrap,.table-wrap,.streams,textarea,select,.auto-list")) return;
      let dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? window.innerHeight : 1);
      if (Math.abs(dy) < 40) return; // trackpad continua nativo
      e.preventDefault();
      if (!animando) alvo = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      alvo = Math.max(0, Math.min(max, alvo + Math.sign(dy) * Math.min(Math.abs(dy), 120) * 0.55));
      if (!animando) { animando = true; requestAnimationFrame(passo); }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const exportar = () => {
    const blob = new Blob([JSON.stringify(dataRef.current, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `salomao-iphones-${new Date().toISOString().slice(0, 10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };
  const importar = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const n = normalize(JSON.parse(ev.target.result));
        if (!window.confirm("Substituir todos os dados do app pelos dados deste arquivo?")) return;
        save(n); notify("Dados importados");
      } catch { window.alert("Arquivo inválido. Use um arquivo exportado pelo próprio app."); }
    };
    r.readAsText(file);
  };

  const mesesDisponiveis = useMemo(() => {
    const s = new Set([mesAtual()]);
    data.registros.forEach((r) => { const m = mesDe(r.data, r.mes); if (m) s.add(m); });
    data.vendas.forEach((v) => { const m = mesDe(v.data, v.mes); if (m) s.add(m); });
    data.aparelhos.forEach((a) => { const m = mesDe(a.dataVenda) || mesDe(a.dataCompra); if (m) s.add(m); });
    data.custos.forEach((c) => { const m = mesDe(c.data); if (m) s.add(m); });
    data.investimentos.forEach((i) => { const m = mesDe(i.data); if (m) s.add(m); });
    return [...s].filter((m) => chaveMes(m) >= 0).sort((a, b) => chaveMes(b) - chaveMes(a));
  }, [data]);

  const calc = useMemo(() => calcMes(data, mes), [data, mes]);

  const NAV = [
    { k: "dashboard", label: "Dashboard", icon: "home" },
    { k: "registros", label: "Registros", icon: "list" },
    { k: "caixa", label: "Caixa", icon: "cash" },
    { k: "financeiro", label: "Financeiro", icon: "wallet" },
    { k: "aparelhos", label: "Aparelhos", icon: "phone" },
    { k: "estoque", label: "Estoque", icon: "box" },
    { k: "clientes", label: "Clientes", icon: "users" },
  ];
  const TITULOS = { dashboard: "Dashboard", registros: "Registros", caixa: "Caixa", financeiro: "Financeiro", aparelhos: "Aparelhos", estoque: "Estoque", clientes: "Clientes", config: "Configurações" };
  const usaMes = !["estoque", "clientes", "config"].includes(tab);
  const noMais = ["aparelhos", "estoque", "clientes", "config"].includes(tab);
  const ir = (k) => { setTab(k); setSheet(null); };
  const syncTxt = { ok: "Nuvem", wait: "Salvando", err: "Offline", local: "Local" }[sync];
  const syncCls = { ok: "ok", wait: "wait", err: "err", local: "" }[sync];

  if (booting) {
    return (
      <div className="splash">
        <style>{CSS}</style>
        <img src={MARK} alt="Salomão iPhones" />
        <span>Carregando seus dados…</span>
      </div>
    );
  }

  const props = { data, save, notify, mes, calc, abrir: setSheet };

  return (
    <div>
      <style>{CSS}</style>

      <aside className="side">
        <div className="side-brand">
          <img className="mark" src={MARK} alt="" />
          <div><b>SALOMÃO iPHONES</b><span>Gestão do negócio</span></div>
        </div>
        <nav>
          {NAV.map((n) => (
            <button key={n.k} className={tab === n.k ? "on" : ""} onClick={() => ir(n.k)}><Icon n={n.icon} />{n.label}</button>
          ))}
          <button className={tab === "config" ? "on" : ""} onClick={() => ir("config")}><Icon n="sliders" />Configurações</button>
        </nav>
      </aside>

      <header className="hdr">
        <div className="hdr-in">
          <img className="mark mark-m" src={MARK} alt="Salomão iPhones" />
          {usaMes ? (
            <button className="month-pill" onClick={() => setSheet({ type: "mes" })} aria-label="Escolher mês">
              {mes}<Icon n="down" s={16} />
            </button>
          ) : <span className="month-pill" style={{ visibility: "hidden" }}>.</span>}
          <span className="spacer" />
          <span className="sync" title="Status da sincronização"><span className={`dot ${syncCls}`} />{syncTxt}</span>
          <button className="icon-btn" onClick={() => ir("config")} aria-label="Configurações"><Icon n="sliders" /></button>
        </div>
      </header>

      <main className="main">
        <h1 className="page-title">{TITULOS[tab]}</h1>
        {tab === "dashboard" && <Dashboard {...props} />}
        {tab === "registros" && <Registros {...props} />}
        {tab === "caixa" && <Caixa {...props} />}
        {tab === "financeiro" && <Financeiro {...props} />}
        {tab === "aparelhos" && <Aparelhos {...props} />}
        {tab === "estoque" && <Estoque {...props} />}
        {tab === "clientes" && <Clientes {...props} />}
        {tab === "config" && <Config {...props} exportar={exportar} importar={importar} sync={sync} />}
      </main>

      <button className="fab" onClick={() => setSheet({ type: "fab" })} aria-label="Novo lançamento"><Icon n="plus" s={26} w={2.4} /></button>

      <nav className="bnav">
        {NAV.slice(0, 4).map((n) => (
          <button key={n.k} className={tab === n.k ? "on" : ""} onClick={() => ir(n.k)}><Icon n={n.icon} />{n.label}</button>
        ))}
        <button className={noMais ? "on" : ""} onClick={() => setSheet({ type: "mais" })}><Icon n="more" />Mais</button>
      </nav>

      {sheet && sheet.type === "mes" && (
        <Sheet title="Escolher mês" onClose={() => setSheet(null)}>
          {mesesDisponiveis.map((m) => (
            <button key={m} className={`menu-btn ${m === mes ? "on" : ""}`} onClick={() => { setMes(m); setSheet(null); }}>
              <span className="grow">{m}{m === mesAtual() && <small>Mês atual</small>}</span>
              {m === mes && <span className="gold"><Icon n="check" /></span>}
            </button>
          ))}
        </Sheet>
      )}
      {sheet && sheet.type === "mais" && (
        <Sheet title="Mais" onClose={() => setSheet(null)}>
          {[...NAV.slice(4), { k: "config", label: "Configurações", icon: "sliders" }].map((n) => (
            <button key={n.k} className={`menu-btn ${tab === n.k ? "on" : ""}`} onClick={() => ir(n.k)}>
              <span className="ic"><Icon n={n.icon} /></span>{n.label}
            </button>
          ))}
        </Sheet>
      )}
      {sheet && sheet.type === "fab" && (
        <Sheet title="Novo lançamento" onClose={() => setSheet(null)}>
          <button className="menu-btn" onClick={() => setSheet({ type: "os" })}>
            <span className="ic"><Icon n="wrench" /></span>
            <span>Nova ordem de serviço<small>Conserto feito para um cliente</small></span>
          </button>
          <button className="menu-btn" onClick={() => setSheet({ type: "venda" })}>
            <span className="ic"><Icon n="cart" /></span>
            <span>Nova venda<small>Produto ou acessório vendido</small></span>
          </button>
        </Sheet>
      )}
      {sheet && sheet.type === "os" && <OSSheet {...props} rec={sheet.rec} onClose={() => setSheet(null)} />}
      {sheet && sheet.type === "venda" && <VendaSheet {...props} rec={sheet.rec} onClose={() => setSheet(null)} />}
      {sheet && sheet.type === "garantia" && <GarantiaSheet {...props} os={sheet.os} rec={sheet.rec} onClose={() => setSheet(null)} />}
      {sheet && sheet.type === "pdf" && <PdfSheet {...props} os={sheet.os} onClose={() => setSheet(null)} />}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

// ══ DASHBOARD ═════════════════════════════════════════════════════════
function Dashboard({ data, mes, calc }) {
  const ant = useMemo(() => calcMes(data, mesAnterior(mes)), [data, mes]);
  const rotAnt = (mesAnterior(mes).split("/")[0]) || "";
  const c = calc;
  const cfg = data.config;
  const [sel, setSel] = useState(null);

  const serie = useMemo(() => {
    const mapa = movimentoPorDia(c);
    return Array.from({ length: diasNoMes(mes) }, (_, i) => ({ dia: i + 1, v: (mapa.get(i + 1) || {}).lucro || 0 }));
  }, [c, mes]);
  const maxBar = Math.max(1, ...serie.map((s) => Math.abs(s.v)));

  const tops = useMemo(() => {
    const cli = new Map(), ori = new Map(), serv = new Map(), apar = new Map();
    c.os.forEach((r) => {
      const l = lucroOS(r);
      const kc = norm(r.cliente);
      if (kc) {
        const e = cli.get(kc) || { vars: new Map(), v: 0, n: 0 };
        e.vars.set(r.cliente.trim(), (e.vars.get(r.cliente.trim()) || 0) + 1); e.v += l; e.n++; cli.set(kc, e);
      }
      const ko = r.origem || "Sem origem";
      const eo = ori.get(ko) || { v: 0, cli: new Set() };
      eo.v += l; if (kc) eo.cli.add(kc); ori.set(ko, eo);
      const partes = splitServ(r.servico);
      partes.forEach((p) => {
        const k = norm(p);
        const e = serv.get(k) || { vars: new Map(), v: 0, n: 0 };
        e.vars.set(p, (e.vars.get(p) || 0) + 1); e.v += l / partes.length; e.n++; serv.set(k, e);
      });
      const ka = norm(r.aparelho);
      if (ka) {
        const e = apar.get(ka) || { vars: new Map(), n: 0 };
        e.vars.set(r.aparelho.trim(), (e.vars.get(r.aparelho.trim()) || 0) + 1); e.n++; apar.set(ka, e);
      }
    });
    const s = (n) => `${n} ${n === 1 ? "serviço" : "serviços"}`;
    return {
      clientes: [...cli.values()].map((e) => ({ nome: escolherNome(e.vars, true), v: e.v, sub: s(e.n) })).sort((a, b) => b.v - a.v).slice(0, 10),
      origens: [...ori.entries()].map(([nome, e]) => ({ nome, v: e.v, sub: `${e.cli.size} ${e.cli.size === 1 ? "cliente" : "clientes"}` })).sort((a, b) => b.v - a.v),
      servicos: [...serv.values()].map((e) => ({ nome: escolherNome(e.vars, true), v: e.v, sub: `${e.n}x no mês` })).sort((a, b) => b.v - a.v).slice(0, 5),
      aparelhos: [...apar.values()].map((e) => ({ nome: escolherNome(e.vars, false), v: e.n, sub: "" })).sort((a, b) => b.v - a.v).slice(0, 10),
    };
  }, [c]);

  const novos = c.os.filter((r) => r.tipoCliente === "Novo").length;
  const recorrentes = c.os.length - novos;
  const pFat = cfg.metaFaturamento ? Math.min(100, (c.fatTotal / cfg.metaFaturamento) * 100) : 0;
  const pLuc = cfg.metaLucro ? Math.min(100, (c.lucroTotal / cfg.metaLucro) * 100) : 0;
  const selItem = sel != null ? serie[sel] : null;

  const streams = [
    { t: "Serviços", ic: "wrench", b: c.serv, extra: null },
    { t: "Vendas", ic: "cart", b: c.vend, extra: `${c.vend.itens} ${c.vend.itens === 1 ? "item" : "itens"}` },
    { t: "Vendas de aparelhos", ic: "phone", b: c.apar, extra: null },
  ];

  return (
    <div>
      <section className="hero" aria-label="Resumo do mês">
        <div className="hero-lbl">Faturamento total</div>
        <div className="hero-big num">{fmtK(c.fatTotal)}</div>
        <Delta atual={c.fatTotal} anterior={ant.fatTotal} rotulo={rotAnt} />
        <div className="hero-row">
          <div>
            <div className="hero-lbl">Lucro líquido</div>
            <div className={`hero-mid num ${c.lucroTotal < 0 ? "neg" : "pos"}`}>{fmtK(c.lucroTotal)}</div>
            <Delta atual={c.lucroTotal} anterior={ant.lucroTotal} rotulo={rotAnt} />
          </div>
          <div>
            <div className="hero-lbl">Lucro real</div>
            <div className={`hero-mid num ${c.lucroReal < 0 ? "neg" : "pos"}`}>{fmtK(c.lucroReal)}</div>
            <Delta atual={c.lucroReal} anterior={ant.lucroReal} rotulo={rotAnt} />
          </div>
        </div>
      </section>

      <div className="streams">
        {streams.map((s) => (
          <div className="stream" key={s.t}>
            <h4><Icon n={s.ic} s={18} />{s.t}</h4>
            <div className="big num">{fmtK(s.b.fat)}</div>
            <div className="kv"><span>Lucro líquido</span><b className={`num ${s.b.lucro < 0 ? "neg" : "pos"}`}>{fmtK(s.b.lucro)}</b></div>
            <div className="kv"><span>Ticket médio</span><b className="num">{fmtK(s.b.ticket)}</b></div>
            <div className="kv"><span>Quantidade</span><b className="num">{s.b.qtd}{s.extra ? ` · ${s.extra}` : ""}</b></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>Lucro líquido por dia</h3>
          <span className="muted num">{selItem ? `Dia ${selItem.dia}: ${fmt(selItem.v)}` : "Toque numa barra"}</span>
        </div>
        <div className="chart" role="img" aria-label={`Lucro líquido diário de ${mes}`}>
          {serie.map((s, i) => (
            <button key={s.dia} className={`bar-col ${sel === i ? "on" : ""}`} onClick={() => setSel(sel === i ? null : i)} aria-label={`Dia ${s.dia}: ${fmt(s.v)}`}>
              <span className="bar-track">
                <span className={`bar ${s.v === 0 ? "zero" : s.v < 0 ? "neg" : ""}`} style={{ height: s.v === 0 ? "2px" : `${Math.max(4, (Math.abs(s.v) / maxBar) * 100)}%` }} />
              </span>
              <span className="bar-lbl">{s.dia}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="dash-cols">
        <div>
          <div className="card">
            <div className="card-head"><h3>Metas do mês</h3></div>
            <div className="kv" style={{ borderTop: 0, paddingTop: 0 }}><span>Faturamento total</span><b className="num">{fmtK(c.fatTotal)} de {fmtK(cfg.metaFaturamento)}</b></div>
            <div className="prog"><i style={{ width: `${pFat}%` }} /></div>
            <div className="hint" style={{ marginBottom: 10 }}>{pFat.toFixed(0)}% da meta</div>
            <div className="kv"><span>Lucro líquido</span><b className="num">{fmtK(c.lucroTotal)} de {fmtK(cfg.metaLucro)}</b></div>
            <div className="prog"><i style={{ width: `${Math.max(0, pLuc)}%` }} /></div>
            <div className="hint">{Math.max(0, pLuc).toFixed(0)}% da meta</div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Custos do mês</h3><span className="muted num">{fmtK(c.custoTotal)}</span></div>
            <div className="kv" style={{ borderTop: 0 }}><span>Peças</span><b className="num">{fmt(c.custos.pecas + c.custos.pecasAvulsas)}</b></div>
            <div className="kv"><span>Taxas de cartão</span><b className="num">{fmt(c.custos.taxas)}</b></div>
            <div className="kv"><span>Transporte</span><b className="num">{fmt(c.custos.transporte)}</b></div>
            <div className="kv"><span>Acessórios</span><b className="num">{fmt(c.custos.acessorios)}</b></div>
            <div className="kv"><span>Marketing</span><b className="num">{fmt(c.custos.marketing)}</b></div>
            <div className="kv"><span>Garantias ({c.custos.garantiasQtd})</span><b className="num">{fmt(c.custos.garantias)}</b></div>
            <div className="kv"><span>Outros</span><b className="num">{fmt(c.custos.outros)}</b></div>
            <div className="kv"><span>Investimentos</span><b className="num t2">{fmt(c.custos.investimentos)}</b></div>
            <p className="hint" style={{ marginTop: 8 }}>Peças e taxas já saem do lucro líquido. Investimentos não entram no total nem no lucro real.</p>
          </div>

          <div className="card">
            <div className="card-head"><h3>Clientes do mês</h3></div>
            <div className="grid2">
              <div><div className="hero-lbl">Novos</div><div className="hero-mid num">{novos}</div></div>
              <div><div className="hero-lbl">Recorrentes</div><div className="hero-mid num">{recorrentes}</div></div>
            </div>
          </div>

          <RankList titulo="Origem dos clientes" itens={tops.origens} valor={(i) => fmtK(i.v)} />
        </div>
        <div>
          <RankList titulo="Top 10 clientes" itens={tops.clientes} valor={(i) => fmtK(i.v)} />
          <RankList titulo="Top 5 serviços" itens={tops.servicos} valor={(i) => fmtK(i.v)} />
          <RankList titulo="Top 10 aparelhos consertados" itens={tops.aparelhos} valor={(i) => `${i.v}x`} />
        </div>
      </div>
    </div>
  );
}

// ══ REGISTROS ═════════════════════════════════════════════════════════
function Registros({ data, save, notify, mes, abrir }) {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(null);

  const comGarantia = useMemo(() => new Set(data.registros.filter((r) => r.kind === "garantia" && r.refId != null).map((r) => r.refId)), [data.registros]);

  const itens = useMemo(() => {
    const q = norm(busca);
    const todos = [
      ...data.registros.map((r) => ({ ...r, _t: r.kind })),
      ...data.vendas.map((v) => ({ ...v, _t: "venda" })),
    ];
    const filtrados = todos.filter((x) => {
      if (q) return [x.cliente, x.aparelho, x.servico, x.cidade, x.produto, x.motivo].some((f) => norm(f).includes(q));
      return mesDe(x.data, x.mes) === mes;
    });
    return filtrados.sort(porDataDesc);
  }, [data.registros, data.vendas, busca, mes]);

  const grupos = useMemo(() => {
    const g = [];
    itens.forEach((x) => {
      const rot = rotuloDia(x.data);
      const ult = g[g.length - 1];
      if (ult && ult.rot === rot) ult.itens.push(x); else g.push({ rot, itens: [x] });
    });
    return g;
  }, [itens]);

  const qOS = itens.filter((x) => x._t === "os").length;
  const qV = itens.filter((x) => x._t === "venda").length;
  const fat = itens.reduce((s, x) => s + (x._t === "garantia" ? 0 : toNum(x.valor)), 0);

  const excluir = (x) => {
    if (!window.confirm("Excluir este lançamento?")) return;
    if (x._t === "venda") save((d) => ({ ...d, vendas: d.vendas.filter((v) => v.id !== x.id) }));
    else save((d) => ({ ...d, registros: d.registros.filter((r) => r.id !== x.id) }));
    setAberto(null); notify("Lançamento excluído");
  };
  const limpo = (x) => { const { _t, ...r } = x; return r; };

  return (
    <div>
      <div className="search">
        <Icon n="search" s={18} />
        <input className="inp" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente, aparelho ou serviço" aria-label="Buscar" />
      </div>
      <div className="row" style={{ marginBottom: 12 }}>
        <button className="btn btn-gold grow" onClick={() => abrir({ type: "os" })}><Icon n="wrench" s={18} />Nova ordem de serviço</button>
        <button className="btn grow" onClick={() => abrir({ type: "venda" })}><Icon n="cart" s={18} />Nova venda</button>
      </div>
      <div className="grid2 grid4" style={{ marginBottom: 4 }}>
        <div className="stat"><div className="l">{busca ? "Encontrados" : "Ordens de serviço"}</div><div className="v num">{busca ? itens.length : qOS}</div></div>
        <div className="stat"><div className="l">{busca ? "Faturamento" : "Vendas"}</div><div className="v num">{busca ? fmtK(fat) : qV}</div></div>
      </div>
      {busca && <p className="hint" style={{ marginTop: 8 }}>Buscando em todos os meses.</p>}

      {grupos.length === 0 && <div className="empty" style={{ marginTop: 16 }}>{busca ? "Nada encontrado." : `Nenhum lançamento em ${mes}. Toque em Nova ordem de serviço para começar.`}</div>}

      {grupos.map((g) => (
        <div key={g.rot + g.itens[0].id}>
          <div className="day">{g.rot}</div>
          {g.itens.map((x) => {
            const open = aberto === x._t + x.id;
            const toggle = () => setAberto(open ? null : x._t + x.id);
            if (x._t === "venda") {
              return (
                <div className={`item ${open ? "open" : ""}`} key={"v" + x.id}>
                  <button className="item-top" onClick={toggle} aria-expanded={open}>
                    <div className="item-main">
                      <div className="item-title">{x.produto}<span className="badge b-blue">Venda</span></div>
                      <div className="item-sub num">{x.qtd} × {fmt(x.valorUnit != null ? x.valorUnit : x.valor / (x.qtd || 1))}</div>
                    </div>
                    <div className="item-val"><div className="a num">{fmt(x.valor)}</div><div className={`b num ${lucroVenda(x) < 0 ? "neg" : "pos"}`}>{fmt(lucroVenda(x))}</div></div>
                  </button>
                  {open && (
                    <div className="item-detail">
                      <div className="det">
                        <div><span>Custo</span>{fmt(x.custo)}</div>
                        <div><span>Pagamento</span>{x.pagamento || "—"}</div>
                        {x.obs && <div className="full"><span>Observação</span>{x.obs}</div>}
                      </div>
                      <div className="actions">
                        <button className="btn btn-sm" onClick={() => abrir({ type: "venda", rec: limpo(x) })}><Icon n="edit" s={16} />Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => excluir(x)}><Icon n="trash" s={16} />Excluir</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            if (x._t === "garantia") {
              const orig = data.registros.find((r) => r.id === x.refId);
              return (
                <div className={`item ${open ? "open" : ""}`} key={"g" + x.id}>
                  <button className="item-top" onClick={toggle} aria-expanded={open}>
                    <div className="item-main">
                      <div className="item-title">{x.cliente}<span className="badge b-red">Garantia</span></div>
                      <div className="item-sub">{[x.aparelho, x.motivo].filter(Boolean).join(" — ")}</div>
                    </div>
                    <div className="item-val"><div className="b num neg">{x.custoGar ? fmt(-x.custoGar) : "Sem custo"}</div></div>
                  </button>
                  {open && (
                    <div className="item-detail">
                      <div className="det">
                        <div><span>Fornecedor</span>{x.fornecedor || "—"}</div>
                        <div><span>Custo</span>{fmt(x.custoGar)}</div>
                        {orig && <div className="full"><span>OS original</span>{orig.data} — {orig.servico}</div>}
                        {x.motivo && <div className="full"><span>Motivo</span>{x.motivo}</div>}
                      </div>
                      <div className="actions">
                        <button className="btn btn-sm" onClick={() => abrir({ type: "garantia", os: orig || limpo(x), rec: limpo(x) })}><Icon n="edit" s={16} />Editar</button>
                        <button className="btn btn-sm btn-danger" onClick={() => excluir(x)}><Icon n="trash" s={16} />Excluir</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            const l = lucroOS(x);
            return (
              <div className={`item ${open ? "open" : ""}`} key={"o" + x.id}>
                <button className="item-top" onClick={toggle} aria-expanded={open}>
                  <div className="item-main">
                    <div className="item-title">
                      {x.cliente}
                      {x.tipoCliente === "Novo" && <span className="badge b-green">Novo</span>}
                      {comGarantia.has(x.id) && <span className="badge b-red">Teve garantia</span>}
                    </div>
                    <div className="item-sub">{x.aparelho}{x.servico ? <> — <span className="gold">{x.servico}</span></> : null}</div>
                  </div>
                  <div className="item-val"><div className="a num">{fmt(x.valor)}</div><div className={`b num ${l < 0 ? "neg" : "pos"}`}>{fmt(l)}</div></div>
                </button>
                {open && (
                  <div className="item-detail">
                    <div className="det">
                      <div><span>Cidade</span>{x.cidade || "—"}</div>
                      <div><span>Pagamento</span>{x.pagamento || "—"}</div>
                      <div><span>Origem</span>{x.origem || "—"}</div>
                      <div><span>Atendimento</span>{x.modo || "—"}</div>
                      {x.peca && <div className="full"><span>Peça</span>{x.peca}</div>}
                      <div><span>Custo da peça</span>{fmt(x.custo)}</div>
                      {x.taxaCartao > 0 && <div><span>Taxa do cartão</span>{fmt(x.taxaCartao)}</div>}
                      {x.transporte > 0 && <div><span>Transporte</span>{fmt(x.transporte)}</div>}
                      {x.acessorio > 0 && <div><span>Acessório</span>{fmt(x.acessorio)}</div>}
                      {x.obs && <div className="full"><span>Observação</span>{x.obs}</div>}
                    </div>
                    <div className="actions">
                      <button className="btn btn-sm" onClick={() => abrir({ type: "os", rec: limpo(x) })}><Icon n="edit" s={16} />Editar</button>
                      <button className="btn btn-sm" onClick={() => abrir({ type: "garantia", os: limpo(x) })}><Icon n="shield" s={16} />Garantia</button>
                      <button className="btn btn-sm" onClick={() => abrir({ type: "pdf", os: limpo(x) })}><Icon n="doc" s={16} />PDF</button>
                      <button className="btn btn-sm btn-danger" onClick={() => excluir(x)} aria-label="Excluir"><Icon n="trash" s={16} /></button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// Campo de serviços em tags (Enter ou botão adiciona)
function TagInput({ tags, setTags, input, setInput, suggestions }) {
  const add = (v) => {
    const t = String(v || "").trim();
    if (!t) return;
    if (!tags.some((x) => norm(x) === norm(t))) setTags([...tags, t]);
    setInput("");
  };
  return (
    <div>
      {tags.length > 0 && (
        <div className="tags">
          {tags.map((t, i) => (
            <span className="tag" key={t + i}>{t}
              <button type="button" aria-label={`Remover ${t}`} onClick={() => setTags(tags.filter((_, j) => j !== i))}><Icon n="x" s={14} /></button>
            </span>
          ))}
        </div>
      )}
      <div className="row">
        <div className="grow">
          <AutoInput value={input} onChange={setInput} onPick={add} suggestions={suggestions} placeholder="Ex.: Tela" enterKeyHint="enter"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(input); } }} />
        </div>
        <button type="button" className="btn" onClick={() => add(input)} aria-label="Adicionar serviço"><Icon n="plus" s={18} /></button>
      </div>
    </div>
  );
}

function OSSheet({ data, save, notify, rec, onClose }) {
  const cfg = data.config;
  const editando = !!rec;
  const [f, setF] = useState(() => rec ? {
    data: rec.data || hoje(), cliente: rec.cliente || "", cidade: rec.cidade || "", aparelho: rec.aparelho || "",
    peca: rec.peca || "", valor: numStr(rec.valor), custo: numStr(rec.custo), taxaCartao: numStr(rec.taxaCartao),
    transporte: numStr(rec.transporte), acessorio: numStr(rec.acessorio), pagamento: rec.pagamento || "Pix",
    origem: rec.origem || cfg.origens[0], modo: rec.modo || cfg.modos[0], tipoCliente: rec.tipoCliente === "Antigo" ? "Recorrente" : (rec.tipoCliente || "Novo"), obs: rec.obs || "",
  } : {
    data: hoje(), cliente: "", cidade: "", aparelho: "", peca: "", valor: "", custo: "", taxaCartao: "", transporte: "", acessorio: "",
    pagamento: "Pix", origem: cfg.origens[0], modo: cfg.modos[0], tipoCliente: "Novo", obs: "",
  });
  const [tags, setTags] = useState(() => splitServ(rec ? rec.servico : ""));
  const [tagInput, setTagInput] = useState("");
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const oss = data.registros.filter((r) => r.kind === "os");
  const sug = useMemo(() => ({
    clientes: sugestoesDe(oss.map((r) => r.cliente)),
    cidades: sugestoesDe(oss.map((r) => r.cidade)),
    aparelhos: sugestoesDe(oss.map((r) => r.aparelho), false),
    servicos: sugestoesDe(oss.flatMap((r) => splitServ(r.servico))),
  }), [data.registros]); // eslint-disable-line react-hooks/exhaustive-deps

  const existe = (nome) => oss.some((r) => norm(r.cliente) === norm(nome) && (!rec || r.id !== rec.id));
  const onCliente = (v) => setF((p) => ({ ...p, cliente: v, tipoCliente: existe(v) ? "Recorrente" : (editando ? p.tipoCliente : "Novo") }));
  const escolherCliente = (nome) => {
    const ult = oss.filter((r) => norm(r.cliente) === norm(nome)).sort(porDataDesc)[0];
    setF((p) => ({ ...p, cliente: nome, cidade: ult ? ult.cidade || p.cidade : p.cidade, origem: ult && ult.origem ? ult.origem : p.origem, tipoCliente: "Recorrente" }));
  };

  const valor = toNum(f.valor), custo = toNum(f.custo), taxa = toNum(f.taxaCartao), transp = toNum(f.transporte), acess = toNum(f.acessorio);
  const lucro = valor - custo - taxa;

  const salvar = () => {
    const servicos = [...tags];
    if (tagInput.trim() && !servicos.some((x) => norm(x) === norm(tagInput))) servicos.push(tagInput.trim());
    if (!f.cliente.trim()) { setErr("Preencha o nome do cliente."); return; }
    if (!f.valor) { setErr("Preencha o valor do serviço."); return; }
    if (!parseDMY(f.data)) { setErr("Escolha a data do serviço."); return; }
    const reg = {
      ...(rec || {}), kind: "os", id: rec ? rec.id : uid(),
      data: f.data, mes: mesDe(f.data), cliente: f.cliente.trim(), cidade: f.cidade.trim(), aparelho: f.aparelho.trim(),
      servico: servicos.join(" + "), peca: f.peca.trim(), valor, custo, taxaCartao: taxa, transporte: transp, acessorio: acess,
      pagamento: f.pagamento, origem: f.origem, modo: f.modo, tipoCliente: f.tipoCliente, obs: f.obs.trim(),
    };
    save((d) => ({ ...d, registros: editando ? d.registros.map((r) => (r.id === rec.id ? reg : r)) : [...d.registros, reg] }));
    notify(editando ? "Ordem de serviço atualizada" : "Ordem de serviço registrada");
    onClose();
  };

  return (
    <Sheet title={editando ? "Editar ordem de serviço" : "Nova ordem de serviço"} onClose={onClose} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className="btn btn-gold" onClick={salvar}>{editando ? "Salvar alterações" : "Registrar OS"}</button>
    </>}>
      <div className="form">
        <Fld label="Data" half><DateInput value={f.data} onChange={(v) => set("data", v)} /></Fld>
        <Fld label="Pagamento" half>
          <select className="inp" value={f.pagamento} onChange={(e) => set("pagamento", e.target.value)}>{PAGAMENTOS.map((p) => <option key={p}>{p}</option>)}</select>
        </Fld>
        <Fld label="Cliente"><AutoInput value={f.cliente} onChange={onCliente} onPick={escolherCliente} suggestions={sug.clientes} placeholder="Nome do cliente" /></Fld>
        <Fld label="Cidade" half><AutoInput value={f.cidade} onChange={(v) => set("cidade", v)} suggestions={sug.cidades} placeholder="Ex.: BC" /></Fld>
        <Fld label="Tipo de cliente" half>
          <select className="inp" value={f.tipoCliente} onChange={(e) => set("tipoCliente", e.target.value)}><option>Novo</option><option>Recorrente</option></select>
        </Fld>
        <Fld label="Aparelho"><AutoInput value={f.aparelho} onChange={(v) => set("aparelho", v)} suggestions={sug.aparelhos} placeholder="Ex.: iPhone 13" /></Fld>
        <Fld label="Serviços" hint="Digite um serviço e toque em Enter ou no +. Repita para adicionar outros.">
          <TagInput tags={tags} setTags={setTags} input={tagInput} setInput={setTagInput} suggestions={sug.servicos} />
        </Fld>
        <Fld label="Peça utilizada"><input className="inp" value={f.peca} onChange={(e) => set("peca", e.target.value)} placeholder="Opcional" /></Fld>
        <Fld label="Valor do serviço" half><NumInput value={f.valor} onChange={(v) => set("valor", v)} /></Fld>
        <Fld label="Custo da peça" half><NumInput value={f.custo} onChange={(v) => set("custo", v)} /></Fld>
        <Fld label="Taxa do cartão" half><NumInput value={f.taxaCartao} onChange={(v) => set("taxaCartao", v)} /></Fld>
        <Fld label="Transporte" half><NumInput value={f.transporte} onChange={(v) => set("transporte", v)} /></Fld>
        <Fld label="Acessório" half><NumInput value={f.acessorio} onChange={(v) => set("acessorio", v)} /></Fld>
        <Fld label="Origem" half>
          <select className="inp" value={f.origem} onChange={(e) => set("origem", e.target.value)}>{[...new Set([...cfg.origens, f.origem])].filter(Boolean).map((o) => <option key={o}>{o}</option>)}</select>
        </Fld>
        <Fld label="Atendimento">
          <select className="inp" value={f.modo} onChange={(e) => set("modo", e.target.value)}>{[...new Set([...cfg.modos, f.modo])].filter(Boolean).map((o) => <option key={o}>{o}</option>)}</select>
        </Fld>
        <Fld label="Observação"><textarea className="inp" value={f.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Opcional" /></Fld>
        <div className="preview">
          <div className="kv"><span>Lucro líquido</span><b className={`num ${lucro < 0 ? "neg" : "pos"}`}>{fmt(lucro)}</b></div>
          {(transp > 0 || acess > 0) && <div className="kv"><span>Depois de transporte e acessório</span><b className="num">{fmt(lucro - transp - acess)}</b></div>}
        </div>
        {err && <p className="err">{err}</p>}
      </div>
    </Sheet>
  );
}

function VendaSheet({ data, save, notify, rec, onClose }) {
  const editando = !!rec;
  const [f, setF] = useState(() => rec ? {
    data: rec.data || hoje(), produto: rec.produto || "", qtd: String(rec.qtd || 1),
    valorUnit: numStr(rec.valorUnit != null ? rec.valorUnit : rec.valor / (rec.qtd || 1)),
    custoUnit: numStr(rec.custoUnit != null ? rec.custoUnit : rec.custo / (rec.qtd || 1)),
    pagamento: rec.pagamento || "Pix", obs: rec.obs || "",
  } : { data: hoje(), produto: "", qtd: "1", valorUnit: "", custoUnit: "", pagamento: "Pix", obs: "" });
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const sug = useMemo(() => sugestoesDe([...data.vendas.map((v) => v.produto), ...data.estoque.map((e) => e.item)]), [data.vendas, data.estoque]);
  const qtd = Math.max(1, Math.round(toNum(f.qtd) || 1));
  const total = qtd * toNum(f.valorUnit), custoT = qtd * toNum(f.custoUnit);

  const salvar = () => {
    if (!f.produto.trim()) { setErr("Preencha o produto."); return; }
    if (!f.valorUnit) { setErr("Preencha o valor."); return; }
    if (!parseDMY(f.data)) { setErr("Escolha a data da venda."); return; }
    const v = {
      ...(rec || {}), id: rec ? rec.id : uid(), data: f.data, mes: mesDe(f.data), produto: f.produto.trim(), qtd,
      valorUnit: toNum(f.valorUnit), custoUnit: toNum(f.custoUnit), valor: total, custo: custoT, pagamento: f.pagamento, obs: f.obs.trim(),
    };
    save((d) => ({ ...d, vendas: editando ? d.vendas.map((x) => (x.id === rec.id ? v : x)) : [...d.vendas, v] }));
    notify(editando ? "Venda atualizada" : "Venda registrada");
    onClose();
  };

  return (
    <Sheet title={editando ? "Editar venda" : "Nova venda"} onClose={onClose} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className="btn btn-gold" onClick={salvar}>{editando ? "Salvar alterações" : "Registrar venda"}</button>
    </>}>
      <div className="form">
        <Fld label="Data" half><DateInput value={f.data} onChange={(v) => set("data", v)} /></Fld>
        <Fld label="Pagamento" half>
          <select className="inp" value={f.pagamento} onChange={(e) => set("pagamento", e.target.value)}>{PAGAMENTOS.map((p) => <option key={p}>{p}</option>)}</select>
        </Fld>
        <Fld label="Produto"><AutoInput value={f.produto} onChange={(v) => set("produto", v)} suggestions={sug} placeholder="Ex.: Película 3D" /></Fld>
        <Fld label="Quantidade" half><input className="inp num" inputMode="numeric" value={f.qtd} onChange={(e) => set("qtd", e.target.value.replace(/\D/g, ""))} /></Fld>
        <Fld label="Valor por unidade" half><NumInput value={f.valorUnit} onChange={(v) => set("valorUnit", v)} /></Fld>
        <Fld label="Custo por unidade" half><NumInput value={f.custoUnit} onChange={(v) => set("custoUnit", v)} /></Fld>
        <Fld label="Observação"><textarea className="inp" value={f.obs} onChange={(e) => set("obs", e.target.value)} placeholder="Opcional" /></Fld>
        <div className="preview">
          <div className="kv"><span>Total da venda</span><b className="num">{fmt(total)}</b></div>
          <div className="kv"><span>Lucro líquido</span><b className={`num ${total - custoT < 0 ? "neg" : "pos"}`}>{fmt(total - custoT)}</b></div>
        </div>
        {err && <p className="err">{err}</p>}
      </div>
    </Sheet>
  );
}

function GarantiaSheet({ data, save, notify, os, rec, onClose }) {
  const editando = !!rec;
  const [f, setF] = useState(() => ({
    data: rec ? rec.data : hoje(), motivo: rec ? rec.motivo || "" : "", fornecedor: rec ? rec.fornecedor || "" : "", custo: rec ? numStr(rec.custoGar) : "",
  }));
  const [err, setErr] = useState("");
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const sugForn = useMemo(() => sugestoesDe(data.registros.filter((r) => r.kind === "garantia").map((r) => r.fornecedor)), [data.registros]);

  const salvar = () => {
    if (!f.motivo.trim()) { setErr("Descreva o motivo da garantia."); return; }
    if (!parseDMY(f.data)) { setErr("Escolha a data."); return; }
    const base = rec || {};
    const g = {
      ...base, kind: "garantia", id: rec ? rec.id : uid(), refId: rec ? rec.refId : os.id,
      data: f.data, mes: mesDe(f.data), cliente: base.cliente || os.cliente, cidade: base.cidade || os.cidade || "",
      aparelho: base.aparelho || os.aparelho || "", servico: base.servico || os.servico || "",
      motivo: f.motivo.trim(), fornecedor: f.fornecedor.trim(), custoGar: toNum(f.custo),
      valor: 0, custo: 0, taxaCartao: 0, transporte: 0, acessorio: 0,
    };
    save((d) => ({ ...d, registros: editando ? d.registros.map((r) => (r.id === rec.id ? g : r)) : [...d.registros, g] }));
    notify(editando ? "Garantia atualizada" : "Garantia registrada");
    onClose();
  };

  return (
    <Sheet title={editando ? "Editar garantia" : "Registrar garantia"} onClose={onClose} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className="btn btn-gold" onClick={salvar}>{editando ? "Salvar alterações" : "Registrar garantia"}</button>
    </>}>
      <div className="form">
        <div className="preview">
          <div className="kv"><span>Cliente</span><b>{(rec && rec.cliente) || os.cliente}</b></div>
          <div className="kv"><span>Aparelho</span><b>{(rec && rec.aparelho) || os.aparelho || "—"}</b></div>
          {(os.servico || (rec && rec.servico)) && <div className="kv"><span>Serviço original</span><b>{(rec && rec.servico) || os.servico}</b></div>}
        </div>
        <Fld label="Data" half><DateInput value={f.data} onChange={(v) => set("data", v)} /></Fld>
        <Fld label="Custo" half hint="Opcional"><NumInput value={f.custo} onChange={(v) => set("custo", v)} /></Fld>
        <Fld label="Motivo"><textarea className="inp" value={f.motivo} onChange={(e) => set("motivo", e.target.value)} placeholder="O que aconteceu e o que foi feito" /></Fld>
        <Fld label="Fornecedor"><AutoInput value={f.fornecedor} onChange={(v) => set("fornecedor", v)} suggestions={sugForn} placeholder="De quem foi a peça" /></Fld>
        {err && <p className="err">{err}</p>}
      </div>
    </Sheet>
  );
}

function PdfSheet({ data, save, notify, os, onClose }) {
  const chave = norm(os.cliente);
  const ci = data.clientesInfo[chave] || {};
  const info = os.osInfo || {};
  const pecaIni = info.peca != null ? info.peca : (os.peca || "");
  const garIni = info.garantia || "3 meses";
  const [f, setF] = useState(() => ({
    nome: os.cliente || "", telefone: info.telefone || ci.telefone || "", endereco: info.endereco || ci.endereco || "",
    aparelho: os.aparelho || "", defeito: info.defeito || "", modalidade: info.modalidade || modalidadeTexto(os.modo),
    servico: info.servico || servicosTexto(os.servico), peca: pecaIni, garantia: garIni,
    valor: numStr(os.valor), pagamento: os.pagamento || "", data: os.data || hoje(),
    termos: info.termos || termosPadrao(pecaIni, garIni),
  }));
  const [termosEditado, setTermosEditado] = useState(!!info.termos);
  const [verTermos, setVerTermos] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { loadJsPDF().catch(() => {}); }, []);

  const set = (k, v) => setF((p) => {
    const n = { ...p, [k]: v };
    if (!termosEditado && (k === "peca" || k === "garantia")) n.termos = termosPadrao(n.peca, n.garantia);
    return n;
  });

  const exportar = async () => {
    setErr(""); setOcupado(true);
    try {
      const JsPDF = await loadJsPDF();
      const doc = buildOSPdf(JsPDF, { ...f, valor: toNum(f.valor) }, OS_LOGO);
      const nomeArq = `OS ${f.nome} ${String(f.data).replace(/\//g, "-")}.pdf`;
      save((d) => ({
        ...d,
        registros: d.registros.map((r) => r.id === os.id ? {
          ...r, osInfo: { telefone: f.telefone, endereco: f.endereco, defeito: f.defeito, modalidade: f.modalidade, servico: f.servico, peca: f.peca, garantia: f.garantia, termos: termosEditado ? f.termos : "" },
        } : r),
        clientesInfo: { ...d.clientesInfo, [chave]: { ...(d.clientesInfo[chave] || {}), telefone: f.telefone || (d.clientesInfo[chave] || {}).telefone || "", endereco: f.endereco || (d.clientesInfo[chave] || {}).endereco || "" } },
      }));
      const blob = doc.output("blob");
      let compartilhou = false;
      const computador = window.matchMedia && window.matchMedia("(pointer:fine)").matches;
      try {
        const file = new File([blob], nomeArq, { type: "application/pdf" });
        if (!computador && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: nomeArq });
          compartilhou = true;
        }
      } catch (e) {
        if (e && e.name === "AbortError") compartilhou = true;
      }
      if (!compartilhou) doc.save(nomeArq);
      notify("PDF da OS gerado");
    } catch (e) {
      setErr(e.message || "Não deu para gerar o PDF.");
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Sheet title="Ordem de serviço em PDF" onClose={onClose} footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
      <button className="btn btn-gold" onClick={exportar} disabled={ocupado}><Icon n="share" s={18} />{ocupado ? "Gerando…" : "Exportar PDF"}</button>
    </>}>
      <div className="form">
        <Fld label="Nome do cliente"><input className="inp" value={f.nome} onChange={(e) => set("nome", e.target.value)} /></Fld>
        <Fld label="Telefone" half><input className="inp" inputMode="tel" value={f.telefone} onChange={(e) => set("telefone", e.target.value)} placeholder="(47) 99999-9999" /></Fld>
        <Fld label="Data" half><DateInput value={f.data} onChange={(v) => set("data", v)} /></Fld>
        <Fld label="Endereço"><input className="inp" value={f.endereco} onChange={(e) => set("endereco", e.target.value)} placeholder="Rua, número — Cidade/SC" /></Fld>
        <Fld label="Aparelho"><input className="inp" value={f.aparelho} onChange={(e) => set("aparelho", e.target.value)} /></Fld>
        <Fld label="Defeito informado"><input className="inp" value={f.defeito} onChange={(e) => set("defeito", e.target.value)} placeholder="Ex.: Tela quebrada" /></Fld>
        <Fld label="Modalidade"><input className="inp" value={f.modalidade} onChange={(e) => set("modalidade", e.target.value)} /></Fld>
        <Fld label="Serviço realizado"><input className="inp" value={f.servico} onChange={(e) => set("servico", e.target.value)} placeholder="Ex.: Substituição da tela" /></Fld>
        <Fld label="Peça utilizada"><input className="inp" value={f.peca} onChange={(e) => set("peca", e.target.value)} placeholder="Ex.: Tela OLED Premium" /></Fld>
        <Fld label="Garantia da peça" half>
          <select className="inp" value={f.garantia} onChange={(e) => set("garantia", e.target.value)}>{GARANTIAS.map((g) => <option key={g.v}>{g.v}</option>)}</select>
        </Fld>
        <Fld label="Valor" half><NumInput value={f.valor} onChange={(v) => set("valor", v)} /></Fld>
        <Fld label="Pagamento">
          <select className="inp" value={f.pagamento} onChange={(e) => set("pagamento", e.target.value)}>{[...new Set([...PAGAMENTOS, f.pagamento])].filter(Boolean).map((p) => <option key={p}>{p}</option>)}</select>
        </Fld>
        <div className="fld">
          <div className="row">
            <label className="grow">Termos de garantia</label>
            <button className="btn btn-sm btn-ghost" onClick={() => setVerTermos(!verTermos)}>{verTermos ? "Esconder" : "Ver e editar"}</button>
          </div>
          {verTermos && <>
            <textarea className="inp" style={{ minHeight: 200 }} value={f.termos} onChange={(e) => { setTermosEditado(true); setF((p) => ({ ...p, termos: e.target.value })); }} />
            {termosEditado && <button className="btn btn-sm btn-ghost" onClick={() => { setTermosEditado(false); setF((p) => ({ ...p, termos: termosPadrao(p.peca, p.garantia) })); }}>Restaurar texto padrão</button>}
          </>}
          {!verTermos && <span className="hint">Gerado automaticamente com a peça e o prazo de garantia.</span>}
        </div>
        <p className="hint" style={{ gridColumn: "span 2" }}>Telefone e endereço ficam salvos no cliente para as próximas OS.</p>
        {err && <p className="err">{err}</p>}
      </div>
    </Sheet>
  );
}

// ══ CAIXA ═════════════════════════════════════════════════════════════
function Caixa({ calc, mes }) {
  const linhas = useMemo(() => [...movimentoPorDia(calc).values()].sort((a, b) => a.dia - b.dia), [calc]);
  const tot = linhas.reduce((s, l) => ({ fat: s.fat + l.fat, lucro: s.lucro + l.lucro, qtd: s.qtd + l.qtd }), { fat: 0, lucro: 0, qtd: 0 });
  if (!linhas.length) return <div className="empty">Nenhum movimento em {mes}.</div>;
  return (
    <div className="card">
      <div className="card-head"><h3>Detalhamento diário</h3><span className="muted">Serviços, vendas e aparelhos</span></div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>Dia</th><th>Faturamento</th><th>Custos</th><th>Lucro líq.</th><th>Qtd</th><th>Ticket</th></tr></thead>
          <tbody>
            {linhas.map((l) => {
              const d = parseDMY(l.data);
              return (
                <tr key={l.dia}>
                  <td><b>{pad(l.dia)}/{pad(d.getMonth() + 1)}</b> <span className="muted">{DIAS_SEMANA[d.getDay()]}</span></td>
                  <td className="gold">{fmt(l.fat)}</td>
                  <td className="t2">{fmt(l.fat - l.lucro)}</td>
                  <td className={l.lucro < 0 ? "neg" : "pos"}>{fmt(l.lucro)}</td>
                  <td>{l.qtd}</td>
                  <td className="t2">{fmt(l.qtd ? l.fat / l.qtd : 0)}</td>
                </tr>
              );
            })}
            <tr className="total">
              <td>Total</td>
              <td className="gold">{fmt(tot.fat)}</td>
              <td>{fmt(tot.fat - tot.lucro)}</td>
              <td className={tot.lucro < 0 ? "neg" : "pos"}>{fmt(tot.lucro)}</td>
              <td>{tot.qtd}</td>
              <td>{fmt(tot.qtd ? tot.fat / tot.qtd : 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ══ FINANCEIRO ════════════════════════════════════════════════════════
function Financeiro({ data, save, notify, mes, calc }) {
  const [aba, setAba] = useState("custos");
  const [form, setForm] = useState(null);
  const c = calc;
  const noMes = (dt) => mesDe(dt) === mes;
  const aReceber = data.devedores.filter((d) => d.status !== "Recebido").reduce((s, d) => s + d.valor, 0);

  const listaCustos = useMemo(() => {
    const manuais = data.custos.filter((x) => noMes(x.data)).map((x) => ({ ...x, auto: false }));
    const autos = [];
    c.os.forEach((r) => {
      if (r.transporte > 0) autos.push({ id: "t" + r.id, data: r.data, descricao: `Transporte — ${r.cliente}`, tipo: "Transporte", valor: r.transporte, auto: true });
      if (r.acessorio > 0) autos.push({ id: "a" + r.id, data: r.data, descricao: `Acessório — ${r.cliente}`, tipo: "Acessório", valor: r.acessorio, auto: true });
    });
    c.gar.forEach((g) => { if (g.custoGar > 0) autos.push({ id: "g" + g.id, data: g.data, descricao: `Garantia — ${g.cliente}`, tipo: "Garantia", valor: g.custoGar, auto: true }); });
    return [...manuais, ...autos].sort(porDataDesc);
  }, [data.custos, c, mes]); // eslint-disable-line react-hooks/exhaustive-deps

  const invest = data.investimentos.filter((i) => noMes(i.data)).sort(porDataDesc);
  const investTotal = data.investimentos.reduce((s, i) => s + i.valor, 0);
  const deved = [...data.devedores].sort((a, b) => ((a.status === "Recebido") - (b.status === "Recebido")) || porDataDesc(a, b));
  const corTipo = { Transporte: "b-gold", Acessório: "b-violet", Marketing: "b-blue", Garantia: "b-red", Peças: "b-gray" };

  const abrirCusto = (x) => setForm({
    tipo: "custo", rec: x,
    init: x ? { data: x.data, tipo: x.tipo, descricao: x.descricao, valor: numStr(x.valor) } : { data: hoje(), tipo: data.config.tiposCusto[0] || "Outros", descricao: "", valor: "" },
  });
  const abrirInv = (x) => setForm({ tipo: "inv", rec: x, init: x ? { data: x.data, objeto: x.objeto, valor: numStr(x.valor) } : { data: hoje(), objeto: "", valor: "" } });
  const abrirDev = (x) => setForm({ tipo: "dev", rec: x, init: x ? { nome: x.nome, data: x.data, valor: numStr(x.valor), referente: x.referente || "", status: x.status } : { nome: "", data: hoje(), valor: "", referente: "", status: "Pendente" } });
  const sugClientes = useMemo(() => sugestoesDe(data.registros.map((r) => r.cliente)), [data.registros]);

  return (
    <div>
      <div className="grid2" style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 12 }}>
        <div className="stat sm"><div className="l">Custos do mês</div><div className="v num">{fmtK(c.custoTotal)}</div></div>
        <div className="stat sm"><div className="l">Investimentos</div><div className="v num">{fmtK(c.custos.investimentos)}</div></div>
        <div className="stat sm"><div className="l">A receber</div><div className={`v num ${aReceber > 0 ? "neg" : ""}`}>{fmtK(aReceber)}</div></div>
      </div>
      <div className="seg" role="tablist">
        {[["custos", "Custos"], ["inv", "Investimentos"], ["dev", "A receber"]].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={aba === k} className={aba === k ? "on" : ""} onClick={() => setAba(k)}>{l}</button>
        ))}
      </div>

      {aba === "custos" && (
        <div>
          <div className="card">
            <div className="card-head"><h3>Por tipo em {mes}</h3></div>
            <div className="grid2">
              {[["Peças", c.custos.pecas + c.custos.pecasAvulsas], ["Taxas de cartão", c.custos.taxas], ["Transporte", c.custos.transporte], ["Acessórios", c.custos.acessorios], ["Marketing", c.custos.marketing], [`Garantias (${c.custos.garantiasQtd})`, c.custos.garantias], ["Outros", c.custos.outros], ["Total", c.custoTotal]].map(([l, v]) => (
                <div key={l} className="stat" style={{ background: "var(--s0)" }}><div className="l">{l}</div><div className="v num" style={{ fontSize: 16 }}>{fmt(v)}</div></div>
              ))}
            </div>
          </div>
          <button className="btn btn-gold" style={{ width: "100%", marginBottom: 12 }} onClick={() => abrirCusto(null)}><Icon n="plus" s={18} />Novo custo</button>
          {listaCustos.length === 0 && <div className="empty">Nenhum custo lançado em {mes}.</div>}
          {listaCustos.map((x) => (
            <button key={x.id} className="line-item" onClick={() => (x.auto ? notify("Esse custo vem da OS. Edite pelo registro.") : abrirCusto(x))}>
              <div className="info">
                <div className="t">{x.descricao}</div>
                <div className="s">{x.data} <span className={`badge ${corTipo[x.tipo] || "b-gray"}`} style={{ marginLeft: 6 }}>{x.tipo}</span>{x.auto && <span className="badge b-gray" style={{ marginLeft: 4 }}>Automático</span>}</div>
              </div>
              <b className="num neg">{fmt(x.valor)}</b>
            </button>
          ))}
        </div>
      )}

      {aba === "inv" && (
        <div>
          <div className="grid2" style={{ marginBottom: 12 }}>
            <div className="stat"><div className="l">Em {mes}</div><div className="v num">{fmt(c.custos.investimentos)}</div></div>
            <div className="stat"><div className="l">Total investido</div><div className="v num">{fmt(investTotal)}</div></div>
          </div>
          <button className="btn btn-gold" style={{ width: "100%", marginBottom: 12 }} onClick={() => abrirInv(null)}><Icon n="plus" s={18} />Novo investimento</button>
          {invest.length === 0 && <div className="empty">Nenhum investimento em {mes}.</div>}
          {invest.map((x) => (
            <button key={x.id} className="line-item" onClick={() => abrirInv(x)}>
              <div className="info"><div className="t">{x.objeto}</div><div className="s">{x.data}</div></div>
              <b className="num gold">{fmt(x.valor)}</b>
            </button>
          ))}
        </div>
      )}

      {aba === "dev" && (
        <div>
          <button className="btn btn-gold" style={{ width: "100%", marginBottom: 12 }} onClick={() => abrirDev(null)}><Icon n="plus" s={18} />Novo valor a receber</button>
          {deved.length === 0 && <div className="empty">Ninguém te devendo.</div>}
          {deved.map((x) => (
            <div key={x.id} className="line-item" style={{ opacity: x.status === "Recebido" ? 0.6 : 1 }}>
              <button className="info" style={{ textAlign: "left" }} onClick={() => abrirDev(x)}>
                <div className="t">{x.nome} <span className={`badge ${x.status === "Recebido" ? "b-green" : "b-red"}`}>{x.status}</span></div>
                <div className="s">{[x.referente, x.data].filter(Boolean).join(" — ")}</div>
              </button>
              <div style={{ textAlign: "right" }}>
                <b className={`num ${x.status === "Recebido" ? "pos" : "neg"}`}>{fmt(x.valor)}</b>
                <div><button className="btn btn-sm btn-ghost" style={{ marginTop: 4 }} onClick={() => { save((d) => ({ ...d, devedores: d.devedores.map((y) => (y.id === x.id ? { ...y, status: y.status === "Recebido" ? "Pendente" : "Recebido" } : y)) })); notify(x.status === "Recebido" ? "Marcado como pendente" : "Marcado como recebido"); }}>{x.status === "Recebido" ? "Desfazer" : "Recebi"}</button></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && form.tipo === "custo" && (
        <EntrySheet title={form.rec ? "Editar custo" : "Novo custo"} initial={form.init} onClose={() => setForm(null)}
          fields={[
            { k: "data", label: "Data", type: "date", half: true },
            { k: "tipo", label: "Tipo", type: "select", half: true, options: [...new Set([...data.config.tiposCusto, form.init.tipo])].filter(Boolean) },
            { k: "descricao", label: "Descrição", placeholder: "Ex.: Anúncio no Instagram" },
            { k: "valor", label: "Valor", type: "num" },
          ]}
          onSave={(v) => {
            if (!v.descricao.trim() || !v.valor) return "Preencha descrição e valor.";
            const item = { ...(form.rec || {}), id: form.rec ? form.rec.id : uid(), data: v.data, tipo: v.tipo, descricao: v.descricao.trim(), valor: toNum(v.valor) };
            delete item.auto;
            save((d) => ({ ...d, custos: form.rec ? d.custos.map((x) => (x.id === form.rec.id ? item : x)) : [...d.custos, item] }));
            notify(form.rec ? "Custo atualizado" : "Custo lançado");
          }}
          onDelete={form.rec ? () => { save((d) => ({ ...d, custos: d.custos.filter((x) => x.id !== form.rec.id) })); notify("Custo excluído"); } : null} />
      )}
      {form && form.tipo === "inv" && (
        <EntrySheet title={form.rec ? "Editar investimento" : "Novo investimento"} initial={form.init} onClose={() => setForm(null)}
          fields={[
            { k: "data", label: "Data", type: "date", half: true },
            { k: "valor", label: "Valor", type: "num", half: true },
            { k: "objeto", label: "O que foi comprado", placeholder: "Ex.: Estação de solda" },
          ]}
          onSave={(v) => {
            if (!v.objeto.trim() || !v.valor) return "Preencha o que foi comprado e o valor.";
            const item = { ...(form.rec || {}), id: form.rec ? form.rec.id : uid(), data: v.data, objeto: v.objeto.trim(), valor: toNum(v.valor) };
            save((d) => ({ ...d, investimentos: form.rec ? d.investimentos.map((x) => (x.id === form.rec.id ? item : x)) : [...d.investimentos, item] }));
            notify(form.rec ? "Investimento atualizado" : "Investimento lançado");
          }}
          onDelete={form.rec ? () => { save((d) => ({ ...d, investimentos: d.investimentos.filter((x) => x.id !== form.rec.id) })); notify("Investimento excluído"); } : null} />
      )}
      {form && form.tipo === "dev" && (
        <EntrySheet title={form.rec ? "Editar valor a receber" : "Novo valor a receber"} initial={form.init} onClose={() => setForm(null)}
          fields={[
            { k: "nome", label: "Quem deve", type: "auto", suggestions: sugClientes, placeholder: "Nome" },
            { k: "data", label: "Data", type: "date", half: true },
            { k: "valor", label: "Valor", type: "num", half: true },
            { k: "referente", label: "Referente a", placeholder: "Ex.: Troca de tela" },
            { k: "status", label: "Situação", type: "select", options: ["Pendente", "Recebido"] },
          ]}
          onSave={(v) => {
            if (!v.nome.trim() || !v.valor) return "Preencha nome e valor.";
            const item = { ...(form.rec || {}), id: form.rec ? form.rec.id : uid(), nome: v.nome.trim(), data: v.data, valor: toNum(v.valor), referente: v.referente.trim(), status: v.status };
            save((d) => ({ ...d, devedores: form.rec ? d.devedores.map((x) => (x.id === form.rec.id ? item : x)) : [...d.devedores, item] }));
            notify(form.rec ? "Atualizado" : "Valor a receber lançado");
          }}
          onDelete={form.rec ? () => { save((d) => ({ ...d, devedores: d.devedores.filter((x) => x.id !== form.rec.id) })); notify("Excluído"); } : null} />
      )}
    </div>
  );
}

function AparelhoItem({ a, onOpen }) {
  const l = lucroAparelho(a);
  const cor = { Vendido: "b-green", "Em estoque": "b-gold", "Em reparo": "b-blue" }[a.status];
  return (
    <button className="line-item" onClick={() => onOpen(a)}>
      <div className="info">
        <div className="t">{a.nome} <span className={`badge ${cor}`}>{a.status}</span></div>
        <div className="s num">Compra {fmt(a.valorCompra)}{a.valorReparo ? ` + reparo ${fmt(a.valorReparo)}` : ""}{a.valorVenda ? ` — venda ${fmt(a.valorVenda)}` : ""}</div>
        <div className="s">{a.status === "Vendido" ? (a.dataVenda ? `Vendido em ${a.dataVenda}` : "Sem data de venda — toque para completar") : (a.dataCompra ? `Comprado em ${a.dataCompra}` : "")}</div>
      </div>
      {a.valorVenda > 0 && <b className={`num ${l < 0 ? "neg" : "pos"}`}>{fmt(l)}</b>}
    </button>
  );
}

// ══ APARELHOS ═════════════════════════════════════════════════════════
function Aparelhos({ data, save, notify, mes, calc }) {
  const [form, setForm] = useState(null);
  const vendidosMes = calc.aps;
  const lucroMes = vendidosMes.reduce((s, a) => s + lucroAparelho(a), 0);
  const fatMes = vendidosMes.reduce((s, a) => s + a.valorVenda, 0);
  const compradosMes = data.aparelhos.filter((a) => mesDe(a.dataCompra) === mes);
  const emEstoque = data.aparelhos.filter((a) => a.status === "Em estoque");
  const emReparo = data.aparelhos.filter((a) => a.status === "Em reparo");
  const semData = data.aparelhos.filter((a) => a.status === "Vendido" && !parseDMY(a.dataVenda));
  const ordem = (arr) => [...arr].sort((a, b) => (tempo({ data: b.dataVenda || b.dataCompra }) - tempo({ data: a.dataVenda || a.dataCompra })) || ((Number(b.id) || 0) - (Number(a.id) || 0)));

  const abrir = (a) => setForm({
    rec: a,
    init: a ? { nome: a.nome, dataCompra: a.dataCompra, dataVenda: a.dataVenda, valorCompra: numStr(a.valorCompra), valorReparo: numStr(a.valorReparo), valorVenda: numStr(a.valorVenda), status: a.status, obs: a.obs || "" }
      : { nome: "", dataCompra: hoje(), dataVenda: "", valorCompra: "", valorReparo: "", valorVenda: "", status: "Em estoque", obs: "" },
  });

  return (
    <div>
      <div className="grid2 grid4" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="l">Vendidos em {mes}</div><div className="v num">{vendidosMes.length}</div><div className="s num">{fmtK(fatMes)}</div></div>
        <div className="stat"><div className="l">Lucro das vendas</div><div className={`v num ${lucroMes < 0 ? "neg" : "pos"}`}>{fmtK(lucroMes)}</div><div className="s num">Ticket {fmtK(vendidosMes.length ? fatMes / vendidosMes.length : 0)}</div></div>
        <div className="stat"><div className="l">Comprados em {mes}</div><div className="v num">{compradosMes.length}</div><div className="s num">{fmtK(compradosMes.reduce((s, a) => s + a.valorCompra, 0))}</div></div>
        <div className="stat"><div className="l">Parados agora</div><div className="v num">{emEstoque.length + emReparo.length}</div><div className="s">{emEstoque.length} em estoque, {emReparo.length} em reparo</div></div>
      </div>
      <button className="btn btn-gold" style={{ width: "100%", marginBottom: 4 }} onClick={() => abrir(null)}><Icon n="plus" s={18} />Novo aparelho</button>

      <div className="day">Em estoque e em reparo</div>
      {emEstoque.length + emReparo.length === 0 ? <div className="empty">Nenhum aparelho parado.</div> : ordem([...emReparo, ...emEstoque]).map((a) => <AparelhoItem key={a.id} a={a} onOpen={abrir} />)}

      <div className="day">Vendidos em {mes}</div>
      {vendidosMes.length === 0 ? <div className="empty">Nenhuma venda de aparelho em {mes}.</div> : ordem(vendidosMes).map((a) => <AparelhoItem key={a.id} a={a} onOpen={abrir} />)}

      {semData.length > 0 && <>
        <div className="day">Vendidos sem data de venda</div>
        <p className="hint" style={{ marginBottom: 8 }}>Complete a data para entrarem no dashboard do mês certo.</p>
        {semData.map((a) => <AparelhoItem key={a.id} a={a} onOpen={abrir} />)}
      </>}

      {form && (
        <EntrySheet title={form.rec ? "Editar aparelho" : "Novo aparelho"} initial={form.init} onClose={() => setForm(null)}
          fields={[
            { k: "nome", label: "Aparelho", placeholder: "Ex.: iPhone 13 Pro Max" },
            { k: "status", label: "Situação", type: "select", options: STATUS_APARELHO },
            { k: "dataCompra", label: "Data da compra", type: "date", half: true },
            { k: "dataVenda", label: "Data da venda", type: "date", half: true },
            { k: "valorCompra", label: "Valor de compra", type: "num", half: true },
            { k: "valorReparo", label: "Gasto no reparo", type: "num", half: true },
            { k: "valorVenda", label: "Valor de venda", type: "num" },
            { k: "obs", label: "Observação", type: "textarea", placeholder: "Opcional" },
          ]}
          preview={(v) => (
            <div className="preview"><div className="kv"><span>Lucro</span><b className="num">{fmt(toNum(v.valorVenda) - toNum(v.valorCompra) - toNum(v.valorReparo))}</b></div></div>
          )}
          onSave={(v) => {
            if (!v.nome.trim()) return "Preencha o nome do aparelho.";
            const dataVenda = v.status === "Vendido" && !parseDMY(v.dataVenda) ? hoje() : v.dataVenda;
            const item = {
              ...(form.rec || {}), id: form.rec ? form.rec.id : uid(), nome: v.nome.trim(), status: v.status, dataCompra: v.dataCompra, dataVenda,
              valorCompra: toNum(v.valorCompra), valorReparo: toNum(v.valorReparo), valorVenda: toNum(v.valorVenda), obs: v.obs.trim(),
            };
            save((d) => ({ ...d, aparelhos: form.rec ? d.aparelhos.map((x) => (x.id === form.rec.id ? item : x)) : [...d.aparelhos, item] }));
            notify(form.rec ? "Aparelho atualizado" : "Aparelho adicionado");
          }}
          onDelete={form.rec ? () => { save((d) => ({ ...d, aparelhos: d.aparelhos.filter((x) => x.id !== form.rec.id) })); notify("Aparelho excluído"); } : null} />
      )}
    </div>
  );
}

// ══ ESTOQUE ═══════════════════════════════════════════════════════════
function Estoque({ data, save, notify }) {
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState(null);
  const lista = useMemo(() => {
    const q = norm(busca);
    return data.estoque.filter((e) => !q || norm(e.item).includes(q)).sort((a, b) => a.item.localeCompare(b.item, "pt-BR", { sensitivity: "base" }));
  }, [data.estoque, busca]);
  const totalItens = data.estoque.reduce((s, e) => s + e.quantidade, 0);
  const valorTotal = data.estoque.reduce((s, e) => s + e.quantidade * e.valor, 0);
  const mudarQtd = (id, d) => save((x) => ({ ...x, estoque: x.estoque.map((e) => (e.id === id ? { ...e, quantidade: Math.max(0, e.quantidade + d) } : e)) }));
  const abrir = (e) => setForm({ rec: e, init: e ? { item: e.item, quantidade: String(e.quantidade), valor: numStr(e.valor), obs: e.obs } : { item: "", quantidade: "1", valor: "", obs: "" } });

  return (
    <div>
      <div className="grid2" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="l">Itens em estoque</div><div className="v num">{totalItens}</div><div className="s">{data.estoque.length} diferentes</div></div>
        <div className="stat"><div className="l">Valor do estoque</div><div className="v num">{fmtK(valorTotal)}</div></div>
      </div>
      <div className="search">
        <Icon n="search" s={18} />
        <input className="inp" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar item" aria-label="Buscar item" />
      </div>
      <button className="btn btn-gold" style={{ width: "100%", marginBottom: 12 }} onClick={() => abrir(null)}><Icon n="plus" s={18} />Novo item</button>
      {lista.length === 0 && <div className="empty">{busca ? "Nenhum item encontrado." : "Estoque vazio."}</div>}
      {lista.map((e) => (
        <div key={e.id} className="line-item" style={{ opacity: e.quantidade === 0 ? 0.55 : 1 }}>
          <button className="info" style={{ textAlign: "left" }} onClick={() => abrir(e)}>
            <div className="t">{e.item}</div>
            <div className="s">{[e.valor ? fmt(e.valor) + " cada" : "", e.obs].filter(Boolean).join(" — ") || "Toque para editar"}</div>
          </button>
          <div className="stepper">
            <button onClick={() => mudarQtd(e.id, -1)} aria-label={`Tirar um ${e.item}`}><Icon n="minus" s={16} /></button>
            <b className="num">{e.quantidade}</b>
            <button onClick={() => mudarQtd(e.id, 1)} aria-label={`Adicionar um ${e.item}`}><Icon n="plus" s={16} /></button>
          </div>
        </div>
      ))}
      {form && (
        <EntrySheet title={form.rec ? "Editar item" : "Novo item"} initial={form.init} onClose={() => setForm(null)}
          fields={[
            { k: "item", label: "Item", placeholder: "Ex.: Tela iPhone 12" },
            { k: "quantidade", label: "Quantidade", type: "num", half: true, placeholder: "1" },
            { k: "valor", label: "Valor (cada)", type: "num", half: true, hint: "Opcional" },
            { k: "obs", label: "Observação", placeholder: "Opcional" },
          ]}
          onSave={(v) => {
            if (!v.item.trim()) return "Preencha o nome do item.";
            const item = { id: form.rec ? form.rec.id : uid(), item: v.item.trim(), quantidade: Math.max(0, Math.round(toNum(v.quantidade))), valor: toNum(v.valor), obs: v.obs.trim() };
            save((d) => ({ ...d, estoque: form.rec ? d.estoque.map((x) => (x.id === form.rec.id ? item : x)) : [...d.estoque, item] }));
            notify(form.rec ? "Item atualizado" : "Item adicionado");
          }}
          onDelete={form.rec ? () => { save((d) => ({ ...d, estoque: d.estoque.filter((x) => x.id !== form.rec.id) })); notify("Item excluído"); } : null} />
      )}
    </div>
  );
}

// ══ CLIENTES ══════════════════════════════════════════════════════════
function Clientes({ data, save, notify }) {
  const [busca, setBusca] = useState("");
  const [sel, setSel] = useState(null);
  const clientes = useMemo(() => {
    const mapa = new Map();
    [...data.registros].sort(porDataDesc).forEach((r) => {
      const k = norm(r.cliente); if (!k) return;
      const e = mapa.get(k) || { k, nome: r.cliente.trim(), cidade: r.cidade || "", total: 0, lucro: 0, qtd: 0, ultima: "", hist: [] };
      if (r.kind === "os") { e.total += r.valor; e.lucro += lucroOS(r); e.qtd++; if (!e.ultima) e.ultima = r.data; }
      if (!e.cidade && r.cidade) e.cidade = r.cidade;
      e.hist.push(r);
      mapa.set(k, e);
    });
    return [...mapa.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
  }, [data.registros]);
  const q = norm(busca);
  const lista = q ? clientes.filter((c) => norm(c.nome).includes(q) || norm(c.cidade).includes(q)) : clientes;
  const atual = sel ? clientes.find((c) => c.k === sel) : null;

  return (
    <div>
      <div className="grid2" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="l">Clientes</div><div className="v num">{clientes.length}</div></div>
        <div className="stat"><div className="l">Voltaram mais de uma vez</div><div className="v num">{clientes.filter((c) => c.qtd > 1).length}</div></div>
      </div>
      <div className="search">
        <Icon n="search" s={18} />
        <input className="inp" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente ou cidade" aria-label="Buscar cliente" />
      </div>
      {lista.length === 0 && <div className="empty">Nenhum cliente encontrado.</div>}
      {lista.map((c) => {
        const ci = data.clientesInfo[c.k] || {};
        return (
          <button key={c.k} className="line-item" onClick={() => setSel(c.k)}>
            <div className="info">
              <div className="t">{c.nome}</div>
              <div className="s">{[c.cidade, ci.telefone, `${c.qtd} ${c.qtd === 1 ? "serviço" : "serviços"}`].filter(Boolean).join(" — ")}</div>
            </div>
            <b className="num gold">{fmtK(c.total)}</b>
          </button>
        );
      })}
      {atual && <ClienteSheet data={data} save={save} notify={notify} c={atual} onClose={() => setSel(null)} />}
    </div>
  );
}

function ClienteSheet({ data, save, notify, c, onClose }) {
  const ci = data.clientesInfo[c.k] || {};
  const [tel, setTel] = useState(ci.telefone || "");
  const [end, setEnd] = useState(ci.endereco || "");
  const mudou = tel !== (ci.telefone || "") || end !== (ci.endereco || "");
  return (
    <Sheet title={c.nome} onClose={onClose} footer={mudou ? <>
      <button className="btn btn-ghost" onClick={onClose}>Fechar</button>
      <button className="btn btn-gold" onClick={() => { save((d) => ({ ...d, clientesInfo: { ...d.clientesInfo, [c.k]: { ...(d.clientesInfo[c.k] || {}), telefone: tel, endereco: end } } })); notify("Contato salvo"); }}>Salvar contato</button>
    </> : null}>
      <div className="grid2" style={{ marginBottom: 12 }}>
        <div className="stat"><div className="l">Total gasto</div><div className="v num gold">{fmtK(c.total)}</div></div>
        <div className="stat"><div className="l">Lucro líquido</div><div className="v num pos">{fmtK(c.lucro)}</div></div>
        <div className="stat"><div className="l">Serviços</div><div className="v num">{c.qtd}</div></div>
        <div className="stat"><div className="l">Última visita</div><div className="v num" style={{ fontSize: 16 }}>{c.ultima || "—"}</div></div>
      </div>
      <div className="form" style={{ marginBottom: 16 }}>
        <Fld label="Telefone" half><input className="inp" inputMode="tel" value={tel} onChange={(e) => setTel(e.target.value)} placeholder="(47) 99999-9999" /></Fld>
        <Fld label="Cidade" half><input className="inp" value={c.cidade} readOnly /></Fld>
        <Fld label="Endereço"><input className="inp" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="Rua, número — Cidade/SC" /></Fld>
      </div>
      <div className="day" style={{ marginTop: 0 }}>Histórico</div>
      {c.hist.map((r) => (
        <div key={r.id} className="line-item">
          <div className="info">
            <div className="t">{r.aparelho || "—"} {r.kind === "garantia" && <span className="badge b-red">Garantia</span>}</div>
            <div className="s">{r.kind === "garantia" ? r.motivo : r.servico}</div>
            <div className="s">{r.data}{r.pagamento ? ` — ${r.pagamento}` : ""}</div>
          </div>
          {r.kind === "garantia"
            ? <b className="num neg">{r.custoGar ? fmt(-r.custoGar) : "—"}</b>
            : <div style={{ textAlign: "right" }}><b className="num gold">{fmt(r.valor)}</b><div className="s num pos">{fmt(lucroOS(r))}</div></div>}
        </div>
      ))}
    </Sheet>
  );
}

// ══ CONFIGURAÇÕES ═════════════════════════════════════════════════════
function ListaEditavel({ titulo, itens, onChange, placeholder }) {
  const [novo, setNovo] = useState("");
  const add = () => { const t = novo.trim(); if (!t || itens.some((i) => norm(i) === norm(t))) { setNovo(""); return; } onChange([...itens, t]); setNovo(""); };
  return (
    <div className="card">
      <div className="card-head"><h3>{titulo}</h3></div>
      <div className="tags">
        {itens.map((i) => (
          <span className="tag" key={i}>{i}<button aria-label={`Remover ${i}`} onClick={() => { if (window.confirm(`Remover "${i}"?`)) onChange(itens.filter((x) => x !== i)); }}><Icon n="x" s={14} /></button></span>
        ))}
      </div>
      <div className="row">
        <input className="inp grow" value={novo} onChange={(e) => setNovo(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === "Enter") add(); }} enterKeyHint="done" />
        <button className="btn" onClick={add} aria-label="Adicionar"><Icon n="plus" s={18} /></button>
      </div>
    </div>
  );
}

function Config({ data, save, notify, exportar, importar, sync }) {
  const cfg = data.config;
  const [metas, setMetas] = useState({ fat: numStr(cfg.metaFaturamento), luc: numStr(cfg.metaLucro) });
  const fileRef = useRef(null);
  const setCfg = (patch) => save((d) => ({ ...d, config: { ...d.config, ...patch } }));
  const bytes = useMemo(() => new Blob([JSON.stringify(data)]).size, [data]);
  const pct = Math.min(100, (bytes / (1024 * 1024)) * 100);

  return (
    <div>
      <div className="card">
        <div className="card-head"><h3>Metas do mês</h3></div>
        <div className="form">
          <Fld label="Faturamento total" half><NumInput value={metas.fat} onChange={(v) => setMetas((m) => ({ ...m, fat: v }))} /></Fld>
          <Fld label="Lucro líquido" half><NumInput value={metas.luc} onChange={(v) => setMetas((m) => ({ ...m, luc: v }))} /></Fld>
          <div className="fld"><button className="btn btn-gold" onClick={() => { setCfg({ metaFaturamento: toNum(metas.fat), metaLucro: toNum(metas.luc) }); notify("Metas salvas"); }}>Salvar metas</button></div>
        </div>
      </div>
      <ListaEditavel titulo="Origens dos clientes" itens={cfg.origens} onChange={(v) => setCfg({ origens: v })} placeholder="Nova origem" />
      <ListaEditavel titulo="Modos de atendimento" itens={cfg.modos} onChange={(v) => setCfg({ modos: v })} placeholder="Novo modo" />
      <ListaEditavel titulo="Tipos de custo" itens={cfg.tiposCusto} onChange={(v) => setCfg({ tiposCusto: v })} placeholder="Novo tipo" />
      <div className="card">
        <div className="card-head"><h3>Backup e nuvem</h3><span className="muted">{{ ok: "Sincronizado", wait: "Salvando", err: "Sem conexão com a nuvem", local: "Só neste aparelho" }[sync]}</span></div>
        <div className="row-wrap" style={{ marginBottom: 14 }}>
          <button className="btn grow" onClick={exportar}><Icon n="share" s={18} />Exportar dados</button>
          <button className="btn grow" onClick={() => fileRef.current && fileRef.current.click()}>Importar dados</button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: "none" }} onChange={(e) => { importar(e.target.files[0]); e.target.value = ""; }} />
        </div>
        <div className="kv" style={{ borderTop: 0 }}><span>Espaço usado na nuvem</span><b className="num">{(bytes / 1024).toFixed(0)} KB de 1.024 KB</b></div>
        <div className="prog"><i style={{ width: `${Math.max(1, pct)}%` }} /></div>
        <p className="hint">Quando passar de 80%, me chama para dividir os dados por ano.</p>
      </div>
    </div>
  );
}
