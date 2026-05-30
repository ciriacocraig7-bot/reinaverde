# Reina Verde · Checklist de despliegue

> Pasos para llevar Reina Verde a producción en Vercel con Bold real.
> Sigue el orden — cada paso depende del anterior.

---

## 0 · Pre-requisitos

- [ ] Cuenta de [Vercel](https://vercel.com) con el repo conectado.
- [ ] Cuenta de [Neon](https://neon.tech) con una BD de **producción** (separada de la de dev).
- [ ] Cuenta de [Bold](https://bold.co) con producto "Botón de Pagos" activado.
- [ ] Cuenta de [Resend](https://resend.com) (o Postmark / Mailgun) con un dominio verificado.
- [ ] Dominio propio apuntando a Vercel (p. ej. `reinaverde.co`).

---

## 1 · Base de datos de producción

1. Crea un nuevo proyecto en Neon.
2. Copia la connection string (formato `postgresql://...?sslmode=require`).
3. Aplica el esquema desde local:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```
4. (Opcional) Siembra datos iniciales — productos y categorías:
   ```bash
   DATABASE_URL="..." npm run seed
   ```
   **No siembres usuarios demo en producción** salvo que quieras eliminarlos manualmente después.

---

## 2 · Bold — Botón de Pagos (producción)

1. En el dashboard de Bold, crea el **par de llaves de producción**:
   - `BOLD_API_KEY` (pública) → `NEXT_PUBLIC_BOLD_API_KEY` en Vercel.
   - `BOLD_SECRET_KEY` (privada, para firmar) → `BOLD_SECRET_KEY` en Vercel.
2. Configura el **webhook** apuntando a:
   ```
   https://reinaverde.co/api/webhooks/bold
   ```
3. En la configuración del webhook, **anota el secreto HMAC** (la cadena con la que Bold firmará cada POST). Ese valor va en `BOLD_WEBHOOK_SECRET`.

   **Sin este valor el webhook acepta cualquier POST** — es el equivalente a tener la puerta abierta.

---

## 3 · Variables de entorno (Vercel)

En *Project Settings → Environment Variables* del proyecto de Vercel, configura para **Production**:

| Variable                       | Valor                                                       |
| ------------------------------ | ----------------------------------------------------------- |
| `DATABASE_URL`                 | Connection string Neon (producción)                         |
| `JWT_SECRET`                   | Cadena aleatoria larga — `openssl rand -hex 32`             |
| `NEXT_PUBLIC_BASE_URL`         | `https://reinaverde.co` (o tu dominio)                      |
| `NODE_ENV`                     | `production`                                                |
| `NEXT_PUBLIC_BOLD_API_KEY`     | Llave pública Bold prod                                     |
| `BOLD_SECRET_KEY`              | Llave secreta Bold prod                                     |
| `BOLD_WEBHOOK_SECRET`          | Secreto HMAC del webhook (Bold dashboard)                   |
| `EMAIL_PROVIDER`               | `resend`                                                    |
| `RESEND_API_KEY`               | API key Resend                                              |
| `EMAIL_FROM`                   | `Reina Verde <no-reply@reinaverde.co>`                      |

Las mismas variables — apuntando a credenciales de **sandbox / staging** — deben copiarse al entorno **Preview** para que los PR builds funcionen sin tocar prod.

---

## 4 · Despliegue

```bash
git push origin main          # CI corre `npm run build` que ejecuta prisma generate + next build
# o desde local:
npx vercel --prod
```

---

## 5 · Verificación end-to-end (producción)

Después del primer deploy a producción, ejecuta esta secuencia desde local apuntando a la URL real:

```bash
BASE=https://reinaverde.co

# 1. Healthcheck básico
curl -sf $BASE/ > /dev/null && echo "✓ hub home OK"

# 2. Manifest + iconos
curl -sf $BASE/manifest.json > /dev/null && echo "✓ manifest OK"
curl -sf $BASE/icon > /dev/null && echo "✓ /icon OK"
curl -sf $BASE/apple-icon > /dev/null && echo "✓ /apple-icon OK"

# 3. Webhook rechaza POST sin firma (debe ser 401)
curl -s -o /dev/null -w "%{http_code}\n" -X POST -H "Content-Type: application/json" \
  -d '{"event":"payment.approved","data":{"reference":"fake"}}' $BASE/api/webhooks/bold
# → 401

# 4. Rate limit en auth dispara 429 con burst (manual con varias requests rápidas)
```

### Smoke test de pago real

1. Abre `https://reinaverde.co/liofilizados/catalogo` en incógnito.
2. Agrega un producto, crea cuenta, completa el envío.
3. En la pasarela Bold paga con **tarjeta de prueba aprobada** (si está en sandbox) o con un monto mínimo real.
4. Verifica que:
   - La página de confirmación carga.
   - El webhook entrega la orden a `PAID` en la BD (puedes verlo desde `/admin`).
   - En los logs de Vercel aparece `bold.webhook.approved`.

---

## 6 · Post-despliegue

- [ ] Configura **Vercel Analytics** (gratis para empezar).
- [ ] Conecta **Sentry** o un canal de errores (`@sentry/nextjs`).
- [ ] Crea cuentas reales para los roles operativos (Camila, Lucía, Felipe, Sebastián…).
- [ ] Cambia las contraseñas de los usuarios sembrados (`reinaverde123`) si decidiste sembrarlos.
- [ ] Apunta el DNS de `reinaverde.co` a Vercel y verifica el certificado SSL.
- [ ] Activa **Vercel Firewall** o WAF si te preocupa el scraping.
- [ ] Habilita backups automáticos en Neon.

---

## 7 · Mantenimiento

### Rotar el secreto de webhook

1. Genera un nuevo secreto en Bold.
2. Actualiza `BOLD_WEBHOOK_SECRET` en Vercel (Production).
3. Redeploy.

### Migrar el esquema

Las migraciones de Prisma viven en `prisma/migrations/`. Para aplicar una nueva:

```bash
DATABASE_URL="..." npx prisma migrate deploy
```

Vercel también puede ejecutar esto en el build hook si lo agregas a `scripts.build`.

### Logs del webhook

Cada llamada al webhook deja una línea JSON con prefijo `bold.webhook.*`. En Vercel Logs filtra por `bold.webhook.signature-rejected` para detectar intentos de spoofing.

---

## 8 · Lo que **no** quedó listo (para iterar)

- **Abstracción `PaymentProvider`** — Wompi y Bold tienen código duplicado en `lib/`.
- **Unificación `Order` vs `ShopOrder`** — dos modelos para el mismo concepto.
- **Tests automatizados** — cero suite hoy.
- **Multi-tenant** — sin `tenantId` en tablas.
- **Background jobs** — producción / logística siguen sincrónicas.
- **Email transaccional con plantillas HTML** — hoy solo texto plano.
- **Verificación de email al registro** — el campo `emailVerified` existe pero no hay flujo.

Cada uno está documentado en `ARCHITECTURE-V2.md` con su trade-off.
