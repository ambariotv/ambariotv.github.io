/*
 * Ambário — área do curador: conexão com o GitHub.
 *
 * Salva as alterações direto no repositório do site, num commit só (dados + capas), usando a API do GitHub
 * com um token "fine-grained" que o curador cola na área do curador. O token fica só no navegador dele
 * (nunca vai para arquivo nenhum do site) e só é enviado para api.github.com.
 *
 * Como salva: lê a versão mais nova de data/acervo.js no GitHub, aplica as operações (incluir, editar ou
 * apagar um vídeo, artista ou acervo), envia as imagens e grava tudo num commit. Se alguém salvou no meio
 * do caminho (de outro computador, por exemplo), começa de novo por cima da versão nova.
 */
(function () {
  'use strict';
  const AMB = window.AMB;
  const API = 'https://api.github.com';
  const ARQ_DADOS = 'data/acervo.js';
  const CHAVE = 'amb.github';

  class ErroGH extends Error {
    constructor(msg, status, detalhe) { super(msg); this.status = status || 0; this.detalhe = detalhe || null; }
  }

  /* ---------------- conexão (token guardado só neste navegador) ---------------- */
  function lerConexao() {
    let c = null;
    try { c = JSON.parse(sessionStorage.getItem(CHAVE) || 'null'); } catch (e) { c = null; }
    if (!c) c = AMB.store.get(CHAVE, null);
    return c && c.token && c.repo ? c : null;
  }
  function guardarConexao(c, lembrar) {
    esquecerConexao();
    const dados = { token: c.token, repo: c.repo, branch: c.branch, login: c.login || '', lembrar: !!lembrar, em: new Date().toISOString() };
    if (lembrar) AMB.store.set(CHAVE, dados);
    else { try { sessionStorage.setItem(CHAVE, JSON.stringify(dados)); } catch (e) { /* sem armazenamento: vale só até recarregar */ } }
    memoria = dados;
  }
  let memoria = null; // se o navegador bloquear o armazenamento, a conexão vale até recarregar a página
  function esquecerConexao() {
    memoria = null;
    AMB.store.del(CHAVE);
    try { sessionStorage.removeItem(CHAVE); } catch (e) { /* ok */ }
  }
  const conexao = () => lerConexao() || memoria;

  // ambariotv.github.io → ambariotv/ambariotv.github.io ; fulano.github.io/projeto → fulano/projeto
  function repoPadrao() {
    const cfg = AMB.cfg('GITHUB_REPO', '');
    if (cfg) return cfg;
    const m = /^([a-z0-9-]+)\.github\.io$/i.exec(location.hostname);
    if (!m) return '';
    const seg = location.pathname.split('/').filter(Boolean)[0];
    return m[1] + '/' + (seg && !/\.html?$/.test(seg) ? seg : location.hostname);
  }

  /* ---------------- chamadas à API ---------------- */
  const enc = (s) => String(s).split('/').map(encodeURIComponent).join('/');

  function traduzir(status, msg, con) {
    const m = String(msg || '');
    const repo = con ? con.repo : 'o repositório';
    if (status === 401) return 'O GitHub não aceitou o token (pode ter expirado ou sido apagado). Crie outro e conecte de novo.';
    if (status === 403 && /rate limit/i.test(m)) return 'O GitHub limitou as chamadas por um tempo. Espere alguns minutos e tente de novo.';
    if (status === 403) return 'O token não tem permissão para escrever em ' + repo + '. Ele precisa dar acesso a esse repositório com “Contents: Read and write”. ' +
      'Se o repositório é de uma organização, o dono dela também precisa aprovar o token (Settings da organização → Personal access tokens → Pending requests).';
    if (status === 404) return 'Não encontrei ' + repo + ' (ou o token não tem acesso a ele). Confira o nome do repositório e o acesso do token.';
    if (status === 409) return 'O repositório está vazio ou bloqueado para gravação.';
    if (status === 422) return 'O GitHub recusou a gravação' + (m ? ' (' + m + ')' : '') + '.';
    if (status >= 500) return 'O GitHub está com problemas agora (' + status + '). Tente de novo em alguns minutos.';
    return 'Erro do GitHub' + (status ? ' ' + status : '') + (m ? ': ' + m : '') + '.';
  }

  async function api(con, metodo, caminho, corpo, aceitar) {
    let r;
    try {
      r = await fetch(API + caminho, {
        method: metodo,
        headers: Object.assign({ Authorization: 'Bearer ' + con.token, Accept: aceitar || 'application/vnd.github+json' },
          corpo ? { 'Content-Type': 'application/json' } : {}),
        body: corpo ? JSON.stringify(corpo) : undefined,
        cache: 'no-store'
      });
    } catch (e) {
      throw new ErroGH('Sem conexão com o GitHub. Confira a internet e tente de novo.', 0);
    }
    const texto = await r.text();
    if (!r.ok) {
      let j = null;
      try { j = JSON.parse(texto); } catch (e) { j = null; }
      throw new ErroGH(traduzir(r.status, j && j.message, con), r.status, j);
    }
    if (aceitar && aceitar.indexOf('raw') >= 0) return texto;
    return texto ? JSON.parse(texto) : null;
  }

  // Confere o token: usuário, acesso ao repositório, o ramo e a permissão de escrita (criando um blob
  // pequeno, que não aparece em lugar nenhum e o GitHub descarta sozinho).
  async function conectar(token, repo, branch) {
    const con = { token: String(token || '').trim(), repo: String(repo || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$|\/$/g, ''), branch: String(branch || '').trim() };
    if (!con.token) throw new ErroGH('Cole o token do GitHub.');
    if (/\s/.test(con.token)) throw new ErroGH('O token não pode ter espaços. Copie de novo, inteiro.');
    if (!/^[\w.-]+\/[\w.-]+$/.test(con.repo)) throw new ErroGH('Repositório inválido. Use dono/nome, por exemplo: ambariotv/ambariotv.github.io');
    const user = await api(con, 'GET', '/user');
    const rep = await api(con, 'GET', '/repos/' + enc(con.repo));
    if (!con.branch) con.branch = rep.default_branch || 'main';
    if (rep.permissions && rep.permissions.push === false) throw new ErroGH('A conta ' + user.login + ' não tem permissão de escrita em ' + con.repo + '.');
    await api(con, 'GET', '/repos/' + enc(con.repo) + '/git/ref/heads/' + enc(con.branch));
    await api(con, 'POST', '/repos/' + enc(con.repo) + '/git/blobs', { content: 'teste de permissão do Ambário', encoding: 'utf-8' });
    con.login = user.login || '';
    return con;
  }

  /* ---------------- formato do arquivo de dados ---------------- */
  const CABECALHO = [
    '/*',
    ' * Ambário — dados do acervo (vídeos, artistas, discografias, acervos e fontes).',
    ' *',
    ' * O jeito fácil de mexer aqui é pela área do curador: endereço do site + #admin.',
    ' * Ela lê este arquivo, aplica a sua alteração e salva de volta no GitHub, com as capas.',
    ' *',
    ' * Se for editar à mão, mantenha o formato JSON: aspas duplas, sem vírgula sobrando',
    ' * no fim das listas e sem comentários dentro do bloco. Campos principais:',
    ' *   videos[]  : id, artist, song, ver, title, kind, date, program, channel, director, status,',
    ' *               capa, fit, duration, file {video, ia, mirrors}, audio[], credits, source,',
    ' *               description, note, src[], refs[], added, added_by',
    ' *   artists[] : id, name, alt[], country, origin, years, members[], intro, src[], releases[]',
    ' *               (releases[]: id, type, title, year, date, label, format, note, partial, src[], tracks[])',
    ' *   acervos[] : id, name, roles[], since, city, bio, links[], avatar',
    ' *   sources   : { id: { t: título, u: link } } (usadas por id nos campos src)',
    ' */',
    ''
  ].join('\n');

  // JSON legível: objeto ou lista curta fica numa linha; o resto abre em várias (igual ao gerador do repositório)
  const LIMITE = 100;
  function compacto(v) {
    if (Array.isArray(v)) return '[' + v.map(compacto).join(', ') + ']';
    if (v && typeof v === 'object') {
      const k = Object.keys(v);
      return k.length ? '{ ' + k.map((x) => JSON.stringify(x) + ': ' + compacto(v[x])).join(', ') + ' }' : '{}';
    }
    return JSON.stringify(v);
  }
  function ser(v, nivel) {
    const pad = '  '.repeat(nivel);
    const c = compacto(v);
    if (!v || typeof v !== 'object' || pad.length + c.length <= LIMITE) return c;
    const pad2 = '  '.repeat(nivel + 1);
    if (Array.isArray(v)) return v.length ? '[\n' + v.map((x) => pad2 + ser(x, nivel + 1)).join(',\n') + '\n' + pad + ']' : '[]';
    const k = Object.keys(v);
    return k.length ? '{\n' + k.map((x) => pad2 + JSON.stringify(x) + ': ' + ser(v[x], nivel + 1)).join(',\n') + '\n' + pad + '}' : '{}';
  }
  function serializar(dados) {
    // "updated" e "rev" sempre no começo; o resto na ordem em que está
    const d = JSON.parse(JSON.stringify(dados));
    const o = { updated: d.updated || '', rev: Number(d.rev) || 0 };
    Object.keys(d).forEach((k) => { if (k !== 'updated' && k !== 'rev') o[k] = d[k]; });
    return ser(o, 0);
  }
  const textoArquivo = (dados, cabecalho) => (cabecalho || CABECALHO) + 'window.AMB_DATA = ' + serializar(dados) + ';\n';

  // Lê o arquivo de dados (o formato atual ou o antigo, TDT_DATA com comentários)
  function lerTexto(texto) {
    const m = /window\.(AMB_DATA|TDT_DATA)\s*=\s*/.exec(texto);
    if (!m) throw new ErroGH('Não reconheci o arquivo ' + ARQ_DADOS + ' (falta a linha “window.AMB_DATA =”).');
    const antes = texto.slice(0, m.index);
    const cabecalho = m[1] === 'AMB_DATA' && /^\s*\/\*[\s\S]*\*\/\s*$/.test(antes) ? antes.replace(/\s*$/, '\n') : CABECALHO;
    const fim = texto.lastIndexOf('}');
    let dados = null;
    try { dados = JSON.parse(texto.slice(m.index + m[0].length, fim + 1)); } catch (e) {
      // editado à mão com jeito de JavaScript (comentário, vírgula sobrando): roda como o site roda
      const w = {};
      try { new Function('window', texto)(w); } catch (e2) { throw new ErroGH(ARQ_DADOS + ' tem um erro de digitação: ' + e2.message); }
      dados = w.AMB_DATA || w.TDT_DATA;
    }
    if (!dados || typeof dados !== 'object') throw new ErroGH('O arquivo ' + ARQ_DADOS + ' não tem dados.');
    return { dados, cabecalho };
  }

  const hoje = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };
  const semQuery = (c) => String(c || '').split(/[?#]/)[0];

  // Aplica as operações em cima de uma versão e devolve a nova (com rev + 1)
  function novaVersao(dados, ops) {
    const novo = AMB.aplicarOps(dados, ops);
    novo.rev = (Number(dados.rev) || 0) + 1;
    novo.updated = hoje();
    return novo;
  }

  /* ---------------- publicar ---------------- */
  async function publicar(con, ops, mensagem, progresso) {
    progresso = progresso || (() => {});
    const repo = '/repos/' + enc(con.repo);
    const arquivos = ops.filter((o) => o.t === 'arquivo' && o.dataUrl);
    const apagar = ops.filter((o) => o.t === 'apagar-arquivo');
    const blobs = {};
    for (let i = 0; i < arquivos.length; i++) {
      progresso('Enviando imagem ' + (i + 1) + ' de ' + arquivos.length + '…');
      const b64 = String(arquivos[i].dataUrl).split(',')[1] || '';
      const r = await api(con, 'POST', repo + '/git/blobs', { content: b64, encoding: 'base64' });
      blobs[semQuery(arquivos[i].caminho)] = r.sha;
    }
    for (let tentativa = 1; ; tentativa++) {
      progresso('Lendo a versão mais nova do GitHub…');
      const ref = await api(con, 'GET', repo + '/git/ref/heads/' + enc(con.branch));
      const head = ref.object.sha;
      const commit = await api(con, 'GET', repo + '/git/commits/' + head);
      const atual = lerTexto(await api(con, 'GET', repo + '/contents/' + enc(ARQ_DADOS) + '?ref=' + head, null, 'application/vnd.github.raw+json'));
      const novo = novaVersao(atual.dados, ops);
      const tree = [{ path: ARQ_DADOS, mode: '100644', type: 'blob', content: textoArquivo(novo, atual.cabecalho) }];
      Object.keys(blobs).forEach((p) => tree.push({ path: p, mode: '100644', type: 'blob', sha: blobs[p] }));
      if (apagar.length) {
        // só apaga o que existe (o GitHub recusa apagar arquivo que não está lá)
        const t = await api(con, 'GET', repo + '/git/trees/' + commit.tree.sha + '?recursive=1');
        const existe = new Set((t.tree || []).map((x) => x.path));
        apagar.forEach((a) => {
          const p = semQuery(a.caminho);
          if (!blobs[p] && existe.has(p) && !tree.some((x) => x.path === p)) tree.push({ path: p, mode: '100644', type: 'blob', sha: null });
        });
      }
      progresso('Gravando no GitHub…');
      const arvore = await api(con, 'POST', repo + '/git/trees', { base_tree: commit.tree.sha, tree });
      const c = await api(con, 'POST', repo + '/git/commits', { message: mensagem, tree: arvore.sha, parents: [head] });
      try {
        await api(con, 'PATCH', repo + '/git/refs/heads/' + enc(con.branch), { sha: c.sha, force: false });
        return { dados: novo, commit: c.sha, url: 'https://github.com/' + con.repo + '/commit/' + c.sha };
      } catch (e) {
        // 422 = alguém gravou outro commit enquanto este era montado: refaz por cima do novo
        if (e.status === 422 && tentativa < 4) continue;
        throw e;
      }
    }
  }

  /* ---------------- pacote .zip (para publicar sem token, pelo site do GitHub) ---------------- */
  let tabelaCrc = null;
  function crc32(bytes) {
    if (!tabelaCrc) {
      tabelaCrc = new Uint32Array(256);
      for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; tabelaCrc[n] = c >>> 0; }
    }
    let c = 0xffffffff;
    for (let i = 0; i < bytes.length; i++) c = tabelaCrc[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  // arquivos: [{ caminho, bytes: Uint8Array }] → Blob (zip sem compressão, nomes em UTF-8)
  function zip(arquivos) {
    const te = new TextEncoder();
    const partes = [];
    const central = [];
    let pos = 0;
    const agora = new Date();
    const hora = (agora.getHours() << 11) | (agora.getMinutes() << 5) | Math.floor(agora.getSeconds() / 2);
    const data = ((agora.getFullYear() - 1980) << 9) | ((agora.getMonth() + 1) << 5) | agora.getDate();
    arquivos.forEach((a) => {
      const nome = te.encode(a.caminho);
      const crc = crc32(a.bytes);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true);
      h.setUint16(10, hora, true); h.setUint16(12, data, true); h.setUint32(14, crc, true);
      h.setUint32(18, a.bytes.length, true); h.setUint32(22, a.bytes.length, true); h.setUint16(26, nome.length, true); h.setUint16(28, 0, true);
      partes.push(new Uint8Array(h.buffer), nome, a.bytes);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true);
      c.setUint16(12, hora, true); c.setUint16(14, data, true); c.setUint32(16, crc, true);
      c.setUint32(20, a.bytes.length, true); c.setUint32(24, a.bytes.length, true); c.setUint16(28, nome.length, true);
      c.setUint16(30, 0, true); c.setUint16(32, 0, true); c.setUint16(34, 0, true); c.setUint16(36, 0, true); c.setUint32(38, 0, true); c.setUint32(42, pos, true);
      central.push(new Uint8Array(c.buffer), nome);
      pos += 30 + nome.length + a.bytes.length;
    });
    const tamCentral = central.reduce((s, p) => s + p.length, 0);
    const fim = new DataView(new ArrayBuffer(22));
    fim.setUint32(0, 0x06054b50, true); fim.setUint16(8, arquivos.length, true); fim.setUint16(10, arquivos.length, true);
    fim.setUint32(12, tamCentral, true); fim.setUint32(16, pos, true);
    return new Blob(partes.concat(central, [new Uint8Array(fim.buffer)]), { type: 'application/zip' });
  }
  function bytesDeDataUrl(u) {
    const b = atob(String(u).split(',')[1] || '');
    const out = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
    return out;
  }

  AMB.GH = {
    ARQ_DADOS, ErroGH, conexao, guardarConexao, esquecerConexao, repoPadrao, conectar, publicar,
    serializar, textoArquivo, lerTexto, novaVersao, zip, bytesDeDataUrl, semQuery, hoje
  };
})();
