# TV de Tubo — acervo de videoclipes

Acervo público de videoclipes e apresentações musicais gravados em fita, brasileiros e gringos. A prioridade é a **preservação**: cada vídeo diz de onde veio, quem guardou a fita, quem digitalizou e quais são as fontes.

- **Visual dos sites de vídeo de 2007**, com um toque *frutiger aero* (brilho, vidro, azul de céu).
- **Player de TV de tubo** (o “Eternal Medias” do moguell.neocities.org): chuvisco, scanlines, OSD verde, REINICIAR, CRT, ANTERIOR/PRÓXIMO e TELA CHEIA.
- **Dois áudios sincronizados**: o do disco (LP, compacto, CD) e o som original da fita. Troca a qualquer momento.
- **Discografia × videografia**: na página de cada artista, cada disco faixa por faixa, com os registros em vídeo de cada música (no acervo, na fila ou procura-se).
- **Acervos**: cada colaborador tem uma página com tudo que ajudou a preservar, e aparece nos créditos de cada vídeo.
- **Comentários, exibições e estrelas**, como antigamente. Sem cadastro, sem links.
- **Procura-se**: a lista do que sabemos que existe e ainda não tem cópia, com o botão “Tenho essa gravação”.

Nenhum vídeo fica no YouTube: os arquivos são seus, enviados para o Internet Archive.

---

## 1. Como as peças se encaixam

| Peça | Onde fica | Custo |
|---|---|---|
| O site (HTML, CSS, JS e os dados em `data/acervo.js`) | GitHub Pages | grátis |
| Os vídeos (MP4 + som da fita M4A + capa JPG + a matriz MKV) | Internet Archive | grátis |
| Comentários, exibições, estrelas e mensagens | Google Apps Script + uma planilha | grátis |
| Preparar cada vídeo | EternalDub + `ferramentas/Exportar_para_o_site.bat` | no seu computador |

O site funciona sozinho, em **modo demonstração**, enquanto o Apps Script não estiver ligado: comentários, exibições e estrelas ficam só no navegador de quem testa.

## 2. Endereço curto e grátis

O endereço mais curto sem pagar domínio é o de uma **organização do GitHub**: o nome dela vira o endereço. Em 06/11/2026 estes nomes estavam livres:

- **`tvdetubo.github.io`** (recomendado: combina com o nome do site)
- `clipes.github.io` (o mais curto de todos)

Para criar (5 minutos):

1. No GitHub, clique no **+** (canto de cima) → **New organization** → plano **Free**.
2. Nome da organização: `tvdetubo` (ou o que escolher). Ela fica ligada à sua conta, Moguel0818.
3. Dentro da organização: **New repository** → nome **exatamente** `tvdetubo.github.io` → **Public** → Create.
4. Envie os arquivos (seção 3).
5. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save. Em 1 a 5 minutos o site está em `https://tvdetubo.github.io`.

Se trocar de nome, mude `SITE_NAME` e `SITE_URL` em `js/config.js`. Se um dia quiser um domínio próprio, o GitHub Pages aceita e o endereço `.github.io` passa a redirecionar para ele.

## 3. Publicar (e atualizar)

Na página do repositório: **Add file → Upload files** e arraste **as pastas** (`css`, `js`, `data`, `assets`, `fonts`, `media`, `backend`, `ferramentas`) e os arquivos soltos `index.html`, `.nojekyll` e `README.md`. Depois **Commit changes**.

> Arraste as **pastas**, não os arquivos de dentro delas: arquivos soltos vão para a raiz e o site não os encontra.

Para cadastrar um vídeo novo depois, basta enviar de novo a pasta `data` (com o `acervo.js` atualizado).

## 4. Preparar um vídeo

1. **EternalDub** (modo videoclipe): *Abrir filme* com a captura da fita → *Adicionar música* com o FLAC do LP/CD → **F5** (detectar atraso) → gerar o MKV. O MKV sai no padrão de videoclipe: **faixa 1 = música do disco**, **faixa 2 = som original da fita**.
2. Arraste o MKV para cima de **`ferramentas/Exportar_para_o_site.bat`**. Ele pergunta o nome dos arquivos, confirma as faixas e se a imagem é entrelaçada, e gera numa pasta `para_o_site`:
   - `nome.mp4` — imagem + áudio do disco (H.264 CRF 18 + AAC 256 kb/s, com `faststart` para começar a tocar logo);
   - `nome-fita.m4a` — o som original da fita (AAC 160 kb/s), na mesma linha do tempo;
   - `nome.jpg` — a capa;
   - `nome-info.txt` — a duração e os próximos passos.

   Captura de fita é entrelaçada: o `.bat` usa o filtro **bwdif** em dobro (59,94 quadros/s, o movimento fica igual ao da TV) e deixa os pixels quadrados (720×480 → 640×480 em 4:3). Ele usa o mesmo FFmpeg do EternalDub.

## 5. Enviar ao Internet Archive

1. Crie uma conta em archive.org (grátis).
2. Vá em **archive.org/upload**, arraste o MP4, o M4A, o JPG e, se quiser guardar a matriz, o MKV original.
3. Preencha:
   - **Page URL / identificador**: `tvdetubo-metro-olhar-1985` (sem espaços nem acentos; vira o endereço do item);
   - **Title**: `Metrô — Olhar (ao vivo, 1985)`;
   - **Description**: de onde veio a fita e os créditos (quem cedeu, quem digitalizou, de que disco é o áudio);
   - **Subject tags**: `tvdetubo; videoclipe; vhs; Metrô`;
   - **Media type**: Movies · **Collection**: Community Video.
4. **Upload**. O item aparece em alguns minutos (às vezes horas, quando o Archive está cheio).

O site toca os arquivos direto do Archive com o player próprio (não precisa do player deles). Guarde sempre as matrizes no seu computador: o Archive tira do ar um item se o detentor dos direitos pedir. Se isso acontecer, dá para pôr outro endereço em **Espelhos** (o player troca sozinho quando um link falha).

## 6. Cadastrar no site

1. Abra **seu-site/#admin** (área do curador; o link também está no rodapé).
2. Cole o identificador do item e clique em **Importar arquivos**: o site encontra o MP4, o M4A e a capa e preenche a duração.
3. Escolha o artista e a música (a lista vem da discografia), o tipo (clipe, na TV, ao vivo…), a data, o programa e a emissora, o disco de onde veio o áudio e os créditos.
4. **Testar neste navegador**: o vídeo aparece no site só para você, com o selo RASCUNHO. Confira o player, a troca de áudio e os créditos.
5. **Gerar bloco** → **Copiar bloco** → cole em `data/acervo.js`, logo depois de `videos: [` → envie a pasta `data` para o GitHub. Depois apague o rascunho na área do curador.

Para passar um registro de “Na fila” ou “Procura-se” para “No acervo”, use o **mesmo id**: o bloco novo substitui o antigo (apague o antigo do arquivo).

## 7. Ligar comentários, exibições e estrelas (Apps Script)

1. Crie uma planilha no Google Sheets, por exemplo **“TV de Tubo - banco”**.
2. Na planilha: **Extensões → Apps Script**. Apague o que estiver lá e cole o arquivo **`backend/Code.gs`** inteiro. Salve.
3. No menu de funções escolha **setup** → **Executar** → autorize (é a sua conta; o Google avisa que o app “não foi verificado”: *Avançado → Acessar*). Ele cria as abas **Comentarios, Exibicoes, Avaliacoes e Mensagens**, com caixas de seleção e cores no status.
4. **Implantar → Nova implantação** → tipo **App da Web** → *Executar como*: **Eu** → *Quem pode acessar*: **Qualquer pessoa** → **Implantar**. Copie a URL que termina em `/exec`.
5. Cole a URL em `js/config.js`, no campo `APPS_SCRIPT_URL`, e envie a pasta `js` para o GitHub.

**Moderação, direto na planilha:**
- **Comentarios** → coluna `status`: `publicado` (aparece), `oculto` (some), `pendente` (espera você). Os comentários aparecem na hora; para aprovar um por um, mude `PUBLICAR_DIRETO` para `false` no começo do Code.gs.
- **Mensagens** → “Tenho essa gravação”, correções e contatos de quem quer colaborar. O contato só você vê. Status `novo`, `em andamento`, `resolvido`, `descartado`. Quando chega “Tenho essa gravação” ou um contato, você recebe um e-mail (`AVISAR_POR_EMAIL`).
- O site atualiza em até 2 minutos depois de uma mudança na planilha.

**Proteções:** sem links nos comentários, até 500 caracteres, 4 comentários por pessoa a cada 10 minutos, campo-armadilha contra robôs, texto que começa com `=` não vira fórmula, uma exibição por pessoa a cada 6 horas e um voto por pessoa e vídeo (pode mudar).

Mudou o Code.gs? **Implantar → Gerenciar implantações → lápis → Versão: Nova versão → Implantar.** A URL continua a mesma.

## 8. Discografia × videografia

Cada artista tem `releases` (discos), cada disco tem `tracks` (faixas) e cada faixa aponta para uma música pelo `song`. Os vídeos apontam para a mesma música pelo `song`. É assim que o site sabe quais faixas têm vídeo.

O campo **`ver`** (versão) separa gravações diferentes da mesma música: sem `ver` é a versão do disco; `"1984"`, `"ao-vivo"`, `"remix"`, `"demo"` são outras. Se o vídeo e a faixa têm o mesmo `ver`, o selo aparece normal; se não, aparece tracejado, com “outra versão”. Exemplo do Metrô: o clipe de “Beat Acelerado” usa a versão do compacto de 1984 (`ver: "1984"`); no LP Olhar a faixa é a “2ª versão”, então lá o clipe aparece como outra versão.

Modelos prontos de artista e de acervo estão na área do curador (`#admin`).

## 9. Formato dos dados (`data/acervo.js`)

- **Fonte** (`sources`): `id: { t: "título", u: "link" }`. Cite pelo id em `src`, ou escreva `{ t, u }` direto.
- **Acervo** (`acervos`): `id`, `name`, `roles` (`curadoria`, `fitas`, `captura`, `audio`, `sincronizacao`, `restauracao`), `since` (`"2026-11"`), `city`, `bio`, `links` (`[{ t, u }]`), `avatar` (link de imagem, opcional).
- **Artista** (`artists`): `id`, `name`, `alt` (outros nomes), `country` (`"BR"`, `"US"`…), `origin`, `years`, `members` (`[{ name, role, years }]`), `intro`, `src`, `releases`.
- **Disco** (`releases`): `id`, `type` (`lp`, `compacto`, `single`, `ep`, `cd`, `coletanea`, `participacao`, `digital`), `title`, `year`, `date`, `label`, `format`, `credit`, `note`, `partial` (lista incompleta), `src`, `tracks`.
- **Faixa** (`tracks`): `n` (`"A"`, `"B"`, `"1"`…), `t` (título), `song` (id da música), `ver`, `len` (`"3:46"`), `w` (compositores), `feat`, `note`.
- **Vídeo** (`videos`): `id`, `artist`, `song`, `ver`, `title`, `kind` (`clipe`, `tv`, `ao-vivo`, `filme`, `entrevista`, `comercial`, `outro`), `date`, `program`, `channel`, `director`, `status` (`no-acervo`, `na-fila`, `procura-se`), `description`, `note` (nota do curador), `aspect` (`"4:3"` ou `"16:9"`), `duration` (segundos), `file` (`video`, `poster`, `ia`, `mirrors`), `audio`, `credits`, `source`, `src`, `refs`, `added`, `added_by`, `tags`.
- **Áudio** (`audio`): o primeiro é o principal, dentro do MP4 (`embedded: true`); os outros têm `url` (o M4A). Campos: `id`, `short` (o que aparece no botão: LP, CD, VHS), `label`, `kind`, `release` (id do disco de onde veio), `by` (quem digitalizou).
- **Créditos** (`credits`): `tape` (quem cedeu a fita), `capture`, `sync`, `restore`, `extra` (`[{ role, who }]`). Use o id de um acervo para virar link.
- **Origem** (`source`): `medium` (VHS…), `standard` (PAL-M, NTSC), `speed` (SP, LP, EP), `from`, `aired`, `generation`, `deck`, `capture`, `notes`.

## 10. O player

- Atalhos: **espaço** tocar/pausar · **← →** 5 s · **A** trocar o áudio · **F** tela cheia · **M** som · **C** filtro CRT.
- Os dois áudios: o MP4 toca a imagem com o áudio do disco; o som da fita é um arquivo à parte, tocado junto. A cada 1/4 de segundo o player confere a diferença e corrige (até 0,3 s acelerando ou freando de leve; acima disso, salta). Nos testes ficou dentro de 30 milésimos. Funciona com qualquer link direto (Archive, GitHub, Neocities), sem configuração no servidor.
- Para o visual vermelho do Eternal Medias original, troque `--vr-acento` e `--vr-moldura` no fim do `css/style.css`.
- Quando o vídeo acaba, o próximo do mesmo artista começa em 5 s (dá para cancelar). Desligue em `PROXIMO_AUTOMATICO`.

## 11. Política

- O site não oferece download: ele toca os vídeos. O link do item no Internet Archive aparece nos créditos, por transparência (desligue em `MOSTRAR_LINK_IA`).
- Se um artista ou detentor de direitos pedir, o vídeo sai do ar.
- Informações reescritas com nossas palavras, sempre com a fonte.

## 12. Arquivos

```
index.html, .nojekyll, README.md
css/style.css               visual (2007 + aero) e o player de TV
js/config.js                nome, endereço, Apps Script, contato
js/core.js                  dados, busca, discografia × videografia, servidor e modo demonstração
js/player.js                player de TV de tubo com dois áudios
js/views.js                 telas
js/admin.js                 área do curador (#admin)
js/app.js                   rotas, comentários, estrelas, formulários, atalhos
data/acervo.js              fontes, acervos, artistas, discos e vídeos
fonts/                      VT323 (licença SIL OFL)
media/teste/                vídeo de teste (barras coloridas, música original e som de fita simulado)
backend/Code.gs             servidor no Google Apps Script
ferramentas/Exportar_para_o_site.bat   MKV do EternalDub → MP4 + M4A + capa
```

## 13. Próximos passos

1. Cadastrar mais artistas com discografia (o Metrô é o modelo) e os primeiros vídeos digitalizados.
2. Páginas estáticas por vídeo para o Google achar (uma GitHub Action que gera HTML a partir do `acervo.js`).
3. Versão em inglês da interface.
4. Capas dos discos pelo Cover Art Archive (MusicBrainz), como no RareVersion.
5. Ligação com o RareVersion: o artista lá mostra os clipes daqui, e vice-versa.
6. Licença: sugestão de MIT no código e CC BY-SA 4.0 nos textos.
