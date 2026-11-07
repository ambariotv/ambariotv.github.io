/*
 * TV de Tubo — núcleo: utilidades, dados do acervo, busca, discografia × videografia e servidor.
 * Não precisa mexer aqui para cadastrar vídeos: use data/acervo.js (ou a área do curador, #admin).
 */
(function () {
  'use strict';
  const TDT = (window.TDT = window.TDT || {});
  const CFG = window.TDT_CONFIG || {};
  TDT.cfg = (k, d) => (CFG[k] !== undefined && CFG[k] !== null && CFG[k] !== '' ? CFG[k] : d);

  /* ---------------- utilidades ---------------- */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  TDT.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  TDT.norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  TDT.slug = (s) => TDT.norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  TDT.uid = (p) => (p || 'x') + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  TDT.clone = (o) => JSON.parse(JSON.stringify(o));
  TDT.isUrl = (s) => /^https?:\/\//i.test(String(s || ''));

  // O navegador pode bloquear o armazenamento local (aba anônima, prévia): tudo aqui tolera falhas.
  TDT.store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* sem armazenamento */ } }
  };

  TDT.fmtNum = (n) => Number(n || 0).toLocaleString('pt-BR');
  TDT.fmtDur = (s) => {
    s = Math.max(0, Math.round(Number(s) || 0));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
  };
  TDT.parseDur = (txt) => { // "3:46" → 226
    const p = String(txt || '').split(':').map(Number);
    if (!p.length || p.some(isNaN)) return 0;
    return p.reduce((a, b) => a * 60 + b, 0);
  };
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const MESES_C = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  TDT.year = (d) => ((String(d || '').match(/^(\d{4})/) || [])[1] || '');
  TDT.fmtDate = (d) => {
    const m = String(d || '').match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
    if (!m) return String(d || '');
    if (m[3]) return Number(m[3]) + ' de ' + MESES[Number(m[2]) - 1] + ' de ' + m[1];
    if (m[2]) return MESES[Number(m[2]) - 1] + ' de ' + m[1];
    return m[1];
  };
  TDT.fmtMonth = (d) => { // "2026-11" → "nov/2026"
    const m = String(d || '').match(/^(\d{4})-(\d{1,2})/);
    return m ? MESES_C[Number(m[2]) - 1] + '/' + m[1] : TDT.year(d);
  };
  TDT.ago = (iso) => {
    const t = Date.parse(iso);
    if (!t) return '';
    const s = Math.max(0, (Date.now() - t) / 1000);
    const f = (n, a, b) => 'há ' + n + ' ' + (n === 1 ? a : b);
    if (s < 60) return 'agora há pouco';
    if (s < 3600) return f(Math.floor(s / 60), 'minuto', 'minutos');
    if (s < 86400) return f(Math.floor(s / 3600), 'hora', 'horas');
    if (s < 86400 * 30) return f(Math.floor(s / 86400), 'dia', 'dias');
    if (s < 86400 * 365) return f(Math.floor(s / (86400 * 30)), 'mês', 'meses');
    return f(Math.floor(s / (86400 * 365)), 'ano', 'anos');
  };
  let regionNames = null;
  try { regionNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' }); } catch (e) { regionNames = null; }
  TDT.country = (code) => {
    if (!code) return '';
    try { return (regionNames && regionNames.of(String(code).toUpperCase())) || code; } catch (e) { return code; }
  };

  /* ---------------- rótulos ---------------- */
  TDT.KINDS = { clipe: 'Videoclipe', tv: 'Apresentação na TV', 'ao-vivo': 'Show ao vivo', filme: 'Cena de filme', entrevista: 'Entrevista', comercial: 'Comercial', outro: 'Registro' };
  TDT.KINDS_SHORT = { clipe: 'Clipe', tv: 'Na TV', 'ao-vivo': 'Ao vivo', filme: 'Filme', entrevista: 'Entrevista', comercial: 'Comercial', outro: 'Registro' };
  TDT.STATUS = {
    'no-acervo': { t: 'No acervo', d: 'O arquivo está no ar e toca aqui.' },
    'na-fila': { t: 'Na fila', d: 'Registro separado pelo curador. O arquivo ainda não foi enviado.' },
    'procura-se': { t: 'Procura-se', d: 'Sabemos que o registro existe, mas ninguém do acervo tem uma cópia ainda.' }
  };
  TDT.RELTYPES = { lp: 'LP', compacto: 'Compacto', single: 'Single', ep: 'EP', cd: 'CD', coletanea: 'Coletânea', participacao: 'Participação', digital: 'Digital' };
  TDT.ROLES = { curadoria: 'Curadoria', fitas: 'Fitas cedidas', captura: 'Captura de vídeo', audio: 'Digitalização de discos', sincronizacao: 'Sincronização', restauracao: 'Restauração' };
  TDT.AUDIO_KINDS = { lp: 'LP', compacto: 'Compacto', cd: 'CD', fita: 'Fita cassete', vhs: 'Fita VHS', tv: 'TV', digital: 'Digital' };

  /* ---------------- dados ---------------- */
  const RAW = window.TDT_DATA || { artists: [], videos: [], acervos: [], sources: {} };
  TDT.sources = RAW.sources || {};
  TDT.updated = RAW.updated || '';

  // Rascunhos feitos na área do curador: aparecem só neste navegador, com o selo RASCUNHO.
  TDT.drafts = {
    list() { return TDT.store.get('tdt.rascunhos', []) || []; },
    save(v) {
      const l = this.list().filter((x) => x.id !== v.id);
      l.unshift(Object.assign({}, v, { draft: true }));
      TDT.store.set('tdt.rascunhos', l.slice(0, 30));
    },
    remove(id) { TDT.store.set('tdt.rascunhos', this.list().filter((x) => x.id !== id)); },
    clear() { TDT.store.del('tdt.rascunhos'); }
  };

  function chaveData(d) {
    const m = String(d || '').match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
    if (!m) return '9999-99-99';
    return m[1] + '-' + (m[2] || '00').padStart(2, '0') + '-' + (m[3] || '00').padStart(2, '0');
  }
  TDT.dateKey = chaveData;

  function normRelease(r, artist) {
    r = Object.assign({ tracks: [], src: [] }, r);
    r.artist = artist.id;
    r.tracks = (r.tracks || []).map((t, i) => Object.assign({ n: String(i + 1) }, t, { i }));
    r.sortKey = chaveData(r.date || r.year);
    return r;
  }

  function normArtist(a) {
    a = Object.assign({ releases: [], members: [], src: [], alt: [], songs: {} }, a);
    a.releases = (a.releases || []).map((r) => normRelease(r, a)).sort((x, y) => x.sortKey.localeCompare(y.sortKey));
    const songs = {};
    Object.keys(a.songs || {}).forEach((k) => { songs[k] = Object.assign({ id: k, appears: [] }, a.songs[k]); });
    a.releases.forEach((r) => {
      r.tracks.forEach((t) => {
        if (!t.song) return;
        const s = songs[t.song] || (songs[t.song] = { id: t.song, t: '', w: '', appears: [] });
        // o título da música vem da primeira faixa sem versão especial (ex.: não "remix")
        if (!s.t || (!t.ver && s._fromVer)) { s.t = limpaTitulo(t.t); s._fromVer = !!t.ver; }
        if (!s.w && t.w) s.w = t.w;
        s.appears.push({ release: r, track: t });
      });
    });
    a.songs = songs;
    a.videos = [];
    a.nacional = String(a.country || '').toUpperCase() === 'BR';
    a.searchText = TDT.norm([a.name].concat(a.alt || [], a.origin || '', TDT.country(a.country)).join(' '));
    return a;
  }

  // "Beat Acelerado (2ª versão)" → "Beat Acelerado"
  function limpaTitulo(t) {
    return String(t || '').replace(/\s*\((?:[^)]*(?:vers[aã]o|remix|ao vivo|demo|mix|inédita|live|en vivo)[^)]*)\)\s*$/i, '').trim();
  }
  TDT.cleanTitle = limpaTitulo;

  function normVideo(v, idx, artists) {
    v = Object.assign({ audio: [], credits: {}, source: {}, src: [], refs: [], tags: [] }, v);
    v.file = v.file || {};
    v.hasFile = !!v.file.video;
    if (!v.status) v.status = v.hasFile ? 'no-acervo' : 'na-fila';
    if (v.status === 'no-acervo' && !v.hasFile) v.status = 'na-fila';
    if (v.status !== 'no-acervo') v.hasFile = false;
    v.year = TDT.year(v.date);
    v.decade = v.year ? Math.floor(Number(v.year) / 10) * 10 : null;
    v.sortKey = chaveData(v.date);
    let a = artists[v.artist];
    if (!a) {
      a = normArtist({ id: v.artist || TDT.slug(v.artist_name || 'desconhecido'), name: v.artist_name || v.artist || 'Artista não identificado' });
      artists[a.id] = a;
    }
    v.artistObj = a;
    v.nacional = a.nacional;
    if (v.song) {
      if (!a.songs[v.song]) a.songs[v.song] = { id: v.song, t: v.song_title || limpaTitulo(v.title), w: '', appears: [] };
      v.songObj = a.songs[v.song];
    } else v.songObj = null;
    if (!v.audio || !v.audio.length) {
      v.audio = v.hasFile ? [{ id: 'principal', short: 'Original', label: 'Som do arquivo', embedded: true }] : [];
    }
    v.audio = v.audio.map((t, i) => Object.assign({ id: 'faixa' + i, short: t.short || TDT.AUDIO_KINDS[t.kind] || ('Áudio ' + (i + 1)) }, t, {
      embedded: t.embedded === true || (!t.url && i === 0)
    }));
    v.thumb = v.file.poster || (v.file.ia ? 'https://archive.org/services/img/' + encodeURIComponent(v.file.ia) : '');
    v.duration = Number(v.duration) || 0;
    v.n = idx + 1;
    v.kindLabel = TDT.KINDS[v.kind] || TDT.KINDS.outro;
    v.kindShort = TDT.KINDS_SHORT[v.kind] || TDT.KINDS_SHORT.outro;
    v.searchText = TDT.norm([v.title, a.name].concat(a.alt || [], v.songObj ? v.songObj.t : '', v.program || '', v.channel || '',
      v.director || '', v.year, v.kindLabel, (v.tags || []).join(' '), v.description || '').join(' '));
    return v;
  }

  TDT.build = function () {
    const D = TDT.clone(RAW);
    const artists = {};
    (D.artists || []).forEach((a) => { if (a && a.id) artists[a.id] = normArtist(a); });
    const acervos = {};
    (D.acervos || []).forEach((c) => { if (c && c.id) acervos[c.id] = Object.assign({ roles: [], links: [] }, c); });

    // rascunhos substituem (só neste navegador) um vídeo publicado com o mesmo id
    const drafts = TDT.drafts.list();
    const ids = new Set(drafts.map((d) => d.id));
    const lista = drafts.concat((D.videos || []).filter((v) => v && v.id && !ids.has(v.id)));
    const videos = lista.map((v, i) => normVideo(v, i, artists));
    const byId = {};
    videos.forEach((v) => { byId[v.id] = v; v.artistObj.videos.push(v); });
    Object.values(artists).forEach((a) => a.videos.sort((x, y) => x.sortKey.localeCompare(y.sortKey)));
    // numeração estável do "canal" (OSD da TV): ordem do arquivo de dados
    (D.videos || []).forEach((v, i) => { if (byId[v.id]) byId[v.id].n = i + 1; });

    TDT.artists = artists;
    TDT.artistList = Object.values(artists).filter((a) => !a.test).sort((x, y) => TDT.norm(x.name).localeCompare(TDT.norm(y.name)));
    TDT.acervos = acervos;
    TDT.videos = videos;
    TDT.videoById = byId;
    calcCreditos();
  };

  /* ---------------- créditos e acervos ---------------- */
  // Um crédito pode ser o id de um acervo (vira link) ou um nome livre.
  TDT.who = (x) => {
    if (!x) return null;
    const c = TDT.acervos[x];
    return c ? { id: c.id, name: c.name, acervo: c } : { id: '', name: String(x) };
  };
  const PAPEIS_VIDEO = [['tape', 'fitas'], ['capture', 'captura'], ['audio', 'audio'], ['sync', 'sincronizacao'], ['restore', 'restauracao']];
  function calcCreditos() {
    Object.values(TDT.acervos).forEach((c) => { c.trabalhos = { fitas: [], captura: [], audio: [], sincronizacao: [], restauracao: [], cadastro: [] }; });
    TDT.videos.forEach((v) => {
      const cr = v.credits || {};
      PAPEIS_VIDEO.forEach(([campo, papel]) => {
        const c = TDT.acervos[cr[campo]];
        if (c && c.trabalhos[papel].indexOf(v) < 0) c.trabalhos[papel].push(v);
      });
      (v.audio || []).forEach((t) => { const c = TDT.acervos[t.by]; if (c && c.trabalhos.audio.indexOf(v) < 0) c.trabalhos.audio.push(v); });
      const ad = TDT.acervos[v.added_by];
      if (ad) ad.trabalhos.cadastro.push(v);
    });
    Object.values(TDT.acervos).forEach((c) => {
      const s = new Set();
      ['fitas', 'captura', 'audio', 'sincronizacao', 'restauracao'].forEach((k) => c.trabalhos[k].forEach((v) => s.add(v)));
      c.todos = Array.from(s);
    });
  }

  // Quem aparece no quadro "Acervo" da página do vídeo (como o "From:" dos sites de vídeo antigos)
  TDT.mainCredit = (v) => {
    const cr = v.credits || {};
    if (cr.tape) return { papel: 'Fita cedida por', w: TDT.who(cr.tape) };
    if (cr.capture) return { papel: 'Digitalizado por', w: TDT.who(cr.capture) };
    if (v.added_by) return { papel: 'Cadastrado por', w: TDT.who(v.added_by) };
    const cur = TDT.cfg('CURADOR', '');
    return cur ? { papel: 'Cadastrado por', w: TDT.who(cur) } : null;
  };

  TDT.src = (id) => {
    if (!id) return null;
    if (typeof id === 'object') return id.t ? id : null;
    return TDT.sources[id] ? Object.assign({ id }, TDT.sources[id]) : { id, t: id, u: TDT.isUrl(id) ? id : '' };
  };

  /* ---------------- discografia × videografia ---------------- */
  // Para cada disco: cada faixa com os registros em vídeo da mesma música.
  // "mesma" = o vídeo usa a mesma gravação da faixa; "outra" = outra versão (ao vivo, demo, regravação...).
  TDT.coverage = function (a) {
    const porMusica = {};
    a.videos.forEach((v) => { if (v.song) (porMusica[v.song] = porMusica[v.song] || []).push(v); });
    const discos = a.releases.map((r) => {
      const linhas = r.tracks.map((t) => {
        const vs = (t.song && porMusica[t.song]) || [];
        const regs = vs.map((v) => ({ v, rel: (v.ver || '') === (t.ver || '') ? 'mesma' : 'outra' }))
          .sort((x, y) => (x.rel === y.rel ? x.v.sortKey.localeCompare(y.v.sortKey) : x.rel === 'mesma' ? -1 : 1));
        return { t, regs };
      });
      const comVideo = linhas.filter((l) => l.regs.length).length;
      const noAcervo = linhas.filter((l) => l.regs.some((x) => x.v.hasFile)).length;
      return { r, linhas, total: linhas.length, comVideo, noAcervo };
    });
    const noDisco = new Set();
    a.releases.forEach((r) => r.tracks.forEach((t) => { if (t.song) noDisco.add(t.song); }));
    const soltos = a.videos.filter((v) => !v.song || !noDisco.has(v.song));
    const musicas = Array.from(noDisco);
    const musicasComVideo = musicas.filter((s) => porMusica[s] && porMusica[s].length);
    const cont = { 'no-acervo': 0, 'na-fila': 0, 'procura-se': 0 };
    a.videos.forEach((v) => { cont[v.status] = (cont[v.status] || 0) + 1; });
    return { discos, soltos, musicas: musicas.length, musicasComVideo: musicasComVideo.length, cont, videos: a.videos.length };
  };

  // Em que discos a música saiu (para "Sobre a música" na página do vídeo)
  TDT.songReleases = (v) => {
    if (!v.songObj) return [];
    return (v.songObj.appears || []).map((x) => ({ r: x.release, t: x.track, mesma: (v.ver || '') === (x.track.ver || '') }));
  };

  /* ---------------- listas, busca e relacionados ---------------- */
  TDT.publicVideos = () => TDT.videos.filter((v) => !v.test || v.hasFile);

  TDT.search = function (q) {
    const termos = TDT.norm(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return { videos: [], artists: [], acervos: [] };
    const bate = (txt) => termos.every((t) => txt.indexOf(t) >= 0);
    return {
      videos: TDT.videos.filter((v) => bate(v.searchText)),
      artists: TDT.artistList.filter((a) => bate(a.searchText)),
      acervos: Object.values(TDT.acervos).filter((c) => bate(TDT.norm(c.name + ' ' + (c.city || '') + ' ' + (c.bio || ''))))
    };
  };

  TDT.related = function (v, max) {
    max = max || 12;
    const out = [], visto = new Set([v.id]);
    const add = (lista) => lista.forEach((x) => { if (!visto.has(x.id) && out.length < max) { visto.add(x.id); out.push(x); } });
    const outros = TDT.videos.filter((x) => !x.test);
    add(v.artistObj.videos.filter((x) => !x.test));
    add(outros.filter((x) => x.hasFile && x.decade === v.decade && x.nacional === v.nacional));
    add(outros.filter((x) => x.decade === v.decade && x.nacional === v.nacional));
    add(outros.filter((x) => x.hasFile));
    add(outros.filter((x) => x.decade === v.decade));
    add(outros);
    return out;
  };

  // Anterior/próximo do player: só vídeos que tocam, primeiro os do mesmo artista
  TDT.neighbors = function (v) {
    let lista = v.artistObj.videos.filter((x) => x.hasFile);
    if (lista.length < 2) lista = TDT.videos.filter((x) => x.hasFile);
    const i = lista.indexOf(v);
    if (i < 0 || lista.length < 2) return { prev: null, next: null };
    return { prev: lista[(i - 1 + lista.length) % lista.length], next: lista[(i + 1) % lista.length] };
  };

  /* ---------------- favoritos e votos (só neste navegador) ---------------- */
  TDT.favs = {
    list() { return TDT.store.get('tdt.favoritos', []) || []; },
    has(id) { return this.list().indexOf(id) >= 0; },
    toggle(id) {
      const l = this.list();
      const i = l.indexOf(id);
      if (i >= 0) l.splice(i, 1); else l.unshift(id);
      TDT.store.set('tdt.favoritos', l);
      return i < 0;
    }
  };
  TDT.myVote = (id) => (TDT.store.get('tdt.votos', {}) || {})[id] || 0;

  /* ---------------- comentários: regras (as mesmas do servidor) ---------------- */
  TDT.LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|br|io|ly|me|tv|info|xyz|link|site|online|app)\b)/i;
  TDT.checkComment = (nome, texto) => {
    nome = String(nome || '').trim();
    texto = String(texto || '').trim();
    if (nome.length < 2) return 'Escreva seu nome ou apelido.';
    if (nome.length > 40) return 'O nome pode ter até 40 caracteres.';
    if (texto.length < 2) return 'Escreva o comentário.';
    if (texto.length > 500) return 'O comentário pode ter até 500 caracteres.';
    if (TDT.LINK.test(nome) || TDT.LINK.test(texto)) return 'Links não são permitidos nos comentários.';
    return '';
  };

  /* ---------------- servidor (Apps Script) e modo demonstração ---------------- */
  async function comTempo(url, opts, ms) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), ms || 12000) : null;
    try { return await fetch(url, Object.assign({}, opts || {}, ctrl ? { signal: ctrl.signal } : {})); }
    finally { if (timer) clearTimeout(timer); }
  }
  const DEMO = { c: 'tdt.demo.comentarios', s: 'tdt.demo.stats', g: 'tdt.demo.sugestoes' };
  const statsCache = {};

  TDT.api = {
    url() { return TDT.cfg('APPS_SCRIPT_URL', ''); },
    live() { return !!this.url(); },
    visitor() {
      let id = TDT.store.get('tdt.visitante', '');
      if (!id) { id = TDT.uid('v'); TDT.store.set('tdt.visitante', id); }
      return id;
    },
    async get(params) {
      const u = new URL(this.url());
      Object.keys(params).forEach((k) => u.searchParams.set(k, params[k]));
      const r = await comTempo(u.toString(), {}, 15000);
      const j = await r.json();
      if (!j || j.ok === false) throw new Error((j && j.error) || 'erro');
      return j;
    },
    async post(payload) {
      // corpo em texto puro: evita a checagem prévia (CORS) que o Apps Script não responde
      const r = await comTempo(this.url(), { method: 'POST', body: JSON.stringify(payload) }, 20000);
      const j = await r.json();
      if (!j || j.ok === false) throw new Error((j && j.error) || 'erro');
      return j;
    },

    async comments(video) {
      if (!this.live()) return ((TDT.store.get(DEMO.c, {}) || {})[video] || []).slice().reverse();
      const j = await this.get({ action: 'comments', video });
      return j.items || [];
    },
    async recent() {
      if (!this.live()) {
        const todos = TDT.store.get(DEMO.c, {}) || {};
        const l = [];
        Object.keys(todos).forEach((vid) => (todos[vid] || []).forEach((c) => l.push(Object.assign({ video_id: vid }, c))));
        return l.sort((a, b) => String(b.criado_em).localeCompare(String(a.criado_em))).slice(0, 6);
      }
      const j = await this.get({ action: 'recent' });
      return j.items || [];
    },
    async postComment(video, nome, texto, extra) {
      const erro = TDT.checkComment(nome, texto);
      if (erro) throw new Error(erro);
      nome = nome.trim(); texto = texto.trim();
      if (!this.live()) {
        const todos = TDT.store.get(DEMO.c, {}) || {};
        const item = { id: TDT.uid('c'), nome, texto, criado_em: new Date().toISOString() };
        (todos[video] = todos[video] || []).push(item);
        TDT.store.set(DEMO.c, todos);
        bump(video, (s) => { s.c = (s.c || 0) + 1; });
        return { ok: true, item, demo: true };
      }
      const j = await this.post(Object.assign({ action: 'comment', video, nome, texto, visitante: this.visitor() }, extra || {}));
      if (statsCache[video]) statsCache[video].c = (statsCache[video].c || 0) + (j.pendente ? 0 : 1);
      return j;
    },
    async stats(ids) {
      ids = Array.from(new Set(ids)).filter(Boolean);
      const faltam = ids.filter((id) => !statsCache[id]);
      if (faltam.length) {
        if (!this.live()) {
          const s = TDT.store.get(DEMO.s, {}) || {};
          faltam.forEach((id) => { statsCache[id] = Object.assign({ v: 0, r: 0, n: 0, c: 0 }, s[id] || {}); });
        } else {
          for (let i = 0; i < faltam.length; i += 60) {
            const parte = faltam.slice(i, i + 60);
            try {
              const j = await this.get({ action: 'stats', ids: parte.join(',') });
              parte.forEach((id) => { statsCache[id] = Object.assign({ v: 0, r: 0, n: 0, c: 0 }, (j.stats || {})[id] || {}); });
            } catch (e) { parte.forEach((id) => { statsCache[id] = null; delete statsCache[id]; }); throw e; }
          }
        }
      }
      const out = {};
      ids.forEach((id) => { if (statsCache[id]) out[id] = statsCache[id]; });
      return out;
    },
    async view(video) {
      if (!this.live()) { bump(video, (s) => { s.v = (s.v || 0) + 1; }); return { ok: true }; }
      const j = await this.post({ action: 'view', video, visitante: this.visitor() });
      if (statsCache[video] && j.contou) statsCache[video].v = (statsCache[video].v || 0) + 1;
      return j;
    },
    async rate(video, estrelas) {
      estrelas = Math.max(1, Math.min(5, Math.round(estrelas)));
      const votos = TDT.store.get('tdt.votos', {}) || {};
      const antes = votos[video] || 0;
      let res;
      if (!this.live()) {
        bump(video, (s) => {
          const soma = (s.r || 0) * (s.n || 0) - antes + estrelas;
          s.n = (s.n || 0) + (antes ? 0 : 1);
          s.r = s.n ? Math.round((soma / s.n) * 100) / 100 : 0;
        });
        res = { ok: true, r: statsCache[video].r, n: statsCache[video].n };
      } else {
        res = await this.post({ action: 'rate', video, estrelas, visitante: this.visitor() });
        statsCache[video] = Object.assign(statsCache[video] || { v: 0, c: 0 }, { r: res.r, n: res.n });
      }
      votos[video] = estrelas;
      TDT.store.set('tdt.votos', votos);
      return res;
    },
    async suggest(dados) {
      if (!this.live()) {
        const l = TDT.store.get(DEMO.g, []) || [];
        l.unshift(Object.assign({ id: TDT.uid('s'), criado_em: new Date().toISOString() }, dados));
        TDT.store.set(DEMO.g, l.slice(0, 50));
        return { ok: true, demo: true };
      }
      return this.post(Object.assign({ action: 'suggest', visitante: this.visitor() }, dados));
    },
    cached(id) { return statsCache[id] || null; }
  };

  function bump(video, fn) {
    const s = TDT.store.get(DEMO.s, {}) || {};
    s[video] = Object.assign({ v: 0, r: 0, n: 0, c: 0 }, s[video] || {});
    fn(s[video]);
    TDT.store.set(DEMO.s, s);
    statsCache[video] = Object.assign({}, s[video]);
  }

  // Mensagens de erro do servidor em português
  TDT.erroMsg = (e) => {
    const m = String((e && e.message) || e || '');
    const mapa = {
      sem_links: 'Links não são permitidos nos comentários.',
      muitos_comentarios: 'Muitos comentários em pouco tempo. Espere alguns minutos.',
      muitas_sugestoes: 'Muitas mensagens em pouco tempo. Tente de novo mais tarde.',
      texto_curto: 'Escreva um pouco mais.', texto_longo: 'O texto passou do limite.',
      nome_invalido: 'Confira o seu nome ou apelido.', video_invalido: 'Vídeo não encontrado.',
      rapido_demais: 'Espere alguns segundos antes de enviar.', grande_demais: 'A mensagem ficou grande demais.',
      AbortError: 'O servidor demorou para responder. Tente de novo.'
    };
    if (mapa[m]) return mapa[m];
    if (/abort/i.test(m)) return mapa.AbortError;
    if (/failed to fetch|networkerror|load failed/i.test(m)) return 'Sem conexão com o servidor agora. Tente de novo em instantes.';
    return m || 'Algo deu errado.';
  };

  TDT.build();
})();
