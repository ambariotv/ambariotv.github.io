/*
 * Ambário — app: rotas, eventos, comentários, avaliações, formulários e atalhos.
 * Endereços (tudo depois do #):
 *   inicio · videos · v-<vídeo> · artistas · a-<artista> (· a-<artista>--videos / --sobre) · acervos · c-<acervo>
 *   procura-se · busca · sobre · colaborar · politica · admin (· admin/…: telas da área do curador)
 */
(function () {
  'use strict';
  const AMB = window.AMB;
  const V = AMB.V;
  const esc = AMB.esc;
  const T = AMB.t;
  const main = document.getElementById('main');

  const ST = {
    home: { filtro: 'tudo', qtd: 24 },
    videos: { ordem: 'recentes', situacao: 'tudo', tipo: 'tudo', origem: 'tudo', decada: 'tudo' },
    artistas: { origem: 'tudo' },
    q: '',
    autoplay: false,
    rolar: null
  };
  try { ST.q = sessionStorage.getItem('amb.q') || ''; } catch (e) { /* ok */ }
  let player = null;

  /* ---------------- marca (nome do site no logotipo) ---------------- */
  function aplicarMarca() {
    const nome = AMB.cfg('SITE_NAME', 'Ambário');
    const partes = nome.trim().split(/\s+/);
    const ultima = partes.pop();
    const el = document.querySelector('.logo-nome');
    if (el) el.innerHTML = (partes.length ? esc(partes.join(' ')) + ' ' : '') + '<em>' + esc(ultima) + '</em>';
    const sub = document.querySelector('.logo-sub');
    if (sub) sub.textContent = T(AMB.cfg('SITE_TAGLINE', 'Acervo de videoclipes'), AMB.cfg('SITE_TAGLINE_EN', 'Music video archive'));
    const modo = document.getElementById('modo');
    if (modo) modo.textContent = AMB.api.live() ? '' : T('Modo demonstração: comentários, exibições e avaliações ficam só neste navegador até o servidor (Apps Script) ser ligado.', 'Demo mode: comments, views and ratings stay in this browser only until the server (Apps Script) is connected.');
    // textos fixos do index.html: data-en (texto), data-en-ph (placeholder), data-en-al (aria-label)
    document.documentElement.lang = AMB.en ? 'en' : 'pt-BR';
    if (AMB.en) {
      document.querySelectorAll('[data-en]').forEach((el) => { el.textContent = el.dataset.en; });
      document.querySelectorAll('[data-en-ph]').forEach((el) => { el.placeholder = el.dataset.enPh; });
      document.querySelectorAll('[data-en-al]').forEach((el) => { el.setAttribute('aria-label', el.dataset.enAl); });
    }
    // seletor de idioma
    document.querySelectorAll('[data-lang]').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.lang === AMB.lang));
      b.addEventListener('click', () => { if (b.dataset.lang !== AMB.lang) AMB.setLang(b.dataset.lang); });
    });
  }

  // Aviso para quem edita: alterações que só existem neste navegador, ou a versão recém-publicada
  function avisoLocal() {
    let el = document.getElementById('aviso-local');
    const e = AMB.estado || {};
    let html = '';
    if (e.pendentes) {
      html = '<b>' + V.pl(e.pendentes, 'alteração', 'alterações') + ' só neste navegador.</b> Ainda não está' + (e.pendentes === 1 ? '' : 'ão') + ' no site público. ' +
        '<a href="#admin/publicar">Publicar ou descartar</a>';
    } else if (e.publicado) {
      html = 'Você está vendo a versão que acabou de publicar. O site público atualiza sozinho em 1 ou 2 minutos.';
    }
    if (e.erro) html += (html ? ' · ' : '') + '<span class="erro">Não deu para aplicar alguma alteração pendente (' + esc(e.erro) + '). Abra a <a href="#admin/publicar">área do curador</a>.</span>';
    if (!html) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = 'aviso-local';
      el.className = 'aviso-local';
      el.setAttribute('role', 'status');
      main.parentNode.insertBefore(el, main);
    }
    el.innerHTML = html;
  }

  // A área do curador só é baixada quando alguém abre #admin (visitantes não carregam nada disso)
  let adminCarregando = null;
  function carregarAdmin() {
    if (AMB.Admin) return Promise.resolve();
    if (adminCarregando) return adminCarregando;
    const versao = encodeURIComponent(String(AMB.servido && AMB.servido.rev || ''));
    adminCarregando = ['js/editor-github.js', 'js/editor-capa.js', 'js/admin.js'].reduce((p, src) => p.then(() => new Promise((ok, falha) => {
      const s = document.createElement('script');
      s.src = src + '?v=' + versao;
      s.onload = ok;
      s.onerror = () => falha(new Error('Não deu para carregar ' + src + '. Confira a conexão e recarregue a página.'));
      document.head.appendChild(s);
    })), Promise.resolve()).catch((e) => { adminCarregando = null; throw e; });
    return adminCarregando;
  }

  /* ---------------- rotas ---------------- */
  function rota() {
    let h = location.hash.replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) { /* ok */ }
    return h;
  }
  function ir(hash) {
    if (location.hash === '#' + hash) render();
    else location.hash = hash;
  }
  AMB.ir = ir;

  function titulo(t) {
    const site = AMB.cfg('SITE_NAME', 'Ambário');
    document.title = t ? t + ' — ' + site : site + ' — ' + T(AMB.cfg('SITE_TAGLINE', 'Acervo de videoclipes'), AMB.cfg('SITE_TAGLINE_EN', 'Music video archive'));
  }
  function marcarAba(aba) {
    document.querySelectorAll('.abas-topo a').forEach((a) => {
      const ativo = a.dataset.tab === aba;
      a.classList.toggle('ativo', ativo);
      if (ativo) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  // textos que entram depois (abas, "mostrar mais", comentários…) também são traduzidos
  if (AMB.en && typeof MutationObserver !== 'undefined') {
    let pend = false;
    new MutationObserver(() => {
      if (pend) return;
      pend = true;
      requestAnimationFrame(() => { pend = false; if (main.querySelector('[data-tr]')) AMB.traduzirPagina(main); });
    }).observe(main, { childList: true, subtree: true });
  }
  // passar o mouse (ou o dedo) num vídeo já descobre os servidores do Internet Archive: o player começa mais rápido
  const preaquecer = (e) => {
    const a = e.target.closest && e.target.closest('a[href^="#v-"]');
    if (!a || !AMB.iaFontes) return;
    const v = AMB.videos.find((x) => '#v-' + x.id === a.getAttribute('href'));
    if (v && v.hasFile) AMB.iaFontes(v.file.video).catch(() => {});
  };
  document.addEventListener('mouseover', preaquecer, { passive: true });
  document.addEventListener('touchstart', preaquecer, { passive: true });
  function render(opts) {
    opts = opts || {};
    if (player) { player.destroy(); player = null; }
    fecharModal();
    const h = rota();
    let html = '', aba = '', tit = '', depois = null;
    if (!h || h === 'inicio') {
      html = V.home(ST.home); aba = 'inicio'; depois = posHome;
    } else if (h === 'videos') {
      html = V.videos(ST.videos); aba = 'videos'; tit = T('Vídeos', 'Videos');
    } else if (h.indexOf('v-') === 0) {
      const v = AMB.videoById[h.slice(2)];
      if (v) { html = V.watch(v); aba = 'videos'; tit = v.artistObj.name + ' — ' + v.title; depois = () => posWatch(v); }
      else html = V.naoAchei(T('este vídeo', 'this video'));
    } else if (h.indexOf('a-') === 0) {
      const [id, sub] = h.slice(2).split('--');
      const a = AMB.artists[id];
      if (a) { html = V.artista(a, sub); aba = 'artistas'; tit = a.name; depois = posArtista; }
      else html = V.naoAchei(T('este artista', 'this artist'));
    } else if (h === 'artistas') {
      html = V.artistas(ST.artistas); aba = 'artistas'; tit = T('Artistas', 'Artists');
    } else if (h === 'acervos') {
      html = V.acervos(); aba = 'acervos'; tit = T('Acervos', 'Collections');
    } else if (h.indexOf('c-') === 0) {
      const c = AMB.acervos[h.slice(2)];
      if (c) { html = V.acervo(c); aba = 'acervos'; tit = c.name; }
      else html = V.naoAchei(T('este acervo', 'this collection'));
    } else if (h === 'procura-se') {
      html = V.procura(); aba = 'procura-se'; tit = AMB.STATUS['procura-se'].t;
    } else if (h === 'busca') {
      html = ST.q ? V.busca(ST.q) : V.naoAchei(T('o que buscar: digite na caixa de busca', 'anything to search for: type in the search box')); tit = T('Busca', 'Search');
    } else if (h === 'sobre' || h === 'colaborar' || h === 'politica') {
      html = V.sobre(h); tit = h === 'colaborar' ? T('Como colaborar', 'How to contribute') : h === 'politica' ? T('Política', 'Policy') : T('Sobre', 'About');
      depois = () => { if (h !== 'sobre') rolarPara('sec-' + h); };
    } else if (h === 'admin' || h.indexOf('admin/') === 0) {
      html = '<div id="admin" class="adm-pg"><p class="mini">Carregando a área do curador…</p></div>'; tit = 'Área do curador';
      depois = () => carregarAdmin().then(() => {
        const el = document.getElementById('admin');
        if (el && rota() === h) AMB.Admin.render(el, h);
      }).catch((e) => {
        const el = document.getElementById('admin');
        if (el) el.innerHTML = V.box('Área do curador', '<p class="erro">' + esc(e.message) + '</p>');
      });
    } else {
      html = V.naoAchei();
    }
    main.innerHTML = html;
    AMB.traduzirPagina(main);
    avisoLocal();
    titulo(tit);
    marcarAba(aba);
    if (!opts.manterRolagem) window.scrollTo(0, 0);
    if (depois) depois();
    preencherStats(main);
    if (ST.rolar) { const alvo = ST.rolar; ST.rolar = null; rolarPara(alvo, true); }
  }

  function rolarPara(id, piscar) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: 'start' });
    if (piscar) { el.classList.add('pisca'); setTimeout(() => el.classList.remove('pisca'), 1800); }
  }

  /* ---------------- estatísticas (exibições, estrelas, comentários) ---------------- */
  async function preencherStats(raiz) {
    const ids = new Set();
    raiz.querySelectorAll('[data-st],[data-st-views],[data-st-rate],[data-st-com]').forEach((el) => {
      ids.add(el.dataset.st || el.dataset.stViews || el.dataset.stRate || el.dataset.stCom);
    });
    if (!ids.size) return;
    let s;
    try { s = await AMB.api.stats(Array.from(ids)); } catch (e) { return; }
    raiz.querySelectorAll('[data-st]').forEach((el) => {
      const x = s[el.dataset.st];
      if (!x) return;
      el.innerHTML = (el.dataset.curto ? AMB.fmtNum(x.v) + T(' exib.', ' views') : V.pl(x.v || 0, T('exibição', 'view'), T('exibições', 'views'))) + (x.n ? ' ' + V.estrelas(x.r, x.n, 'est-p') : '');
    });
    raiz.querySelectorAll('[data-st-views]').forEach((el) => { const x = s[el.dataset.stViews]; if (x) el.textContent = AMB.fmtNum(x.v || 0); });
    raiz.querySelectorAll('[data-st-rate]').forEach((el) => {
      const x = s[el.dataset.stRate];
      if (!x) return;
      const meu = AMB.myVote(el.dataset.stRate);
      el.innerHTML = (x.n ? V.estrelas(x.r, x.n) + ' ' + V.pl(x.n, T('avaliação', 'rating'), T('avaliações', 'ratings')) : T('Seja o primeiro a avaliar', 'Be the first to rate')) + (meu ? ' · <span class="mini">' + T('você deu ', 'you gave ') + meu + '</span>' : '');
      pintarVoto(meu);
    });
    raiz.querySelectorAll('[data-st-com]').forEach((el) => { const x = s[el.dataset.stCom]; if (x && x.c) el.textContent = '(' + x.c + ')'; });
  }
  function pintarVoto(n) {
    document.querySelectorAll('.rate-in button').forEach((b) => b.classList.toggle('on', Number(b.dataset.n) <= n));
  }

  /* ---------------- início ---------------- */
  async function posHome() {
    const box = document.getElementById('recentes');
    if (!box) return;
    try {
      const l = await AMB.api.recent();
      if (!document.body.contains(box)) return;
      box.innerHTML = l.length ? '<ul class="recentes-l">' + l.map((c) => {
        const v = AMB.videoById[c.video_id];
        return '<li><b>' + esc(c.nome) + '</b> <span class="mini">' + esc(AMB.ago(c.criado_em)) + '</span>' +
          '<p>“' + esc(String(c.texto).length > 110 ? String(c.texto).slice(0, 107) + '…' : c.texto) + '”</p>' +
          (v ? '<a class="mini" href="#v-' + esc(v.id) + '">' + T('em ', 'on ') + esc(v.artistObj.name + ' — ' + v.title) + '</a>' : '') + '</li>';
      }).join('') + '</ul>' : '<p class="mini">' + T('Ainda não há comentários. Que tal deixar o primeiro?', 'No comments yet. Why not leave the first one?') + '</p>';
    } catch (e) {
      box.innerHTML = '<p class="mini">' + T('Não deu para carregar os comentários agora.', 'Could not load comments right now.') + '</p>';
    }
  }

  /* ---------------- página do vídeo ---------------- */
  function posWatch(v) {
    const viz = AMB.neighbors(v);
    const box = document.getElementById('player');
    player = AMB.Player.create(box, {
      video: v,
      prev: viz.prev,
      next: viz.next,
      autoplay: ST.autoplay,
      autoNext: AMB.cfg('PROXIMO_AUTOMATICO', true) !== false,
      onPrev: () => { ST.autoplay = true; ir('v-' + viz.prev.id); },
      onNext: () => { ST.autoplay = true; ir('v-' + viz.next.id); },
      onCount: (x) => {
        AMB.api.view(x.id).then(() => {
          const s = AMB.api.cached(x.id);
          const el = document.querySelector('[data-st-views="' + x.id + '"]');
          if (s && el) el.textContent = AMB.fmtNum(s.v || 0);
        }).catch(() => {});
      },
      onTrack: (t) => audioInfo(v, t)
    });
    ST.autoplay = false;
    AMB.__ultimoPlayer = player; // ajuda a depurar pelo console do navegador
    if (v.hasFile) {
      const atalhos = document.createElement('p');
      atalhos.className = 'mini atalhos';
      atalhos.innerHTML = T('Atalhos: <kbd>espaço</kbd> tocar/pausar', 'Shortcuts: <kbd>space</kbd> play/pause') + ' · <kbd>←</kbd><kbd>→</kbd> 5 s · ' + (v.audio.length > 1 ? '<kbd>A</kbd> ' + T('trocar o áudio', 'switch audio') + ' · ' : '') +
        '<kbd>F</kbd> ' + T('tela cheia', 'fullscreen') + ' · <kbd>M</kbd> ' + T('som', 'mute') + ' · <kbd>C</kbd> ' + T('filtro CRT', 'CRT filter');
      box.after(atalhos);
    }
    carregarComentarios(v.id);
    pintarVoto(AMB.myVote(v.id));
  }

  function audioInfo(v, t) {
    const box = document.getElementById('audio-info');
    if (!box || !t) return;
    const outra = v.audio.find((x) => x !== t && (x.embedded || x.url));
    const rel = t.release ? v.artistObj.releases.find((r) => r.id === t.release) : null;
    box.innerHTML = '<span class="ai-rot">' + T('Você está ouvindo:', 'You are listening to:') + '</span> <b>' + esc(t.label || t.short) + '</b>' +
      (rel ? ' — <a href="#a-' + esc(v.artistObj.id) + '" data-disco="' + esc(rel.id) + '">' + esc(rel.title) + '</a> (' + esc(AMB.RELTYPES[rel.type] || '') + (rel.year ? ', ' + esc(rel.year) : '') + ')' : '') +
      (t.by ? T(', digitalizado por ', ', digitized by ') + V.quem(AMB.who(t.by)) : '') +
      (outra ? ' <button type="button" class="btn btn-p" data-acao="trocar-audio" data-id="' + esc(outra.id) + '">' + T('Ouvir: ', 'Listen to: ') + esc(outra.label || outra.short) + '</button>' : '');
  }

  async function carregarComentarios(id) {
    const box = document.querySelector('.com-lista[data-video="' + id + '"]');
    if (!box) return;
    try {
      const l = await AMB.api.comments(id);
      if (!document.body.contains(box)) return;
      box.innerHTML = l.length ? l.map(V.comentario).join('') : '<p class="mini">' + T('Nenhum comentário ainda.', 'No comments yet.') + '</p>';
      const n = document.querySelector('[data-st-com="' + id + '"]');
      if (n) n.textContent = l.length ? '(' + l.length + ')' : '';
    } catch (e) {
      box.innerHTML = '<p class="mini">' + esc(AMB.erroMsg(e)) + '</p>';
    }
  }

  /* ---------------- artista ---------------- */
  function posArtista() {
    const chk = main.querySelector('[data-acao="so-com-video"]');
    if (chk && AMB.store.get('amb.soComVideo', false)) { chk.checked = true; main.classList.add('so-com-video'); }
  }

  /* ---------------- janelas (formulários) ---------------- */
  let ultimoFoco = null;
  function abrirModal(html, rotulo) {
    fecharModal();
    ultimoFoco = document.activeElement;
    const fundo = document.createElement('div');
    fundo.className = 'modal-fundo';
    fundo.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(rotulo || T('Janela', 'Dialog')) + '"><button type="button" class="modal-x" data-acao="fechar" aria-label="' + T('Fechar', 'Close') + '">×</button>' + html + '</div>';
    document.body.appendChild(fundo);
    document.documentElement.classList.add('com-modal');
    const primeiro = fundo.querySelector('input:not([type=hidden]):not([tabindex="-1"]),textarea,select');
    if (primeiro) primeiro.focus();
    fundo.addEventListener('mousedown', (e) => { if (e.target === fundo) fecharModal(); });
    return fundo;
  }
  function fecharModal() {
    const m = document.querySelector('.modal-fundo');
    if (!m) return;
    m.remove();
    document.documentElement.classList.remove('com-modal');
    if (ultimoFoco && document.body.contains(ultimoFoco)) ultimoFoco.focus();
  }

  function formTenho(v) {
    const rot = v ? esc(v.artistObj.name + ' — ' + v.title + (v.year ? ' (' + v.year + ')' : '')) : '';
    abrirModal('<h2>' + T('Tenho essa gravação', 'I have this recording') + '</h2>' +
      (v ? '<p class="mini">' + T('Sobre: ', 'About: ') + '<b>' + rot + '</b></p>' : '') +
      '<p>' + T('Que bom! Conte o que você tem. A fita continua sua: o acervo digitaliza (ou orienta você a digitalizar) e devolve, e seu nome entra nos créditos.', 'Great! Tell us what you have. The tape stays yours: the archive digitizes it (or helps you do it) and returns it, and your name goes in the credits.') + '</p>' +
      '<form class="form-modal" data-tipo="tenho" data-video="' + esc(v ? v.id : '') + '" novalidate>' +
        '<label>' + T('Seu nome ou apelido', 'Your name or nickname') + ' <input type="text" name="nome" maxlength="60" required></label>' +
        '<label>' + T('Como falar com você', 'How to reach you') + ' <small>' + T('(e-mail, Instagram ou WhatsApp — só a moderação vê)', '(e-mail, Instagram or WhatsApp — only moderators see this)') + '</small><input type="text" name="contato" maxlength="120" required></label>' +
        '<label>' + T('Em que formato?', 'What format?') + ' <select name="formato">' + [T('Fita VHS', 'VHS tape'), T('Fita Betamax', 'Betamax tape'), T('Fita U-matic', 'U-matic tape'), T('Fita Hi8 / Video8', 'Hi8 / Video8 tape'), 'LaserDisc', 'DVD',
          T('Arquivo digital (cópia de melhor qualidade)', 'Digital file (better-quality copy)'), T('Outro', 'Other')].map((o) => '<option>' + esc(o) + '</option>').join('') + '</select></label>' +
        '<label>' + T('Detalhes', 'Details') + ' <textarea name="mensagem" rows="4" maxlength="2000" required placeholder="' + T('De onde é a gravação? Programa, emissora, ano, se é a fita original ou cópia, como está a fita…', 'Where is the recording from? Show, channel, year, original tape or copy, tape condition…') + '"></textarea></label>' +
        '<label class="hp" aria-hidden="true">' + T('Não preencha', 'Leave blank') + ' <input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        '<div class="form-pe"><button type="submit" class="btn btn-y">' + T('Enviar', 'Send') + '</button><button type="button" class="btn" data-acao="fechar">' + T('Cancelar', 'Cancel') + '</button></div>' +
        '<p class="form-msg" role="status"></p>' +
      '</form>', T('Tenho essa gravação', 'I have this recording'));
  }

  function formCorrigir(v, a) {
    const alvo = v ? esc(v.artistObj.name + ' — ' + v.title) : a ? esc(a.name) : '';
    abrirModal('<h2>' + T('Sugerir correção', 'Suggest a correction') + '</h2>' +
      (alvo ? '<p class="mini">' + T('Sobre: ', 'About: ') + '<b>' + alvo + '</b></p>' : '') +
      '<form class="form-modal" data-tipo="correcao" data-video="' + esc(v ? v.id : '') + '" data-artista="' + esc(a ? a.id : v ? v.artistObj.id : '') + '" novalidate>' +
        '<label>' + T('O que está errado ou faltando?', 'What is wrong or missing?') + ' <select name="campo">' + [T('Título ou música', 'Title or song'), T('Data, programa ou emissora', 'Date, show or channel'), T('Créditos (quem cedeu, digitalizou…)', 'Credits (who lent, digitized…)'),
          T('Discografia (discos e faixas)', 'Discography (records and tracks)'), T('Outra versão / outro registro conhecido', 'Other version / other known recording'), T('Pedido de remoção', 'Takedown request'), T('Outro', 'Other')].map((o) => '<option>' + esc(o) + '</option>').join('') + '</select></label>' +
        '<label>' + T('Explique', 'Explain') + ' <textarea name="mensagem" rows="4" maxlength="2000" required></textarea></label>' +
        '<label>' + T('Fonte (link de onde veio a informação)', 'Source (link to where the information came from)') + ' <input type="url" name="fonte_url" maxlength="500" placeholder="https://"></label>' +
        '<label>' + T('Contato', 'Contact') + ' <small>' + T('(opcional, só a moderação vê)', '(optional, only moderators see this)') + '</small><input type="text" name="contato" maxlength="120"></label>' +
        '<label class="hp" aria-hidden="true">' + T('Não preencha', 'Leave blank') + ' <input type="text" name="website" tabindex="-1" autocomplete="off"></label>' +
        '<div class="form-pe"><button type="submit" class="btn btn-y">' + T('Enviar', 'Send') + '</button><button type="button" class="btn" data-acao="fechar">' + T('Cancelar', 'Cancel') + '</button></div>' +
        '<p class="form-msg" role="status"></p>' +
      '</form>', T('Sugerir correção', 'Suggest a correction'));
  }

  async function enviarSugestao(form) {
    const msg = form.querySelector('.form-msg');
    const d = Object.fromEntries(new FormData(form).entries());
    const tipo = form.dataset.tipo;
    const falta = Array.from(form.querySelectorAll('[required]')).find((el) => !String(el.value || '').trim());
    if (falta) { msg.className = 'form-msg erro'; msg.textContent = T('Preencha os campos obrigatórios.', 'Fill in the required fields.'); falta.focus(); return; }
    if (d.fonte_url && !AMB.isUrl(d.fonte_url)) { msg.className = 'form-msg erro'; msg.textContent = T('O link da fonte precisa começar com http:// ou https://', 'The source link must start with http:// or https://'); return; }
    const v = AMB.videoById[form.dataset.video || ''];
    const botao = form.querySelector('button[type=submit]');
    botao.disabled = true;
    msg.className = 'form-msg'; msg.textContent = T('Enviando…', 'Sending…');
    try {
      const r = await AMB.api.suggest({
        tipo, video: form.dataset.video || '', artista: form.dataset.artista || (v ? v.artistObj.id : ''),
        titulo: v ? v.artistObj.name + ' — ' + v.title : '', nome: d.nome || '', contato: d.contato || '',
        mensagem: [d.campo ? '[' + d.campo + ']' : '', d.formato ? '[' + d.formato + ']' : '', d.mensagem || ''].filter(Boolean).join(' '),
        fonte_url: d.fonte_url || '', website: d.website || ''
      });
      form.querySelectorAll('input,textarea,select,button').forEach((el) => { el.disabled = true; });
      msg.className = 'form-msg ok';
      msg.textContent = r.demo ? T('Recebido (modo demonstração: a mensagem ficou só neste navegador).', 'Received (demo mode: the message stayed in this browser only).') : T('Recebido! A moderação vai ler e, se precisar, responder pelo contato que você deixou. Obrigado!', 'Received! Moderators will read it and, if needed, reply using the contact you left. Thank you!');
    } catch (e) {
      botao.disabled = false;
      msg.className = 'form-msg erro';
      msg.textContent = AMB.erroMsg(e);
    }
  }

  async function enviarComentario(form) {
    const id = form.dataset.video;
    const msg = form.querySelector('.com-msg');
    const nome = form.nome.value, texto = form.texto.value;
    const erro = AMB.checkComment(nome, texto);
    if (erro) { msg.className = 'com-msg erro'; msg.textContent = erro; return; }
    const desde = Date.now() - Number(form.dataset.aberto || 0);
    const botao = form.querySelector('button[type=submit]');
    botao.disabled = true;
    msg.className = 'com-msg'; msg.textContent = T('Enviando…', 'Sending…');
    try {
      const r = await AMB.api.postComment(id, nome, texto, { website: form.website.value, t: desde });
      AMB.store.set('amb.nome', nome.trim());
      form.texto.value = '';
      contarResta(form);
      if (r.pendente) { msg.className = 'com-msg ok'; msg.textContent = T('Recebido! Seu comentário aparece depois que a moderação aprovar.', 'Received! Your comment will show up once moderators approve it.'); }
      else { msg.className = 'com-msg ok'; msg.textContent = r.demo ? T('Publicado (modo demonstração: só neste navegador).', 'Posted (demo mode: this browser only).') : T('Publicado!', 'Posted!'); }
      carregarComentarios(id);
    } catch (e) {
      msg.className = 'com-msg erro'; msg.textContent = AMB.erroMsg(e);
    } finally { botao.disabled = false; }
  }
  function contarResta(form) {
    const el = form.querySelector('.com-resta');
    if (el) { const n = 500 - form.texto.value.length; el.textContent = T('Restam ' + n + ' caracteres', n + ' characters left'); el.classList.toggle('pouco', n < 40); }
  }

  async function copiar(txt, botao) {
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch (e) {
      const inp = botao && botao.parentNode.querySelector('input');
      if (inp) { inp.select(); try { ok = document.execCommand('copy'); } catch (e2) { ok = false; } }
    }
    if (botao) { const antes = botao.textContent; botao.textContent = ok ? T('Copiado!', 'Copied!') : T('Selecione e copie', 'Select and copy'); setTimeout(() => { botao.textContent = antes; }, 1600); }
  }

  /* ---------------- cliques (um ouvinte para o site todo) ---------------- */
  document.addEventListener('click', (e) => {
    const disco = e.target.closest('a[data-disco]');
    if (disco) ST.rolar = 'disco-' + disco.dataset.disco;
    const el = e.target.closest('[data-acao]');
    if (!el) return;
    const acao = el.dataset.acao;
    switch (acao) {
      case 'filtro': ST.home.filtro = el.dataset.f; ST.home.qtd = 24; render({ manterRolagem: true }); break;
      case 'mais': ST.home.qtd += 24; render({ manterRolagem: true }); break;
      case 'art-origem': ST.artistas.origem = el.dataset.f; render({ manterRolagem: true }); break;
      case 'tenho': e.preventDefault(); formTenho(AMB.videoById[el.dataset.video]); break;
      case 'corrigir': e.preventDefault(); formCorrigir(AMB.videoById[el.dataset.video], AMB.artists[el.dataset.artista]); break;
      case 'fechar': fecharModal(); break;
      case 'painel': {
        const p = document.getElementById('painel');
        if (p) { p.hidden = !p.hidden; el.classList.toggle('ativo', !p.hidden); }
        break;
      }
      case 'copiar': copiar(el.dataset.txt, el); break;
      case 'favoritar': {
        const on = AMB.favs.toggle(el.dataset.video);
        el.classList.toggle('ativo', on);
        el.innerHTML = '<i class="ico ico-fav"></i>' + (on ? T('Favoritado', 'Favorited') : T('Favoritar', 'Favorite'));
        break;
      }
      case 'votar': {
        const box = el.closest('.rate-in');
        const n = Number(el.dataset.n);
        pintarVoto(n);
        AMB.api.rate(box.dataset.video, n).then(() => preencherStats(main)).catch((er) => {
          const t = document.querySelector('[data-st-rate]');
          if (t) t.textContent = AMB.erroMsg(er);
        });
        break;
      }
      case 'aba': {
        const alvo = el.dataset.aba;
        el.parentNode.querySelectorAll('.aba').forEach((b) => { const on = b === el; b.classList.toggle('ativo', on); b.setAttribute('aria-selected', String(on)); });
        main.querySelectorAll('[data-aba-c]').forEach((c) => { c.hidden = c.dataset.abaC !== alvo; });
        break;
      }
      case 'responder': {
        const ta = main.querySelector('.com-form textarea');
        if (ta) { ta.value = '@' + el.dataset.nome + ' ' + ta.value.replace(/^@\S+\s/, ''); ta.focus(); contarResta(ta.form); }
        break;
      }
      case 'trocar-audio': if (player) { AMB.clique(); player.selecionar(el.dataset.id); } break;
      case 'so-com-video': break; // tratado no "change"
      default: break;
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.matches('[data-acao="vfiltro"]')) { ST.videos[el.dataset.k] = el.value; render({ manterRolagem: true }); }
    if (el.matches('[data-acao="so-com-video"]')) { main.classList.toggle('so-com-video', el.checked); AMB.store.set('amb.soComVideo', el.checked); }
  });

  document.addEventListener('submit', (e) => {
    const f = e.target;
    if (f.id === 'form-busca') {
      e.preventDefault();
      ST.q = (f.q.value || '').trim();
      try { sessionStorage.setItem('amb.q', ST.q); } catch (er) { /* ok */ }
      if (ST.q) ir('busca');
      return;
    }
    if (f.classList.contains('com-form')) { e.preventDefault(); enviarComentario(f); return; }
    if (f.classList.contains('form-modal') || f.classList.contains('form-contato')) { e.preventDefault(); enviarSugestao(f); }
  });

  document.addEventListener('input', (e) => {
    if (e.target.name === 'texto' && e.target.form && e.target.form.classList.contains('com-form')) contarResta(e.target.form);
  });
  document.addEventListener('focusin', (e) => {
    const f = e.target.form;
    if (f && f.classList.contains('com-form') && !f.dataset.aberto) f.dataset.aberto = String(Date.now());
  });

  // imagem que não carrega vira a tela azul de "sem sinal"
  document.addEventListener('error', (e) => {
    const img = e.target;
    if (!img || img.tagName !== 'IMG') return;
    const th = img.closest('.th');
    if (th) { th.classList.add('th-sem'); img.remove(); return; }
    if (img.closest('.avatar')) img.remove();
  }, true);

  /* ---------------- atalhos de teclado (página do vídeo) ---------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.querySelector('.modal-fundo')) { fecharModal(); return; }
      if (player && player.telaCheia()) { player.sairTelaCheia(); return; }
    }
    if (!player || !player.v.hasFile || e.ctrlKey || e.metaKey || e.altKey) return;
    const alvo = e.target;
    if (alvo && (/^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName) || alvo.isContentEditable)) return;
    if (document.querySelector('.modal-fundo')) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { if (alvo && alvo.tagName === 'BUTTON' && k === ' ') return; e.preventDefault(); player.alternar(); }
    else if (k === 'arrowright' || k === 'l') { e.preventDefault(); player.pular(5); }
    else if (k === 'arrowleft' || k === 'j') { e.preventDefault(); player.pular(-5); }
    else if (k === 'f') { player.alternarTela(); }
    else if (k === 'm') { player.alternarMudo(); }
    else if (k === 'a') { AMB.clique(); player.proximaFaixa(); }
    else if (k === 'c') { player.alternarCRT(); }
  });

  // Saindo de um formulário da área do curador com alterações não salvas: pergunta antes
  let hashAtual = location.hash;
  window.addEventListener('hashchange', () => {
    const destino = location.hash;
    if (AMB.Admin && AMB.Admin.sujo && AMB.Admin.sujo()) {
      history.replaceState(null, '', hashAtual || '#admin'); // volta o endereço (não dispara hashchange)
      AMB.Admin.confirmarSaida(() => { location.hash = destino; }); // se confirmar, o formulário é descartado antes
      return;
    }
    hashAtual = destino;
    render();
  });
  window.addEventListener('beforeunload', (e) => {
    if (AMB.Admin && AMB.Admin.sujo && AMB.Admin.sujo()) { e.preventDefault(); e.returnValue = ''; }
  });
  AMB.render = render;
  AMB.avisoLocal = avisoLocal;
  aplicarMarca();
  const q = document.getElementById('q');
  if (q && ST.q) q.value = ST.q;
  render();
})();
