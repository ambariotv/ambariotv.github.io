/*
 * TV de Tubo — área do curador (#admin)
 * Monta o bloco de um vídeo novo para colar em data/acervo.js, com importação do Internet Archive
 * e um "testar neste navegador" (rascunho que só você vê). Não precisa de senha: nada aqui muda o site.
 */
(function () {
  'use strict';
  const TDT = window.TDT;
  const esc = TDT.esc;

  const IA = {
    id(txt) {
      const m = String(txt || '').trim().match(/archive\.org\/(?:details|download|embed|metadata)\/([\w.-]+)/i);
      const id = m ? m[1] : String(txt || '').trim();
      return /^[\w.-]{3,100}$/.test(id) ? id : '';
    },
    url(id, nome) { return 'https://archive.org/download/' + encodeURIComponent(id) + '/' + nome.split('/').map(encodeURIComponent).join('/'); },
    async meta(id) {
      const r = await fetch('https://archive.org/metadata/' + encodeURIComponent(id));
      const j = await r.json();
      if (!j || !j.files) throw new Error('Item não encontrado no Internet Archive (confira o identificador; itens novos levam alguns minutos para aparecer).');
      return j;
    }
  };
  const segundos = (x) => {
    if (x == null || x === '') return 0;
    if (/^\d+(\.\d+)?$/.test(String(x))) return Math.round(Number(x));
    return TDT.parseDur(x);
  };

  function opcoes(lista, atual, vazio) {
    return (vazio ? '<option value="">' + esc(vazio) + '</option>' : '') +
      lista.map(([v, t]) => '<option value="' + esc(v) + '"' + (String(atual) === String(v) ? ' selected' : '') + '>' + esc(t) + '</option>').join('');
  }
  const acervosOps = () => Object.values(TDT.acervos).map((c) => [c.id, c.name]);

  function campo(nome, rot, tipo, extra) {
    extra = extra || {};
    const ajuda = extra.ajuda ? '<small>' + extra.ajuda + '</small>' : '';
    if (tipo === 'select') return '<label>' + rot + ajuda + '<select name="' + nome + '">' + extra.ops + '</select></label>';
    if (tipo === 'textarea') return '<label class="larga">' + rot + ajuda + '<textarea name="' + nome + '" rows="' + (extra.rows || 3) + '" placeholder="' + esc(extra.ph || '') + '"></textarea></label>';
    return '<label>' + rot + ajuda + '<input type="' + (tipo || 'text') + '" name="' + nome + '" placeholder="' + esc(extra.ph || '') + '"' + (extra.list ? ' list="' + extra.list + '"' : '') + '></label>';
  }

  function render(root) {
    const artistas = TDT.artistList.map((a) => [a.id, a.name]);
    const rascunhos = TDT.drafts.list();
    root.innerHTML =
      '<h1 class="w-tit">Área do curador</h1>' +
      '<section class="box box-azul"><div class="box-h"><h2>Como entra um vídeo novo</h2></div><div class="box-c"><ol class="passos">' +
        '<li><b>Sincronize</b> no EternalDub: abra a captura da fita, use <i>Adicionar música</i> com o áudio do disco e gere o MKV (faixa 1 = disco, faixa 2 = som da fita).</li>' +
        '<li><b>Exporte</b> arrastando o MKV para <code>ferramentas/Exportar_para_o_site.bat</code>: saem o MP4 (vídeo + áudio do disco), o M4A (som da fita) e a capa JPG.</li>' +
        '<li><b>Envie</b> os três arquivos (e o MKV, como matriz) para um item novo no <a href="https://archive.org/upload" target="_blank" rel="noopener">Internet Archive</a>.</li>' +
        '<li><b>Importe</b> o item aqui embaixo, complete os dados e clique em <i>Testar neste navegador</i>.</li>' +
        '<li><b>Publique</b>: copie o bloco, cole em <code>data/acervo.js</code> (logo depois de <code>videos: [</code>) e envie o arquivo para o GitHub.</li>' +
      '</ol></div></section>' +

      '<form class="box adm" id="adm-video" novalidate><div class="box-h"><h3>Cadastrar vídeo</h3></div><div class="box-c">' +
        '<fieldset><legend>1. Internet Archive</legend>' +
          '<div class="adm-ia"><label>Identificador ou link do item <input type="text" name="ia" placeholder="ex.: tvdetubo-metro-olhar-1985"></label>' +
          '<button type="button" class="btn btn-b" data-adm="importar">Importar arquivos</button></div>' +
          '<p class="mini adm-ia-msg" role="status"></p>' +
        '</fieldset>' +
        '<fieldset><legend>2. O registro</legend><div class="adm-grade">' +
          campo('artist', 'Artista', 'select', { ops: opcoes(artistas.concat([['__novo', '+ artista novo…']]), '', 'escolha') }) +
          campo('artist_new', 'Nome do artista novo', 'text', { ajuda: ' (só se for novo)' }) +
          campo('song', 'Música', 'text', { list: 'adm-musicas', ph: 'ex.: tudo-pode-mudar', ajuda: ' (id da música; escolha da lista ou escreva o título)' }) +
          campo('ver', 'Versão', 'text', { ph: 'vazio = a do disco; ex.: ao-vivo, playback, 1984' }) +
          campo('title', 'Título do registro', 'text', { ph: 'ex.: Tudo Pode Mudar' }) +
          campo('kind', 'Tipo', 'select', { ops: opcoes(Object.keys(TDT.KINDS).map((k) => [k, TDT.KINDS[k]]), 'clipe') }) +
          campo('date', 'Data', 'text', { ph: '1985, 1985-05 ou 1985-05-12' }) +
          campo('program', 'Programa', 'text', { ph: 'ex.: Fantástico' }) +
          campo('channel', 'Emissora', 'text', { ph: 'ex.: Rede Globo' }) +
          campo('director', 'Direção', 'text') +
          campo('status', 'Situação', 'select', { ops: opcoes([['no-acervo', 'No acervo (tem arquivo)'], ['na-fila', 'Na fila'], ['procura-se', 'Procura-se']], 'no-acervo') }) +
          campo('aspect', 'Formato da imagem', 'select', { ops: opcoes([['4:3', '4:3 (TV comum)'], ['16:9', '16:9 (widescreen)']], '4:3') }) +
          campo('id', 'Id (endereço)', 'text', { ajuda: ' (deixe vazio para gerar)' }) +
        '</div><datalist id="adm-musicas"></datalist></fieldset>' +
        '<fieldset><legend>3. Arquivos</legend><div class="adm-grade">' +
          campo('video', 'Vídeo (MP4)', 'url', { ph: 'https://archive.org/download/…/….mp4' }) +
          campo('poster', 'Capa (JPG)', 'url') +
          campo('duration', 'Duração', 'text', { ph: '3:41' }) +
          campo('mirrors', 'Espelhos', 'textarea', { rows: 2, ajuda: ' (outros links do mesmo MP4, um por linha)' }) +
        '</div></fieldset>' +
        '<fieldset><legend>4. Áudios</legend><div class="adm-grade">' +
          campo('a1_label', 'Áudio principal (dentro do MP4)', 'text', { ph: 'ex.: LP Olhar (Epic, 1985)' }) +
          campo('a1_short', 'Sigla no botão', 'text', { ph: 'LP' }) +
          campo('a1_release', 'Disco de onde veio', 'select', { ops: '<option value="">—</option>' }) +
          campo('a1_by', 'Digitalizado por', 'text', { list: 'adm-acervos' }) +
          campo('a2_url', 'Som da fita (M4A)', 'url', { ph: 'https://archive.org/download/…/…-fita.m4a' }) +
          campo('a2_label', 'Nome do som da fita', 'text', { ph: 'Som original da fita VHS' }) +
          campo('a2_short', 'Sigla no botão', 'text', { ph: 'VHS' }) +
        '</div><datalist id="adm-acervos">' + acervosOps().map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + '</option>').join('') + '</datalist></fieldset>' +
        '<fieldset><legend>5. Créditos e origem</legend><div class="adm-grade">' +
          campo('tape', 'Fita cedida por', 'text', { list: 'adm-acervos', ajuda: ' (id de um acervo ou nome)' }) +
          campo('capture', 'Captura do vídeo', 'text', { list: 'adm-acervos' }) +
          campo('sync', 'Sincronização', 'text', { list: 'adm-acervos' }) +
          campo('medium', 'Mídia', 'text', { ph: 'VHS' }) +
          campo('standard', 'Padrão', 'select', { ops: opcoes([['', '—'], ['PAL-M', 'PAL-M (Brasil)'], ['NTSC', 'NTSC'], ['PAL', 'PAL'], ['SECAM', 'SECAM']], '') }) +
          campo('speed', 'Velocidade', 'select', { ops: opcoes([['', '—'], ['SP', 'SP'], ['LP', 'LP'], ['EP', 'EP / SLP']], '') }) +
          campo('from', 'Gravado de', 'text', { ph: 'ex.: TV aberta, fita comercial' }) +
          campo('aired', 'Exibido em', 'text', { ph: '1985-05-12' }) +
          campo('generation', 'Geração', 'text', { ph: 'ex.: 1ª geração (gravação original)' }) +
          campo('deck', 'Aparelho', 'text', { ph: 'ex.: Samsung SV-300W (S-Video)' }) +
          campo('capcard', 'Placa de captura', 'text') +
          campo('notes', 'Observações técnicas', 'textarea', { rows: 2 }) +
        '</div></fieldset>' +
        '<fieldset><legend>6. Textos e fontes</legend><div class="adm-grade">' +
          campo('description', 'Descrição', 'textarea', { rows: 3 }) +
          campo('note', 'Nota do curador', 'textarea', { rows: 2 }) +
          campo('src', 'Fontes', 'textarea', { rows: 3, ajuda: ' (uma por linha: id de fonte já cadastrada, ou “título | link”)' }) +
        '</div></fieldset>' +
        '<div class="adm-acoes"><button type="button" class="btn btn-y" data-adm="gerar">Gerar bloco</button>' +
          '<button type="button" class="btn btn-b" data-adm="testar">Testar neste navegador</button>' +
          '<button type="reset" class="btn">Limpar</button></div>' +
        '<p class="form-msg adm-msg" role="status"></p>' +
        '<div class="adm-saida" hidden><label class="larga">Bloco para colar em <code>data/acervo.js</code>, dentro de <code>videos: [</code><textarea readonly rows="14" class="codigo"></textarea></label>' +
          '<button type="button" class="btn" data-adm="copiar">Copiar bloco</button></div>' +
      '</div></form>' +

      (rascunhos.length ? '<section class="box"><div class="box-h"><h3>Rascunhos neste navegador</h3></div><div class="box-c"><ul class="rascunhos">' +
        rascunhos.map((r) => '<li><a href="#v-' + esc(r.id) + '">' + esc(r.title || r.id) + '</a> <span class="mini">' + esc(r.id) + '</span> ' +
          '<button type="button" class="link-btn" data-adm="apagar" data-id="' + esc(r.id) + '">apagar</button></li>').join('') + '</ul>' +
        '<p class="mini">Rascunho com o mesmo id de um vídeo publicado aparece no lugar dele, só aqui. Depois de publicar, apague o rascunho.</p></div></section>' : '') +

      '<section class="box"><div class="box-h"><h3>Modelos</h3></div><div class="box-c">' +
        '<p>Para cadastrar um <b>acervo</b> (colaborador) ou um <b>artista com discografia</b>, copie o modelo e cole na lista certa de <code>data/acervo.js</code>.</p>' +
        '<div class="modelos"><label class="larga">Acervo (em <code>acervos: [</code>)<textarea readonly rows="9" class="codigo">' + esc(MODELO_ACERVO) + '</textarea></label>' +
        '<label class="larga">Artista (em <code>artists: [</code>)<textarea readonly rows="9" class="codigo">' + esc(MODELO_ARTISTA) + '</textarea></label></div>' +
      '</div></section>';

    const f = root.querySelector('#adm-video');
    const msg = f.querySelector('.adm-msg');
    const iaMsg = f.querySelector('.adm-ia-msg');

    const atualizarArtista = () => {
      const a = TDT.artists[f.artist.value];
      const dl = root.querySelector('#adm-musicas');
      dl.innerHTML = a ? Object.values(a.songs).map((s) => '<option value="' + esc(s.id) + '">' + esc(s.t) + '</option>').join('') : '';
      f.a1_release.innerHTML = '<option value="">—</option>' + (a ? a.releases.map((r) => '<option value="' + esc(r.id) + '">' + esc(r.title + ' (' + (TDT.RELTYPES[r.type] || r.type) + ', ' + (r.year || '') + ')') + '</option>').join('') : '');
    };
    f.artist.addEventListener('change', atualizarArtista);
    f.song.addEventListener('change', () => {
      const a = TDT.artists[f.artist.value];
      const s = a && a.songs[f.song.value];
      if (s && !f.title.value) f.title.value = s.t;
    });

    root.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-adm]');
      if (!b) return;
      const acao = b.dataset.adm;
      if (acao === 'importar') {
        const id = IA.id(f.ia.value);
        if (!id) { iaMsg.textContent = 'Cole o identificador do item (o que vem depois de archive.org/details/).'; return; }
        iaMsg.textContent = 'Lendo o item ' + id + '…';
        try {
          const j = await IA.meta(id);
          const arqs = j.files.filter((x) => x.source === 'original' || /\.(mp4|m4a|mp3|jpg|jpeg|png)$/i.test(x.name));
          const achar = (re, pref) => (arqs.filter((x) => re.test(x.name) && !/__ia_thumb|_thumb\.|\.thumbs\//i.test(x.name))
            .sort((x, y) => (pref && pref.test(y.name) ? 1 : 0) - (pref && pref.test(x.name) ? 1 : 0) || (y.source === 'original') - (x.source === 'original'))[0]);
          const mp4 = achar(/\.mp4$/i, /^(?!.*_512kb)/i);
          const fita = achar(/\.(m4a|mp3|ogg|opus)$/i, /(fita|vhs|tape|original)/i);
          const capa = achar(/\.(jpe?g|png)$/i);
          if (mp4) { f.video.value = IA.url(id, mp4.name); f.duration.value = mp4.length ? TDT.fmtDur(segundos(mp4.length)) : f.duration.value; }
          if (fita) f.a2_url.value = IA.url(id, fita.name);
          if (capa) f.poster.value = IA.url(id, capa.name);
          const m = j.metadata || {};
          if (!f.title.value && m.title) f.title.value = String(m.title).replace(/^.*?\s[—-]\s/, '');
          if (!f.date.value && m.date) f.date.value = String(m.date).slice(0, 10);
          if (!f.description.value && m.description) f.description.value = String(m.description).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600);
          iaMsg.textContent = 'Encontrado: ' + [mp4 && 'vídeo ' + mp4.name, fita && 'som da fita ' + fita.name, capa && 'capa ' + capa.name].filter(Boolean).join(' · ') + (mp4 ? '' : ' — nenhum MP4 encontrado ainda (o Archive pode estar processando).');
        } catch (er) {
          iaMsg.textContent = TDT.erroMsg(er);
        }
        return;
      }
      if (acao === 'gerar' || acao === 'testar') {
        const r = montar(f);
        if (r.erro) { msg.className = 'form-msg adm-msg erro'; msg.textContent = r.erro; return; }
        const saida = root.querySelector('.adm-saida');
        saida.hidden = false;
        saida.querySelector('textarea').value = r.texto;
        msg.className = 'form-msg adm-msg ok';
        msg.textContent = acao === 'testar' ? 'Rascunho salvo. Abrindo a página do vídeo…' : 'Bloco pronto. Copie e cole em data/acervo.js.';
        if (acao === 'testar') {
          if (r.artistaNovo) msg.textContent += ' (Artista novo: no rascunho ele aparece só pelo nome. Cadastre-o em artists para ter página própria.)';
          TDT.drafts.save(r.video);
          TDT.build();
          setTimeout(() => TDT.ir('v-' + r.video.id), 400);
        }
        return;
      }
      if (acao === 'copiar') {
        const ta = root.querySelector('.adm-saida textarea');
        try { await navigator.clipboard.writeText(ta.value); b.textContent = 'Copiado!'; } catch (er) { ta.select(); try { document.execCommand('copy'); b.textContent = 'Copiado!'; } catch (e2) { b.textContent = 'Selecione e copie'; } }
        setTimeout(() => { b.textContent = 'Copiar bloco'; }, 1600);
        return;
      }
      if (acao === 'apagar') { TDT.drafts.remove(b.dataset.id); TDT.build(); render(root); }
    });
  }

  function montar(f) {
    const val = (k) => String((f[k] && f[k].value) || '').trim();
    let artista = val('artist');
    let artistaNovo = false;
    let artistName = '';
    if (!artista || artista === '__novo') {
      artistName = val('artist_new');
      if (!artistName) return { erro: 'Escolha o artista (ou escreva o nome do artista novo).' };
      artista = TDT.slug(artistName);
      artistaNovo = true;
    }
    const title = val('title');
    if (!title) return { erro: 'Falta o título do registro.' };
    let song = val('song');
    if (song && !/^[a-z0-9-]+$/.test(song)) song = TDT.slug(song);
    const status = val('status');
    const temVideo = !!val('video');
    if (status === 'no-acervo' && !temVideo) return { erro: 'Para ficar “No acervo” precisa do link do vídeo (MP4). Ou mude a situação para “Na fila”.' };
    for (const k of ['video', 'poster', 'a2_url']) if (val(k) && !TDT.isUrl(val(k)) && !/^media\//.test(val(k))) return { erro: 'Confira o link em “' + k + '”: precisa começar com https://' };
    const ano = TDT.year(val('date'));
    const id = val('id') ? TDT.slug(val('id')) : TDT.slug([artista, song || title, val('kind') === 'clipe' ? 'clipe' : val('kind'), ano].filter(Boolean).join('-'));
    const v = { id, artist: artista };
    if (artistaNovo) v.artist_name = artistName;
    if (song) v.song = song;
    if (val('ver')) v.ver = TDT.slug(val('ver'));
    Object.assign(v, { title, kind: val('kind') || 'outro' });
    if (val('date')) v.date = val('date');
    ['program', 'channel', 'director'].forEach((k) => { if (val(k)) v[k] = val(k); });
    v.status = status;
    if (val('aspect') && val('aspect') !== '4:3') v.aspect = val('aspect');
    if (val('duration')) v.duration = TDT.parseDur(val('duration')) || segundos(val('duration'));
    if (temVideo) {
      v.file = { video: val('video') };
      if (val('poster')) v.file.poster = val('poster');
      if (val('ia') && IA.id(val('ia'))) v.file.ia = IA.id(val('ia'));
      const esp = val('mirrors').split(/\s*\n\s*/).filter(TDT.isUrl);
      if (esp.length) v.file.mirrors = esp;
      const a1 = { id: 'principal', short: val('a1_short') || 'LP', label: val('a1_label') || 'Áudio do disco', kind: (val('a1_short') || 'lp').toLowerCase(), embedded: true };
      if (val('a1_release')) a1.release = val('a1_release');
      if (val('a1_by')) a1.by = val('a1_by');
      v.audio = [a1];
      if (val('a2_url')) v.audio.push({ id: 'fita', short: val('a2_short') || 'VHS', label: val('a2_label') || 'Som original da fita VHS', kind: 'vhs', url: val('a2_url') });
    }
    const cr = {};
    ['tape', 'capture', 'sync'].forEach((k) => { if (val(k)) cr[k] = val(k); });
    if (Object.keys(cr).length) v.credits = cr;
    const so = {};
    [['medium', 'medium'], ['standard', 'standard'], ['speed', 'speed'], ['from', 'from'], ['aired', 'aired'], ['generation', 'generation'], ['deck', 'deck'], ['capcard', 'capture'], ['notes', 'notes']]
      .forEach(([k, n]) => { if (val(k)) so[n] = val(k); });
    if (Object.keys(so).length) v.source = so;
    if (val('description')) v.description = val('description');
    if (val('note')) v.note = val('note');
    const src = val('src').split(/\s*\n\s*/).filter(Boolean).map((l) => {
      const p = l.split('|').map((s) => s.trim());
      return p.length > 1 ? { t: p[0], u: p[1] } : p[0];
    });
    if (src.length) v.src = src;
    v.added = new Date().toISOString().slice(0, 10);
    v.added_by = TDT.cfg('CURADOR', '') || undefined;
    const texto = JSON.stringify(v, null, 2).replace(/^/gm, '    ') + ',';
    return { video: v, texto, artistaNovo };
  }

  const MODELO_ACERVO = JSON.stringify({
    id: 'nome-do-acervo', name: 'Nome que aparece no site', roles: ['fitas'], since: '2026-11', city: 'Cidade, UF',
    bio: 'Duas ou três frases sobre o acervo (o que guarda, desde quando).', links: [{ t: 'Instagram', u: 'https://instagram.com/…' }], avatar: ''
  }, null, 2) + ',';
  const MODELO_ARTISTA = JSON.stringify({
    id: 'nome-do-artista', name: 'Nome do Artista', country: 'BR', origin: 'Cidade, UF', years: '1983–1990',
    intro: 'Resumo com as nossas palavras.', src: [{ t: 'Fonte (título)', u: 'https://…' }],
    releases: [{
      id: 'disco-1985', type: 'lp', title: 'Nome do disco', year: 1985, label: 'Gravadora', format: 'LP', src: [{ t: 'Fonte', u: 'https://…' }],
      tracks: [{ n: 'A1', t: 'Música 1', song: 'musica-1', len: '3:30', w: 'Compositores' }, { n: 'A2', t: 'Música 2', song: 'musica-2', len: '4:02' }]
    }]
  }, null, 2) + ',';

  TDT.Admin = { render };
})();
