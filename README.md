# Ludoteca Chilena

Plataforma web de **archivo histórico digital** dedicada a los juegos de mesa chilenos. Nace de una investigación académica con el objetivo de preservar, organizar y difundir el patrimonio lúdico nacional.

A diferencia de un catálogo, este es un **archivo relacional profundo**: cada juego, persona, editorial y mecánica están interconectados con trazabilidad académica, galería documental histórica y fuentes bibliográficas citables. La referencia de inspiración es [BoardGameGeek](https://boardgamegeek.com), orientada al contexto histórico y cultural chileno.

Sitio en producción: [ludotecachilena.cl](https://ludotecachilena.cl)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Base de datos | PostgreSQL (Neon serverless) |
| ORM | Prisma 7.8 + `@prisma/adapter-neon` |
| Autenticación | NextAuth.js |
| Editor rich text | TipTap |
| Almacenamiento de imágenes | Cloudflare R2 |
| Estilos | Tailwind CSS 4 |
| Despliegue | Vercel + Neon |

## Estructura del archivo

- **Juegos** — fichas estilo BGG con descripción, galería histórica, videos embebidos (YouTube/Vimeo/TikTok/Instagram), reglamentos PDF, ediciones y fuentes bibliográficas
- **Personas** — autores, diseñadores, artistas e ilustradores con sus roles por juego
- **Editoriales** — historia, fundación, estado, juegos publicados
- **Mecánicas y categorías** — lista cerrada administrada desde el panel
- **Línea de tiempo** — recorrido por décadas con hitos históricos intercalados
- **Fuentes** — trazabilidad académica de cada dato

131 juegos chilenos documentados, 164 personas, 54 editoriales.

## Comandos

```bash
# Instalar
npm install

# Desarrollo (con hot-reload, ~2-4 GB RAM, usa Turbopack)
npm run dev

# Build de producción
npm run build

# Servir build (sin Turbopack, ~100 MB RAM — recomendado para probar la app)
npm start
```

> ⚠️ Antes de levantar el dev server, matar cualquier instancia previa para evitar consumo acumulado de RAM:
> ```bash
> lsof -ti:3000 | xargs -r kill -9 2>/dev/null
> ```
> Detalles completos en `CLAUDE.md`.

### Base de datos

```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev

# Inspeccionar datos en GUI
npx prisma studio
```

## Configuración

Crear `.env` en la raíz con:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."

R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="ludoteca-chilena"
R2_PUBLIC_URL="https://..."

BGG_BEARER_TOKEN="..."   # para sincronizar metadata desde BoardGameGeek
```

## Documentación interna

- **`CLAUDE.md`** — contexto completo del proyecto, sistema de diseño, modelo de datos, convenciones de código y prioridades de desarrollo.
- **`prisma/schema.prisma`** — modelo de datos canónico.

## Estado del proyecto

| Fase | Estado |
|------|--------|
| Fundaciones (Next.js, Prisma, Neon, importación de datos, R2) | ✅ Completa |
| Sitio público (catálogo, fichas, historia, SEO) | 🚧 En curso |
| Panel de administración | ⏳ Pendiente |
| Comunidad (usuarios, reseñas, foros, colecciones) | ⏳ Pendiente |

## Créditos

Investigación y curatoría: equipo Ludoteca Chilena.
Desarrollo: [Anatida.tech](https://anatida.tech).
