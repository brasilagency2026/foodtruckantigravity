// ============================================
// UTILITÁRIO DE SLUG — SEO-friendly URLs
// /menu/sp/sao-paulo/smash-burg-sp
// ============================================

/**
 * Converte qualquer string para slug URL-safe
 * Ex: "Smash Burg SP!" → "smash-burg-sp"
 * Ex: "São Paulo" → "sao-paulo"
 * Ex: "Churrascaria do João & Cia." → "churrascaria-do-joao-cia"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")                        // decompõe acentos
    .replace(/[\u0300-\u036f]/g, "")         // remove marcas diacríticas
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[ç]/g, "c")
    .replace(/[ñ]/g, "n")
    .replace(/[&]/g, "e")
    .replace(/[^a-z0-9\s-]/g, "")           // remove chars especiais
    .trim()
    .replace(/[\s_]+/g, "-")                 // espaços → hífens
    .replace(/-{2,}/g, "-")                  // hífens duplos → simples
    .replace(/^-+|-+$/g, "");               // remove hífens das extremidades
}

/**
 * Normaliza nome de cidade para uso no slug
 * Ex: "São Paulo" → "sao-paulo"
 * Ex: "Belo Horizonte" → "belo-horizonte"
 */
export function cityToSlug(city: string): string {
  return toSlug(city);
}

/**
 * Normaliza sigla de estado para uso no slug
 * Ex: "SP" → "sp"
 * Ex: "Rio de Janeiro" → "rj" (se for nome por extenso, retorna slug)
 */
export function stateToSlug(state: string): string {
  return toSlug(state).replace(/-/g, "");  // remove hífens em siglas
}

/**
 * Gera slug único para um truck:
 * verifica se já existe no banco e adiciona sufixo numérico se necessário
 */
export function buildTruckSlug(name: string, city: string): string {
  return toSlug(name);
}

/**
 * Monta a URL completa do menu a partir dos campos do truck
 * Ex: /menu/sp/sao-paulo/smash-burg-sp
 */
export function buildMenuUrl(truck: {
  state: string;
  city: string;
  slug: string;
}): string {
  return `/menu/${truck.state}/${truck.city}/${truck.slug}`;
}

/**
 * Extrai estado display a partir da sigla
 * Útil para exibir "São Paulo" ao invés de "sp" no breadcrumb
 */
export const BRAZIL_STATES: Record<string, string> = {
  ac: "Acre",
  al: "Alagoas",
  ap: "Amapá",
  am: "Amazonas",
  ba: "Bahia",
  ce: "Ceará",
  df: "Distrito Federal",
  es: "Espírito Santo",
  go: "Goiás",
  ma: "Maranhão",
  mt: "Mato Grosso",
  ms: "Mato Grosso do Sul",
  mg: "Minas Gerais",
  pa: "Pará",
  pb: "Paraíba",
  pr: "Paraná",
  pe: "Pernambuco",
  pi: "Piauí",
  rj: "Rio de Janeiro",
  rn: "Rio Grande do Norte",
  rs: "Rio Grande do Sul",
  ro: "Rondônia",
  rr: "Roraima",
  sc: "Santa Catarina",
  sp: "São Paulo",
  se: "Sergipe",
  to: "Tocantins",
};

export function getStateDisplay(stateSlug: string): string {
  return BRAZIL_STATES[stateSlug.toLowerCase()] ?? stateSlug.toUpperCase();
}
