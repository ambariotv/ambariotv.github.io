# Ambário — acervo de videoclipes

Acervo público de videoclipes e apresentações musicais gravados em fita, brasileiros e gringos. A prioridade é a **preservação**: cada vídeo diz de onde veio, quem guardou a fita, quem digitalizou e quais são as fontes.

Endereço: **https://ambariotv.github.io**

- **Visual dos sites de vídeo de 2007**, com um toque *frutiger aero* (brilho, vidro, azul de céu).
- **Player de TV antiga (CRT)** (o “Eternal Medias” do moguell.neocities.org): chuvisco, scanlines, OSD verde, REINICIAR, CRT, ANTERIOR/PRÓXIMO e TELA CHEIA.
- **Dois áudios sincronizados**: o do disco (LP, compacto, CD) e o som original da gravação. Troca a qualquer momento.
- **Discografia × videografia**: na página de cada artista, cada disco faixa por faixa, com os registros em vídeo de cada música (no acervo, na fila ou procura-se).
- **Acervos**: cada colaborador tem uma página com tudo que ajudou a preservar, e aparece nos créditos de cada vídeo.
- **Comentários, exibições e estrelas**, como antigamente. Sem cadastro, sem links.
- **Área do curador** (`#admin`): inclui, edita e apaga vídeos, artistas e acervos, com capa enviada por imagem, e publica direto no GitHub.

Nenhum vídeo fica no YouTube: os arquivos são seus, enviados para o Internet Archive.

---

## 1. Como as peças se encaixam

| Peça | Onde fica | Custo |
|---|---|---|
| O site (HTML, CSS, JS), os dados (`data/acervo.js`) e as capas (`media/capas/`) | GitHub Pages | grátis |
| Os vídeos (MP4 + som original M4A + a matriz MKV) | Internet Archive | grátis |
| Comentários, exibições, estrelas e mensagens | Google Apps Script + a planilha “Ambário - banco” | grátis |
| Preparar cada vídeo | EternalDub + `ferramentas/Exportar_para_o_site.bat` | no seu computador |
| Cadastrar e editar | Área do curador do próprio site (`#admin`) | grátis |

## 2. Atualizar os arquivos do site

Na página do repositório **ambariotv/ambariotv.github.io**: **Add file → Upload files**, arraste **as pastas** (`css`, `js`, `data`, `media`, `backend`, `ferramentas`) e os arquivos soltos `index.html`, `.nojekyll` e `README.md`. Depois **Commit changes**. Em 1 ou 2 minutos o site atualiza.

> Arraste as **pastas**, não os arquivos de dentro delas: arquivos soltos vão para a raiz e o site não os encontra.

Depois disso, o dia a dia (vídeos, capas, artistas) é feito pela área do curador, sem subir arquivos à mão.

## 3. Área do curador (`#admin`)

Abra **https://ambariotv.github.io/#admin** (o link também está no rodapé).

- **Vídeos**: lista com busca e filtro. **+ Novo vídeo**, **Editar**, **Ver**, **Apagar** (pergunta antes e oferece apagar a capa junto).
- **Capa**: *Escolher imagem…* (ou arraste uma imagem para a janela, ou cole com Ctrl+V), *Tirar de um vídeo do computador…* (escolhe o momento numa barra e usa o quadro), *Reenquadrar* e *Sem capa*. Você arrasta e dá zoom para enquadrar; sai um JPG 640×480 salvo em `media/capas/<id>.jpg`.
- **Arquivo de vídeo**: cole o identificador do Internet Archive e clique em **Importar arquivos**: ele acha o MP4, o M4A e a duração, e muda a situação para “No acervo”.
- **Enquadramento**: *Cortar bordas pretas das laterais* (imagem 4:3 dentro de um arquivo 16:9) ou *Desesticar* (imagem 4:3 que alguém esticou para 16:9). Não precisa converter o arquivo de novo.
- **Artistas**: dados, formação, fontes e a **discografia**, disco por disco, com as faixas numa tabela. **Colar lista de faixas…** aceita “1. Título 3:45”, “A1 Título” ou só os títulos.
- **Acervos**: quem cede fitas, digitaliza e sincroniza, com foto ou logo.
- **Publicar e conexão**: o token do GitHub e as alterações guardadas no navegador.

### Conectar ao GitHub (uma vez só)

Com o token conectado, cada **Salvar e publicar** vira um commit no repositório (dados + capa, num commit só) e o site público atualiza em 1 ou 2 minutos. O token fica **só no seu navegador**: não vai para nenhum arquivo do site.

1. Abra **github.com/settings/personal-access-tokens/new** (Settings → Developer settings → Personal access tokens → *Fine-grained tokens* → *Generate new token*).
2. **Token name**: “Ambário – área do curador”. **Expiration**: o prazo que preferir.
3. **Resource owner**: **ambariotv** (a organização dona do repositório).
4. **Repository access**: *Only select repositories* → **ambariotv/ambariotv.github.io**.
5. **Permissions → Repository permissions → Contents: Read and write**. Mais nada.
6. **Generate token**, copie (começa com `github_pat_`), cole na área do curador e clique em **Conectar**.
7. Como o repositório é de uma organização, o GitHub pede a aprovação do dono dela (é você): na página da organização, **Settings → Personal access tokens → Pending requests** → aprovar. Sem isso, o teste de conexão avisa que falta permissão.

Use a área do curador só em computadores seus. “Lembrar neste navegador” desmarcado faz o token valer só até fechar a aba; **Desconectar** apaga o token do navegador.

### Sem token

Também funciona: o que você salva fica **guardado só neste navegador** (o site mostra para você, com o selo RASCUNHO, e uma faixa amarela avisa). Em **Publicar e conexão** dá para conectar o token e publicar tudo de uma vez, ou **Baixar pacote (.zip)** e subir as pastas `data` e `media` pelo site do GitHub (depois clique em *Descartar alterações*).

### Se dois computadores salvarem ao mesmo tempo

Cada alteração é aplicada por cima da versão mais nova que está no GitHub, então uma não apaga a outra.

## 4. Preparar um vídeo

1. **EternalDub** (modo videoclipe): *Abrir filme* com a captura → *Adicionar música* com o FLAC do disco → **F5** (detectar atraso) → gerar o MKV. Ele sai no padrão de videoclipe: **faixa 1 = música do disco**, **faixa 2 = som original**.
2. Arraste o MKV para cima de **`ferramentas/Exportar_para_o_site.bat`**. Ele pergunta o nome dos arquivos e confirma as faixas. Depois **confere a imagem sozinho** e sugere (Enter aceita):
   - **entrelaçamento**: captura de fita é entrelaçada (usa o filtro *bwdif*, 59,94 quadros/s, o movimento fica igual ao da TV); cópia digital (DVD, internet) é progressiva e não mexe;
   - **bordas pretas**: procura num trecho de 40 s e corta (ex.: um arquivo 1920×1080 com a imagem 4:3 no meio vira 1490×1080);
   - **proporção**: Enter mantém (só acerta pixels não quadrados, 720×480 → 640×480); **4** força 4:3 (para imagem esticada); **16** força 16:9.

   Numa pasta `para_o_site` saem `nome.mp4` (imagem + áudio do disco, H.264 CRF 18 + AAC 256 kb/s), `nome-fita.m4a` (o som original, AAC 160 kb/s), `nome.jpg` e `nome-info.txt` (duração, tamanho final da imagem e os próximos passos). Ele usa o mesmo FFmpeg do EternalDub.

## 5. Enviar ao Internet Archive

1. Crie uma conta em archive.org (grátis).
2. Vá em **archive.org/upload** e arraste o MP4, o M4A e, se quiser guardar a matriz, o MKV.
3. Preencha:
   - **Page URL / identificador**: `ambario-metro-olhar-1985` (sem espaços nem acentos);
   - **Title**: `Metrô — Olhar (ao vivo, 1985)`;
   - **Description**: de onde veio a gravação e os créditos (quem cedeu, quem digitalizou, de que disco é o áudio);
   - **Subject tags**: `ambario; videoclipe; vhs; Metrô`;
   - **Media type**: Movies · **Collection**: Community Video.
4. **Upload**. O item aparece em alguns minutos (às vezes horas).
5. No site: `#admin` → abra o vídeo → cole o identificador → **Importar arquivos** → **Salvar e publicar**.

O site toca os arquivos direto do Archive com o player próprio. Guarde sempre as matrizes no seu computador. Se um item sair do ar, dá para pôr outro endereço em **Espelhos** (o player troca sozinho quando um link falha).

## 6. Comentários, exibições e estrelas (Apps Script)

Já está ligado (planilha “Ambário - banco”). Para lembrar:

- **Comentarios** → coluna `status`: `publicado`, `oculto` ou `pendente`. Para aprovar um por um, mude `PUBLICAR_DIRETO` para `false` no começo do Code.gs.
- **Mensagens** → “Tenho essa gravação”, correções e contatos. Status `novo`, `em andamento`, `resolvido`, `descartado`. Avisos por e-mail em `AVISAR_POR_EMAIL`.
- O site atualiza em até 2 minutos depois de uma mudança na planilha.

Mudou o `backend/Code.gs`? Cole de novo no Apps Script e **Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar**. A URL continua a mesma.

## 7. Discografia × videografia

Cada artista tem discos, cada disco tem faixas, e cada faixa aponta para uma **música** pelo id (ex.: `beat-acelerado`). Os vídeos apontam para a mesma música. É assim que o site sabe quais faixas têm vídeo.

A **versão** separa gravações diferentes da mesma música: vazia é a versão principal; `1984`, `ao-vivo`, `remix`, `demo` são outras. Se o vídeo e a faixa têm a mesma versão, o selo aparece normal; se não, tracejado, com “outra versão”. No editor, o id da música é criado sozinho a partir do título da faixa (“Beat Acelerado (2ª versão)” → `beat-acelerado`).

## 8. Formato dos dados (`data/acervo.js`)

É JSON dentro de um `.js` (`window.AMB_DATA = {…};`). A área do curador lê e grava este arquivo; se editar à mão, mantenha o formato JSON (aspas duplas, sem vírgula sobrando).

- `updated`, `rev`: data e número da revisão (sobem sozinhos a cada publicação).
- **Fonte** (`sources`): `id: { t: "título", u: "link" }`. Cite pelo id em `src`, ou escreva `{ t, u }` direto.
- **Acervo** (`acervos`): `id`, `name`, `roles` (`curadoria`, `fitas`, `captura`, `audio`, `sincronizacao`, `restauracao`), `since`, `city`, `bio`, `links`, `avatar`.
- **Artista** (`artists`): `id`, `name`, `alt`, `country` (`"BR"`, `"US"`…), `origin`, `years`, `members` (`[{ name, role, years }]`), `intro`, `src`, `releases`.
- **Disco** (`releases`): `id`, `type` (`lp`, `compacto`, `single`, `ep`, `cd`, `coletanea`, `participacao`, `digital`), `title`, `year`, `date`, `label`, `format`, `credit`, `note`, `partial`, `src`, `tracks`.
- **Faixa** (`tracks`): `n`, `t`, `song`, `ver`, `len`, `w` (compositores), `feat`, `note`.
- **Vídeo** (`videos`): `id`, `artist`, `song`, `ver`, `title`, `kind` (`clipe`, `tv`, `ao-vivo`, `filme`, `entrevista`, `comercial`, `outro`), `date`, `program`, `channel`, `director`, `status` (`no-acervo`, `na-fila`, `procura-se`), `capa` (`media/capas/…jpg`), `fit` (`cover` corta bordas laterais, `fill` desestica), `aspect` (`16:9` para tela larga), `duration` (segundos), `file` (`video`, `ia`, `mirrors`), `audio`, `credits`, `source`, `description`, `note`, `src`, `refs`, `added`, `added_by`.
- **Áudio** (`audio`): o primeiro é o principal, dentro do MP4 (`embedded: true`); o segundo tem `url` (o M4A). Campos: `id`, `short` (o texto do botão), `label`, `kind`, `release`, `by`, `note`.
- **Créditos** (`credits`): `tape`, `capture`, `sync`, `restore`, `extra`. Com o id de um acervo, o nome vira link.
- **Origem** (`source`): `medium`, `standard`, `speed`, `from`, `aired`, `generation`, `deck`, `capture`, `notes`.

## 9. O player

- Atalhos: **espaço** tocar/pausar · **← →** 5 s · **A** trocar o áudio · **F** tela cheia · **M** som · **C** filtro CRT.
- Os dois áudios: o MP4 toca a imagem com o áudio do disco; o som original é um arquivo à parte, tocado junto e corrigido a cada 1/4 de segundo (nos testes, diferença abaixo de 30 milésimos).
- Vídeo “na fila” mostra a tela azul do videocassete por cima da capa, com o botão “Tenho essa gravação”.
- Para o visual vermelho do Eternal Medias original, troque `--vr-acento` e `--vr-moldura` no `css/style.css`.

## 10. Política

- O site não oferece download: ele toca os vídeos. O link do item no Internet Archive aparece nos créditos (desligue em `MOSTRAR_LINK_IA`).
- Se um artista ou detentor de direitos pedir, o vídeo sai do ar.
- Informações reescritas com nossas palavras, sempre com a fonte.

## 11. Arquivos

```
index.html, .nojekyll, README.md
css/style.css               visual (2007 + aero), player e área do curador
js/config.js                nome, endereço, Apps Script, repositório do GitHub
js/core.js                  dados, alterações locais, busca, discografia × videografia, servidor
js/player.js                player de TV antiga com dois áudios
js/views.js                 telas
js/app.js                   rotas, comentários, estrelas, formulários, atalhos
js/admin.js                 área do curador (#admin) — carregada só quando abre #admin
js/editor-github.js         publicar no GitHub (um commit por alteração) e pacote .zip
js/editor-capa.js           escolher e enquadrar capas e fotos
data/acervo.js              fontes, acervos, artistas, discos e vídeos
media/capas/                capas dos vídeos (640×480)
fonts/                      VT323 (licença SIL OFL)
backend/Code.gs             servidor no Google Apps Script
ferramentas/Exportar_para_o_site.bat   MKV do EternalDub → MP4 + M4A + capa
```
