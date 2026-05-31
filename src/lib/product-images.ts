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
  "flores-canamo-og-kush":             "/img/pharma/flores-og.jpg",
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
  "guanabana-liofilizada":       "/img/liofilizados/guanabana.jpg",
  "kit-reposteria-premium":      "/img/liofilizados/kit-reposteria.jpg",
  "bulk-mango-1kg":              "/img/liofilizados/bulk-mango.jpg",
};

/**
 * Catering menu re-mapeado a los 6 momentos del pitch.
 * Las imágenes de plato individual antiguas (bandeja paisa, salmón maracuyá,
 * bowl vegano, etc.) se conservan y se reusan donde aplica. Las imágenes
 * de "momentos" (desayunos, refrigerios, etc.) sirven como portada del grupo
 * en /catering pero NO se usan aquí — cada item tiene su propia foto.
 */
const CATERING_MENU: Record<string, string> = {
  // DBR · Desayunos y brunchs
  "item-1":  "/img/momentos/desayunos.jpg",
  "item-2":  "/img/catering/frutas-temporada.jpg",
  "item-3":  "/img/catering/cafe-premium.jpg",
  // RFG · Refrigerios y snacks
  "item-4":  "/img/momentos/refrigerios.jpg",
  "item-5":  "/img/catering/tabla-quesos.jpg",
  "item-6":  "/img/catering/ensalada-caesar.jpg",
  // ALM · Almuerzos premium
  "item-7":  "/img/catering/bandeja-paisa.jpg",
  "item-8":  "/img/catering/salmon-maracuya.jpg",
  "item-9":  "/img/catering/bowl-vegano.jpg",
  "item-10": "/img/momentos/almuerzos.jpg",
  // GAL · Cenas de gala
  "item-11": "/img/momentos/cenas.jpg",
  "item-12": "/img/catering/salmon-maracuya.jpg",
  "item-13": "/img/catering/pollo-champinones.jpg",
  // MEX · Mesas de experiencia
  "item-14": "/img/catering/mousse-chocolate.jpg",
  "item-15": "/img/momentos/mesas-experiencia.jpg",
  "item-16": "/img/catering/tabla-quesos.jpg",
  // COC · Coctelería saludable
  "item-17": "/img/momentos/cocteleria.jpg",
  "item-18": "/img/catering/limonada-coco.jpg",
  "item-19": "/img/catering/jugo-natural.jpg",
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
