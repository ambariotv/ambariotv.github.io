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
  "updated": "2026-11-09",
  "rev": 10,
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
      "src": ["wp-metro", "vagalume-metro"],
      "releases": [
        {
          "id": "a-gota-suspensa-1983",
          "type": "lp",
          "title": "A Gota Suspensa",
          "credit": "lançado como A Gota Suspensa",
          "year": 1983,
          "label": "Underground Discos e Artes",
          "format": "LP",
          "note": "Produção de Luiz Antônio Ribas. Segundo a Wikipédia, nunca saiu em CD.",
          "src": ["wp-gota"],
          "tracks": [
            {
              "n": "1",
              "t": "High Society",
              "song": "high-society",
              "len": "1:35",
              "w": "música: Yann Laouenan (instrumental)"
            },
            {
              "n": "2",
              "t": "Convite ao Amor",
              "song": "convite-ao-amor",
              "len": "3:44",
              "w": "letra: Vicente França, A Gota Suspensa; música: Alec Haiat"
            },
            {
              "n": "3",
              "t": "Pourquoi?",
              "song": "pourquoi",
              "len": "2:27",
              "w": "letra: A Gota Suspensa; música: Alec Haiat"
            },
            {
              "n": "4",
              "t": "As Aventuras do Homem-Arame",
              "song": "as-aventuras-do-homem-arame",
              "len": "3:11",
              "w": "letra: Eli Joory, A Gota Suspensa; música: Yann Laouenan"
            },
            {
              "n": "5",
              "t": "Voyage",
              "song": "voyage",
              "len": "7:53",
              "w": "música: Yann Laouenan (instrumental)"
            },
            {
              "n": "6",
              "t": "A Gota",
              "song": "a-gota",
              "len": "4:38",
              "w": "letra: Alec Haiat, Dany Roland, Eli Joory, Freddy Haiat, Mike; música: Alec Haiat, Freddy Haiat"
            },
            {
              "n": "7",
              "t": "Sonho",
              "song": "sonho",
              "len": "2:23",
              "w": "letra: Elvira, A Gota Suspensa; música: Yann Laouenan"
            },
            {
              "n": "8",
              "t": "Apocalypse",
              "song": "apocalypse",
              "len": "7:25",
              "w": "música: Alec Haiat (instrumental)"
            },
            {
              "n": "9",
              "t": "Lotus",
              "song": "lotus",
              "len": "2:52",
              "w": "música: Alec Haiat, Yann Laouenan (instrumental)"
            }
          ]
        },
        {
          "id": "beat-acelerado-1984",
          "type": "compacto",
          "title": "Beat Acelerado",
          "year": 1984,
          "label": "Epic (CBS)",
          "format": "Compacto simples 7\"",
          "note": "Primeiro lançamento com o nome Metrô.",
          "src": ["wp-beat", "vagalume-metro"],
          "tracks": [
            {
              "n": "A",
              "t": "Beat Acelerado",
              "song": "beat-acelerado",
              "ver": "1984",
              "len": "3:46",
              "w": "Alec Haiat, Vicente França, Yann Laouenan"
            },
            {
              "n": "B",
              "t": "Sândalo de Dândi",
              "song": "sandalo-de-dandi",
              "len": "3:53",
              "w": "letra: Tavinho Paes; música: Alec Haiat, Yann Laouenan"
            }
          ]
        },
        {
          "id": "olhar-1985",
          "type": "lp",
          "title": "Olhar",
          "year": 1985,
          "label": "Epic (CBS)",
          "format": "LP e fita cassete",
          "note": "Produção de Luiz Carlos Maluly. Participações de Léo Jaime, Guilherme Isnard (do Zero) e da banda Degradée.",
          "src": ["wp-olhar", "vagalume-metro"],
          "tracks": [
            {
              "n": "1",
              "t": "Olhar",
              "song": "olhar",
              "len": "4:16",
              "w": "Vicente França, Yann Laouenan"
            },
            {
              "n": "2",
              "t": "Cenas Obscenas",
              "feat": "Léo Jaime",
              "song": "cenas-obscenas",
              "len": "4:22",
              "w": "letra: Léo Jaime, Leoni; música: Alec Haiat, Yann Laouenan"
            },
            {
              "n": "3",
              "t": "Johnny Love",
              "song": "johnny-love",
              "len": "4:51",
              "w": "letra: Alec Haiat, Joe Euthanazia, Yann Laouenan; música: Alec Haiat, Yann Laouenan"
            },
            {
              "n": "4",
              "t": "Sândalo de Dândi",
              "song": "sandalo-de-dandi",
              "len": "3:53",
              "w": "letra: Tavinho Paes; música: Alec Haiat, Yann Laouenan"
            },
            {
              "n": "5",
              "t": "Melodix",
              "feat": "coro da banda Degradée",
              "song": "melodix",
              "len": "2:15",
              "w": "letra: Metrô; música: Alec Haiat"
            },
            {
              "n": "6",
              "t": "Beat Acelerado (2ª versão)",
              "song": "beat-acelerado",
              "ver": "2a-versao",
              "len": "1:11",
              "w": "letra: Alec Haiat, Vicente França, Yann Laouenan; música: Vicente França, Yann Laouenan",
              "note": "versão curta, diferente da do compacto"
            },
            {
              "n": "7",
              "t": "Tudo Pode Mudar",
              "feat": "vocal de apoio: Guilherme Isnard",
              "song": "tudo-pode-mudar",
              "len": "3:34",
              "w": "Joe Euthanazia, Ronaldo Santos"
            },
            {
              "n": "8",
              "t": "Hawaii–Bombay",
              "song": "hawaii-bombay",
              "len": "3:58",
              "w": "José María Cano (versão em português: Fernando Naporano)",
              "note": "versão de uma música do Mecano"
            },
            {
              "n": "9",
              "t": "Solução",
              "song": "solucao",
              "len": "2:54",
              "w": "letra: Wagner, Metrô; música: Alec Haiat"
            },
            {
              "n": "10",
              "t": "Stabilo",
              "song": "stabilo",
              "len": "3:20",
              "w": "letra: Ângelo Palumbo; música: Alec Haiat"
            },
            {
              "n": "11",
              "t": "Que Loucura!",
              "song": "que-loucura",
              "len": "3:21",
              "w": "letra: Yann Laouenan; música: Alec Haiat, Xavier Leblanc, Yann Laouenan"
            },
            {
              "n": "12",
              "t": "Ti Ti Ti",
              "song": "ti-ti-ti",
              "len": "2:57",
              "w": "Rita Lee, Roberto de Carvalho"
            }
          ]
        },
        {
          "id": "ti-ti-ti-1985",
          "type": "compacto",
          "title": "Ti Ti Ti",
          "year": 1985,
          "label": "Epic (CBS)",
          "format": "Compacto",
          "note": "“Ti Ti Ti” foi o tema de abertura da novela Ti Ti Ti (Rede Globo, 1985–1986).",
          "src": ["wp-titi"],
          "tracks": [
            { "n": "A", "t": "Ti Ti Ti", "song": "ti-ti-ti", "len": "2:57" },
            { "n": "B", "t": "Tudo Pode Mudar", "song": "tudo-pode-mudar", "len": "3:34" }
          ]
        },
        {
          "id": "cenas-obscenas-1985",
          "type": "single",
          "title": "Cenas Obscenas",
          "year": 1985,
          "label": "Epic (CBS)",
          "format": "Single (formato a confirmar)",
          "partial": true,
          "note": "A Wikipédia lista como single de 1985, sem dizer o formato nem o lado B. Sabe? Sugira uma correção.",
          "src": ["wp-metro"],
          "tracks": [
            {
              "n": "A",
              "t": "Cenas Obscenas",
              "feat": "Léo Jaime",
              "song": "cenas-obscenas",
              "len": "4:22"
            }
          ]
        },
        {
          "id": "balao-magico-1985",
          "type": "participacao",
          "title": "A Turma do Balão Mágico",
          "credit": "disco da Turma do Balão Mágico",
          "year": 1985,
          "format": "LP (participação)",
          "partial": true,
          "note": "O Metrô gravou “Não Dá pra Parar a Música” com a Turma do Balão Mágico, para o disco da série infantil da TV.",
          "src": ["wp-metro", "vagalume-metro"],
          "tracks": [
            {
              "n": "—",
              "t": "Não Dá pra Parar a Música",
              "feat": "com a Turma do Balão Mágico",
              "song": "nao-da-pra-parar-a-musica"
            }
          ]
        },
        {
          "id": "a-mao-de-mao-1987",
          "type": "lp",
          "title": "A Mão de Mao",
          "year": 1987,
          "label": "Epic (CBS)",
          "format": "LP",
          "note": "Único disco com Pedro Parq (Pedro d’Orey) nos vocais. Letras de Pedro Parq e músicas do Metrô; produção de Luiz Carlos Maluly. Singles: “Gato Preto” e “Lágrimas Imóveis”.",
          "src": ["wp-mao", "mb-mao"],
          "tracks": [
            { "n": "1", "t": "A Mão de Mao", "song": "a-mao-de-mao", "len": "5:08" },
            { "n": "2", "t": "Habhitantes", "song": "habhitantes", "len": "3:37" },
            { "n": "3", "t": "Cinema Branco", "song": "cinema-branco", "len": "3:45" },
            {
              "n": "4",
              "t": "Atlântico, 7 de Novembro",
              "song": "atlantico-7-de-novembro",
              "len": "3:08"
            },
            { "n": "5", "t": "Boca", "song": "boca", "len": "3:56" },
            { "n": "6", "t": "Gato Preto", "song": "gato-preto", "len": "3:49" },
            { "n": "7", "t": "Ahnimais (Wiss)", "song": "ahnimais-wiss", "len": "5:23" },
            {
              "n": "8",
              "t": "The Red Prayer (Idiot Love)",
              "song": "the-red-prayer",
              "len": "3:46"
            },
            { "n": "9", "t": "Lágrimas Imóveis", "song": "lagrimas-imoveis", "len": "4:20" }
          ]
        },
        {
          "id": "deja-vu-2002",
          "type": "cd",
          "title": "Déjà-Vu",
          "year": 2002,
          "label": "Trama",
          "format": "CD",
          "note": "Produção de Dany Roland e Yann Laouenan. As faixas 16 a 19 são remixes (bônus).",
          "src": ["wp-dejavu"],
          "tracks": [
            {
              "n": "1",
              "t": "Mensagem de Amor",
              "song": "mensagem-de-amor",
              "len": "4:44",
              "w": "Herbert Vianna",
              "note": "dos Paralamas do Sucesso"
            },
            {
              "n": "2",
              "t": "Achei Bonito",
              "song": "achei-bonito",
              "len": "3:13",
              "w": "tradicional (arranjo: Dany Roland, Virginie Boutaud, Xavier Leblanc, Yann Laouenan)"
            },
            {
              "n": "3",
              "t": "Que Nêga É Essa?",
              "feat": "Preta Gil",
              "song": "que-nega-e-essa",
              "len": "4:23",
              "w": "Jorge Ben Jor"
            },
            {
              "n": "4",
              "t": "Coração Vagabundo",
              "song": "coracao-vagabundo",
              "len": "3:12",
              "w": "Caetano Veloso"
            },
            {
              "n": "5",
              "t": "Aquarela do Brasil",
              "feat": "Preta Gil",
              "song": "aquarela-do-brasil",
              "len": "4:30",
              "w": "Ary Barroso"
            },
            { "n": "6", "t": "Johnny Love", "song": "johnny-love", "ver": "2002", "len": "4:16" },
            {
              "n": "7",
              "t": "Resemblances",
              "song": "resemblances",
              "len": "5:15",
              "w": "letra: Arto Lindsay; música: Andres Levin, Arto Lindsay, Melvin Gibbs",
              "note": "de Arto Lindsay"
            },
            {
              "n": "8",
              "t": "Missing You",
              "song": "missing-you",
              "len": "3:44",
              "w": "Yann Laouenan"
            },
            {
              "n": "9",
              "t": "Rapaz da Moda",
              "song": "rapaz-da-moda",
              "len": "3:43",
              "w": "Evaldo Gouveia, Jair Amorim",
              "note": "sucesso de Jair Rodrigues"
            },
            {
              "n": "10",
              "t": "Everyone’s Wrong but Me",
              "song": "everyones-wrong-but-me",
              "len": "0:59",
              "w": "Sammy Cahn, Saul Chaplin",
              "note": "gravada por Ella Fitzgerald"
            },
            {
              "n": "11",
              "t": "Beat Acelerado",
              "song": "beat-acelerado",
              "ver": "2002",
              "len": "4:36"
            },
            {
              "n": "12",
              "t": "Sândalo de Dândi",
              "song": "sandalo-de-dandi",
              "ver": "2002",
              "len": "4:12"
            },
            {
              "n": "13",
              "t": "Leva Meu Samba",
              "feat": "Jorge Mautner",
              "song": "leva-meu-samba",
              "len": "2:53",
              "w": "Ataulfo Alves"
            },
            {
              "n": "14",
              "t": "Silence",
              "song": "silence",
              "len": "5:37",
              "w": "Charlie Haden (instrumental)"
            },
            {
              "n": "15",
              "t": "Déjà-Vu",
              "feat": "Otto e Waly Salomão",
              "song": "deja-vu",
              "len": "5:53",
              "w": "Dany Roland, Yann Laouenan"
            },
            {
              "n": "16",
              "t": "Coração Vagabundo (remix de DJ Vu e Maga Bo)",
              "song": "coracao-vagabundo",
              "ver": "remix",
              "len": "3:04"
            },
            {
              "n": "17",
              "t": "Beat Acelerado (remix de Bruno LT e Gustavo Garcia)",
              "song": "beat-acelerado",
              "ver": "remix-2002",
              "len": "4:16"
            },
            {
              "n": "18",
              "t": "Achei Bonito (remix de DJ Vu)",
              "song": "achei-bonito",
              "ver": "remix",
              "len": "4:54"
            },
            {
              "n": "19",
              "t": "Déjà-Vu (remix de Apollo 9)",
              "song": "deja-vu",
              "ver": "remix",
              "len": "5:00"
            }
          ]
        },
        {
          "id": "amalia-revisited-2005",
          "type": "coletanea",
          "title": "Amália Revisited",
          "credit": "tributo a Amália Rodrigues",
          "year": 2005,
          "label": "Different World",
          "format": "CD (coletânea)",
          "partial": true,
          "src": ["wp-metro"],
          "tracks": [
            {
              "n": "—",
              "t": "Meu Amor, Meu Amor",
              "song": "meu-amor-meu-amor",
              "note": "de Amália Rodrigues"
            }
          ]
        },
        {
          "id": "dando-voltas-2015",
          "type": "digital",
          "title": "Dando Voltas no Mundo",
          "year": 2015,
          "format": "Single (fora de álbum)",
          "src": ["wp-metro", "uai-2015"],
          "tracks": [{ "n": "1", "t": "Dando Voltas no Mundo", "song": "dando-voltas-no-mundo" }]
        },
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
              "len": "3:46"
            },
            {
              "n": "14",
              "t": "Ti Ti Ti (Dance Mix)",
              "song": "ti-ti-ti",
              "ver": "dance-mix",
              "len": "4:27"
            },
            {
              "n": "15",
              "t": "Johnny Love (versão alternativa)",
              "feat": "Léo Jaime",
              "song": "johnny-love",
              "ver": "alternativa",
              "len": "4:39"
            },
            {
              "n": "16",
              "t": "Beat Acelerado (remix de DJ Zé Pedro)",
              "song": "beat-acelerado",
              "ver": "remix-2016",
              "len": "3:53"
            },
            {
              "n": "17",
              "t": "Tudo Pode Mudar (ao vivo em Cruzeiro, 14/09/1985)",
              "song": "tudo-pode-mudar",
              "ver": "ao-vivo-cruzeiro-1985",
              "len": "5:05"
            },
            {
              "n": "18",
              "t": "Beat Acelerado (ao vivo em Jaú, 19/10/1985)",
              "song": "beat-acelerado",
              "ver": "ao-vivo-jau-1985",
              "len": "6:44"
            },
            {
              "n": "19",
              "t": "Sândalo de Dândi (ao vivo em Jaú, 19/10/1985)",
              "song": "sandalo-de-dandi",
              "ver": "ao-vivo-jau-1985",
              "len": "8:42"
            },
            {
              "n": "20",
              "t": "Olhar (ao vivo em Cornélio Procópio, 13/10/1985)",
              "song": "olhar",
              "ver": "ao-vivo-cornelio-procopio-1985",
              "len": "6:47"
            },
            {
              "n": "21",
              "t": "Johnny Love (ao vivo em Recife, 26/10/1985)",
              "song": "johnny-love",
              "ver": "ao-vivo-recife-1985",
              "len": "7:26"
            },
            {
              "n": "22",
              "t": "Cenas Obscenas (ao vivo em Tupã, 18/10/1985)",
              "song": "cenas-obscenas",
              "ver": "ao-vivo-tupa-1985",
              "len": "4:32"
            },
            {
              "n": "23",
              "t": "Stabilo (ao vivo em Tupã, 18/10/1985)",
              "song": "stabilo",
              "ver": "ao-vivo-tupa-1985",
              "len": "3:18"
            },
            {
              "n": "24",
              "t": "Melodix (ao vivo em Recife, 26/10/1985)",
              "song": "melodix",
              "ver": "ao-vivo-recife-1985",
              "len": "4:55"
            },
            {
              "n": "25",
              "t": "Tudo Pode Mudar (demo)",
              "song": "tudo-pode-mudar",
              "ver": "demo",
              "len": "3:37"
            },
            {
              "n": "26",
              "t": "Sândalo de Dândi (demo)",
              "song": "sandalo-de-dandi",
              "ver": "demo",
              "len": "3:00"
            },
            {
              "n": "27",
              "t": "Eu Digo Stop (inédita, gravada em 1984)",
              "song": "eu-digo-stop",
              "len": "3:52"
            }
          ]
        },
        {
          "id": "a-vida-e-bela-2016",
          "type": "digital",
          "title": "A Vida É Bela (Lalaiá)",
          "year": 2016,
          "format": "Single digital",
          "src": ["wp-metro"],
          "tracks": [{ "n": "1", "t": "A Vida É Bela (Lalaiá)", "song": "a-vida-e-bela" }]
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
      "src": ["scribd-rock-gaucho", "ddb-joe-1985", "letras-joe", "wp-tudo", "wp-virginie"],
      "releases": [
        {
          "id": "mujer-ingrata-1983",
          "type": "compacto",
          "title": "Mujer Ingrata",
          "year": 1983,
          "format": "Compacto simples",
          "note": "Primeiro compacto. Gravadora ainda não confirmada.",
          "src": ["scribd-rock-gaucho", "letras-joe"],
          "tracks": [
            { "n": "A", "t": "Mujer Ingrata", "song": "mujer-ingrata" },
            { "n": "B", "t": "Tensão no Rio", "song": "tensao-no-rio" }
          ]
        },
        {
          "id": "me-leva-pra-casa-1984",
          "type": "compacto",
          "title": "Me Leva pra Casa",
          "year": 1984,
          "format": "Compacto simples",
          "note": "Gravadora ainda não confirmada.",
          "src": ["scribd-rock-gaucho", "letras-joe"],
          "tracks": [
            { "n": "A", "t": "Me Leva pra Casa", "song": "me-leva-pra-casa" },
            { "n": "B", "t": "Um Cara Assim", "song": "um-cara-assim" }
          ]
        },
        {
          "id": "tudo-pode-mudar-1985",
          "type": "lp",
          "title": "Tudo Pode Mudar",
          "year": 1985,
          "label": "RCA",
          "format": "LP",
          "note": "Produção de Gutti; arranjos de Joe Euthanazia. Lado A: faixas 1 a 5; lado B: 6 a 10.",
          "src": ["ddb-joe-1985", "scribd-rock-gaucho", "letras-joe"],
          "tracks": [
            {
              "n": "1",
              "t": "Já Fui",
              "song": "ja-fui",
              "len": "4:03",
              "w": "Gastão Lamounier, Orlando Vianna"
            },
            {
              "n": "2",
              "t": "Pagando e Andando",
              "song": "pagando-e-andando",
              "len": "3:42",
              "w": "Nelson Motta, Orlando Vianna"
            },
            {
              "n": "3",
              "t": "Febre Tropical",
              "song": "febre-tropical",
              "len": "2:44",
              "w": "Tavinho Paes, Gastão Lamounier, Orlando Vianna"
            },
            {
              "n": "4",
              "t": "No Avião",
              "song": "no-aviao",
              "len": "3:04",
              "w": "Gastão Lamounier, Orlando Vianna"
            },
            {
              "n": "5",
              "t": "Tudo Pode Mudar",
              "song": "tudo-pode-mudar",
              "len": "3:30",
              "w": "Orlando Vianna, Ronaldo Santos, Joe Euthanazia",
              "note": "o Metrô gravou no mesmo ano, no LP Olhar"
            },
            {
              "n": "6",
              "t": "Sonhador",
              "song": "sonhador",
              "len": "3:53",
              "w": "Tavinho Paes, Gastão Lamounier, Orlando Vianna"
            },
            {
              "n": "7",
              "t": "Álbum de Retratos",
              "song": "album-de-retratos",
              "len": "3:52",
              "w": "Gastão Lamounier, Orlando Vianna"
            },
            { "n": "8", "t": "Bianca", "song": "bianca", "w": "Gastão Lamounier, Orlando Vianna" },
            { "n": "9", "t": "Brigitte", "song": "brigitte", "w": "Tavinho Paes, Orlando Vianna" },
            {
              "n": "10",
              "t": "107 Interurbano a Cobrar",
              "song": "107-interurbano-a-cobrar",
              "w": "Neusinha Brizola, Joe Euthanazia"
            }
          ]
        },
        {
          "id": "joe-1989",
          "type": "lp",
          "title": "Joe",
          "year": 1989,
          "note": "A Wikipédia chama o álbum de Joe; o Letras lista as mesmas faixas com o título Cem Mil Dólares. Ordem das faixas conforme o Letras.",
          "src": ["wp-virginie", "letras-joe"],
          "tracks": [
            { "n": "1", "t": "Cem Mil Dólares", "song": "cem-mil-dolares" },
            {
              "n": "2",
              "t": "Ligação Direta",
              "song": "ligacao-direta",
              "feat": "vocal: Virginie Boutaud"
            },
            { "n": "3", "t": "Anjo da Guarda", "song": "anjo-da-guarda" },
            {
              "n": "4",
              "t": "Me Leva pra Casa (1989)",
              "song": "me-leva-pra-casa",
              "ver": "1989",
              "note": "não sabemos se é a mesma gravação do compacto de 1984"
            },
            { "n": "5", "t": "Beijo no Ar", "song": "beijo-no-ar" },
            {
              "n": "6",
              "t": "Uma Rajada de Balas",
              "song": "uma-rajada-de-balas",
              "feat": "vocal: Virginie Boutaud"
            },
            { "n": "7", "t": "Tudo Pode Mudar (1989)", "song": "tudo-pode-mudar", "ver": "1989" },
            { "n": "8", "t": "Imagine o Brasil", "song": "imagine-o-brasil" },
            { "n": "9", "t": "Tem o Sol", "song": "tem-o-sol" },
            { "n": "10", "t": "Rotina", "song": "rotina" }
          ]
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
            { "n": "2", "t": "A Dança", "song": "a-danca", "len": "4:01" },
            { "n": "3", "t": "Petróleo do Futuro", "song": "petroleo-do-futuro", "len": "3:02" },
            { "n": "4", "t": "Ainda É Cedo", "song": "ainda-e-cedo", "len": "3:57" },
            { "n": "5", "t": "Perdidos no Espaço", "song": "perdidos-no-espaco", "len": "2:57" },
            { "n": "6", "t": "Geração Coca-Cola", "song": "geracao-coca-cola", "len": "2:22" },
            { "n": "7", "t": "O Reggae", "song": "o-reggae", "len": "3:33" },
            { "n": "8", "t": "Baader-Meinhof Blues", "song": "baader-meinhof-blues", "len": "3:27" },
            { "n": "9", "t": "Soldados", "song": "soldados", "len": "4:50" },
            { "n": "10", "t": "Teorema", "song": "teorema", "len": "3:06" },
            { "n": "11", "t": "Por Enquanto", "song": "por-enquanto", "len": "3:16" }
          ]
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
          "tracks": [
            { "n": "A1", "t": "Até Quando Esperar", "song": "ate-quando-esperar" },
            { "n": "A2", "t": "Proteção", "song": "protecao" },
            { "n": "A3", "t": "Johnny Vai à Guerra (Outra Vez)", "song": "johnny-vai-a-guerra" },
            { "n": "B1", "t": "Minha Renda", "song": "minha-renda" },
            { "n": "B2", "t": "Sexo e Karatê", "song": "sexo-e-karate" },
            { "n": "B3", "t": "Seu Jogo", "song": "seu-jogo" },
            { "n": "B4", "t": "Brasília", "song": "brasilia" }
          ]
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
      "src": ["gs-rpm", "wp-rpm", "agora-rpm-2026", "bb-rpm-2026"],
      "releases": [
        {
          "id": "rpm-1984",
          "type": "compacto",
          "title": "RPM",
          "year": 1984,
          "format": "Compacto",
          "note": "Gravado com bateria eletrônica, antes da formação definitiva.",
          "src": ["gs-rpm", "wp-rpm"],
          "tracks": [
            { "n": "A", "t": "Louras Geladas", "song": "louras-geladas", "ver": "compacto-1984" },
            {
              "n": "B",
              "t": "Revoluções por Minuto",
              "song": "revolucoes-por-minuto",
              "ver": "compacto-1984"
            }
          ]
        },
        {
          "id": "revolucoes-por-minuto-1985",
          "type": "lp",
          "title": "Revoluções por Minuto",
          "year": 1985,
          "label": "Epic (CBS)",
          "format": "LP",
          "note": "Ordem das faixas e durações conforme a reedição em CD (Discogs).",
          "src": ["gs-rpm", "discogs-rpm-lp", "cif-rpm"],
          "tracks": [
            { "n": "1", "t": "Rádio Pirata", "song": "radio-pirata", "len": "3:29" },
            { "n": "2", "t": "Olhar 43", "song": "olhar-43", "len": "3:03" },
            { "n": "3", "t": "A Cruz e a Espada", "song": "a-cruz-e-a-espada", "len": "3:14" },
            { "n": "4", "t": "Estação no Inferno", "song": "estacao-no-inferno", "len": "3:09" },
            {
              "n": "5",
              "t": "A Fúria do Sexo Frágil Contra o Dragão da Maldade",
              "song": "a-furia-do-sexo-fragil",
              "len": "2:41"
            },
            { "n": "6", "t": "Louras Geladas", "song": "louras-geladas", "len": "2:57" },
            { "n": "7", "t": "Liberdade / Guerra Fria", "song": "liberdade-guerra-fria" },
            { "n": "8", "t": "Sob a Luz do Sol", "song": "sob-a-luz-do-sol" },
            { "n": "9", "t": "Juvenília", "song": "juvenilia" },
            { "n": "10", "t": "Pr’esse Vício", "song": "presse-vicio" },
            { "n": "11", "t": "Revoluções por Minuto", "song": "revolucoes-por-minuto" }
          ]
        },
        {
          "id": "radio-pirata-ao-vivo-1986",
          "type": "lp",
          "title": "Rádio Pirata ao Vivo",
          "year": 1986,
          "label": "Epic (CBS)",
          "format": "LP",
          "note": "Gravado ao vivo em 26 e 27 de maio de 1986 no Palácio das Convenções do Anhembi, em São Paulo; chegou às lojas cerca de dois meses depois.",
          "src": ["agora-rpm-2026", "bb-rpm-2026", "cif-rpm"],
          "tracks": [
            {
              "n": "1",
              "t": "Revoluções por Minuto (ao vivo)",
              "song": "revolucoes-por-minuto",
              "ver": "ao-vivo-1986"
            },
            { "n": "2", "t": "Alvorada Voraz", "song": "alvorada-voraz", "note": "inédita" },
            {
              "n": "3",
              "t": "A Cruz e a Espada (ao vivo)",
              "song": "a-cruz-e-a-espada",
              "ver": "ao-vivo-1986"
            },
            { "n": "4", "t": "Naja", "song": "naja", "note": "inédita" },
            { "n": "5", "t": "Olhar 43 (ao vivo)", "song": "olhar-43", "ver": "ao-vivo-1986" },
            {
              "n": "6",
              "t": "Estação no Inferno (ao vivo)",
              "song": "estacao-no-inferno",
              "ver": "ao-vivo-1986"
            },
            { "n": "7", "t": "London, London", "song": "london-london", "w": "Caetano Veloso" },
            {
              "n": "8",
              "t": "Flores Astrais",
              "song": "flores-astrais",
              "note": "dos Secos & Molhados"
            },
            {
              "n": "9",
              "t": "Rádio Pirata (ao vivo)",
              "song": "radio-pirata",
              "ver": "ao-vivo-1986"
            }
          ]
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
            },
            {
              "n": "B1",
              "t": "You You (Hansa)",
              "song": "you-you",
              "ver": "hansa",
              "note": "gravada no Hansa Studio, em Berlim"
            }
          ]
        }
      ]
    },
    {
      "id": "camisa-de-venus",
      "name": "Camisa de Vênus",
      "country": "BR",
      "origin": "Salvador",
      "releases": [
        {
          "id": "simca-chambord-1986",
          "type": "compacto",
          "title": "Simca Chambord",
          "year": 1986,
          "label": "WEA (PRO-1.043)",
          "format": "Vinyl, 12\", 33 ⅓ RPM, 45 RPM, Single, Promo",
          "src": [
            {
              "t": "Discogs — Camisa De Vênus – Simca Chambord",
              "u": "https://www.discogs.com/release/6755600"
            }
          ],
          "tracks": [
            { "n": "A", "t": "Simca Chambord", "song": "simca-chambord", "len": "4:05" },
            { "n": "B", "t": "Simca Chambord", "song": "simca-chambord", "len": "4:05" }
          ],
          "discogs": 6755600
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
      "src": ["wp-legiao-album", "imdb-sera"],
      "added": "2026-11-07",
      "added_by": "moguell"
    },
    {
      "id": "joe-euthanazia-me-leva-pra-casa-1985",
      "artist": "joe-euthanazia",
      "song": "me-leva-pra-casa",
      "title": "Me Leva pra Casa",
      "kind": "tv",
      "date": "1985",
      "program": "Programa Vamos Nessa",
      "channel": "SBT",
      "status": "na-fila",
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
          "label": "Áudio do disco (FLAC)",
          "kind": "lp",
          "release": "tudo-pode-mudar-1985",
          "by": "Luiz Alberto Gomes (bugrim)",
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
          "label": "Áudio do disco (FLAC)",
          "kind": "lp",
          "release": "tudo-pode-mudar-1985",
          "by": "vinilcdbrasil",
          "note": "faixa 3",
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
      "capa": "media/capas/metro-johnny-love-rock-estrela-1985.jpg",
      "fit": "cover",
      "duration": 217,
      "audio": [
        {
          "id": "principal",
          "short": "DISCO",
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "embedded": true,
          "release": "olhar-30-anos-2016",
          "note": "faixa 15"
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
          "label": "Áudio do disco (FLAC)",
          "kind": "digital",
          "release": "tudo-pode-mudar-1985",
          "note": "faixa 9",
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
          "label": "7\" single Simca Chambord (WEA, 1986)",
          "kind": "compacto",
          "release": "simca-chambord-1986",
          "by": "Daniel Skiter",
          "note": "faixa A",
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
      "added": "2026-11-09",
      "added_by": "moguell"
    }
  ]
};
