/*
 * Ambário — área do curador: escolher e enquadrar uma imagem (capa do vídeo, foto do acervo).
 *
 * AMB.Capa.escolher({ titulo, proporcao: 4 / 3, largura: 640, atual, modo: 'imagem' | 'video' })
 *   → Promise com { dataUrl } (JPEG já recortado no tamanho certo) ou null se cancelar.
 * A imagem pode vir de um arquivo, de arrastar e soltar, de colar (Ctrl+V) ou de um quadro de um
 * vídeo do computador. Arraste para enquadrar; o zoom vai de "imagem inteira" até bem de perto.
 */
(function () {
  'use strict';
  const AMB = window.AMB;
  const esc = AMB.esc;

  function carregarImagem(src) {
    return new Promise((ok, falha) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => ok(img);
      img.onerror = () => falha(new Error('Não deu para abrir essa imagem. Use JPG, PNG, WebP ou GIF (fotos HEIC do iPhone precisam ser convertidas antes).'));
      img.src = src;
    });
  }

  function escolher(o) {
    o = Object.assign({ titulo: 'Escolher a capa', proporcao: 4 / 3, largura: 640, atual: '', modo: 'imagem', qualidade: 0.86 }, o || {});
    const W = Math.round(o.largura);
    const H = Math.round(o.largura / o.proporcao);
    return new Promise((resolver) => {
      const fundo = document.createElement('div');
      fundo.className = 'adm-fundo';
      fundo.innerHTML =
        '<div class="modal modal-capa" role="dialog" aria-modal="true" aria-label="' + esc(o.titulo) + '">' +
          '<button type="button" class="modal-x" data-c="cancelar" aria-label="Fechar">×</button>' +
          '<h2>' + esc(o.titulo) + '</h2>' +
          '<div class="capa-fontes">' +
            '<label class="btn btn-b">Enviar imagem…<input type="file" class="capa-in-img" accept="image/*"></label>' +
            '<label class="btn">Tirar de um vídeo do computador…<input type="file" class="capa-in-vid" accept="video/*,.mkv,.mp4,.m4v,.mov,.webm"></label>' +
            '<span class="mini">ou arraste uma imagem para esta janela, ou cole com Ctrl+V</span>' +
          '</div>' +
          '<div class="capa-video" hidden>' +
            '<video class="capa-vid" muted playsinline preload="auto"></video>' +
            '<div class="capa-vid-ctrl"><input type="range" class="capa-vid-pos" min="0" max="1000" step="1" value="0" aria-label="Momento do vídeo">' +
              '<span class="capa-vid-t">0:00</span>' +
              '<button type="button" class="btn btn-p" data-c="voltar1" title="Um quadro para trás">◀</button>' +
              '<button type="button" class="btn btn-p" data-c="avancar1" title="Um quadro para a frente">▶</button>' +
              '<button type="button" class="btn btn-y btn-p" data-c="quadro">Usar este quadro</button></div>' +
            '<p class="mini capa-vid-msg"></p>' +
          '</div>' +
          '<div class="capa-palco" style="aspect-ratio:' + W + ' / ' + H + ';width:min(100%, calc(52vh * ' + (W / H).toFixed(4) + '))">' +
            '<canvas class="capa-canvas" aria-label="Enquadramento: arraste para mover"></canvas>' +
            '<div class="capa-vazio">Nenhuma imagem ainda.<br>Envie, arraste ou cole uma imagem.</div>' +
          '</div>' +
          '<div class="capa-ctrl">' +
            '<label>Zoom <input type="range" class="capa-zoom" min="0" max="1000" step="1" value="0" disabled></label>' +
            '<button type="button" class="btn btn-p" data-c="preencher" disabled>Preencher</button>' +
            '<button type="button" class="btn btn-p" data-c="inteira" disabled>Imagem inteira</button>' +
            '<span class="mini">Arraste a imagem para enquadrar. Sai em ' + W + '×' + H + ' (JPG).</span>' +
          '</div>' +
          '<p class="form-msg capa-msg" role="status"></p>' +
          '<div class="form-pe"><button type="button" class="btn btn-y" data-c="ok" disabled>Usar esta imagem</button>' +
            '<button type="button" class="btn" data-c="cancelar">Cancelar</button></div>' +
        '</div>';
      document.body.appendChild(fundo);
      document.documentElement.classList.add('com-modal');
      const $ = (s) => fundo.querySelector(s);
      const canvas = $('.capa-canvas');
      const ctx = canvas.getContext('2d');
      const zoom = $('.capa-zoom');
      const msg = $('.capa-msg');
      const vid = $('.capa-vid');
      const caixaVid = $('.capa-video');
      let fonte = null; // imagem ou canvas
      let iw = 0, ih = 0, esc_ = 1, cx = 0, cy = 0, sMin = 1, sCob = 1, sMax = 4;
      let urlVideo = '';
      const focoAntes = document.activeElement;

      function aviso(t, erro) { msg.className = 'form-msg capa-msg' + (erro ? ' erro' : ''); msg.textContent = t || ''; }

      function medir() {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      }
      // posição da imagem dentro do quadro de saída (W×H): ponto (cx, cy) da imagem no centro, escala esc_
      function limitar() {
        const meiaW = W / 2 / esc_, meiaH = H / 2 / esc_;
        cx = iw * esc_ >= W ? Math.min(iw - meiaW, Math.max(meiaW, cx)) : iw / 2;
        cy = ih * esc_ >= H ? Math.min(ih - meiaH, Math.max(meiaH, cy)) : ih / 2;
      }
      function desenhar(alvo, largura, altura) {
        const c = alvo.getContext('2d');
        c.fillStyle = '#000';
        c.fillRect(0, 0, largura, altura);
        if (!fonte) return;
        const k = largura / W; // pixels do alvo por pixel de saída
        const s = esc_ * k;
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        c.drawImage(fonte, largura / 2 - cx * s, altura / 2 - cy * s, iw * s, ih * s);
      }
      function redesenhar() { medir(); desenhar(canvas, canvas.width, canvas.height); }
      function zoomPara(s) {
        esc_ = Math.max(sMin, Math.min(sMax, s));
        limitar();
        zoom.value = String(Math.round((Math.log(esc_ / sMin) / Math.log(sMax / sMin || 1.0001)) * 1000));
        redesenhar();
      }

      function usar(f, largura, altura) {
        fonte = f; iw = largura; ih = altura;
        sMin = Math.min(W / iw, H / ih);
        sCob = Math.max(W / iw, H / ih);
        sMax = Math.max(sCob * 4, sMin * 1.5);
        cx = iw / 2; cy = ih / 2;
        fundo.querySelectorAll('[data-c="ok"],[data-c="preencher"],[data-c="inteira"]').forEach((b) => { b.disabled = false; });
        zoom.disabled = false;
        $('.capa-vazio').hidden = true;
        zoomPara(sCob);
        aviso(iw < W * 0.7 ? 'A imagem tem só ' + iw + '×' + ih + ' px: vai ficar um pouco borrada.' : '');
      }

      async function abrirArquivo(arq) {
        if (!arq) return;
        if (/^video\//.test(arq.type) || /\.(mkv|mp4|m4v|mov|webm|avi)$/i.test(arq.name)) { abrirVideo(arq); return; }
        if (!/^image\//.test(arq.type) && !/\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(arq.name)) { aviso('Esse arquivo não é uma imagem.', true); return; }
        const url = URL.createObjectURL(arq);
        try { const img = await carregarImagem(url); usar(img, img.naturalWidth, img.naturalHeight); } catch (e) { aviso(e.message, true); } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
      }

      function fmt(t) { t = Math.max(0, t || 0); return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0'); }
      function abrirVideo(arq) {
        if (urlVideo) URL.revokeObjectURL(urlVideo);
        urlVideo = URL.createObjectURL(arq);
        caixaVid.hidden = false;
        $('.capa-vid-msg').textContent = 'Abrindo ' + arq.name + '…';
        vid.src = urlVideo;
      }
      vid.addEventListener('loadedmetadata', () => {
        $('.capa-vid-msg').textContent = 'Escolha o momento na barra e clique em “Usar este quadro”.';
        try { vid.currentTime = Math.min(vid.duration || 0, (vid.duration || 0) / 3); } catch (e) { /* ok */ }
      });
      vid.addEventListener('timeupdate', () => {
        $('.capa-vid-t').textContent = fmt(vid.currentTime);
        if (vid.duration) $('.capa-vid-pos').value = String(Math.round(vid.currentTime / vid.duration * 1000));
      });
      vid.addEventListener('seeked', () => { $('.capa-vid-t').textContent = fmt(vid.currentTime); });
      vid.addEventListener('error', () => {
        $('.capa-vid-msg').textContent = 'Este navegador não conseguiu abrir o vídeo (alguns MKV não abrem). Tente o MP4 exportado, ou tire um print da tela e envie como imagem.';
      });
      $('.capa-vid-pos').addEventListener('input', (e) => { if (vid.duration) vid.currentTime = Number(e.target.value) / 1000 * vid.duration; });
      function quadro() {
        if (!vid.videoWidth) { aviso('O vídeo ainda não carregou.', true); return; }
        const c = document.createElement('canvas');
        c.width = vid.videoWidth; c.height = vid.videoHeight;
        c.getContext('2d').drawImage(vid, 0, 0, c.width, c.height);
        usar(c, c.width, c.height);
        aviso('Quadro de ' + fmt(vid.currentTime) + ' (' + c.width + '×' + c.height + '). Se a imagem tiver bordas pretas, use o zoom para cortá-las.');
      }

      function fechar(res) {
        document.removeEventListener('paste', aoColar);
        document.removeEventListener('keydown', aoTeclar, true);
        window.removeEventListener('resize', redesenhar);
        if (urlVideo) URL.revokeObjectURL(urlVideo);
        vid.removeAttribute('src');
        fundo.remove();
        if (!document.querySelector('.adm-fundo')) document.documentElement.classList.remove('com-modal');
        if (focoAntes && document.body.contains(focoAntes)) focoAntes.focus();
        resolver(res);
      }
      function exportar() {
        if (!fonte) return;
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        desenhar(c, W, H);
        let q = o.qualidade, url = c.toDataURL('image/jpeg', q);
        while (url.length > 420000 && q > 0.5) { q -= 0.08; url = c.toDataURL('image/jpeg', q); } // capas leves (~300 KB no máximo)
        fechar({ dataUrl: url, largura: W, altura: H });
      }

      function aoColar(e) {
        const itens = (e.clipboardData && e.clipboardData.items) || [];
        for (let i = 0; i < itens.length; i++) {
          if (itens[i].kind === 'file' && /^image\//.test(itens[i].type)) { e.preventDefault(); abrirArquivo(itens[i].getAsFile()); return; }
        }
      }
      function aoTeclar(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); fechar(null); }
      }
      document.addEventListener('paste', aoColar);
      document.addEventListener('keydown', aoTeclar, true);
      window.addEventListener('resize', redesenhar);

      fundo.addEventListener('click', (e) => {
        const b = e.target.closest('[data-c]');
        if (!b || b.disabled) return;
        const c = b.dataset.c;
        if (c === 'cancelar') fechar(null);
        else if (c === 'ok') exportar();
        else if (c === 'preencher') zoomPara(sCob);
        else if (c === 'inteira') zoomPara(sMin);
        else if (c === 'quadro') quadro();
        else if (c === 'voltar1' || c === 'avancar1') { vid.pause(); vid.currentTime = Math.max(0, vid.currentTime + (c === 'voltar1' ? -1 : 1) / 30); }
      });
      fundo.addEventListener('mousedown', (e) => { if (e.target === fundo) fechar(null); });
      $('.capa-in-img').addEventListener('change', (e) => { abrirArquivo(e.target.files[0]); e.target.value = ''; });
      $('.capa-in-vid').addEventListener('change', (e) => { const f = e.target.files[0]; if (f) abrirVideo(f); e.target.value = ''; });
      fundo.addEventListener('dragover', (e) => { e.preventDefault(); fundo.classList.add('arrastando'); });
      fundo.addEventListener('dragleave', (e) => { if (e.target === fundo) fundo.classList.remove('arrastando'); });
      fundo.addEventListener('drop', (e) => {
        e.preventDefault();
        fundo.classList.remove('arrastando');
        const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (f) abrirArquivo(f);
      });
      zoom.addEventListener('input', () => { zoomPara(sMin * Math.pow(sMax / sMin, Number(zoom.value) / 1000)); });
      canvas.addEventListener('wheel', (e) => { if (!fonte) return; e.preventDefault(); zoomPara(esc_ * (e.deltaY < 0 ? 1.08 : 1 / 1.08)); }, { passive: false });

      // arrastar (mouse, caneta ou dedo)
      let arrasto = null;
      canvas.addEventListener('pointerdown', (e) => {
        if (!fonte) return;
        canvas.setPointerCapture(e.pointerId);
        arrasto = { x: e.clientX, y: e.clientY, cx, cy };
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!arrasto) return;
        const r = canvas.getBoundingClientRect();
        const k = W / r.width; // pixels de saída por pixel da tela
        cx = arrasto.cx - (e.clientX - arrasto.x) * k / esc_;
        cy = arrasto.cy - (e.clientY - arrasto.y) * k / esc_;
        limitar();
        redesenhar();
      });
      const soltar = () => { arrasto = null; };
      canvas.addEventListener('pointerup', soltar);
      canvas.addEventListener('pointercancel', soltar);
      canvas.addEventListener('keydown', (e) => {
        const passo = 10 / esc_;
        const mapa = { ArrowLeft: [-passo, 0], ArrowRight: [passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo] };
        if (!fonte || !mapa[e.key]) return;
        e.preventDefault(); cx += mapa[e.key][0]; cy += mapa[e.key][1]; limitar(); redesenhar();
      });
      canvas.tabIndex = 0;

      requestAnimationFrame(redesenhar);
      // começa com a imagem atual, se ela for daqui mesmo (link de fora "suja" o canvas e não dá para salvar)
      if (o.atual && (/^data:image\//.test(o.atual) || !/^[a-z]+:/i.test(o.atual) || o.atual.indexOf(location.origin + '/') === 0)) {
        carregarImagem(o.atual).then((img) => { if (!fonte) usar(img, img.naturalWidth, img.naturalHeight); }).catch(() => {});
      }
      if (o.modo === 'video') setTimeout(() => $('.capa-in-vid').click(), 50);
      else $('.capa-in-img').focus();
    });
  }

  AMB.Capa = { escolher };
})();
