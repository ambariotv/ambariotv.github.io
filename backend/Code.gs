/**
 * Ambário — servidor no Google Apps Script (gratuito)
 * ===========================================================
 * O que este script faz:
 *   1. Guarda e mostra os COMENTÁRIOS de cada vídeo (aba "Comentarios").
 *   2. Conta as EXIBIÇÕES (aba "Exibicoes") e guarda as AVALIAÇÕES de 1 a 5 estrelas (aba "Avaliacoes").
 *   3. Recebe as MENSAGENS do site: "Tenho essa gravação", correções e contatos de quem quer colaborar
 *      (aba "Mensagens"). Se quiser, avisa você por e-mail quando chega uma.
 *
 * Moderação: direto na planilha. Na coluna "status" de cada comentário escolha
 *   publicado (aparece) · oculto (some do site) · pendente (aguardando você).
 * As mensagens têm status novo · em andamento · resolvido · descartado (só para você se organizar).
 * O site atualiza em até 2 minutos depois de uma mudança na planilha.
 *
 * Instalação (o passo a passo detalhado está no README, seção 6):
 *   1. Crie uma planilha no Google Sheets (ex.: "Ambário - banco").
 *   2. Na planilha: Extensões → Apps Script. Apague o conteúdo e cole este arquivo inteiro.
 *   3. Escolha a função setup no menu e clique em Executar (autorize o acesso).
 *   4. Implantar → Nova implantação → Tipo: App da Web
 *      Executar como: Eu  |  Quem pode acessar: Qualquer pessoa  → Implantar.
 *   5. Copie a URL que termina em /exec e cole em js/config.js, no campo APPS_SCRIPT_URL.
 *
 * Sempre que mudar este código: Implantar → Gerenciar implantações → editar (lápis) →
 * Versão: Nova versão → Implantar. A URL continua a mesma.
 */

/* ---------------- ajustes ---------------- */
// Comentários aparecem na hora (true) ou só depois de você mudar para "publicado" na planilha (false)
const PUBLICAR_DIRETO = true;
// Avisar por e-mail (no e-mail da sua conta Google) quando chegar "Tenho essa gravação" ou um contato
const AVISAR_POR_EMAIL = true;
const MAX_COMENTARIOS_POR_PESSOA_10MIN = 4;
const MAX_COMENTARIOS_10MIN = 60;    // limite geral contra spam
const MAX_MENSAGENS_10MIN = 40;

/* ---------------- planilha ---------------- */
const ABA_COM = 'Comentarios';
const ABA_EXI = 'Exibicoes';
const ABA_AVA = 'Avaliacoes';
const ABA_MSG = 'Mensagens';
const COL_COM = ['id', 'criado_em', 'video', 'nome', 'texto', 'status', 'visitante', 'nota_admin'];
const COL_EXI = ['video', 'exibicoes', 'atualizado_em'];
const COL_AVA = ['chave', 'video', 'estrelas', 'criado_em', 'atualizado_em'];
const COL_MSG = ['id', 'criado_em', 'tipo', 'status', 'video', 'artista', 'titulo', 'nome', 'contato', 'mensagem', 'fonte_url', 'nota_admin'];
const ST_COM = ['publicado', 'oculto', 'pendente'];
const ST_MSG = ['novo', 'em andamento', 'resolvido', 'descartado'];
const TIPOS_MSG = { tenho: 'Tenho essa gravação', correcao: 'Correção', contato: 'Quero colaborar', info: 'Informação' };

const LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|br|io|ly|me|tv|info|xyz|link|site|online|app)\b)/i;
const ID_VIDEO = /^[a-z0-9][a-z0-9-]{1,110}$/;

/* ------------------------------------------------------------------ */
/* Configuração inicial                                                 */
/* ------------------------------------------------------------------ */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const com = aba_(ABA_COM, COL_COM);
  const exi = aba_(ABA_EXI, COL_EXI);
  const ava = aba_(ABA_AVA, COL_AVA);
  const msg = aba_(ABA_MSG, COL_MSG);
  [com, exi, ava, msg].forEach(cabecalho_);
  caixaStatus_(com, COL_COM.indexOf('status') + 1, ST_COM, { publicado: '#d9ead3', oculto: '#f4cccc', pendente: '#fff2cc' });
  caixaStatus_(msg, COL_MSG.indexOf('status') + 1, ST_MSG, { 'novo': '#fff2cc', 'em andamento': '#cfe2f3', 'resolvido': '#d9ead3', 'descartado': '#eeeeee' });
  com.setColumnWidth(5, 420); msg.setColumnWidth(10, 420); msg.setColumnWidth(9, 180);

  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SAL')) props.setProperty('SAL', Utilities.getUuid());
  props.setProperty('GEN', String(Date.now()));

  ScriptApp.getProjectTriggers().filter((t) => t.getHandlerFunction() === 'aoEditar').forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('aoEditar').forSpreadsheet(ss).onEdit().create();
  if (AVISAR_POR_EMAIL) Logger.log('Avisos por e-mail vão para: ' + Session.getEffectiveUser().getEmail() + ' (cota de hoje: ' + MailApp.getRemainingDailyQuota() + ')');
  Logger.log('Pronto! Agora: Implantar → Nova implantação → App da Web (Executar como: Eu; Quem pode acessar: Qualquer pessoa).');
}

// Qualquer edição na planilha (moderação) faz o site buscar os dados de novo
function aoEditar() { PropertiesService.getScriptProperties().setProperty('GEN', String(Date.now())); }
function limparCache() { aoEditar(); Logger.log('Cache limpo.'); }

/* ------------------------------------------------------------------ */
/* Pontos de entrada do Web App                                         */
/* ------------------------------------------------------------------ */
function doGet(e) {
  const p = (e && e.parameter) || {};
  try {
    switch (p.action) {
      case 'comments': return json_(comentarios_(texto_(p.video, 120)));
      case 'recent': return json_({ ok: true, items: recentes_() });
      case 'stats': return json_(stats_(String(p.ids || '').split(',').slice(0, 80)));
      case 'ping': return json_({ ok: true, app: 'Ambário' });
      default: return json_({ ok: false, error: 'acao_desconhecida' });
    }
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

function doPost(e) {
  let b = {};
  try { b = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, error: 'json_invalido' }); }
  try {
    switch (b.action) {
      case 'comment': return json_(comentar_(b));
      case 'view': return json_(exibicao_(b));
      case 'rate': return json_(avaliar_(b));
      case 'suggest': return json_(mensagem_(b));
      default: return json_({ ok: false, error: 'acao_desconhecida' });
    }
  } catch (err) {
    return json_({ ok: false, error: String((err && err.message) || err) });
  }
}

/* ------------------------------------------------------------------ */
/* Comentários                                                          */
/* ------------------------------------------------------------------ */
function comentarios_(video) {
  if (!ID_VIDEO.test(video)) return { ok: false, error: 'video_invalido' };
  const cache = CacheService.getScriptCache();
  const chave = 'c:' + gen_() + ':' + video;
  const hit = cache.get(chave);
  if (hit) return { ok: true, items: JSON.parse(hit) };
  const itens = linhas_(aba_(ABA_COM, COL_COM))
    .filter((r) => String(r.video) === video && String(r.status) === 'publicado')
    .map((r) => ({ id: String(r.id), nome: String(r.nome), texto: String(r.texto), criado_em: str_(r.criado_em) }))
    .reverse().slice(0, 300);
  const s = JSON.stringify(itens);
  if (s.length < 95000) cache.put(chave, s, 600);
  return { ok: true, items: itens };
}

function recentes_() {
  const cache = CacheService.getScriptCache();
  const chave = 'r:' + gen_();
  const hit = cache.get(chave);
  if (hit) return JSON.parse(hit);
  const sh = aba_(ABA_COM, COL_COM);
  const n = sh.getLastRow() - 1;
  if (n < 1) return [];
  const ini = Math.max(2, sh.getLastRow() - 300);
  const vals = sh.getRange(ini, 1, sh.getLastRow() - ini + 1, COL_COM.length).getValues();
  const col = (k) => COL_COM.indexOf(k);
  const itens = vals.filter((r) => String(r[col('status')]) === 'publicado').reverse().slice(0, 6)
    .map((r) => ({ video_id: String(r[col('video')]), nome: String(r[col('nome')]), texto: String(r[col('texto')]).slice(0, 200), criado_em: str_(r[col('criado_em')]) }));
  cache.put(chave, JSON.stringify(itens), 120);
  return itens;
}

function comentar_(b) {
  if (b.website) return { ok: true, pendente: true };            // campo-armadilha preenchido = robô
  const video = texto_(b.video, 120);
  if (!ID_VIDEO.test(video)) return { ok: false, error: 'video_invalido' };
  if (Number(b.t) > 0 && Number(b.t) < 3000) return { ok: false, error: 'rapido_demais' };
  if (String(b.texto || '').length > 600) return { ok: false, error: 'texto_longo' };
  const nome = limpa_(b.nome, 40, false);
  const texto = limpa_(b.texto, 500, true);
  if (nome.length < 2) return { ok: false, error: 'nome_invalido' };
  if (texto.length < 2) return { ok: false, error: 'texto_curto' };
  if (LINK.test(nome) || LINK.test(texto)) return { ok: false, error: 'sem_links' };

  const vis = visitante_(b.visitante);
  const cache = CacheService.getScriptCache();
  const nv = Number(cache.get('cv:' + vis) || 0);
  const ng = Number(cache.get('cg') || 0);
  if (nv >= MAX_COMENTARIOS_POR_PESSOA_10MIN || ng >= MAX_COMENTARIOS_10MIN) return { ok: false, error: 'muitos_comentarios' };
  cache.put('cv:' + vis, String(nv + 1), 600);
  cache.put('cg', String(ng + 1), 600);

  const item = { id: Utilities.getUuid(), nome: nome, texto: texto, criado_em: new Date().toISOString() };
  const status = PUBLICAR_DIRETO ? 'publicado' : 'pendente';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    aba_(ABA_COM, COL_COM).appendRow([item.id, item.criado_em, video, seguro_(nome), seguro_(texto), status, vis, '']);
  } finally { lock.releaseLock(); }
  const g = gen_();
  cache.removeAll(['c:' + g + ':' + video, 'r:' + g, 's:' + g]);
  return { ok: true, pendente: !PUBLICAR_DIRETO, item: PUBLICAR_DIRETO ? item : null };
}

/* ------------------------------------------------------------------ */
/* Exibições e avaliações                                               */
/* ------------------------------------------------------------------ */
function exibicao_(b) {
  const video = texto_(b.video, 120);
  if (!ID_VIDEO.test(video)) return { ok: false, error: 'video_invalido' };
  const cache = CacheService.getScriptCache();
  const chave = 'v:' + visitante_(b.visitante) + ':' + video;
  if (cache.get(chave)) return { ok: true, contou: false };       // a mesma pessoa conta uma vez a cada 6 h
  cache.put(chave, '1', 21600);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = aba_(ABA_EXI, COL_EXI);
    const achou = sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).createTextFinder(video).matchEntireCell(true).findNext();
    if (achou && achou.getRow() > 1) {
      const c = sh.getRange(achou.getRow(), 2);
      c.setValue(Number(c.getValue() || 0) + 1);
      sh.getRange(achou.getRow(), 3).setValue(new Date().toISOString());
    } else {
      sh.appendRow([video, 1, new Date().toISOString()]);
    }
  } finally { lock.releaseLock(); }
  return { ok: true, contou: true };
}

function avaliar_(b) {
  const video = texto_(b.video, 120);
  if (!ID_VIDEO.test(video)) return { ok: false, error: 'video_invalido' };
  const estrelas = Math.round(Number(b.estrelas));
  if (!(estrelas >= 1 && estrelas <= 5)) return { ok: false, error: 'estrelas_invalidas' };
  const chave = video + '|' + visitante_(b.visitante);         // um voto por pessoa e vídeo (pode mudar)
  const agora = new Date().toISOString();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let soma = 0, n = 0;
  try {
    const sh = aba_(ABA_AVA, COL_AVA);
    const achou = sh.getRange(1, 1, Math.max(1, sh.getLastRow()), 1).createTextFinder(chave).matchEntireCell(true).findNext();
    if (achou && achou.getRow() > 1) sh.getRange(achou.getRow(), 3, 1, 3).setValues([[estrelas, sh.getRange(achou.getRow(), 4).getValue(), agora]]);
    else sh.appendRow([chave, video, estrelas, agora, agora]);
    linhas_(sh).forEach((r) => { if (String(r.video) === video) { soma += Number(r.estrelas) || 0; n++; } });
  } finally { lock.releaseLock(); }
  CacheService.getScriptCache().remove('s:' + gen_());
  return { ok: true, r: n ? Math.round((soma / n) * 100) / 100 : 0, n: n };
}

// Números de cada vídeo: v = exibições, r = média das estrelas, n = avaliações, c = comentários publicados
function stats_(ids) {
  const cache = CacheService.getScriptCache();
  const chave = 's:' + gen_();
  let todos = null;
  const hit = cache.get(chave);
  if (hit) todos = JSON.parse(hit);
  else {
    todos = {};
    const pega = (id) => (todos[id] = todos[id] || { v: 0, r: 0, n: 0, c: 0, _s: 0 });
    linhas_(aba_(ABA_EXI, COL_EXI)).forEach((r) => { if (r.video) pega(String(r.video)).v = Number(r.exibicoes) || 0; });
    linhas_(aba_(ABA_AVA, COL_AVA)).forEach((r) => { if (r.video) { const s = pega(String(r.video)); s._s += Number(r.estrelas) || 0; s.n++; } });
    linhas_(aba_(ABA_COM, COL_COM)).forEach((r) => { if (r.video && String(r.status) === 'publicado') pega(String(r.video)).c++; });
    Object.keys(todos).forEach((k) => { const s = todos[k]; s.r = s.n ? Math.round((s._s / s.n) * 100) / 100 : 0; delete s._s; });
    const txt = JSON.stringify(todos);
    if (txt.length < 95000) cache.put(chave, txt, 120);
  }
  const out = {};
  ids.map((x) => String(x).trim()).filter((x) => ID_VIDEO.test(x)).forEach((id) => { out[id] = todos[id] || { v: 0, r: 0, n: 0, c: 0 }; });
  return { ok: true, stats: out };
}

/* ------------------------------------------------------------------ */
/* Mensagens: "Tenho essa gravação", correções e contatos               */
/* ------------------------------------------------------------------ */
function mensagem_(b) {
  if (b.website) return { ok: true };                              // robô
  const tipo = String(b.tipo || '');
  if (!TIPOS_MSG[tipo]) return { ok: false, error: 'tipo_invalido' };
  const bruto = JSON.stringify(b);
  if (bruto.length > 8000) return { ok: false, error: 'grande_demais' };
  const mensagem = limpa_(b.mensagem, 2500, true);
  if (mensagem.length < 3) return { ok: false, error: 'texto_curto' };
  const fonte = texto_(b.fonte_url, 500);
  if (fonte && !/^https?:\/\//i.test(fonte)) return { ok: false, error: 'link_invalido' };
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get('mg') || 0);
  if (n >= MAX_MENSAGENS_10MIN) return { ok: false, error: 'muitas_sugestoes' };
  cache.put('mg', String(n + 1), 600);

  const linha = {
    id: Utilities.getUuid(), criado_em: new Date().toISOString(), tipo: tipo,
    video: texto_(b.video, 120), artista: texto_(b.artista, 80), titulo: limpa_(b.titulo, 200, false),
    nome: limpa_(b.nome, 80, false), contato: limpa_(b.contato, 150, false), mensagem: mensagem, fonte: fonte
  };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    aba_(ABA_MSG, COL_MSG).appendRow([linha.id, linha.criado_em, tipo, 'novo', seguro_(linha.video), seguro_(linha.artista), seguro_(linha.titulo),
      seguro_(linha.nome), seguro_(linha.contato), seguro_(mensagem), seguro_(fonte), '']);
  } finally { lock.releaseLock(); }

  if (AVISAR_POR_EMAIL && (tipo === 'tenho' || tipo === 'contato')) {
    try {
      MailApp.sendEmail({
        to: Session.getEffectiveUser().getEmail(),
        subject: 'Ambário — ' + TIPOS_MSG[tipo] + (linha.titulo ? ': ' + linha.titulo : ''),
        body: [
          TIPOS_MSG[tipo] + (linha.titulo ? ' — ' + linha.titulo : ''),
          'Nome: ' + linha.nome, 'Contato: ' + linha.contato, '', mensagem, '',
          'Veja na planilha, aba Mensagens: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
        ].join('\n')
      });
    } catch (err) { /* sem cota de e-mail hoje: a mensagem já está na planilha */ }
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Utilidades                                                           */
/* ------------------------------------------------------------------ */
function aba_(nome, colunas) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(nome);
  if (!sh) {
    sh = ss.insertSheet(nome);
    sh.appendRow(colunas);
  }
  return sh;
}

function cabecalho_(sh) {
  const n = sh.getLastColumn();
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, n).setFontWeight('bold').setBackground('#263238').setFontColor('#ffffff');
}

function caixaStatus_(sh, col, valores, cores) {
  const linhas = Math.max(sh.getMaxRows() - 1, 1);
  const faixa = sh.getRange(2, col, linhas, 1);
  faixa.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(valores, true).setAllowInvalid(false).build());
  const regras = sh.getConditionalFormatRules().filter((r) => !r.getRanges().some((g) => g.getColumn() === col));
  Object.keys(cores).forEach((v) => regras.push(SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(v).setBackground(cores[v]).setRanges([faixa]).build()));
  sh.setConditionalFormatRules(regras);
}

function linhas_(sh) {
  const valores = sh.getDataRange().getValues();
  const cab = valores.shift() || [];
  return valores.map((r, i) => {
    const o = { _row: i + 2 };
    cab.forEach((h, j) => { o[h] = r[j]; });
    return o;
  });
}

// Visitante anônimo: o site manda um código aleatório guardado no navegador; aqui ele vira um resumo (hash)
function visitante_(v) {
  // 'tdt' vem do nome antigo do site; fica assim para os visitantes de antes continuarem com o mesmo código
  const sal = PropertiesService.getScriptProperties().getProperty('SAL') || 'tdt';
  const d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, sal + '|' + texto_(v, 80));
  return Utilities.base64EncodeWebSafe(d).slice(0, 16);
}
function gen_() { return PropertiesService.getScriptProperties().getProperty('GEN') || '0'; }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function texto_(v, max) { return String(v == null ? '' : v).slice(0, max || 500); }
function str_(v) { return v instanceof Date ? v.toISOString() : String(v == null ? '' : v); }
// Tira caracteres de controle e espaços repetidos; "linhas" mantém as quebras de linha (no máximo duas seguidas)
function limpa_(v, max, linhas) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  s = linhas ? s.replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n') : s.replace(/\s+/g, ' ');
  return s.trim().slice(0, max);
}
// Impede que um texto enviado vire fórmula na planilha (=, +, -, @)
function seguro_(v) { const s = String(v == null ? '' : v); return /^[=+\-@]/.test(s) ? "'" + s : s; }
