/*
 * Ambário — núcleo: utilidades, dados do acervo, busca, discografia × videografia e servidor.
 * Não precisa mexer aqui para cadastrar vídeos: use a área do curador (endereço do site + #admin).
 */
(function () {
  'use strict';
  const AMB = (window.AMB = window.AMB || {});
  const CFG = window.AMB_CONFIG || window.TDT_CONFIG || {}; // TDT_CONFIG: config.js antigo, de antes do nome Ambário
  AMB.cfg = (k, d) => (CFG[k] !== undefined && CFG[k] !== null && CFG[k] !== '' ? CFG[k] : d);

  /* ---------------- utilidades ---------------- */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  AMB.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  AMB.norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  AMB.slug = (s) => AMB.norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  AMB.uid = (p) => (p || 'x') + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  AMB.clone = (o) => JSON.parse(JSON.stringify(o));
  AMB.isUrl = (s) => /^https?:\/\//i.test(String(s || ''));

  // O navegador pode bloquear o armazenamento local (aba anônima, prévia): tudo aqui tolera falhas.
  AMB.store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* sem armazenamento */ } }
  };
  // Preferências salvas quando o site ainda se chamava TV de Tubo (chaves "tdt.") passam para "amb."
  try {
    ['visitante', 'favoritos', 'votos', 'nome', 'volume', 'crt', 'somBotoes', 'audioPref', 'soComVideo',
      'demo.comentarios', 'demo.stats', 'demo.sugestoes'].forEach((k) => {
      const velho = localStorage.getItem('tdt.' + k);
      if (velho != null && localStorage.getItem('amb.' + k) == null) localStorage.setItem('amb.' + k, velho);
      if (velho != null) localStorage.removeItem('tdt.' + k);
    });
    localStorage.removeItem('tdt.rascunhos');
  } catch (e) { /* sem armazenamento */ }

  AMB.fmtNum = (n) => Number(n || 0).toLocaleString('pt-BR');
  AMB.fmtDur = (s) => {
    s = Math.max(0, Math.round(Number(s) || 0));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
  };
  AMB.parseDur = (txt) => { // "3:46" → 226
    const p = String(txt || '').split(':').map(Number);
    if (!p.length || p.some(isNaN)) return 0;
    return p.reduce((a, b) => a * 60 + b, 0);
  };
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const MESES_C = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  AMB.year = (d) => ((String(d || '').match(/^(\d{4})/) || [])[1] || '');
  AMB.fmtDate = (d) => {
    const m = String(d || '').match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
    if (!m) return String(d || '');
    if (m[3]) return Number(m[3]) + ' de ' + MESES[Number(m[2]) - 1] + ' de ' + m[1];
    if (m[2]) return MESES[Number(m[2]) - 1] + ' de ' + m[1];
    return m[1];
  };
  AMB.fmtMonth = (d) => { // "2026-11" → "nov/2026"
    const m = String(d || '').match(/^(\d{4})-(\d{1,2})/);
    return m ? MESES_C[Number(m[2]) - 1] + '/' + m[1] : AMB.year(d);
  };
  AMB.ago = (iso) => {
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
  AMB.country = (code) => {
    if (!code) return '';
    try { return (regionNames && regionNames.of(String(code).toUpperCase())) || code; } catch (e) { return code; }
  };

  /* ---------------- rótulos ---------------- */
  AMB.KINDS = { clipe: 'Videoclipe', tv: 'Apresentação na TV', 'ao-vivo': 'Show ao vivo', filme: 'Cena de filme', entrevista: 'Entrevista', comercial: 'Comercial', outro: 'Registro' };
  AMB.KINDS_SHORT = { clipe: 'Clipe', tv: 'Na TV', 'ao-vivo': 'Ao vivo', filme: 'Filme', entrevista: 'Entrevista', comercial: 'Comercial', outro: 'Registro' };
  AMB.STATUS = {
    'no-acervo': { t: 'No acervo', d: 'O arquivo está no ar e toca aqui.' },
    'na-fila': { t: 'Na fila', d: 'Registro separado pelo curador. O arquivo ainda não foi enviado.' },
    'procura-se': { t: 'Procura-se', d: 'Sabemos que o registro existe, mas ninguém do acervo tem uma cópia ainda.' }
  };
  AMB.RELTYPES = { lp: 'LP', compacto: 'Compacto', single: 'Single', ep: 'EP', cd: 'CD', coletanea: 'Coletânea', participacao: 'Participação', digital: 'Digital' };
  AMB.ROLES = { curadoria: 'Curadoria', fitas: 'Fitas cedidas', captura: 'Captura de vídeo', audio: 'Digitalização de discos', sincronizacao: 'Sincronização', restauracao: 'Restauração' };
  AMB.AUDIO_KINDS = { lp: 'LP', compacto: 'Compacto', cd: 'CD', fita: 'Fita cassete', vhs: 'Fita VHS', tv: 'TV', digital: 'Digital' };

  /* ---------------- dados ----------------
   * Tudo que o site mostra vem de data/acervo.js (window.AMB_DATA), que fica no GitHub.
   * No navegador de quem edita pode haver, por cima disso:
   *   amb.publicado — a versão que este navegador acabou de salvar no GitHub, enquanto o
   *                   GitHub Pages ainda entrega a anterior (some quando o site atualiza);
   *   amb.pendente  — alterações feitas sem token, guardadas só aqui até serem publicadas.
   * As alterações são "operações" (incluir/editar/apagar um vídeo, artista ou acervo): na hora
   * de publicar elas são aplicadas por cima da versão mais nova do GitHub, então nada se perde.
   */
  const SERVIDO = window.AMB_DATA || window.TDT_DATA || { artists: [], videos: [], acervos: [], sources: {} };
  AMB.servido = SERVIDO;
  const MEIA_HORA = 30 * 60 * 1000;
  const semQuery = (c) => String(c || '').split(/[?#]/)[0];

  AMB.local = {
    publicado() {
      const p = AMB.store.get('amb.publicado', null);
      if (!p || !p.dados) return null;
      const velho = !(Date.now() - Date.parse(p.em || 0) < MEIA_HORA);
      if (velho || (Number(SERVIDO.rev) || 0) >= (Number(p.rev) || 0)) { AMB.store.del('amb.publicado'); return null; }
      return p;
    },
    salvarPublicado(dados, commit) {
      return AMB.store.set('amb.publicado', { rev: Number(dados.rev) || 0, em: new Date().toISOString(), commit: commit || '', dados });
    },
    pendente() {
      const p = AMB.store.get('amb.pendente', null);
      return p && Array.isArray(p.ops) && p.ops.length ? p : null;
    },
    adicionar(ops) {
      const p = AMB.store.get('amb.pendente', null) || { ops: [], desde: new Date().toISOString(), baseRev: AMB.estado ? AMB.estado.baseRev : 0 };
      p.ops = compactarOps((p.ops || []).concat(ops || []));
      p.em = new Date().toISOString();
      if (!AMB.store.set('amb.pendente', p)) throw new Error('sem_espaco');
    },
    limparPendente() { AMB.store.del('amb.pendente'); },
    // capa ou foto enviada e ainda não publicada: o site mostra a imagem guardada aqui
    arquivo(caminho) { return capasPendentes[semQuery(caminho)] || ''; }
  };
  let capasPendentes = {};

  // Junta operações repetidas do mesmo arquivo (fica só a última), para o rascunho não crescer à toa.
  function compactarOps(ops) {
    const ultimo = {};
    ops.forEach((op, i) => { if (op && (op.t === 'arquivo' || op.t === 'apagar-arquivo')) ultimo[op.caminho] = i; });
    return ops.filter((op, i) => op && !((op.t === 'arquivo' || op.t === 'apagar-arquivo') && ultimo[op.caminho] !== i));
  }
  AMB.compactarOps = compactarOps;

  // Aplica as operações num objeto de dados (o mesmo formato de data/acervo.js) e devolve uma cópia.
  //   { t: 'video' | 'artista' | 'acervo', id, antes?, dados }  inclui ou substitui (antes = id antigo, se mudou)
  //   { t: 'apagar-video' | 'apagar-artista' | 'apagar-acervo', id }
  //   { t: 'fonte', id, dados: { t, u } }
  //   { t: 'arquivo', caminho, dataUrl } e { t: 'apagar-arquivo', caminho } só valem na hora de publicar
  const LISTAS = { video: 'videos', artista: 'artists', acervo: 'acervos' };
  AMB.aplicarOps = function (dados, ops) {
    const d = AMB.clone(dados || {});
    ['videos', 'artists', 'acervos'].forEach((k) => { if (!Array.isArray(d[k])) d[k] = []; });
    if (!d.sources || typeof d.sources !== 'object' || Array.isArray(d.sources)) d.sources = {};
    (ops || []).forEach((op) => {
      if (!op || !op.t) return;
      if (op.t === 'fonte') { if (op.id && op.dados) d.sources[op.id] = op.dados; return; }
      const m = /^(apagar-)?(video|artista|acervo)$/.exec(op.t);
      if (!m) return;
      const lista = d[LISTAS[m[2]]];
      const i = lista.findIndex((x) => x && x.id === (op.antes || op.id));
      if (m[1]) { if (i >= 0) lista.splice(i, 1); return; }
      if (!op.id || !op.dados) return;
      const outro = lista.findIndex((x, k) => x && x.id === op.id && k !== i);
      if (outro >= 0) {
        if (i >= 0) throw new Error('id_repetido:' + op.id);
        lista.splice(outro, 1, Object.assign({}, AMB.clone(op.dados), { id: op.id }));
        return;
      }
      const novo = Object.assign({ id: op.id }, AMB.clone(op.dados), { id: op.id });
      if (i >= 0) lista[i] = novo; else lista.push(novo);
    });
    return d;
  };

  function dadosAtuais() {
    const pub = AMB.local.publicado();
    const base = pub ? pub.dados : SERVIDO;
    const pend = AMB.local.pendente();
    AMB.estado = { publicado: pub ? { rev: pub.rev, em: pub.em } : null, pendentes: pend ? pend.ops.length : 0, baseRev: Number(base.rev) || 0, erro: '' };
    capasPendentes = {};
    if (!pend) return { dados: base, base };
    pend.ops.forEach((op) => {
      if (op.t === 'arquivo' && op.dataUrl) capasPendentes[semQuery(op.caminho)] = op.dataUrl;
      if (op.t === 'apagar-arquivo') delete capasPendentes[semQuery(op.caminho)];
    });
    try { return { dados: AMB.aplicarOps(base, pend.ops), base }; } catch (e) {
      AMB.estado.erro = String((e && e.message) || e);
      return { dados: base, base };
    }
  }

  function chaveData(d) {
    const m = String(d || '').match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
    if (!m) return '9999-99-99';
    return m[1] + '-' + (m[2] || '00').padStart(2, '0') + '-' + (m[3] || '00').padStart(2, '0');
  }
  AMB.dateKey = chaveData;

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
    a.searchText = AMB.norm([a.name].concat(a.alt || [], a.origin || '', AMB.country(a.country)).join(' '));
    return a;
  }

  // "Beat Acelerado (2ª versão)" → "Beat Acelerado"
  function limpaTitulo(t) {
    return String(t || '').replace(/\s*\((?:[^)]*(?:vers[aã]o|remix|ao vivo|demo|mix|inédita|live|en vivo)[^)]*)\)\s*$/i, '').trim();
  }
  AMB.cleanTitle = limpaTitulo;

  function normVideo(v, idx, artists) {
    v = Object.assign({ audio: [], credits: {}, source: {}, src: [], refs: [], tags: [] }, v);
    v.file = v.file || {};
    v.hasFile = !!v.file.video;
    if (!v.status) v.status = v.hasFile ? 'no-acervo' : 'na-fila';
    if (v.status === 'no-acervo' && !v.hasFile) v.status = 'na-fila';
    if (v.status !== 'no-acervo') v.hasFile = false;
    v.year = AMB.year(v.date);
    v.decade = v.year ? Math.floor(Number(v.year) / 10) * 10 : null;
    v.sortKey = chaveData(v.date);
    let a = artists[v.artist];
    if (!a) {
      a = normArtist({ id: v.artist || AMB.slug(v.artist_name || 'desconhecido'), name: v.artist_name || v.artist || 'Artista não identificado' });
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
    v.audio = v.audio.map((t, i) => Object.assign({ id: 'faixa' + i, short: t.short || AMB.AUDIO_KINDS[t.kind] || ('Áudio ' + (i + 1)) }, t, {
      embedded: t.embedded === true || (!t.url && i === 0)
    }));
    // capa: imagem escolhida pelo curador (media/capas/…); senão a do arquivo ou a do Internet Archive
    const capa = v.capa ? (AMB.local.arquivo(v.capa) || v.capa) : '';
    v.thumb = capa || v.file.poster || (v.file.ia ? 'https://archive.org/services/img/' + encodeURIComponent(v.file.ia) : '');
    if (v.fit !== 'cover' && v.fit !== 'fill') v.fit = '';
    v.duration = Number(v.duration) || 0;
    v.n = idx + 1;
    v.kindLabel = AMB.KINDS[v.kind] || AMB.KINDS.outro;
    v.kindShort = AMB.KINDS_SHORT[v.kind] || AMB.KINDS_SHORT.outro;
    v.searchText = AMB.norm([v.title, a.name].concat(a.alt || [], v.songObj ? v.songObj.t : '', v.program || '', v.channel || '',
      v.director || '', v.year, v.kindLabel, (v.tags || []).join(' '), v.description || '').join(' '));
    return v;
  }

  AMB.build = function () {
    const atual = dadosAtuais();
    AMB.dados = atual.dados; // objeto "cru", no formato de data/acervo.js (a área do curador parte dele)
    AMB.sources = atual.dados.sources || {};
    AMB.updated = atual.dados.updated || '';
    const D = AMB.clone(atual.dados);
    const artists = {};
    (D.artists || []).forEach((a) => { if (a && a.id) artists[a.id] = normArtist(a); });
    const acervos = {};
    (D.acervos || []).forEach((c) => {
      if (!c || !c.id) return;
      acervos[c.id] = Object.assign({ roles: [], links: [] }, c);
      if (c.avatar) acervos[c.id].avatar = AMB.local.arquivo(c.avatar) || c.avatar;
    });

    const lista = (D.videos || []).filter((v) => v && v.id);
    const videos = lista.map((v, i) => normVideo(v, i, artists));
    const byId = {};
    videos.forEach((v) => { byId[v.id] = v; v.artistObj.videos.push(v); });
    Object.values(artists).forEach((a) => a.videos.sort((x, y) => x.sortKey.localeCompare(y.sortKey)));
    // numeração estável do "canal" (OSD da TV): ordem do arquivo de dados
    lista.forEach((v, i) => { if (byId[v.id]) byId[v.id].n = i + 1; });
    // com alterações ainda não publicadas, o que mudou ganha o selo RASCUNHO (só neste navegador)
    if (AMB.estado.pendentes) {
      const antes = {};
      (atual.base.videos || []).forEach((v) => { if (v && v.id) antes[v.id] = JSON.stringify(v); });
      lista.forEach((v) => { if (byId[v.id] && antes[v.id] !== JSON.stringify(v)) byId[v.id].draft = true; });
    }

    AMB.artists = artists;
    AMB.artistList = Object.values(artists).filter((a) => !a.test).sort((x, y) => AMB.norm(x.name).localeCompare(AMB.norm(y.name)));
    AMB.acervos = acervos;
    AMB.videos = videos;
    AMB.videoById = byId;
    calcCreditos();
  };

  /* ---------------- créditos e acervos ---------------- */
  // Um crédito pode ser o id de um acervo (vira link) ou um nome livre.
  AMB.who = (x) => {
    if (!x) return null;
    const c = AMB.acervos[x];
    return c ? { id: c.id, name: c.name, acervo: c } : { id: '', name: String(x) };
  };
  const PAPEIS_VIDEO = [['tape', 'fitas'], ['capture', 'captura'], ['audio', 'audio'], ['sync', 'sincronizacao'], ['restore', 'restauracao']];
  function calcCreditos() {
    Object.values(AMB.acervos).forEach((c) => { c.trabalhos = { fitas: [], captura: [], audio: [], sincronizacao: [], restauracao: [], cadastro: [] }; });
    AMB.videos.forEach((v) => {
      const cr = v.credits || {};
      PAPEIS_VIDEO.forEach(([campo, papel]) => {
        const c = AMB.acervos[cr[campo]];
        if (c && c.trabalhos[papel].indexOf(v) < 0) c.trabalhos[papel].push(v);
      });
      (v.audio || []).forEach((t) => { const c = AMB.acervos[t.by]; if (c && c.trabalhos.audio.indexOf(v) < 0) c.trabalhos.audio.push(v); });
      const ad = AMB.acervos[v.added_by];
      if (ad) ad.trabalhos.cadastro.push(v);
    });
    Object.values(AMB.acervos).forEach((c) => {
      const s = new Set();
      ['fitas', 'captura', 'audio', 'sincronizacao', 'restauracao'].forEach((k) => c.trabalhos[k].forEach((v) => s.add(v)));
      c.todos = Array.from(s);
    });
  }

  // Quem aparece no quadro "Acervo" da página do vídeo (como o "From:" dos sites de vídeo antigos)
  AMB.mainCredit = (v) => {
    const cr = v.credits || {};
    if (cr.tape) return { papel: 'Fita cedida por', w: AMB.who(cr.tape) };
    if (cr.capture) return { papel: 'Digitalizado por', w: AMB.who(cr.capture) };
    if (v.added_by) return { papel: 'Cadastrado por', w: AMB.who(v.added_by) };
    const cur = AMB.cfg('CURADOR', '');
    return cur ? { papel: 'Cadastrado por', w: AMB.who(cur) } : null;
  };

  AMB.src = (id) => {
    if (!id) return null;
    if (typeof id === 'object') return id.t ? id : null;
    return AMB.sources[id] ? Object.assign({ id }, AMB.sources[id]) : { id, t: id, u: AMB.isUrl(id) ? id : '' };
  };

  /* ---------------- discografia × videografia ---------------- */
  // Para cada disco: cada faixa com os registros em vídeo da mesma música.
  // "mesma" = o vídeo usa a mesma gravação da faixa; "outra" = outra versão (ao vivo, demo, regravação...).
  AMB.coverage = function (a) {
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
  AMB.songReleases = (v) => {
    if (!v.songObj) return [];
    return (v.songObj.appears || []).map((x) => ({ r: x.release, t: x.track, mesma: (v.ver || '') === (x.track.ver || '') }));
  };

  /* ---------------- listas, busca e relacionados ---------------- */
  AMB.publicVideos = () => AMB.videos.filter((v) => !v.test || v.hasFile);

  AMB.search = function (q) {
    const termos = AMB.norm(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return { videos: [], artists: [], acervos: [] };
    const bate = (txt) => termos.every((t) => txt.indexOf(t) >= 0);
    return {
      videos: AMB.videos.filter((v) => bate(v.searchText)),
      artists: AMB.artistList.filter((a) => bate(a.searchText)),
      acervos: Object.values(AMB.acervos).filter((c) => bate(AMB.norm(c.name + ' ' + (c.city || '') + ' ' + (c.bio || ''))))
    };
  };

  AMB.related = function (v, max) {
    max = max || 12;
    const out = [], visto = new Set([v.id]);
    const add = (lista) => lista.forEach((x) => { if (!visto.has(x.id) && out.length < max) { visto.add(x.id); out.push(x); } });
    const outros = AMB.videos.filter((x) => !x.test);
    add(v.artistObj.videos.filter((x) => !x.test));
    add(outros.filter((x) => x.hasFile && x.decade === v.decade && x.nacional === v.nacional));
    add(outros.filter((x) => x.decade === v.decade && x.nacional === v.nacional));
    add(outros.filter((x) => x.hasFile));
    add(outros.filter((x) => x.decade === v.decade));
    add(outros);
    return out;
  };

  // Anterior/próximo do player: só vídeos que tocam, primeiro os do mesmo artista
  AMB.neighbors = function (v) {
    let lista = v.artistObj.videos.filter((x) => x.hasFile);
    if (lista.length < 2) lista = AMB.videos.filter((x) => x.hasFile);
    const i = lista.indexOf(v);
    if (i < 0 || lista.length < 2) return { prev: null, next: null };
    return { prev: lista[(i - 1 + lista.length) % lista.length], next: lista[(i + 1) % lista.length] };
  };

  /* ---------------- favoritos e votos (só neste navegador) ---------------- */
  AMB.favs = {
    list() { return AMB.store.get('amb.favoritos', []) || []; },
    has(id) { return this.list().indexOf(id) >= 0; },
    toggle(id) {
      const l = this.list();
      const i = l.indexOf(id);
      if (i >= 0) l.splice(i, 1); else l.unshift(id);
      AMB.store.set('amb.favoritos', l);
      return i < 0;
    }
  };
  AMB.myVote = (id) => (AMB.store.get('amb.votos', {}) || {})[id] || 0;

  /* ---------------- comentários: regras (as mesmas do servidor) ---------------- */
  AMB.LINK = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|br|io|ly|me|tv|info|xyz|link|site|online|app)\b)/i;
  AMB.checkComment = (nome, texto) => {
    nome = String(nome || '').trim();
    texto = String(texto || '').trim();
    if (nome.length < 2) return 'Escreva seu nome ou apelido.';
    if (nome.length > 40) return 'O nome pode ter até 40 caracteres.';
    if (texto.length < 2) return 'Escreva o comentário.';
    if (texto.length > 500) return 'O comentário pode ter até 500 caracteres.';
    if (AMB.LINK.test(nome) || AMB.LINK.test(texto)) return 'Links não são permitidos nos comentários.';
    return '';
  };

  /* ---------------- servidor (Apps Script) e modo demonstração ---------------- */
  async function comTempo(url, opts, ms) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), ms || 12000) : null;
    try { return await fetch(url, Object.assign({}, opts || {}, ctrl ? { signal: ctrl.signal } : {})); }
    finally { if (timer) clearTimeout(timer); }
  }
  const DEMO = { c: 'amb.demo.comentarios', s: 'amb.demo.stats', g: 'amb.demo.sugestoes' };
  const statsCache = {};

  AMB.api = {
    url() { return AMB.cfg('APPS_SCRIPT_URL', ''); },
    live() { return !!this.url(); },
    visitor() {
      let id = AMB.store.get('amb.visitante', '');
      if (!id) { id = AMB.uid('v'); AMB.store.set('amb.visitante', id); }
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
      if (!this.live()) return ((AMB.store.get(DEMO.c, {}) || {})[video] || []).slice().reverse();
      const j = await this.get({ action: 'comments', video });
      return j.items || [];
    },
    async recent() {
      if (!this.live()) {
        const todos = AMB.store.get(DEMO.c, {}) || {};
        const l = [];
        Object.keys(todos).forEach((vid) => (todos[vid] || []).forEach((c) => l.push(Object.assign({ video_id: vid }, c))));
        return l.sort((a, b) => String(b.criado_em).localeCompare(String(a.criado_em))).slice(0, 6);
      }
      const j = await this.get({ action: 'recent' });
      return j.items || [];
    },
    async postComment(video, nome, texto, extra) {
      const erro = AMB.checkComment(nome, texto);
      if (erro) throw new Error(erro);
      nome = nome.trim(); texto = texto.trim();
      if (!this.live()) {
        const todos = AMB.store.get(DEMO.c, {}) || {};
        const item = { id: AMB.uid('c'), nome, texto, criado_em: new Date().toISOString() };
        (todos[video] = todos[video] || []).push(item);
        AMB.store.set(DEMO.c, todos);
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
          const s = AMB.store.get(DEMO.s, {}) || {};
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
      const votos = AMB.store.get('amb.votos', {}) || {};
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
      AMB.store.set('amb.votos', votos);
      return res;
    },
    async suggest(dados) {
      if (!this.live()) {
        const l = AMB.store.get(DEMO.g, []) || [];
        l.unshift(Object.assign({ id: AMB.uid('s'), criado_em: new Date().toISOString() }, dados));
        AMB.store.set(DEMO.g, l.slice(0, 50));
        return { ok: true, demo: true };
      }
      return this.post(Object.assign({ action: 'suggest', visitante: this.visitor() }, dados));
    },
    cached(id) { return statsCache[id] || null; }
  };

  function bump(video, fn) {
    const s = AMB.store.get(DEMO.s, {}) || {};
    s[video] = Object.assign({ v: 0, r: 0, n: 0, c: 0 }, s[video] || {});
    fn(s[video]);
    AMB.store.set(DEMO.s, s);
    statsCache[video] = Object.assign({}, s[video]);
  }

  // Mensagens de erro do servidor em português
  AMB.erroMsg = (e) => {
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

  AMB.build();
})();
