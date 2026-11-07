/*
 * TV de Tubo — dados do acervo
 * ============================================================
 * Este arquivo guarda tudo que aparece no site: fontes, colaboradores (acervos), artistas
 * (com a discografia) e vídeos. Para cadastrar um vídeo novo, use a área do curador do site
 * (endereço do site + #admin): ela monta o bloco pronto para colar em "videos".
 *
 * Situação de cada vídeo (status):
 *   "no-acervo"  = o arquivo está no ar e toca no site
 *   "na-fila"    = registro separado pelo curador, ainda sem arquivo no acervo
 *   "procura-se" = sabemos que o registro existe, mas ninguém do acervo tem uma cópia ainda
 *
 * Tipos de vídeo (kind): "clipe", "tv" (apresentação na TV), "ao-vivo" (show), "filme" (cena de filme),
 *   "entrevista", "comercial" ou "outro".
 * Tipos de disco (type): "lp", "compacto", "single", "ep", "cd", "coletanea", "participacao", "digital".
 * Versões: "ver" numa faixa e num vídeo diz qual gravação é (ex.: "1984", "ao-vivo", "remix").
 *   Sem "ver" = a versão principal, a do disco. Assim o site separa "mesma versão" de "outra versão".
 * Créditos: use o id de um acervo (ex.: "moguell") para virar link, ou escreva o nome livre.
 */
window.TDT_DATA = {
  updated: "2026-11-06",

  /* ---------------- fontes (citadas pelo id em "src") ---------------- */
  sources: {
    "wp-metro": { t: "Metrô (band) — Wikipédia em inglês", u: "https://en.wikipedia.org/wiki/Metr%C3%B4_(band)" },
    "wp-olhar": { t: "Olhar (álbum) — Wikipédia em inglês", u: "https://en.wikipedia.org/wiki/Olhar" },
    "wp-beat": { t: "Beat Acelerado — Wikipédia em inglês", u: "https://en.wikipedia.org/wiki/Beat_Acelerado" },
    "wp-titi": { t: "Ti Ti Ti (canção) — Wikipédia em inglês", u: "https://en.wikipedia.org/wiki/Ti_Ti_Ti_(song)" },
    "wp-tudo": { t: "Tudo Pode Mudar — Wikipédia em inglês", u: "https://en.wikipedia.org/wiki/Tudo_Pode_Mudar" },
    "wp-mao": { t: "A Mão de Mao — Wikipédia em inglês", u: "https://en.wikipedia.org/wiki/A_M%C3%A3o_de_Mao" },
    "wp-dejavu": { t: "Déjà-Vu (álbum do Metrô) — Wikipédia em inglês", u: "https://en.wikipedia.org/wiki/D%C3%A9j%C3%A0-Vu_(Metr%C3%B4_album)" },
    "wp-gota": { t: "A Gota Suspensa (álbum) — Wikipédia em inglês", u: "https://en.wikipedia.org/wiki/A_Gota_Suspensa" },
    "mb-mao": { t: "A Mão de Mao — MusicBrainz", u: "https://musicbrainz.org/release/50963e61-f7c7-4c2f-8a94-39863dcec9f3" },
    "imdb-tudo": { t: "Metrô: Tudo Pode Mudar (1985), videoclipe — IMDb", u: "https://www.imdb.com/title/tt39390027/" },
    "vagalume-metro": { t: "Metrô — página do artista (Vagalume)", u: "https://www.vagalume.com.br/metro/" },
    "vagalume-dejavu": { t: "Metrô — Déjà Vu e biografia (Vagalume)", u: "https://www.vagalume.com.br/metro/discografia/deja-vu.html" },
    "g1-olhar-2016": { t: "Mauro Ferreira, “Com atraso, mas bônus, Metrô lança edição de 30 anos do álbum Olhar” — G1, 24/07/2016", u: "https://g1.globo.com/musica/blog/mauro-ferreira/post/com-atraso-mas-bonus-metro-lanca-edicao-de-30-anos-do-album-olhar.html" },
    "rs-olhar-2016": { t: "Paulo Cavalcanti, “Banda icônica dos anos 1980, Metrô se apresenta em São Paulo e relança disco clássico” — Rolling Stone Brasil", u: "https://rollingstone.com.br/noticia/banda-iconica-dos-anos-1980-metro-se-apresenta-em-sao-paulo-e-relanca-disco-classico/" },
    "uai-2015": { t: "Daniel Seabra, “Banda Metrô, sucesso nos anos 1980, anuncia retorno” — UAI, 18/08/2015", u: "https://www.uai.com.br/app/noticia/musica/2015/08/18/noticias-musica,170755/amp.html" },
    "curador": { t: "Informação do curador", u: "" }
  },

  /* ---------------- acervos: quem guarda, digitaliza e sincroniza ---------------- */
  acervos: [
    {
      id: "moguell",
      name: "moguell",
      roles: ["curadoria", "captura", "sincronizacao"],
      since: "2026-11",
      city: "",
      bio: "Arquivista e curador do TV de Tubo. Sincroniza o áudio dos discos com as fitas usando o EternalDub, ferramenta própria de código aberto.",
      links: [
        { t: "moguell.neocities.org", u: "https://moguell.neocities.org/" },
        { t: "EternalDub no GitHub", u: "https://github.com/Moguel0818/EternalDub" }
      ],
      avatar: ""
    }
  ],

  /* ---------------- artistas e discografias ---------------- */
  artists: [
    {
      id: "metro",
      name: "Metrô",
      alt: ["A Gota Suspensa (1978–1984)"],
      country: "BR",
      origin: "São Paulo, SP",
      years: "1978–1988 · 2002–2004 · 2014 · 2015–",
      members: [
        { name: "Virginie Boutaud", role: "voz", years: "1978–1986, 2002–2004, 2014, 2015–" },
        { name: "Alec Haiat", role: "guitarra", years: "1978–1988, 2014, 2015–" },
        { name: "Yann Laouenan", role: "teclados", years: "1978–1988, 2002–2003, 2014, 2015–" },
        { name: "Xavier Leblanc", role: "baixo", years: "1978–1988, 2002, 2014, 2015–" },
        { name: "Dany Roland", role: "bateria", years: "1978–1987, 2002–2004, 2014, 2015–" },
        { name: "Pedro Parq (Pedro d’Orey)", role: "voz", years: "1986–1988" },
        { name: "Marcel Zimberg", role: "sax", years: "1978–1984" },
        { name: "Edmundo Carneiro", role: "bateria", years: "1987–1988" },
        { name: "André Fonseca", role: "guitarra", years: "2002–2004" },
        { name: "Donatinho", role: "teclados", years: "2003–2004" },
        { name: "Pedro Albuquerque", role: "baixo", years: "2002–2004" }
      ],
      intro: "Banda paulistana formada em 1978 por amigos do Lycée Pasteur, primeiro com o nome A Gota Suspensa. Virou Metrô em 1984, estreou pela Epic com o compacto “Beat Acelerado” e estourou com o LP Olhar (1985), de “Tudo Pode Mudar”, “Ti Ti Ti” (abertura da novela da Globo) e “Johnny Love” (do filme Rock Estrela). Virginie Boutaud saiu em 1986; com Pedro Parq nos vocais veio A Mão de Mao (1987), e a banda parou em 1988. Voltou para gravar Déjà-Vu (2002) e se reuniu de novo a partir de 2014.",
      src: ["wp-metro", "vagalume-metro"],
      releases: [
        {
          id: "a-gota-suspensa-1983", type: "lp", title: "A Gota Suspensa", credit: "lançado como A Gota Suspensa",
          year: 1983, label: "Underground Discos e Artes", format: "LP",
          note: "Produção de Luiz Antônio Ribas. Segundo a Wikipédia, nunca saiu em CD.",
          src: ["wp-gota"],
          tracks: [
            { n: "1", t: "High Society", song: "high-society", len: "1:35", w: "música: Yann Laouenan (instrumental)" },
            { n: "2", t: "Convite ao Amor", song: "convite-ao-amor", len: "3:44", w: "letra: Vicente França, A Gota Suspensa; música: Alec Haiat" },
            { n: "3", t: "Pourquoi?", song: "pourquoi", len: "2:27", w: "letra: A Gota Suspensa; música: Alec Haiat" },
            { n: "4", t: "As Aventuras do Homem-Arame", song: "as-aventuras-do-homem-arame", len: "3:11", w: "letra: Eli Joory, A Gota Suspensa; música: Yann Laouenan" },
            { n: "5", t: "Voyage", song: "voyage", len: "7:53", w: "música: Yann Laouenan (instrumental)" },
            { n: "6", t: "A Gota", song: "a-gota", len: "4:38", w: "letra: Alec Haiat, Dany Roland, Eli Joory, Freddy Haiat, Mike; música: Alec Haiat, Freddy Haiat" },
            { n: "7", t: "Sonho", song: "sonho", len: "2:23", w: "letra: Elvira, A Gota Suspensa; música: Yann Laouenan" },
            { n: "8", t: "Apocalypse", song: "apocalypse", len: "7:25", w: "música: Alec Haiat (instrumental)" },
            { n: "9", t: "Lotus", song: "lotus", len: "2:52", w: "música: Alec Haiat, Yann Laouenan (instrumental)" }
          ]
        },
        {
          id: "beat-acelerado-1984", type: "compacto", title: "Beat Acelerado",
          year: 1984, label: "Epic (CBS)", format: "Compacto simples 7\"",
          note: "Primeiro lançamento com o nome Metrô.",
          src: ["wp-beat", "vagalume-metro"],
          tracks: [
            { n: "A", t: "Beat Acelerado", song: "beat-acelerado", ver: "1984", len: "3:46", w: "Alec Haiat, Vicente França, Yann Laouenan" },
            { n: "B", t: "Sândalo de Dândi", song: "sandalo-de-dandi", len: "3:53", w: "letra: Tavinho Paes; música: Alec Haiat, Yann Laouenan" }
          ]
        },
        {
          id: "olhar-1985", type: "lp", title: "Olhar",
          year: 1985, label: "Epic (CBS)", format: "LP e fita cassete",
          note: "Produção de Luiz Carlos Maluly. Participações de Léo Jaime, Guilherme Isnard (do Zero) e da banda Degradée.",
          src: ["wp-olhar", "vagalume-metro"],
          tracks: [
            { n: "1", t: "Olhar", song: "olhar", len: "4:16", w: "Vicente França, Yann Laouenan" },
            { n: "2", t: "Cenas Obscenas", feat: "Léo Jaime", song: "cenas-obscenas", len: "4:22", w: "letra: Léo Jaime, Leoni; música: Alec Haiat, Yann Laouenan" },
            { n: "3", t: "Johnny Love", song: "johnny-love", len: "4:51", w: "letra: Alec Haiat, Joe Euthanazia, Yann Laouenan; música: Alec Haiat, Yann Laouenan" },
            { n: "4", t: "Sândalo de Dândi", song: "sandalo-de-dandi", len: "3:53", w: "letra: Tavinho Paes; música: Alec Haiat, Yann Laouenan" },
            { n: "5", t: "Melodix", feat: "coro da banda Degradée", song: "melodix", len: "2:15", w: "letra: Metrô; música: Alec Haiat" },
            { n: "6", t: "Beat Acelerado (2ª versão)", song: "beat-acelerado", ver: "2a-versao", len: "1:11", w: "letra: Alec Haiat, Vicente França, Yann Laouenan; música: Vicente França, Yann Laouenan", note: "versão curta, diferente da do compacto" },
            { n: "7", t: "Tudo Pode Mudar", feat: "vocal de apoio: Guilherme Isnard", song: "tudo-pode-mudar", len: "3:34", w: "Joe Euthanazia, Ronaldo Santos" },
            { n: "8", t: "Hawaii–Bombay", song: "hawaii-bombay", len: "3:58", w: "José María Cano (versão em português: Fernando Naporano)", note: "versão de uma música do Mecano" },
            { n: "9", t: "Solução", song: "solucao", len: "2:54", w: "letra: Wagner, Metrô; música: Alec Haiat" },
            { n: "10", t: "Stabilo", song: "stabilo", len: "3:20", w: "letra: Ângelo Palumbo; música: Alec Haiat" },
            { n: "11", t: "Que Loucura!", song: "que-loucura", len: "3:21", w: "letra: Yann Laouenan; música: Alec Haiat, Xavier Leblanc, Yann Laouenan" },
            { n: "12", t: "Ti Ti Ti", song: "ti-ti-ti", len: "2:57", w: "Rita Lee, Roberto de Carvalho" }
          ]
        },
        {
          id: "ti-ti-ti-1985", type: "compacto", title: "Ti Ti Ti",
          year: 1985, label: "Epic (CBS)", format: "Compacto",
          note: "“Ti Ti Ti” foi o tema de abertura da novela Ti Ti Ti (Rede Globo, 1985–1986).",
          src: ["wp-titi"],
          tracks: [
            { n: "A", t: "Ti Ti Ti", song: "ti-ti-ti", len: "2:57" },
            { n: "B", t: "Tudo Pode Mudar", song: "tudo-pode-mudar", len: "3:34" }
          ]
        },
        {
          id: "cenas-obscenas-1985", type: "single", title: "Cenas Obscenas",
          year: 1985, label: "Epic (CBS)", format: "Single (formato a confirmar)", partial: true,
          note: "A Wikipédia lista como single de 1985, sem dizer o formato nem o lado B. Sabe? Sugira uma correção.",
          src: ["wp-metro"],
          tracks: [
            { n: "A", t: "Cenas Obscenas", feat: "Léo Jaime", song: "cenas-obscenas", len: "4:22" }
          ]
        },
        {
          id: "balao-magico-1985", type: "participacao", title: "A Turma do Balão Mágico", credit: "disco da Turma do Balão Mágico",
          year: 1985, format: "LP (participação)", partial: true,
          note: "O Metrô gravou “Não Dá pra Parar a Música” com a Turma do Balão Mágico, para o disco da série infantil da TV.",
          src: ["wp-metro", "vagalume-metro"],
          tracks: [
            { n: "—", t: "Não Dá pra Parar a Música", feat: "com a Turma do Balão Mágico", song: "nao-da-pra-parar-a-musica" }
          ]
        },
        {
          id: "a-mao-de-mao-1987", type: "lp", title: "A Mão de Mao",
          year: 1987, label: "Epic (CBS)", format: "LP",
          note: "Único disco com Pedro Parq (Pedro d’Orey) nos vocais. Letras de Pedro Parq e músicas do Metrô; produção de Luiz Carlos Maluly. Singles: “Gato Preto” e “Lágrimas Imóveis”.",
          src: ["wp-mao", "mb-mao"],
          tracks: [
            { n: "1", t: "A Mão de Mao", song: "a-mao-de-mao", len: "5:08" },
            { n: "2", t: "Habhitantes", song: "habhitantes", len: "3:37" },
            { n: "3", t: "Cinema Branco", song: "cinema-branco", len: "3:45" },
            { n: "4", t: "Atlântico, 7 de Novembro", song: "atlantico-7-de-novembro", len: "3:08" },
            { n: "5", t: "Boca", song: "boca", len: "3:56" },
            { n: "6", t: "Gato Preto", song: "gato-preto", len: "3:49" },
            { n: "7", t: "Ahnimais (Wiss)", song: "ahnimais-wiss", len: "5:23" },
            { n: "8", t: "The Red Prayer (Idiot Love)", song: "the-red-prayer", len: "3:46" },
            { n: "9", t: "Lágrimas Imóveis", song: "lagrimas-imoveis", len: "4:20" }
          ]
        },
        {
          id: "deja-vu-2002", type: "cd", title: "Déjà-Vu",
          year: 2002, label: "Trama", format: "CD",
          note: "Produção de Dany Roland e Yann Laouenan. As faixas 16 a 19 são remixes (bônus).",
          src: ["wp-dejavu"],
          tracks: [
            { n: "1", t: "Mensagem de Amor", song: "mensagem-de-amor", len: "4:44", w: "Herbert Vianna", note: "dos Paralamas do Sucesso" },
            { n: "2", t: "Achei Bonito", song: "achei-bonito", len: "3:13", w: "tradicional (arranjo: Dany Roland, Virginie Boutaud, Xavier Leblanc, Yann Laouenan)" },
            { n: "3", t: "Que Nêga É Essa?", feat: "Preta Gil", song: "que-nega-e-essa", len: "4:23", w: "Jorge Ben Jor" },
            { n: "4", t: "Coração Vagabundo", song: "coracao-vagabundo", len: "3:12", w: "Caetano Veloso" },
            { n: "5", t: "Aquarela do Brasil", feat: "Preta Gil", song: "aquarela-do-brasil", len: "4:30", w: "Ary Barroso" },
            { n: "6", t: "Johnny Love", song: "johnny-love", ver: "2002", len: "4:16" },
            { n: "7", t: "Resemblances", song: "resemblances", len: "5:15", w: "letra: Arto Lindsay; música: Andres Levin, Arto Lindsay, Melvin Gibbs", note: "de Arto Lindsay" },
            { n: "8", t: "Missing You", song: "missing-you", len: "3:44", w: "Yann Laouenan" },
            { n: "9", t: "Rapaz da Moda", song: "rapaz-da-moda", len: "3:43", w: "Evaldo Gouveia, Jair Amorim", note: "sucesso de Jair Rodrigues" },
            { n: "10", t: "Everyone’s Wrong but Me", song: "everyones-wrong-but-me", len: "0:59", w: "Sammy Cahn, Saul Chaplin", note: "gravada por Ella Fitzgerald" },
            { n: "11", t: "Beat Acelerado", song: "beat-acelerado", ver: "2002", len: "4:36" },
            { n: "12", t: "Sândalo de Dândi", song: "sandalo-de-dandi", ver: "2002", len: "4:12" },
            { n: "13", t: "Leva Meu Samba", feat: "Jorge Mautner", song: "leva-meu-samba", len: "2:53", w: "Ataulfo Alves" },
            { n: "14", t: "Silence", song: "silence", len: "5:37", w: "Charlie Haden (instrumental)" },
            { n: "15", t: "Déjà-Vu", feat: "Otto e Waly Salomão", song: "deja-vu", len: "5:53", w: "Dany Roland, Yann Laouenan" },
            { n: "16", t: "Coração Vagabundo (remix de DJ Vu e Maga Bo)", song: "coracao-vagabundo", ver: "remix", len: "3:04" },
            { n: "17", t: "Beat Acelerado (remix de Bruno LT e Gustavo Garcia)", song: "beat-acelerado", ver: "remix-2002", len: "4:16" },
            { n: "18", t: "Achei Bonito (remix de DJ Vu)", song: "achei-bonito", ver: "remix", len: "4:54" },
            { n: "19", t: "Déjà-Vu (remix de Apollo 9)", song: "deja-vu", ver: "remix", len: "5:00" }
          ]
        },
        {
          id: "amalia-revisited-2005", type: "coletanea", title: "Amália Revisited", credit: "tributo a Amália Rodrigues",
          year: 2005, label: "Different World", format: "CD (coletânea)", partial: true,
          src: ["wp-metro"],
          tracks: [
            { n: "—", t: "Meu Amor, Meu Amor", song: "meu-amor-meu-amor", note: "de Amália Rodrigues" }
          ]
        },
        {
          id: "dando-voltas-2015", type: "digital", title: "Dando Voltas no Mundo",
          year: 2015, format: "Single (fora de álbum)",
          src: ["wp-metro", "uai-2015"],
          tracks: [
            { n: "1", t: "Dando Voltas no Mundo", song: "dando-voltas-no-mundo" }
          ]
        },
        {
          id: "olhar-30-anos-2016", type: "cd", title: "Olhar — edição de 30 anos",
          year: 2016, date: "2016-08-05", label: "Warner Music", format: "CD (reedição com bônus)", partial: true,
          note: "As faixas 1 a 12 são o LP de 1985, remasterizado. Abaixo, só as faixas-bônus. A gravadora é a Warner segundo a Wikipédia; a Rolling Stone Brasil fala em Sony Music.",
          src: ["wp-olhar", "g1-olhar-2016", "rs-olhar-2016"],
          tracks: [
            { n: "13", t: "Beat Acelerado (versão original de 1984)", song: "beat-acelerado", ver: "1984", len: "3:46" },
            { n: "14", t: "Ti Ti Ti (Dance Mix)", song: "ti-ti-ti", ver: "dance-mix", len: "4:27" },
            { n: "15", t: "Johnny Love (versão alternativa)", feat: "Léo Jaime", song: "johnny-love", ver: "alternativa", len: "4:39" },
            { n: "16", t: "Beat Acelerado (remix de DJ Zé Pedro)", song: "beat-acelerado", ver: "remix-2016", len: "3:53" },
            { n: "17", t: "Tudo Pode Mudar (ao vivo em Cruzeiro, 14/09/1985)", song: "tudo-pode-mudar", ver: "ao-vivo-cruzeiro-1985", len: "5:05" },
            { n: "18", t: "Beat Acelerado (ao vivo em Jaú, 19/10/1985)", song: "beat-acelerado", ver: "ao-vivo-jau-1985", len: "6:44" },
            { n: "19", t: "Sândalo de Dândi (ao vivo em Jaú, 19/10/1985)", song: "sandalo-de-dandi", ver: "ao-vivo-jau-1985", len: "8:42" },
            { n: "20", t: "Olhar (ao vivo em Cornélio Procópio, 13/10/1985)", song: "olhar", ver: "ao-vivo-cornelio-procopio-1985", len: "6:47" },
            { n: "21", t: "Johnny Love (ao vivo em Recife, 26/10/1985)", song: "johnny-love", ver: "ao-vivo-recife-1985", len: "7:26" },
            { n: "22", t: "Cenas Obscenas (ao vivo em Tupã, 18/10/1985)", song: "cenas-obscenas", ver: "ao-vivo-tupa-1985", len: "4:32" },
            { n: "23", t: "Stabilo (ao vivo em Tupã, 18/10/1985)", song: "stabilo", ver: "ao-vivo-tupa-1985", len: "3:18" },
            { n: "24", t: "Melodix (ao vivo em Recife, 26/10/1985)", song: "melodix", ver: "ao-vivo-recife-1985", len: "4:55" },
            { n: "25", t: "Tudo Pode Mudar (demo)", song: "tudo-pode-mudar", ver: "demo", len: "3:37" },
            { n: "26", t: "Sândalo de Dândi (demo)", song: "sandalo-de-dandi", ver: "demo", len: "3:00" },
            { n: "27", t: "Eu Digo Stop (inédita, gravada em 1984)", song: "eu-digo-stop", len: "3:52" }
          ]
        },
        {
          id: "a-vida-e-bela-2016", type: "digital", title: "A Vida É Bela (Lalaiá)",
          year: 2016, format: "Single digital",
          src: ["wp-metro"],
          tracks: [
            { n: "1", t: "A Vida É Bela (Lalaiá)", song: "a-vida-e-bela" }
          ]
        }
      ]
    },

    /* Artistas que por enquanto só têm vídeos (a discografia pode ser cadastrada depois) */
    { id: "nazareth", name: "Nazareth", country: "GB", origin: "Dunfermline, Escócia" },
    { id: "the-dickies", name: "The Dickies", country: "US", origin: "Los Angeles, EUA" },
    { id: "lindberg", name: "Lindberg", country: "" },
    { id: "sandra", name: "Sandra", country: "DE" },
    { id: "naoko-isamu", name: "Naoko Isamu", alt: ["勇直子"], country: "JP" },
    { id: "kid-abelha", name: "Kid Abelha", country: "BR", origin: "Rio de Janeiro, RJ" },
    { id: "soda-stereo", name: "Soda Stereo", country: "AR", origin: "Buenos Aires" },
    { id: "virus", name: "Virus", country: "AR", origin: "La Plata" },
    { id: "fanzine", name: "Fanzine", country: "BR" },
    { id: "paralamas", name: "Os Paralamas do Sucesso", country: "BR" },
    { id: "rpm", name: "RPM", country: "BR", origin: "São Paulo, SP" },
    { id: "depeche-mode", name: "Depeche Mode", country: "GB" },
    { id: "titas", name: "Titãs", country: "BR", origin: "São Paulo, SP" },
    { id: "ritchie-valens", name: "Ritchie Valens", country: "US" },
    { id: "luiz-gonzaga", name: "Luiz Gonzaga", country: "BR", origin: "Exu, PE" },
    { id: "dalto", name: "Dalto", country: "BR" },
    { id: "joe", name: "Joe", country: "BR" },
    { id: "tubarao", name: "Tubarão", country: "BR", origin: "Santa Catarina" },
    { id: "jackson-5", name: "The Jackson 5", country: "US" },
    { id: "kristina-orbakaite", name: "Кристина Орбакайте", alt: ["Kristina Orbakaitė"], country: "RU" },
    { id: "malaria", name: "Malaria!", country: "DE", origin: "Berlim" },

    { id: "sinal-de-teste", name: "Sinal de teste", test: true, intro: "Vídeos usados para testar o site e o player." }
  ],

  /* ---------------- vídeos ---------------- */
  videos: [
    {
      id: "sinal-de-teste-audio-duplo",
      artist: "sinal-de-teste",
      title: "Barras coloridas — teste de áudio duplo",
      kind: "outro", date: "2026-11-06", status: "no-acervo", test: true,
      aspect: "4:3", duration: 24,
      description: "Vídeo de teste do player: barras coloridas com uma música original curta, gravada em duas versões sincronizadas. Troque entre LP (som limpo, estéreo) e VHS (mono, abafado, com chiado e oscilação de fita) a qualquer momento. O quadrado branco pisca junto com o bumbo e a caixa, então dá para conferir a sincronia de ouvido e de olho.",
      file: { video: "media/teste/barras-coloridas.mp4", poster: "media/teste/barras-coloridas.jpg" },
      audio: [
        { id: "principal", short: "LP", label: "Música limpa (simula o LP)", kind: "lp", embedded: true },
        { id: "fita", short: "VHS", label: "Som da fita VHS (simulado)", kind: "vhs", url: "media/teste/barras-coloridas-fita.m4a" }
      ],
      credits: { extra: [{ role: "Música e vídeo", who: "gerados por computador para testar o player (sem obra de terceiros)" }] },
      source: { medium: "Arquivo digital (gerado)", notes: "640×480, 29,97 quadros/s, H.264 + AAC. O som de fita foi simulado com filtro de banda, wow & flutter e chiado." },
      added: "2026-11-06", added_by: "moguell"
    },

    /* ----- registros separados pelo curador (vieram do player do moguell.neocities.org) ----- */
    {
      id: "metro-olhar-ao-vivo-1985", artist: "metro", song: "olhar", ver: "ao-vivo",
      title: "Olhar (ao vivo)", kind: "ao-vivo", date: "1985", status: "na-fila",
      description: "“Olhar”, faixa-título do primeiro LP, tocada ao vivo em 1985.",
      note: "O único registro em vídeo da banda tocando em sua turnê de 85",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=9ICzrRUl8LM" }],
      src: ["curador"], added: "2026-11-06", added_by: "moguell", tags: ["turnê de 1985"]
    },
    {
      id: "nazareth-love-hurts-ao-vivo-1984", artist: "nazareth", song: "love-hurts",
      title: "Love Hurts (ao vivo)", kind: "ao-vivo", date: "1984", status: "na-fila",
      note: "Registro foda, gravado na Alemanha",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=bJxxIFv4k48" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "the-dickies-killer-klowns-1988", artist: "the-dickies", song: "killer-klowns",
      title: "Killer Klowns from Outer Space", kind: "clipe", date: "1988", status: "na-fila",
      description: "Música-tema do filme Killer Klowns from Outer Space (1988).",
      note: "Filmasso do caralho",
      refs: [
        { t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=7CzLdg0PpLI" },
        { t: "As versões do filme no RareVersion", u: "https://moguel0818.github.io/RareVersion/" }
      ],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "lindberg-glory-days-1991", artist: "lindberg", song: "glory-days",
      title: "Glory Days", kind: "outro", date: "1991", status: "na-fila",
      note: "Belo",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=4IIBVdwlyHs" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "sandra-in-the-heat-of-the-night-1986", artist: "sandra", song: "in-the-heat-of-the-night",
      title: "In the Heat of the Night (ao vivo)", kind: "ao-vivo", date: "1986", status: "na-fila",
      note: "Um dos poucos registros dela cantando sem playback. Pena, pois tinha uma voz linda",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=iWrDTJACxYM" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "naoko-isamu-sayonara-1987", artist: "naoko-isamu", song: "sayonara-wa-ochikomanaide",
      title: "さよならは落ち込まないで", kind: "outro", date: "1987", status: "na-fila",
      note: "Chega arrepiei. Perfeição",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=ee7kC0KlM-U" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "kid-abelha-distracao-ao-vivo-1983", artist: "kid-abelha", song: "distracao",
      title: "Distração (ao vivo)", kind: "ao-vivo", date: "1983", status: "na-fila",
      note: "A única versão ao vivo desse que, foi o primeiro sucesso deles nas rádios",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=ps3_SG3Sr6s" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "soda-stereo-sobredosis-de-tv-1984", artist: "soda-stereo", song: "sobredosis-de-tv",
      title: "Sobredosis de TV (en vivo)", kind: "ao-vivo", date: "1984", status: "na-fila",
      note: "Primeira apresentação do grupo no Chile",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=KURxItGfcf4" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "virus-tomo-lo-que-encuentro-1986", artist: "virus", song: "tomo-lo-que-encuentro",
      title: "Tomo lo que encuentro (en vivo)", kind: "ao-vivo", date: "1986", status: "na-fila",
      note: "A capa desse disco é tão bela",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=LKEp2JYD--s" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "fanzine-boy-do-subterraneo-1985", artist: "fanzine", song: "boy-do-subterraneo",
      title: "Boy do Subterrâneo", kind: "clipe", date: "1985", status: "na-fila",
      note: "Essa é desconhecida",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=T3umbUWAXrI" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "paralamas-veraneio-vascaina-1983", artist: "paralamas", song: "veraneio-vascaina",
      title: "Veraneio Vascaína (ao vivo)", kind: "ao-vivo", date: "1983", status: "na-fila",
      note: "O show deles foi um dos melhores que já fui",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=wW75pxZH_Po" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "rpm-a-cruz-e-a-espada-1985", artist: "rpm", song: "a-cruz-e-a-espada",
      title: "A Cruz e a Espada (ao vivo)", kind: "ao-vivo", date: "1985", status: "na-fila",
      note: "A primeira banda de rock BR que conheci. Boa até hoje",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=Z6WMx5I3q1E" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "depeche-mode-shake-the-disease-1989", artist: "depeche-mode", song: "shake-the-disease",
      title: "Shake the Disease (ao vivo)", kind: "ao-vivo", date: "1989", status: "na-fila",
      note: "Faria de tudo pra ir nessa tour",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=gflnSN-04DM" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "kid-abelha-amanha-e-23-1987", artist: "kid-abelha", song: "amanha-e-23",
      title: "Amanhã é 23", kind: "tv", program: "Globo de Ouro", channel: "Rede Globo", date: "1987", status: "na-fila",
      note: "Gravação feita pro Globo de Ouro",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=Mfr29nJCb1Y" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "titas-toda-cor-1984", artist: "titas", song: "toda-cor",
      title: "Toda Cor", kind: "clipe", date: "1984", status: "na-fila",
      note: "Eu quero te encontrar",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=cWPhaxWdoN4" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "ritchie-valens-ooh-my-head-1959", artist: "ritchie-valens", song: "ooh-my-head",
      title: "Ooh! My Head", kind: "filme", program: "Go, Johnny, Go! (filme de 1959)", date: "1959", status: "na-fila",
      note: "Essa é uma cena do filme 'Go Jhonny Go', do Chuck Berry",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=ha04X2yZnOU" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "luiz-gonzaga-paraxaxa-1953", artist: "luiz-gonzaga", song: "paraxaxa",
      title: "Paraxaxá", kind: "tv", channel: "TV Tupi", date: "1953", status: "na-fila",
      note: "A riqueza desse registro... lindo",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=QatB7OAMH2k" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "dalto-pessoa-1983", artist: "dalto", song: "pessoa",
      title: "Pessoa", kind: "clipe", date: "1983", status: "na-fila",
      note: "Minha irmã odeia essa música kkkk",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=Y84HwXb870E" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "joe-me-leva-pra-casa-1985", artist: "joe", song: "me-leva-pra-casa",
      title: "Me Leva pra Casa", kind: "tv", date: "1985", status: "na-fila",
      note: "Me leva",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=4xLov6E79Rg" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "tubarao-so-da-voce-1985", artist: "tubarao", song: "so-da-voce",
      title: "Só Dá Você", kind: "clipe", date: "1985", status: "na-fila",
      note: "Excelente rock catarinense",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=gDQQbdrtosc" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "jackson-5-tv-tupi-1974", artist: "jackson-5",
      title: "Visita do grupo ao Brasil", kind: "tv", channel: "TV Tupi", date: "1974", status: "na-fila",
      note: "E pensar que o Michael só tinha 16 anos",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=NGwnFSCQOZM" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "kristina-orbakaite-pust-govoryat-1985", artist: "kristina-orbakaite", song: "pust-govoryat",
      title: "Пусть говорят", kind: "outro", date: "1985", status: "na-fila",
      note: "Essa artista é fenomenal",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=ZQODSa4uwDA" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "malaria-you-you-1983", artist: "malaria", song: "you-you",
      title: "You, You", kind: "clipe", date: "1983", status: "na-fila",
      note: "Videoclipe da música You, You",
      refs: [{ t: "Cópia de referência (YouTube)", u: "https://www.youtube.com/watch?v=ssCzKzZSBN8" }],
      added: "2026-11-06", added_by: "moguell"
    },

    /* ----- Metrô: registros conhecidos que ainda procuram uma cópia para o acervo ----- */
    {
      id: "metro-beat-acelerado-clipe-1984", artist: "metro", song: "beat-acelerado", ver: "1984",
      title: "Beat Acelerado", kind: "clipe", date: "1984", status: "procura-se",
      description: "Videoclipe feito no mesmo ano do compacto, com a versão original da música (3:46).",
      src: ["wp-beat"],
      refs: [{ t: "Cópia em circulação, citada pela Wikipédia (YouTube)", u: "https://www.youtube.com/watch?v=knQYxU4yHCA" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "metro-ti-ti-ti-clipe-1985", artist: "metro", song: "ti-ti-ti",
      title: "Ti Ti Ti", kind: "clipe", date: "1985", status: "procura-se",
      description: "Videoclipe de 1985 da música que abria a novela Ti Ti Ti, da Rede Globo.",
      src: ["wp-titi"],
      refs: [{ t: "Cópia em circulação, citada pela Wikipédia (YouTube)", u: "https://www.youtube.com/watch?v=19v0AF2eiFc" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "metro-tudo-pode-mudar-clipe-1985", artist: "metro", song: "tudo-pode-mudar",
      title: "Tudo Pode Mudar", kind: "clipe", date: "1985", director: "Eid Walesko", status: "procura-se",
      description: "Videoclipe de 1985, dirigido por Eid Walesko.",
      src: ["wp-tudo", "imdb-tudo"],
      refs: [{ t: "Cópia em circulação, citada pela Wikipédia (YouTube)", u: "https://www.youtube.com/watch?v=sswvzk7H1DU" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "metro-johnny-love-rock-estrela-1985", artist: "metro", song: "johnny-love",
      title: "Johnny Love (no filme Rock Estrela)", kind: "filme", program: "Rock Estrela (filme de Lael Rodrigues, 1985)", date: "1985", status: "procura-se",
      description: "“Johnny Love” está na trilha do filme Rock Estrela, em que a banda aparece como ela mesma, ao lado de Léo Jaime.",
      src: ["wp-metro", "wp-olhar"],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "metro-areias-escaldantes-1985", artist: "metro",
      title: "Participação no filme Areias Escaldantes", kind: "filme", program: "Areias Escaldantes (filme de Francisco de Paula, 1985)", date: "1985", status: "procura-se",
      description: "A banda aparece como ela mesma no filme. Ainda não sabemos qual música toca: se você souber, sugira uma correção.",
      src: ["wp-metro"],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "metro-mensagem-de-amor-clipe-2002", artist: "metro", song: "mensagem-de-amor",
      title: "Mensagem de Amor", kind: "clipe", date: "2002", director: "Bia Lessa", status: "procura-se",
      description: "Um dos três clipes do disco Déjà-Vu, todos dirigidos pela cineasta Bia Lessa.",
      src: ["wp-dejavu"],
      refs: [{ t: "Cópia em circulação, citada pela Wikipédia (YouTube)", u: "https://www.youtube.com/watch?v=HMDYAL_5Hj0" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "metro-achei-bonito-clipe-2002", artist: "metro", song: "achei-bonito",
      title: "Achei Bonito", kind: "clipe", date: "2002", director: "Bia Lessa", status: "procura-se",
      description: "Clipe do disco Déjà-Vu, dirigido por Bia Lessa.",
      src: ["wp-dejavu"],
      refs: [{ t: "Cópia em circulação, citada pela Wikipédia (YouTube)", u: "https://www.youtube.com/watch?v=lld-N0Ydp9A" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "metro-resemblances-clipe-2002", artist: "metro", song: "resemblances",
      title: "Resemblances", kind: "clipe", date: "2002", director: "Bia Lessa", status: "procura-se",
      description: "Clipe do disco Déjà-Vu, dirigido por Bia Lessa.",
      src: ["wp-dejavu"],
      refs: [{ t: "Cópia em circulação, citada pela Wikipédia (YouTube)", u: "https://www.youtube.com/watch?v=hjXyqaZ3f3E" }],
      added: "2026-11-06", added_by: "moguell"
    },
    {
      id: "metro-dando-voltas-domingo-legal-2015", artist: "metro", song: "dando-voltas-no-mundo", ver: "tv",
      title: "Dando Voltas no Mundo", kind: "tv", program: "Domingo Legal", channel: "SBT", date: "2015-08-16", status: "procura-se",
      description: "A banda tocou ao vivo no Domingo Legal a música nova “Dando Voltas no Mundo”, no ano da volta.",
      src: ["vagalume-dejavu"],
      added: "2026-11-06", added_by: "moguell"
    }
  ]
};
