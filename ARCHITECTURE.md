# Reina Verde - Arquitectura del Sistema

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (PWA)                            │
│  Next.js 15 + React 19 + Tailwind + shadcn/ui + Zustand        │
│  Service Workers + Offline Support + Push Notifications         │
├─────────────────────────────────────────────────────────────────┤
│                     API LAYER (Next.js API Routes)              │
│  REST API + Middleware (Auth, Rate Limiting, Validation)        │
├─────────────────────────────────────────────────────────────────┤
│                     BUSINESS LOGIC LAYER                        │
│  Services / Use Cases (Clean Architecture)                      │
├─────────────────────────────────────────────────────────────────┤
│                     DATA ACCESS LAYER                           │
│  Prisma ORM + PostgreSQL                                        │
├─────────────────────────────────────────────────────────────────┤
│                     EXTERNAL SERVICES                           │
│  Wompi (Pagos) │ Email │ Storage │ Analytics                    │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Estructura de Carpetas

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register)
│   ├── (public)/                 # Public pages (landing, menu)
│   ├── (dashboard)/              # Protected dashboard routes
│   │   ├── admin/                # Admin dashboard
│   │   ├── cliente/              # Client dashboard
│   │   ├── chef/                 # Kitchen/production dashboard
│   │   ├── staff/                # Staff/logistics dashboard
│   │   ├── proveedor/            # Supplier dashboard
│   │   └── finanzas/             # Finance dashboard
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── orders/               # Order management
│   │   ├── events/               # Event management
│   │   ├── menu/                 # Menu management
│   │   ├── production/           # Kitchen operations
│   │   ├── logistics/            # Delivery & staff
│   │   ├── finance/              # Billing & payments
│   │   ├── suppliers/            # Supplier management
│   │   ├── feedback/             # Reviews & ratings
│   │   └── webhooks/             # Wompi webhooks
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Shared UI components
│   ├── ui/                       # Base UI (shadcn)
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   └── modules/                  # Module-specific components
├── lib/                          # Core utilities
│   ├── auth/                     # Auth utilities
│   ├── db/                       # Database client
│   ├── services/                 # Business logic services
│   ├── validators/               # Zod schemas
│   ├── wompi/                    # Wompi integration
│   └── utils.ts                  # General utilities
├── stores/                       # Zustand stores
├── types/                        # TypeScript types
└── middleware.ts                  # Next.js middleware
```

## 🔐 Roles y Permisos

| Rol | Permisos |
|-----|----------|
| **CLIENTE** | Ver menú, crear pedidos, ver cotizaciones, pagar, ver historial, dejar feedback |
| **ADMIN** | Todo: CRUD completo, KPIs, gestión de usuarios, configuración |
| **CHEF** | Ver pedidos asignados, actualizar estado de producción, gestionar ingredientes |
| **STAFF** | Ver asignaciones, actualizar estado logístico, tracking |
| **PROVEEDOR** | Ver pedidos de insumos, actualizar disponibilidad, gestionar catálogo |
| **FINANZAS** | Ver facturación, reportes financieros, gestión de pagos |

## 🔄 Flujo de Estados - Pedido

```
DRAFT → QUOTED → PAYMENT_PENDING → PAID → IN_PRODUCTION → 
READY → IN_TRANSIT → DELIVERED → COMPLETED → REVIEWED
                                          ↓
                                      CANCELLED (desde cualquier estado pre-delivery)
```

## 🔄 Flujo de Estados - Evento

```
PLANNING → CONFIRMED → IN_PREPARATION → READY → IN_PROGRESS → 
COMPLETED → ARCHIVED
```

## 💳 Integración Wompi

1. Cliente confirma pedido → Frontend solicita link de pago
2. API crea transacción en Wompi → Retorna URL de pago
3. Cliente paga en widget Wompi
4. Wompi envía webhook → API actualiza estado
5. Sistema activa workflow de producción

## 🚀 Escalabilidad Futura (Multi-tenant SaaS)

- Tenant ID en cada tabla
- Subdominios por empresa
- Planes de suscripción
- API keys para integraciones
- White-labeling
