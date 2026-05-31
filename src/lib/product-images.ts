/**
 * Mapa slug → ruta de imagen del producto.
 *
 * Las imágenes viven en `public/img/{pharma,liofilizados,catering}/`.
 * Cuando un slug no está mapeado, los componentes hacen fallback a un placeholder
 * (Material Symbol genérico).
 */

const PHARMA: Record<string, string> = {
  "aceite-cbd-full-spectrum-1000mg": "/img/pharma/aceite-cbd-1000.jpg",
  "aceite-cbd-broad-spectrum-500mg":  "/img/pharma/aceite-cbd-500.jpg",
  "flores-canamo-mango-kush":          "/img/pharma/flores-mango.jpg",
  "flores-canamo-og-kush":             "/img/pharma/flores-mango.jpg", // mismo render para OG
  "tintura-cbd-2000mg":                "/img/pharma/tintura.jpg",
  "balsamo-cbd-muscular":              "/img/pharma/balsamo.jpg",
  "kit-bienestar-starter":             "/img/pharma/kit-starter.jpg",
  "cbd-pet-oil-300mg":                 "/img/pharma/pet-oil.jpg",
};

const LIOFILIZADOS: Record<string, string> = {
  "mango-liofilizado-premium":  "/img/liofilizados/mango.jpg",
  "pina-golden-liofilizada":    "/img/liofilizados/pina.jpg",
  "maracuya-en-polvo":           "/img/liofilizados/maracuya.jpg",
  "uchuvas-liofilizadas":        "/img/liofilizados/uchuva.jpg",
  "mix-berries-colombianas":    "/img/liofilizados/mix-berries.jpg",
  "snack-mix-tropical":          "/img/liofilizados/snack-mix.jpg",
  "guanabana-liofilizada":       "/img/liofilizados/mango.jpg", // fallback mango
  "kit-reposteria-premium":      "/img/liofilizados/mix-berries.jpg",
  "bulk-mango-1kg":              "/img/liofilizados/mango.jpg",
};

const CATERING_MENU: Record<string, string> = {
  "item-1":  "/img/catering/empanadas.jpg",       // empanadas
  "item-4":  "/img/catering/bandeja-paisa.jpg",   // bandeja paisa
  "item-5":  "/img/catering/salmon-maracuya.jpg", // salmón maracuyá
  "item-6":  "/img/catering/bowl-vegano.jpg",     // bowl vegano
  "item-8":  "/img/catering/tres-leches.jpg",     // tres leches
};

export function imageForPharma(slug: string): string | null {
  return PHARMA[slug] ?? null;
}

export function imageForLiofilizados(slug: string): string | null {
  return LIOFILIZADOS[slug] ?? null;
}

export function imageForCateringMenu(id: string): string | null {
  return CATERING_MENU[id] ?? null;
}
