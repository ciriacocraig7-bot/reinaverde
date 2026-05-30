# Reina Verde · Architecture V2

> Documento de norte arquitectónico — qué tenemos, qué hicimos en este rediseño,
> y qué quedó pendiente para la siguiente iteración.
>
> Producido junto al rediseño "Botánica Editorial" del frontend, aplicando el
> framework `system-design` (requirements → high-level → deep dive → scale &
> reliability → trade-offs).

---

## 1 · Estado actual

```
┌──────────────────────────────────────────────────────────────────────┐
│                            CLIENT (PWA)                              │
│  Next.js 16.2 (App Router · Turbopack) · React 19 · Tailwind v4      │
│  Zustand (auth-store, cart-store, shop-cart-store)                   │
│  Botón Bold cargado vía <script> remoto + JWT en localStorage        │
├──────────────────────────────────────────────────────────────────────┤
│                       EDGE / PROXY  (src/proxy.ts)                   │
│  Auth Bearer enforcement para /api/* (excepto whitelisted)           │
├──────────────────────────────────────────────────────────────────────┤
│                     API LAYER (Next.js Route Handlers)               │
│  /api/auth      /api/menu       /api/products                        │
│  /api/orders    /api/shop-orders /api/catering/pay                   │
│  /api/webhooks/bold  (idempotente · v2)                              │
├──────────────────────────────────────────────────────────────────────┤
│                    DOMAIN / DATA ACCESS                              │
│  Prisma 7.5 + @prisma/adapter-pg → Neon PostgreSQL                   │
│  Custom client generator (src/generated/prisma)                      │
├──────────────────────────────────────────────────────────────────────┤
│                       EXTERNAL                                       │
│  Bold (pagos) · Vercel (host) · Sonner (toasts)                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Modelo de dominio (resumen)

- **User / Company** — auth + B2B con NIT.
- **MenuItem / Order / OrderItem** — flujo de catering (con `Event`, `Production`, `Delivery`, `Invoice`, `Feedback`).
- **Product / ProductCategory / ShopOrder / ShopOrderItem** — e-commerce para Pharma + Liofilizados (separación por `businessLine: enum BusinessLine`).
- **PaymentProvider enum: WOMPI | BOLD** — abstracción para múltiples pasarelas.
- `ShopOrder` lleva `boldReference` y `boldTransactionId` con `@unique`.

### Trade-offs heredados

| Decisión       | Beneficio                          | Costo / deuda                                 |
| -------------- | ---------------------------------- | --------------------------------------------- |
| JWT localStorage | Trivial de implementar           | Vulnerable a XSS; no httpOnly                 |
| Prisma adapter-pg | Compatible con Neon              | Genera cliente custom; menos ergonómico       |
| Dos modelos de orden (`Order` vs `ShopOrder`) | Claridad por dominio | Duplicación de webhooks, lógica de payment    |
| Proxy con whitelist explícita | Simple de leer       | Frágil — agregar ruta requiere editar `proxy.ts` |
| Bold via remote `<script>` | Cero backend para checkout | Render bloqueante; difícil testear           |

---

## 2 · Cambios aplicados en esta iteración

### 2.1 · Frontend — Sistema de diseño "Botánica Editorial"

- **Tipografía**: Fraunces (display variable con `opsz` + `SOFT`) + Geist + Geist Mono. Sustituye Inter.
- **Paleta**: base `ink`/`cream`/`bone`/`moss`/`lichen`/`clay` + un acento por línea (`marigold` / `iris` / `persimmon`). Sustituye Material Design 3 tokens.
- **Componentes UI**: `Button`, `Input`, `Card`, `Badge`, `Select`, `Textarea` reescritos sobre tokens nuevos. Acabados de "papel impreso": sin radius por defecto, sombras de letterpress, underlines animados.
- **Componentes de layout**: `SiteHeader` unificado (acepta `line="hub"|"catering"|"pharma"|"liofilizados"`) reemplaza al `Navbar` legado. `SiteFooter` editorial con colofón.
- **Helpers editoriales**: `EditorialRule`, `SectionHeading`, `NumberedRow`, `PriceTag`, `Marquee`, `GrainOverlay`, `PaymentConfirmation`.
- **Páginas reescritas** (17): hub home, las 3 homes de líneas, catálogos (2), carritos (3), confirmaciones (3), menú de catering, eventos, nosotros, login, registro.

### 2.2 · Backend — Webhook Bold idempotente

`POST /api/webhooks/bold` ahora cumple las propiedades de un receiver de webhooks de producción:

| Propiedad             | Antes        | Ahora                                                         |
| --------------------- | ------------ | ------------------------------------------------------------- |
| Idempotencia          | ❌            | ✅ — `ALREADY_PAID` si el `transaction_id` ya existe          |
| Anti-revert           | ❌            | ✅ — `IGNORED_AFTER_PAID` si llega DECLINED tarde             |
| Stop-retry en miss    | 4xx          | 200 con `ORDER_NOT_FOUND` (Bold para de reintentar)           |
| Logging estructurado  | `console.error` | JSON line por evento: `bold.webhook.*`                     |
| Cubrimiento de eventos | parcial     | `payment.{approved,declined,error,expired,canceled,voided,pending}` |

Verificado en local con dos pruebas:
1. Reenvío del mismo `payment.approved` → `paidAt` no cambia (`✓ IDEMPOTENT`).
2. `payment.declined` después de PAID → estado no revierte (`✓ stale decline ignored`).

### 2.3 · Proxy / middleware

- `middleware.ts` → `proxy.ts` (migración Next 16).
- Whitelist explícita para webhooks, catering pay (guest checkout) y catálogos.

---

## 3 · Pendientes priorizados

### P0 — Correctness / Seguridad (antes de producción real)

1. **Mover JWT a cookie `httpOnly` + `SameSite=Lax` + CSRF**
   - Hoy el token vive en `localStorage` → vulnerable a XSS.
   - Plan: cookie `rv-session` httpOnly, secure, sliding refresh; `csrf-token` doble (cookie + header) para mutaciones.
2. **Verificación HMAC de la firma de webhook de Bold**
   - Hoy aceptamos cualquier POST a `/api/webhooks/bold`. Bold provee firma HMAC en `x-bold-signature` (o equivalente — confirmar con su doc).
   - Plan: comparar `HMAC_SHA256(rawBody, BOLD_WEBHOOK_SECRET)` con header; rechazar 401 si no coincide.
3. **Rate limit en `/api/auth/*` y `/api/webhooks/bold`**
   - Plan: middleware basado en `@upstash/ratelimit` (token bucket por IP, 30/min para auth, 600/min para webhook).
4. **Cifrado a nivel de campo para PII pesada (B2B → NIT, dirección de empresa)** si planeamos escalar a SaaS multi-tenant — Ley 1581 Habeas Data.

### P1 — Operación (siguiente sprint)

5. **Abstracción `PaymentProvider`**
   - Hoy: Wompi y Bold conviven con código duplicado (`lib/wompi/`, `lib/bold/`, endpoints duplicados).
   - Plan: interfaz `PaymentProvider { createLink, verifyWebhook, mapStatus }` con dos implementaciones; el endpoint `pay` selecciona por enum.
6. **Email transaccional** (Resend / Postmark)
   - Hoy: `clearCart()` + toast. No hay correo de confirmación al usuario ni a operaciones.
   - Plan: queue de correo (Vercel Queues o Inngest) — `OrderPaid` → cliente, operaciones, contabilidad.
7. **Observability mínima**
   - Vercel Analytics + Sentry para errores cliente y servidor.
   - Endpoint `/api/health` que verifique DB.
8. **Idempotencia request-level en `/api/shop-orders` POST**
   - Cliente envía `Idempotency-Key`; servidor cachea respuesta 24h en KV.

### P2 — Estructural (Q+1)

9. **Unificación de `Order` y `ShopOrder`**
    - Hoy son dos modelos casi paralelos (Catering vs Pharma/Liofilizados). Un `Order` con `lineId` y `metadata` por línea evita duplicación de webhooks y reportes.
10. **Multi-tenant prep**
    - `tenantId` por tabla, subdominio por cliente, `prisma.$extends` para inyectar filtro automático.
11. **Background jobs**
    - Producción / logística siguen siendo sincrónicas. Mover a queue (Inngest / Vercel Queues) → reintentos, dead-letter, telemetría.
12. **Búsqueda y catálogo**
    - Hoy filtros JS in-memory. Mover a Postgres `pg_trgm` + GIN para búsqueda; o Algolia/Meilisearch si el catálogo crece > 1000 SKUs.

---

## 4 · Decisiones de diseño · trade-offs explícitos

### 4.1 · ¿Por qué Fraunces + Geist y no Inter?

- **Para**: identidad inconfundible, sensación editorial, mejor jerarquía (display vs body).
- **Contra**: Fraunces es ~95kb adicional vs Inter (se descarga una vez por sesión).
- **Mitigación**: `display: "swap"`, sólo `axes: [opsz, SOFT]` (no italic + 9 weights como antes).

### 4.2 · ¿Por qué Header unificado por línea?

- **Para**: una sola fuente de verdad, evita drift visual entre líneas, props-driven.
- **Contra**: el componente lee tres stores Zustand; si una línea crece mucho el header puede volverse abultado.
- **Mitigación**: si pasa, factorizar en `HeaderHub`, `HeaderShop`, `HeaderCatering` con un `BaseHeader` interno.

### 4.3 · ¿Por qué idempotencia con `transaction_id` y no con `Idempotency-Key`?

- Bold no provee Idempotency-Key en sus webhooks. Lo más cercano es `transaction_id`, que sí es estable por intento de pago.
- **Trade-off**: si Bold reusara `transaction_id` entre eventos distintos (no debería) lo daríamos por idempotente. Aceptable porque es Bold quien controla esos IDs.

### 4.4 · ¿Por qué `200` cuando la orden no existe?

- Webhooks de pasarelas reintentan ante cualquier non-2xx. Si una orden no existe, reintentar es inútil — la respuesta correcta es "recibí pero no aplica".
- **Trade-off**: oculta posible bug ("manda webhook pero no creé la orden"). Mitigamos con `bold.webhook.order-missing` en logs estructurados → fácilmente alertable.

---

## 5 · Mapa para el próximo desarrollador

- Tipografía y tokens: `src/app/globals.css` (zona `@theme inline`).
- Layout root: `src/app/layout.tsx` (fonts + grain).
- Componentes editoriales: `src/components/marketing/editorial.tsx`.
- Header / Footer: `src/components/layout/site-header.tsx` · `site-footer.tsx`.
- Webhook Bold: `src/app/api/webhooks/bold/route.ts` (notas inline).
- Proxy: `src/proxy.ts`.
- Cliente Bold: `src/lib/bold/{button.ts,client.ts}` (sin cambios).

Para revivir el dev: `npm run dev` → `http://localhost:3000`. La BD Neon hiberna; el primer query puede tardar 5-15s en despertar.
