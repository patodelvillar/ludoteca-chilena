# Ludoteca Chilena — Plan de Desarrollo

> Última actualización: 15 mayo 2026
> Proyecto: ludotecachilena.cl — Archivo histórico digital de juegos de mesa chilenos
> Desarrollado por: Anatida.tech

---

## Estado actual

### ✅ Fase 1 — Fundaciones

**Infraestructura**
- [x] Next.js 16.2.6 (App Router) + TypeScript + Tailwind CSS 4
- [x] Prisma 7.8 con `@prisma/adapter-neon` (`{ connectionString }`, no `Pool`)
- [x] PostgreSQL en **Neon** serverless
- [x] Cloudflare R2 configurado (bucket `ludoteca-chilena`)
- [x] Variables de entorno: DATABASE_URL, R2_*, BGG_BEARER_TOKEN, NEXTAUTH_*
- [x] Deploy en Vercel conectado a `origin/main`

**Datos importados**
- [x] **131 juegos**, **54 editoriales**, **164 personas**, **33 mecánicas**, **22 categorías**
- [x] **123 portadas BGG** + 1 manual (ILAN) — 94% cobertura inicial, ahora con flujo manual para los faltantes
- [x] Relaciones `GamePerson`, `GameMechanic`, `GameCategory` completas
- [x] **Barrido masivo BGG (15 may 2026)** con `?stats=1` — rellenado:
  - 95% description (de 14% a 95%)
  - 92% min/max_playtime (de 12% a 92%)
  - 92% avg_rating (de 0% a 92%)
  - 66% bgg_weight (de 49% a 66%)

### ✅ Fase 2 — Sitio público

**Páginas listas**
- [x] `/` — Hero, stats animados, **juegos destacados aleatorios por request** (`force-dynamic` + `ORDER BY RANDOM()`), about, CTA
- [x] `/juegos` — Catálogo con búsqueda en tiempo real
- [x] `/juegos/[slug]` — **Ficha estilo BGG** completa:
  - Header: imagen ratio natural, meta row (origen/financiamiento/premios), título con año, stats bar (jugadores/tiempo/edad/peso), credits list (diseñador/artista/editorial/distribuidor/BGG)
  - Tabs: **Descripción · Galería · Videos · Archivos · Ediciones · Fuentes**
  - **Botón compartir** en esquina superior (copiar enlace, Facebook, X, Instagram, Reddit)
- [x] `/historia` — **Rewrite narrativo**: agrupación por década con contexto, hitos `TimelineEvent` intercalados, respeto de `year_certainty`, nav sticky
- [x] `/categorias` + `/categorias/[slug]`
- [x] `/mecanicas` + `/mecanicas/[slug]`
- [x] `/editoriales` + `/editoriales/[slug]`
- [x] `/personas` + `/personas/[slug]`
- [x] `/acerca` — Historia y misión del proyecto
- [x] `/investigacion` — Proceso académico y fuentes
- [x] `/sugerir` — Formulario público de sugerencias

**Componentes/infraestructura**
- [x] Sistema de diseño en `globals.css` (tokens CSS, animaciones)
- [x] Tipografías Fredoka + Inter via `next/font/google`
- [x] `Navbar` responsive con hamburguesa
- [x] `Footer` 4 columnas
- [x] `GameCard`, `GameCatalog`, `StatCard`, `GameTabs`, `ShareButton`
- [x] Helpers compartidos: `formatYear` (respeta `year_certainty`), `decadeContext`, `parseVideoUrl` (YouTube/Vimeo/TikTok/Instagram)
- [x] Modelos nuevos: `GameVideo` + enum `VideoPlatform`
- [x] Migración `20260515045901_add_game_videos`

---

## 🚧 Próximo: Fase 3 — Panel de administración

**Arquitectura decidida**
- Admin custom dentro de Next.js en `src/app/(admin)/` (NO Payload CMS)
- Autenticación: NextAuth.js con credenciales (email/password) + middleware
- Editor rich text: TipTap (ya instalado)
- Upload de imágenes: `@aws-sdk/client-s3` → R2 (ya instalado)

**Estructura propuesta**

```
src/app/(admin)/
├── layout.tsx           ← Sidebar + auth guard
├── page.tsx             ← Dashboard con métricas
├── juegos/
│   ├── page.tsx         ← Lista con búsqueda
│   ├── nuevo/page.tsx
│   └── [id]/page.tsx    ← Edición + uploads
├── editoriales/
├── personas/
├── mecanicas/
├── categorias/
├── timeline/            ← CRUD TimelineEvent (clave para enriquecer /historia)
├── sugerencias/         ← Aprobar/rechazar GameSuggestion
└── configuracion/
```

**API Routes**

```
src/app/api/
├── auth/[...nextauth]/
├── games/[id]/
├── publishers/[id]/
├── persons/[id]/
├── mechanics/[id]/
├── categories/[id]/
├── timeline/[id]/
├── upload/              ← Subida a R2
└── suggestions/[id]/
```

**Tareas concretas**
- [x] Crear modelo `User` con `role` (admin/editor) y hash de password
- [x] Setup NextAuth con `CredentialsProvider`
- [x] Middleware/proxy de protección en `/admin/*` y APIs sensibles
- [x] Layout admin con sidebar (mecánicas, categorías, juegos, editoriales, personas, timeline, sugerencias)
- [ ] **Siguiente prioridad: moderación real de sugerencias**
  - [x] Botones aprobar / rechazar / marcar revisada
  - [x] Guardar `reviewer_notes`
  - [x] Al aprobar, crear `Game` en borrador desde la sugerencia
- [x] **Luego: CRUD TimelineEvent** para crear/editar/publicar hitos históricos
- [x] **Después: CRUD mínimo de juegos** (campos principales, estado editorial, descripción)
- [x] **Finalmente: Upload a R2** integrado al CRUD de juegos/personas/editoriales
- [x] CRUD mínimo de Juegos con formulario de campos principales
- [x] Upload de portada de juego a R2 con preview
- [x] Upload de imágenes a galería de juegos en R2 (`MediaAsset` no primario: tablero, piezas, cartas, reglamento, publicidad, otro)
- [x] Upload de foto principal para Personas y logo principal para Editoriales en R2
- [x] CRUD Juegos avanzado con relaciones + TipTap para descripción (mecánicas/categorías/personas con rol)
- [x] CRUD mínimo Editoriales y Personas (crear/editar/publicar/archivar; sin borrado físico para proteger relaciones)
- [x] **CRUD TimelineEvent** (urgente: la página `/historia` está lista para mostrar hitos pero la BD aún no tiene ninguno)
- [x] CRUD GameVideo (pegar URL → `parseVideoUrl()` → guardar registro; borrar videos desde el editor del juego)
- [x] Pantalla inicial de moderación de sugerencias (listado; aprobar/rechazar queda pendiente)

**Dependencias por instalar**
```bash
npm install bcryptjs
npm install -D @types/bcryptjs
# @aws-sdk/client-s3 ya está instalado
```

---

## 📋 Fase 4 — Comunidad (futuro)

- [ ] Sistema de usuarios registrados (NextAuth con OAuth + email)
- [ ] Colecciones personales (`CollectionItem`: tengo/quiero/jugué/tuve)
- [ ] Reseñas (`Review` con rating 1-10)
- [ ] Foros por juego (`ForumThread` + `ForumPost`)
- [ ] Notificaciones internas (`Notification`)

---

## 📋 Fase 5 — Calidad y lanzamiento

- [ ] Tests (Vitest + Playwright)
- [ ] Optimización: `next/image` con remotePatterns para R2
- [ ] Sitemap dinámico y `robots.txt`
- [ ] Structured data (schema.org) en fichas
- [ ] Accesibilidad (audit ARIA, contraste)
- [ ] Documentación del admin para investigadores
- [ ] Retirar dependencia `xlsx` antes del cierre del desarrollo si la importación Excel ya no forma parte del código activo. El archivo Excel bruto está fuera del repo; esta tarea apunta al paquete npm, que hoy aparece en `npm audit` con vulnerabilidades sin fix disponible.
- [ ] Endurecer `/sugerir` para producción con **Cloudflare Turnstile** + rate limit persistente en **Neon/Postgres**. No usar Vercel KV: el producto fue descontinuado.

---

## Tareas residuales del frontend

Cosas pequeñas que aún se pueden afinar (no bloquean Fase 3):

- [ ] **Refinar `decadeContext.ts`**: los textos por década son placeholders generales. Los investigadores deberían sustituirlos por contexto verificado, o se podrían migrar a la BD para editar desde admin.
- [ ] **6 juegos sin BGG match** (ingresar manualmente desde admin cuando exista):
  - El Asalto al Rey Marmota, Hegemonía: Sombras del poder, Mi Tierra: Nueva Era, RCG: Random Carg Generator, Thanki: la senda de los dioses, Trotamundos
- [ ] **Migrar covers BGG a R2 para los nuevos**: el barrido refill no descarga imagen, solo metadatos. `link-bgg-game.ts` sí descarga cover. Re-correr para juegos faltantes.
- [ ] **Mostrar `avg_rating` en la UI**: el campo ya está en BD para 120 juegos pero no se muestra. Decidir cómo (hexágono BGG-style, badge, etc.) o dejarlo solo como dato interno.
- [ ] **Schema.org structured data** en las fichas para SEO (`schema.org/Game`, `schema.org/Person`).

---

## Scripts disponibles (`scripts/` — gitignored)

> Nota: los scripts y archivos Excel de importación son herramientas locales y no van al repo. Al terminar el desarrollo, revisar si `xlsx` sigue siendo necesario como dependencia npm; si no, removerlo del proyecto.

| Script | Uso |
|--------|-----|
| `import-excel-run.cjs` | Importación original desde Excel (idempotente) |
| `sync-bgg-data.ts` | Versión legacy del sync BGG (deprecada) |
| `refill-bgg-data.ts` | **Barrido masivo BGG**: rellena solo NULLs (description, playtime, weight, rating) usando `?stats=1` |
| `link-bgg-game.ts` | Vincula manualmente un juego a un BGG ID + descarga cover a R2 + agrega alt title. Útil cuando el título en BD ≠ título en BGG. Uso: `npx tsx --env-file=.env scripts/link-bgg-game.ts <slug> <bgg-id> "Alt Title"` |
| `analyze-bgg-gaps.ts` | Diagnóstico de coverage por campo |
| `upload-bgg-to-r2.cjs` | Migración de URLs `geekdo-images.com` → R2 |
| `fix-publishers.ts` | Limpieza de editoriales |

---

## Comandos esenciales

```bash
# Levantar dev (¡siempre matar puerto antes!)
lsof -ti:3000 | xargs -r kill -9 2>/dev/null
npm run dev                          # con Turbopack, 2-4 GB RAM

# Build de producción + servir (~100 MB RAM, sin Turbopack)
npm run build
npm start

# Prisma
npx prisma generate                  # regenerar cliente tras editar schema
npx prisma migrate dev --name X      # nueva migración
npx prisma studio                    # GUI de datos

# Scripts BGG
npx tsx --env-file=.env scripts/analyze-bgg-gaps.ts
npx tsx --env-file=.env scripts/refill-bgg-data.ts
npx tsx --env-file=.env scripts/link-bgg-game.ts <slug> <bgg-id> "Alt Title"
```

⚠️ **Regla anti-crash**: nunca levantar `npm run dev` sin matar el puerto 3000 primero (Turbopack acumula 2-4 GB/instancia). Para solo probar, usar `npm run build && npm start`. Documentado en `CLAUDE.md`.

---

## Notas técnicas críticas

### Prisma 7 + Neon
```typescript
// ✅ CORRECTO
import { PrismaNeon } from '@prisma/adapter-neon'
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as never)

// ❌ INCORRECTO — pasar Pool no funciona en Prisma 7.8
const pool = new Pool({ connectionString: ... })
const adapter = new PrismaNeon(pool)
```

Eliminar `channel_binding=require` del DATABASE_URL — incompatible con `@neondatabase/serverless`.

### BGG API
- **Token requerido** (`BGG_BEARER_TOKEN`) — desde mayo 2026 la API devuelve **401 sin auth**
- **Rate limit**: 1500ms entre requests (~0.66 reqs/s)
- Endpoints: `/xmlapi2/search?query=X&type=boardgame` y `/xmlapi2/thing?id=X&stats=1` (el `stats=1` es necesario para weight y rating)
- Auth header: `Authorization: Bearer TOKEN`

### Vercel deploy
- Conectado a `github.com/patodelvillar/ludoteca-chilena` en branch `main`
- Push a `main` → build automático
- Variables de entorno deben estar replicadas en Vercel (DATABASE_URL, R2_*, BGG_BEARER_TOKEN)

### Estructura de carpetas

```
ludoteca-chilena/
├── CLAUDE.md                        ← contexto del proyecto para AI
├── PLAN.md                          ← este archivo
├── README.md                        ← descripción pública del proyecto
├── prisma/
│   ├── schema.prisma                ← modelo de datos (+GameVideo + VideoPlatform)
│   └── migrations/
│       ├── 20260515002212_init/
│       └── 20260515045901_add_game_videos/
├── scripts/                         ← gitignored
└── src/
    ├── app/
    │   ├── globals.css              ← tokens y animaciones
    │   ├── layout.tsx
    │   └── (frontend)/
    │       ├── layout.tsx           ← Navbar + Footer
    │       ├── page.tsx             ← Home (dynamic, random featured)
    │       ├── juegos/
    │       │   ├── page.tsx
    │       │   └── [slug]/page.tsx  ← Ficha BGG-style + Tabs + Share
    │       ├── historia/page.tsx    ← Por década + TimelineEvent
    │       ├── categorias/
    │       ├── mecanicas/
    │       ├── editoriales/
    │       ├── personas/
    │       ├── acerca/
    │       ├── investigacion/
    │       └── sugerir/
    ├── components/
    │   ├── game/
    │   │   ├── GameCard.tsx
    │   │   ├── GameCatalog.tsx
    │   │   ├── GameTabs.tsx         ← 6 tabs client-side
    │   │   └── ShareButton.tsx      ← Popover de redes
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   └── Footer.tsx
    │   ├── ui/
    │   │   └── StatCard.tsx
    │   ├── person/
    │   └── publisher/
    └── lib/
        ├── prisma.ts                ← Singleton + Neon adapter
        ├── year.ts                  ← formatYear() respetando certainty
        ├── decadeContext.ts         ← narrativa por década
        ├── video.ts                 ← parseVideoUrl + buildEmbedUrl
        └── utils.ts
```

---

## Referencias

| Recurso | Ubicación |
|---------|-----------|
| Base de datos | Neon (`ep-lucky-tooth-aqv1hjfe-pooler.c-8.us-east-1.aws.neon.tech`) |
| Storage de imágenes | R2 bucket `ludoteca-chilena`, URL pública `pub-956cede54b444e1c8c8ded564f2dd959.r2.dev` |
| Repo | github.com/patodelvillar/ludoteca-chilena |
| Sitio | ludotecachilena.cl |
| Contexto AI | `CLAUDE.md` |

---

*Mantenido por Anatida.tech*
