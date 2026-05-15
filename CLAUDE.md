# Ludoteca Chilena — Contexto del Proyecto para Claude Code

> Este archivo es leído automáticamente por Claude Code al iniciar cada sesión.
> Contiene todo el contexto necesario para trabajar en el proyecto sin explicaciones adicionales.

---

## ¿Qué es este proyecto?

**Ludoteca Chilena** (`ludotecachilena.cl`) es una plataforma web de archivo histórico digital dedicada a los juegos de mesa chilenos. Nace de una investigación académica y tiene como objetivo preservar, organizar y difundir el patrimonio lúdico nacional.

No es solo un catálogo — es un **archivo relacional profundo** donde cada juego, persona, editorial y mecánica están interconectados, con trazabilidad académica y galería documental histórica. La referencia de inspiración es [BoardGameGeek](https://boardgamegeek.com), pero orientado al contexto histórico y cultural chileno.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16+ (App Router) |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL (Neon serverless) |
| ORM | Prisma 7.8 + `@prisma/adapter-neon` |
| Panel de admin | Admin custom (NextAuth + TipTap) |
| Autenticación | NextAuth.js |
| Almacenamiento de imágenes | Cloudflare R2 |
| Estilos | Tailwind CSS 4 |
| Despliegue | Vercel (frontend) + Neon (base de datos) |

---

## Sistema de diseño y colorimetría

> Paleta extraída del logo oficial en `http://ludotecachilena.cl/wp-content/uploads/2024/01/ludoteca-chilena-sticker.png`

### Colores primarios (del logo)

| Nombre | Hex | RGB | Uso |
|--------|-----|-----|-----|
| `blue-brand` | `#1e1ea5` | `rgb(30, 30, 165)` | Color principal — tipografía, botones primarios, nav |
| `red-brand` | `#d20000` | `rgb(210, 0, 0)` | Acento — estrellas, badges, hover states, links activos |
| `white` | `#ffffff` | `rgb(255, 255, 255)` | Fondos, texto sobre azul |

### Paleta extendida (derivada para UI)

| Nombre | Hex | Uso |
|--------|-----|-----|
| `blue-dark` | `#15158a` | Hover de botones primarios, sidebar activa |
| `blue-medium` | `#2d2db4` | Bordes, dividers, elementos secundarios |
| `blue-light` | `#6969c3` | Texto deshabilitado, placeholders |
| `blue-pale` | `#e8e8f8` | Fondos de cards, hover suave, backgrounds alternos |
| `red-dark` | `#a80000` | Hover del rojo, estados de error crítico |
| `red-light` | `#ff3333` | Notificaciones, badges count |
| `cream` | `#f5f5ff` | Background general de la página (blanco con tinte azul) |
| `gray-text` | `#444455` | Texto de cuerpo sobre fondo claro |
| `gray-muted` | `#8888aa` | Texto secundario, metadatos, años inciertos |

### Tokens CSS (`globals.css` o `tailwind.config.ts`)

```css
/* ============================================
   LUDOTECA CHILENA — Design Tokens
   Extraídos del logo oficial (mayo 2026)
   ============================================ */
:root {
  /* Colores de marca */
  --color-brand-blue:       #1e1ea5;
  --color-brand-blue-dark:  #15158a;
  --color-brand-blue-mid:   #2d2db4;
  --color-brand-blue-light: #6969c3;
  --color-brand-blue-pale:  #e8e8f8;

  --color-brand-red:        #d20000;
  --color-brand-red-dark:   #a80000;
  --color-brand-red-light:  #ff3333;

  /* Neutros */
  --color-white:            #ffffff;
  --color-cream:            #f5f5ff;
  --color-text:             #1e1e3a;
  --color-text-muted:       #8888aa;
  --color-text-secondary:   #444455;
  --color-border:           #d2d2f0;

  /* Semánticos */
  --color-primary:          var(--color-brand-blue);
  --color-primary-hover:    var(--color-brand-blue-dark);
  --color-accent:           var(--color-brand-red);
  --color-accent-hover:     var(--color-brand-red-dark);
  --color-bg:               var(--color-cream);
  --color-bg-card:          var(--color-white);
  --color-bg-nav:           var(--color-brand-blue);
}
```

```ts
// tailwind.config.ts — extend.colors
colors: {
  brand: {
    blue: {
      DEFAULT: '#1e1ea5',
      dark:    '#15158a',
      mid:     '#2d2db4',
      light:   '#6969c3',
      pale:    '#e8e8f8',
    },
    red: {
      DEFAULT: '#d20000',
      dark:    '#a80000',
      light:   '#ff3333',
    },
  },
  cream: '#f5f5ff',
}
```

### Tipografía recomendada

El logo usa una tipografía bold, redondeada y de alta legibilidad. La más cercana disponible en Google Fonts:

| Uso | Fuente | Peso |
|-----|--------|------|
| Títulos principales (H1, H2) | **Fredoka** | 600–700 |
| Subtítulos y navegación | **Inter** | 600 |
| Cuerpo de texto | **Inter** | 400 |
| Código / datos técnicos | **JetBrains Mono** | 400 |

```html
<!-- En layout.tsx o _document -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
```

### Guía de uso de colores por componente

| Componente | Background | Texto | Acento |
|------------|-----------|-------|--------|
| `<Navbar>` | `brand-blue` | `white` | `brand-red` (hover, activo) |
| `<Footer>` | `brand-blue-dark` | `white` | `brand-red-light` |
| `<GameCard>` | `white` | `text` | `brand-blue` (título), `brand-red` (badge) |
| `<Button primary>` | `brand-blue` | `white` | `brand-blue-dark` (hover) |
| `<Button secondary>` | `transparent` + borde `brand-blue` | `brand-blue` | `brand-blue-pale` (hover bg) |
| `<Badge status>` | `brand-red` | `white` | — |
| `<Tag mecánica>` | `brand-blue-pale` | `brand-blue` | — |
| `<Tag categoría>` | `#fff0f0` | `brand-red-dark` | — |
| Página `bg` | `cream` | — | — |
| `<HistoryTimeline>` | `brand-blue` (línea) | `text` | `brand-red` (hitos) |

---

## Estructura de carpetas esperada

```
ludoteca-chilena/
├── CLAUDE.md                    ← este archivo
├── schema.prisma                ← modelo de datos completo
├── .env.local                   ← variables de entorno (no commitear)
├── app/                         ← Next.js App Router
│   ├── (public)/                ← rutas públicas del sitio
│   │   ├── page.tsx             ← portada
│   │   ├── juegos/
│   │   │   ├── page.tsx         ← catálogo con filtros
│   │   │   └── [slug]/
│   │   │       └── page.tsx     ← ficha del juego
│   │   ├── personas/
│   │   │   └── [slug]/
│   │   │       └── page.tsx     ← ficha de persona
│   │   ├── editoriales/
│   │   │   └── [slug]/
│   │   │       └── page.tsx     ← ficha de editorial
│   │   ├── mecanicas/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── categorias/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── anio/
│   │   │   └── [year]/
│   │   │       └── page.tsx
│   │   └── historia/
│   │       └── page.tsx         ← línea de tiempo histórica
│   ├── (auth)/                  ← rutas de autenticación
│   ├── api/                     ← API routes
│   │   └── import/
│   │       └── route.ts         ← importación masiva CSV/JSON
│   └── layout.tsx
├── components/                  ← componentes React reutilizables
│   ├── game/
│   ├── person/
│   ├── publisher/
│   ├── filters/
│   └── ui/
├── lib/
│   ├── prisma.ts                ← cliente Prisma singleton
│   ├── auth.ts                  ← configuración NextAuth
│   └── utils.ts
├── payload.config.ts            ← configuración Payload CMS
└── prisma/
    ├── schema.prisma
    ├── migrations/
    └── seed/
        ├── mechanics.ts         ← seed de mecánicas iniciales
        └── categories.ts        ← seed de categorías iniciales
```

---

## Modelo de datos — resumen de entidades

El schema completo está en `schema.prisma`. Las entidades principales son:

### Entidades de contenido
- **Game** — juego de mesa. Campo clave: `status` (available / out_of_print / lost / unknown), `year_certainty` (exact / circa / decade / unknown), `is_self_published`, `origin_type` (original / localization / adaptation)
- **Person** — autor, diseñador, ilustrador, etc. Un mismo registro puede tener múltiples roles en distintos juegos
- **Publisher** — editorial. Tiene `status` (active / inactive / unknown), `founded_year`, `closed_year`
- **GameEdition** — ediciones de un mismo juego a lo largo del tiempo
- **Mechanic** — mecánica de juego (lista cerrada, administrada por admin)
- **Category** — categoría temática (lista cerrada, separada de mecánicas)

### Entidades documentales (lo que diferencia esto de BGG)
- **MediaAsset** — imágenes históricas con `circa_year` y `copyright_notes`
- **Source** — fuentes bibliográficas citables
- **EntitySource** — pivot polimórfico: conecta fuentes con juegos/personas/editoriales
- **TimelineEvent** — hitos históricos para la página `/historia`

### Entidades de comunidad
- **User** — usuarios registrados
- **Review** — reseñas con rating 1-10
- **CollectionItem** — colecciones personales (tengo / quiero / jugué / tuve)
- **ForumThread / ForumPost** — foros por juego
- **Notification** — notificaciones internas (sin email, solo badge en UI)
- **GameSuggestion** — usuarios sugieren juegos faltantes → admin aprueba

---

## URLs canónicas (SEO-first)

Cada entidad tiene su URL propia, indexable:

```
/juegos                    → catálogo con filtros
/juegos/[slug]             → ficha del juego
/personas/[slug]           → ficha de persona + todos sus juegos
/editoriales/[slug]        → ficha de editorial + su catálogo
/mecanicas/[slug]          → juegos con esa mecánica
/categorias/[slug]         → juegos de esa categoría
/anio/[year]               → juegos publicados ese año
/historia                  → línea de tiempo histórica navegable
/usuarios/[username]       → perfil público del usuario
```

Filtros combinados como query params: `/juegos?mecanica=deck-building&anio=2022&estado=disponible`

---

## Decisiones de diseño importantes

### Editorial vs Distribuidor
Un juego puede tener `publisher_id` (quien lo editó) y `distributor_id` (quien lo publicó/distribuyó). Ambos son FK a la misma tabla `Publisher`. En la UI:
- Si son iguales o el distribuidor es null → mostrar solo "Editorial"
- Si son distintos → mostrar "Editorial: X · Publicado por: Y"
- Si `is_self_published = true` → mostrar "(Autopublicado)"

### Años históricos
Usar siempre `year_certainty` junto con `year_published`. Para mostrar en UI:
- `exact` → mostrar el año directamente: "1987"
- `circa` → mostrar con tilde: "~1987"
- `decade` → mostrar el campo `year_display`: "años 80"
- `unknown` → mostrar "Año desconocido"

### Mecánicas vs Categorías
Son entidades completamente separadas. **Mecánica** = cómo se juega (Set Collection, Trading). **Categoría** = temática (Ancient, Economic, Familiar). Nunca mezclarlas en el mismo campo.

### Roles de personas
El enum `PersonRole` tiene 10 valores: `author | designer | artist | illustrator | developer | graphic_designer | sculptor | editor | writer | insert_designer`. Una persona puede tener múltiples roles en distintos juegos.

### Contenido histórico sensible
- `research_notes` en `Game` — visible solo en el panel admin, nunca en el sitio público
- `internal_notes` en `Publisher` — igual, solo admin
- `gender` en `Person` — dato de investigación interna, evaluar si mostrar públicamente
- `was_contacted` en `Publisher` — solo admin

---

## Panel de administración (Admin custom)

El admin es una aplicación custom dentro de Next.js en `src/app/(admin)/`. **No usamos Payload CMS** (fue descartado por ser demasiado pesado para este proyecto).

- **Autenticación**: NextAuth.js con credenciales (email/password) + middleware de protección
- **Editor rich text**: TipTap (`@tiptap/react` + `@tiptap/starter-kit`)
- **Upload**: Cloudflare R2 via `@aws-sdk/client-s3`

El admin debe permitir:
- CRUD completo de todas las entidades
- Editor TipTap para descripciones/biografías
- Upload de imágenes a R2
- Moderación de reseñas y sugerencias
- Gestión de la línea de tiempo histórica
- Dashboard con métricas básicas
- Estados de publicación: `draft | published | archived`

---

## Datos iniciales — el Excel de investigación

Los investigadores tienen un Excel (`Base_de_Datos_JDM_Chilenos.xlsx`) con:
- **131 juegos** reales (de 1.002 filas, el resto están vacías — filtrar por `Nombre is not null`)
- **149 personas** con nombre completo (982 filas, muchas solo con display_name)
- **54 editoriales**

### Problemas conocidos del Excel a resolver antes de importar:
1. Las **mecánicas están en texto libre** separado por comas sin normalizar — necesitan parser
2. **5 autores en juegos no existen en la hoja Personas**: Morgana Silva Soto, Feño Casals Caro, Nico Valdivia Hennig, Juan José Fernandez (sin acento), Seba Ramirez
3. **2 editoriales en juegos no están en el catálogo**: `(Propia)` → usar `is_self_published`, `VERDASTELO` → crear registro
4. La columna `Edad Recom` tiene formato "8+" — extraer solo el número
5. `Editorial` y `Publicado por` pueden ser distintos — ambos deben mapearse

### Orden de importación (respetar FKs):
1. Mecánicas y categorías (sin dependencias)
2. Editoriales
3. Personas
4. Juegos
5. Relaciones pivot (GamePerson, GameMechanic, GameCategory)

---

## Convenciones de código

- **TypeScript estricto** — no usar `any`
- **Server Components por defecto** — usar `"use client"` solo cuando sea necesario
- **Slugs** — autogenerados desde el título con `slugify`, con override manual posible
- **Paginación** — cursor-based para listas grandes
- **Imágenes** — siempre a través de `next/image` con Cloudflare R2 como source
- **Errores** — usar `error.tsx` y `not-found.tsx` en cada segmento de ruta
- **Loading** — usar `loading.tsx` con Suspense para SSR progresivo

---

## Variables de entorno necesarias

```env
# Base de datos
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

# Payload CMS
PAYLOAD_SECRET="..."

# Cloudflare R2
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="ludoteca-chilena"
R2_PUBLIC_URL="https://..."
```

---

## ⚠️ Levantar el dev server sin colgar el computador

Next.js 16 usa **Turbopack por defecto en `next dev`**, que consume 2-4 GB de RAM. Si quedan procesos huérfanos en el puerto 3000 o se levantan varias instancias en paralelo, el consumo se multiplica y puede colgar el sistema (ya pasó en este proyecto y en `b2b-Pudu-Juegos`).

**⚠️ PROHIBIDO:**
- Levantar `npm run dev` sin matar antes lo que esté corriendo en el puerto 3000
- Dejar varios `next dev` corriendo en paralelo sobre el mismo repo desde distintas terminales

**✅ FORMA CORRECTA:**

```bash
# Paso 0: SIEMPRE matar lo que esté en el puerto 3000 antes de levantar
lsof -ti:3000 | xargs -r kill -9 2>/dev/null

# Opción A — Solo quieres probar que funciona (RAM ~100 MB, sin Turbopack)
npm run build      # compila una vez
npm start          # sirve el build compilado

# Opción B — Necesitas hot-reload para editar código (RAM 2-4 GB)
npm run dev        # una sola instancia, cerrar con Ctrl+C al terminar
```

**📊 Comparativa de consumo:**

| Escenario | RAM |
|---|---|
| ❌ Varios `next dev` huérfanos en el mismo puerto | 6-12+ GB (crash) |
| ✅ `next start` con build existente | ~100 MB |
| ✅ `next dev` único | 2-4 GB |

**💡 Regla mnemotécnica:** ¿Editar código con hot-reload? → `npm run dev`. ¿Solo verificar que funciona? → `npm run build && npm start`.

---

## Comandos útiles

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Correr migraciones
npx prisma migrate dev --name init

# Abrir Prisma Studio
npx prisma studio

# Seed de datos iniciales
npx ts-node prisma/seed/mechanics.ts
npx ts-node prisma/seed/categories.ts

# Dev server
npm run dev

# Build
npm run build
```

---

## Prioridades de desarrollo

Las fases en orden:

### Fase 1 — Fundaciones ✅ COMPLETADA
- [x] Configurar Next.js + Prisma 7 + Neon
- [x] Correr migraciones del schema (640 líneas, 20+ tablas)
- [x] Seed de mecánicas (33) y categorías (22)
- [x] Script de importación desde Excel (`scripts/import-excel-run.cjs`)
- [x] Importar 131 juegos, 54 editoriales, 164 personas
- [x] Obtener 123 portadas desde API de BGG
- [x] Frontend: Homepage, Catálogo, Ficha de juego (con mock data)
- [x] Configurar Cloudflare R2 (bucket creado, creds en .env)
- [ ] Conectar frontend a datos reales (reemplazar mock-data por Prisma)
- [ ] Panel admin (CRUD + NextAuth)

### Fase 2 — Sitio público
- [ ] Página `/juegos` con filtros combinados
- [ ] Ficha `/juegos/[slug]` con galería y fuentes bibliográficas
- [ ] Fichas de persona, editorial, mecánica, categoría, año
- [ ] Página `/historia` con línea de tiempo
- [ ] SEO: metadata dinámica, sitemap, Open Graph

### Fase 3 — Comunidad
- [ ] Sistema de usuarios (NextAuth)
- [ ] Colecciones personales
- [ ] Reseñas y ratings
- [ ] Foros por juego
- [ ] Sistema de sugerencias

### Fase 4 — Calidad y lanzamiento
- [ ] Tests
- [ ] Optimización de rendimiento
- [ ] Accesibilidad
- [ ] Documentación de admin

---

*Última actualización: 14 mayo 2026 — Importación de datos completada, Prisma 7 + Neon configurado*
*Proyecto: Ludoteca Chilena — ludotecachilena.cl*
*Desarrollado por: Anatida.tech*

> **NOTA TÉCNICA CRÍTICA**: Prisma 7.8 usa `PrismaNeon({ connectionString })` NO `PrismaNeon(pool)`. Ver `src/lib/prisma.ts` y `PLAN.md` para detalles.
