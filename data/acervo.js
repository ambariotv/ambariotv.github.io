/*
 * Ambário — dados do acervo (vídeos, artistas, discografias, acervos e fontes).
 *
 * O jeito fácil de mexer aqui é pela área do curador: endereço do site + #admin.
 * Ela lê este arquivo, aplica a sua alteração e salva de volta no GitHub, com as capas.
 *
 * Se for editar à mão, mantenha o formato JSON: aspas duplas, sem vírgula sobrando
 * no fim das listas e sem comentários dentro do bloco. Campos principais:
 *   videos[]  : id, artist, song, ver, title, kind, date, program, channel, director, status,
 *               capa, fit, duration, file {video, ia, mirrors}, audio[], credits, source,
 *               description, note, src[], refs[], added, added_by
 *   artists[] : id, name, alt[], country, origin, years, members[], intro, src[], releases[]
 *               (releases[]: id, type, title, year, date, label, format, note, partial, src[], tracks[])
 *   acervos[] : id, name, roles[], since, city, bio, links[], avatar
 *   sources   : { id: { t: título, u: link } } (usadas por id nos campos src)
 */
window.AMB_DATA = {
  "updated": "2026-11-12",
  "rev": 22,
  "sources": {
    "wp-metro": {
      "t": "Metrô (band) — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/Metr%C3%B4_(band)"
    },
    "wp-olhar": { "t": "Olhar (álbum) — Wikipédia em inglês", "u": "https://en.wikipedia.org/wiki/Olhar" },
    "wp-beat": {
      "t": "Beat Acelerado — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/Beat_Acelerado"
    },
    "wp-titi": {
      "t": "Ti Ti Ti (canção) — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/Ti_Ti_Ti_(song)"
    },
    "wp-tudo": {
      "t": "Tudo Pode Mudar — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/Tudo_Pode_Mudar"
    },
    "wp-mao": {
      "t": "A Mão de Mao — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/A_M%C3%A3o_de_Mao"
    },
    "wp-dejavu": {
      "t": "Déjà-Vu (álbum do Metrô) — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/D%C3%A9j%C3%A0-Vu_(Metr%C3%B4_album)"
    },
    "wp-gota": {
      "t": "A Gota Suspensa (álbum) — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/A_Gota_Suspensa"
    },
    "mb-mao": {
      "t": "A Mão de Mao — MusicBrainz",
      "u": "https://musicbrainz.org/release/50963e61-f7c7-4c2f-8a94-39863dcec9f3"
    },
    "imdb-tudo": {
      "t": "Metrô: Tudo Pode Mudar (1985), videoclipe — IMDb",
      "u": "https://www.imdb.com/title/tt39390027/"
    },
    "vagalume-metro": { "t": "Metrô — página do artista (Vagalume)", "u": "https://www.vagalume.com.br/metro/" },
    "vagalume-dejavu": {
      "t": "Metrô — Déjà Vu e biografia (Vagalume)",
      "u": "https://www.vagalume.com.br/metro/discografia/deja-vu.html"
    },
    "g1-olhar-2016": {
      "t": "Mauro Ferreira, “Com atraso, mas bônus, Metrô lança edição de 30 anos do álbum Olhar” — G1, 24/07/2016",
      "u": "https://g1.globo.com/musica/blog/mauro-ferreira/post/com-atraso-mas-bonus-metro-lanca-edicao-de-30-anos-do-album-olhar.html"
    },
    "rs-olhar-2016": {
      "t": "Paulo Cavalcanti, “Banda icônica dos anos 1980, Metrô se apresenta em São Paulo e relança disco clássico” — Rolling Stone Brasil",
      "u": "https://rollingstone.com.br/noticia/banda-iconica-dos-anos-1980-metro-se-apresenta-em-sao-paulo-e-relanca-disco-classico/"
    },
    "uai-2015": {
      "t": "Daniel Seabra, “Banda Metrô, sucesso nos anos 1980, anuncia retorno” — UAI, 18/08/2015",
      "u": "https://www.uai.com.br/app/noticia/musica/2015/08/18/noticias-musica,170755/amp.html"
    },
    "curador": { "t": "Informação do curador", "u": "" },
    "wp-legiao": {
      "t": "Legião Urbana — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/Legi%C3%A3o_Urbana"
    },
    "wp-legiao-album": {
      "t": "Legião Urbana (álbum de 1985) — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/Legi%C3%A3o_Urbana_(album)"
    },
    "cm-legiao-2025": {
      "t": "Affonso Nunes, “A Legião Urbana e o disco icônico que quase não nasceu” — Correio da Manhã, jun/2025",
      "u": "https://www.correiodamanha.com.br/cultura/musica/2025/06/204507-a-legiao-urbana-e-o-super-disco-que-quase-nao-nasceu.html"
    },
    "bj-legiao": {
      "t": "Sobre o livro “Será!”, de José Emílio Rondeau, produtor do primeiro disco da Legião Urbana — Brazil Journal",
      "u": "https://braziljournal.com/tiz8"
    },
    "imdb-sera": {
      "t": "Legião Urbana: Será (1985), videoclipe — IMDb",
      "u": "https://www.imdb.com/title/tt12885656/"
    },
    "em-plebe-2025": {
      "t": "“Sexta do rock oitentista em BH com Plebe Rude e Guilherme Isnard” — Estado de Minas, mai/2025",
      "u": "https://www.em.com.br/cultura/2025/05/7146938-sexta-do-rock-oitentista-em-bh-com-plebe-rude-e-guilherme-isnard.html"
    },
    "cm-plebe-2026": {
      "t": "Sobre os 40 anos de “O Concreto Já Rachou” — Correio da Manhã, 27/02/2026 (PDF)",
      "u": "https://digital.correiodamanha.com.br/jornalcorreiodamanha/2026/02/27/17497b/pdf/2702-2caderno11.pdf"
    },
    "nb-plebe-2026": {
      "t": "“Plebe Rude: Álbum clássico ‘O Concreto Já Rachou’ ganha reedição histórica de 40 anos” — Nova Brasil FM, 10/07/2026",
      "u": "https://novabrasilfm.com.br/musica/plebe-rude-album-classico-o-concreto-ja-rachou-ganha-reedicao-historica-de-40-anos"
    },
    "bb-plebe-2026": {
      "t": "“Plebe Rude toca ‘O Concreto Já Rachou’ na íntegra no C6 no Rock” — Billboard Brasil",
      "u": "https://billboard.com.br/plebe-rude-o-concreto-ja-rachou-c6-no-rock/"
    },
    "imdb-ate-quando": {
      "t": "Plebe Rude: Até Quando Esperar, videoclipe — IMDb",
      "u": "https://www.imdb.com/title/tt24675466/"
    },
    "wp-rpm": { "t": "RPM (banda) — Wikipédia em inglês", "u": "https://en.wikipedia.org/wiki/RPM_(band)" },
    "gs-rpm": { "t": "RPM — Guia da Semana", "u": "https://www.guiadasemana.com.br/arte/noticia/rpm" },
    "agora-rpm-2026": {
      "t": "“Rádio Pirata: 40 anos do disco que marcou gerações” — Agora RN",
      "u": "https://agorarn.com.br/cultura/radio-pirata-40-anos-do-disco-que-marcou-geracoes/"
    },
    "bb-rpm-2026": {
      "t": "“No C6 Rock, Paulo Ricardo recria ‘Rádio Pirata Ao Vivo’, clássico do RPM” — Billboard Brasil",
      "u": "https://billboard.com.br/paulo-ricardo-radio-pirata-c6-no-rock-rpm/"
    },
    "cif-rpm": {
      "t": "RPM — discografia (Charts in France)",
      "u": "https://www.chartsinfrance.net/RPM/albums-singles.html"
    },
    "discogs-rpm-lp": {
      "t": "RPM — Revoluções por Minuto (reedição em CD) — Discogs",
      "u": "https://www.discogs.com/release/14723813"
    },
    "wp-malaria": { "t": "Malaria! — Wikipédia em inglês", "u": "https://en.wikipedia.org/wiki/Malaria!" },
    "tapemag-malaria": {
      "t": "Malaria! — Beat the Distance (Tapemag)",
      "u": "https://tape-mag.com/Beat_The_Distance+Malaria!+RELEASES-1-1-24290-8.html"
    },
    "dm-malaria": {
      "t": "“Malaria!: Early 80s all-female new wave group from Berlin” — Dangerous Minds",
      "u": "https://dangerousminds.net/comments/malaria_early_80s_all_female_new_wave_group_from_berlin_that_you_should_kno"
    },
    "ddb-joe-1985": {
      "t": "Joe Euthanazia — Tudo Pode Mudar (RCA, 1985) — Discografia Brasileira",
      "u": "https://discografia.discosdobrasil.com.br/discos/tudo-pode-mudar"
    },
    "letras-joe": {
      "t": "Joe Euthanázia — discografia (Letras)",
      "u": "https://www.letras.mus.br/joe-eutanasia/discografia/"
    },
    "scribd-rock-gaucho": {
      "t": "“100 maiores discos e álbuns do rock gaúcho” (Scribd)",
      "u": "https://www.scribd.com/document/763947887/100-maiores-discos-e-albuns-do-rock-gaucho"
    },
    "wp-virginie": {
      "t": "Virginie Boutaud — Wikipédia em inglês",
      "u": "https://en.wikipedia.org/wiki/Virginie_Boutaud"
    },
    "imdb-rock-estrela": {
      "t": "Rock Estrela (1986), filme de Lael Rodrigues — IMDb",
      "u": "https://www.imdb.com/title/tt0235715/"
    },
    "filmow-rock-estrela": { "t": "Rock Estrela — Filmow", "u": "https://filmow.com/rock-estrela-t23539/" }
  },
  "acervos": [
    {
      "id": "moguell",
      "name": "Miguel Lins",
      "roles": ["curadoria", "captura", "sincronizacao"],
      "since": "2026-11",
      "bio": "Arquivista e curador do Ambário. Sincroniza o áudio dos discos com os vídeos usando o EternalDub, ferramenta própria de código aberto.",
      "bio_en": "Archivist and curator of Ambário. Syncs record audio to the videos using EternalDub, his own open-source tool.",
      "links": [
        { "t": "moguell.neocities.org", "u": "https://moguell.neocities.org/" },
        { "t": "EternalDub no GitHub", "u": "https://github.com/Moguel0818/EternalDub" }
      ],
      "avatar": "media/acervos/moguell.jpg?v=mw62mrrc"
    }
  ],
  "artists": [
    {
      "id": "metro",
      "name": "Metrô",
      "alt": ["A Gota Suspensa (1978–1984)"],
      "country": "BR",
      "origin": "São Paulo, SP",
      "years": "1978–1988 · 2002–2004 · 2014 · 2015–",
      "members": [
        { "name": "Virginie Boutaud", "role": "voz", "years": "1978–1986, 2002–2004, 2014, 2015–" },
        { "name": "Alec Haiat", "role": "guitarra", "years": "1978–1988, 2014, 2015–" },
        {
          "name": "Yann Laouenan",
          "role": "teclados",
          "years": "1978–1988, 2002–2003, 2014, 2015–"
        },
        { "name": "Xavier Leblanc", "role": "baixo", "years": "1978–1988, 2002, 2014, 2015–" },
        { "name": "Dany Roland", "role": "bateria", "years": "1978–1987, 2002–2004, 2014, 2015–" },
        { "name": "Pedro Parq (Pedro d’Orey)", "role": "voz", "years": "1986–1988" },
        { "name": "Marcel Zimberg", "role": "sax", "years": "1978–1984" },
        { "name": "Edmundo Carneiro", "role": "bateria", "years": "1987–1988" },
        { "name": "André Fonseca", "role": "guitarra", "years": "2002–2004" },
        { "name": "Donatinho", "role": "teclados", "years": "2003–2004" },
        { "name": "Pedro Albuquerque", "role": "baixo", "years": "2002–2004" }
      ],
      "intro": "Banda paulistana formada em 1978 por amigos do Lycée Pasteur, primeiro com o nome A Gota Suspensa. Virou Metrô em 1984, estreou pela Epic com o compacto “Beat Acelerado” e estourou com o LP Olhar (1985), de “Tudo Pode Mudar”, “Ti Ti Ti” (abertura da novela da Globo) e “Johnny Love” (do filme Rock Estrela). Virginie Boutaud saiu em 1986; com Pedro Parq nos vocais veio A Mão de Mao (1987), e a banda parou em 1988. Voltou para gravar Déjà-Vu (2002) e se reuniu de novo a partir de 2014.",
      "intro_en": "São Paulo band formed in 1978 by friends from the Lycée Pasteur, first under the name A Gota Suspensa. It became Metrô in 1984, debuted on Epic with the single “Beat Acelerado” and broke through with the LP Olhar (1985), featuring “Tudo Pode Mudar”, “Ti Ti Ti” (theme of the Globo telenovela) and “Johnny Love” (from the film Rock Estrela). Virginie Boutaud left in 1986; with Pedro Parq on vocals came A Mão de Mao (1987), and the band split in 1988. It came back to record Déjà-Vu (2002) and reunited again from 2014 on.",
      "src": ["wp-metro", "vagalume-metro"],
      "releases": [
        {
          "id": "olhar-30-anos-2016",
          "type": "cd",
          "title": "Olhar — edição de 30 anos",
          "year": 2016,
          "date": "2016-08-05",
          "label": "Warner Music",
          "format": "CD (reedição com bônus)",
          "partial": true,
          "note": "As faixas 1 a 12 são o LP de 1985, remasterizado. Abaixo, só as faixas-bônus. A gravadora é a Warner segundo a Wikipédia; a Rolling Stone Brasil fala em Sony Music.",
          "src": ["wp-olhar", "g1-olhar-2016", "rs-olhar-2016"],
          "tracks": [
            {
              "n": "13",
              "t": "Beat Acelerado (versão original de 1984)",
              "song": "beat-acelerado",
              "ver": "1984",
              "len": "3:46",
              "year": 1984
            },
            {
              "n": "14",
              "t": "Ti Ti Ti (Dance Mix)",
              "song": "ti-ti-ti",
              "ver": "dance-mix",
              "len": "4:27",
              "year": 1985
            },
            {
              "n": "15",
              "t": "Johnny Love (versão alternativa)",
              "feat": "Léo Jaime",
              "song": "johnny-love",
              "ver": "alternativa",
              "len": "4:39",
              "year": 1985
            },
            {
              "n": "19",
              "t": "Sândalo de Dândi (ao vivo em Jaú, 19/10/1985)",
              "song": "sandalo-de-dandi",
              "ver": "ao-vivo-jau-1985",
              "len": "8:42",
              "year": 1984
            },
            {
              "n": "23",
              "t": "Stabilo (ao vivo em Tupã, 18/10/1985)",
              "song": "stabilo",
              "ver": "ao-vivo-tupa-1985",
              "len": "3:18",
              "year": 1985
            }
          ]
        }
      ]
    },
    {
      "id": "joe-euthanazia",
      "name": "Joe Euthanazia",
      "photo": "media/artistas/joe-euthanazia.jpg?v=mw8ry0zm",
      "alt": ["Joe Euthanázia", "Joe"],
      "country": "BR",
      "origin": "Rio Grande do Sul",
      "intro": "Cantor e compositor gaúcho. Depois de dois compactos simples (1983 e 1984), lançou em 1985 o LP Tudo Pode Mudar, pela RCA, com produção de Gutti. Também escreveu para o Metrô: é coautor de “Johnny Love” e de “Tudo Pode Mudar”, que a banda gravou no LP Olhar (1985). Em 1989 saiu o álbum Joe, com vocais de Virginie Boutaud, do Metrô, em duas faixas.",
      "intro_en": "Singer-songwriter from Rio Grande do Sul. After two singles (1983 and 1984), he released the LP Tudo Pode Mudar on RCA in 1985, produced by Gutti. He also wrote for Metrô: he co-wrote “Johnny Love” and “Tudo Pode Mudar”, which the band recorded on the LP Olhar (1985). In 1989 came the album Joe, with Metrô's Virginie Boutaud on vocals in two tracks.",
      "src": ["scribd-rock-gaucho", "ddb-joe-1985", "letras-joe", "wp-tudo", "wp-virginie"],
      "releases": [
        {
          "id": "me-leva-pra-casa-1984",
          "type": "compacto",
          "title": "Me Leva pra Casa",
          "year": 1984,
          "format": "Compacto simples",
          "note": "Gravadora ainda não confirmada.",
          "src": [
            "scribd-rock-gaucho",
            "letras-joe",
            {
              "t": "Discogs — Joe – Me Leva Pra Casa",
              "u": "https://www.discogs.com/release/9069789"
            }
          ],
          "tracks": [{ "n": "A", "t": "Me Leva pra Casa", "song": "me-leva-pra-casa" }],
          "partial": true,
          "discogs": 9069789
        },
        {
          "id": "tudo-pode-mudar-1985",
          "type": "lp",
          "title": "Tudo Pode Mudar",
          "year": 1985,
          "label": "RCA",
          "format": "LP",
          "note": "Produção de Gutti; arranjos de Joe Euthanazia. Lado A: faixas 1 a 5; lado B: 6 a 10.",
          "src": [
            "ddb-joe-1985",
            "scribd-rock-gaucho",
            "letras-joe",
            {
              "t": "Discogs — Joe – Tudo Pode Mudar",
              "u": "https://www.discogs.com/release/7502690"
            }
          ],
          "tracks": [
            {
              "n": "3",
              "t": "Febre Tropical",
              "song": "febre-tropical",
              "len": "2:44",
              "w": "Tavinho Paes, Gastão Lamounier, Orlando Vianna"
            },
            { "n": "9", "t": "Brigitte", "song": "brigitte", "w": "Tavinho Paes, Orlando Vianna" },
            { "n": "B4", "t": "Brigitte", "song": "brigitte", "w": "Joe, Tavinho Paes" },
            {
              "n": "A3",
              "t": "Febre Tropical",
              "song": "febre-tropical",
              "w": "Gastão Lamounier, Joe, Tavinho Paes"
            }
          ],
          "partial": true,
          "discogs": 7502690
        },
        {
          "id": "um-sonho-a-mais-nacional-1985",
          "type": "coletanea",
          "title": "Um Sonho A Mais (Nacional)",
          "year": 1985,
          "label": "Som Livre (403.6319)",
          "format": "Vinyl, LP, Compilation",
          "partial": true,
          "src": [
            {
              "t": "Discogs — Various – Um Sonho A Mais (Nacional)",
              "u": "https://www.discogs.com/release/2226122"
            }
          ],
          "tracks": [
            {
              "n": "A5",
              "t": "Me Leva Pra Casa",
              "song": "me-leva-pra-casa",
              "len": "3:43",
              "w": "Gastão Lamounier, Joe"
            }
          ],
          "discogs": 2226122
        }
      ]
    },
    {
      "id": "legiao-urbana",
      "name": "Legião Urbana",
      "country": "BR",
      "origin": "Brasília, DF",
      "years": "1982–1996",
      "members": [
        { "name": "Renato Russo", "role": "voz" },
        { "name": "Dado Villa-Lobos", "role": "guitarra" },
        { "name": "Marcelo Bonfá", "role": "bateria" },
        { "name": "Renato Rocha", "role": "baixo" }
      ],
      "intro": "Banda de Brasília liderada por Renato Russo. O primeiro disco, Legião Urbana, saiu pela EMI-Odeon em 1985 com “Será”, “Ainda É Cedo” e “Geração Coca-Cola”, e o clipe de “Será” foi o primeiro da banda. A formação acima é a da época desse disco.",
      "intro_en": "Brasília band led by Renato Russo. Their first album, Legião Urbana, came out on EMI-Odeon in 1985 with “Será”, “Ainda É Cedo” and “Geração Coca-Cola”, and the video for “Será” was the band's first. The lineup above is the one from that album.",
      "src": ["wp-legiao", "wp-legiao-album", "cm-legiao-2025"],
      "releases": [
        {
          "id": "legiao-urbana-1985",
          "type": "lp",
          "title": "Legião Urbana",
          "year": 1985,
          "label": "EMI-Odeon",
          "format": "LP",
          "note": "Produção de José Emílio Rondeau; letras de Renato Russo. Saiu em janeiro de 1985 segundo a Wikipédia e o Correio da Manhã; o livro “Será!”, do produtor, fala em 15 de fevereiro.",
          "src": ["wp-legiao-album", "cm-legiao-2025", "bj-legiao"],
          "tracks": [
            { "n": "1", "t": "Será", "song": "sera", "len": "2:30" },
            { "n": "6", "t": "Geração Coca-Cola", "song": "geracao-coca-cola", "len": "2:22" }
          ],
          "partial": true
        }
      ]
    },
    {
      "id": "plebe-rude",
      "name": "Plebe Rude",
      "country": "BR",
      "origin": "Brasília, DF",
      "years": "1981–",
      "intro": "Banda de Brasília, da mesma cena da Legião Urbana. Herbert Vianna, dos Paralamas do Sucesso, produziu o primeiro disco, o mini-LP O Concreto Já Rachou, de sete faixas, que vendeu mais de 250 mil cópias. “Até Quando Esperar” abre o disco e virou a música mais conhecida da banda.",
      "intro_en": "Brasília band from the same scene as Legião Urbana. Herbert Vianna, of Paralamas do Sucesso, produced their first record, the seven-track mini-LP O Concreto Já Rachou, which sold more than 250,000 copies. “Até Quando Esperar” opens the record and became the band's best-known song.",
      "src": ["em-plebe-2025", "bb-plebe-2026", "nb-plebe-2026"],
      "releases": [
        {
          "id": "o-concreto-ja-rachou-1985",
          "type": "lp",
          "title": "O Concreto Já Rachou",
          "year": 1985,
          "label": "EMI",
          "format": "Mini-LP",
          "note": "Produção de Herbert Vianna. As fontes divergem sobre a data: nos últimos dias de 1985 (Estado de Minas) ou em fevereiro de 1986 (Correio da Manhã). A divisão dos lados segue a reedição em vinil de 2026.",
          "src": ["em-plebe-2025", "cm-plebe-2026", "nb-plebe-2026", "bb-plebe-2026"],
          "tracks": [{ "n": "A1", "t": "Até Quando Esperar", "song": "ate-quando-esperar" }],
          "partial": true
        }
      ]
    },
    {
      "id": "rpm",
      "name": "RPM",
      "alt": ["Revoluções por Minuto"],
      "country": "BR",
      "origin": "São Paulo, SP",
      "members": [
        { "name": "Paulo Ricardo", "role": "voz e baixo" },
        { "name": "Luiz Schiavon", "role": "teclados" },
        { "name": "Fernando Deluqui", "role": "guitarra" },
        { "name": "Paulo P. A. Pagni", "role": "bateria" }
      ],
      "intro": "Banda paulistana de Paulo Ricardo e Luiz Schiavon. Estreou em 1984 com um compacto de “Louras Geladas” e “Revoluções por Minuto” e lançou o LP Revoluções por Minuto em 1985. O disco ao vivo Rádio Pirata (1986), gravado no Anhembi, em São Paulo, trouxe as inéditas “Alvorada Voraz” e “Naja”. A formação acima é a dos anos 1980.",
      "intro_en": "São Paulo band led by Paulo Ricardo and Luiz Schiavon. It debuted in 1984 with a single of “Louras Geladas” and “Revoluções por Minuto” and released the LP Revoluções por Minuto in 1985. The live album Rádio Pirata (1986), recorded at the Anhembi in São Paulo, brought the new songs “Alvorada Voraz” and “Naja”. The lineup above is the 1980s one.",
      "src": ["gs-rpm", "wp-rpm", "agora-rpm-2026", "bb-rpm-2026"],
      "releases": [
        {
          "id": "radio-pirata-ao-vivo-1986",
          "type": "lp",
          "title": "Rádio Pirata ao Vivo",
          "year": 1986,
          "label": "Epic (CBS)",
          "format": "LP",
          "note": "Gravado ao vivo em 26 e 27 de maio de 1986 no Palácio das Convenções do Anhembi, em São Paulo; chegou às lojas cerca de dois meses depois.",
          "src": ["agora-rpm-2026", "bb-rpm-2026", "cif-rpm"],
          "tracks": [{ "n": "2", "t": "Alvorada Voraz", "song": "alvorada-voraz", "note": "inédita" }],
          "partial": true
        }
      ]
    },
    {
      "id": "malaria",
      "name": "Malaria!",
      "country": "DE",
      "origin": "Berlim Ocidental",
      "years": "1981–1993",
      "members": [
        { "name": "Bettina Köster", "role": "voz e saxofone" },
        { "name": "Gudrun Gut" },
        { "name": "Manon P. Duursma", "role": "teclados" },
        { "name": "Christine Hahn", "role": "bateria" },
        { "name": "Susanne Kuhnke" }
      ],
      "intro": "Grupo só de mulheres de Berlim Ocidental, formado em 1981 por Bettina Köster e Gudrun Gut. Gravou “You You” duas vezes: em Nova York, em agosto de 1983, e no Hansa Studio, em Berlim; as duas saíram no 12\" Beat the Distance (1984). O clipe de “You You” foi dirigido por Anne Carlisle, atriz do filme Liquid Sky.",
      "intro_en": "All-female band from West Berlin, formed in 1981 by Bettina Köster and Gudrun Gut. They recorded “You You” twice: in New York in August 1983 and at Hansa Studio in Berlin; both came out on the 12\" Beat the Distance (1984). The video for “You You” was directed by Anne Carlisle, an actress in the film Liquid Sky.",
      "src": ["wp-malaria", "tapemag-malaria", "dm-malaria"],
      "releases": [
        {
          "id": "beat-the-distance-1984",
          "type": "single",
          "title": "Beat the Distance",
          "year": 1984,
          "label": "Rebel Records",
          "format": "Maxi-single 12\"",
          "partial": true,
          "note": "Também traz “Jealousy” (ao vivo em Washington), “Meeting Place” e “Thrash Me” (Hansa Studio), “Lone Some” (ao vivo em Berlim, 1982) e “Tod” (ao vivo no Berlin Atonal, 1982).",
          "src": ["tapemag-malaria"],
          "tracks": [
            {
              "n": "A1",
              "t": "You You",
              "song": "you-you",
              "note": "gravada em Nova York, ago/1983"
            }
          ]
        }
      ]
    },
    {
      "id": "camisa-de-venus",
      "name": "Camisa de Vênus",
      "photo": "media/artistas/camisa-de-venus.jpg?v=mw972ubk",
      "country": "BR",
      "origin": "Salvador",
      "releases": [
        {
          "id": "tijolo-na-vidraca-2001",
          "type": "coletanea",
          "title": "Tijolo Na Vidraça",
          "year": 2001,
          "label": "Som Livre (0145-2)",
          "format": "3×CD, Compilation",
          "src": [
            {
              "t": "Discogs — Marcelo Nova – Tijolo Na Vidraça",
              "u": "https://www.discogs.com/release/8821064"
            }
          ],
          "tracks": [{ "n": "2-4", "t": "Simca Chambord", "song": "simca-chambord", "year": 1986 }],
          "discogs": 8821064,
          "partial": true
        }
      ]
    }
  ],
  "videos": [
    {
      "id": "metro-beat-acelerado-clipe-1984",
      "artist": "metro",
      "song": "beat-acelerado",
      "ver": "1984",
      "title": "Beat Acelerado",
      "kind": "clipe",
      "date": "1984",
      "status": "na-fila",
      "capa": "media/capas/metro-beat-acelerado-clipe-1984.jpg",
      "duration": 153,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": {
        "medium": "Cópia digital",
        "from": "Reprise no canal Multishow (a logo do canal aparece no canto da tela)"
      },
      "description": "Videoclipe do primeiro compacto do Metrô, com Virginie Boutaud nos vocais. Esta cópia tem 2min33s, mais curta que a faixa do compacto (3min46s).",
      "description_en": "Music video for Metrô's first single, with Virginie Boutaud on vocals. This copy runs 2:33, shorter than the single's track (3:46).",
      "src": ["wp-beat"],
      "refs": [
        {
          "t": "Cópia citada pela Wikipédia (YouTube)",
          "u": "https://www.youtube.com/watch?v=knQYxU4yHCA"
        }
      ],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "legiao-urbana-sera-clipe-1985",
      "artist": "legiao-urbana",
      "song": "sera",
      "title": "Será",
      "kind": "clipe",
      "date": "1985",
      "director": "Toniko Melo",
      "status": "na-fila",
      "capa": "media/capas/legiao-urbana-sera-clipe-1985.jpg",
      "duration": 157,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true,
          "release": "legiao-urbana-1985",
          "note": "faixa 1"
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": { "medium": "Cópia digital" },
      "description": "Primeiro videoclipe da Legião Urbana. Foi gravado de 25 a 27 de maio de 1985 na boate Rose Bom Bom, em São Paulo, com direção de Toniko Melo: a banda toca num cenário pequeno e anda pela cidade à noite.",
      "description_en": "Legião Urbana's first music video. It was shot from May 25 to 27, 1985, at the Rose Bom Bom nightclub in São Paulo, directed by Toniko Melo: the band plays on a small set and walks around the city at night.",
      "src": ["wp-legiao-album", "imdb-sera"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "joe-euthanazia-me-leva-pra-casa-1985",
      "artist": "joe-euthanazia",
      "song": "me-leva-pra-casa",
      "title": "Me Leva Pra Casa",
      "kind": "tv",
      "date": "1984",
      "program": "Programa Vamos Nessa",
      "channel": "SBT",
      "status": "no-acervo",
      "capa": "media/capas/joe-euthanazia-me-leva-pra-casa-1985.jpg",
      "fit": "cover",
      "duration": 213,
      "file": {
        "video": "https://archive.org/download/ambario-joe-euthanazia-me-leva-pra-casa-1985/joe-euthanazia-me-leva-pra-casa-1985.mp4",
        "ia": "ambario-joe-euthanazia-me-leva-pra-casa-1985"
      },
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Coletânea Um Sonho A Mais (Nacional) (Som Livre, 1985)",
          "kind": "lp",
          "release": "um-sonho-a-mais-nacional-1985",
          "by": "Luiz Alberto Gomes (bugrim)",
          "note": "faixa A5",
          "embedded": true
        },
        {
          "id": "original",
          "short": "ORIGINAL",
          "label": "Som original da gravação",
          "kind": "vhs",
          "url": "https://archive.org/download/ambario-joe-euthanazia-me-leva-pra-casa-1985/joe-euthanazia-me-leva-pra-casa-1985-fita.m4a"
        }
      ],
      "credits": { "sync": "Miguel Lins", "tape": "MofoTV" },
      "source": { "medium": "Cópia digital", "from": "Cópia com a marca d’água “MofoTV”", "aired": "1985" },
      "description": "Joe Euthanazia canta “Me Leva pra Casa”, do compacto de 1984, no Programa Vamos Nessa.",
      "description_en": "Joe Euthanazia sings “Me Leva pra Casa”, from his 1984 single, on the TV show Programa Vamos Nessa.",
      "src": ["scribd-rock-gaucho"],
      "refs": [
        {
          "t": "Cópia de referência (YouTube)",
          "u": "https://youtu.be/ra8My-11KOo?si=UV9DIntkO8efEpaY"
        }
      ],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "plebe-rude-ate-quando-esperar-1986",
      "artist": "plebe-rude",
      "song": "ate-quando-esperar",
      "title": "Até Quando Esperar",
      "kind": "clipe",
      "date": "1986",
      "status": "na-fila",
      "capa": "media/capas/plebe-rude-ate-quando-esperar-1986.jpg",
      "duration": 268,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": { "medium": "Cópia digital" },
      "description": "Videoclipe da faixa que abre O Concreto Já Rachou: a banda toca num cenário pequeno que imita um lugar abandonado. O IMDb registra o clipe como de 1985.",
      "description_en": "Music video for the opening track of O Concreto Já Rachou: the band plays on a small set made to look like an abandoned place. IMDb lists the video as from 1985.",
      "src": ["imdb-ate-quando", "em-plebe-2025"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "malaria-you-you-1983",
      "artist": "malaria",
      "song": "you-you",
      "title": "You You",
      "kind": "clipe",
      "date": "1983",
      "director": "Anne Carlisle",
      "status": "na-fila",
      "capa": "media/capas/malaria-you-you-1983.jpg",
      "duration": 133,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": { "medium": "Cópia digital" },
      "description": "Clipe de “You You” dirigido por Anne Carlisle, atriz do filme Liquid Sky. A banda gravou a música duas vezes (em Nova York e em Berlim); ainda não confirmamos qual das duas está no clipe.",
      "description_en": "Video for “You You” directed by Anne Carlisle, an actress in the film Liquid Sky. The band recorded the song twice (in New York and in Berlin); we have not yet confirmed which of the two is in the video.",
      "src": ["wp-malaria", "dm-malaria", "curador"],
      "refs": [{ "t": "Cópia de referência (YouTube)", "u": "https://www.youtube.com/watch?v=ssCzKzZSBN8" }],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "rpm-alvorada-voraz-1986",
      "artist": "rpm",
      "song": "alvorada-voraz",
      "title": "Alvorada Voraz",
      "kind": "clipe",
      "date": "1986",
      "status": "na-fila",
      "capa": "media/capas/rpm-alvorada-voraz-1986.jpg",
      "duration": 257,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true,
          "release": "radio-pirata-ao-vivo-1986",
          "note": "faixa 2"
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": { "medium": "Cópia digital" },
      "description": "Clipe de “Alvorada Voraz”, uma das inéditas do disco ao vivo Rádio Pirata (1986). Mistura cenas do show, imagens aéreas e closes da banda.",
      "description_en": "Video for “Alvorada Voraz”, one of the new songs on the live album Rádio Pirata (1986). It mixes concert footage, aerial shots and close-ups of the band.",
      "src": ["agora-rpm-2026"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "metro-ti-ti-ti-clipe-1985",
      "artist": "metro",
      "song": "ti-ti-ti",
      "title": "Ti Ti Ti",
      "kind": "clipe",
      "date": "1985",
      "status": "na-fila",
      "capa": "media/capas/metro-ti-ti-ti-clipe-1985.jpg",
      "fit": "cover",
      "duration": 179,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": {
        "medium": "Cópia digital",
        "notes": "O arquivo é 16:9 com a imagem 4:3 no meio (bordas pretas nas laterais); o player corta as bordas."
      },
      "description": "Videoclipe de 1985 da música de Rita Lee e Roberto de Carvalho que abria a novela Ti Ti Ti, da Rede Globo.",
      "description_en": "1985 music video for the Rita Lee and Roberto de Carvalho song that opened the Rede Globo telenovela Ti Ti Ti.",
      "src": ["wp-titi"],
      "refs": [
        {
          "t": "Cópia citada pela Wikipédia (YouTube)",
          "u": "https://www.youtube.com/watch?v=19v0AF2eiFc"
        }
      ],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "joe-euthanazia-febre-tropical-1985",
      "artist": "joe-euthanazia",
      "song": "febre-tropical",
      "title": "Febre Tropical",
      "kind": "tv",
      "date": "1985",
      "status": "no-acervo",
      "capa": "media/capas/joe-euthanazia-febre-tropical-1985.jpg",
      "duration": 164,
      "file": {
        "video": "https://archive.org/download/ambario-joe-euthanazia-febre-tropical-1985/joe-euthanazia-febre-tropical-1985.mp4",
        "ia": "ambario-joe-euthanazia-febre-tropical-1985"
      },
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "LP Tudo Pode Mudar (RCA Victor, 1985)",
          "kind": "lp",
          "release": "tudo-pode-mudar-1985",
          "by": "vinilcdbrasil",
          "note": "faixa A3",
          "embedded": true
        },
        {
          "id": "original",
          "short": "ORIGINAL",
          "label": "Som original da gravação",
          "kind": "tv",
          "url": "https://archive.org/download/ambario-joe-euthanazia-febre-tropical-1985/joe-euthanazia-febre-tropical-1985-fita.m4a"
        }
      ],
      "credits": { "sync": "Miguel Lins", "tape": "Renato" },
      "source": {
        "medium": "Cópia digital",
        "from": "Cópia com marcas d’água de colecionador (“Rei dos Arquivos Raros”, “Renato 1980”, “Nacionais Anos 80’s”)"
      },
      "description": "Joe Euthanazia e banda tocam “Febre Tropical”, do LP Tudo Pode Mudar (RCA, 1985), num palco de TV.",
      "description_en": "Joe Euthanazia and his band play “Febre Tropical”, from the LP Tudo Pode Mudar (RCA, 1985), on a TV stage.",
      "src": ["ddb-joe-1985"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "legiao-urbana-geracao-coca-cola-som-maior-1985",
      "artist": "legiao-urbana",
      "song": "geracao-coca-cola",
      "title": "Geração Coca-Cola",
      "kind": "tv",
      "date": "1985",
      "program": "Som Maior",
      "status": "na-fila",
      "capa": "media/capas/legiao-urbana-geracao-coca-cola-som-maior-1985.jpg",
      "fit": "fill",
      "duration": 139,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true,
          "release": "legiao-urbana-1985",
          "note": "faixa 6"
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": {
        "medium": "Cópia digital",
        "notes": "O arquivo está esticado para 16:9; a imagem original é 4:3 (o player corrige)."
      },
      "description": "A Legião Urbana toca “Geração Coca-Cola”, do primeiro disco, num programa de TV com plateia. O nome do programa vem do título da cópia; a emissora ainda não foi confirmada.",
      "description_en": "Legião Urbana plays “Geração Coca-Cola”, from their first album, on a TV show with a studio audience. The show's name comes from the title of the copy; the channel has not been confirmed yet.",
      "src": ["wp-legiao-album"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "metro-johnny-love-rock-estrela-1985",
      "artist": "metro",
      "song": "johnny-love",
      "ver": "alternativa",
      "title": "Johnny Love (no filme Rock Estrela)",
      "kind": "filme",
      "date": "1985",
      "program": "Rock Estrela (filme de Lael Rodrigues)",
      "status": "na-fila",
      "capa": "media/capas/metro-johnny-love-rock-estrela-1985.jpg?v=mweal2bf",
      "fit": "cover",
      "duration": 217,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "release": "olhar-30-anos-2016",
          "note": "faixa 15",
          "embedded": true
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": {
        "medium": "Cópia digital",
        "from": "Cópia do filme (o arquivo traz o título “MEMORIADATV.COM”)",
        "notes": "O arquivo é 16:9 com a imagem 4:3 no meio (bordas pretas nas laterais); o player corta as bordas."
      },
      "description": "Cena do filme Rock Estrela, de Lael Rodrigues, com o Metrô no palco tocando “Johnny Love”. A versão da trilha do filme, com Léo Jaime, saiu como faixa-bônus da edição de 30 anos do LP Olhar (2016). Segundo o IMDb, o filme estreou em 17 de fevereiro de 1986.",
      "description_en": "Scene from Lael Rodrigues' film Rock Estrela, with Metrô on stage playing “Johnny Love”. The soundtrack version, with Léo Jaime, came out as a bonus track on the 30th-anniversary edition of the LP Olhar (2016). According to IMDb, the film premiered on February 17, 1986.",
      "src": ["wp-metro", "imdb-rock-estrela", "filmow-rock-estrela"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "joe-euthanazia-brigitte-1985",
      "artist": "joe-euthanazia",
      "song": "brigitte",
      "title": "Brigitte",
      "kind": "tv",
      "date": "1985",
      "status": "no-acervo",
      "capa": "media/capas/joe-euthanazia-brigitte-1985.jpg",
      "duration": 59,
      "file": {
        "video": "https://archive.org/download/ambario-joe-euthanazia-brigitte-1985/joe-euthanazia-brigitte-1985.mp4",
        "ia": "ambario-joe-euthanazia-brigitte-1985"
      },
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "LP Tudo Pode Mudar (RCA Victor, 1985)",
          "kind": "lp",
          "release": "tudo-pode-mudar-1985",
          "note": "faixa B4",
          "embedded": true
        },
        {
          "id": "original",
          "short": "ORIGINAL",
          "label": "Som original da gravação",
          "kind": "tv",
          "url": "https://archive.org/download/ambario-joe-euthanazia-brigitte-1985/joe-euthanazia-brigitte-1985-fita.m4a"
        }
      ],
      "credits": { "sync": "moguell", "tape": "Virginie Boutaud" },
      "source": { "medium": "Cópia digital", "aired": "1985" },
      "description": "Joe Euthanazia canta “Brigitte”, do LP Tudo Pode Mudar (RCA, 1985), num palco de TV.",
      "description_en": "Joe Euthanazia sings “Brigitte”, from the LP Tudo Pode Mudar (RCA, 1985), on a TV stage.",
      "src": ["ddb-joe-1985"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "metro-sandalo-de-dandi-raul-gil",
      "artist": "metro",
      "song": "sandalo-de-dandi",
      "title": "Sândalo de Dândi",
      "kind": "tv",
      "date": "1985",
      "program": "Programa Raul Gil",
      "status": "na-fila",
      "capa": "media/capas/metro-sandalo-de-dandi-raul-gil.jpg",
      "duration": 259,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": { "medium": "Cópia digital" },
      "description": "O Metrô em “Sândalo de Dândi”, lado B do compacto Beat Acelerado, com cenas gravadas na praia, na exibição do Programa Raul Gil. A data exata ainda não foi confirmada (1984 ou 1985).",
      "description_en": "Metrô performing “Sândalo de Dândi”, the B-side of the Beat Acelerado single, with scenes shot on the beach, as aired on Programa Raul Gil. The exact date has not been confirmed (1984 or 1985).",
      "src": ["vagalume-metro", "wp-beat"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "metro-stabilo-rock-estrela-1985",
      "artist": "metro",
      "song": "stabilo",
      "title": "Stabilo (no filme Rock Estrela)",
      "kind": "filme",
      "date": "1985",
      "program": "Rock Estrela (filme de Lael Rodrigues)",
      "status": "na-fila",
      "capa": "media/capas/metro-stabilo-rock-estrela-1985.jpg",
      "fit": "cover",
      "duration": 54,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true
        },
        { "id": "original", "short": "ORIGINAL", "label": "Som original da gravação", "kind": "tv" }
      ],
      "credits": { "sync": "moguell" },
      "source": {
        "medium": "Cópia digital",
        "from": "Cópia do filme (o arquivo traz o título “MEMORIADATV.COM”)",
        "notes": "O arquivo é 16:9 com a imagem 4:3 no meio (bordas pretas nas laterais); o player corta as bordas."
      },
      "description": "Outra cena de Rock Estrela com o Metrô no palco, desta vez com “Stabilo”, do LP Olhar (1985).",
      "description_en": "Another Rock Estrela scene with Metrô on stage, this time playing “Stabilo”, from the LP Olhar (1985).",
      "src": ["imdb-rock-estrela", "filmow-rock-estrela"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "camisa-de-venus-simca-chambord-1986-clipe-1986",
      "artist": "camisa-de-venus",
      "song": "simca-chambord",
      "title": "Simca Chambord",
      "kind": "clipe",
      "date": "1986",
      "status": "no-acervo",
      "capa": "media/capas/camisa-de-venus-simca-chambord-1986-clipe-1986.jpg?v=mw95zb48",
      "duration": 240,
      "file": {
        "video": "https://archive.org/download/ambario-camisa-de-venus-simca-chambord-1986/camisa-de-venus-simca-chambord-1986.mp4",
        "ia": "ambario-camisa-de-venus-simca-chambord-1986"
      },
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Compilation Tijolo Na Vidraça (Som Livre, 2001)",
          "kind": "lp",
          "release": "tijolo-na-vidraca-2001",
          "by": "Daniel Skiter",
          "note": "faixa 2-4",
          "embedded": true
        },
        {
          "id": "original",
          "short": "ORIGINAL",
          "label": "Som original da gravação",
          "kind": "vhs",
          "url": "https://archive.org/download/ambario-camisa-de-venus-simca-chambord-1986/camisa-de-venus-simca-chambord-1986-fita.m4a"
        }
      ],
      "credits": { "tape": "Canal CMB", "sync": "Miguel Lins" },
      "description": "Videoclipe de \"Simca Chambord\", de Camisa de Vênus (1986)",
      "description_en": "Music video for “Simca Chambord” by Camisa de Vênus (1986).",
      "added": "2026-11-09",
      "added_by": "moguell"
    }
  ]
};
