/*
 * TV de Tubo — configuração
 * Edite este arquivo antes de publicar.
 *
 * ATENÇÃO: este arquivo é público (fica no repositório do GitHub e no site).
 * Não coloque senhas aqui. A moderação é feita direto na planilha do Google.
 */
window.TDT_CONFIG = {
  // Nome do site. A última palavra ganha o destaque azul no logotipo.
  SITE_NAME: "TV de Tubo",

  // Frase curta embaixo do logotipo.
  SITE_TAGLINE: "Acervo de videoclipes",

  // Endereço público do site (usado nos links de compartilhar). Sem barra no fim.
  SITE_URL: "https://tvdetubo.github.io",

  // URL do Web App do Google Apps Script (termina em /exec). Veja backend/Code.gs e o README.
  // Vazio = modo demonstração: comentários, exibições e avaliações ficam só no navegador de quem testa.
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbykId3AnhAjoC0G5MhC9AHkHcETva2VSDYGObYRBX4BCTIj_2a3jizNlSKvZGAcZcFb/exec",

  // Contato do curador (e-mail ou @ do Instagram). Aparece em "Sobre" e "Como colaborar". Vazio = não mostra.
  CONTATO: "",

  // Id do curador em data/acervo.js (aparece como "Cadastrado por" quando o vídeo ainda não tem outros créditos).
  CURADOR: "moguell",

  // Mostrar o link do item no Internet Archive nos créditos de cada vídeo (transparência e preservação).
  MOSTRAR_LINK_IA: true,

  // Quando um vídeo acaba, passa sozinho para o próximo do mesmo artista (5 s de aviso, dá para cancelar).
  PROXIMO_AUTOMATICO: true
};
