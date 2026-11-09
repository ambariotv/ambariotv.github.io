/*
 * Ambário — player de TV antiga (CRT) com dois áudios sincronizados.
 *
 * Baseado no player "Eternal Medias" do moguell.neocities.org (TV com chuvisco, scanlines, vinheta,
 * OSD verde, botões REINICIAR / CRT / ANTERIOR / PRÓXIMO / TELA CHEIA e o clique dos botões).
 * Aqui ele toca arquivos próprios (MP4 do Internet Archive ou de outro servidor) em vez do YouTube,
 * e ganhou a barra de transporte e a troca de áudio.
 *
 * Como funcionam os dois áudios:
 *   - O MP4 traz o vídeo e o áudio principal (o do disco: LP, CD...).
 *   - As outras faixas (o som original da fita) são arquivos de áudio separados (.m4a), na mesma linha do tempo
 *     (o EternalDub já entrega assim). Ao trocar, o som do MP4 fica mudo e o .m4a toca junto com a imagem;
 *     a cada 1/4 de segundo o player confere a diferença e corrige (suave até 0,3 s; acima disso, salta).
 *   - Não precisa de nada especial no servidor: funciona com qualquer link direto, sem CORS.
 */
(function () {
  'use strict';
  const AMB = window.AMB;
  const esc = AMB.esc;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
 
  /* ---------- Internet Archive: endereços diretos dos servidores ---------- */
  // archive.org/download/ITEM/arquivo só redireciona para um dos dois servidores que guardam o item, e o navegador
  // passa por esse redirecionamento a cada pedaço do vídeo. A API de metadados diz quais são os dois servidores:
  // o player vai direto a eles (começa mais rápido) e, se um travar, pula para o outro. Se a API falhar ou
  // demorar, usa o link normal. Os servidores podem mudar com o tempo, por isso a consulta é feita na hora.
  const IA = { pedidos: {}, ok: {} };
  function iaPartes(url) {
    const m = /^https?:\/\/(?:www\.)?archive\.org\/download\/([^/?#]+)\/([^?#]+)/.exec(url || '');
    return m ? { id: decodeURIComponent(m[1]), caminho: m[2] } : null;
  }
  function iaServidores(id) {
    if (IA.pedidos[id]) return IA.pedidos[id];
    const chave = 'amb.ia.' + id;
    try {
      const s = JSON.parse(sessionStorage.getItem(chave) || 'null');
      if (s && Date.now() - s.t < 6 * 3600e3) { IA.ok[id] = s; return (IA.pedidos[id] = Promise.resolve(s)); }
    } catch (e) { /* sem armazenamento */ }
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const limite = setTimeout(() => { if (ctrl) ctrl.abort(); }, 3000);
    IA.pedidos[id] = fetch('https://archive.org/metadata/' + encodeURIComponent(id), ctrl ? { signal: ctrl.signal } : {})
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (!m || !m.dir) return null;
        const bons = Array.isArray(m.workable_servers) && m.workable_servers.length ? m.workable_servers : null;
        const servidores = [m.d1, m.d2, m.server].filter((h, i, l) => h && l.indexOf(h) === i && (!bons || bons.indexOf(h) >= 0));
        if (!servidores.length) return null;
        const s = { t: Date.now(), dir: m.dir, servidores };
        IA.ok[id] = s;
        try { sessionStorage.setItem(chave, JSON.stringify(s)); } catch (e) { /* ok */ }
        return s;
      })
      .catch(() => null)
      .then((s) => { clearTimeout(limite); if (!s) delete IA.pedidos[id]; return s; });
    return IA.pedidos[id];
  }
  // Lista de endereços para um link: os servidores diretos primeiro, o link original por último
  function iaLista(url, s) {
    const p = iaPartes(url);
    if (!p || !s) return [url];
    return s.servidores.map((h) => 'https://' + h + s.dir + '/' + p.caminho).concat(url);
  }
  AMB.iaFontes = (url) => {
    const p = iaPartes(url);
    return p ? iaServidores(p.id).then((s) => iaLista(url, s)) : Promise.resolve([url]);
  };
  const iaFontesJa = (url) => { const p = iaPartes(url); return iaLista(url, p && IA.ok[p.id]); };
  const unicos = (l) => l.filter((u, i) => u && l.indexOf(u) === i);
 
  /* ---------- clique sintetizado dos botões (o mesmo do player original) ---------- */
  let ctxAudio = null;
  AMB.somBotoes = () => true; // som dos botões sempre ligado
  AMB.clique = function () {
    if (!AMB.somBotoes()) return;
    try {
      if (!ctxAudio) ctxAudio = new (window.AudioContext || window.webkitAudioContext)();
      if (ctxAudio.state === 'suspended') ctxAudio.resume();
      const t = ctxAudio.currentTime;
      const osc = ctxAudio.createOscillator();
      const gain = ctxAudio.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      osc.connect(gain);
      gain.connect(ctxAudio.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch (e) { /* sem áudio: segue sem o clique */ }
  };
 
  const ICONE = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    som: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/><path d="M14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
    mudo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 9.4l1.4-1.4 2.1 2.1 2.1-2.1L23 9.4l-2.1 2.1 2.1 2.1-1.4 1.4-2.1-2.1-2.1 2.1-1.4-1.4 2.1-2.1z"/></svg>',
    prev: '<svg viewBox="0 0 253 257" aria-hidden="true"><rect x="4" y="4" width="245" height="249"></rect><polyline points="162,57 78,116 160,203"></polyline></svg>',
    next: '<svg viewBox="0 0 253 257" aria-hidden="true"><rect x="4" y="4" width="245" height="249"></rect><polyline points="92,56 176,116 94,204"></polyline></svg>'
  };
 
  function Player(root, opts) {
    this.root = root;
    this.opts = opts || {};
    this.v = this.opts.video;
    this.crt = AMB.store.get('amb.crt', true) !== false;
    this.volume = clamp(Number(AMB.store.get('amb.volume', 0.9)) || 0.9, 0, 1);
    this.mudo = false;
    this.tracks = (this.v.audio || []).filter((t) => t.embedded || t.url);
    this.track = null;
    this.ext = {};
    this.extAtivo = null;
    this.fontes = this.v.hasFile ? [this.v.file.video].concat(this.v.file.mirrors || []).filter(Boolean) : [];
    this.fonteIdx = 0;
    this.falhas = 0;
    this.audFontes = {};
    this.assistido = 0;
    this.contou = false;
    this.primeiroPlay = true;
    this._t = {};
    this._off = [];
    this.render();
    this.bind();
    if (this.v.hasFile) this.preparar(); else this.semSinal();
    this.glitch();
  }
 
  Player.prototype.$ = function (sel) { return this.root.querySelector(sel); };
  Player.prototype.on = function (el, ev, fn, o) { el.addEventListener(ev, fn, o); this._off.push(() => el.removeEventListener(ev, fn, o)); };
  Player.prototype.timer = function (nome, fn, ms) { clearTimeout(this._t[nome]); this._t[nome] = setTimeout(fn, ms); };
 
  Player.prototype.render = function () {
    const v = this.v;
    const site = AMB.cfg('SITE_NAME', 'Ambário');
    const ar = String(v.aspect || '4:3').replace(':', ' / ');
    const trilhas = this.tracks.length > 1 ? this.tracks.map((t, i) =>
      '<button type="button" data-a="audio" data-id="' + esc(t.id) + '" aria-pressed="' + (i === 0) + '" title="' + esc(t.label || t.short) + '">' + esc(t.short) + '</button>').join('') : '';
    this.root.innerHTML =
      '<div class="vr-tv' + (this.crt ? '' : ' vr-crt-off') + '">' +
        '<div class="vr-tv-top">' +
          '<div class="vr-brand"><span class="vr-led" aria-hidden="true"></span></div>' +
        '</div>' +
        '<div class="vr-screen">' +
          '<div class="vr-picture" style="aspect-ratio:' + esc(ar) + '">' +
            // fit: "cover" corta bordas pretas laterais (4:3 dentro de 16:9); "fill" desfaz imagem 4:3 esticada para 16:9
            '<video class="vr-video' + (v.fit ? ' vr-fit-' + esc(v.fit) : '') + '" style="--ar:' + esc(ar) + '" playsinline webkit-playsinline preload="metadata"></video>' +
            '<div class="vr-semsinal" hidden></div>' +
            '<div class="vr-erro"><strong>SEM SINAL</strong><span class="vr-erro-msg"></span>' +
              '<span class="vr-erro-acoes"><button type="button" data-a="tentar">TENTAR DE NOVO</button>' +
              (v.file && v.file.ia ? '<a href="https://archive.org/details/' + encodeURIComponent(v.file.ia) + '" target="_blank" rel="noopener">ABRIR NO INTERNET ARCHIVE ↗</a>' : '') +
              '</span></div>' +
            '<canvas class="vr-camada vr-noise"></canvas>' +
            '<div class="vr-camada vr-scanlines"></div>' +
            '<div class="vr-camada vr-vinheta"></div>' +
            '<div class="vr-camada vr-reflexo"></div>' +
            '<div class="vr-osd vr-osd-canal"></div>' +
            '<div class="vr-osd vr-osd-modo"></div>' +
            '<div class="vr-carregando" hidden>CARREGANDO<span>…</span></div>' +
            '<div class="vr-sensor"></div>' +
            '<button type="button" class="vr-grande" data-a="pp" aria-label="Tocar">' + ICONE.play + '</button>' +
            '<div class="vr-fim" hidden></div>' +
            '<button type="button" class="vr-fs-btn vr-fs-prev' + (this.opts.prev ? '' : ' vr-sem') + '" data-a="prev" aria-label="Vídeo anterior">' + ICONE.prev + '</button>' +
            '<button type="button" class="vr-fs-btn vr-fs-next' + (this.opts.next ? '' : ' vr-sem') + '" data-a="next" aria-label="Próximo vídeo">' + ICONE.next + '</button>' +
            '<button type="button" class="vr-sair-tela" data-a="tela">✕ SAIR</button>' +
          '</div>' +
          '<div class="vr-transporte"' + (v.hasFile ? '' : ' hidden') + '>' +
            '<button type="button" class="vr-t-btn vr-pp" data-a="pp" aria-label="Tocar">' + ICONE.play + '</button>' +
            '<span class="vr-tempo"><b class="vr-t-atual">0:00</b><i>/</i><span class="vr-t-total">' + (v.duration ? AMB.fmtDur(v.duration) : '0:00') + '</span></span>' +
            '<div class="vr-seek"><div class="vr-seek-trilho"><div class="vr-seek-buf"></div><div class="vr-seek-pos"></div></div>' +
              '<input type="range" class="vr-seek-in" min="0" max="1000" step="1" value="0" aria-label="Posição no vídeo"></div>' +
            '<button type="button" class="vr-t-btn vr-mudo" data-a="mudo" aria-label="Tirar o som">' + ICONE.som + '</button>' +
            '<input type="range" class="vr-vol" min="0" max="100" step="1" value="' + Math.round(this.volume * 100) + '" aria-label="Volume">' +
            (trilhas ? '<div class="vr-audio" role="group" aria-label="Escolher o áudio">' + trilhas + '</div>' : '') +
          '</div>' +
        '</div>' +
        '<div class="vr-controles">' +
          '<button type="button" class="vr-btn" data-a="power"><b>↻</b>REINICIAR</button>' +
          '<button type="button" class="vr-btn" data-a="crt"><b>▣</b>CRT: <span class="vr-crt-status ' + (this.crt ? 'vr-on">SIM' : 'vr-off">NÃO') + '</span></button>' +
          '<button type="button" class="vr-btn" data-a="prev"' + (this.opts.prev ? '' : ' disabled') + '><b>◀◀</b>ANTERIOR</button>' +
          '<button type="button" class="vr-btn" data-a="next"' + (this.opts.next ? '' : ' disabled') + '><b>▶▶</b>PRÓXIMO</button>' +
          '<button type="button" class="vr-btn vr-btn-tela" data-a="tela"><b>[ ]</b>TELA CHEIA</button>' +
        '</div>' +
      '</div>';
    this.tv = this.$('.vr-tv');
    this.screen = this.$('.vr-screen');
    this.picture = this.$('.vr-picture');
    this.video = this.$('.vr-video');
    this.noise = this.$('.vr-noise');
    this.osdCanal = this.$('.vr-osd-canal');
    this.osdModoEl = this.$('.vr-osd-modo');
    this.seekIn = this.$('.vr-seek-in');
    this.osdCanal.textContent = '';
  };
 
  Player.prototype.osdPadrao = function () {
    return String(this.v.n || 1).padStart(2, '0') + ' // ' + String(this.v.artistObj.name || '').toUpperCase();
  };
  Player.prototype.osd = function (msg) {
    this.osdCanal.textContent = msg;
    this.timer('osd', () => { this.osdCanal.textContent = ''; }, 2500);
  };
  Player.prototype.osdModo = function (msg, ms) {
    this.osdModoEl.textContent = msg || '';
    clearTimeout(this._t.modo);
    if (ms) this.timer('modo', () => { this.osdModoEl.textContent = this.video.paused && this.v.hasFile && !this.video.ended ? '❚❚ PAUSA' : ''; }, ms);
  };
 
  /* ---------- chuvisco (o mesmo do player original) ---------- */
  Player.prototype.ajustarRuido = function () {
    const c = this.noise;
    c.width = Math.max(1, Math.floor(c.clientWidth / 2));
    c.height = Math.max(1, Math.floor(c.clientHeight / 2));
  };
  Player.prototype.desenharRuido = function () {
    const c = this.noise;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(c.width, c.height);
    const buf = new Uint32Array(img.data.buffer);
    for (let i = 0; i < buf.length; i++) {
      if (Math.random() < 0.5) buf[i] = 0xff000000;
      else { const g = Math.floor(Math.random() * 225) + 30; buf[i] = (0xff << 24) | (g << 16) | (g << 8) | g; }
    }
    ctx.putImageData(img, 0, 0);
  };
  Player.prototype.glitch = function (ms) {
    this.ajustarRuido();
    this.noise.classList.add('ativo');
    if (!this._ruido) this._ruido = setInterval(() => this.desenharRuido(), 50);
    this.desenharRuido();
    this.timer('ruido', () => {
      this.noise.classList.remove('ativo');
      clearInterval(this._ruido);
      this._ruido = null;
    }, ms || 350);
  };
 
  /* ---------- tela "sem sinal" para registros que ainda não têm arquivo ---------- */
  Player.prototype.semSinal = function () {
    const v = this.v;
    const box = this.$('.vr-semsinal');
    const titulo = v.status === 'procura-se' ? 'PROCURA-SE ESTA FITA' : 'NA FILA DO ACERVO';
    const sub = v.status === 'procura-se'
      ? 'Sabemos que este registro existe, mas ainda não temos uma cópia.'
      : 'Este registro já foi separado pelo curador e o arquivo ainda vai ser enviado.';
    // com capa, a tela azul fica por cima dela, meio transparente (como um quadro congelado do videocassete)
    if (v.thumb) {
      // endereço completo: dentro de uma variável CSS, um caminho relativo seria lido a partir da pasta css/
      let url = String(v.thumb);
      try { url = new URL(url, location.href).href; } catch (e) { /* fica como está */ }
      box.classList.add('vr-ss-capa');
      box.style.setProperty('--capa', 'url("' + url.replace(/["\\\n]/g, '') + '")');
    }
    box.innerHTML =
      '<div class="vr-ss-topo"><span>' + esc(AMB.STATUS[v.status] ? AMB.STATUS[v.status].t.toUpperCase() : '') + '</span></div>' +
      '<div class="vr-ss-meio"><b>' + titulo + '</b>' +
        '<span class="vr-ss-nome">' + esc(v.artistObj.name) + ' — ' + esc(v.title) + (v.year ? ' (' + esc(v.year) + ')' : '') + '</span>' +
        '<span class="vr-ss-sub">' + esc(sub) + '</span>' +
        '<button type="button" data-acao="tenho" data-video="' + esc(v.id) + '">TENHO ESSA GRAVAÇÃO</button></div>' +
      '<div class="vr-ss-base">SEM SINAL</div>';
    box.hidden = false;
    this.$('.vr-grande').hidden = true;
    this.tv.classList.add('vr-sem-arquivo');
  };
 
  /* ---------- vídeo, áudios e sincronia ---------- */
  Player.prototype.preparar = function () {
    const video = this.video;
    if (this.v.thumb) video.poster = this.v.thumb;
    video.volume = this.volume;
    this.carregando(true);
    Promise.all(this.fontes.map((u) => AMB.iaFontes(u))).catch(() => [this.fontes])
      .then((listas) => { if (!this.morto) this.comecar(unicos([].concat.apply([], listas))); });
  };
  Player.prototype.comecar = function (fontes) {
    const video = this.video;
    if (fontes.length) this.fontes = fontes;
    video.src = this.fontes[0];
    this.carregando(false);
    // Sempre começa no áudio de melhor qualidade (o do disco); o áudio original da fita fica só como opção.
    const DA_FITA = ['vhs', 'tv', 'fita'];
    const melhor = this.tracks.find((t) => !DA_FITA.includes(t.kind)) || this.tracks[0];
    const alvo = melhor && melhor.id;
    if (alvo) this.selecionar(alvo, true); else this.aplicarSom();
    if (this.opts.autoplay) {
      const p = video.play();
      if (p && p.catch) p.catch(() => { this.$('.vr-grande').hidden = false; });
    }
    this._sync = setInterval(() => this.sincronizar(), 250);
  };
 
  Player.prototype.audioDe = function (t) {
    if (!t || t.embedded || !t.url) return null;
    if (this.ext[t.id]) return this.ext[t.id];
    const a = new Audio();
    a.preload = 'auto';
    try { a.preservesPitch = true; a.mozPreservesPitch = true; a.webkitPreservesPitch = true; } catch (e) { /* navegador antigo */ }
    this.audFontes[t.id] = { l: iaFontesJa(t.url), i: 0 };
    a.src = this.audFontes[t.id].l[0];
    // Travadas curtas (logo depois de um salto) se resolvem sozinhas: só pausa a imagem se o áudio
    // ficar carregando por mais de 0,7 s, e volta assim que ele tocar.
    this.on(a, 'waiting', () => {
      if (a !== this.extAtivo || this.video.paused) return;
      this.timer('espera', () => {
        if (a !== this.extAtivo || this.video.paused || a.readyState >= 3) return;
        this.pausadoPeloAudio = true;
        this.video.pause();
        this.carregando(true);
        // continua sem chegar nada: tenta o outro servidor
        this.timer('audtrava', () => {
          if (a === this.extAtivo && this.pausadoPeloAudio && a.readyState < 3) this.outroServidorAudio(t, a);
        }, 10000);
      }, 700);
    });
    const retomar = () => {
      clearTimeout(this._t.espera);
      if (a !== this.extAtivo || !this.pausadoPeloAudio) return;
      this.pausadoPeloAudio = false;
      this.carregando(false);
      const p = this.video.play();
      if (p && p.catch) p.catch(() => {});
    };
    this.on(a, 'playing', retomar);
    this.on(a, 'canplay', () => {
      if (a === this.extAtivo && this.pausadoPeloAudio && a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => {}); }
    });
    this.on(a, 'error', () => {
      if (a !== this.extAtivo) return;
      if (this.outroServidorAudio(t, a)) return;
      this.osd('ÁUDIO INDISPONÍVEL');
      this.pausadoPeloAudio = false;
      this.carregando(false);
      if (this.tracks[0] && this.tracks[0] !== t) this.selecionar(this.tracks[0].id, true);
      this.osdModo('ÁUDIO DA FITA INDISPONÍVEL', 3500);
    });
    this.ext[t.id] = a;
    return a;
  };
 
  // Passa o áudio separado para o próximo servidor da lista; devolve false se já tentou todos
  Player.prototype.outroServidorAudio = function (t, a) {
    const f = this.audFontes[t.id];
    if (!f || f.i + 1 >= f.l.length) return false;
    f.i++;
    a.src = f.l[f.i];
    a.addEventListener('loadedmetadata', () => {
      this.saltar(a, this.video.currentTime);
      if (a === this.extAtivo && (!this.video.paused || this.pausadoPeloAudio)) { const p = a.play(); if (p && p.catch) p.catch(() => {}); }
    }, { once: true });
    a.load();
    return true;
  };
 
  // Leva o áudio separado para o tempo t (marca a hora do salto, para não saltar de novo em seguida)
  Player.prototype.saltar = function (a, t) {
    if (!a) return;
    try { a.currentTime = Math.max(0, t); this._salto = performance.now(); } catch (e) { /* ainda sem dados */ }
  };
 
  Player.prototype.aplicarSom = function () {
    const ext = this.extAtivo;
    if (ext) {
      this.video.muted = true;
      ext.volume = this.volume;
      ext.muted = this.mudo;
    } else {
      this.video.muted = this.mudo;
      this.video.volume = this.volume;
    }
    const b = this.$('.vr-mudo');
    if (b) {
      const calado = this.mudo || this.volume === 0;
      b.innerHTML = calado ? ICONE.mudo : ICONE.som;
      b.setAttribute('aria-label', calado ? 'Ligar o som' : 'Tirar o som');
    }
  };
 
  // Troca a faixa de áudio. Chamada de dentro do clique: o navegador deixa o novo áudio tocar na hora.
  Player.prototype.selecionar = function (id, quieto) {
    const t = this.tracks.find((x) => x.id === id) || this.tracks[0];
    if (!t) return;
    this.track = t;
    const novo = this.audioDe(t);
    Object.keys(this.ext).forEach((k) => { if (this.ext[k] !== novo) { try { this.ext[k].pause(); } catch (e) { /* ok */ } } });
    this.extAtivo = novo;
    this.pausadoPeloAudio = false;
    if (novo) {
      try { novo.playbackRate = this.video.playbackRate || 1; } catch (e) { /* ok */ }
      // tocando: mira um pouco à frente, porque o áudio leva ~0,1 s para começar depois do salto
      if (Math.abs(novo.currentTime - this.video.currentTime) > 0.05) this.saltar(novo, this.video.currentTime + (this.video.paused ? 0 : 0.08));
      if (!this.video.paused) { const p = novo.play(); if (p && p.catch) p.catch(() => {}); }
    }
    this.aplicarSom();
    this.root.querySelectorAll('[data-a="audio"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === t.id)));
    if (!quieto) {
      this.glitch(180);
      this.osdModo('ÁUDIO: ' + String(t.label || t.short).toUpperCase(), 2600);
    }
    if (this.opts.onTrack) this.opts.onTrack(t);
  };
  Player.prototype.proximaFaixa = function () {
    if (this.tracks.length < 2) return;
    const i = this.tracks.indexOf(this.track);
    this.selecionar(this.tracks[(i + 1) % this.tracks.length].id);
  };
 
  // Corrige a diferença entre o áudio separado e a imagem
  Player.prototype.sincronizar = function () {
    const a = this.extAtivo, v = this.video;
    if (!a || v.paused || v.seeking || a.seeking || this.pausadoPeloAudio || a.readyState < 3) return;
    if (a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => {}); return; }
    const base = v.playbackRate || 1;
    const d = a.currentTime - v.currentTime;
    if (Math.abs(d) > 0.25) {
      // longe demais: salta (no máximo uma vez a cada 1,5 s; o pulinho à frente compensa o tempo do salto)
      if (performance.now() - (this._salto || 0) > 1500) this.saltar(a, v.currentTime + 0.04);
      a.playbackRate = base;
    } else if (Math.abs(d) > 0.025) {
      a.playbackRate = base * (1 - clamp(d * 0.6, -0.03, 0.03)); // perto: acelera ou freia um pouco, sem salto
    } else if (a.playbackRate !== base) {
      a.playbackRate = base;
    }
  };
 
  Player.prototype.carregando = function (sim) {
    const el = this.$('.vr-carregando');
    if (!sim) { clearTimeout(this._t.carr); el.hidden = true; return; }
    this.timer('carr', () => { el.hidden = false; }, 350);
  };
 
  /* ---------- comandos ---------- */
  Player.prototype.tocar = function () {
    if (!this.v.hasFile) return;
    const v = this.video;
    if (v.ended) v.currentTime = 0;
    this.esconderFim();
    const p = v.play();
    if (p && p.catch) p.catch(() => { this.$('.vr-grande').hidden = false; });
    this.pausadoPeloAudio = false;
    const a = this.extAtivo;
    if (a) { // dentro do clique: libera o áudio separado no iPhone
      if (Math.abs(a.currentTime - v.currentTime) > 0.25) this.saltar(a, v.currentTime);
      const q = a.play();
      if (q && q.catch) q.catch(() => {});
    }
  };
  Player.prototype.alternar = function () {
    if (!this.v.hasFile) return;
    if (this.pausadoPeloAudio) { // estava esperando o áudio carregar: o clique quer pausar
      this.pausadoPeloAudio = false;
      clearTimeout(this._t.espera);
      if (this.extAtivo) this.extAtivo.pause();
      this.carregando(false);
      this.osdModo('❚❚ PAUSA', 0);
      return;
    }
    if (this.video.paused || this.video.ended) this.tocar(); else this.video.pause();
  };
  Player.prototype.pular = function (s) {
    if (!this.v.hasFile || !isFinite(this.video.duration)) return;
    this.video.currentTime = clamp(this.video.currentTime + s, 0, Math.max(0, this.video.duration - 0.1));
    this.osdModo((s > 0 ? '▶▶ ' : '◀◀ ') + Math.abs(s) + ' s', 1200);
  };
  Player.prototype.alternarMudo = function () {
    this.mudo = !this.mudo;
    if (!this.mudo && this.volume === 0) { this.volume = 0.6; this.$('.vr-vol').value = 60; }
    this.aplicarSom();
    this.osdModo(this.mudo ? 'SEM SOM' : 'SOM: ' + Math.round(this.volume * 100), 1500);
  };
  Player.prototype.alternarCRT = function () {
    this.crt = !this.crt;
    this.tv.classList.toggle('vr-crt-off', !this.crt);
    const st = this.$('.vr-crt-status');
    st.textContent = this.crt ? 'SIM' : 'NÃO';
    st.className = 'vr-crt-status ' + (this.crt ? 'vr-on' : 'vr-off');
    AMB.store.set('amb.crt', this.crt);
    this.osd(this.crt ? 'FILTRO CRT LIGADO' : 'FILTRO CRT DESLIGADO');
  };
  Player.prototype.reiniciar = function () {
    this.glitch();
    this.esconderFim();
    if (!this.v.hasFile) { this.osd('SEM SINAL'); return; }
    this.$('.vr-erro').classList.remove('ativo');
    if (this.video.error) { this.falhas = 0; this.trocarFonte(this.fonteIdx, 0); return; }
    this.video.currentTime = 0;
    this.tocar();
    this.osd('PLAYER REINICIADO');
  };
  Player.prototype.trocarFonte = function (i, tempo, continuar) {
    this.fonteIdx = i;
    this._tempoAlvo = tempo || 0;
    this._recuperando = continuar !== false;
    this.video.src = this.fontes[i];
    const ir = () => {
      try { this.video.currentTime = this._tempoAlvo; } catch (e) { /* ok */ }
      if (continuar !== false) this.tocar();
    };
    this.video.addEventListener('loadedmetadata', ir, { once: true });
    this.video.load();
    if (continuar !== false) this.vigiar();
  };
 
  // O vídeo deveria estar tocando mas está esperando dados. Se nada chegar em 8 s (ou se continuar
  // travado por 25 s, mesmo chegando aos pouquinhos), reconecta, pulando para o outro servidor.
  Player.prototype.vigiar = function () {
    if (this._travaDesde) return;
    this._travaDesde = this._dados = performance.now();
    const checar = () => {
      if (!this._travaDesde) return;
      const v = this.video, agora = performance.now();
      if (v.paused && !this._recuperando) { this.desvigiar(); return; }
      if (v.readyState >= 3 && !v.seeking) { this.desvigiar(); return; }
      if (agora - this._dados > 8000 || agora - this._travaDesde > 25000) { this.desvigiar(); this.recuperar(); return; }
      this.timer('trava', checar, 1000);
    };
    this.timer('trava', checar, 1000);
  };
  Player.prototype.desvigiar = function () { this._travaDesde = 0; clearTimeout(this._t.trava); };
 
  Player.prototype.recuperar = function () {
    if (!this.v.hasFile || this.morto) return;
    const v = this.video;
    const tempo = v.readyState > 0 ? v.currentTime : (this._tempoAlvo || 0);
    const continuar = !v.paused || !!this._recuperando;
    this.falhas++;
    // dá duas voltas por todos os servidores antes de desistir
    if (this.falhas > Math.max(2, this.fontes.length * 2)) {
      this._recuperando = false;
      this.carregando(false);
      this.glitch();
      this.$('.vr-erro-msg').textContent = 'Não foi possível carregar o vídeo agora. O Internet Archive pode estar lento ou fora do ar; tente de novo em alguns minutos.';
      this.$('.vr-erro').classList.add('ativo');
      return;
    }
    this._recuperando = continuar;
    this.osd(this.fontes.length > 1 ? 'TROCANDO DE SERVIDOR' : 'RECONECTANDO');
    this.glitch();
    const prox = (this.fonteIdx + 1) % this.fontes.length;
    // espera um pouco a cada volta completa, para não martelar um servidor fora do ar
    const pausa = prox === 0 ? 1500 : 0;
    this.timer('reconectar', () => this.trocarFonte(prox, tempo, continuar), pausa);
  };
 
  /* ---------- tela cheia (nativa; "falsa" no iPhone, como no original) ---------- */
  Player.prototype.telaCheia = function () { return this.screen.classList.contains('vr-tela-cheia'); };
  Player.prototype.entrarTelaCheia = function () {
    const t = this.screen;
    const pedir = t.requestFullscreen || t.webkitRequestFullscreen;
    t.classList.add('vr-tela-cheia');
    this.mexendo();
    if (!pedir) { t.classList.add('vr-fake'); document.documentElement.classList.add('vr-trava'); return; }
    try {
      const r = pedir.call(t);
      if (r && r.catch) r.catch(() => { t.classList.add('vr-fake'); document.documentElement.classList.add('vr-trava'); });
    } catch (e) { t.classList.add('vr-fake'); document.documentElement.classList.add('vr-trava'); }
    setTimeout(() => this.ajustarRuido(), 300);
  };
  Player.prototype.sairTelaCheia = function () {
    const t = this.screen;
    t.classList.remove('vr-tela-cheia', 'vr-fake');
    document.documentElement.classList.remove('vr-trava');
    const nativa = document.fullscreenElement || document.webkitFullscreenElement;
    const sair = document.exitFullscreen || document.webkitExitFullscreen;
    if (nativa === t && sair) { try { const r = sair.call(document); if (r && r.catch) r.catch(() => {}); } catch (e) { /* ok */ } }
    setTimeout(() => this.ajustarRuido(), 300);
  };
  Player.prototype.alternarTela = function () { if (this.telaCheia()) this.sairTelaCheia(); else this.entrarTelaCheia(); };
  Player.prototype.mexendo = function () {
    this.screen.classList.add('vr-mexendo');
    this.timer('mexe', () => this.screen.classList.remove('vr-mexendo'), 2500);
  };
 
  /* ---------- fim da fita: próxima automática com aviso ---------- */
  Player.prototype.fimDaFita = function () {
    const prox = this.opts.next;
    const box = this.$('.vr-fim');
    if (!prox || !this.opts.autoNext) {
      this.osdModo('FIM DA FITA', 0);
      this.$('.vr-grande').hidden = false;
      return;
    }
    let n = 5;
    const desenha = () => {
      box.innerHTML = '<span class="vr-fim-rot">PRÓXIMA FITA EM ' + n + '</span>' +
        '<strong>' + esc(prox.artistObj.name) + ' — ' + esc(prox.title) + '</strong>' +
        '<span class="vr-fim-acoes"><button type="button" data-a="next">IR AGORA</button><button type="button" data-a="cancelar">CANCELAR</button></span>';
    };
    desenha();
    box.hidden = false;
    clearInterval(this._fim);
    this._fim = setInterval(() => {
      n--;
      if (n <= 0) { clearInterval(this._fim); this._fim = null; if (this.opts.onNext) this.opts.onNext(true); return; }
      desenha();
    }, 1000);
  };
  Player.prototype.esconderFim = function () {
    clearInterval(this._fim);
    this._fim = null;
    const box = this.$('.vr-fim');
    if (box) box.hidden = true;
  };
 
  /* ---------- interface ---------- */
  Player.prototype.atualizarTempo = function () {
    const v = this.video;
    const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : (this.v.duration || 0);
    this.$('.vr-t-atual').textContent = AMB.fmtDur(v.currentTime);
    this.$('.vr-t-total').textContent = AMB.fmtDur(dur);
    if (!this.arrastando && dur) {
      const f = clamp(v.currentTime / dur, 0, 1);
      this.seekIn.value = Math.round(f * 1000);
      this.$('.vr-seek-pos').style.width = (f * 100).toFixed(2) + '%';
    }
  };
  Player.prototype.atualizarBuffer = function () {
    const v = this.video;
    try {
      if (!v.buffered.length || !isFinite(v.duration)) return;
      const fim = v.buffered.end(v.buffered.length - 1);
      this.$('.vr-seek-buf').style.width = clamp(fim / v.duration * 100, 0, 100).toFixed(1) + '%';
    } catch (e) { /* ok */ }
  };
  Player.prototype.iconePP = function () {
    const tocando = !this.video.paused && !this.video.ended;
    const b = this.$('.vr-pp');
    b.innerHTML = tocando ? ICONE.pause : ICONE.play;
    b.setAttribute('aria-label', tocando ? 'Pausar' : 'Tocar');
    this.tv.classList.toggle('vr-tocando', tocando);
  };
 
  Player.prototype.bind = function () {
    const video = this.video;
    // botões (um ouvinte só, pelo atributo data-a)
    this.on(this.root, 'click', (e) => {
      const b = e.target.closest('[data-a]');
      if (!b || !this.root.contains(b)) return;
      const a = b.dataset.a;
      if (a !== 'som') AMB.clique();
      switch (a) {
        case 'pp': this.alternar(); break;
        case 'audio': this.selecionar(b.dataset.id); break;
        case 'mudo': this.alternarMudo(); break;
        case 'power': this.reiniciar(); break;
        case 'crt': this.alternarCRT(); break;
        case 'prev': if (this.opts.onPrev && this.opts.prev) this.opts.onPrev(); break;
        case 'next': this.esconderFim(); if (this.opts.onNext && this.opts.next) this.opts.onNext(); break;
        case 'cancelar': this.esconderFim(); this.osdModo('FIM DA FITA', 0); this.$('.vr-grande').hidden = false; break;
        case 'tela': this.alternarTela(); break;
        case 'tentar': this.$('.vr-erro').classList.remove('ativo'); this.falhas = 0; this.trocarFonte(0, video.readyState > 0 ? video.currentTime : (this._tempoAlvo || 0)); break;
        case 'som': {
          const ligado = !AMB.somBotoes();
          AMB.store.set('amb.somBotoes', ligado);
          b.innerHTML = 'SOM BOTÕES: <span class="' + (ligado ? 'vr-on">ON' : 'vr-off">OFF') + '</span>';
          AMB.clique();
          break;
        }
        default: break;
      }
    });
    // clicar na imagem pausa/retoma; dois cliques = tela cheia
    const sensor = this.$('.vr-sensor');
    this.on(sensor, 'click', () => { this.mexendo(); this.alternar(); });
    this.on(sensor, 'dblclick', () => this.alternarTela());
    this.on(sensor, 'mousemove', () => this.mexendo());
    this.on(sensor, 'touchstart', () => this.mexendo(), { passive: true });
    this.on(this.$('.vr-transporte'), 'mousemove', () => this.mexendo());
 
    // barra de posição
    const seek = this.seekIn;
    this.on(seek, 'input', () => {
      this.arrastando = true;
      const dur = video.duration || this.v.duration || 0;
      const f = seek.value / 1000;
      this.$('.vr-seek-pos').style.width = (f * 100).toFixed(2) + '%';
      this.$('.vr-t-atual').textContent = AMB.fmtDur(f * dur);
    });
    this.on(seek, 'change', () => {
      this.arrastando = false;
      if (isFinite(video.duration)) video.currentTime = (seek.value / 1000) * video.duration;
    });
    // volume
    const vol = this.$('.vr-vol');
    this.on(vol, 'input', () => {
      this.volume = clamp(vol.value / 100, 0, 1);
      this.mudo = this.volume === 0;
      AMB.store.set('amb.volume', this.volume);
      this.aplicarSom();
    });
 
    // eventos do vídeo
    this.on(video, 'play', () => {
      if (video.readyState < 3) this.vigiar();
      this.iconePP();
      this.$('.vr-grande').hidden = true;
      if (!this.pausadoPeloAudio) this.osdModo('▶ PLAY', 1800);
      const a = this.extAtivo;
      if (a && a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => {}); }
      if (this.primeiroPlay) {
        this.primeiroPlay = false;
        this.tracks.forEach((t) => { if (!t.embedded) { const el = this.audioDe(t); if (el && el.preload !== 'auto') el.preload = 'auto'; } });
        this.mediaSession();
      }
    });
    this.on(video, 'pause', () => {
      this.iconePP();
      if (this.extAtivo && !this.pausadoPeloAudio) this.extAtivo.pause();
      if (!this.pausadoPeloAudio && !video.ended) this.osdModo('❚❚ PAUSA', 0);
    });
    this.on(video, 'playing', () => {
      this.carregando(false);
      this.desvigiar();
      this.falhas = 0;
      this._recuperando = false;
      this._ultimo = video.currentTime;
      const a = this.extAtivo;
      if (a && a.paused && !this.pausadoPeloAudio) { const p = a.play(); if (p && p.catch) p.catch(() => {}); }
    });
    this.on(video, 'waiting', () => {
      this.carregando(true);
      if (!video.paused) this.vigiar();
      if (this.extAtivo) this.extAtivo.pause();
    });
    this.on(video, 'seeking', () => { if (this.extAtivo) this.extAtivo.pause(); });
    this.on(video, 'seeked', () => {
      const a = this.extAtivo;
      this._ultimo = video.currentTime;
      if (!a) return;
      this.saltar(a, video.currentTime);
      if (!video.paused) { const p = a.play(); if (p && p.catch) p.catch(() => {}); }
    });
    this.on(video, 'ratechange', () => { if (this.extAtivo) this.extAtivo.playbackRate = video.playbackRate; });
    this.on(video, 'timeupdate', () => {
      this.atualizarTempo();
      // conta a exibição depois de 5 s realmente assistidos
      if (!video.paused && !video.seeking) {
        const d = video.currentTime - (this._ultimo || 0);
        if (d > 0 && d < 1.5) this.assistido += d;
        this._ultimo = video.currentTime;
        if (!this.contou && this.assistido >= 5) { this.contou = true; if (this.opts.onCount) this.opts.onCount(this.v); }
      }
    });
    this.on(video, 'progress', () => { this._dados = performance.now(); this.atualizarBuffer(); });
    this.on(video, 'loadedmetadata', () => { this.atualizarTempo(); this.atualizarBuffer(); });
    this.on(video, 'ended', () => {
      this.iconePP();
      if (this.extAtivo) this.extAtivo.pause();
      this.fimDaFita();
    });
    this.on(video, 'error', () => {
      if (!this.v.hasFile || !video.getAttribute('src')) return;
      this.desvigiar();
      this.recuperar();
    });
 
    // tela cheia
    const aoMudar = () => {
      const t = this.screen;
      if (!t.classList.contains('vr-tela-cheia')) return;
      const nativa = document.fullscreenElement || document.webkitFullscreenElement;
      if (nativa !== t && !t.classList.contains('vr-fake')) t.classList.remove('vr-tela-cheia');
      this.ajustarRuido();
    };
    this.on(document, 'fullscreenchange', aoMudar);
    this.on(document, 'webkitfullscreenchange', aoMudar);
    this.on(window, 'resize', () => this.ajustarRuido());
  };
 
  Player.prototype.mediaSession = function () {
    try {
      if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
      const v = this.v;
      const arte = v.thumb && !/^data:/.test(v.thumb) ? [{ src: new URL(v.thumb, location.href).href }] : [];
      navigator.mediaSession.metadata = new MediaMetadata({ title: v.title, artist: v.artistObj.name, album: AMB.cfg('SITE_NAME', 'Ambário'), artwork: arte });
      navigator.mediaSession.setActionHandler('play', () => this.tocar());
      navigator.mediaSession.setActionHandler('pause', () => this.video.pause());
      navigator.mediaSession.setActionHandler('nexttrack', this.opts.next ? () => this.opts.onNext() : null);
      navigator.mediaSession.setActionHandler('previoustrack', this.opts.prev ? () => this.opts.onPrev() : null);
    } catch (e) { /* opcional */ }
  };
 
  Player.prototype.destroy = function () {
    this.morto = true;
    Object.keys(this._t).forEach((k) => clearTimeout(this._t[k]));
    clearInterval(this._sync); clearInterval(this._ruido); clearInterval(this._fim);
    if (this.telaCheia()) this.sairTelaCheia();
    this._off.forEach((f) => f());
    this._off = [];
    try { this.video.pause(); this.video.removeAttribute('src'); this.video.load(); } catch (e) { /* ok */ }
    Object.keys(this.ext).forEach((k) => { try { this.ext[k].pause(); this.ext[k].removeAttribute('src'); this.ext[k].load(); } catch (e) { /* ok */ } });
    this.ext = {};
    try { if ('mediaSession' in navigator) navigator.mediaSession.metadata = null; } catch (e) { /* ok */ }
  };
 
  AMB.Player = { create: (root, opts) => new Player(root, opts), ICONE };
})();
