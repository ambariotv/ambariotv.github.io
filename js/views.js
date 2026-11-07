/*
 * Ambário — telas (HTML). Cada função devolve o HTML de uma página; o app.js liga os eventos.
 */
(function () {
  'use strict';
  const AMB = window.AMB;
  const esc = AMB.esc;
  const V = (AMB.V = {});

  /* ---------------- peças pequenas ---------------- */
  const hue = (s) => { let h = 0; String(s || '').split('').forEach((c) => { h = (h * 31 + c.charCodeAt(0)) % 360; }); return h; };
  V.hue = hue;
  const pl = (n, um, varios) => AMB.fmtNum(n) + ' ' + (n === 1 ? um : varios);
  V.pl = pl;

  V.selo = (st) => '<span class="selo selo-' + esc(st) + '" title="' + esc((AMB.STATUS[st] || {}).d || '') + '">' + esc((AMB.STATUS[st] || {}).t || st) + '</span>';

  V.estrelas = (r, n, cls) => {
    const p = Math.max(0, Math.min(5, Number(r) || 0)) / 5 * 100;
    return '<span class="estrelas ' + (cls || '') + '" title="' + (n ? AMB.fmtNum(Math.round((r || 0) * 10) / 10) + ' de 5 (' + pl(n, 'avaliação', 'avaliações') + ')' : 'Sem avaliações') + '">' +
      '<span class="est-vazio">★★★★★</span><span class="est-cheio" style="width:' + p.toFixed(0) + '%">★★★★★</span></span>';
  };

  V.thumb = (v, tam) => {
    const nn = String(v.n || 0).padStart(2, '0');
    return '<a class="th th-' + (tam || 'm') + (v.thumb ? '' : ' th-sem') + '" href="#v-' + esc(v.id) + '" aria-label="' + esc(v.artistObj.name + ' — ' + v.title) + '">' +
      (v.thumb ? '<img src="' + esc(v.thumb) + '" alt="" loading="lazy" decoding="async">' : '') +
      '<span class="th-azul" aria-hidden="true"><span class="th-ch">CH ' + nn + '</span>' +
        '<span class="th-art">' + esc(v.artistObj.name) + '</span><span class="th-tit">' + esc(v.title) + '</span>' +
        '<span class="th-ss">' + (v.status === 'procura-se' ? 'SEM FITA' : 'SEM SINAL') + '</span></span>' +
      (v.duration && v.hasFile ? '<span class="th-dur">' + AMB.fmtDur(v.duration) + '</span>' : '') +
      (v.status !== 'no-acervo' ? '<span class="th-selo">' + V.selo(v.status) + '</span>' : '') +
      (v.draft ? '<span class="th-rasc">RASCUNHO</span>' : '') +
      (v.hasFile && v.audio.length > 1 ? '<span class="th-2a" title="Dá para escolher entre o áudio do disco e o da fita">2 ÁUDIOS</span>' : '') +
    '</a>';
  };

  V.statsSlot = (v, curto) => '<span class="st" data-st="' + esc(v.id) + '"' + (curto ? ' data-curto="1"' : '') + '></span>';

  V.card = (v) =>
    '<div class="card">' + V.thumb(v, 'm') +
      '<div class="card-txt">' +
        '<a class="card-tit" href="#v-' + esc(v.id) + '">' + esc(v.title) + '</a>' +
        '<div class="card-de">de <a href="#a-' + esc(v.artistObj.id) + '">' + esc(v.artistObj.name) + '</a></div>' +
        '<div class="card-meta">' + esc(v.kindShort) + (v.year ? ' · ' + esc(v.year) : '') + '</div>' +
        (v.hasFile ? '<div class="card-meta">' + V.statsSlot(v) + '</div>' : '') +
      '</div></div>';

  V.linha = (v) => { // item de lista (estilo "resultado de busca" antigo)
    const cr = AMB.mainCredit(v);
    return '<div class="linha">' + V.thumb(v, 'm') +
      '<div class="linha-txt">' +
        '<a class="linha-tit" href="#v-' + esc(v.id) + '">' + esc(v.artistObj.name) + ' — ' + esc(v.title) + '</a>' + (v.status !== 'no-acervo' ? ' ' + V.selo(v.status) : '') +
        (v.description ? '<p class="linha-desc">' + esc(v.description.length > 170 ? v.description.slice(0, 167) + '…' : v.description) + '</p>' : '') +
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

  V.discoIcone = (a, tam) => '<span class="vinil vinil-' + (tam || 'm') + '" style="--h:' + hue(a.id) + '" aria-hidden="true"><b>' + esc((a.name || '?').charAt(0).toUpperCase()) + '</b></span>';

  V.fontes = (lista, rot) => {
    const itens = (lista || []).map(AMB.src).filter(Boolean);
    if (!itens.length) return '';
    return '<div class="fontes"><b>' + esc(rot || 'Fontes') + ':</b> ' + itens.map((s) =>
      s.u ? '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a>' : '<span>' + esc(s.t) + '</span>').join(' · ') + '</div>';
  };

  V.box = (titulo, corpo, cls, extra) =>
    '<section class="box ' + (cls || '') + '"><div class="box-h"><h3>' + titulo + '</h3>' + (extra || '') + '</div><div class="box-c">' + corpo + '</div></section>';

  V.vazio = (txt) => '<p class="vazio">' + txt + '</p>';

  /* ---------------- início ---------------- */
  V.chipsHome = () => {
    const vs = AMB.videos.filter((v) => !v.test);
    const decadas = Array.from(new Set(vs.map((v) => v.decade).filter(Boolean))).sort();
    const chips = [['tudo', 'Tudo'], ['no-acervo', 'No acervo'], ['nacionais', 'Nacionais'], ['internacionais', 'Internacionais'],
      ['clipe', 'Clipes'], ['tv', 'Na TV'], ['ao-vivo', 'Ao vivo'], ['filme', 'Filmes']]
      .concat(decadas.map((d) => ['d' + d, 'Anos ' + (d >= 2000 ? d : String(d).slice(2))]))
      .concat([['procura-se', 'Procura-se']]);
    if (AMB.favs.list().length) chips.push(['favoritos', '★ Favoritos']);
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
        '<section class="box box-azul box-videos"><div class="box-h"><h2>Vídeos</h2><span class="box-h-dir">' + pl(lista.length, 'registro', 'registros') + '</span></div>' +
          '<div class="box-c"><div class="chips" role="toolbar" aria-label="Filtrar vídeos">' +
            V.chipsHome().map(([k, t]) => '<button type="button" class="chip' + (st.filtro === k ? ' ativo' : '') + '" data-acao="filtro" data-f="' + esc(k) + '" aria-pressed="' + (st.filtro === k) + '">' + esc(t) + '</button>').join('') +
          '</div>' +
          (mostra.length ? '<div class="grade">' + mostra.map(V.card).join('') + '</div>' : V.vazio('Nenhum vídeo com esse filtro ainda.')) +
          (lista.length > mostra.length ? '<div class="mais"><button type="button" class="btn" data-acao="mais">Mostrar mais (' + (lista.length - mostra.length) + ')</button></div>' : '') +
        '</div></section>' +
      '</div>' +
      '<aside class="col-side">' +
        '<section class="box box-bv"><div class="box-c">' +
          '<h2 class="bv-tit">Gravado da TV, guardado pra sempre.</h2>' +
          '<p>O ' + site + ' é um acervo público de videoclipes e apresentações musicais, brasileiros e gringos, digitalizados de fitas VHS e com o som dos discos (LP, compacto, CD) sincronizado. Cada vídeo diz de onde veio, quem guardou a fita e quem digitalizou.</p>' +
          '<div class="bv-botoes"><a class="btn btn-y" href="#colaborar">Tenho fitas para o acervo</a><a class="btn" href="#sobre">Como funciona</a></div>' +
        '</div></section>' +
        V.box('Números do acervo',
          '<ul class="numeros">' +
            '<li><b>' + n.on + '</b> no acervo</li><li><b>' + n.fila + '</b> na fila</li><li><b>' + n.ps + '</b> procura-se</li>' +
            '<li><b>' + AMB.artistList.length + '</b> artistas</li><li><b>' + acervos.length + '</b> ' + (acervos.length === 1 ? 'acervo' : 'acervos') + '</li>' +
          '</ul>' + (AMB.updated ? '<p class="mini">Dados atualizados em ' + esc(AMB.fmtDate(AMB.updated)) + '.</p>' : '')) +
        V.box('Acervos', '<ul class="acervos-mini">' + acervos.map((c) =>
          '<li>' + V.avatar(c, 's') + '<span><a href="#c-' + esc(c.id) + '">' + esc(c.name) + '</a><small>' + esc((c.roles || []).map((r) => AMB.ROLES[r] || r).join(', ')) + '</small></span></li>').join('') + '</ul>' +
          '<p class="mini">Quem cede uma fita ou digitaliza um disco ganha crédito em cada vídeo. <a href="#colaborar">Quero colaborar</a></p>') +
        (procurados.length ? V.box('Procura-se', '<ul class="lista-mini">' + procurados.map((v) =>
          '<li><a href="#v-' + esc(v.id) + '">' + esc(v.artistObj.name) + ' — ' + esc(v.title) + '</a> <small>' + esc(v.kindShort) + (v.year ? ', ' + esc(v.year) : '') + '</small></li>').join('') + '</ul>' +
          '<p class="mini"><a href="#procura-se">Ver todos os ' + n.ps + ' registros procurados</a></p>') : '') +
        V.box('Comentários recentes', '<div id="recentes" class="recentes"><p class="mini">Carregando…</p></div>') +
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
    return '<section class="box box-azul"><div class="box-h"><h2>Todos os vídeos</h2><span class="box-h-dir">' + pl(lista.length, 'registro', 'registros') + '</span></div><div class="box-c">' +
      '<div class="filtros">' +
        sel('ordem', 'Ordem', [['recentes', 'Adicionados recentemente'], ['antigos', 'Mais antigos primeiro'], ['novos', 'Mais novos primeiro'], ['az', 'Artista, A–Z'], ['vistos', 'Mais vistos'], ['avaliados', 'Mais bem avaliados']]) +
        sel('situacao', 'Situação', [['tudo', 'Todas'], ['no-acervo', 'No acervo'], ['na-fila', 'Na fila'], ['procura-se', 'Procura-se']]) +
        sel('tipo', 'Tipo', [['tudo', 'Todos']].concat(Object.keys(AMB.KINDS).map((k) => [k, AMB.KINDS[k]]))) +
        sel('origem', 'Origem', [['tudo', 'Todas'], ['br', 'Nacionais'], ['gringo', 'Internacionais']]) +
        sel('decada', 'Década', [['tudo', 'Todas']].concat(decadas.map((d) => [String(d), 'Anos ' + d]))) +
      '</div>' +
      (lista.length ? '<div class="linhas">' + lista.map(V.linha).join('') + '</div>' : V.vazio('Nenhum vídeo com esses filtros.')) +
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
      (lanc.length ? '<p class="mini">Saiu em:</p><ul class="mus-discos">' + lanc.map((x) =>
        '<li><a href="#a-' + esc(a.id) + '" data-disco="' + esc(x.r.id) + '">' + esc(x.r.title) + '</a> <small>' + esc(AMB.RELTYPES[x.r.type] || x.r.type) +
          (x.r.year ? ', ' + esc(x.r.year) : '') + (x.r.label ? ', ' + esc(x.r.label) : '') + ' · faixa ' + esc(x.t.n) + '</small>' +
          (x.mesma ? '' : ' <span class="tag-outra" title="O vídeo usa outra gravação desta música">outra versão</span>') + '</li>').join('') + '</ul>' :
        '<p class="mini">Ainda não cadastramos em que disco esta música saiu. <a href="#" data-acao="corrigir" data-video="' + esc(v.id) + '">Sabe? Conte pra gente.</a></p>')
    ) : '<p class="mini">' + (v.kind === 'tv' || v.kind === 'entrevista' ? 'Registro sem uma música só.' : 'Música ainda não identificada.') + ' <a href="#" data-acao="corrigir" data-video="' + esc(v.id) + '">Sugerir</a></p>';

    return '<div class="pg-watch">' +
      '<h1 class="w-tit">' + titulo + '</h1>' +
      '<div class="cols">' +
        '<div class="col-main">' +
          '<div id="player" class="w-player"></div>' +
          (v.hasFile ? '<div class="w-faixa">' +
            '<div class="w-rate"><span class="rot">Avaliar:</span> <span class="rate-in" role="radiogroup" aria-label="Sua avaliação" data-video="' + esc(v.id) + '">' +
              [1, 2, 3, 4, 5].map((i) => '<button type="button" data-acao="votar" data-n="' + i + '" aria-label="' + i + (i === 1 ? ' estrela' : ' estrelas') + '">★</button>').join('') + '</span>' +
              ' <span class="rate-txt" data-st-rate="' + esc(v.id) + '"></span></div>' +
            '<div class="w-views">Exibições: <b data-st-views="' + esc(v.id) + '">—</b></div>' +
          '</div>' : '') +
          '<div class="w-acoes" role="tablist">' +
            '<button type="button" class="w-acao" data-acao="painel" data-p="compartilhar"><i class="ico ico-comp"></i>Compartilhar</button>' +
            '<button type="button" class="w-acao' + (fav ? ' ativo' : '') + '" data-acao="favoritar" data-video="' + esc(v.id) + '"><i class="ico ico-fav"></i>' + (fav ? 'Favoritado' : 'Favoritar') + '</button>' +
            '<button type="button" class="w-acao" data-acao="tenho" data-video="' + esc(v.id) + '"><i class="ico ico-fita"></i>Tenho essa gravação</button>' +
            '<button type="button" class="w-acao" data-acao="corrigir" data-video="' + esc(v.id) + '"><i class="ico ico-flag"></i>Sugerir correção</button>' +
          '</div>' +
          '<div class="w-painel" id="painel" hidden>' +
            '<div class="comp-link"><input type="text" readonly value="' + esc(url) + '" aria-label="Link do vídeo"><button type="button" class="btn" data-acao="copiar" data-txt="' + esc(url) + '">Copiar link</button></div>' +
            '<div class="comp-redes">' +
              '<a href="https://wa.me/?text=' + encodeURIComponent(a.name + ' — ' + v.title + ' ' + url) + '" target="_blank" rel="noopener">WhatsApp</a>' +
              '<a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) + '" target="_blank" rel="noopener">Facebook</a>' +
              '<a href="https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(a.name + ' — ' + v.title) + '" target="_blank" rel="noopener">X (Twitter)</a>' +
              '<a href="https://bsky.app/intent/compose?text=' + encodeURIComponent(a.name + ' — ' + v.title + ' ' + url) + '" target="_blank" rel="noopener">Bluesky</a>' +
            '</div>' +
          '</div>' +
          (v.hasFile && v.audio.length ? '<div class="w-audio-info" id="audio-info"></div>' : '') +
          '<div class="abas abas-w" role="tablist">' +
            '<button type="button" class="aba ativo" data-acao="aba" data-aba="comentarios" role="tab" aria-selected="true">Comentários <span class="n-com" data-st-com="' + esc(v.id) + '"></span></button>' +
            '<button type="button" class="aba" data-acao="aba" data-aba="creditos" role="tab" aria-selected="false">Créditos e ficha técnica</button>' +
            '<button type="button" class="aba" data-acao="aba" data-aba="fontes" role="tab" aria-selected="false">Fontes</button>' +
          '</div>' +
          '<div class="aba-c" data-aba-c="comentarios">' + V.comentarios(v) + '</div>' +
          '<div class="aba-c" data-aba-c="creditos" hidden>' + V.creditos(v) + '</div>' +
          '<div class="aba-c" data-aba-c="fontes" hidden>' + V.fontesVideo(v) + '</div>' +
        '</div>' +
        '<aside class="col-side">' +
          '<section class="box w-de"><div class="box-c">' +
            (cr && cr.w ? '<div class="de-topo">' + V.avatar(c || { id: cr.w.name, name: cr.w.name }, 'm') +
              '<div class="de-txt"><span class="de-papel">' + esc(cr.papel) + ':</span> ' + V.quem(cr.w) +
                (c && c.since ? '<br><span class="mini">Colabora desde ' + esc(AMB.fmtMonth(c.since)) + '</span>' : '') +
                (c ? '<br><span class="mini">Registros: ' + qtd + '</span>' : '') + '</div>' +
              (c ? '<a class="btn btn-y btn-p" href="#c-' + esc(c.id) + '">Ver acervo</a>' : '') + '</div>' : '') +
            '<div class="de-info"><span class="mini">' + (v.added ? 'Adicionado em ' + esc(AMB.fmtDate(v.added)) : '') + '</span> ' + V.selo(v.status) +
              (v.description ? '<p>' + esc(v.description) + '</p>' : '') +
              (v.note ? '<p class="nota-cur"><b>Nota do curador:</b> “' + esc(v.note) + '”</p>' : '') +
              '<p class="mini de-tipo">' + esc(v.kindLabel) + (v.date ? ' · ' + esc(AMB.fmtDate(v.date)) : '') +
                (v.program || v.channel ? ' · ' + esc([v.program, v.channel].filter(Boolean).join(', ')) : '') + (v.director ? ' · direção de ' + esc(v.director) : '') + '</p>' +
            '</div>' +
            '<div class="de-link"><label>Link <input type="text" readonly value="' + esc(url) + '"></label></div>' +
          '</div></section>' +
          (v.test ? '' : V.box('Sobre a música', sobre, 'w-musica')) +
          (mais.length ? V.box('Mais de ' + esc(a.name), '<ul class="rel">' + mais.slice(0, 8).map(V.relItem).join('') + '</ul>' +
            (mais.length > 8 ? '<p class="mini"><a href="#a-' + esc(a.id) + '">Ver todos os ' + mais.length + '</a></p>' : ''), 'w-mais') : '') +
          V.box('Vídeos relacionados', '<ul class="rel">' + rel.filter((x) => x.artistObj !== a).slice(0, 10).map(V.relItem).join('') + '</ul>', 'w-rel') +
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
        '<label class="com-l">Seu nome ou apelido <input type="text" name="nome" maxlength="40" value="' + nome + '" autocomplete="nickname" required></label>' +
        '<label class="com-l">Comentário <textarea name="texto" maxlength="500" rows="3" required placeholder="O que essa gravação lembra pra você? Sabe algo sobre ela?"></textarea></label>' +
        '<label class="hp" aria-hidden="true">Não preencha <input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        '<div class="com-pe"><span class="mini com-resta">Restam 500 caracteres</span>' +
          '<button type="submit" class="btn btn-b">Postar comentário</button></div>' +
        '<p class="mini com-regras">Sem links. Comentários ofensivos são apagados.' + (AMB.api.live() ? '' : ' <b>Modo demonstração:</b> o comentário fica só neste navegador.') + '</p>' +
        '<p class="com-msg" role="status"></p>' +
      '</form>' +
      '<div class="com-lista" data-video="' + esc(v.id) + '"><p class="mini">Carregando comentários…</p></div>' +
    '</div>';
  };

  V.comentario = (c) => '<div class="com-item"><div class="com-cab"><b>' + esc(c.nome) + '</b> <span class="mini">(' + esc(AMB.ago(c.criado_em) || '') + ')</span>' +
    ' <button type="button" class="link-btn" data-acao="responder" data-nome="' + esc(c.nome) + '">Responder</button></div>' +
    '<p>' + esc(c.texto) + '</p></div>';

  V.creditos = (v) => {
    const cr = v.credits || {};
    const s = v.source || {};
    const linhas = [];
    const add = (rot, val) => { if (val) linhas.push('<dt>' + esc(rot) + '</dt><dd>' + val + '</dd>'); };
    add('Tipo', esc(v.kindLabel) + (v.director ? ', direção de ' + esc(v.director) : ''));
    add('Data', v.date ? esc(AMB.fmtDate(v.date)) : '');
    add('Exibido em', esc([v.channel, v.program, s.aired ? AMB.fmtDate(s.aired) : ''].filter(Boolean).join(' — ')));
    add('Gravado de', esc(s.from || ''));
    add('Mídia', esc([s.medium, s.standard, s.speed ? 'velocidade ' + s.speed : '', s.generation].filter(Boolean).join(' · ')));
    if (cr.tape) add('Fita cedida por', V.quem(AMB.who(cr.tape)));
    if (cr.capture) add('Captura do vídeo', V.quem(AMB.who(cr.capture)) + (s.deck || s.capture ? ' <span class="mini">(' + esc([s.deck, s.capture].filter(Boolean).join(' → ')) + ')</span>' : ''));
    (v.audio || []).forEach((t, i) => {
      const rel = t.release ? v.artistObj.releases.find((r) => r.id === t.release) : null;
      add(i === 0 ? 'Áudio principal' : 'Outro áudio', esc(t.label || t.short) + (rel ? ' — <a href="#a-' + esc(v.artistObj.id) + '" data-disco="' + esc(rel.id) + '">' + esc(rel.title) + '</a> (' + esc(AMB.RELTYPES[rel.type] || rel.type) + ', ' + esc(rel.year || '') + ')' : '') +
        (t.by ? ', digitalizado por ' + V.quem(AMB.who(t.by)) : '') + (t.note ? ' <span class="mini">' + esc(t.note) + '</span>' : ''));
    });
    if (cr.sync) add('Sincronização', V.quem(AMB.who(cr.sync)) + ' <span class="mini">(EternalDub)</span>');
    if (cr.restore) add('Restauração', V.quem(AMB.who(cr.restore)));
    (cr.extra || []).forEach((x) => add(x.role || 'Crédito', V.quem(AMB.who(x.who))));
    if (v.added_by) add('Cadastro', V.quem(AMB.who(v.added_by)) + (v.added ? ', em ' + esc(AMB.fmtDate(v.added)) : ''));
    if (v.hasFile) {
      add('Duração', v.duration ? AMB.fmtDur(v.duration) : '');
      add('Arquivo', (v.file.ia && AMB.cfg('MOSTRAR_LINK_IA', true) ? 'preservado no <a href="https://archive.org/details/' + encodeURIComponent(v.file.ia) + '" target="_blank" rel="noopener">Internet Archive (' + esc(v.file.ia) + ')</a>' : 'hospedado pelo acervo') +
        ((v.file.mirrors || []).length ? ' · ' + pl(v.file.mirrors.length, 'espelho', 'espelhos') : ''));
    }
    add('Observações', esc(s.notes || ''));
    add('Situação', V.selo(v.status) + ' <span class="mini">' + esc((AMB.STATUS[v.status] || {}).d || '') + '</span>');
    return '<dl class="ficha">' + linhas.join('') + '</dl>' +
      '<p class="mini">Faltou um crédito ou tem algo errado? <a href="#" data-acao="corrigir" data-video="' + esc(v.id) + '">Sugira uma correção</a>: a moderação confere antes de publicar.</p>';
  };

  V.fontesVideo = (v) => {
    const fs = (v.src || []).map(AMB.src).filter(Boolean);
    const refs = v.refs || [];
    const item = (s) => '<li>' + (s.u ? '<a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a>' : esc(s.t)) + '</li>';
    const disco = [];
    AMB.songReleases(v).forEach((x) => (x.r.src || []).forEach((id) => { if (disco.indexOf(id) < 0) disco.push(id); }));
    return (fs.length ? '<h4>Sobre este registro</h4><ul class="fontes-l">' + fs.map(item).join('') + '</ul>' : '') +
      (disco.length ? '<h4>Sobre a música e os discos</h4><ul class="fontes-l">' + disco.map(AMB.src).filter(Boolean).map(item).join('') + '</ul>' : '') +
      (refs.length ? '<h4>Referências</h4><ul class="fontes-l">' + refs.map(item).join('') + '</ul>' : '') +
      (!fs.length && !refs.length && !disco.length ? V.vazio('Este registro ainda não tem fontes cadastradas.') : '') +
      '<p class="mini">As informações são reescritas com as nossas palavras, sempre com link para a fonte.</p>';
  };

  /* ---------------- artistas ---------------- */
  V.artistas = (st) => {
    let lista = AMB.artistList;
    if (st.origem === 'br') lista = lista.filter((a) => a.nacional);
    if (st.origem === 'gringo') lista = lista.filter((a) => !a.nacional);
    const chips = [['tudo', 'Todos'], ['br', 'Nacionais'], ['gringo', 'Internacionais']];
    return '<section class="box box-azul"><div class="box-h"><h2>Artistas</h2><span class="box-h-dir">' + pl(lista.length, 'artista', 'artistas') + '</span></div><div class="box-c">' +
      '<div class="chips">' + chips.map(([k, t]) => '<button type="button" class="chip' + (st.origem === k ? ' ativo' : '') + '" data-acao="art-origem" data-f="' + k + '" aria-pressed="' + (st.origem === k) + '">' + t + '</button>').join('') + '</div>' +
      '<div class="grade-art">' + lista.map((a) => {
        const c = AMB.coverage(a);
        return '<a class="art-card" href="#a-' + esc(a.id) + '">' + V.discoIcone(a, 'm') +
          '<span class="art-nome">' + esc(a.name) + '</span>' +
          '<span class="mini">' + esc([AMB.country(a.country), a.years].filter(Boolean).join(' · ')) + '</span>' +
          '<span class="mini">' + pl(c.videos, 'registro', 'registros') + (a.releases.length ? ' · ' + pl(a.releases.length, 'disco', 'discos') : '') + '</span></a>';
      }).join('') + '</div></div></section>';
  };

  V.artista = (a, aba) => {
    const cob = AMB.coverage(a);
    const temDisco = a.releases.length > 0;
    aba = aba || (temDisco ? 'discografia' : 'videos');
    const abas = [['discografia', 'Discografia × videografia'], ['videos', 'Vídeos (' + a.videos.length + ')'], ['sobre', 'Sobre']];
    const info = [];
    if (a.origin) info.push(['Origem', esc(a.origin)]);
    if (a.country) info.push(['País', esc(AMB.country(a.country))]);
    if (a.years) info.push(['Em atividade', esc(a.years)]);
    if (a.alt && a.alt.length) info.push(['Também conhecido como', esc(a.alt.join(', '))]);
    let corpo = '';
    if (aba === 'discografia') corpo = V.discografia(a, cob);
    else if (aba === 'videos') corpo = a.videos.length ? '<div class="grade">' + a.videos.map(V.card).join('') + '</div>' : V.vazio('Nenhum vídeo deste artista ainda.');
    else corpo = V.sobreArtista(a);
    return '<div class="pg-artista">' +
      '<div class="art-topo">' + V.discoIcone(a, 'g') +
        '<div class="art-topo-txt"><h1>' + esc(a.name) + '</h1>' +
          (info.length ? '<dl class="art-info">' + info.map(([k, x]) => '<dt>' + k + '</dt><dd>' + x + '</dd>').join('') + '</dl>' : '') +
        '</div>' +
        '<div class="art-nums">' +
          '<span><b>' + cob.videos + '</b> registros em vídeo</span>' +
          (temDisco ? '<span><b>' + cob.musicasComVideo + '</b> de <b>' + cob.musicas + '</b> músicas dos discos com vídeo</span>' : '') +
          '<span><b>' + (cob.cont['no-acervo'] || 0) + '</b> no acervo</span>' +
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
      esc(v.kindLabel + (v.year ? ', ' + v.year : '') + ' — ' + (AMB.STATUS[v.status] || {}).t + (x.rel === 'outra' ? ' (outra versão da música)' : '')) + '">' +
      '<i>' + ico + '</i>' + esc(v.kindShort) + (v.year ? ' ' + esc(v.year) : '') + (x.rel === 'outra' ? '<small>outra versão</small>' : '') + '</a>';
  };

  V.discografia = (a, cob) => {
    if (!a.releases.length) {
      return V.vazio('A discografia de ' + esc(a.name) + ' ainda não foi cadastrada. ' +
        '<a href="#" data-acao="corrigir" data-artista="' + esc(a.id) + '">Quer ajudar? Envie os discos com as fontes.</a>') +
        (a.videos.length ? '<h3 class="sub">Registros em vídeo</h3><div class="grade">' + a.videos.map(V.card).join('') + '</div>' : '');
    }
    const tot = cob.videos || 1;
    const larg = (k) => ((cob.cont[k] || 0) / tot * 100).toFixed(1) + '%';
    const resumo = '<div class="cob">' +
      '<p class="cob-txt"><b>' + cob.musicasComVideo + '</b> das <b>' + cob.musicas + '</b> músicas lançadas em disco têm algum registro em vídeo conhecido. ' +
        'Ao todo são <b>' + cob.videos + '</b> registros de ' + esc(a.name) + '.</p>' +
      '<div class="cob-barra" role="img" aria-label="' + esc(['no-acervo', 'na-fila', 'procura-se'].map((k) => (cob.cont[k] || 0) + ' ' + AMB.STATUS[k].t.toLowerCase()).join(', ')) + '">' +
        ['no-acervo', 'na-fila', 'procura-se'].map((k) => '<span class="cb-' + k + '" style="width:' + larg(k) + '"></span>').join('') + '</div>' +
      '<div class="cob-leg">' + ['no-acervo', 'na-fila', 'procura-se'].map((k) => '<span class="leg leg-' + k + '">' + esc(AMB.STATUS[k].t) + ' (' + (cob.cont[k] || 0) + ')</span>').join('') +
        '<span class="leg leg-outra">outra versão da música</span></div>' +
      '<label class="cob-so"><input type="checkbox" data-acao="so-com-video"> Mostrar só as faixas com vídeo</label>' +
    '</div>';
    const discos = cob.discos.map((d) => {
      const r = d.r;
      const pct = d.total ? Math.round(d.comVideo / d.total * 100) : 0;
      return '<section class="disco" id="disco-' + esc(r.id) + '">' +
        '<div class="disco-cab">' +
          '<span class="disco-ico disco-' + esc(r.type) + '" style="--h:' + hue(r.id) + '" aria-hidden="true"></span>' +
          '<div class="disco-tit"><h3>' + esc(r.title) + '</h3>' +
            '<div class="disco-meta"><b>' + esc(AMB.RELTYPES[r.type] || r.type) + '</b> · ' + esc(r.date ? AMB.fmtDate(r.date) : (r.year || '')) +
              (r.label ? ' · ' + esc(r.label) : '') + (r.format && AMB.norm(r.format) !== AMB.norm(AMB.RELTYPES[r.type] || '') ? ' · ' + esc(r.format) : '') + (r.credit ? ' · ' + esc(r.credit) : '') + '</div></div>' +
          '<div class="disco-cob" title="' + d.comVideo + ' de ' + d.total + ' faixas têm registro em vídeo"><b>' + d.comVideo + '</b>/' + d.total + ' com vídeo' +
            '<span class="mini-barra"><span style="width:' + pct + '%"></span></span></div>' +
        '</div>' +
        (r.note ? '<p class="disco-nota">' + esc(r.note) + '</p>' : '') +
        '<table class="faixas"><thead><tr><th scope="col">Faixa</th><th scope="col">Música</th><th scope="col">Duração</th><th scope="col">Registros em vídeo</th></tr></thead><tbody>' +
        d.linhas.map((l) => '<tr class="' + (l.regs.length ? 'tem' : 'nao') + '">' +
          '<td class="f-n">' + esc(l.t.n) + '</td>' +
          '<td class="f-t">' + esc(l.t.t) + (l.t.feat ? ' <span class="f-feat">(' + esc(/^(com |coro|vocal)/.test(l.t.feat) ? l.t.feat : 'part. ' + l.t.feat) + ')</span>' : '') +
            (l.t.w || l.t.note ? '<span class="f-w">' + esc([l.t.w, l.t.note].filter(Boolean).join(' · ')) + '</span>' : '') + '</td>' +
          '<td class="f-d">' + esc(l.t.len || '') + '</td>' +
          '<td class="f-v">' + (l.regs.length ? l.regs.map(V.vchip).join('') : '<span class="f-sem">—</span>') + '</td></tr>').join('') +
        '</tbody></table>' +
        (r.partial ? '<p class="mini">Lista parcial: só as faixas que conhecemos.</p>' : '') +
        V.fontes(r.src) +
      '</section>';
    }).join('');
    const soltos = cob.soltos.length ? '<section class="disco disco-soltos"><div class="disco-cab"><span class="disco-ico disco-fita" aria-hidden="true"></span>' +
      '<div class="disco-tit"><h3>Registros sem disco correspondente</h3><div class="disco-meta">Músicas que não estão nos discos acima, ou registros sem uma música só</div></div></div>' +
      '<ul class="soltos">' + cob.soltos.map((v) => '<li>' + V.vchip({ v, rel: 'mesma' }) + ' <a href="#v-' + esc(v.id) + '">' + esc(v.title) + '</a>' +
        (v.program ? ' <span class="mini">' + esc(v.program) + '</span>' : '') + '</li>').join('') + '</ul></section>' : '';
    return resumo + discos + soltos +
      '<p class="mini">Discos em ordem de lançamento. Uma música que aparece em mais de um disco mostra os mesmos registros em cada um. ' +
      '“Outra versão” quer dizer que o vídeo usa outra gravação da música (ao vivo, demo, regravação). Faltou algo? <a href="#" data-acao="corrigir" data-artista="' + esc(a.id) + '">Sugira</a>.</p>';
  };

  V.sobreArtista = (a) => {
    return (a.intro ? '<p class="art-intro">' + esc(a.intro) + '</p>' : V.vazio('Ainda não escrevemos sobre ' + esc(a.name) + '.')) +
      (a.members && a.members.length ? '<h3 class="sub">Formação</h3><table class="membros"><tbody>' + a.members.map((m) =>
        '<tr><td><b>' + esc(m.name) + '</b></td><td>' + esc(m.role || '') + '</td><td class="mini">' + esc(m.years || '') + '</td></tr>').join('') + '</tbody></table>' : '') +
      V.fontes(a.src);
  };

  /* ---------------- acervos (colaboradores) ---------------- */
  V.acervos = () => {
    const lista = Object.values(AMB.acervos);
    return '<section class="box box-azul"><div class="box-h"><h2>Acervos</h2><span class="box-h-dir">quem guarda, digitaliza e sincroniza</span></div><div class="box-c">' +
      '<p class="intro">Cada fita cedida, cada disco digitalizado e cada sincronia feita aparece com o nome de quem fez, em todos os vídeos em que o trabalho foi usado. ' +
      'Tem fitas ou discos guardados? <a href="#colaborar">Veja como colaborar</a>.</p>' +
      '<div class="acervos">' + lista.map((c) => {
        const t = c.trabalhos || {};
        const nums = [['fitas', 'fitas cedidas'], ['captura', 'capturas'], ['audio', 'áudios de disco'], ['sincronizacao', 'sincronias']]
          .filter(([k]) => (t[k] || []).length).map(([k, r]) => '<b>' + t[k].length + '</b> ' + r);
        return '<a class="acervo-card" href="#c-' + esc(c.id) + '">' + V.avatar(c, 'g') +
          '<span class="acervo-nome">' + esc(c.name) + '</span>' +
          '<span class="mini">' + esc((c.roles || []).map((r) => AMB.ROLES[r] || r).join(' · ')) + '</span>' +
          (c.city ? '<span class="mini">' + esc(c.city) + '</span>' : '') +
          '<span class="mini">' + (nums.length ? nums.join(' · ') : (t.cadastro || []).length + ' registros cadastrados') + '</span></a>';
      }).join('') + '</div></div></section>';
  };

  V.acervo = (c) => {
    const t = c.trabalhos || {};
    const secao = (k, tit) => (t[k] && t[k].length ? '<h3 class="sub">' + tit + ' (' + t[k].length + ')</h3><div class="grade">' + t[k].map(V.card).join('') + '</div>' : '');
    const corpo = secao('fitas', 'Fitas cedidas') + secao('captura', 'Vídeos digitalizados') + secao('audio', 'Áudios de disco digitalizados') +
      secao('sincronizacao', 'Sincronias') + secao('restauracao', 'Restaurações');
    const cad = t.cadastro || [];
    return '<div class="pg-acervo"><div class="art-topo">' + V.avatar(c, 'g') +
      '<div class="art-topo-txt"><h1>' + esc(c.name) + '</h1>' +
        '<dl class="art-info">' + ((c.roles || []).length ? '<dt>Colabora com</dt><dd>' + esc(c.roles.map((r) => AMB.ROLES[r] || r).join(', ')) + '</dd>' : '') +
          (c.since ? '<dt>Desde</dt><dd>' + esc(AMB.fmtMonth(c.since)) + '</dd>' : '') + (c.city ? '<dt>Cidade</dt><dd>' + esc(c.city) + '</dd>' : '') + '</dl>' +
        (c.bio ? '<p>' + esc(c.bio) + '</p>' : '') +
        ((c.links || []).length ? '<p class="links">' + c.links.map((l) => '<a href="' + esc(l.u) + '" target="_blank" rel="noopener">' + esc(l.t) + ' ↗</a>').join(' · ') + '</p>' : '') +
      '</div></div>' +
      (corpo || V.vazio('Os trabalhos de ' + esc(c.name) + ' aparecem aqui assim que os vídeos com o crédito dele entrarem no acervo.')) +
      (cad.length ? '<h3 class="sub">Registros cadastrados (' + cad.length + ')</h3><div class="linhas">' + cad.slice(0, 40).map(V.linha).join('') + '</div>' : '') +
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
            ' <button type="button" class="btn btn-p" data-acao="tenho" data-video="' + esc(v.id) + '">Tenho essa gravação</button></li>').join('') + '</ul></div>';
      }).join('');
    };
    return '<section class="box box-azul"><div class="box-h"><h2>Procura-se</h2><span class="box-h-dir">' + pl(ps.length, 'registro', 'registros') + '</span></div><div class="box-c">' +
      '<p class="intro">Registros que sabemos que existem, mas que ainda não têm cópia no acervo. Você gravou da TV, comprou a fita ou conhece alguém que tem? ' +
      'Fale com a gente: a fita volta para você, digitalizada, e seu nome fica nos créditos. Cópias de melhor geração também são bem-vindas, mesmo de registros que já circulam na internet.</p>' +
      (ps.length ? grupo(ps) : V.vazio('Nada sendo procurado agora.')) + '</div></section>' +
      (fila.length ? '<section class="box"><div class="box-h"><h3>Na fila para digitalizar</h3><span class="box-h-dir">' + fila.length + '</span></div><div class="box-c">' +
        '<p class="mini">Registros que o curador já separou. Se você tem uma cópia melhor de algum, conta também.</p>' + grupo(fila) + '</div></section>' : '');
  };

  /* ---------------- busca ---------------- */
  V.busca = (q) => {
    const r = AMB.search(q);
    const total = r.videos.length + r.artists.length + r.acervos.length;
    return '<section class="box box-azul"><div class="box-h"><h2>Busca: “' + esc(q) + '”</h2><span class="box-h-dir">' + pl(total, 'resultado', 'resultados') + '</span></div><div class="box-c">' +
      (r.artists.length ? '<h3 class="sub">Artistas</h3><div class="grade-art">' + r.artists.map((a) => '<a class="art-card" href="#a-' + esc(a.id) + '">' + V.discoIcone(a, 'm') + '<span class="art-nome">' + esc(a.name) + '</span><span class="mini">' + pl(a.videos.length, 'registro', 'registros') + '</span></a>').join('') + '</div>' : '') +
      (r.acervos.length ? '<h3 class="sub">Acervos</h3><ul class="acervos-mini">' + r.acervos.map((c) => '<li>' + V.avatar(c, 's') + '<a href="#c-' + esc(c.id) + '">' + esc(c.name) + '</a></li>').join('') + '</ul>' : '') +
      (r.videos.length ? '<h3 class="sub">Vídeos</h3><div class="linhas">' + r.videos.map(V.linha).join('') + '</div>' : '') +
      (!total ? V.vazio('Nada encontrado. Tente outro nome, um ano (1985) ou um programa (Fantástico).') : '') +
    '</div></section>';
  };

  /* ---------------- sobre / colaborar ---------------- */
  V.sobre = (foco) => {
    const site = esc(AMB.cfg('SITE_NAME', 'Ambário'));
    const contato = AMB.cfg('CONTATO', '');
    const c = (id, tit, corpo) => '<section class="box sobre-sec" id="sec-' + id + '"><div class="box-h"><h3>' + tit + '</h3></div><div class="box-c">' + corpo + '</div></section>';
    return '<div class="pg-sobre' + (foco ? ' foco-' + esc(foco) : '') + '">' +
      '<h1 class="w-tit">Sobre o ' + site + '</h1>' +
      c('o-que-e', 'O que é',
        '<p>Um acervo público de videoclipes e apresentações musicais gravados em fita: clipes que passavam na TV, apresentações em programas de auditório, shows e cenas de filmes. Brasileiros e gringos.</p>' +
        '<p>A prioridade é a <b>preservação</b>: cada vídeo é guardado com a melhor qualidade possível, com a história de onde veio, e com o crédito de quem guardou a fita e de quem digitalizou. Nenhum vídeo daqui está hospedado no YouTube.</p>') +
      c('dois-audios', 'Dois áudios em cada vídeo',
        '<p>Sempre que dá, o vídeo traz <b>dois áudios sincronizados</b>: o principal, tirado de uma fonte boa (LP, compacto, CD), e o <b>som original da fita</b>, do jeito que foi gravado da TV, com vinheta, locutor e chiado. Troque no botão <b>ÁUDIO</b> do player, a qualquer momento.</p>' +
        '<p>A sincronia é feita com o <a href="https://github.com/Moguel0818/EternalDub" target="_blank" rel="noopener">EternalDub</a>, ferramenta de código aberto que mede o atraso e a diferença de velocidade da fita e acerta o áudio do disco no tempo do vídeo.</p>') +
      c('videografia', 'Discografia × videografia',
        '<p>Na página de cada artista, a discografia aparece faixa por faixa, com os registros em vídeo de cada música: o que já está no acervo, o que está na fila e o que ainda procuramos. Assim fica fácil ver, por exemplo, quais músicas de um LP ganharam clipe ou foram tocadas na TV.</p>') +
      c('colaborar', 'Como colaborar',
        '<p>Tem fitas VHS, Betamax, U-matic, compactos ou LPs guardados? Seu acervo pode entrar aqui:</p>' +
        '<ol><li>Conte o que você tem pelo formulário abaixo' + (contato ? ' ou pelo contato <b>' + esc(contato) + '</b>' : '') + '.</li>' +
          '<li>Combinamos como digitalizar: você mesmo, se tiver como, ou pelo estúdio do acervo. A fita é sua e volta para você.</li>' +
          '<li>O vídeo entra no acervo com o seu nome em “Fita cedida por” e uma página só do seu acervo, com tudo que você ajudou a preservar.</li></ol>' +
        '<form class="form-contato" data-tipo="contato" novalidate>' +
          '<label>Seu nome ou apelido <input type="text" name="nome" maxlength="60" required></label>' +
          '<label>Como falar com você (e-mail, Instagram ou WhatsApp) <small>Só a moderação vê.</small><input type="text" name="contato" maxlength="120" required></label>' +
          '<label>O que você tem? <textarea name="mensagem" rows="4" maxlength="2000" required placeholder="Ex.: umas 20 fitas VHS gravadas da MTV e do Fantástico entre 1988 e 1995, e alguns LPs nacionais."></textarea></label>' +
          '<label class="hp" aria-hidden="true">Não preencha <input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
          '<button type="submit" class="btn btn-y">Enviar</button><p class="form-msg" role="status"></p>' +
        '</form>') +
      c('situacoes', 'No acervo, na fila, procura-se',
        '<ul class="sits"><li>' + V.selo('no-acervo') + ' o vídeo está no ar e toca aqui.</li><li>' + V.selo('na-fila') + ' ' + esc(AMB.STATUS['na-fila'].d) + '</li><li>' + V.selo('procura-se') + ' ' + esc(AMB.STATUS['procura-se'].d) + '</li></ul>') +
      c('politica', 'Política do acervo',
        '<p>O ' + site + ' não tem fins lucrativos e existe para guardar a memória da música na TV. As informações são reescritas com nossas palavras e citam a fonte. Os vídeos ficam no <a href="https://archive.org" target="_blank" rel="noopener">Internet Archive</a>, que preserva arquivos de forma permanente.</p>' +
        '<p><b>Se você é artista ou detém os direitos de algum vídeo e quer que ele saia do ar, é só pedir</b>' + (contato ? ' em <b>' + esc(contato) + '</b>' : ' pelo formulário de contato') + ': ele sai, sem discussão.</p>' +
        '<p>Comentários com links, ofensas ou spam são apagados. Os contatos deixados nos formulários só são vistos pela moderação.</p>') +
      c('creditos-site', 'Créditos do site',
        '<p>Player de TV antiga (CRT): <a href="https://moguell.neocities.org/projects" target="_blank" rel="noopener">Eternal Medias</a>, do moguell. Fonte dos números do player: VT323 (licença SIL OFL). Dados de discografia com fontes citadas em cada disco.</p>' +
        '<p>Visual inspirado nos sites de vídeo da segunda metade dos anos 2000.</p>') +
    '</div>';
  };

  V.naoAchei = (o) => '<section class="box"><div class="box-c"><h1 class="w-tit">Sem sinal</h1><p>Não encontramos ' + esc(o || 'esta página') + '. <a href="#inicio">Voltar ao início</a></p></div></section>';
})();
