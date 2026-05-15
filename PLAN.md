# Ludoteca Chilena — Plan de Desarrollo Completo

> Última actualización: 14 mayo 2026
> Proyecto: ludotecachilena.cl — Archivo histórico digital de juegos de mesa chilenos
> Desarrollado por: Anatida.tech

---

## Estado actual del proyecto (checkpoint)

### ✅ Completado

#### Infraestructura
- [x] Next.js 14+ (App Router) + TypeScript + Tailwind CSS 4
- [x] Prisma 7.8 con `prisma.config.ts` y `@prisma/adapter-neon`
- [x] PostgreSQL en **Neon** (migración `init` aplicada — 640 líneas de schema)
- [x] Variables de entorno en `.env` (DATABASE_URL, R2, BGG, NextAuth)
- [x] Cloudflare R2 configurado (bucket `ludoteca-chilena`, creds en `.env`)

#### Base de datos — datos importados
- [x] **131 juegos** importados desde Excel
- [x] **54 editoriales** con status activa/inactiva
- [x] **164 personas** (autores, ilustradores) — 151 del Excel + 13 auto-creadas
- [x] **33 mecánicas** (25 base + 8 del Excel)
- [x] **22 categorías** (set base)
- [x] **123 portadas BGG** (de 131 juegos, 94% cobertura) — guardadas como `MediaAsset`
- [x] Relaciones `GamePerson` (autores e ilustradores), `GameMechanic` creadas

#### Frontend público
- [x] Sistema de diseño completo en `globals.css` (tokens CSS, animaciones, componentes)
- [x] Tipografías Fredoka + Inter via `next/font/google`
- [x] `Navbar` responsive con hamburguesa animada
- [x] `Footer` 4 columnas con CTA "Sugerir un juego"
- [x] `GameCard` con badges (año, estado), tags (mecánicas, categorías)
- [x] `StatCard` con count-up animado (IntersectionObserver)
- [x] **Portada** `/` — hero, stats, about, juegos destacados
- [x] **Catálogo** `/juegos` — grid interactivo con búsqueda en tiempo real
- [x] **Ficha de juego** `/juegos/[slug]` — breadcrumb, imagen, creadores, editorial
- [x] **Línea de tiempo** `/historia` — agrupación por año
- [x] Script BGG mejorado: Sincroniza año, autores, ilustradores y editoriales automáticamente.
- [x] Build exitoso (`npm run build ✅`)

### ⚠️ Nota importante sobre Prisma 7 + Neon

El cliente Prisma **requiere** el adapter de Neon. NO funciona con `Pool` directo:

```typescript
// ✅ CORRECTO — usar { connectionString } directamente
import { PrismaNeon } from '@prisma/adapter-neon'
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

// ❌ INCORRECTO — pasar Pool NO funciona en Prisma 7.8
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaNeon(pool) // Error: "No database host"
```

También: **eliminar `channel_binding=require`** de la DATABASE_URL. Es incompatible con `@neondatabase/serverless`.

---

## Estructura de archivos actual

```
ludoteca-chilena/
├── .env                             ← DATABASE_URL (Neon), R2, BGG_TOKEN, NextAuth
├── CLAUDE.md                        ← contexto del proyecto (leído por AI)
├── PLAN.md                          ← este archivo
├── FASE_1_TAREAS.md                 ← tareas detalladas (original del usuario)
├── package.json                     ← Next.js 16.2.6, React 19.2.4, Prisma 7.8
├── prisma/
│   ├── schema.prisma                ← 640 líneas — modelo completo
│   ├── prisma.config.ts             ← config Prisma 7 (datasource URL)
│   └── migrations/
│       └── 20260515002212_init/     ← migración aplicada en Neon ✅
├── scripts/
│   ├── import-excel.ts              ← versión ESM (tiene bug de dotenv, no usar)
│   └── import-excel-run.cjs         ← ✅ versión CJS funcional — ya ejecutado
├── excel/
│   └── Base de Datos JDM Chilenos.xlsx  ← fuente de datos original
├── src/
│   ├── app/
│   │   ├── globals.css              ← 200+ líneas design tokens + animaciones
│   │   ├── layout.tsx               ← RootLayout con fuentes + SEO metadata
│   │   └── (frontend)/
│   │       ├── layout.tsx           ← Navbar + Footer wrapper
│   │       ├── page.tsx             ← Homepage (hero, stats, about, featured)
│   │       └── juegos/
│   │           ├── page.tsx         ← Catálogo (grid, filtros, búsqueda)
│   │           └── [slug]/
│   │               └── page.tsx     ← Ficha individual del juego
│   ├── components/
│   │   ├── game/
│   │   │   └── GameCard.tsx         ← Card component con badges y tags
│   │   ├── layout/
│   │   │   ├── Navbar.tsx           ← Responsive con hamburguesa animada
│   │   │   └── Footer.tsx           ← 4 columnas, CTA, crédito Anatida.tech
│   │   └── ui/
│   │       └── StatCard.tsx         ← Counter animado con IntersectionObserver
│   └── lib/
│       ├── prisma.ts                ← Singleton con PrismaNeon adapter
│       ├── mock-data.ts             ← 8 juegos mock (ya NO se usa — reemplazar)
│       └── utils.ts                 ← cn(), slugify(), formatYear(), formatPlayers()
```

---

## Comandos esenciales

```bash
# Dev server (usa puerto 3001 si hay conflictos)
npm run dev -- -p 3001

# Build
npm run build

# Re-importar datos desde Excel (si es necesario)
node scripts/import-excel-run.cjs

# Prisma Studio (explorar datos)
npx prisma studio

# Regenerar cliente Prisma
npx prisma generate

# Nueva migración
npx prisma migrate dev --name nombre_migracion
```

---

## Pendientes inmediatos (Fase 1.5)

### 1. Conectar frontend a datos reales (reemplazar mock-data)

**Archivos a modificar:**

#### `src/app/(frontend)/page.tsx` (Homepage)
Actualmente importa de `@/lib/mock-data`. Cambiar a:
```typescript
import { prisma } from '@/lib/prisma'

// En el server component:
const [gameCount, publisherCount, personCount] = await Promise.all([
  prisma.game.count(),
  prisma.publisher.count(),
  prisma.person.count(),
])

const featuredGames = await prisma.game.findMany({
  take: 4,
  where: { content_status: 'published' },  // o 'draft' si aún no publicamos
  include: {
    publisher: true,
    mechanics: { include: { mechanic: true } },
    categories: { include: { category: true } },
    media: { where: { is_primary: true }, take: 1 },
  },
  orderBy: { year_published: 'desc' },
})
```

#### `src/app/(frontend)/juegos/page.tsx` (Catálogo)
```typescript
const games = await prisma.game.findMany({
  include: {
    publisher: true,
    mechanics: { include: { mechanic: true } },
    categories: { include: { category: true } },
    media: { where: { is_primary: true }, take: 1 },
  },
  orderBy: { title: 'asc' },
})

const mechanics = await prisma.mechanic.findMany({ orderBy: { name: 'asc' } })
const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
```

#### `src/app/(frontend)/juegos/[slug]/page.tsx` (Ficha)
```typescript
const game = await prisma.game.findUnique({
  where: { slug: params.slug },
  include: {
    publisher: true,
    distributor: true,
    mechanics: { include: { mechanic: true } },
    categories: { include: { category: true } },
    people: { include: { person: true } },
    media: true,
  },
})
if (!game) notFound()
```

#### `src/components/game/GameCard.tsx`
Actualizar la interfaz para usar los datos de Prisma. La imagen principal viene de:
```typescript
const coverImage = game.media.find(m => m.is_primary)?.url
// Las URLs de BGG son tipo: https://cf.geekdo-images.com/...
```

### 2. Actualizar CLAUDE.md

Cambiar estas secciones:
- **Panel admin**: Ya NO usamos Payload CMS — usamos admin custom con NextAuth + TipTap
- **Stack**: Reemplazar "Payload CMS v3" por "Admin custom"
- **Prisma**: Documentar que usa `@prisma/adapter-neon` con `{ connectionString }`
- **DB**: Ahora es Neon, no Railway
- **Fase 1**: Marcar como completada la importación

### 3. Publicar todos los juegos como "published"

Actualmente los 131 juegos están en `content_status: 'draft'`. Para que aparezcan en el frontend:
```sql
-- Ejecutar en Prisma Studio o script
UPDATE "Game" SET content_status = 'published';
```
O via script:
```bash
node -r dotenv/config -e "
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');
neonConfig.webSocketConstructor = ws;
(async () => {
  const { PrismaNeon } = await import('@prisma/adapter-neon');
  const { PrismaClient } = await import('@prisma/client');
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });
  const result = await prisma.game.updateMany({ data: { content_status: 'published' } });
  console.log('Updated:', result.count, 'games to published');
  await prisma.\$disconnect();
})().catch(console.error);
"
```

---

## Fase 2.5 — Completar Frontend Público (Actual)

Antes de pasar al Backoffice, debemos terminar todas las rutas públicas navegables:

### Páginas Pendientes

| Ruta | Estado | Descripción | Prioridad |
|------|--------|-------------|-----------|
| `/categorias` | ⏳ Pendiente | Listado de todas las categorías con conteo de juegos | Alta |
| `/categorias/[slug]` | ⏳ Pendiente | Grid de juegos filtrados por esa categoría | Alta |
| `/mecanicas` | ⏳ Pendiente | Listado de mecánicas con su respectivo conteo | Alta |
| `/mecanicas/[slug]` | ⏳ Pendiente | Grid de juegos filtrados por esa mecánica | Alta |
| `/investigacion` | ⏳ Pendiente | Página dedicada a explicar el proceso de investigación y fuentes | Media |
| `/acerca` | ⏳ Pendiente | Historia del proyecto Ludoteca Chilena, equipo, misión | Alta |
| `/sugerir` | ⏳ Pendiente | Formulario público (conectado a `GameSuggestion`) para sugerir juegos | Alta |

### Detalles de Implementación

1. **Catálogos de Categorías/Mecánicas**: Reutilizar el componente `GameCatalog` o el grid del catálogo principal para mantener consistencia visual.
2. **Formulario de Sugerencias (`/sugerir`)**: 
   - Crear un Server Action para recibir los datos.
   - Insertar en el modelo `GameSuggestion` con `is_reviewed: false`.
   - Incluir campos de título, año, autor, editorial, URL BGG y notas.
3. **Páginas Estáticas (`/acerca`, `/investigacion`)**: Diseñar con un layout de lectura agradable (tipo artículo o landing secundaria) usando la paleta de colores de la marca.

---

## Fase 3 — Panel de administración (Próximamente)

### Arquitectura decidida
- **NO usamos Payload CMS** (demasiado pesado para este proyecto)
- Admin custom dentro de Next.js: `src/app/(admin)/`
- Autenticación: NextAuth.js con credenciales (email/password)
- Editor rich text: TipTap (ya instalado: `@tiptap/react`, `@tiptap/starter-kit`)

### Estructura del admin

```
src/app/(admin)/
├── layout.tsx           ← Sidebar + auth check (middleware)
├── page.tsx             ← Dashboard con stats
├── juegos/
│   ├── page.tsx         ← Lista con búsqueda y paginación
│   ├── nuevo/page.tsx   ← Formulario de creación
│   └── [id]/page.tsx    ← Formulario de edición
├── editoriales/
│   ├── page.tsx
│   └── [id]/page.tsx
├── personas/
│   ├── page.tsx
│   └── [id]/page.tsx
├── mecanicas/page.tsx
├── categorias/page.tsx
├── timeline/
│   ├── page.tsx
│   └── [id]/page.tsx
├── sugerencias/page.tsx  ← Revisar sugerencias de usuarios
└── configuracion/page.tsx
```

### API Routes para CRUD

```
src/app/api/
├── auth/[...nextauth]/route.ts
├── games/
│   ├── route.ts          ← GET (list) + POST (create)
│   └── [id]/route.ts     ← GET + PUT + DELETE
├── publishers/route.ts
├── persons/route.ts
├── mechanics/route.ts
├── categories/route.ts
├── timeline/route.ts
├── upload/route.ts        ← Upload a R2
└── suggestions/
    └── [id]/route.ts      ← PATCH (approve/reject)
```

### Upload a R2

```typescript
// src/app/api/upload/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

// Dependencia necesaria: npm install @aws-sdk/client-s3
```

### Protección de rutas

```typescript
// src/middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: { signIn: '/login' },
})

export const config = {
  matcher: ['/admin/:path*', '/api/games/:path*', '/api/upload/:path*'],
}
```

---

## Fase 4 — Comunidad (futuro)

- Sistema de usuarios registrados
- Colecciones personales (tengo/quiero/jugué)
- Reseñas con rating 1-10
- Foros por juego
- Sugerencias de juegos (flujo: usuario sugiere → admin aprueba)
- Notificaciones internas

---

## Datos de referencia rápida

### Base de datos (Neon)
- **URL**: `ep-lucky-tooth-aqv1hjfe-pooler.c-8.us-east-1.aws.neon.tech`
- **DB**: `neondb`
- **Schema**: `public`
- **Tablas**: ~20 (todas creadas via migración `init`)

### Storage (R2)
- **Bucket**: `ludoteca-chilena`
- **URL pública**: `https://r2.hori.cl`
- **Creds**: en `.env`

### BGG API
- **Token**: en `.env` como `BGG_BEARER_TOKEN`
- **Endpoints usados**:
  - `GET /xmlapi2/search?query=NAME&type=boardgame` — buscar juego
  - `GET /xmlapi2/thing?id=ID` — obtener detalle e imagen
- **Rate limit**: 1 request/segundo (respetar con `await setTimeout`)
- **Auth**: `Authorization: Bearer TOKEN` header

### Portadas BGG — 8 juegos sin imagen
Los siguientes juegos NO encontraron portada en BGG (crear/subir manualmente):
1. El Asalto al Rey Marmota
2. Hegemonía: Sombras del poder
3. ILAN: Explorando la vida antartica
4. Memoria oculta
5. Mi Tierra: Nueva Era
6. RCG: Random Carg Generator
7. Thanki: la senda de los dioses
8. Trotamundos

---

## Dependencias instaladas (package.json)

| Paquete | Versión | Uso |
|---------|---------|-----|
| `next` | 16.2.6 | Framework |
| `react` / `react-dom` | 19.2.4 | UI |
| `prisma` / `@prisma/client` | 7.8.0 | ORM |
| `@prisma/adapter-neon` | 7.8.0 | Adapter Neon para Prisma 7 |
| `@neondatabase/serverless` | 1.1.0 | Driver serverless de Neon |
| `next-auth` | 4.24.14 | Autenticación |
| `@auth/prisma-adapter` | 2.11.2 | Adapter Prisma para NextAuth |
| `@tiptap/*` | 3.23.4 | Editor rich text (admin) |
| `clsx` + `tailwind-merge` | — | Utilidades CSS |
| `slugify` | 1.6.9 | Generador de slugs |
| `zod` | 4.4.3 | Validación de schemas |
| `xlsx` | 0.18.5 | Parser Excel (scripts) |
| `ws` | 8.20.1 | WebSocket para Neon |
| `dotenv` | 17.4.2 | Variables de entorno (scripts) |

### Dependencias por instalar (cuando se necesiten)

```bash
npm install @aws-sdk/client-s3    # Upload a R2
npm install bcryptjs               # Hash de passwords (admin)
npm install @types/bcryptjs -D     # Types para bcryptjs
```

---

## Notas técnicas importantes

### 1. Puerto de desarrollo
El dev server usa `localhost:3001` para evitar conflictos. Si hay problemas, cambiar en `package.json`:
```json
"dev": "next dev -p 3001"
```

### 2. Mock data vs datos reales
`src/lib/mock-data.ts` aún existe y se usa en las páginas actuales. El SIGUIENTE PASO es reemplazar las importaciones de mock-data por queries Prisma directas en cada page server component.

### 3. Prisma generate
Si se modifica `schema.prisma`, siempre correr:
```bash
npx prisma generate
npx prisma migrate dev --name descripcion
```

### 4. Script de importación
El script funcional es `scripts/import-excel-run.cjs` (CJS, no ESM). Es idempotente — usa `upsert` y `findUnique` para no duplicar datos si se ejecuta múltiples veces.

### 5. Imágenes de BGG
Las URLs de portada están guardadas en `MediaAsset.url` y apuntan a `cf.geekdo-images.com`. Son hotlinks directos a BGG. Para producción, considerar:
- Descargar y re-subir a R2 (para no depender de BGG)
- O configurar `next.config.ts` para permitir el dominio de imágenes

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cf.geekdo-images.com' },
      { protocol: 'https', hostname: 'r2.hori.cl' },
    ],
  },
}
```

---

*Plan mantenido por Antigravity AI — conversación ID: 98780166-2612-490a-9ba4-08d8f1b52985*
