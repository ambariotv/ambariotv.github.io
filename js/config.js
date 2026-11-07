/*
 * Ambário — configuração
 * Edite este arquivo antes de publicar.
 *
 * ATENÇÃO: este arquivo é público (fica no repositório do GitHub e no site).
 * Não coloque senhas nem tokens aqui. O token do GitHub da área do curador fica
 * só no navegador de quem edita, e a moderação é feita direto na planilha do Google.
 */
window.AMB_CONFIG = {
  // Nome do site (aparece no logotipo, na aba do navegador e no player).
  SITE_NAME: "Ambário",

  // Frase curta embaixo do logotipo.
  SITE_TAGLINE: "Acervo de videoclipes",

  // Endereço público do site (usado nos links de compartilhar). Sem barra no fim.
  SITE_URL: "https://ambariotv.github.io",

  // URL do Web App do Google Apps Script (termina em /exec). Veja backend/Code.gs e o README.
  // Vazio = modo demonstração: comentários, exibições e avaliações ficam só no navegador de quem testa.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbykId3AnhAjoC0G5MhC9AHkHcETva2VSDYGObYRBX4BCTIj_2a3jizNlSKvZGAcZcFb/exec",

  // Repositório do site no GitHub (dono/nome) e o ramo publicado. A área do curador (#admin)
  // salva os vídeos, artistas e capas direto nele, usando o token que você cola lá.
  GITHUB_REPO: "ambariotv/ambariotv.github.io",
  GITHUB_BRANCH: "main",

  // Contato do curador (e-mail ou @ do Instagram). Aparece em "Sobre" e "Como colaborar". Vazio = não mostra.
  CONTATO: "",

  // Id do curador na lista de acervos (aparece como "Cadastrado por" quando o vídeo ainda não tem outros créditos).
  CURADOR: "moguell",

  // Mostrar o link do item no Internet Archive nos créditos de cada vídeo (transparência e preservação).
  MOSTRAR_LINK_IA: true,

  // Quando um vídeo acaba, passa sozinho para o próximo do mesmo artista (5 s de aviso, dá para cancelar).
  PROXIMO_AUTOMATICO: true
};
