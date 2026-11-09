/*
 * Ambário — área do curador (endereço do site + #admin).
 *
 * Lista, inclui, edita e apaga vídeos, artistas (com discografia) e acervos, e troca capas enviando uma
 * imagem. Com o token do GitHub conectado, cada "Salvar" vira um commit no repositório do site (o site
 * público atualiza em 1 ou 2 minutos). Sem token, as alterações ficam guardadas só neste navegador até
 * serem publicadas (conectando o token depois ou baixando um pacote .zip para subir pelo site do GitHub).
 *
 * Telas: admin (vídeos) · admin/video/<id|novo> · admin/artistas · admin/artista/<id|novo>
 *        admin/acervos · admin/acervo/<id|novo> · admin/publicar
 */
(function () {
  'use strict';
  const AMB = window.AMB;
  const esc = AMB.esc;
  const V = AMB.V;
  const GH = AMB.GH;

  // estado da tela aberta
  const E = { sujo: false, flash: null, capaNova: null, capaRemovida: false, fotoNova: null, ocupado: false };

  /* =================== utilidades =================== */
  const clone = (o) => (o == null ? o : JSON.parse(JSON.stringify(o)));
  const linhas = (t) => String(t || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  // Campo "em inglês" de um texto (vazio = tradução automática ao salvar)
  const campoEn = (nome, rotulo, valor, rows) => campo(nome + '_en', rotulo + ' (em inglês)', valor || '', { tipo: 'textarea', rows: rows || 2,
    ajuda: '(aparece no site em inglês; deixe vazio para traduzir automaticamente ao salvar)' });
  // Preenche os campos _en: mantém o que foi escrito à mão; traduz quando está vazio ou quando o português
  // mudou e o inglês continua o de antes (ficaria desatualizado).
  async function completarIngles(o, original, campos, msg) {
    for (const k of campos) {
      const pt = o[k];
      const enK = k + '_en';
      if (!pt) { delete o[enK]; continue; }
      const antigo = original ? original[enK] || '' : '';
      const ptMudou = !original || original[k] !== pt;
      if (o[enK] && !(ptMudou && o[enK] === antigo)) continue;
      if (msg) { msg.className = 'form-msg adm-msg'; msg.textContent = 'Traduzindo para o inglês…'; }
      try { o[enK] = await AMB.traduzir(pt); } catch (e) { delete o[enK]; } // sem tradutor: o site traduz na hora
    }
  }
  function put(o, k, x) {
    const vazio = x === '' || x == null || (Array.isArray(x) && !x.length) || (typeof x === 'object' && !Array.isArray(x) && !Object.keys(x).length);
    if (vazio) delete o[k]; else o[k] = x;
  }
  function ordenar(o, ordem) {
    const n = {};
    ordem.forEach((k) => { if (o[k] !== undefined) n[k] = o[k]; });
    Object.keys(o).forEach((k) => { if (!(k in n) && o[k] !== undefined) n[k] = o[k]; });
    return n;
  }
  const ORDEM_VIDEO = ['id', 'artist', 'artist_name', 'song', 'song_title', 'ver', 'title', 'kind', 'date', 'program', 'channel', 'director', 'status',
    'capa', 'fit', 'aspect', 'duration', 'file', 'audio', 'credits', 'source', 'description', 'description_en', 'note', 'note_en', 'src', 'refs', 'tags', 'test', 'added', 'added_by'];
  const ORDEM_ARTISTA = ['id', 'name', 'photo', 'alt', 'country', 'origin', 'years', 'members', 'intro', 'intro_en', 'src', 'releases'];
  const ORDEM_DISCO = ['id', 'type', 'title', 'credit', 'year', 'date', 'label', 'format', 'partial', 'note', 'src', 'tracks'];
  const ORDEM_ACERVO = ['id', 'name', 'roles', 'since', 'city', 'bio', 'bio_en', 'links', 'avatar'];

  function normData(t) {
    t = String(t || '').trim();
    let m;
    if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(t))) return m[3] + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
    if ((m = /^(\d{1,2})\/(\d{4})$/.exec(t))) return m[2] + '-' + m[1].padStart(2, '0');
    return t;
  }
  const dataOk = (t) => !t || /^\d{4}(-\d{2}(-\d{2})?)?$/.test(t);
  function durDeTexto(t) {
    t = String(t || '').trim();
    if (!t) return 0;
    if (/^\d+(\.\d+)?$/.test(t)) return Math.round(Number(t));
    return AMB.parseDur(t) || 0;
  }

  // Fontes: uma por linha — o id de uma fonte cadastrada, ou "Título | https://link"
  function fontesParaTexto(lista) {
    return (lista || []).map((s) => {
      if (typeof s === 'string') return s;
      if (s && s.u) return (s.t || s.u) + ' | ' + s.u;
      return s && s.t ? s.t : '';
    }).filter(Boolean).join('\n');
  }
  function fontesDeTexto(t, soLinks) {
    return linhas(t).map((l) => {
      if (!soLinks && /^[\w.-]+$/.test(l) && AMB.sources[l]) return l;
      const p = l.split('|').map((s) => s.trim());
      if (p.length > 1 && p[p.length - 1]) return { t: p.slice(0, -1).join(' | ') || p[p.length - 1], u: p[p.length - 1] };
      if (AMB.isUrl(l)) return { t: l.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0], u: l };
      return { t: l };
    });
  }
  const linkOk = (s) => typeof s === 'string' || !s.u || AMB.isUrl(s.u);

  const nomeVideo = (v) => (AMB.artists[v.artist] ? AMB.artists[v.artist].name : v.artist_name || v.artist || '?') + ' — ' + (v.title || v.id);
  const rawVideo = (id) => (AMB.dados.videos || []).find((x) => x && x.id === id) || null;
  const rawArtista = (id) => (AMB.dados.artists || []).find((x) => x && x.id === id) || null;
  const rawAcervo = (id) => (AMB.dados.acervos || []).find((x) => x && x.id === id) || null;

  function idUnico(base, existe) {
    let id = base || 'registro';
    for (let i = 2; existe(id); i++) id = base + '-' + i;
    return id;
  }

  function opcoes(lista, atual, vazio) {
    return (vazio != null ? '<option value="">' + esc(vazio) + '</option>' : '') +
      lista.map(([v, t]) => '<option value="' + esc(v) + '"' + (String(atual == null ? '' : atual) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>').join('');
  }
  // campo de formulário; "rot" é texto fixo (pode ter HTML), o valor é escapado
  function campo(nome, rot, valor, x) {
    x = x || {};
    const ajuda = x.ajuda ? ' <small>' + x.ajuda + '</small>' : '';
    const larga = x.larga ? ' class="larga"' : '';
    const ph = x.ph ? ' placeholder="' + esc(x.ph) + '"' : '';
    if (x.tipo === 'textarea') return '<label class="larga">' + rot + ajuda + '<textarea name="' + nome + '" rows="' + (x.rows || 3) + '"' + ph + '>' + esc(valor || '') + '</textarea></label>';
    if (x.tipo === 'select') return '<label' + larga + '>' + rot + ajuda + '<select name="' + nome + '">' + x.ops + '</select></label>';
    return '<label' + larga + '>' + rot + ajuda + '<input type="' + (x.tipo || 'text') + '" name="' + nome + '" value="' + esc(valor == null ? '' : valor) + '"' + ph +
      (x.list ? ' list="' + x.list + '"' : '') + (x.attrs || '') + '></label>';
  }

  const PAISES = [['BR', 'Brasil'], ['US', 'Estados Unidos'], ['GB', 'Reino Unido'], ['AR', 'Argentina'], ['PT', 'Portugal'], ['DE', 'Alemanha'], ['FR', 'França'],
    ['IT', 'Itália'], ['ES', 'Espanha'], ['MX', 'México'], ['CL', 'Chile'], ['UY', 'Uruguai'], ['CA', 'Canadá'], ['AU', 'Austrália'], ['JP', 'Japão'],
    ['NL', 'Países Baixos'], ['SE', 'Suécia'], ['IE', 'Irlanda'], ['BE', 'Bélgica'], ['CH', 'Suíça'], ['RU', 'Rússia'], ['JM', 'Jamaica']];
  const datalistPaises = () => '<datalist id="adm-paises">' + PAISES.map(([c, n]) => '<option value="' + c + '">' + esc(n) + '</option>').join('') + '</datalist>';
  const datalistAcervos = () => '<datalist id="adm-acervos">' + Object.values(AMB.acervos).map((c) => '<option value="' + esc(c.id) + '">' + esc(c.name) + '</option>').join('') + '</datalist>';

  /* =================== janelas (confirmação) =================== */
  function janela(html, rotulo) {
    const fundo = document.createElement('div');
    fundo.className = 'adm-fundo';
    fundo.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="' + esc(rotulo || 'Confirmação') + '">' + html + '</div>';
    document.body.appendChild(fundo);
    document.documentElement.classList.add('com-modal');
    return fundo;
  }
  function fecharJanela(fundo) {
    fundo.remove();
    if (!document.querySelector('.adm-fundo')) document.documentElement.classList.remove('com-modal');
  }
  // → Promise<objeto com os campos marcados | false>
  function confirmar(o) {
    return new Promise((resolver) => {
      const antes = document.activeElement;
      const fundo = janela('<h2>' + esc(o.titulo) + '</h2>' + (o.html || '') +
        '<div class="form-pe"><button type="button" class="btn ' + (o.perigo ? 'adm-perigo' : 'btn-y') + '" data-j="ok">' + esc(o.ok || 'Confirmar') + '</button>' +
        '<button type="button" class="btn" data-j="nao">' + esc(o.cancelar || 'Cancelar') + '</button></div>', o.titulo);
      const fim = (r) => {
        document.removeEventListener('keydown', tecla, true);
        fecharJanela(fundo);
        if (antes && document.body.contains(antes)) antes.focus();
        resolver(r);
      };
      const tecla = (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fim(false); } };
      document.addEventListener('keydown', tecla, true);
      fundo.addEventListener('click', (e) => {
        const b = e.target.closest('[data-j]');
        if (!b) return;
        if (b.dataset.j === 'nao') { fim(false); return; }
        const marcados = {};
        fundo.querySelectorAll('input[name],textarea[name]').forEach((c) => { marcados[c.name] = c.type === 'checkbox' ? c.checked : c.value; });
        fim(marcados);
      });
      fundo.addEventListener('mousedown', (e) => { if (e.target === fundo) fim(false); });
      (fundo.querySelector('textarea,input:not([type=checkbox])') || fundo.querySelector('[data-j="' + (o.perigo ? 'nao' : 'ok') + '"]')).focus();
    });
  }

  /* =================== salvar (publicar ou guardar aqui) =================== */
  function descreverOp(op) {
    const base = (AMB.local.publicado() || {}).dados || AMB.servido;
    const servido = (lista, id) => (base[lista] || []).some((x) => x && x.id === id);
    switch (op.t) {
      case 'video': return (servido('videos', op.antes || op.id) ? 'Editar' : 'Incluir') + ' vídeo: ' + nomeVideo(op.dados || { id: op.id });
      case 'apagar-video': return 'Apagar vídeo: ' + (op.nome || op.id);
      case 'artista': return (servido('artists', op.antes || op.id) ? 'Editar' : 'Incluir') + ' artista: ' + ((op.dados && op.dados.name) || op.id);
      case 'apagar-artista': return 'Apagar artista: ' + (op.nome || op.id);
      case 'acervo': return (servido('acervos', op.antes || op.id) ? 'Editar' : 'Incluir') + ' acervo: ' + ((op.dados && op.dados.name) || op.id);
      case 'apagar-acervo': return 'Apagar acervo: ' + (op.nome || op.id);
      case 'fonte': return 'Fonte: ' + ((op.dados && op.dados.t) || op.id);
      case 'arquivo': return 'Imagem: ' + GH.semQuery(op.caminho);
      case 'apagar-arquivo': return 'Apagar arquivo: ' + GH.semQuery(op.caminho);
      default: return op.t;
    }
  }
  function mensagemCommit(ops) {
    const principais = ops.filter((o) => o.t !== 'arquivo' && o.t !== 'apagar-arquivo');
    const base = principais.length ? principais : ops;
    return 'Ambário: ' + descreverOp(base[0]).replace(/^./, (c) => c.toLowerCase()) + (base.length > 1 ? ' (+' + (base.length - 1) + ' alterações)' : '') +
      '\n\nFeito pela área do curador (#admin).';
  }

  // ops: as operações desta alteração; ok: texto do aviso de sucesso; depois: para onde ir
  async function salvarOps(ops, o) {
    if (E.ocupado) return;
    const msg = o.msgEl;
    const botoes = o.botoes || [];
    const aviso = (t, tipo) => { if (msg) { msg.className = 'form-msg adm-msg' + (tipo ? ' ' + tipo : ''); msg.innerHTML = t; } };
    const con = GH.conexao();
    if (!con) {
      try { AMB.local.adicionar(ops); } catch (e) {
        aviso('Não deu para guardar neste navegador (sem espaço ou bloqueado). Conecte o token do GitHub para publicar direto.', 'erro');
        return;
      }
      AMB.build();
      E.sujo = false;
      E.flash = { tipo: 'aviso', html: '<b>Guardado neste navegador.</b> ' + esc(o.ok || '') + ' Ainda não está no site público: <a href="#admin/publicar">conecte o token do GitHub ou baixe o pacote</a> para publicar.' };
      location.hash = o.depois;
      return true;
    }
    const pend = AMB.local.pendente();
    const todas = (pend ? pend.ops : []).concat(ops);
    E.ocupado = true;
    botoes.forEach((b) => { b.disabled = true; });
    try {
      const r = await GH.publicar(con, todas, mensagemCommit(todas), (t) => aviso(esc(t)));
      AMB.local.limparPendente();
      AMB.local.salvarPublicado(r.dados, r.commit, todas);
      AMB.build();
      E.sujo = false;
      E.flash = { tipo: 'ok', html: '<b>Publicado!</b> ' + esc(o.ok || '') + ' O site público atualiza sozinho em 1 ou 2 minutos. ' +
        '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">Ver o commit no GitHub ↗</a>' + (o.ver ? ' · <a href="' + esc(o.ver) + '">Ver no site</a>' : '') };
      location.hash = o.depois;
      return true;
    } catch (e) {
      aviso('<b>Não publicou.</b> ' + esc(e.message || String(e)) +
        ' <button type="button" class="btn btn-p" data-adm="guardar-local">Guardar neste navegador por enquanto</button>', 'erro');
      const b = msg && msg.querySelector('[data-adm="guardar-local"]');
      if (b) b.addEventListener('click', (ev) => { ev.stopPropagation(); salvarSemToken(ops, o); });
      return false;
    } finally {
      E.ocupado = false;
      botoes.forEach((b) => { b.disabled = false; });
    }
  }
  function salvarSemToken(ops, o) {
    try { AMB.local.adicionar(ops); } catch (e) { return; }
    AMB.build();
    E.sujo = false;
    E.flash = { tipo: 'aviso', html: '<b>Guardado neste navegador.</b> ' + esc(o.ok || '') + ' Publique depois em <a href="#admin/publicar">Publicar e conexão</a>.' };
    location.hash = o.depois;
  }

  /* =================== moldura da área =================== */
  function cabecalho(sec) {
    const con = GH.conexao();
    const pend = AMB.estado.pendentes;
    const n = { videos: (AMB.dados.videos || []).length, artistas: (AMB.dados.artists || []).length, acervos: (AMB.dados.acervos || []).length };
    const aba = (k, href, t) => '<a class="aba' + (sec === k ? ' ativo' : '') + '" href="' + href + '">' + t + '</a>';
    return '<div class="adm-topo"><h1 class="w-tit">Área do curador</h1>' +
      (con ? '<span class="adm-con adm-con-ok" title="As alterações vão direto para o GitHub">● Conectado ao GitHub como <b>' + esc(con.login || '?') + '</b> · ' + esc(con.repo) + '</span>'
        : '<span class="adm-con">○ Sem conexão com o GitHub: o que você salvar fica só neste navegador. <a href="#admin/publicar">Conectar</a></span>') +
      '</div>' +
      '<nav class="abas adm-abas" aria-label="Seções da área do curador">' +
        aba('videos', '#admin/videos', 'Vídeos (' + n.videos + ')') + aba('artistas', '#admin/artistas', 'Artistas (' + n.artistas + ')') +
        aba('acervos', '#admin/acervos', 'Acervos (' + n.acervos + ')') +
        aba('publicar', '#admin/publicar', 'Publicar e conexão' + (pend ? ' <b class="adm-badge" title="Alterações só neste navegador">' + pend + '</b>' : '')) +
      '</nav>';
  }
  function flash() {
    if (!E.flash) return '';
    const f = E.flash;
    E.flash = null;
    return '<div class="adm-flash adm-flash-' + esc(f.tipo) + '" role="status">' + f.html + '</div>';
  }

  /* =================== vídeos: lista =================== */
  function telaVideos() {
    const lista = (AMB.dados.videos || []).map((r) => AMB.videoById[r.id]).filter(Boolean).slice().reverse();
    return '<section class="box box-azul"><div class="box-h"><h2>Vídeos</h2><span class="box-h-dir">' + V.pl(lista.length, 'registro', 'registros') + ', os mais recentes primeiro</span></div><div class="box-c">' +
      '<div class="adm-barra"><a class="btn btn-y" href="#admin/video/novo">+ Novo vídeo</a>' +
        '<input type="search" class="adm-busca" placeholder="Filtrar por artista, título, ano, programa…" aria-label="Filtrar vídeos">' +
        '<select class="adm-filtro" aria-label="Situação"><option value="">Todas as situações</option>' + Object.keys(AMB.STATUS).map((k) => '<option value="' + k + '">' + esc(AMB.STATUS[k].t) + '</option>').join('') + '</select></div>' +
      (lista.length ? '<div class="adm-lista">' + lista.map((v) =>
        '<div class="adm-item" data-busca="' + esc(AMB.norm([v.artistObj.name, v.title, v.year, v.program, v.channel, v.id].join(' '))) + '" data-st="' + esc(v.status) + '">' +
          V.thumb(v, 's') +
          '<div class="adm-item-txt"><a class="adm-item-tit" href="#admin/video/' + esc(v.id) + '">' + esc(v.artistObj.name) + ' — ' + esc(v.title) + '</a> ' + V.selo(v.status) +
            (v.draft ? ' <span class="adm-rasc" title="Alterado só neste navegador">não publicado</span>' : '') +
            '<span class="mini">' + esc([v.kindLabel, v.date ? AMB.fmtDate(v.date) : '', v.program, v.duration ? AMB.fmtDur(v.duration) : ''].filter(Boolean).join(' · ')) + '</span>' +
            '<span class="mini adm-id">#v-' + esc(v.id) + (v.thumb ? '' : ' · sem capa') + '</span></div>' +
          '<div class="adm-item-acoes"><a class="btn btn-p" href="#admin/video/' + esc(v.id) + '">Editar</a><a class="btn btn-p" href="#v-' + esc(v.id) + '">Ver</a>' +
            '<button type="button" class="btn btn-p adm-perigo" data-adm="apagar-video" data-id="' + esc(v.id) + '">Apagar</button></div>' +
        '</div>').join('') + '</div><p class="vazio adm-nada" hidden>Nada com esse filtro.</p>' : V.vazio('Nenhum vídeo ainda. <a href="#admin/video/novo">Cadastre o primeiro</a>.')) +
    '</div></section>';
  }
  function ligarLista(root) {
    const busca = root.querySelector('.adm-busca');
    const filtro = root.querySelector('.adm-filtro');
    if (!busca) return;
    const aplicar = () => {
      const q = AMB.norm(busca.value).trim().split(/\s+/).filter(Boolean);
      const st = filtro ? filtro.value : '';
      let n = 0;
      root.querySelectorAll('.adm-item').forEach((el) => {
        const ok = (!st || el.dataset.st === st) && q.every((p) => el.dataset.busca.indexOf(p) >= 0);
        el.hidden = !ok;
        if (ok) n++;
      });
      const nada = root.querySelector('.adm-nada');
      if (nada) nada.hidden = n > 0;
    };
    busca.addEventListener('input', aplicar);
    if (filtro) filtro.addEventListener('change', aplicar);
  }

  async function apagarVideo(id, root) {
    const v = rawVideo(id);
    if (!v) return;
    const capaLocal = v.capa && /^media\//.test(v.capa) ? GH.semQuery(v.capa) : '';
    const usadaPorOutro = capaLocal && (AMB.dados.videos || []).some((x) => x.id !== id && x.capa && GH.semQuery(x.capa) === capaLocal);
    const r = await confirmar({
      titulo: 'Apagar este vídeo?', ok: 'Apagar', perigo: true,
      html: '<p><b>' + esc(nomeVideo(v)) + '</b> sai do site (lista, artista, busca). O endereço #v-' + esc(id) + ' deixa de funcionar. ' +
        'Os comentários que ele tinha continuam guardados na planilha.</p>' +
        (capaLocal && !usadaPorOutro ? '<label class="adm-check"><input type="checkbox" name="capa" checked> Apagar também a capa (' + esc(capaLocal) + ')</label>' : '') +
        (v.file && v.file.ia ? '<p class="mini">O item no Internet Archive (' + esc(v.file.ia) + ') não é apagado.</p>' : '')
    });
    if (!r) return;
    const ops = [{ t: 'apagar-video', id, nome: nomeVideo(v) }];
    if (r.capa && capaLocal && !usadaPorOutro) ops.push({ t: 'apagar-arquivo', caminho: capaLocal });
    const msgEl = root.querySelector('.adm-msg') || (() => { const p = document.createElement('p'); p.className = 'form-msg adm-msg'; root.querySelector('.adm-topo').after(p); return p; })();
    E.sujo = false;
    const antes = location.hash;
    if (await salvarOps(ops, { msgEl, ok: '“' + nomeVideo(v) + '” foi apagado.', depois: '#admin/videos' }) && location.hash === antes) AMB.render();
  }

  /* =================== Discogs: puxar o disco de um link ===================
   * Usa a API pública do Discogs (sem token, ~25 pedidos por minuto). Aceita link de release ou de master
   * (no master, usa o lançamento principal). Devolve o disco já no formato da discografia do Ambário.
   */
  const DISCOGS_API = 'https://api.discogs.com/';
  function discogsAlvo(txt) {
    const s = String(txt || '').trim();
    let m = s.match(/discogs\.com\/(?:[a-z]{2}\/)?(?:[^/]+\/)?(release|master)\/(\d+)/i);
    if (m) return { tipo: m[1].toLowerCase(), id: m[2] };
    m = s.match(/^\[?([rm])(\d+)\]?$/i); // [r123456] ou m12345
    if (m) return { tipo: m[1].toLowerCase() === 'm' ? 'master' : 'release', id: m[2] };
    if (/^\d+$/.test(s)) return { tipo: 'release', id: s };
    return null;
  }
  async function discogsGet(caminho) {
    const r = await fetch(DISCOGS_API + caminho, { headers: { Accept: 'application/vnd.discogs.v2.discogs+json' } });
    if (r.status === 404) throw new Error('Esse disco não foi encontrado no Discogs. Confira o link.');
    if (r.status === 429) throw new Error('O Discogs pediu para esperar um pouco (muitos pedidos). Tente de novo em 1 minuto.');
    if (!r.ok) throw new Error('O Discogs não respondeu agora (erro ' + r.status + '). Tente de novo.');
    return r.json();
  }
  const semNumeroDiscogs = (n) => String(n || '').replace(/\s*\(\d+\)$/, '').replace(/\*$/, '').trim();
  let codigosPais = null;
  function paisDoDiscogs(nome) { // "Brazil" → "BR"
    if (!nome) return '';
    if (!codigosPais) {
      codigosPais = {};
      try {
        const dn = new Intl.DisplayNames(['en'], { type: 'region' });
        for (let i = 65; i < 91; i++) for (let j = 65; j < 91; j++) {
          const c = String.fromCharCode(i, j);
          const n = dn.of(c);
          if (n && n !== c) codigosPais[AMB.norm(n)] = c;
        }
      } catch (e) { /* sem Intl */ }
      Object.assign(codigosPais, { uk: 'GB', usa: 'US', us: 'US', 'west germany': 'DE', germany: 'DE', 'east germany': 'DE', ussr: 'RU' });
    }
    return codigosPais[AMB.norm(nome)] || '';
  }
  function tipoDoDiscogs(formats) {
    const f = (formats || [])[0] || {};
    const d = (f.descriptions || []).map((x) => AMB.norm(x));
    const nome = AMB.norm(f.name);
    const tem = (x) => d.indexOf(x) >= 0;
    if (tem('compilation')) return 'coletanea';
    if (nome === 'file') return 'digital';
    if (nome === 'cd' || nome === 'cdr') return tem('single') || tem('maxi-single') ? 'single' : tem('ep') ? 'ep' : 'cd';
    if (nome === 'vinyl' || nome === 'shellac') {
      if (tem('lp') || tem('album')) return 'lp';
      if (tem('ep')) return 'ep';
      if (tem('7"') || tem('single') || tem('45 rpm')) return 'compacto';
      if (tem('12"') || tem('maxi-single')) return 'single';
      return 'lp';
    }
    if (tem('single')) return 'single';
    if (tem('ep')) return 'ep';
    return 'lp';
  }
  // r = resposta da API (release); artista = registro do Ambário (para reaproveitar os ids das músicas)
  function discoDoDiscogs(r, artista) {
    const tipo = tipoDoDiscogs(r.formats);
    const ano = r.year || Number(String(r.released || '').slice(0, 4)) || '';
    const data = String(r.released || '').replace(/-00/g, '');
    const musicas = {};
    (artista && artista.releases ? artista.releases : []).forEach((d) => (d.tracks || []).forEach((t) => { if (t.song) musicas[AMB.norm(AMB.cleanTitle(t.t))] = t.song; }));
    const tracks = (r.tracklist || []).filter((t) => (t.type_ || 'track') === 'track' && t.title).map((t, i) => {
      const titulo = String(t.title).trim();
      const chave = AMB.norm(AMB.cleanTitle(titulo));
      const faixa = { n: String(t.position || i + 1).trim() || String(i + 1), t: titulo, song: musicas[chave] || AMB.slug(AMB.cleanTitle(titulo)) };
      if (t.duration) faixa.len = t.duration;
      const outros = (t.extraartists || []).filter((x) => /written|lyrics|music|composed/i.test(x.role || '')).map((x) => semNumeroDiscogs(x.anv || x.name));
      if (outros.length) faixa.w = Array.from(new Set(outros)).join(', ');
      return faixa;
    });
    const f = (r.formats || [])[0] || {};
    const formato = [f.qty && Number(f.qty) > 1 ? f.qty + '×' + f.name : f.name].concat(f.descriptions || []).filter(Boolean).join(', ');
    const label = (r.labels || [])[0];
    const disco = {
      id: AMB.slug(r.title) + (ano ? '-' + ano : ''),
      type: tipo,
      title: String(r.title || '').trim(),
      year: ano || undefined,
      date: /^\d{4}-\d{2}/.test(data) ? data : undefined,
      label: label ? semNumeroDiscogs(label.name) + (label.catno && label.catno !== 'none' ? ' (' + label.catno + ')' : '') : undefined,
      format: formato || undefined,
      src: [{ t: 'Discogs — ' + semNumeroDiscogs(((r.artists || [])[0] || {}).name) + ' – ' + r.title, u: 'https://www.discogs.com/release/' + r.id }],
      discogs: r.id,
      tracks
    };
    Object.keys(disco).forEach((k) => { if (disco[k] === undefined) delete disco[k]; });
    return disco;
  }
  async function buscarDiscogs(txt) {
    const alvo = discogsAlvo(txt);
    if (!alvo) throw new Error('Cole um link do Discogs, como https://www.discogs.com/release/1234567-Artista-Disco');
    let r;
    if (alvo.tipo === 'master') {
      const m = await discogsGet('masters/' + alvo.id);
      r = await discogsGet('releases/' + m.main_release);
    } else r = await discogsGet('releases/' + alvo.id);
    return r;
  }

  /* =================== vídeos: formulário =================== */
  function telaVideo(id) {
    const novo = id === 'novo';
    const v = novo ? {
      kind: 'clipe', status: 'na-fila', credits: AMB.cfg('CURADOR', '') ? { sync: AMB.cfg('CURADOR', '') } : {},
      audio: [{ id: 'principal', short: 'DISCO', label: '', kind: 'lp', embedded: true }]
    } : rawVideo(id);
    if (!v) return V.box('Vídeo não encontrado', '<p>Não há vídeo com o id “' + esc(id) + '”. <a href="#admin/videos">Voltar à lista</a></p>');
    const artistas = AMB.artistList.map((a) => [a.id, a.name]);
    const f = v.file || {}, cr = v.credits || {}, so = v.source || {};
    const a1 = (v.audio || [])[0] || {}, a2 = (v.audio || [])[1] || {};
    const kinds = Object.keys(AMB.KINDS).map((k) => [k, AMB.KINDS[k]]);
    const audKinds = [['', '—']].concat(Object.keys(AMB.AUDIO_KINDS).map((k) => [k, AMB.AUDIO_KINDS[k]]));
    return '<form class="box adm adm-form" id="adm-video" data-id="' + esc(novo ? '' : v.id) + '" novalidate autocomplete="off">' +
      '<div class="box-h"><h2>' + (novo ? 'Novo vídeo' : 'Editar: ' + esc(nomeVideo(v))) + '</h2>' +
        (novo ? '' : '<span class="box-h-dir"><a href="#v-' + esc(v.id) + '">ver no site</a></span>') + '</div><div class="box-c">' +

      '<fieldset class="adm-discogs"><legend>Puxar do Discogs</legend>' +
        '<p class="mini">Cole o link do disco de onde vem a música (release ou master). Escolha a faixa: ela fica no artista com o ano original e este disco citado como fonte do áudio.</p>' +
        '<div class="adm-ia"><label>Link do Discogs <input type="text" name="discogs" placeholder="https://www.discogs.com/release/…"></label>' +
          '<button type="button" class="btn btn-b" data-adm="discogs">Buscar disco</button></div>' +
        '<p class="mini adm-discogs-msg" role="status"></p><div class="adm-discogs-res"></div>' +
      '</fieldset>' +
      '<fieldset><legend>O registro</legend><div class="adm-grade">' +
        campo('artist', 'Artista', '', { tipo: 'select', ops: opcoes(artistas.concat([['__novo', '+ artista novo…']]), v.artist || '', 'escolha') }) +
        '<div class="adm-novo-art larga" hidden><div class="adm-grade">' +
          campo('artist_name', 'Nome do artista novo', v.artist_name || '') +
          campo('artist_country', 'País', '', { list: 'adm-paises', ph: 'BR', ajuda: '(código de 2 letras)' }) +
          campo('artist_origin', 'Cidade / origem', '', { ph: 'ex.: Brasília, DF' }) +
          '<p class="mini larga">O artista entra com o básico; a discografia você completa depois em <b>Artistas</b>.</p>' +
        '</div></div>' +
        campo('song', 'Música', v.song || '', { list: 'adm-musicas', ph: 'escolha da lista ou escreva o título', ajuda: '(liga o vídeo ao disco)' }) +
        campo('ver', 'Versão', v.ver || '', { ph: 'vazio = a do disco', ajuda: '(ex.: ao-vivo, 1984, alternativa)' }) +
        campo('title', 'Título do registro', v.title || '', { ph: 'ex.: Tudo Pode Mudar' }) +
        campo('kind', 'Tipo', '', { tipo: 'select', ops: opcoes(kinds, v.kind || 'clipe') }) +
        campo('date', 'Data', v.date || '', { ph: '1985, 05/1985 ou 12/05/1985' }) +
        campo('program', 'Programa / filme', v.program || '', { ph: 'ex.: Fantástico' }) +
        campo('channel', 'Emissora', v.channel || '', { ph: 'ex.: Rede Globo' }) +
        campo('director', 'Direção', v.director || '') +
        campo('status', 'Situação', '', { tipo: 'select', ops: opcoes(Object.keys(AMB.STATUS).map((k) => [k, AMB.STATUS[k].t]), v.status || 'na-fila') }) +
      '</div><datalist id="adm-musicas"></datalist>' + datalistPaises() + datalistAcervos() +
        '<p class="mini adm-id-prev"></p></fieldset>' +

      '<fieldset><legend>Capa</legend><div class="adm-capa">' +
        '<div class="th adm-capa-prev" aria-hidden="true"></div>' +
        '<div class="adm-capa-txt"><p class="mini">Aparece na lista de vídeos, na página do artista e na tela do player. Pode ser qualquer imagem (um quadro do vídeo, a capa do disco…): você enquadra antes de salvar.</p>' +
          '<div class="adm-capa-botoes"><button type="button" class="btn btn-b" data-adm="capa-img">Escolher imagem…</button>' +
            '<button type="button" class="btn" data-adm="capa-vid">Tirar de um vídeo do computador…</button>' +
            '<button type="button" class="btn" data-adm="capa-ajustar">Reenquadrar</button>' +
            '<button type="button" class="btn" data-adm="capa-remover">Sem capa</button></div>' +
          '<p class="mini adm-capa-info"></p>' +
          '<details class="adm-det"><summary>Usar um link em vez de enviar</summary>' + campo('capa', 'Link ou caminho da imagem', v.capa || '', { ph: 'media/capas/… ou https://…' }) + '</details>' +
        '</div></div></fieldset>' +

      '<fieldset><legend>Arquivo de vídeo</legend>' +
        '<div class="adm-ia"><label>Item do Internet Archive <small>(identificador ou link)</small><input type="text" name="ia" value="' + esc(f.ia || '') + '" placeholder="ex.: ambario-metro-olhar-1985"></label>' +
          '<button type="button" class="btn btn-b" data-adm="importar">Importar arquivos</button></div>' +
        '<p class="mini adm-ia-msg" role="status"></p>' +
        '<div class="adm-grade">' +
          campo('video', 'Vídeo (MP4)', f.video || '', { tipo: 'url', ph: 'https://archive.org/download/…/….mp4', larga: true }) +
          campo('duration', 'Duração', v.duration ? AMB.fmtDur(v.duration) : '', { ph: '3:41' }) +
          campo('fit', 'Enquadramento', '', { tipo: 'select', ops: opcoes([['', 'Normal (imagem inteira)'], ['cover', 'Cortar bordas pretas das laterais'], ['fill', 'Desesticar (4:3 esticado em 16:9)']], v.fit || '') }) +
          campo('aspect', 'Tela', '', { tipo: 'select', ops: opcoes([['', '4:3 (TV)'], ['16:9', '16:9 (widescreen)']], v.aspect || '') }) +
          campo('mirrors', 'Espelhos', (f.mirrors || []).join('\n'), { tipo: 'textarea', rows: 2, ajuda: '(outros links do mesmo MP4, um por linha)' }) +
        '</div></fieldset>' +

      '<fieldset><legend>Áudios</legend><div class="adm-grade">' +
        '<p class="mini larga"><b>Principal</b> — o som que já está dentro do MP4 (o do disco, sincronizado no EternalDub).</p>' +
        campo('a1_label', 'Nome', a1.label || '', { ph: 'ex.: LP Olhar (Epic, 1985)' }) +
        campo('a1_short', 'Sigla no botão', a1.short || '', { ph: 'DISCO' }) +
        campo('a1_kind', 'Origem', '', { tipo: 'select', ops: opcoes(audKinds, a1.kind || '') }) +
        campo('a1_release', 'Disco de onde veio', '', { tipo: 'select', ops: '<option value="">—</option>' }) +
        campo('a1_by', 'Digitalizado por', a1.by || '', { list: 'adm-acervos' }) +
        campo('a1_note', 'Observação', a1.note || '', { ph: 'ex.: faixa 3' }) +
        '<p class="mini larga"><b>Segundo áudio</b> — o som original da gravação, num arquivo separado (.m4a). Deixe vazio se não tiver.</p>' +
        campo('a2_url', 'Arquivo do som original (M4A)', a2.url || '', { tipo: 'url', ph: 'https://archive.org/download/…/…-fita.m4a', larga: true }) +
        campo('a2_label', 'Nome', a2.label || '', { ph: 'Som original da fita VHS' }) +
        campo('a2_short', 'Sigla no botão', a2.short || '', { ph: 'VHS' }) +
        campo('a2_kind', 'Origem', '', { tipo: 'select', ops: opcoes(audKinds, a2.kind || (a2.url || a2.label ? '' : 'vhs')) }) +
      '</div></fieldset>' +

      '<fieldset><legend>Créditos e origem da gravação</legend><div class="adm-grade">' +
        campo('tape', 'Fita de', cr.tape || '', { list: 'adm-acervos', ajuda: '(id de um acervo ou nome)' }) +
        campo('capture', 'Captura do vídeo', cr.capture || '', { list: 'adm-acervos' }) +
        campo('sync', 'Sincronização (EternalDub)', cr.sync || '', { list: 'adm-acervos' }) +
        campo('medium', 'Mídia', so.medium || '', { ph: 'VHS' }) +
        campo('standard', 'Padrão', '', { tipo: 'select', ops: opcoes([['', '—'], ['PAL-M', 'PAL-M (Brasil)'], ['NTSC', 'NTSC'], ['PAL', 'PAL'], ['SECAM', 'SECAM']], so.standard || '') }) +
        campo('speed', 'Velocidade', '', { tipo: 'select', ops: opcoes([['', '—'], ['SP', 'SP'], ['LP', 'LP'], ['EP', 'EP / SLP']], so.speed || '') }) +
        campo('from', 'Gravado de', so.from || '', { ph: 'ex.: TV aberta, fita comercial' }) +
        campo('aired', 'Exibido em', so.aired || '', { ph: '1985-05-12' }) +
        campo('generation', 'Geração', so.generation || '', { ph: 'ex.: 1ª geração (gravação original)' }) +
        campo('deck', 'Aparelho', so.deck || '', { ph: 'ex.: Samsung SV-300W (S-Video)' }) +
        campo('capcard', 'Placa de captura', so.capture || '') +
        campo('notes', 'Observações técnicas', so.notes || '', { tipo: 'textarea', rows: 2 }) +
      '</div></fieldset>' +

      '<fieldset><legend>Textos e fontes</legend><div class="adm-grade">' +
        campo('description', 'Descrição', v.description || '', { tipo: 'textarea', rows: 3 }) +
        campoEn('description', 'Descrição', v.description_en, 3) +
        campo('note', 'Nota do curador', v.note || '', { tipo: 'textarea', rows: 2 }) +
        campoEn('note', 'Nota do curador', v.note_en, 2) +
        campo('src', 'Fontes', fontesParaTexto(v.src), { tipo: 'textarea', rows: 3, ajuda: '(uma por linha: “Título | https://link”, ou o id de uma fonte já cadastrada)' }) +
        campo('refs', 'Referências e cópias', fontesParaTexto(v.refs), { tipo: 'textarea', rows: 2, ajuda: '(“Título | https://link”, uma por linha)' }) +
      '</div></fieldset>' +

      '<fieldset><legend>Endereço</legend><div class="adm-grade">' +
        (novo ? campo('id', 'Id', '', { ajuda: '(vazio = criado sozinho)', ph: 'gerado a partir do artista, música, tipo e ano' })
          : campo('id', 'Id', v.id, { attrs: ' readonly', ajuda: '(o endereço do vídeo: #v-id)' }) +
            '<label class="adm-check larga"><input type="checkbox" name="mudar_id"> Mudar o id <small>(links antigos param de funcionar e os comentários ficam no id antigo)</small></label>') +
      '</div></fieldset>' +

      '<div class="adm-salvar">' +
        '<button type="button" class="btn btn-y" data-adm="salvar-video">' + (GH.conexao() ? 'Salvar e publicar' : 'Salvar neste navegador') + '</button>' +
        '<a class="btn" href="#admin/videos">Cancelar</a>' +
        (novo ? '' : '<button type="button" class="btn adm-perigo" data-adm="apagar-video" data-id="' + esc(v.id) + '">Apagar vídeo</button>') +
        '<p class="form-msg adm-msg" role="status"></p>' +
      '</div>' +
    '</div></form>';
  }

  function ligarVideo(root, idOriginal) {
    const f = root.querySelector('#adm-video');
    if (!f) return;
    const original = idOriginal === 'novo' ? null : rawVideo(idOriginal);
    const el = (n) => f.elements[n];
    const novoArt = f.querySelector('.adm-novo-art');

    function atualizarArtista() {
      const a = AMB.artists[el('artist').value];
      novoArt.hidden = el('artist').value !== '__novo';
      root.querySelector('#adm-musicas').innerHTML = a ? Object.values(a.songs).map((s) => '<option value="' + esc(s.id) + '">' + esc(s.t) + '</option>').join('') : '';
      const atual = el('a1_release').value || ((original && original.audio && original.audio[0] && original.audio[0].release) || '');
      el('a1_release').innerHTML = '<option value="">—</option>' + (a ? a.releases.map((r) => '<option value="' + esc(r.id) + '"' + (r.id === atual ? ' selected' : '') + '>' +
        esc(r.title + ' (' + (AMB.RELTYPES[r.type] || r.type) + (r.year ? ', ' + r.year : '') + ')') + '</option>').join('') : '');
    }
    function idPrevisto() {
      const r = coletarVideo(f, original, true);
      const p = root.querySelector('.adm-id-prev');
      if (p) p.innerHTML = r.v && r.v.id ? 'Endereço do vídeo: <code>#v-' + esc(r.v.id) + '</code>' : '';
    }
    function mostrarCapa() {
      const prev = f.querySelector('.adm-capa-prev');
      const info = f.querySelector('.adm-capa-info');
      const caminho = el('capa').value.trim();
      const url = E.capaNova || (caminho ? (AMB.local.arquivo(caminho) || caminho) : '');
      prev.innerHTML = url ? '<img src="' + esc(url) + '" alt="">' : '<span class="adm-capa-sem">SEM CAPA</span>';
      prev.classList.toggle('th-sem', !url);
      const r = coletarVideo(f, original, true);
      info.innerHTML = E.capaNova ? 'Imagem nova (640×480). Ao salvar, vai para <code>media/capas/' + esc((r.v && r.v.id) || 'id') + '.jpg</code>.'
        : caminho ? 'Atual: <code>' + esc(caminho) + '</code>' : 'Sem capa: a lista mostra a tela azul de “sem sinal”.';
      f.querySelector('[data-adm="capa-ajustar"]').hidden = !url || (!E.capaNova && /^https?:/i.test(caminho) && caminho.indexOf(location.origin + '/') !== 0);
    }

    el('artist').addEventListener('change', () => { atualizarArtista(); idPrevisto(); });

    // ---- Discogs ----
    const dMsg = f.querySelector('.adm-discogs-msg');
    const dRes = f.querySelector('.adm-discogs-res');
    function preencherSeVazio(nome, valor) {
      if (valor && el(nome) && !String(el(nome).value || '').trim()) el(nome).value = valor;
    }
    function escolherFaixa(i) {
      const d = E.discogs && E.discogs.disco;
      const t = d && d.tracks[i];
      if (!t) return;
      E.discogs.faixa = i;
      const anoIn = dRes.querySelector('input[name="dg_ano"]');
      if (anoIn) { const ano = t.year || d.year || ''; anoIn.value = ano; E.discogs.ano = ano ? Number(ano) : null; }
      el('song').value = t.song;
      el('title').value = AMB.cleanTitle(t.t);
      const anoVideo = E.discogs.ano || d.year || (t.year ? Number(t.year) : '');
      if (anoVideo && (!el('date').value.trim() || el('date').value.trim() === E.discogs.dataAuto)) { el('date').value = String(anoVideo); E.discogs.dataAuto = el('date').value; }
      // áudio principal = o disco
      const sel = el('a1_release');
      if (!Array.from(sel.options).some((o) => o.value === d.id)) {
        sel.insertAdjacentHTML('beforeend', '<option value="' + esc(d.id) + '">' + esc(d.title + ' (' + (AMB.RELTYPES[d.type] || d.type) + (d.year ? ', ' + d.year : '') + ') — novo') + '</option>');
      }
      sel.value = d.id;
      const kindAudio = { lp: 'lp', compacto: 'compacto', single: 'compacto', ep: 'compacto', cd: 'cd', coletanea: 'lp', digital: 'digital' }[d.type] || '';
      if (kindAudio) el('a1_kind').value = kindAudio;
      el('a1_label').value = (AMB.RELTYPES[d.type] || d.type) + ' ' + d.title + ' (' + [d.label ? d.label.replace(/\s*\(.*\)$/, '') : '', d.year].filter(Boolean).join(', ') + ')';
      el('a1_note').value = 'faixa ' + t.n;
      E.sujo = true;
      dRes.querySelectorAll('input[name="dg_faixa"]').forEach((r) => { r.checked = Number(r.value) === i; });
      idPrevisto();
    }
    async function puxarDiscogs(botao) {
      const txt = el('discogs').value;
      dMsg.className = 'mini adm-discogs-msg';
      dMsg.textContent = 'Buscando no Discogs…';
      botao.disabled = true;
      try {
        const r = await buscarDiscogs(txt);
        const nomeArt = semNumeroDiscogs(((r.artists || [])[0] || {}).anv || ((r.artists || [])[0] || {}).name);
        // artista: o escolhido no formulário; senão procura pelo nome; senão prepara um artista novo
        let artId = el('artist').value && el('artist').value !== '__novo' ? el('artist').value : '';
        if (!artId) {
          const achado = AMB.artistList.find((x) => AMB.norm(x.name) === AMB.norm(nomeArt) || (x.alt || []).some((n) => AMB.norm(n) === AMB.norm(nomeArt)));
          if (achado) artId = achado.id;
        }
        if (artId) el('artist').value = artId;
        else {
          el('artist').value = '__novo';
          preencherSeVazio('artist_name', nomeArt);
          preencherSeVazio('artist_country', paisDoDiscogs(r.country));
        }
        atualizarArtista();
        const disco = discoDoDiscogs(r, rawArtista(artId));
        const jaTem = artId && (rawArtista(artId).releases || []).find((x) => (x.discogs && String(x.discogs) === String(r.id)) || x.id === disco.id);
        if (jaTem) { // o disco já está cadastrado: mantém o id dele e as faixas que já tem (ids de música e ano)
          disco.id = jaTem.id;
          disco.tracks = disco.tracks.map((t) => Object.assign({}, t, (jaTem.tracks || []).find((x) => x.n === t.n) || {}));
        }
        E.discogs = { disco, existente: !!jaTem };
        const d = E.discogs.disco;
        E.discogs.ano = d.year || null;
        // faixa sugerida: a que bate com o título já escrito; senão a primeira (lado A do compacto)
        const tit = AMB.norm(AMB.cleanTitle(el('title').value || el('song').value || ''));
        let sug = tit ? d.tracks.findIndex((t) => AMB.norm(AMB.cleanTitle(t.t)) === tit || t.song === el('song').value) : -1;
        if (sug < 0) sug = 0;
        dRes.innerHTML = '<div class="adm-dg">' +
          '<p><b>' + esc(nomeArt) + ' — ' + esc(d.title) + '</b> <span class="mini">' + esc([AMB.RELTYPES[d.type] || d.type, d.year, d.label, d.format, r.country].filter(Boolean).join(' · ')) + '</span>' +
            ' <a class="mini" href="https://www.discogs.com/release/' + esc(r.id) + '" target="_blank" rel="noopener">abrir no Discogs ↗</a></p>' +
          '<p class="mini">' + (E.discogs.existente ? 'Este disco <b>já está</b> cadastrado; ao salvar, a faixa escolhida é ligada a ele.' : 'Ao salvar, entra no artista só a faixa escolhida, citando este disco como fonte do áudio.') + ' Qual faixa é a do vídeo?</p>' +
          '<label class="adm-dg-ano">Ano original da música <input type="text" name="dg_ano" inputmode="numeric" maxlength="4" value="' + esc(d.year || '') + '"> <small>(ex.: coletânea de 2001 com uma música de 1986)</small></label>' +
          '<ul class="adm-dg-faixas">' + d.tracks.map((t, i) => '<li><label><input type="radio" name="dg_faixa" value="' + i + '"> <b>' + esc(t.n) + '</b> ' + esc(t.t) +
            (t.len ? ' <span class="mini">' + esc(t.len) + '</span>' : '') + '</label></li>').join('') + '</ul>' +
          (d.tracks.length ? '' : '<p class="erro">O Discogs não trouxe a lista de faixas deste disco.</p>') +
        '</div>';
        dRes.querySelectorAll('input[name="dg_faixa"]').forEach((rd) => rd.addEventListener('change', () => escolherFaixa(Number(rd.value))));
        const anoIn = dRes.querySelector('input[name="dg_ano"]');
        anoIn.addEventListener('input', () => {
          const ano = anoIn.value.trim();
          E.discogs.ano = /^\d{4}$/.test(ano) ? Number(ano) : null;
          // a data do vídeo acompanha o ano enquanto não foi mudada à mão
          if (E.discogs.ano && (!el('date').value.trim() || el('date').value.trim() === E.discogs.dataAuto)) { el('date').value = String(E.discogs.ano); E.discogs.dataAuto = el('date').value; idPrevisto(); }
          E.sujo = true;
        });
        if (d.tracks.length) escolherFaixa(sug);
        dMsg.textContent = 'Pronto: confira a faixa marcada e os campos preenchidos abaixo.';
      } catch (er) {
        E.discogs = null;
        dRes.innerHTML = '';
        dMsg.className = 'mini adm-discogs-msg erro';
        dMsg.textContent = /failed to fetch|networkerror|load failed/i.test(String(er && er.message)) ? 'Não deu para falar com o Discogs agora. Confira a conexão e tente de novo.' : (er && er.message) || 'Não deu para buscar o disco.';
      } finally { botao.disabled = false; }
    }
    el('discogs').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); puxarDiscogs(f.querySelector('[data-adm="discogs"]')); } });
    el('song').addEventListener('change', () => {
      const a = AMB.artists[el('artist').value];
      const s = a && a.songs[el('song').value];
      if (s && !el('title').value.trim()) el('title').value = s.t;
      idPrevisto();
    });
    ['title', 'kind', 'date', 'id', 'artist_name'].forEach((n) => { if (el(n)) el(n).addEventListener('input', idPrevisto); });
    el('video').addEventListener('change', () => {
      if (el('video').value.trim() && el('status').value !== 'no-acervo') {
        el('status').value = 'no-acervo';
        const m = f.querySelector('.adm-ia-msg');
        m.textContent = 'Situação mudada para “No acervo”, porque agora tem o link do vídeo.';
      }
    });
    el('capa').addEventListener('input', () => { E.capaNova = null; mostrarCapa(); });
    if (el('mudar_id')) el('mudar_id').addEventListener('change', (e) => { el('id').readOnly = !e.target.checked; if (e.target.checked) el('id').focus(); });

    f.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-adm]');
      if (!b) return;
      const acao = b.dataset.adm;
      if (acao === 'capa-img' || acao === 'capa-vid' || acao === 'capa-ajustar') {
        const atual = acao === 'capa-ajustar' ? (E.capaNova || AMB.local.arquivo(el('capa').value) || el('capa').value.trim()) : '';
        const r = await AMB.Capa.escolher({ titulo: acao === 'capa-ajustar' ? 'Reenquadrar a capa' : 'Capa do vídeo', proporcao: 4 / 3, largura: 640, modo: acao === 'capa-vid' ? 'video' : 'imagem', atual });
        if (r) { E.capaNova = r.dataUrl; E.capaRemovida = false; E.sujo = true; mostrarCapa(); }
      } else if (acao === 'discogs') {
        puxarDiscogs(b);
      } else if (acao === 'capa-remover') {
        E.capaNova = null; E.capaRemovida = true; el('capa').value = ''; E.sujo = true; mostrarCapa();
      } else if (acao === 'importar') {
        importarIA(f);
      } else if (acao === 'salvar-video') {
        salvarVideo(f, original, b);
      } else if (acao === 'apagar-video') {
        if (E.sujo && !(await confirmar({ titulo: 'Apagar sem salvar as mudanças?', ok: 'Continuar', html: '<p>As mudanças deste formulário serão perdidas.</p>' }))) return;
        E.sujo = false;
        apagarVideo(b.dataset.id, root);
      }
    });

    atualizarArtista();
    idPrevisto();
    mostrarCapa();
  }

  async function importarIA(f) {
    const msg = f.querySelector('.adm-ia-msg');
    const bruto = String(f.elements.ia.value || '').trim();
    const m = bruto.match(/archive\.org\/(?:details|download|embed|metadata)\/([\w.-]+)/i);
    const id = m ? m[1] : bruto;
    if (!/^[\w.-]{3,100}$/.test(id)) { msg.textContent = 'Cole o identificador do item (o que vem depois de archive.org/details/).'; return; }
    f.elements.ia.value = id;
    msg.textContent = 'Lendo o item ' + id + '…';
    try {
      const r = await fetch('https://archive.org/metadata/' + encodeURIComponent(id), { cache: 'no-store' });
      const j = await r.json();
      if (!j || !j.files) throw new Error('Item não encontrado no Internet Archive (itens novos levam alguns minutos para aparecer).');
      const url = (nome) => 'https://archive.org/download/' + encodeURIComponent(id) + '/' + nome.split('/').map(encodeURIComponent).join('/');
      const arqs = j.files.filter((x) => !/__ia_thumb|_thumb\.|\.thumbs\//i.test(x.name));
      const achar = (re, pref) => arqs.filter((x) => re.test(x.name))
        .sort((x, y) => ((pref && pref.test(y.name)) ? 1 : 0) - ((pref && pref.test(x.name)) ? 1 : 0) || (y.source === 'original') - (x.source === 'original'))[0];
      const mp4 = achar(/\.mp4$/i, /^(?!.*_512kb)/i);
      const fita = achar(/\.(m4a|mp3|ogg|opus)$/i, /(fita|vhs|tape|original)/i);
      const capa = achar(/\.(jpe?g|png)$/i);
      const el = (n) => f.elements[n];
      if (mp4) {
        el('video').value = url(mp4.name);
        if (mp4.length) el('duration').value = AMB.fmtDur(durDeTexto(mp4.length));
        if (el('status').value !== 'no-acervo') el('status').value = 'no-acervo';
      }
      if (fita) { el('a2_url').value = url(fita.name); if (!el('a2_label').value.trim()) el('a2_label').value = 'Som original da gravação'; if (!el('a2_short').value.trim()) el('a2_short').value = 'ORIGINAL'; }
      if (capa && !el('capa').value.trim() && !E.capaNova) { el('capa').value = url(capa.name); el('capa').dispatchEvent(new Event('input')); }
      const meta = j.metadata || {};
      if (!el('title').value.trim() && meta.title) el('title').value = String(meta.title).replace(/^.*?\s[—-]\s/, '');
      if (!el('date').value.trim() && meta.date) el('date').value = String(meta.date).slice(0, 10);
      if (!el('description').value.trim() && meta.description) el('description').value = String(meta.description).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600);
      E.sujo = true;
      msg.textContent = 'Encontrado: ' + [mp4 && 'vídeo ' + mp4.name, fita && 'som original ' + fita.name, capa && 'imagem ' + capa.name].filter(Boolean).join(' · ') +
        (mp4 ? '' : ' — ainda sem MP4 (o Archive pode estar processando o envio).');
    } catch (er) {
      msg.textContent = (er && er.message) || 'Não deu para ler o item agora.';
    }
  }

  // monta o objeto do vídeo a partir do formulário; "previa" só calcula o id (sem validar)
  function coletarVideo(f, original, previa) {
    const val = (k) => String((f.elements[k] && f.elements[k].value) || '').trim();
    const v = original ? clone(original) : {};
    let artista = val('artist');
    let artistaNovo = null;
    if (!artista || artista === '__novo') {
      const nome = val('artist_name');
      if (!nome) return previa ? { v: null } : { erro: 'Escolha o artista, ou escreva o nome do artista novo.', campo: 'artist' };
      artista = AMB.slug(nome);
      if (!rawArtista(artista)) artistaNovo = ordenar({ id: artista, name: nome, country: val('artist_country').toUpperCase() || undefined, origin: val('artist_origin') || undefined, releases: [] }, ORDEM_ARTISTA);
    }
    v.artist = artista;
    delete v.artist_name;
    // disco puxado do Discogs: entra na discografia do artista (se ainda não estiver lá)
    let artistaDisco = null;
    if (E.discogs && E.discogs.disco) {
      const d = E.discogs.disco;
      const base = artistaNovo || (rawArtista(artista) ? clone(rawArtista(artista)) : null);
      if (base) {
        base.releases = base.releases || [];
        let mudou = false;
        const escolhida = E.discogs.faixa != null ? d.tracks[E.discogs.faixa] : null;
        // do disco só entra a faixa do vídeo (o site mostra só as músicas que têm vídeo)
        let rel = base.releases.find((x) => (x.discogs && String(x.discogs) === String(d.discogs)) || x.id === d.id);
        if (!rel) {
          rel = ordenar(Object.assign(clone(d), { partial: true, tracks: escolhida ? [clone(escolhida)] : [] }), ORDEM_DISCO.concat(['discogs']));
          base.releases.push(rel); mudou = true;
        } else {
          // disco já cadastrado: passa a citar o Discogs (link e id), se ainda não citava
          if (!rel.discogs && d.discogs) { rel.discogs = d.discogs; mudou = true; }
          const srcDg = (d.src || [])[0];
          if (srcDg && !(rel.src || []).some((s) => /discogs\.com/.test(typeof s === 'object' ? s.u || '' : String(s)))) { rel.src = (rel.src || []).concat([srcDg]); mudou = true; }
          if (escolhida) {
            // a mesma música já cadastrada com outra numeração (ex.: "3" → "A3") vira a faixa do Discogs, sem duplicar
            const igual = (rel.tracks || []).find((t) => t.n === escolhida.n) || (rel.tracks || []).find((t) => t.song && t.song === escolhida.song && !t.ver);
            if (!igual) { rel.tracks = (rel.tracks || []).concat([clone(escolhida)]); rel.partial = true; mudou = true; }
            else if (igual.n !== escolhida.n || (!igual.len && escolhida.len)) {
              igual.n = escolhida.n;
              if (!igual.len && escolhida.len) igual.len = escolhida.len;
              mudou = true;
            }
          }
        }
        // ano original da música (quando é diferente do ano do disco, ex.: coletânea)
        const faixa = escolhida ? (rel.tracks || []).find((t) => t.n === escolhida.n) : null;
        if (faixa) {
          const ano = E.discogs.ano && String(E.discogs.ano) !== String(rel.year) ? E.discogs.ano : undefined;
          if (String(faixa.year || '') !== String(ano || '')) { if (ano) faixa.year = ano; else delete faixa.year; mudou = true; }
        }
        if (mudou) { if (artistaNovo) artistaNovo = base; else artistaDisco = ordenar(base, ORDEM_ARTISTA); }
      }
    }
    const a = AMB.artists[artista];
    let song = val('song');
    if (song && !/^[a-z0-9-]+$/.test(song)) {
      // escreveu o título: procura a música pelo nome; se não achar, vira um id novo
      const achada = a && Object.values(a.songs).find((s) => AMB.norm(s.t) === AMB.norm(song));
      song = achada ? achada.id : AMB.slug(AMB.cleanTitle(song));
    }
    put(v, 'song', song);
    put(v, 'ver', val('ver') ? AMB.slug(val('ver')) : '');
    const title = val('title') || (a && song && a.songs[song] ? a.songs[song].t : '');
    put(v, 'title', title);
    v.kind = val('kind') || 'outro';
    const data = normData(val('date'));
    put(v, 'date', data);
    ['program', 'channel', 'director'].forEach((k) => put(v, k, val(k)));
    v.status = val('status') || 'na-fila';

    // id
    let id = original ? original.id : '';
    const mudar = original && f.elements.mudar_id && f.elements.mudar_id.checked;
    if (!original || mudar) {
      const pedido = AMB.slug(val('id'));
      const ano = AMB.year(data);
      const base = pedido || AMB.slug([artista, song || title, v.kind === 'clipe' ? 'clipe' : v.kind, ano].filter(Boolean).join('-'));
      id = pedido ? pedido : idUnico(base, (x) => !!rawVideo(x) && x !== (original && original.id));
    }
    v.id = id;
    if (previa) return { v };

    // validação
    if (!title) return { erro: 'Falta o título do registro.', campo: 'title' };
    if (!dataOk(data)) return { erro: 'Data em formato que não reconheci. Use 1985, 05/1985 ou 12/05/1985.', campo: 'date' };
    if (!id) return { erro: 'Não deu para criar o id: preencha o título.', campo: 'title' };
    if ((!original || id !== original.id) && rawVideo(id)) return { erro: 'Já existe um vídeo com o id “' + id + '”. Escolha outro id.', campo: 'id' };
    for (const k of ['video', 'a2_url']) if (val(k) && !AMB.isUrl(val(k)) && !/^media\//.test(val(k))) return { erro: 'O link em “' + (k === 'video' ? 'Vídeo (MP4)' : 'Arquivo do som original') + '” precisa começar com https://', campo: k };
    if (v.status === 'no-acervo' && !val('video')) return { erro: 'Para ficar “No acervo” precisa do link do vídeo (MP4). Ou mude a situação para “Na fila”.', campo: 'video' };
    const espelhos = linhas(val('mirrors'));
    if (espelhos.some((u) => !AMB.isUrl(u))) return { erro: 'Os espelhos precisam ser links (https://…), um por linha.', campo: 'mirrors' };
    const src = fontesDeTexto(val('src'));
    const refs = fontesDeTexto(val('refs'), true);
    if (!src.every(linkOk) || !refs.every(linkOk)) return { erro: 'Algum link das fontes não começa com https://', campo: 'src' };

    // capa e enquadramento
    let capa = val('capa');
    const caminhoCapa = 'media/capas/' + id + '.jpg';
    if (E.capaNova) capa = caminhoCapa + '?v=' + Date.now().toString(36);
    put(v, 'capa', capa);
    put(v, 'fit', val('fit'));
    put(v, 'aspect', val('aspect'));
    const dur = durDeTexto(val('duration'));
    put(v, 'duration', dur || '');

    // arquivo
    const file = Object.assign({}, v.file || {});
    put(file, 'video', val('video'));
    put(file, 'ia', val('ia'));
    put(file, 'mirrors', espelhos);
    put(v, 'file', file);

    // áudios (os dois primeiros vêm do formulário; outros, se houver, ficam como estão)
    const extras = (v.audio || []).slice(2);
    const a1 = Object.assign({}, (v.audio || [])[0] || {});
    const a2 = Object.assign({}, (v.audio || [])[1] || {});
    const audio = [];
    if (val('video') || val('a1_label') || val('a1_release') || val('a1_by')) {
      a1.id = a1.id || 'principal';
      put(a1, 'short', val('a1_short') || (val('a1_kind') && AMB.AUDIO_KINDS[val('a1_kind')]) || 'DISCO');
      put(a1, 'label', val('a1_label') || 'Áudio do disco');
      put(a1, 'kind', val('a1_kind'));
      put(a1, 'release', val('a1_release'));
      put(a1, 'by', val('a1_by'));
      put(a1, 'note', val('a1_note'));
      a1.embedded = true;
      delete a1.url;
      audio.push(ordenar(a1, ['id', 'short', 'label', 'kind', 'release', 'by', 'note', 'embedded']));
    }
    if (val('a2_url') || val('a2_label')) {
      a2.id = a2.id && a2.id !== 'principal' ? a2.id : 'original';
      put(a2, 'short', val('a2_short') || 'ORIGINAL');
      put(a2, 'label', val('a2_label') || 'Som original da gravação');
      put(a2, 'kind', val('a2_kind'));
      put(a2, 'url', val('a2_url'));
      delete a2.embedded;
      if (!audio.length) audio.push({ id: 'principal', short: 'DISCO', label: 'Áudio do disco', embedded: true });
      audio.push(ordenar(a2, ['id', 'short', 'label', 'kind', 'url']));
    }
    put(v, 'audio', audio.concat(extras));

    const cr = Object.assign({}, v.credits || {});
    ['tape', 'capture', 'sync'].forEach((k) => put(cr, k, val(k)));
    put(v, 'credits', cr);
    const so = Object.assign({}, v.source || {});
    [['medium', 'medium'], ['standard', 'standard'], ['speed', 'speed'], ['from', 'from'], ['aired', 'aired'], ['generation', 'generation'],
      ['deck', 'deck'], ['capcard', 'capture'], ['notes', 'notes']].forEach(([k, n]) => put(so, n, k === 'aired' ? normData(val(k)) : val(k)));
    put(v, 'source', so);
    put(v, 'description', val('description'));
    put(v, 'description_en', val('description_en'));
    put(v, 'note', val('note'));
    put(v, 'note_en', val('note_en'));
    put(v, 'src', src);
    put(v, 'refs', refs);
    if (!original) { v.added = GH.hoje(); put(v, 'added_by', AMB.cfg('CURADOR', '')); }
    return { v: ordenar(v, ORDEM_VIDEO), artistaNovo, artistaDisco, caminhoCapa };
  }

  async function salvarVideo(f, original, botao) {
    const msg = f.querySelector('.adm-msg');
    const r = coletarVideo(f, original, false);
    if (r.erro) {
      msg.className = 'form-msg adm-msg erro';
      msg.textContent = r.erro;
      const c = r.campo && f.elements[r.campo];
      if (c && c.focus) { const det = c.closest('details'); if (det) det.open = true; c.focus(); }
      return;
    }
    if (botao) botao.disabled = true;
    await completarIngles(r.v, original, ['description', 'note'], msg);
    if (botao) botao.disabled = false;
    r.v = ordenar(r.v, ORDEM_VIDEO);
    const v = r.v;
    const ops = [];
    if (E.capaNova) ops.push({ t: 'arquivo', caminho: r.caminhoCapa, dataUrl: E.capaNova });
    if (E.capaRemovida && original && original.capa && /^media\//.test(original.capa) && !v.capa) {
      const velha = GH.semQuery(original.capa);
      const outro = (AMB.dados.videos || []).some((x) => x.id !== original.id && x.capa && GH.semQuery(x.capa) === velha);
      if (!outro) ops.push({ t: 'apagar-arquivo', caminho: velha });
    }
    if (r.artistaNovo) ops.push({ t: 'artista', id: r.artistaNovo.id, dados: r.artistaNovo });
    if (r.artistaDisco) ops.push({ t: 'artista', id: r.artistaDisco.id, dados: r.artistaDisco });
    const op = { t: 'video', id: v.id, dados: v };
    if (original && original.id !== v.id) op.antes = original.id;
    ops.push(op);
    salvarOps(ops, {
      msgEl: msg, botoes: [botao],
      ok: '“' + nomeVideo(v) + '” ' + (original ? 'foi atualizado.' : 'entrou no acervo.'),
      depois: '#admin/videos', ver: '#v-' + v.id
    });
  }

  /* =================== artistas =================== */
  function telaArtistas() {
    const lista = (AMB.dados.artists || []).filter((a) => a && a.id && !a.test).slice().sort((x, y) => AMB.norm(x.name).localeCompare(AMB.norm(y.name)));
    const nVideos = (id) => (AMB.dados.videos || []).filter((v) => v.artist === id).length;
    return '<section class="box box-azul"><div class="box-h"><h2>Artistas</h2><span class="box-h-dir">' + V.pl(lista.length, 'artista', 'artistas') + '</span></div><div class="box-c">' +
      '<div class="adm-barra"><a class="btn btn-y" href="#admin/artista/novo">+ Novo artista</a>' +
        '<input type="search" class="adm-busca" placeholder="Filtrar artistas…" aria-label="Filtrar artistas"></div>' +
      '<div class="adm-lista">' + lista.map((a) => {
        const n = nVideos(a.id);
        const faixas = (a.releases || []).reduce((s, r) => s + (r.tracks || []).length, 0);
        return '<div class="adm-item adm-item-art" data-busca="' + esc(AMB.norm([a.name].concat(a.alt || [], a.origin || '').join(' '))) + '" data-st="">' +
          V.discoIcone(a, 'm') +
          '<div class="adm-item-txt"><a class="adm-item-tit" href="#admin/artista/' + esc(a.id) + '">' + esc(a.name) + '</a>' +
            '<span class="mini">' + esc([AMB.country(a.country), a.origin, a.years].filter(Boolean).join(' · ')) + '</span>' +
            '<span class="mini">' + V.pl(n, 'vídeo', 'vídeos') + ' · ' + V.pl((a.releases || []).length, 'disco', 'discos') + ' · ' + V.pl(faixas, 'faixa', 'faixas') + '</span></div>' +
          '<div class="adm-item-acoes"><a class="btn btn-p" href="#admin/artista/' + esc(a.id) + '">Editar</a><a class="btn btn-p" href="#a-' + esc(a.id) + '">Ver</a>' +
            '<button type="button" class="btn btn-p adm-perigo" data-adm="apagar-artista" data-id="' + esc(a.id) + '"' + (n ? ' disabled title="Tem vídeos: apague ou mude o artista deles antes"' : '') + '>Apagar</button></div>' +
        '</div>';
      }).join('') + '</div><p class="vazio adm-nada" hidden>Nada com esse filtro.</p>' +
    '</div></section>';
  }

  function linhaFaixa(t) {
    t = t || {};
    const c = (n, val, ph, cls) => '<td class="' + (cls || '') + '"><input type="text" data-f="' + n + '" value="' + esc(val || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + ' aria-label="' + esc(n) + '"></td>';
    return '<tr>' + c('n', t.n, '1', 'af-n') + c('t', t.t, 'Título', 'af-t') + c('len', t.len, '3:30', 'af-len') + c('ver', t.ver, '', 'af-ver') +
      c('w', t.w, 'Compositores', 'af-w') + c('feat', t.feat, '', 'af-feat') + c('note', t.note, '', 'af-note') + c('song', t.song, 'auto', 'af-song') +
      '<td class="af-bt"><button type="button" class="btn btn-p" data-adm="faixa-sobe" title="Subir">↑</button><button type="button" class="btn btn-p" data-adm="faixa-desce" title="Descer">↓</button>' +
      '<button type="button" class="btn btn-p adm-perigo" data-adm="faixa-tira" title="Tirar esta faixa">×</button></td></tr>';
  }
  function blocoDisco(r, idx) {
    r = r || { type: 'lp', tracks: [] };
    const tipos = Object.keys(AMB.RELTYPES).map((k) => [k, AMB.RELTYPES[k]]);
    const resumo = [AMB.RELTYPES[r.type] || r.type, r.year, r.title].filter(Boolean).join(' · ') || 'Disco novo';
    return '<details class="adm-disco"' + (idx == null ? ' open' : '') + ' data-orig="' + (idx == null ? '' : idx) + '">' +
      '<summary><b>' + esc(resumo) + '</b> <span class="mini">' + V.pl((r.tracks || []).length, 'faixa', 'faixas') + '</span></summary>' +
      '<div class="adm-grade">' +
        '<label>Tipo<select data-r="type">' + opcoes(tipos, r.type || 'lp') + '</select></label>' +
        '<label>Título<input type="text" data-r="title" value="' + esc(r.title || '') + '"></label>' +
        '<label>Ano<input type="text" data-r="year" value="' + esc(r.year || '') + '" placeholder="1985"></label>' +
        '<label>Data exata <small>(se souber)</small><input type="text" data-r="date" value="' + esc(r.date || '') + '" placeholder="1985-08-05"></label>' +
        '<label>Gravadora<input type="text" data-r="label" value="' + esc(r.label || '') + '"></label>' +
        '<label>Formato<input type="text" data-r="format" value="' + esc(r.format || '') + '" placeholder="LP, compacto simples 7&quot;…"></label>' +
        '<label>Crédito <small>(se não for só do artista)</small><input type="text" data-r="credit" value="' + esc(r.credit || '') + '"></label>' +
        '<label>Id<input type="text" data-r="id" value="' + esc(r.id || '') + '" placeholder="automático"></label>' +
        '<label class="larga">Nota<textarea data-r="note" rows="2">' + esc(r.note || '') + '</textarea></label>' +
        '<label class="larga">Fontes <small>(uma por linha)</small><textarea data-r="src" rows="2">' + esc(fontesParaTexto(r.src)) + '</textarea></label>' +
        '<label class="adm-check larga"><input type="checkbox" data-r="partial"' + (r.partial ? ' checked' : '') + '> Lista parcial (só as faixas que conhecemos)</label>' +
      '</div>' +
      '<div class="adm-tab-faixas"><table class="adm-faixas"><thead><tr><th>Faixa</th><th>Título</th><th>Duração</th><th>Versão <small>(vazio = a principal)</small></th><th>Compositores</th><th>Participação</th><th>Obs.</th><th>Id da música</th><th></th></tr></thead>' +
        '<tbody>' + (r.tracks || []).map(linhaFaixa).join('') + '</tbody></table></div>' +
      '<div class="adm-disco-acoes"><button type="button" class="btn btn-p" data-adm="faixa-mais">+ Faixa</button>' +
        '<button type="button" class="btn btn-p" data-adm="faixas-colar">Colar lista de faixas…</button>' +
        '<button type="button" class="btn btn-p adm-perigo" data-adm="disco-tira">Tirar este disco</button></div>' +
    '</details>';
  }

  function telaArtista(id) {
    const novo = id === 'novo';
    const a = novo ? { releases: [] } : rawArtista(id);
    if (!a) return V.box('Artista não encontrado', '<p>Não há artista com o id “' + esc(id) + '”. <a href="#admin/artistas">Voltar</a></p>');
    return '<form class="box adm adm-form" id="adm-artista" novalidate autocomplete="off"><div class="box-h"><h2>' + (novo ? 'Novo artista' : 'Editar: ' + esc(a.name)) + '</h2>' +
        (novo ? '' : '<span class="box-h-dir"><a href="#a-' + esc(a.id) + '">ver no site</a></span>') + '</div><div class="box-c">' +
      '<fieldset><legend>Artista</legend><div class="adm-grade">' +
        campo('name', 'Nome', a.name || '') +
        (novo ? campo('id', 'Id', '', { ajuda: '(vazio = criado do nome)' }) : campo('id', 'Id', a.id, { attrs: ' readonly', ajuda: '(não muda: os vídeos usam este id)' })) +
        campo('alt', 'Outros nomes', (a.alt || []).join(', '), { ajuda: '(separe com vírgula)' }) +
        campo('country', 'País', a.country || '', { list: 'adm-paises', ph: 'BR', ajuda: '(código de 2 letras)' }) +
        campo('origin', 'Cidade / origem', a.origin || '') +
        campo('years', 'Em atividade', a.years || '', { ph: '1983–1990' }) +
        campo('intro', 'Sobre', a.intro || '', { tipo: 'textarea', rows: 4, ajuda: '(com as suas palavras; cite as fontes abaixo)' }) +
        campoEn('intro', 'Sobre', a.intro_en, 3) +
        campo('members', 'Formação', (a.members || []).map((m) => m.name + (m.role || m.years ? ' | ' + (m.role || '') : '') + (m.years ? ' | ' + m.years : '')).join('\n'), { tipo: 'textarea', rows: 3, ajuda: '(uma pessoa por linha: “Nome | função | anos”)' }) +
        campo('src', 'Fontes', fontesParaTexto(a.src), { tipo: 'textarea', rows: 3, ajuda: '(uma por linha: “Título | https://link”, ou o id de uma fonte cadastrada)' }) +
      '</div>' + datalistPaises() + '</fieldset>' +
      '<fieldset><legend>Foto do artista</legend><div class="adm-capa adm-foto">' +
        '<div class="adm-foto-prev"></div>' +
        '<div class="adm-capa-txt"><p class="mini">Imagem quadrada: aparece na lista de artistas e na página do artista, no lugar do disco. Você enquadra antes de salvar.</p>' +
          '<div class="adm-capa-botoes"><button type="button" class="btn btn-b" data-adm="foto-img">Escolher imagem…</button>' +
          '<button type="button" class="btn" data-adm="foto-ajustar">Reenquadrar</button>' +
          '<button type="button" class="btn" data-adm="foto-remover">Sem foto</button></div>' +
          '<input type="hidden" name="photo" value="' + esc(a.photo || '') + '"><p class="mini adm-foto-info"></p></div>' +
      '</div></fieldset>' +
      '<fieldset><legend>Discografia</legend>' +
        '<p class="mini">Cada disco com as faixas em ordem. A coluna <b>Id da música</b> liga as faixas aos vídeos: a mesma música em discos diferentes usa o mesmo id (fica automático a partir do título). ' +
        'Use <b>Versão</b> para gravações diferentes da mesma música (ao vivo, remix, regravação).</p>' +
        '<div class="adm-discos">' + (a.releases || []).map((r, i) => blocoDisco(r, i)).join('') + '</div>' +
        '<button type="button" class="btn" data-adm="disco-mais">+ Disco</button>' +
      '</fieldset>' +
      '<div class="adm-salvar"><button type="button" class="btn btn-y" data-adm="salvar-artista">' + (GH.conexao() ? 'Salvar e publicar' : 'Salvar neste navegador') + '</button>' +
        '<a class="btn" href="#admin/artistas">Cancelar</a>' +
        (novo ? '' : '<button type="button" class="btn adm-perigo" data-adm="apagar-artista" data-id="' + esc(a.id) + '">Apagar artista</button>') +
        '<p class="form-msg adm-msg" role="status"></p></div>' +
    '</div></form>';
  }

  function ligarArtista(root, idOriginal) {
    const f = root.querySelector('#adm-artista');
    if (!f) return;
    const original = idOriginal === 'novo' ? null : rawArtista(idOriginal);
    function mostrarFoto() {
      const caminho = f.elements.photo.value;
      const url = E.fotoNova || (caminho ? (AMB.local.arquivo(caminho) || caminho) : '');
      const nome = f.elements.name.value || '?';
      f.querySelector('.adm-foto-prev').innerHTML = V.discoIcone({ id: f.elements.id.value || nome, name: nome, photo: url }, 'g');
      f.querySelector('[data-adm="foto-ajustar"]').hidden = !url;
      f.querySelector('.adm-foto-info').innerHTML = E.fotoNova ? 'Imagem nova (500×500). Vai para <code>media/artistas/…</code> ao salvar.'
        : caminho ? 'Atual: <code>' + esc(caminho) + '</code>' : 'Sem foto: aparece o disco com a inicial do nome.';
    }
    f.elements.name.addEventListener('input', mostrarFoto);
    mostrarFoto();
    f.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-adm]');
      if (!b) return;
      const acao = b.dataset.adm;
      if (acao === 'foto-img' || acao === 'foto-ajustar') {
        const atual = acao === 'foto-ajustar' ? (E.fotoNova || AMB.local.arquivo(f.elements.photo.value) || f.elements.photo.value) : '';
        const r = await AMB.Capa.escolher({ titulo: acao === 'foto-ajustar' ? 'Reenquadrar a foto' : 'Foto do artista', proporcao: 1, largura: 500, atual });
        if (r) { E.fotoNova = r.dataUrl; E.sujo = true; mostrarFoto(); }
        return;
      }
      if (acao === 'foto-remover') { E.fotoNova = null; f.elements.photo.value = ''; E.sujo = true; mostrarFoto(); return; }
      const disco = b.closest('.adm-disco');
      const tr = b.closest('tr');
      if (acao === 'disco-mais') {
        f.querySelector('.adm-discos').insertAdjacentHTML('beforeend', blocoDisco(null, null));
        E.sujo = true;
        const novo = f.querySelector('.adm-discos .adm-disco:last-child [data-r="title"]');
        if (novo) novo.focus();
      } else if (acao === 'disco-tira') {
        const nome = disco.querySelector('[data-r="title"]').value || 'este disco';
        if (await confirmar({ titulo: 'Tirar “' + nome + '” da discografia?', ok: 'Tirar', perigo: true, html: '<p>As faixas dele somem da página do artista quando você salvar.</p>' })) { disco.remove(); E.sujo = true; }
      } else if (acao === 'faixa-mais') {
        const tb = disco.querySelector('tbody');
        const n = tb.rows.length + 1;
        tb.insertAdjacentHTML('beforeend', linhaFaixa({ n: String(n) }));
        tb.rows[tb.rows.length - 1].querySelector('[data-f="t"]').focus();
        E.sujo = true;
      } else if (acao === 'faixa-tira') { tr.remove(); E.sujo = true; }
      else if (acao === 'faixa-sobe' && tr.previousElementSibling) { tr.parentNode.insertBefore(tr, tr.previousElementSibling); E.sujo = true; }
      else if (acao === 'faixa-desce' && tr.nextElementSibling) { tr.parentNode.insertBefore(tr.nextElementSibling, tr); E.sujo = true; }
      else if (acao === 'faixas-colar') {
        const r = await confirmar({ titulo: 'Colar lista de faixas', ok: 'Adicionar',
          html: '<p class="mini">Uma faixa por linha. Aceita “1. Título 3:45”, “A1 Título”, ou só o título. As faixas entram no fim da lista deste disco.</p>' +
            '<textarea name="lista" class="adm-colar" rows="10"></textarea>' });
        if (r && r.lista) { adicionarColadas(disco, r.lista); E.sujo = true; }
      } else if (acao === 'salvar-artista') salvarArtista(f, original, b);
      else if (acao === 'apagar-artista') apagarArtista(b.dataset.id, root);
    });
    f.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset && t.dataset.f === 't') {
        // atualiza o resumo do disco e sugere o id da música enquanto digita
        const song = t.closest('tr').querySelector('[data-f="song"]');
        if (song && !song.dataset.mexido) song.placeholder = AMB.slug(AMB.cleanTitle(t.value)) || 'auto';
      }
      if (t.dataset && t.dataset.f === 'song') t.dataset.mexido = '1';
      if (t.dataset && (t.dataset.r === 'title' || t.dataset.r === 'year' || t.dataset.r === 'type')) {
        const d = t.closest('.adm-disco');
        const tipo = d.querySelector('[data-r="type"]').value;
        d.querySelector('summary b').textContent = [AMB.RELTYPES[tipo] || tipo, d.querySelector('[data-r="year"]').value, d.querySelector('[data-r="title"]').value].filter(Boolean).join(' · ') || 'Disco novo';
      }
    });
  }
  function adicionarColadas(disco, texto) {
    const tb = disco.querySelector('tbody');
    linhas(texto).forEach((l) => {
      let n = '', t = l, len = '';
      const mDur = /\s[-–—(]?\s*(\d{1,2}:\d{2})\)?\s*$/.exec(t);
      if (mDur) { len = mDur[1]; t = t.slice(0, mDur.index); }
      // "1. Título", "01 Título", "A1 Título", "B. Título" (uma letra sozinha só com ponto: "A Dança" é título)
      const mN = /^\s*(?:([A-Da-d]?\d{1,2})[.)\-–:\s]|([A-Da-d])[.)\-–:])\s*/.exec(t);
      if (mN) { n = (mN[1] || mN[2]).toUpperCase(); t = t.slice(mN[0].length); }
      t = t.replace(/^["“]|["”]$/g, '').trim();
      if (!t) return;
      tb.insertAdjacentHTML('beforeend', linhaFaixa({ n: n || String(tb.rows.length + 1), t, len }));
    });
  }

  function coletarArtista(f, original) {
    const val = (k) => String((f.elements[k] && f.elements[k].value) || '').trim();
    const a = original ? clone(original) : {};
    const nome = val('name');
    if (!nome) return { erro: 'Falta o nome do artista.', campo: 'name' };
    let id = original ? original.id : AMB.slug(val('id') || nome);
    if (!id) return { erro: 'Não deu para criar o id: confira o nome.', campo: 'name' };
    if (!original && rawArtista(id)) return { erro: 'Já existe um artista com o id “' + id + '” (' + rawArtista(id).name + ').', campo: 'id' };
    a.id = id;
    a.name = nome;
    put(a, 'alt', val('alt').split(',').map((s) => s.trim()).filter(Boolean));
    put(a, 'country', val('country').toUpperCase());
    put(a, 'origin', val('origin'));
    put(a, 'years', val('years'));
    put(a, 'intro', val('intro'));
    put(a, 'intro_en', val('intro_en'));
    put(a, 'members', linhas(val('members')).map((l) => {
      const p = l.split('|').map((s) => s.trim());
      const m = { name: p[0] };
      if (p[1]) m.role = p[1];
      if (p[2]) m.years = p[2];
      return m;
    }).filter((m) => m.name));
    const src = fontesDeTexto(val('src'));
    if (!src.every(linkOk)) return { erro: 'Algum link das fontes não começa com https://', campo: 'src' };
    put(a, 'src', src);
    const discos = [];
    const ids = new Set();
    let erro = null;
    f.querySelectorAll('.adm-disco').forEach((d) => {
      if (erro) return;
      const rv = (k) => { const el = d.querySelector('[data-r="' + k + '"]'); return el ? String(el.value || '').trim() : ''; };
      const orig = d.dataset.orig !== '' && original && original.releases ? original.releases[Number(d.dataset.orig)] : null;
      const r = orig ? clone(orig) : {};
      const tracks = [];
      d.querySelectorAll('tbody tr').forEach((tr) => {
        const tv = (k) => String(tr.querySelector('[data-f="' + k + '"]').value || '').trim();
        if (!tv('t')) return;
        const t = { n: tv('n') || String(tracks.length + 1), t: tv('t') };
        const song = tv('song') ? AMB.slug(tv('song')) : AMB.slug(AMB.cleanTitle(tv('t')));
        if (song) t.song = song;
        if (tv('ver')) t.ver = AMB.slug(tv('ver'));
        if (tv('feat')) t.feat = tv('feat');
        if (tv('len')) t.len = tv('len');
        if (tv('w')) t.w = tv('w');
        if (tv('note')) t.note = tv('note');
        tracks.push(t);
      });
      const titulo = rv('title');
      if (!titulo && !tracks.length) return; // bloco vazio: ignora
      if (!titulo) { erro = { erro: 'Um dos discos está sem título.', campo: null }; return; }
      r.type = rv('type') || 'lp';
      r.title = titulo;
      put(r, 'credit', rv('credit'));
      const ano = rv('year');
      if (ano && !/^\d{4}$/.test(ano)) { erro = { erro: 'O ano de “' + titulo + '” precisa ter 4 dígitos.' }; return; }
      put(r, 'year', ano ? Number(ano) : '');
      if (rv('date') && !dataOk(normData(rv('date')))) { erro = { erro: 'A data de “' + titulo + '” está num formato que não reconheci (use 1985-08-05).' }; return; }
      put(r, 'date', normData(rv('date')));
      put(r, 'label', rv('label'));
      put(r, 'format', rv('format'));
      put(r, 'note', rv('note'));
      put(r, 'partial', d.querySelector('[data-r="partial"]').checked ? true : '');
      const rsrc = fontesDeTexto(rv('src'));
      if (!rsrc.every(linkOk)) { erro = { erro: 'Algum link das fontes de “' + titulo + '” não começa com https://' }; return; }
      put(r, 'src', rsrc);
      r.tracks = tracks;
      const idDisco = AMB.slug(rv('id')) || AMB.slug(titulo + (ano ? '-' + ano : ''));
      r.id = idUnico(idDisco, (x) => ids.has(x));
      ids.add(r.id);
      discos.push(ordenar(r, ORDEM_DISCO));
    });
    if (erro) return erro;
    a.releases = discos;
    return { a: ordenar(a, ORDEM_ARTISTA) };
  }

  async function salvarArtista(f, original, botao) {
    const msg = f.querySelector('.adm-msg');
    const r = coletarArtista(f, original);
    if (r.erro) {
      msg.className = 'form-msg adm-msg erro';
      msg.textContent = r.erro;
      if (r.campo && f.elements[r.campo]) f.elements[r.campo].focus();
      return;
    }
    if (botao) botao.disabled = true;
    await completarIngles(r.a, original, ['intro'], msg);
    if (botao) botao.disabled = false;
    const ops = [];
    let foto = String(f.elements.photo.value || '').trim();
    if (E.fotoNova) {
      const caminho = 'media/artistas/' + r.a.id + '.jpg';
      foto = caminho + '?v=' + Date.now().toString(36);
      ops.push({ t: 'arquivo', caminho, dataUrl: E.fotoNova });
    }
    if (foto) r.a.photo = foto; else delete r.a.photo;
    r.a = ordenar(r.a, ORDEM_ARTISTA);
    ops.push({ t: 'artista', id: r.a.id, dados: r.a });
    salvarOps(ops, {
      msgEl: msg, botoes: [botao], ok: r.a.name + (original ? ' foi atualizado.' : ' entrou no acervo.'), depois: '#admin/artistas', ver: '#a-' + r.a.id
    });
  }

  async function apagarArtista(id, root) {
    const a = rawArtista(id);
    if (!a) return;
    const n = (AMB.dados.videos || []).filter((v) => v.artist === id).length;
    if (n) {
      await confirmar({ titulo: 'Ainda não dá para apagar', ok: 'Entendi', html: '<p>' + esc(a.name) + ' tem ' + V.pl(n, 'vídeo', 'vídeos') + '. Apague esses vídeos ou mude o artista deles antes.</p>' });
      return;
    }
    if (!(await confirmar({ titulo: 'Apagar ' + a.name + '?', ok: 'Apagar', perigo: true, html: '<p>A página do artista e a discografia cadastrada saem do site.</p>' }))) return;
    E.sujo = false;
    const msgEl = root.querySelector('.adm-msg') || root.querySelector('.box-c');
    const antes = location.hash;
    if (await salvarOps([{ t: 'apagar-artista', id, nome: a.name }], { msgEl, ok: a.name + ' foi apagado.', depois: '#admin/artistas' }) && location.hash === antes) AMB.render();
  }

  /* =================== acervos (colaboradores) =================== */
  function referenciasAcervo(id) {
    let n = 0;
    (AMB.dados.videos || []).forEach((v) => {
      const cr = v.credits || {};
      const usa = ['tape', 'capture', 'sync', 'restore'].some((k) => cr[k] === id) || (cr.extra || []).some((x) => x.who === id) ||
        (v.audio || []).some((t) => t.by === id) || v.added_by === id;
      if (usa) n++;
    });
    return n;
  }
  function telaAcervos() {
    const lista = (AMB.dados.acervos || []).filter((c) => c && c.id);
    return '<section class="box box-azul"><div class="box-h"><h2>Acervos</h2><span class="box-h-dir">quem cede fitas, digitaliza e sincroniza</span></div><div class="box-c">' +
      '<div class="adm-barra"><a class="btn btn-y" href="#admin/acervo/novo">+ Novo acervo</a></div>' +
      '<div class="adm-lista">' + lista.map((c) => {
        const cc = AMB.acervos[c.id] || c;
        return '<div class="adm-item adm-item-art">' + V.avatar(cc, 'm') +
          '<div class="adm-item-txt"><a class="adm-item-tit" href="#admin/acervo/' + esc(c.id) + '">' + esc(c.name) + '</a>' +
            '<span class="mini">' + esc((c.roles || []).map((r) => AMB.ROLES[r] || r).join(', ')) + '</span>' +
            '<span class="mini">' + V.pl(referenciasAcervo(c.id), 'vídeo com crédito', 'vídeos com crédito') + '</span></div>' +
          '<div class="adm-item-acoes"><a class="btn btn-p" href="#admin/acervo/' + esc(c.id) + '">Editar</a><a class="btn btn-p" href="#c-' + esc(c.id) + '">Ver</a>' +
            '<button type="button" class="btn btn-p adm-perigo" data-adm="apagar-acervo" data-id="' + esc(c.id) + '">Apagar</button></div></div>';
      }).join('') + '</div>' +
      '<p class="mini">Os créditos de cada vídeo (fita cedida por, captura, sincronização, áudio digitalizado por) usam o id do acervo: assim o nome vira link para a página dele.</p>' +
    '</div></section>';
  }
  function telaAcervo(id) {
    const novo = id === 'novo';
    const c = novo ? { roles: [] } : rawAcervo(id);
    if (!c) return V.box('Acervo não encontrado', '<p>Não há acervo com o id “' + esc(id) + '”. <a href="#admin/acervos">Voltar</a></p>');
    return '<form class="box adm adm-form" id="adm-acervo" novalidate autocomplete="off"><div class="box-h"><h2>' + (novo ? 'Novo acervo' : 'Editar: ' + esc(c.name)) + '</h2></div><div class="box-c">' +
      '<fieldset><legend>Acervo</legend><div class="adm-grade">' +
        campo('name', 'Nome que aparece no site', c.name || '') +
        (novo ? campo('id', 'Id', '', { ajuda: '(vazio = criado do nome)' }) : campo('id', 'Id', c.id, { attrs: ' readonly', ajuda: '(não muda: os créditos usam este id)' })) +
        campo('since', 'Colabora desde', c.since || '', { ph: '2026-11' }) +
        campo('city', 'Cidade', c.city || '', { ph: 'Cidade, UF' }) +
        '<div class="larga adm-papeis"><b class="mini">Colabora com</b> ' + Object.keys(AMB.ROLES).map((k) =>
          '<label class="adm-check"><input type="checkbox" name="role_' + k + '"' + ((c.roles || []).indexOf(k) >= 0 ? ' checked' : '') + '> ' + esc(AMB.ROLES[k]) + '</label>').join('') + '</div>' +
        campo('bio', 'Sobre', c.bio || '', { tipo: 'textarea', rows: 3 }) +
        campoEn('bio', 'Sobre', c.bio_en, 2) +
        campo('links', 'Links', fontesParaTexto(c.links), { tipo: 'textarea', rows: 2, ajuda: '(“Texto | https://link”, um por linha)' }) +
      '</div></fieldset>' +
      '<fieldset><legend>Foto ou logo</legend><div class="adm-capa adm-foto">' +
        '<div class="adm-foto-prev"></div>' +
        '<div class="adm-capa-txt"><div class="adm-capa-botoes"><button type="button" class="btn btn-b" data-adm="foto-img">Escolher imagem…</button>' +
          '<button type="button" class="btn" data-adm="foto-remover">Sem foto</button></div>' +
          '<input type="hidden" name="avatar" value="' + esc(c.avatar || '') + '"><p class="mini adm-foto-info"></p></div>' +
      '</div></fieldset>' +
      '<div class="adm-salvar"><button type="button" class="btn btn-y" data-adm="salvar-acervo">' + (GH.conexao() ? 'Salvar e publicar' : 'Salvar neste navegador') + '</button>' +
        '<a class="btn" href="#admin/acervos">Cancelar</a>' +
        (novo ? '' : '<button type="button" class="btn adm-perigo" data-adm="apagar-acervo" data-id="' + esc(c.id) + '">Apagar acervo</button>') +
        '<p class="form-msg adm-msg" role="status"></p></div>' +
    '</div></form>';
  }
  function ligarAcervo(root, idOriginal) {
    const f = root.querySelector('#adm-acervo');
    if (!f) return;
    const original = idOriginal === 'novo' ? null : rawAcervo(idOriginal);
    function mostrar() {
      const caminho = f.elements.avatar.value;
      const url = E.fotoNova || (caminho ? (AMB.local.arquivo(caminho) || caminho) : '');
      const nome = f.elements.name.value || '?';
      f.querySelector('.adm-foto-prev').innerHTML = V.avatar({ id: f.elements.id.value || nome, name: nome, avatar: url }, 'g');
      f.querySelector('.adm-foto-info').innerHTML = E.fotoNova ? 'Imagem nova (400×400). Vai para <code>media/acervos/…</code> ao salvar.' : caminho ? 'Atual: <code>' + esc(caminho) + '</code>' : 'Sem foto: aparece a inicial do nome.';
    }
    f.elements.name.addEventListener('input', mostrar);
    f.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-adm]');
      if (!b) return;
      const acao = b.dataset.adm;
      if (acao === 'foto-img') {
        const r = await AMB.Capa.escolher({ titulo: 'Foto ou logo do acervo', proporcao: 1, largura: 400 });
        if (r) { E.fotoNova = r.dataUrl; E.sujo = true; mostrar(); }
      } else if (acao === 'foto-remover') { E.fotoNova = null; f.elements.avatar.value = ''; E.sujo = true; mostrar(); }
      else if (acao === 'salvar-acervo') salvarAcervo(f, original, b);
      else if (acao === 'apagar-acervo') apagarAcervo(b.dataset.id, root);
    });
    mostrar();
  }
  async function salvarAcervo(f, original, botao) {
    const val = (k) => String((f.elements[k] && f.elements[k].value) || '').trim();
    const msg = f.querySelector('.adm-msg');
    const falha = (t, campo_) => { msg.className = 'form-msg adm-msg erro'; msg.textContent = t; if (campo_ && f.elements[campo_]) f.elements[campo_].focus(); };
    const c = original ? clone(original) : {};
    const nome = val('name');
    if (!nome) return falha('Falta o nome.', 'name');
    const id = original ? original.id : AMB.slug(val('id') || nome);
    if (!id) return falha('Não deu para criar o id: confira o nome.', 'name');
    if (!original && rawAcervo(id)) return falha('Já existe um acervo com o id “' + id + '”.', 'id');
    if (val('since') && !/^\d{4}(-\d{2})?$/.test(val('since'))) return falha('“Colabora desde” no formato 2026-11.', 'since');
    const links = fontesDeTexto(val('links'), true);
    if (!links.every((l) => l.u && AMB.isUrl(l.u))) return falha('Cada link precisa de um endereço https://, no formato “Texto | https://link”.', 'links');
    c.id = id;
    c.name = nome;
    put(c, 'roles', Object.keys(AMB.ROLES).filter((k) => f.elements['role_' + k] && f.elements['role_' + k].checked));
    put(c, 'since', val('since'));
    put(c, 'city', val('city'));
    put(c, 'bio', val('bio'));
    put(c, 'bio_en', val('bio_en'));
    put(c, 'links', links);
    const ops = [];
    let avatar = val('avatar');
    if (E.fotoNova) {
      const caminho = 'media/acervos/' + id + '.jpg';
      avatar = caminho + '?v=' + Date.now().toString(36);
      ops.push({ t: 'arquivo', caminho, dataUrl: E.fotoNova });
    }
    put(c, 'avatar', avatar);
    await completarIngles(c, original, ['bio'], msg);
    ops.push({ t: 'acervo', id, dados: ordenar(c, ORDEM_ACERVO) });
    salvarOps(ops, { msgEl: msg, botoes: [botao], ok: nome + (original ? ' foi atualizado.' : ' entrou na lista de acervos.'), depois: '#admin/acervos', ver: '#c-' + id });
  }
  async function apagarAcervo(id, root) {
    const c = rawAcervo(id);
    if (!c) return;
    const n = referenciasAcervo(id);
    if (!(await confirmar({ titulo: 'Apagar o acervo ' + c.name + '?', ok: 'Apagar', perigo: true,
      html: '<p>A página do acervo sai do site.' + (n ? ' Ele aparece nos créditos de ' + V.pl(n, 'vídeo', 'vídeos') + ': lá o nome continua, mas sem link.' : '') + '</p>' }))) return;
    E.sujo = false;
    const ops = [{ t: 'apagar-acervo', id, nome: c.name }];
    if (c.avatar && /^media\//.test(c.avatar)) ops.push({ t: 'apagar-arquivo', caminho: GH.semQuery(c.avatar) });
    const msgEl = root.querySelector('.adm-msg') || root.querySelector('.box-c');
    const antes = location.hash;
    if (await salvarOps(ops, { msgEl, ok: c.name + ' foi apagado.', depois: '#admin/acervos' }) && location.hash === antes) AMB.render();
  }

  /* =================== publicar e conexão =================== */
  function telaPublicar() {
    const con = GH.conexao();
    const pend = AMB.local.pendente();
    const est = AMB.estado || {};
    const repo = (con && con.repo) || GH.repoPadrao();
    const dono = (repo.split('/')[0] || '').trim();
    const passos = '<ol class="passos">' +
      '<li>Abra <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener">github.com → Settings → Developer settings → Fine-grained tokens → Generate new token</a> (entre com a sua conta).</li>' +
      '<li><b>Token name</b>: “Ambário – área do curador”. <b>Expiration</b>: o prazo que preferir (quando vencer, é só criar outro).</li>' +
      '<li><b>Resource owner</b>: escolha <b>' + esc(dono || 'o dono do repositório') + '</b>.</li>' +
      '<li><b>Repository access</b>: <i>Only select repositories</i> → <b>' + esc(repo || 'o repositório do site') + '</b>.</li>' +
      '<li><b>Permissions → Repository permissions → Contents</b>: <i>Read and write</i>. (O “Metadata: Read-only” entra sozinho.) Nada mais.</li>' +
      '<li>Clique em <b>Generate token</b>, copie o código (começa com <code>github_pat_</code>) e cole aqui embaixo.</li>' +
      '<li>Se o repositório é de uma organização, o GitHub pede que o dono aprove o token: na página da organização, <b>Settings → Personal access tokens → Pending requests</b> → aprovar. Sem isso, o teste de conexão diz que falta permissão.</li>' +
    '</ol>';
    const conexao = con
      ? '<p>● Conectado como <b>' + esc(con.login || '?') + '</b> em <b>' + esc(con.repo) + '</b> (ramo <code>' + esc(con.branch) + '</code>). ' +
          (con.lembrar ? 'O token fica guardado neste navegador.' : 'O token vale até você fechar esta aba.') + '</p>' +
        '<p class="mini">Cada “Salvar” vira um commit no repositório e o site público atualiza em 1 ou 2 minutos. Use a área do curador só em computadores seus.</p>' +
        '<button type="button" class="btn" data-adm="desconectar">Desconectar e apagar o token deste navegador</button>'
      : '<p>Conecte uma vez e cada “Salvar” publica direto no site, com as capas. O token fica só neste navegador: não vai para nenhum arquivo do site.</p>' +
        '<details class="adm-det"' + (pend ? '' : ' open') + '><summary>Como criar o token (uma vez só)</summary>' + passos + '</details>' +
        '<form class="adm adm-conectar" novalidate autocomplete="off"><div class="adm-grade">' +
          campo('token', 'Token do GitHub', '', { tipo: 'password', ph: 'github_pat_…', larga: true, attrs: ' autocomplete="off" spellcheck="false"' }) +
          campo('repo', 'Repositório', repo, { ph: 'dono/nome' }) +
          campo('branch', 'Ramo', AMB.cfg('GITHUB_BRANCH', 'main'), { ph: 'main' }) +
          '<label class="adm-check larga"><input type="checkbox" name="lembrar" checked> Lembrar neste navegador <small>(desmarque em computador dos outros)</small></label>' +
        '</div><div class="form-pe"><button type="button" class="btn btn-y" data-adm="conectar">Conectar</button></div>' +
        '<p class="form-msg adm-msg-con" role="status"></p></form>';

    const pendHtml = pend
      ? '<p><b>' + V.pl(pend.ops.length, 'alteração', 'alterações') + '</b> guardada' + (pend.ops.length > 1 ? 's' : '') + ' só neste navegador, desde ' + esc(AMB.fmtDate(String(pend.desde || '').slice(0, 10))) + ':</p>' +
        '<ul class="adm-pend">' + pend.ops.map((op) => '<li>' + esc(descreverOp(op)) + '</li>').join('') + '</ul>' +
        (est.erro ? '<p class="erro">Alguma alteração não pôde ser aplicada (' + esc(est.erro) + '). Publique ou descarte.</p>' : '') +
        ((Number(AMB.servido.rev) || 0) > (Number(pend.baseRev) || 0) ? '<p class="mini">O site foi atualizado depois que você começou estas alterações. Se você já subiu o pacote pelo GitHub, pode descartá-las.</p>' : '') +
        '<div class="form-pe">' + (con ? '<button type="button" class="btn btn-y" data-adm="publicar">Publicar agora</button>' : '') +
          '<button type="button" class="btn btn-b" data-adm="baixar-zip">Baixar pacote (.zip)</button>' +
          '<button type="button" class="btn adm-perigo" data-adm="descartar">Descartar alterações</button></div>' +
        '<p class="form-msg adm-msg" role="status"></p>' +
        '<details class="adm-det"><summary>Publicar sem token, pelo site do GitHub</summary><ol class="passos">' +
          '<li>Clique em <b>Baixar pacote (.zip)</b> e descompacte: dentro tem as pastas <code>data</code> e, se houver imagens novas, <code>media</code>.</li>' +
          '<li>No GitHub, abra o repositório <b>' + esc(repo) + '</b> → <b>Add file → Upload files</b> e arraste essas pastas. Clique em <b>Commit changes</b>.</li>' +
          '<li>Se a lista acima tiver “Apagar arquivo”, apague esses arquivos no GitHub também.</li>' +
          '<li>Volte aqui e clique em <b>Descartar alterações</b> (elas já estarão no site).</li>' +
        '</ol></details>'
      : '<p>Nenhuma alteração pendente. Tudo que você salvou já está no GitHub.</p>';

    const pub = est.publicado ? '<p>Você publicou ' + esc(AMB.ago(est.publicado.em)) + ' (revisão ' + esc(est.publicado.rev) + '). Este navegador já mostra a versão nova; o site público pode levar 1 ou 2 minutos.</p>' : '';
    return V.box('Conexão com o GitHub', conexao, 'box-azul adm-sec-con') +
      V.box('Alterações neste navegador', pendHtml, 'adm-sec-pend') +
      V.box('Versão do site', pub + '<p class="mini">O site público está na revisão ' + esc(AMB.servido.rev || 0) + (AMB.servido.updated ? ', de ' + esc(AMB.fmtDate(AMB.servido.updated)) : '') + '. ' +
        'Os dados ficam em <code>' + esc(GH.ARQ_DADOS) + '</code> e as capas em <code>media/capas/</code>.</p>', 'adm-sec-versao');
  }
  function ligarPublicar(root) {
    root.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-adm]');
      if (!b) return;
      const acao = b.dataset.adm;
      if (acao === 'conectar') {
        const f = b.closest('form');
        const msg = f.querySelector('.adm-msg-con');
        msg.className = 'form-msg adm-msg-con';
        msg.textContent = 'Conferindo o token no GitHub…';
        b.disabled = true;
        try {
          const con = await GH.conectar(f.elements.token.value, f.elements.repo.value, f.elements.branch.value);
          GH.guardarConexao(con, f.elements.lembrar.checked);
          f.elements.token.value = '';
          E.flash = { tipo: 'ok', html: '<b>Conectado!</b> Agora “Salvar” publica direto no GitHub.' + (AMB.local.pendente() ? ' Você tem alterações guardadas neste navegador: publique abaixo.' : '') };
          AMB.render();
        } catch (er) {
          msg.className = 'form-msg adm-msg-con erro';
          msg.textContent = er.message || String(er);
        } finally { b.disabled = false; }
      } else if (acao === 'desconectar') {
        GH.esquecerConexao();
        E.flash = { tipo: 'aviso', html: 'Desconectado. O token foi apagado deste navegador.' };
        AMB.render();
      } else if (acao === 'publicar') {
        const pend = AMB.local.pendente();
        if (!pend) return;
        const msgEl = root.querySelector('.adm-sec-pend .adm-msg');
        const ops = pend.ops;
        const con = GH.conexao();
        if (!con || E.ocupado) return;
        E.ocupado = true;
        b.disabled = true;
        try {
          const r = await GH.publicar(con, ops, mensagemCommit(ops), (t) => { msgEl.className = 'form-msg adm-msg'; msgEl.textContent = t; });
          AMB.local.limparPendente();
          AMB.local.salvarPublicado(r.dados, r.commit, ops);
          AMB.build();
          E.flash = { tipo: 'ok', html: '<b>Publicado!</b> ' + V.pl(ops.length, 'alteração', 'alterações') + ' no GitHub. O site público atualiza em 1 ou 2 minutos. <a href="' + esc(r.url) + '" target="_blank" rel="noopener">Ver o commit ↗</a>' };
          AMB.render();
        } catch (er) {
          msgEl.className = 'form-msg adm-msg erro';
          msgEl.textContent = 'Não publicou: ' + (er.message || er);
        } finally { E.ocupado = false; b.disabled = false; }
      } else if (acao === 'baixar-zip') {
        baixarPacote();
      } else if (acao === 'descartar') {
        if (!(await confirmar({ titulo: 'Descartar as alterações deste navegador?', ok: 'Descartar', perigo: true,
          html: '<p>Tudo que está na lista volta a ser como no site público. Isso não mexe no GitHub.</p>' }))) return;
        AMB.local.limparPendente();
        AMB.build();
        E.flash = { tipo: 'aviso', html: 'Alterações descartadas.' };
        AMB.render();
      }
    });
  }
  function baixarPacote() {
    const pend = AMB.local.pendente();
    if (!pend) return;
    const base = (AMB.local.publicado() || {}).dados || AMB.servido;
    const dados = GH.novaVersao(base, pend.ops);
    const arquivos = [{ caminho: GH.ARQ_DADOS, bytes: new TextEncoder().encode(GH.textoArquivo(dados)) }];
    pend.ops.filter((o) => o.t === 'arquivo' && o.dataUrl).forEach((o) => arquivos.push({ caminho: GH.semQuery(o.caminho), bytes: GH.bytesDeDataUrl(o.dataUrl) }));
    const blob = GH.zip(arquivos);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ambario-alteracoes-' + GH.hoje() + '.zip';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }

  /* =================== roteamento da área =================== */
  function render(root, rota) {
    const partes = String(rota || 'admin').split('/');
    const sec = partes[1] || 'videos';
    const id = partes.slice(2).join('/');
    E.sujo = false; E.capaNova = null; E.capaRemovida = false; E.fotoNova = null; E.discogs = null;
    let corpo = '', aba = sec;
    if (sec === 'videos') corpo = telaVideos();
    else if (sec === 'video') { corpo = telaVideo(id || 'novo'); aba = 'videos'; }
    else if (sec === 'artistas') corpo = telaArtistas();
    else if (sec === 'artista') { corpo = telaArtista(id || 'novo'); aba = 'artistas'; }
    else if (sec === 'acervos') corpo = telaAcervos();
    else if (sec === 'acervo') { corpo = telaAcervo(id || 'novo'); aba = 'acervos'; }
    else if (sec === 'publicar') corpo = telaPublicar();
    else corpo = V.box('Página não encontrada', '<p><a href="#admin">Voltar à área do curador</a></p>');
    root.innerHTML = cabecalho(aba) + flash() + corpo;
    // marca o formulário como "mexido" a cada alteração (para perguntar antes de sair)
    root.addEventListener('input', (e) => { if (e.target.closest('.adm-form')) E.sujo = true; });
    root.addEventListener('change', (e) => { if (e.target.closest('.adm-form')) E.sujo = true; });
    root.addEventListener('submit', (e) => e.preventDefault());
    // Enter no formulário de conexão = Conectar (o formulário não tem botão de envio)
    root.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || !e.target.closest('.adm-conectar')) return;
      e.preventDefault();
      const b = root.querySelector('[data-adm="conectar"]');
      if (b && !b.disabled) b.click();
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-adm]');
      if (!b || b.closest('.adm-form')) return;
      if (b.dataset.adm === 'apagar-video') apagarVideo(b.dataset.id, root);
      else if (b.dataset.adm === 'apagar-artista') apagarArtista(b.dataset.id, root);
      else if (b.dataset.adm === 'apagar-acervo') apagarAcervo(b.dataset.id, root);
    });
    if (sec === 'videos' || sec === 'artistas') ligarLista(root);
    else if (sec === 'video') ligarVideo(root, id || 'novo');
    else if (sec === 'artista') ligarArtista(root, id || 'novo');
    else if (sec === 'acervo') ligarAcervo(root, id || 'novo');
    else if (sec === 'publicar') ligarPublicar(root);
  }

  async function confirmarSaida(seguir) {
    const ok = await confirmar({ titulo: 'Sair sem salvar?', ok: 'Sair sem salvar', cancelar: 'Continuar editando', perigo: true,
      html: '<p>Você mudou este formulário e ainda não salvou. Se sair agora, as mudanças se perdem.</p>' });
    if (ok) { E.sujo = false; seguir(); }
  }

  AMB.Admin = { render, sujo: () => E.sujo, confirmarSaida };
})();
