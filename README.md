# 🌿 Reina Verde — Plataforma de Catering Corporativo

**"El Uber del Catering"** — PWA completa para catering corporativo con automatización total: pedido → pago → producción → logística → ejecución → feedback.

## Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Estilos | Tailwind CSS v4, componentes shadcn-style |
| Estado | Zustand (auth-store, cart-store) |
| Base de datos | PostgreSQL + Prisma ORM v7.5 |
| Autenticación | JWT + bcrypt + sistema de roles |
| Pagos | Wompi (Colombia) |
| PWA | Service Worker, manifest.json, offline support |
| Validación | Zod schemas |

## Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Configurar DATABASE_URL en .env con tu PostgreSQL

# 4. Generar cliente Prisma
npx prisma generate

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Roles del Sistema

| Rol | Ruta | Descripción |
|-----|------|-------------|
| **ADMIN** | `/admin` | Dashboard con KPIs, gestión completa |
| **CLIENTE** | `/cliente` | Pedidos, eventos, facturas, feedback |
| **CHEF** | `/chef` | Cola de producción, ingredientes |
| **STAFF** | `/staff` | Entregas, asignaciones, tracking |
| **PROVEEDOR** | `/proveedor` | Pedidos de insumos, catálogo |
| **FINANZAS** | `/finanzas` | Facturación, pagos, reportes |

## Módulos

1. **Pedidos** — Selección de menú, personalización, cotización automática, checkout 3 pasos
2. **Eventos** — Corporativo, bodas, social, suscripción con timeline
3. **Producción** — Planificación de cocina, ingredientes, estados de preparación
4. **Logística** — Asignación de staff, rutas, tracking
5. **Finanzas** — Facturación, pagos Wompi, reportes
6. **Proveedores** — Gestión de insumos, pedidos automáticos
7. **Feedback** — Calificaciones y reviews

## Flujo Principal

```
Cliente → Selecciona evento → Configura menú → Recibe cotización
→ Paga (Wompi) → Sistema activa: Producción + Logística + Staff
→ Ejecución del evento → Feedback
```

## Integración Wompi

- Checkout redirect con firma de integridad
- Webhook `POST /api/webhooks/wompi` para confirmación de pagos
- Soporte: tarjeta crédito/débito, PSE, Nequi
- Configurable vía variables de entorno (sandbox/producción)

## Variables de Entorno

Ver `.env.example` para la lista completa. Principales:

- `DATABASE_URL` — Conexión PostgreSQL
- `JWT_SECRET` — Secreto para tokens JWT
- `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` — Llave pública Wompi
- `WOMPI_PRIVATE_KEY` — Llave privada Wompi

## Estructura del Proyecto

```
src/
├── app/                  # Next.js App Router (22 rutas)
│   ├── api/              # REST API (auth, menu, orders, webhooks)
│   ├── admin/            # Dashboard administrador
│   ├── cliente/          # Dashboard cliente
│   ├── chef/             # Dashboard cocina
│   ├── staff/            # Dashboard logística
│   ├── proveedor/        # Dashboard proveedor
│   ├── finanzas/         # Dashboard finanzas
│   ├── menu/             # Menú público con filtros
│   ├── orden/            # Checkout 3 pasos
│   ├── login/            # Autenticación
│   └── registro/         # Registro (individual + empresa B2B)
├── components/           # UI components (button, card, input, etc.)
├── lib/                  # Core utilities
│   ├── auth/             # JWT, passwords, permissions
│   ├── db/               # Prisma client
│   ├── validators/       # Zod schemas
│   └── wompi/            # Integración Wompi
├── stores/               # Zustand (auth, cart)
└── middleware.ts          # Route protection
```

## Deploy en Vercel

```bash
# Build de producción
npm run build

# O deploy directo
npx vercel
```

## Escalabilidad Futura (SaaS Multi-tenant)

- Tenant ID por tabla para multi-empresa
- Subdominios por cliente
- Planes de suscripción
- API keys para integraciones externas
- White-labeling
- Integración con IA para recomendaciones
