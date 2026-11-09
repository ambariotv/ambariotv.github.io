/*
 * Ambário — telas (HTML). Cada função devolve o HTML de uma página; o app.js liga os eventos.
 */
(function () {
  'use strict';
  const AMB = window.AMB;
  const esc = AMB.esc;
  const T = AMB.t;
  const V = (AMB.V = {});
  // Texto escrito no acervo, no idioma do site: a versão em inglês salva (campo_en) ou, se não tiver,
  // o português marcado para ser traduzido na hora (AMB.traduzirPagina)
  V.tx = (o, campo, max) => {
    const pt = String((o && o[campo]) || '');
    const corta = (s) => (max && s.length > max ? s.slice(0, max - 3) + '…' : s);
    if (!AMB.en || !pt) return esc(corta(pt));
    const en = o[campo + '_en'] || AMB.traduzido(pt);
    if (en) return '<span lang="en">' + esc(corta(en)) + '</span>';
    return '<span data-tr="' + esc(pt) + '"' + (max ? ' data-tr-max="' + max + '"' : '') + '>' + esc(corta(pt)) + '</span>';
  };

  /* ---------------- peças pequenas ---------------- */
  const hue = (s) => { let h = 0; String(s || '').split('').forEach((c) => { h = (h * 31 + c.charCodeAt(0)) % 360; }); return h; };
  V.hue = hue;
  const pl = (n, um, varios) => AMB.fmtNum(n) + ' ' + (n === 1 ? um : varios);
  V.pl = pl;

  V.selo = (st) => '<span class="selo selo-' + esc(st) + '" title="' + esc((AMB.STATUS[st] || {}).d || '') + '">' + esc((AMB.STATUS[st] || {}).t || st) + '</span>';

  V.estrelas = (r, n, cls) => {
    const p = Math.max(0, Math.min(5, Number(r) || 0)) / 5 * 100;
    return '<span class="estrelas ' + (cls || '') + '" title="' + (n ? AMB.fmtNum(Math.round((r || 0) * 10) / 10) + T(' de 5 (', ' out of 5 (') + pl(n, T('avaliação', 'rating'), T('avaliações', 'ratings')) + ')' : T('Sem avaliações', 'No ratings')) + '">' +
      '<span class="est-vazio">★★★★★</span><span class="est-cheio" style="width:' + p.toFixed(0) + '%">★★★★★</span></span>';
  };

  V.thumb = (v, tam) => {
    const nn = String(v.n || 0).padStart(2, '0');
    return '<a class="th th-' + (tam || 'm') + (v.thumb ? '' : ' th-sem') + '" href="#v-' + esc(v.id) + '" aria-label="' + esc(v.artistObj.name + ' — ' + v.title) + '">' +
      (v.thumb ? '<img src="' + esc(v.thumb) + '" alt="" loading="lazy" decoding="async">' : '') +
      '<span class="th-azul" aria-hidden="true"><span class="th-ch">CH ' + nn + '</span>' +
        '<span class="th-art">' + esc(v.artistObj.name) + '</span><span class="th-tit">' + esc(v.title) + '</span>' +
        '<span class="th-ss">' + (v.status === 'procura-se' ? T('SEM FITA', 'NO TAPE') : T('SEM SINAL', 'NO SIGNAL')) + '</span></span>' +
      (v.duration && v.hasFile ? '<span class="th-dur">' + AMB.fmtDur(v.duration) + '</span>' : '') +
      (v.status !== 'no-acervo' ? '<span class="th-selo">' + V.selo(v.status) + '</span>' : '') +
      (v.draft ? '<span class="th-rasc">' + T('RASCUNHO', 'DRAFT') + '</span>' : '') +
      (v.hasFile && v.audio.length > 1 ? '<span class="th-2a" title="' + T('Dá para escolher entre o áudio do disco e o da fita', 'You can switch between the record audio and the tape audio') + '">' + T('2 ÁUDIOS', '2 AUDIO TRACKS') + '</span>' : '') +
    '</a>';
  };

  V.statsSlot = (v, curto) => '<span class="st" data-st="' + esc(v.id) + '"' + (curto ? ' data-curto="1"' : '') + '></span>';

  V.card = (v) =>
    '<div class="card">' + V.thumb(v, 'm') +
      '<div class="card-txt">' +
        '<a class="card-tit" href="#v-' + esc(v.id) + '">' + esc(v.title) + '</a>' +
        '<div class="card-de">' + T('de', 'by') + ' <a href="#a-' + esc(v.artistObj.id) + '">' + esc(v.artistObj.name) + '</a></div>' +
        '<div class="card-meta">' + esc(v.kindShort) + (v.year ? ' · ' + esc(v.year) : '') + '</div>' +
        (v.hasFile ? '<div class="card-meta">' + V.statsSlot(v) + '</div>' : '') +
      '</div></div>';

  V.linha = (v) => { // item de lista (estilo "resultado de busca" antigo)
    const cr = AMB.mainCredit(v);
    return '<div class="linha">' + V.thumb(v, 'm') +
      '<div class="linha-txt">' +
        '<a class="linha-tit" href="#v-' + esc(v.id) + '">' + esc(v.artistObj.name) + ' — ' + esc(v.title) + '</a>' + (v.status !== 'no-acervo' ? ' ' + V.selo(v.status) : '') +
        (v.description ? '<p class="linha-desc">' + V.tx(v, 'description', 170) + '</p>' : '') +
        '<div class="linha-meta">' + esc(v.kindLabel) + (v.date ? ' · ' + esc(AMB.fmtDate(v.date)) : '') +
          (v.program || v.channel ? ' · ' + esc([v.program, v.channel].filter(Boolean).join(', ')) : '') + '</div>' +
        '<div class="linha-meta">' + [cr && cr.w ? esc(cr.papel) + ': ' + V.quem(cr.w) : '', v.hasFile ? V.statsSlot(v) : ''].filter(Boolean).join(' · ') + '</div>' +
      '</div></div>';
  };

  V.quem = (w) => (w ? (w.id ? '<a href="#c-' + esc(w.id) + '">' + esc(w.name) + '</a>' : esc(w.name)) : '');

  V.avatar = (c, tam) => {
    const nome = (c && c.name) || '?';
    const ini = esc(nome.replace(/^[^A-Za-zÀ-ÿ0-9]+/, '').charAt(0).toUpperCase() || '?');
    return '<span class="avatar avatar-' + (tam || 'm') + '" style="--h:' + hue(c && c.id) + '">' +
      (c && c.avatar ? '<img src="' + esc(c.avatar) + '" alt="">' : '') + '<b>' + ini + '</b></span>';
  };

  V.discoIcone = (a, tam) => a.photo
    ? '<span class="art-foto art-foto-' + (tam || 'm') + '" aria-hidden="true"><img src="' + esc(AMB.local.arquivo(a.photo) || a.photo) + '" alt="" loading="lazy"></span>'
    : '<span class="vinil vinil-' + (tam || 'm') + '" style="--h:' + hue(a.id) + '" aria-hidden="true"><b>' + esc((a.name || '?').charAt(0).toUpperCase()) + '</b></span>';

  V.fontes = (lista, rot) => {
    const itens = (lista || []).map(AMB.src).filter(Boolean);
    if (!itens.length) return '';
    return '<div class="fontes"><b>' + esc(rot || T('Fontes', 'Sources')) + ':</b> ' + itens.map((s) =>
      s.u ? '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a>' : '<span>' + esc(s.t) + '</span>').join(' · ') + '</div>';
  };

  V.box = (titulo, corpo, cls, extra) =>
    '<section class="box ' + (cls || '') + '"><div class="box-h"><h3>' + titulo + '</h3>' + (extra || '') + '</div><div class="box-c">' + corpo + '</div></section>';

  V.vazio = (txt) => '<p class="vazio">' + txt + '</p>';

  /* ---------------- início ---------------- */
  V.chipsHome = () => {
    const vs = AMB.videos.filter((v) => !v.test);
    const decadas = Array.from(new Set(vs.map((v) => v.decade).filter(Boolean))).sort();
    const chips = [['tudo', T('Tudo', 'All')], ['no-acervo', AMB.STATUS['no-acervo'].t], ['nacionais', T('Nacionais', 'Brazilian')], ['internacionais', T('Internacionais', 'International')],
      ['clipe', T('Clipes', 'Music videos')], ['tv', T('Na TV', 'On TV')], ['ao-vivo', T('Ao vivo', 'Live')], ['filme', T('Filmes', 'Films')]]
      .concat(decadas.map((d) => ['d' + d, AMB.en ? d + 's' : 'Anos ' + (d >= 2000 ? d : String(d).slice(2))]))
      .concat([['procura-se', AMB.STATUS['procura-se'].t]]);
    if (AMB.favs.list().length) chips.push(['favoritos', T('★ Favoritos', '★ Favorites')]);
    return chips;
  };

  V.filtra = (lista, f) => {
    if (!f || f === 'tudo') return lista;
    if (f === 'no-acervo' || f === 'procura-se' || f === 'na-fila') return lista.filter((v) => v.status === f);
    if (f === 'nacionais') return lista.filter((v) => v.nacional);
    if (f === 'internacionais') return lista.filter((v) => !v.nacional && v.artistObj.country);
    if (f === 'favoritos') { const fav = AMB.favs.list(); return lista.filter((v) => fav.indexOf(v.id) >= 0); }
    if (/^d\d{4}$/.test(f)) return lista.filter((v) => v.decade === Number(f.slice(1)));
    return lista.filter((v) => v.kind === f);
  };

  const ORDEM_ST = { 'no-acervo': 0, 'na-fila': 1, 'procura-se': 2 };
  V.ordemHome = (lista) => lista.map((v, i) => ({ v, i })).sort((a, b) => (ORDEM_ST[a.v.status] - ORDEM_ST[b.v.status]) || (a.i - b.i)).map((x) => x.v);

  V.home = (st) => {
    const todos = V.ordemHome(AMB.publicVideos());
    const lista = V.filtra(todos, st.filtro).filter((v) => st.filtro === 'tudo' || st.filtro === 'no-acervo' || !v.test);
    const mostra = lista.slice(0, st.qtd);
    const reais = AMB.videos.filter((v) => !v.test);
    const n = { on: reais.filter((v) => v.status === 'no-acervo').length, fila: reais.filter((v) => v.status === 'na-fila').length, ps: reais.filter((v) => v.status === 'procura-se').length };
    const site = esc(AMB.cfg('SITE_NAME', 'Ambário'));
    const procurados = reais.filter((v) => v.status === 'procura-se').slice(0, 5);
    const acervos = Object.values(AMB.acervos);
    return '<div class="cols">' +
      '<div class="col-main">' +
        '<section class="box box-azul box-videos"><div class="box-h"><h2>' + T('Vídeos', 'Videos') + '</h2><span class="box-h-dir">' + pl(lista.length, T('registro', 'recording'), T('registros', 'recordings')) + '</span></div>' +
          '<div class="box-c"><div class="chips" role="toolbar" aria-label="' + T('Filtrar vídeos', 'Filter videos') + '">' +
            V.chipsHome().map(([k, t]) => '<button type="button" class="chip' + (st.filtro === k ? ' ativo' : '') + '" data-acao="filtro" data-f="' + esc(k) + '" aria-pressed="' + (st.filtro === k) + '">' + esc(t) + '</button>').join('') +
          '</div>' +
          (mostra.length ? '<div class="grade">' + mostra.map(V.card).join('') + '</div>' : V.vazio(T('Nenhum vídeo com esse filtro ainda.', 'No videos with this filter yet.'))) +
          (lista.length > mostra.length ? '<div class="mais"><button type="button" class="btn" data-acao="mais">' + T('Mostrar mais', 'Show more') + ' (' + (lista.length - mostra.length) + ')</button></div>' : '') +
        '</div></section>' +
      '</div>' +
      '<aside class="col-side">' +
        '<section class="box box-bv"><div class="box-c">' +
          '<h2 class="bv-tit">' + T('Gravado da TV, guardado pra sempre.', 'Taped off TV, kept forever.') + '</h2>' +
          T('<p>O ' + site + ' é um acervo público de videoclipes e apresentações musicais, brasileiros e gringos, com o som dos discos (LP, compacto, CD) sincronizado sempre que dá. Cada vídeo diz de onde veio e quem ajudou a preservar.</p>',
            '<p>' + site + ' is a public archive of music videos and TV music performances, from Brazil and the rest of the world, with the record audio (LP, single, CD) synced in whenever possible. Every video tells where it came from and who helped preserve it.</p>') +
          '<div class="bv-botoes"><a class="btn btn-y" href="#colaborar">' + T('Tenho fitas para o acervo', 'I have tapes for the archive') + '</a><a class="btn" href="#sobre">' + T('Como funciona', 'How it works') + '</a></div>' +
        '</div></section>' +
        V.box(T('Números do acervo', 'Archive in numbers'),
          '<ul class="numeros">' +
            '<li><b>' + n.on + '</b> ' + T('no acervo', 'in the archive') + '</li><li><b>' + n.fila + '</b> ' + T('na fila', 'queued') + '</li><li><b>' + n.ps + '</b> ' + T('procura-se', 'wanted') + '</li>' +
            '<li><b>' + AMB.artistList.length + '</b> ' + T('artistas', 'artists') + '</li><li><b>' + acervos.length + '</b> ' + (acervos.length === 1 ? T('acervo', 'collection') : T('acervos', 'collections')) + '</li>' +
          '</ul>' + (AMB.updated ? '<p class="mini">' + T('Dados atualizados em ', 'Last updated ') + esc(AMB.fmtDate(AMB.updated)) + '.</p>' : '')) +
        V.box(T('Acervos', 'Collections'), '<ul class="acervos-mini">' + acervos.map((c) =>
          '<li>' + V.avatar(c, 's') + '<span><a href="#c-' + esc(c.id) + '">' + esc(c.name) + '</a><small>' + esc((c.roles || []).map((r) => AMB.ROLES[r] || r).join(', ')) + '</small></span></li>').join('') + '</ul>' +
          '<p class="mini">' + T('Quem cede uma fita ou digitaliza um disco ganha crédito em cada vídeo. <a href="#colaborar">Quero colaborar</a>', 'Whoever lends a tape or digitizes a record gets credit on every video. <a href="#colaborar">I want to help</a>') + '</p>') +
        (procurados.length ? V.box(AMB.STATUS['procura-se'].t, '<ul class="lista-mini">' + procurados.map((v) =>
          '<li><a href="#v-' + esc(v.id) + '">' + esc(v.artistObj.name) + ' — ' + esc(v.title) + '</a> <small>' + esc(v.kindShort) + (v.year ? ', ' + esc(v.year) : '') + '</small></li>').join('') + '</ul>' +
          '<p class="mini"><a href="#procura-se">' + T('Ver todos os ' + n.ps + ' registros procurados', 'See all ' + n.ps + ' wanted recordings') + '</a></p>') : '') +
        V.box(T('Comentários recentes', 'Recent comments'), '<div id="recentes" class="recentes"><p class="mini">' + T('Carregando…', 'Loading…') + '</p></div>') +
      '</aside></div>';
  };

  /* ---------------- lista de vídeos ---------------- */
  V.videos = (st) => {
    let lista = AMB.publicVideos().filter((v) => !v.test || st.situacao === 'no-acervo' || st.situacao === 'tudo');
    if (st.situacao !== 'tudo') lista = lista.filter((v) => v.status === st.situacao);
    if (st.tipo !== 'tudo') lista = lista.filter((v) => v.kind === st.tipo);
    if (st.origem === 'br') lista = lista.filter((v) => v.nacional);
    if (st.origem === 'gringo') lista = lista.filter((v) => !v.nacional);
    if (st.decada !== 'tudo') lista = lista.filter((v) => String(v.decade) === st.decada);
    const ord = {
      recentes: (a, b) => String(b.added || '').localeCompare(String(a.added || '')) || b.n - a.n,
      antigos: (a, b) => a.sortKey.localeCompare(b.sortKey),
      novos: (a, b) => b.sortKey.localeCompare(a.sortKey),
      az: (a, b) => AMB.norm(a.artistObj.name + a.title).localeCompare(AMB.norm(b.artistObj.name + b.title)),
      vistos: (a, b) => ((AMB.api.cached(b.id) || {}).v || 0) - ((AMB.api.cached(a.id) || {}).v || 0),
      avaliados: (a, b) => ((AMB.api.cached(b.id) || {}).r || 0) - ((AMB.api.cached(a.id) || {}).r || 0)
    }[st.ordem];
    if (ord) lista = lista.slice().sort(ord);
    const decadas = Array.from(new Set(AMB.videos.map((v) => v.decade).filter(Boolean))).sort();
    const sel = (nome, rot, ops) => '<label>' + rot + ' <select data-acao="vfiltro" data-k="' + nome + '">' +
      ops.map(([k, t]) => '<option value="' + esc(k) + '"' + (String(st[nome]) === String(k) ? ' selected' : '') + '>' + esc(t) + '</option>').join('') + '</select></label>';
    return '<section class="box box-azul"><div class="box-h"><h2>' + T('Todos os vídeos', 'All videos') + '</h2><span class="box-h-dir">' + pl(lista.length, T('registro', 'recording'), T('registros', 'recordings')) + '</span></div><div class="box-c">' +
      '<div class="filtros">' +
        sel('ordem', T('Ordem', 'Sort'), [['recentes', T('Adicionados recentemente', 'Recently added')], ['antigos', T('Mais antigos primeiro', 'Oldest first')], ['novos', T('Mais novos primeiro', 'Newest first')], ['az', T('Artista, A–Z', 'Artist, A–Z')], ['vistos', T('Mais vistos', 'Most viewed')], ['avaliados', T('Mais bem avaliados', 'Top rated')]]) +
        sel('situacao', T('Situação', 'Status'), [['tudo', T('Todas', 'All')], ['no-acervo', AMB.STATUS['no-acervo'].t], ['na-fila', AMB.STATUS['na-fila'].t], ['procura-se', AMB.STATUS['procura-se'].t]]) +
        sel('tipo', T('Tipo', 'Type'), [['tudo', T('Todos', 'All')]].concat(Object.keys(AMB.KINDS).map((k) => [k, AMB.KINDS[k]]))) +
        sel('origem', T('Origem', 'Origin'), [['tudo', T('Todas', 'All')], ['br', T('Nacionais', 'Brazilian')], ['gringo', T('Internacionais', 'International')]]) +
        sel('decada', T('Década', 'Decade'), [['tudo', T('Todas', 'All')]].concat(decadas.map((d) => [String(d), AMB.en ? d + 's' : 'Anos ' + d]))) +
      '</div>' +
      (lista.length ? '<div class="linhas">' + lista.map(V.linha).join('') + '</div>' : V.vazio(T('Nenhum vídeo com esses filtros.', 'No videos match these filters.'))) +
    '</div></section>';
  };

  /* ---------------- página do vídeo ---------------- */
  V.watch = (v) => {
    const a = v.artistObj;
    const cr = AMB.mainCredit(v);
    const c = cr && cr.w && cr.w.acervo;
    const qtd = c ? c.todos.length || c.trabalhos.cadastro.length : 0;
    const url = (AMB.cfg('SITE_URL', '') || location.href.split('#')[0].replace(/\/$/, '')) + '/#v-' + v.id;
    const fav = AMB.favs.has(v.id);
    const rel = AMB.related(v, 12);
    const mais = a.videos.filter((x) => x !== v && !x.test);
    const lanc = AMB.songReleases(v);
    const song = v.songObj;
    const titulo = '<a href="#a-' + esc(a.id) + '">' + esc(a.name) + '</a> — ' + esc(v.title);

    const sobre = song ? (
      '<p class="mus-tit"><b>' + esc(song.t) + '</b>' + (song.w ? '<br><small>' + esc(song.w) + '</small>' : '') + '</p>' +
      (lanc.length ? '<p class="mini">' + T('Saiu em:', 'Released on:') + '</p><ul class="mus-discos">' + lanc.map((x) =>
        '<li><a href="#a-' + esc(a.id) + '" data-disco="' + esc(x.r.id) + '">' + esc(x.r.title) + '</a> <small>' + esc(AMB.RELTYPES[x.r.type] || x.r.type) +
          (x.r.year ? ', ' + esc(x.r.year) : '') + (x.r.label ? ', ' + esc(x.r.label) : '') + T(' · faixa ', ' · track ') + esc(x.t.n) + '</small>' +
          (x.mesma ? '' : ' <span class="tag-outra" title="' + T('O vídeo usa outra gravação desta música', 'The video uses a different recording of this song') + '">' + T('outra versão', 'different version') + '</span>') + '</li>').join('') + '</ul>' :
        '<p class="mini">' + T('Ainda não cadastramos em que disco esta música saiu.', 'We have not yet listed which record this song came out on.') + ' <a href="#" data-acao="corrigir" data-video="' + esc(v.id) + '">' + T('Sabe? Conte pra gente.', 'Do you know? Tell us.') + '</a></p>')
    ) : '<p class="mini">' + (v.kind === 'tv' || v.kind === 'entrevista' ? T('Registro sem uma música só.', 'Recording without a single song.') : T('Música ainda não identificada.', 'Song not identified yet.')) + ' <a href="#" data-acao="corrigir" data-video="' + esc(v.id) + '">' + T('Sugerir', 'Suggest') + '</a></p>';

    return '<div class="pg-watch">' +
      '<h1 class="w-tit">' + titulo + '</h1>' +
      '<div class="cols">' +
        '<div class="col-main">' +
          '<div id="player" class="w-player"></div>' +
          (v.hasFile ? '<div class="w-faixa">' +
            '<div class="w-rate"><span class="rot">' + T('Avaliar:', 'Rate:') + '</span> <span class="rate-in" role="radiogroup" aria-label="' + T('Sua avaliação', 'Your rating') + '" data-video="' + esc(v.id) + '">' +
              [1, 2, 3, 4, 5].map((i) => '<button type="button" data-acao="votar" data-n="' + i + '" aria-label="' + i + (i === 1 ? T(' estrela', ' star') : T(' estrelas', ' stars')) + '">★</button>').join('') + '</span>' +
              ' <span class="rate-txt" data-st-rate="' + esc(v.id) + '"></span></div>' +
            '<div class="w-views">' + T('Exibições:', 'Views:') + ' <b data-st-views="' + esc(v.id) + '">—</b></div>' +
          '</div>' : '') +
          '<div class="w-acoes" role="tablist">' +
            '<button type="button" class="w-acao" data-acao="painel" data-p="compartilhar"><i class="ico ico-comp"></i>' + T('Compartilhar', 'Share') + '</button>' +
            '<button type="button" class="w-acao' + (fav ? ' ativo' : '') + '" data-acao="favoritar" data-video="' + esc(v.id) + '"><i class="ico ico-fav"></i>' + (fav ? T('Favoritado', 'Favorited') : T('Favoritar', 'Favorite')) + '</button>' +
            '<button type="button" class="w-acao" data-acao="tenho" data-video="' + esc(v.id) + '"><i class="ico ico-fita"></i>' + T('Tenho essa gravação', 'I have this recording') + '</button>' +
            '<button type="button" class="w-acao" data-acao="corrigir" data-video="' + esc(v.id) + '"><i class="ico ico-flag"></i>' + T('Sugerir correção', 'Suggest a correction') + '</button>' +
          '</div>' +
          '<div class="w-painel" id="painel" hidden>' +
            '<div class="comp-link"><input type="text" readonly value="' + esc(url) + '" aria-label="' + T('Link do vídeo', 'Video link') + '"><button type="button" class="btn" data-acao="copiar" data-txt="' + esc(url) + '">' + T('Copiar link', 'Copy link') + '</button></div>' +
            '<div class="comp-redes">' +
              '<a href="https://wa.me/?text=' + encodeURIComponent(a.name + ' — ' + v.title + ' ' + url) + '" target="_blank" rel="noopener">WhatsApp</a>' +
              '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '" target="_blank" rel="noopener">Facebook</a>' +
              '<a href="https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(a.name + ' — ' + v.title) + '" target="_blank" rel="noopener">X (Twitter)</a>' +
              '<a href="https://bsky.app/intent/compose?text=' + encodeURIComponent(a.name + ' — ' + v.title + ' ' + url) + '" target="_blank" rel="noopener">Bluesky</a>' +
            '</div>' +
          '</div>' +
          (v.hasFile && v.audio.length ? '<div class="w-audio-info" id="audio-info"></div>' : '') +
          '<div class="abas abas-w" role="tablist">' +
            '<button type="button" class="aba ativo" data-acao="aba" data-aba="comentarios" role="tab" aria-selected="true">' + T('Comentários', 'Comments') + ' <span class="n-com" data-st-com="' + esc(v.id) + '"></span></button>' +
            '<button type="button" class="aba" data-acao="aba" data-aba="creditos" role="tab" aria-selected="false">' + T('Créditos e ficha técnica', 'Credits and details') + '</button>' +
            '<button type="button" class="aba" data-acao="aba" data-aba="fontes" role="tab" aria-selected="false">' + T('Fontes', 'Sources') + '</button>' +
          '</div>' +
          '<div class="aba-c" data-aba-c="comentarios">' + V.comentarios(v) + '</div>' +
          '<div class="aba-c" data-aba-c="creditos" hidden>' + V.creditos(v) + '</div>' +
          '<div class="aba-c" data-aba-c="fontes" hidden>' + V.fontesVideo(v) + '</div>' +
        '</div>' +
        '<aside class="col-side">' +
          '<section class="box w-de"><div class="box-c">' +
            (cr && cr.w ? '<div class="de-topo">' + V.avatar(c || { id: cr.w.name, name: cr.w.name }, 'm') +
              '<div class="de-txt"><span class="de-papel">' + esc(cr.papel) + ':</span> ' + V.quem(cr.w) +
                (c && c.since ? '<br><span class="mini">' + T('Colabora desde ', 'Contributing since ') + esc(AMB.fmtMonth(c.since)) + '</span>' : '') +
                (c ? '<br><span class="mini">' + T('Registros: ', 'Recordings: ') + qtd + '</span>' : '') + '</div>' +
              (c ? '<a class="btn btn-y btn-p" href="#c-' + esc(c.id) + '">' + T('Ver acervo', 'See collection') + '</a>' : '') + '</div>' : '') +
            '<div class="de-info"><span class="mini">' + (v.added ? T('Adicionado em ', 'Added ') + esc(AMB.fmtDate(v.added)) : '') + '</span> ' + V.selo(v.status) +
              (v.description ? '<p>' + V.tx(v, 'description') + '</p>' : '') +
              (v.note ? '<p class="nota-cur"><b>' + T('Nota do curador:', 'Curator’s note:') + '</b> “' + V.tx(v, 'note') + '”</p>' : '') +
              '<p class="mini de-tipo">' + esc(v.kindLabel) + (v.date ? ' · ' + esc(AMB.fmtDate(v.date)) : '') +
                (v.program || v.channel ? ' · ' + esc([v.program, v.channel].filter(Boolean).join(', ')) : '') + (v.director ? T(' · direção de ', ' · directed by ') + esc(v.director) : '') + '</p>' +
            '</div>' +
            '<div class="de-link"><label>' + T('Link', 'Link') + ' <input type="text" readonly value="' + esc(url) + '"></label></div>' +
          '</div></section>' +
          (v.test ? '' : V.box(T('Sobre a música', 'About the song'), sobre, 'w-musica')) +
          (mais.length ? V.box(T('Mais de ', 'More from ') + esc(a.name), '<ul class="rel">' + mais.slice(0, 8).map(V.relItem).join('') + '</ul>' +
            (mais.length > 8 ? '<p class="mini"><a href="#a-' + esc(a.id) + '">' + T('Ver todos os ', 'See all ') + mais.length + '</a></p>' : ''), 'w-mais') : '') +
          V.box(T('Vídeos relacionados', 'Related videos'), '<ul class="rel">' + rel.filter((x) => x.artistObj !== a).slice(0, 10).map(V.relItem).join('') + '</ul>', 'w-rel') +
        '</aside>' +
      '</div></div>';
  };

  V.relItem = (x) => '<li>' + V.thumb(x, 's') + '<div><a href="#v-' + esc(x.id) + '" class="rel-tit">' + esc(x.title) + '</a>' +
    '<span class="mini">' + esc(x.artistObj.name) + (x.year ? ' · ' + esc(x.year) : '') + '</span>' +
    (x.hasFile ? '<span class="mini">' + V.statsSlot(x, true) + '</span>' : '<span class="mini">' + V.selo(x.status) + '</span>') + '</div></li>';

  V.comentarios = (v) => {
    const nome = esc(AMB.store.get('amb.nome', ''));
    return '<div class="com">' +
      '<form class="com-form" data-video="' + esc(v.id) + '" novalidate>' +
        '<label class="com-l">' + T('Seu nome ou apelido', 'Your name or nickname') + ' <input type="text" name="nome" maxlength="40" value="' + nome + '" autocomplete="nickname" required></label>' +
        '<label class="com-l">' + T('Comentário', 'Comment') + ' <textarea name="texto" maxlength="500" rows="3" required placeholder="' + T('O que essa gravação lembra pra você? Sabe algo sobre ela?', 'What does this recording remind you of? Do you know anything about it?') + '"></textarea></label>' +
        '<label class="hp" aria-hidden="true">' + T('Não preencha', 'Leave blank') + ' <input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        '<div class="com-pe"><span class="mini com-resta">' + T('Restam 500 caracteres', '500 characters left') + '</span>' +
          '<button type="submit" class="btn btn-b">' + T('Postar comentário', 'Post comment') + '</button></div>' +
        '<p class="mini com-regras">' + T('Sem links. Comentários ofensivos são apagados.', 'No links. Offensive comments are deleted.') + (AMB.api.live() ? '' : T(' <b>Modo demonstração:</b> o comentário fica só neste navegador.', ' <b>Demo mode:</b> the comment stays in this browser only.')) + '</p>' +
        '<p class="com-msg" role="status"></p>' +
      '</form>' +
      '<div class="com-lista" data-video="' + esc(v.id) + '"><p class="mini">' + T('Carregando comentários…', 'Loading comments…') + '</p></div>' +
    '</div>';
  };

  V.comentario = (c) => '<div class="com-item"><div class="com-cab"><b>' + esc(c.nome) + '</b> <span class="mini">(' + esc(AMB.ago(c.criado_em) || '') + ')</span>' +
    ' <button type="button" class="link-btn" data-acao="responder" data-nome="' + esc(c.nome) + '">' + T('Responder', 'Reply') + '</button></div>' +
    '<p>' + esc(c.texto) + '</p></div>';

  V.creditos = (v) => {
    const cr = v.credits || {};
    const s = v.source || {};
    const linhas = [];
    const add = (rot, val) => { if (val) linhas.push('<dt>' + esc(rot) + '</dt><dd>' + val + '</dd>'); };
    add(T('Tipo', 'Type'), esc(v.kindLabel) + (v.director ? T(', direção de ', ', directed by ') + esc(v.director) : ''));
    add(T('Data', 'Date'), v.date ? esc(AMB.fmtDate(v.date)) : '');
    add(T('Exibido em', 'Aired on'), esc([v.channel, v.program, s.aired ? AMB.fmtDate(s.aired) : ''].filter(Boolean).join(' — ')));
    add(T('Gravado de', 'Recorded from'), esc(s.from || ''));
    add(T('Mídia', 'Media'), esc([s.medium, s.standard, s.speed ? T('velocidade ', 'speed ') + s.speed : '', s.generation].filter(Boolean).join(' · ')));
    if (cr.tape) add(T('Fita de', 'Tape from'), V.quem(AMB.who(cr.tape)));
    if (cr.capture) add(T('Captura do vídeo', 'Video capture'), V.quem(AMB.who(cr.capture)) + (s.deck || s.capture ? ' <span class="mini">(' + esc([s.deck, s.capture].filter(Boolean).join(' → ')) + ')</span>' : ''));
    (v.audio || []).forEach((t, i) => {
      const rel = t.release ? v.artistObj.releases.find((r) => r.id === t.release) : null;
      add(i === 0 ? T('Áudio principal', 'Main audio') : T('Outro áudio', 'Other audio'), esc(t.label || t.short) + (rel ? ' — <a href="#a-' + esc(v.artistObj.id) + '" data-disco="' + esc(rel.id) + '">' + esc(rel.title) + '</a> (' + esc(AMB.RELTYPES[rel.type] || rel.type) + ', ' + esc(rel.year || '') + ')' : '') +
        (t.by ? T(', digitalizado por ', ', digitized by ') + V.quem(AMB.who(t.by)) : '') + (t.note ? ' <span class="mini">' + esc(t.note) + '</span>' : ''));
    });
    if (cr.sync) add(T('Sincronização', 'Syncing'), V.quem(AMB.who(cr.sync)) + ' <span class="mini">(EternalDub)</span>');
    if (cr.restore) add(T('Restauração', 'Restoration'), V.quem(AMB.who(cr.restore)));
    (cr.extra || []).forEach((x) => add(x.role || T('Crédito', 'Credit'), V.quem(AMB.who(x.who))));
    if (v.added_by) add(T('Cadastro', 'Added by'), V.quem(AMB.who(v.added_by)) + (v.added ? T(', em ', ', ') + esc(AMB.fmtDate(v.added)) : ''));
    if (v.hasFile) {
      add(T('Duração', 'Duration'), v.duration ? AMB.fmtDur(v.duration) : '');
      add(T('Arquivo', 'File'), (v.file.ia && AMB.cfg('MOSTRAR_LINK_IA', true) ? T('preservado no ', 'preserved at ') + '<a href="https://archive.org/details/' + encodeURIComponent(v.file.ia) + '" target="_blank" rel="noopener">Internet Archive (' + esc(v.file.ia) + ')</a>' : T('hospedado pelo acervo', 'hosted by the archive')) +
        ((v.file.mirrors || []).length ? ' · ' + pl(v.file.mirrors.length, T('espelho', 'mirror'), T('espelhos', 'mirrors')) : ''));
    }
    add(T('Observações', 'Notes'), esc(s.notes || ''));
    add(T('Situação', 'Status'), V.selo(v.status) + ' <span class="mini">' + esc((AMB.STATUS[v.status] || {}).d || '') + '</span>');
    return '<dl class="ficha">' + linhas.join('') + '</dl>' +
      '<p class="mini">' + T('Faltou um crédito ou tem algo errado?', 'Missing a credit or something wrong?') + ' <a href="#" data-acao="corrigir" data-video="' + esc(v.id) + '">' + T('Sugira uma correção', 'Suggest a correction') + '</a>' + T(': a moderação confere antes de publicar.', ': moderators check it before publishing.') + '</p>';
  };

  V.fontesVideo = (v) => {
    const fs = (v.src || []).map(AMB.src).filter(Boolean);
    const refs = v.refs || [];
    const item = (s) => '<li>' + (s.u ? '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a>' : esc(s.t)) + '</li>';
    const disco = [];
    AMB.songReleases(v).forEach((x) => (x.r.src || []).forEach((id) => { if (disco.indexOf(id) < 0) disco.push(id); }));
    return (fs.length ? '<h4>' + T('Sobre este registro', 'About this recording') + '</h4><ul class="fontes-l">' + fs.map(item).join('') + '</ul>' : '') +
      (disco.length ? '<h4>' + T('Sobre a música e os discos', 'About the song and the records') + '</h4><ul class="fontes-l">' + disco.map(AMB.src).filter(Boolean).map(item).join('') + '</ul>' : '') +
      (refs.length ? '<h4>' + T('Referências', 'References') + '</h4><ul class="fontes-l">' + refs.map(item).join('') + '</ul>' : '') +
      (!fs.length && !refs.length && !disco.length ? V.vazio(T('Este registro ainda não tem fontes cadastradas.', 'This recording has no sources listed yet.')) : '') +
      '<p class="mini">' + T('As informações são reescritas com as nossas palavras, sempre com link para a fonte.', 'Information is written in our own words, always linking to the source.') + '</p>';
  };

  /* ---------------- artistas ---------------- */
  V.artistas = (st) => {
    let lista = AMB.artistList;
    if (st.origem === 'br') lista = lista.filter((a) => a.nacional);
    if (st.origem === 'gringo') lista = lista.filter((a) => !a.nacional);
    const chips = [['tudo', T('Todos', 'All')], ['br', T('Nacionais', 'Brazilian')], ['gringo', T('Internacionais', 'International')]];
    return '<section class="box box-azul"><div class="box-h"><h2>' + T('Artistas', 'Artists') + '</h2><span class="box-h-dir">' + pl(lista.length, T('artista', 'artist'), T('artistas', 'artists')) + '</span></div><div class="box-c">' +
      '<div class="chips">' + chips.map(([k, t]) => '<button type="button" class="chip' + (st.origem === k ? ' ativo' : '') + '" data-acao="art-origem" data-f="' + k + '" aria-pressed="' + (st.origem === k) + '">' + t + '</button>').join('') + '</div>' +
      '<div class="grade-art">' + lista.map((a) => {
        const c = AMB.coverage(a);
        return '<a class="art-card" href="#a-' + esc(a.id) + '">' + V.discoIcone(a, 'm') +
          '<span class="art-nome">' + esc(a.name) + '</span>' +
          '<span class="mini">' + esc([AMB.country(a.country), a.years].filter(Boolean).join(' · ')) + '</span>' +
          '<span class="mini">' + pl(c.videos, T('registro', 'recording'), T('registros', 'recordings')) + '</span></a>';
      }).join('') + '</div></div></section>';
  };

  V.artista = (a, aba) => {
    const cob = AMB.coverage(a);
    const temDisco = a.videos.length > 0;
    aba = aba || (temDisco ? 'discografia' : 'videos');
    const abas = [['discografia', T('Videografia', 'Videography')], ['videos', T('Vídeos', 'Videos') + ' (' + a.videos.length + ')'], ['sobre', T('Sobre', 'About')]];
    const info = [];
    if (a.origin) info.push([T('Origem', 'Origin'), esc(a.origin)]);
    if (a.country) info.push([T('País', 'Country'), esc(AMB.country(a.country))]);
    if (a.years) info.push([T('Em atividade', 'Years active'), esc(a.years)]);
    if (a.alt && a.alt.length) info.push([T('Também conhecido como', 'Also known as'), esc(a.alt.join(', '))]);
    let corpo = '';
    if (aba === 'discografia') corpo = V.videografia(a);
    else if (aba === 'videos') corpo = a.videos.length ? '<div class="grade">' + a.videos.map(V.card).join('') + '</div>' : V.vazio(T('Nenhum vídeo deste artista ainda.', 'No videos by this artist yet.'));
    else corpo = V.sobreArtista(a);
    return '<div class="pg-artista">' +
      '<div class="art-topo">' + V.discoIcone(a, 'g') +
        '<div class="art-topo-txt"><h1>' + esc(a.name) + '</h1>' +
          (info.length ? '<dl class="art-info">' + info.map(([k, x]) => '<dt>' + k + '</dt><dd>' + x + '</dd>').join('') + '</dl>' : '') +
        '</div>' +
        '<div class="art-nums">' +
          '<span><b>' + cob.videos + '</b> ' + (cob.videos === 1 ? T('registro em vídeo', 'video recording') : T('registros em vídeo', 'video recordings')) + '</span>' +
          '<span><b>' + (cob.cont['no-acervo'] || 0) + '</b> ' + T('no acervo', 'in the archive') + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="abas" role="tablist">' + abas.map(([k, t]) => '<a class="aba' + (aba === k ? ' ativo' : '') + '" role="tab" aria-selected="' + (aba === k) + '" href="#a-' + esc(a.id) + (k === (temDisco ? 'discografia' : 'videos') ? '' : '--' + k) + '">' + esc(t) + '</a>').join('') + '</div>' +
      '<div class="aba-art">' + corpo + '</div>' +
    '</div>';
  };

  V.vchip = (x) => {
    const v = x.v;
    const ico = v.hasFile ? '▶' : v.status === 'procura-se' ? '?' : '…';
    return '<a class="vchip vchip-' + esc(v.status) + (x.rel === 'outra' ? ' vchip-outra' : '') + '" href="#v-' + esc(v.id) + '" title="' +
      esc(v.kindLabel + (v.year ? ', ' + v.year : '') + ' — ' + (AMB.STATUS[v.status] || {}).t + (x.rel === 'outra' ? T(' (outra versão da música)', ' (different version of the song)') : '')) + '">' +
      '<i>' + ico + '</i>' + esc(v.kindShort) + (v.year ? ' ' + esc(v.year) : '') + (x.rel === 'outra' ? '<small>' + T('outra versão', 'other version') + '</small>' : '') + '</a>';
  };

  // Videografia: uma linha por música com vídeo — ano original da música, o disco de onde veio o áudio e os registros.
  V.videografia = (a) => {
    if (!a.videos.length) return V.vazio(T('Nenhum vídeo deste artista ainda.', 'No videos by this artist yet.'));
    const rels = {};
    a.releases.forEach((r) => { rels[r.id] = r; });
    const grupos = {};
    const ordem = [];
    a.videos.forEach((v) => {
      const k = v.song ? 's:' + v.song : 'v:' + v.id;
      if (!grupos[k]) { grupos[k] = { song: v.song ? a.songs[v.song] : null, videos: [] }; ordem.push(k); }
      grupos[k].videos.push(v);
    });
    const linhas = ordem.map((k) => {
      const g = grupos[k];
      const vs = g.videos.slice().sort((x, y) => x.sortKey.localeCompare(y.sortKey));
      // disco do áudio: o que o vídeo diz que usou; senão, o primeiro disco em que a música saiu
      let disco = null, faixa = null;
      vs.some((v) => { const id = ((v.audio || [])[0] || {}).release; if (id && rels[id]) { disco = rels[id]; return true; } return false; });
      const aps = (g.song && g.song.appears) || [];
      if (disco) { const ap = aps.find((x) => x.release === disco); faixa = ap ? ap.track : null; }
      // ano original: o que foi marcado na faixa; senão o mais antigo entre os discos e os vídeos da música
      const anos = (faixa && faixa.year ? [faixa.year] : aps.map((x) => x.track.year || x.release.year).concat(vs.map((v) => v.year)))
        .map((x) => String(x || '').slice(0, 4)).filter((x) => /^\d{4}$/.test(x)).sort();
      const ano = anos[0] || '';
      const titulo = g.song ? g.song.t : vs[0].title;
      const dg = disco ? (disco.src || []).map(AMB.src).filter(Boolean).find((s) => /discogs\.com/.test(s.u || '')) : null;
      const discoTxt = disco ? '<span class="vg-disco">' + esc(AMB.RELTYPES[disco.type] || disco.type) + ' <b>' + esc(disco.title) + '</b>' +
        esc([disco.label, disco.year].filter(Boolean).length ? ' (' + [disco.label, disco.year].filter(Boolean).join(', ') + ')' : '') +
        (faixa ? ' · ' + T('faixa ', 'track ') + esc(faixa.n) : '') +
        (dg ? ' · <a href="' + esc(dg.u) + '" target="_blank" rel="noopener">Discogs ↗</a>' : '') + '</span>' : '<span class="f-sem" title="' + T('Ainda não informado', 'Not set yet') + '">—</span>';
      return { ano, html: '<tr>' +
        '<td class="vg-ano">' + esc(ano) + '</td>' +
        '<td class="vg-mus"><b>' + esc(titulo) + '</b>' + (g.song && g.song.w ? '<span class="f-w">' + esc(g.song.w) + '</span>' : '') + '</td>' +
        '<td class="vg-aud">' + discoTxt + '</td>' +
        '<td class="f-v">' + vs.map((v) => V.vchip({ v, rel: 'mesma' })).join('') + '</td></tr>' };
    }).sort((x, y) => String(x.ano || '9999').localeCompare(String(y.ano || '9999')));
    return '<table class="faixas videografia"><thead><tr><th scope="col">' + T('Ano', 'Year') + '</th><th scope="col">' + T('Música', 'Song') + '</th>' +
        '<th scope="col">' + T('Áudio de', 'Audio from') + '</th><th scope="col">' + T('Registros em vídeo', 'Video recordings') + '</th></tr></thead><tbody>' +
        linhas.map((l) => l.html).join('') + '</tbody></table>' +
      '<p class="mini">' + T('Ano: lançamento original da música. “Áudio de”: o disco usado como fonte do som do vídeo. Faltou algo?', 'Year: original release of the song. “Audio from”: the record used as the video’s audio source. Something missing?') +
        ' <a href="#" data-acao="corrigir" data-artista="' + esc(a.id) + '">' + T('Sugira', 'Suggest it') + '</a>.</p>';
  };

  V.sobreArtista = (a) => {
    return (a.intro ? '<p class="art-intro">' + V.tx(a, 'intro') + '</p>' : V.vazio(T('Ainda não escrevemos sobre ', 'We have not written about ') + esc(a.name) + T('.', ' yet.'))) +
      (a.members && a.members.length ? '<h3 class="sub">' + T('Formação', 'Members') + '</h3><table class="membros"><tbody>' + a.members.map((m) =>
        '<tr><td><b>' + esc(m.name) + '</b></td><td>' + esc(m.role || '') + '</td><td class="mini">' + esc(m.years || '') + '</td></tr>').join('') + '</tbody></table>' : '') +
      V.fontes(a.src);
  };

  /* ---------------- acervos (colaboradores) ---------------- */
  V.acervos = () => {
    const lista = Object.values(AMB.acervos);
    return '<section class="box box-azul"><div class="box-h"><h2>' + T('Acervos', 'Collections') + '</h2><span class="box-h-dir">' + T('quem guarda, digitaliza e sincroniza', 'who keeps, digitizes and syncs') + '</span></div><div class="box-c">' +
      '<p class="intro">' + T('Cada fita cedida, cada disco digitalizado e cada sincronia feita aparece com o nome de quem fez, em todos os vídeos em que o trabalho foi usado. ' +
      'Tem fitas ou discos guardados? <a href="#colaborar">Veja como colaborar</a>.',
      'Every tape lent, every record digitized and every sync done shows the name of who did it, on every video that uses the work. ' +
      'Have tapes or records stored away? <a href="#colaborar">See how to contribute</a>.') + '</p>' +
      '<div class="acervos">' + lista.map((c) => {
        const t = c.trabalhos || {};
        const nums = [['fitas', T('fitas cedidas', 'tapes lent')], ['captura', T('capturas', 'captures')], ['audio', T('áudios de disco', 'record audio tracks')], ['sincronizacao', T('sincronias', 'syncs')]]
          .filter(([k]) => (t[k] || []).length).map(([k, r]) => '<b>' + t[k].length + '</b> ' + r);
        return '<a class="acervo-card" href="#c-' + esc(c.id) + '">' + V.avatar(c, 'g') +
          '<span class="acervo-nome">' + esc(c.name) + '</span>' +
          '<span class="mini">' + esc((c.roles || []).map((r) => AMB.ROLES[r] || r).join(' · ')) + '</span>' +
          (c.city ? '<span class="mini">' + esc(c.city) + '</span>' : '') +
          '<span class="mini">' + (nums.length ? nums.join(' · ') : (t.cadastro || []).length + T(' registros cadastrados', ' recordings added')) + '</span></a>';
      }).join('') + '</div></div></section>';
  };

  V.acervo = (c) => {
    const t = c.trabalhos || {};
    const secao = (k, tit) => (t[k] && t[k].length ? '<h3 class="sub">' + tit + ' (' + t[k].length + ')</h3><div class="grade">' + t[k].map(V.card).join('') + '</div>' : '');
    const corpo = secao('fitas', T('Fitas cedidas', 'Tapes lent')) + secao('captura', T('Vídeos digitalizados', 'Videos digitized')) + secao('audio', T('Áudios de disco digitalizados', 'Record audio digitized')) +
      secao('sincronizacao', T('Sincronias', 'Syncs')) + secao('restauracao', T('Restaurações', 'Restorations'));
    const cad = t.cadastro || [];
    return '<div class="pg-acervo"><div class="art-topo">' + V.avatar(c, 'g') +
      '<div class="art-topo-txt"><h1>' + esc(c.name) + '</h1>' +
        '<dl class="art-info">' + ((c.roles || []).length ? '<dt>' + T('Colabora com', 'Contributes') + '</dt><dd>' + esc(c.roles.map((r) => AMB.ROLES[r] || r).join(', ')) + '</dd>' : '') +
          (c.since ? '<dt>' + T('Desde', 'Since') + '</dt><dd>' + esc(AMB.fmtMonth(c.since)) + '</dd>' : '') + (c.city ? '<dt>' + T('Cidade', 'City') + '</dt><dd>' + esc(c.city) + '</dd>' : '') + '</dl>' +
        (c.bio ? '<p>' + V.tx(c, 'bio') + '</p>' : '') +
        ((c.links || []).length ? '<p class="links">' + c.links.map((l) => '<a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.t) + ' ↗</a>').join(' · ') + '</p>' : '') +
      '</div></div>' +
      (corpo || V.vazio(T('Os trabalhos de ' + esc(c.name) + ' aparecem aqui assim que os vídeos com o crédito dele entrarem no acervo.', esc(c.name) + '’s work shows up here as soon as videos credited to them enter the archive.'))) +
      (cad.length ? '<h3 class="sub">' + T('Registros cadastrados', 'Recordings added') + ' (' + cad.length + ')</h3><div class="linhas">' + cad.slice(0, 40).map(V.linha).join('') + '</div>' : '') +
    '</div>';
  };

  /* ---------------- procura-se ---------------- */
  V.procura = () => {
    const lista = AMB.videos.filter((v) => !v.test && v.status !== 'no-acervo');
    const ps = lista.filter((v) => v.status === 'procura-se');
    const fila = lista.filter((v) => v.status === 'na-fila');
    const grupo = (vs) => {
      const por = {};
      vs.forEach((v) => { (por[v.artistObj.id] = por[v.artistObj.id] || []).push(v); });
      return Object.keys(por).map((id) => {
        const a = AMB.artists[id];
        return '<div class="ps-art"><h4><a href="#a-' + esc(id) + '">' + esc(a.name) + '</a></h4><ul>' + por[id].map((v) =>
          '<li><a href="#v-' + esc(v.id) + '">' + esc(v.title) + '</a> <span class="mini">' + esc(v.kindLabel) + (v.date ? ', ' + esc(AMB.fmtDate(v.date)) : '') +
            (v.program || v.channel ? ' — ' + esc([v.program, v.channel].filter(Boolean).join(', ')) : '') + '</span>' +
            ' <button type="button" class="btn btn-p" data-acao="tenho" data-video="' + esc(v.id) + '">' + T('Tenho essa gravação', 'I have this recording') + '</button></li>').join('') + '</ul></div>';
      }).join('');
    };
    return '<section class="box box-azul"><div class="box-h"><h2>' + AMB.STATUS['procura-se'].t + '</h2><span class="box-h-dir">' + pl(ps.length, T('registro', 'recording'), T('registros', 'recordings')) + '</span></div><div class="box-c">' +
      '<p class="intro">' + T('Registros que sabemos que existem, mas que ainda não têm cópia no acervo. Você gravou da TV, comprou a fita ou conhece alguém que tem? ' +
      'Fale com a gente: a fita volta para você, digitalizada, e seu nome fica nos créditos. Cópias de melhor geração também são bem-vindas, mesmo de registros que já circulam na internet.',
      'Recordings we know exist but that have no copy in the archive yet. Did you tape it off TV, buy the tape, or know someone who has it? ' +
      'Get in touch: your tape comes back to you, digitized, and your name goes in the credits. Better-generation copies are welcome too, even of recordings already circulating online.') + '</p>' +
      (ps.length ? grupo(ps) : V.vazio(T('Nada sendo procurado agora.', 'Nothing wanted right now.'))) + '</div></section>' +
      (fila.length ? '<section class="box"><div class="box-h"><h3>' + T('Na fila para digitalizar', 'Queued for digitizing') + '</h3><span class="box-h-dir">' + fila.length + '</span></div><div class="box-c">' +
        '<p class="mini">' + T('Registros que o curador já separou. Se você tem uma cópia melhor de algum, conta também.', 'Recordings the curator has already set aside. If you have a better copy of any of them, tell us too.') + '</p>' + grupo(fila) + '</div></section>' : '');
  };

  /* ---------------- busca ---------------- */
  V.busca = (q) => {
    const r = AMB.search(q);
    const total = r.videos.length + r.artists.length + r.acervos.length;
    return '<section class="box box-azul"><div class="box-h"><h2>' + T('Busca', 'Search') + ': “' + esc(q) + '”</h2><span class="box-h-dir">' + pl(total, T('resultado', 'result'), T('resultados', 'results')) + '</span></div><div class="box-c">' +
      (r.artists.length ? '<h3 class="sub">' + T('Artistas', 'Artists') + '</h3><div class="grade-art">' + r.artists.map((a) => '<a class="art-card" href="#a-' + esc(a.id) + '">' + V.discoIcone(a, 'm') + '<span class="art-nome">' + esc(a.name) + '</span><span class="mini">' + pl(a.videos.length, T('registro', 'recording'), T('registros', 'recordings')) + '</span></a>').join('') + '</div>' : '') +
      (r.acervos.length ? '<h3 class="sub">' + T('Acervos', 'Collections') + '</h3><ul class="acervos-mini">' + r.acervos.map((c) => '<li>' + V.avatar(c, 's') + '<a href="#c-' + esc(c.id) + '">' + esc(c.name) + '</a></li>').join('') + '</ul>' : '') +
      (r.videos.length ? '<h3 class="sub">' + T('Vídeos', 'Videos') + '</h3><div class="linhas">' + r.videos.map(V.linha).join('') + '</div>' : '') +
      (!total ? V.vazio(T('Nada encontrado. Tente outro nome, um ano (1985) ou um programa (Fantástico).', 'Nothing found. Try another name, a year (1985) or a TV show.')) : '') +
    '</div></section>';
  };

  /* ---------------- sobre / colaborar ---------------- */
  V.sobre = (foco) => {
    const site = esc(AMB.cfg('SITE_NAME', 'Ambário'));
    const contato = AMB.cfg('CONTATO', '');
    const c = (id, tit, corpo) => '<section class="box sobre-sec" id="sec-' + id + '"><div class="box-h"><h3>' + tit + '</h3></div><div class="box-c">' + corpo + '</div></section>';
    return '<div class="pg-sobre' + (foco ? ' foco-' + esc(foco) : '') + '">' +
      '<h1 class="w-tit">' + T('Sobre o ', 'About ') + site + '</h1>' +
      c('o-que-e', T('O que é', 'What it is'), T(
        '<p>Um acervo público de videoclipes e apresentações musicais: clipes que passavam na TV, apresentações em programas de auditório, shows e cenas de filmes. Brasileiros e gringos.</p>' +
        '<p>A prioridade é a <b>preservação</b>: cada vídeo é guardado com a melhor qualidade possível, com a história de onde veio e com o crédito de quem ajudou a preservá-lo. Sempre que dá, buscamos a cópia de melhor geração, falando direto com quem gravou ou fez o upload original.</p>',
        '<p>A public archive of music videos and music performances: videos that aired on TV, performances on variety shows, concerts and film scenes. From Brazil and from the rest of the world.</p>' +
        '<p>The priority is <b>preservation</b>: every video is kept in the best quality available, with the story of where it came from and credit to whoever helped preserve it. Whenever possible we look for the best-generation copy, talking directly to whoever recorded or originally uploaded it.</p>')) +
      c('dois-audios', T('Dois áudios em cada vídeo', 'Two audio tracks on each video'), T(
        '<p>Sempre que dá, o vídeo traz <b>dois áudios sincronizados</b>: o principal, tirado de uma fonte boa (LP, compacto, CD), e o <b>som original da gravação</b>, do jeito que foi ao ar, com vinheta, locutor e chiado. Troque no seletor de áudio do player, a qualquer momento.</p>' +
        '<p>A sincronia é feita com o <a href="https://github.com/Moguel0818/EternalDub" target="_blank" rel="noopener">EternalDub</a>, ferramenta de código aberto que mede o atraso e a diferença de velocidade da fita e acerta o áudio do disco no tempo do vídeo.</p>',
        '<p>Whenever possible, a video comes with <b>two synced audio tracks</b>: the main one, taken from a good source (LP, single, CD), and the <b>original broadcast audio</b>, just as it aired, with bumpers, announcer and hiss. Switch between them with the player’s audio selector at any time.</p>' +
        '<p>Syncing is done with <a href="https://github.com/Moguel0818/EternalDub" target="_blank" rel="noopener">EternalDub</a>, an open-source tool that measures the tape’s delay and speed difference and lines the record audio up with the video.</p>')) +
      c('videografia', T('Discografia × videografia', 'Discography × videography'), T(
        '<p>Na página de cada artista, a discografia aparece faixa por faixa, com os registros em vídeo de cada música: o que já está no acervo, o que está na fila e o que ainda procuramos. Assim fica fácil ver, por exemplo, quais músicas de um LP ganharam clipe ou foram tocadas na TV.</p>',
        '<p>On each artist’s page, the discography is shown track by track, with the video recordings of each song: what is already in the archive, what is queued and what we are still looking for. That makes it easy to see, for example, which songs from an LP got a music video or were performed on TV.</p>')) +
      c('colaborar', T('Como colaborar', 'How to contribute'),
        T('<p>Tem fitas VHS, Betamax, U-matic, compactos, LPs ou arquivos de boa qualidade guardados? Seu acervo pode entrar aqui:</p>',
          '<p>Do you have VHS, Betamax or U-matic tapes, singles, LPs or good-quality files stored away? Your collection can be part of this:</p>') +
        '<ol><li>' + T('Conte o que você tem pelo formulário abaixo', 'Tell us what you have using the form below') + (contato ? T(' ou pelo contato ', ' or at ') + '<b>' + esc(contato) + '</b>' : '') + '.</li>' +
          '<li>' + T('Combinamos como digitalizar: você mesmo, se tiver como, ou pelo estúdio do acervo. A fita é sua e volta para você.', 'We agree on how to digitize it: by you, if you can, or at the archive’s studio. The tape is yours and goes back to you.') + '</li>' +
          '<li>' + T('O vídeo entra no acervo com o seu nome nos créditos e uma página só do seu acervo, com tudo que você ajudou a preservar.', 'The video enters the archive with your name in the credits and a page of your own, listing everything you helped preserve.') + '</li></ol>' +
        '<form class="form-contato" data-tipo="contato" novalidate>' +
          '<label>' + T('Seu nome ou apelido', 'Your name or nickname') + ' <input type="text" name="nome" maxlength="60" required></label>' +
          '<label>' + T('Como falar com você (e-mail, Instagram ou WhatsApp)', 'How to reach you (e-mail, Instagram or WhatsApp)') + ' <small>' + T('Só a moderação vê.', 'Only moderators see this.') + '</small><input type="text" name="contato" maxlength="120" required></label>' +
          '<label>' + T('O que você tem?', 'What do you have?') + ' <textarea name="mensagem" rows="4" maxlength="2000" required placeholder="' + T('Ex.: umas 20 fitas VHS gravadas da MTV e do Fantástico entre 1988 e 1995, e alguns LPs nacionais.', 'E.g.: about 20 VHS tapes recorded off MTV between 1988 and 1995, and a few LPs.') + '"></textarea></label>' +
          '<label class="hp" aria-hidden="true">' + T('Não preencha', 'Leave blank') + ' <input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
          '<button type="submit" class="btn btn-y">' + T('Enviar', 'Send') + '</button><p class="form-msg" role="status"></p>' +
        '</form>') +
      c('situacoes', T('No acervo, na fila, procura-se', 'In the archive, queued, wanted'),
        '<ul class="sits"><li>' + V.selo('no-acervo') + ' ' + T('o vídeo está no ar e toca aqui.', 'the video is online and plays here.') + '</li><li>' + V.selo('na-fila') + ' ' + esc(AMB.STATUS['na-fila'].d) + '</li><li>' + V.selo('procura-se') + ' ' + esc(AMB.STATUS['procura-se'].d) + '</li></ul>') +
      c('politica', T('Política do acervo', 'Archive policy'),
        T('<p>O ' + site + ' não tem fins lucrativos e existe para guardar a memória da música na TV. As informações são reescritas com nossas palavras e citam a fonte. Os vídeos ficam no <a href="https://archive.org" target="_blank" rel="noopener">Internet Archive</a>, que preserva arquivos de forma permanente.</p>',
          '<p>' + site + ' is non-profit and exists to keep the memory of music on TV. Information is written in our own words and cites its source. The videos are stored at the <a href="https://archive.org" target="_blank" rel="noopener">Internet Archive</a>, which preserves files permanently.</p>') +
        '<p><b>' + T('Se você é artista ou detém os direitos de algum vídeo e quer que ele saia do ar, é só pedir', 'If you are an artist or hold the rights to a video and want it taken down, just ask') + '</b>' +
          (contato ? T(' em ', ' at ') + '<b>' + esc(contato) + '</b>' : T(' pelo formulário de contato', ' through the contact form')) + T(': ele sai, sem discussão.', ': it comes down, no questions asked.') + '</p>' +
        '<p>' + T('Comentários com links, ofensas ou spam são apagados. Os contatos deixados nos formulários só são vistos pela moderação.', 'Comments with links, insults or spam are deleted. Contact details left in the forms are only seen by moderators.') + '</p>') +
      c('creditos-site', T('Créditos do site', 'Site credits'),
        T('<p>Player de TV antiga (CRT): <a href="https://moguell.neocities.org/projects" target="_blank" rel="noopener">Eternal Medias</a>, do moguell. Fonte dos números do player: VT323 (licença SIL OFL). Dados de discografia com fontes citadas em cada disco.</p>' +
          '<p>Visual inspirado nos sites de vídeo da segunda metade dos anos 2000.</p>',
          '<p>Old TV (CRT) player: <a href="https://moguell.neocities.org/projects" target="_blank" rel="noopener">Eternal Medias</a>, by moguell. Player digits font: VT323 (SIL OFL license). Discography data with sources cited on each record.</p>' +
          '<p>Look inspired by the video sites of the late 2000s.</p>')) +
    '</div>';
  };

  V.naoAchei = (o) => '<section class="box"><div class="box-c"><h1 class="w-tit">' + T('Sem sinal', 'No signal') + '</h1><p>' + T('Não encontramos ', 'We could not find ') + esc(o || T('esta página', 'this page')) + '. <a href="#inicio">' + T('Voltar ao início', 'Back to home') + '</a></p></div></section>';
})();
