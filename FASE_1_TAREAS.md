# Fase 1 — Tareas de implementación

> Instrucciones detalladas para Claude Code.
> Ejecutar en orden. Cada tarea es autónoma y verificable.

---

## TAREA 1 — Inicializar el proyecto

```bash
npx create-next-app@latest ludoteca-chilena \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd ludoteca-chilena
```

Instalar dependencias:

```bash
npm install prisma @prisma/client
npm install next-auth @auth/prisma-adapter
npm install payload @payloadcms/next @payloadcms/db-postgres @payloadcms/richtext-lexical
npm install slugify
npm install -D @types/node
```

---

## TAREA 2 — Configurar Prisma

Copiar el archivo `schema.prisma` a `prisma/schema.prisma`.

Crear el cliente singleton en `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

Correr migración inicial:

```bash
npx prisma migrate dev --name init
```

---

## TAREA 3 — Seed de mecánicas

Crear `prisma/seed/mechanics.ts` con estas mecánicas base (normalizar el Excel luego):

```typescript
import { prisma } from '../../lib/prisma'
import slugify from 'slugify'

const mechanics = [
  'Area Control',
  'Auction / Bidding',
  'Bluffing',
  'Card Drafting',
  'Cooperative',
  'Deck Building',
  'Deduction',
  'Dice Rolling',
  'Hand Management',
  'Hidden Roles',
  'Memory',
  'Negotiation',
  'Pattern Recognition',
  'Player Elimination',
  'Push Your Luck',
  'Real-Time',
  'Resource Management',
  'Route Building',
  'Set Collection',
  'Simultaneous Action Selection',
  'Social Deduction',
  'Take That',
  'Trading',
  'Trick Taking',
  'Worker Placement',
]

async function main() {
  for (const name of mechanics) {
    const slug = slugify(name, { lower: true, strict: true })
    await prisma.mechanic.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
  }
  console.log(`✅ ${mechanics.length} mecánicas creadas`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## TAREA 4 — Seed de categorías

Crear `prisma/seed/categories.ts`:

```typescript
import { prisma } from '../../lib/prisma'
import slugify from 'slugify'

const categories = [
  'Abstracto',
  'Aventura',
  'Ciencia Ficción',
  'Deporte',
  'Educativo',
  'Económico',
  'Familiar',
  'Fantasy',
  'Histórico',
  'Horror',
  'Humor',
  'Infantil',
  'Misterio',
  'Naturaleza',
  'Negociación',
  'Party Game',
  'Político',
  'Puzzle',
  'Rol',
  'Temático',
  'Terror',
  'Trivia',
]

async function main() {
  for (const name of categories) {
    const slug = slugify(name, { lower: true, strict: true })
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    })
  }
  console.log(`✅ ${categories.length} categorías creadas`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## TAREA 5 — Script de importación desde Excel

Crear `scripts/import-excel.ts`. Este script debe:

1. Leer el archivo `Base_de_Datos_JDM_Chilenos.xlsx`
2. Procesar cada hoja en el orden correcto
3. Manejar todos los problemas conocidos del Excel

```typescript
import * as XLSX from 'xlsx'
import { prisma } from '../lib/prisma'
import slugify from 'slugify'

const FILE_PATH = './data/Base_de_Datos_JDM_Chilenos.xlsx'

// Helper: generar slug único
async function uniqueSlug(base: string, model: 'game' | 'person' | 'publisher') {
  let slug = slugify(base, { lower: true, strict: true })
  let suffix = 0
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`
    const exists = await (prisma[model] as any).findUnique({ where: { slug: candidate } })
    if (!exists) return candidate
    suffix++
  }
}

// Helper: limpiar edad "8+" → 8
function parseAge(value: string | undefined): number | null {
  if (!value) return null
  return parseInt(value.toString().replace(/\D/g, '')) || null
}

// Helper: parsear mecánicas desde texto libre
function parseMechanics(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split(',').map(m => m.trim().toLowerCase()).filter(Boolean)
}

async function importPublishers(sheet: any[][]) {
  // Saltar fila 0 (headers reales) e importar desde fila 1
  const rows = sheet.slice(1)
  let count = 0
  for (const row of rows) {
    const name = row[0]?.toString().trim()
    if (!name) continue

    const slug = await uniqueSlug(name, 'publisher')
    const closedYear = row[4] ? parseInt(row[4]) : null
    const status = row[7]?.toString().toLowerCase().includes('inactiva') ? 'inactive'
      : row[7]?.toString().toLowerCase().includes('vigente') ? 'active'
      : 'unknown'

    await prisma.publisher.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        name,
        nickname: row[9]?.toString().trim() || null,
        country: row[1]?.toString().trim() || null,
        founded_year: row[2] ? parseInt(row[2]) : null,
        website: row[3]?.toString().trim() || null,
        closed_year: closedYear,
        former_name: row[5]?.toString().trim() || null,
        status: status as any,
        content_status: 'published',
      },
    })
    count++
  }
  console.log(`✅ ${count} editoriales importadas`)
}

async function importPersons(sheet: any[][]) {
  // Filtrar solo filas con datos reales
  const rows = sheet.filter(row => row[3]) // Nombre para mostrar
  let count = 0
  for (const row of rows) {
    const displayName = row[3]?.toString().trim()
    if (!displayName || displayName === 'Nombre para mostrar') continue

    const slug = await uniqueSlug(displayName, 'person')

    await prisma.person.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        first_name: row[0]?.toString().trim() || null,
        nickname: row[1]?.toString().trim() || null,
        last_name: row[2]?.toString().trim() || null,
        display_name: displayName,
        nationality: row[4]?.toString().trim() || null,
        gender: row[5]?.toString().trim() || null,
        field_of_study: row[6]?.toString().trim() || null,
        content_status: 'published',
      },
    })
    count++
  }
  console.log(`✅ ${count} personas importadas`)
}

async function importGames(sheet: any[][]) {
  // Filtrar filas vacías
  const rows = sheet.filter(row => row[0]?.toString().trim())
  let count = 0
  let skipped = 0

  for (const row of rows) {
    const title = row[0]?.toString().trim()
    if (!title || title === 'Nombre') continue

    const slug = await uniqueSlug(title, 'game')

    // Resolver editorial vs publicado por
    const publisherName = row[1]?.toString().trim()
    const distributorName = row[2]?.toString().trim()
    const isSelfPublished = publisherName === '(Propia)' || !publisherName

    let publisherId: string | null = null
    let distributorId: string | null = null

    if (!isSelfPublished && publisherName) {
      const pub = await prisma.publisher.findFirst({ where: { name: { contains: publisherName } } })
      publisherId = pub?.id || null
      if (!publisherId) console.warn(`⚠️  Editorial no encontrada: "${publisherName}" (juego: ${title})`)
    }

    if (distributorName && distributorName !== publisherName && !isSelfPublished) {
      const dist = await prisma.publisher.findFirst({ where: { name: { contains: distributorName } } })
      distributorId = dist?.id || null
    }

    // Año
    const yearRaw = row[4] ? parseInt(row[4]) : null

    await prisma.game.create({
      data: {
        slug,
        title,
        year_published: yearRaw,
        year_certainty: yearRaw ? 'exact' : 'unknown',
        is_self_published: isSelfPublished,
        publisher_id: publisherId,
        distributor_id: distributorId,
        min_players: row[16] ? parseInt(row[16]) : null,
        max_players: row[17] ? parseInt(row[17]) : null,
        min_age: parseAge(row[18]?.toString()),
        original_language: row[21]?.toString().trim() || null,
        origin_country: row[24]?.toString().trim() || null,
        origin_type: row[25]?.toString().toLowerCase().includes('original') ? 'original'
          : row[25]?.toString().toLowerCase().includes('local') ? 'localization'
          : row[25]?.toString().toLowerCase().includes('adapt') ? 'adaptation'
          : null,
        bgg_url: row[26]?.toString().trim() || null,
        bgg_weight: row[20] && !isNaN(parseFloat(row[20])) ? parseFloat(row[20]) : null,
        funding_source: row[29]?.toString().trim() || null,
        awards: row[30]?.toString().trim() || null,
        status: 'unknown',
        content_status: 'draft', // Revisar antes de publicar
      },
    })

    // Importar autores e ilustradores
    const authorCols = [8, 9, 10, 11]   // Autor/a 1-4
    const illustratorCols = [12, 13, 14, 15] // Ilustrador/a 1-4

    for (const col of authorCols) {
      const name = row[col]?.toString().trim()
      if (!name) continue
      const person = await prisma.person.findFirst({
        where: { display_name: { equals: name, mode: 'insensitive' } }
      })
      if (person) {
        await prisma.gamePerson.upsert({
          where: { game_id_person_id_role: { game_id: slug, person_id: person.id, role: 'author' } },
          update: {},
          create: { game_id: slug, person_id: person.id, role: 'author' },
        }).catch(() => {}) // Ignorar duplicados
      } else {
        console.warn(`⚠️  Autor no encontrado: "${name}" (juego: ${title})`)
      }
    }

    // TODO: importar ilustradores y mecánicas de forma similar

    count++
  }
  console.log(`✅ ${count} juegos importados, ${skipped} omitidos`)
}

async function main() {
  const workbook = XLSX.readFile(FILE_PATH)

  console.log('📥 Importando editoriales...')
  const publishersSheet = XLSX.utils.sheet_to_json(
    workbook.Sheets['EditorialesPublishers'], { header: 1 }
  ) as any[][]
  await importPublishers(publishersSheet)

  console.log('📥 Importando personas...')
  const personsSheet = XLSX.utils.sheet_to_json(
    workbook.Sheets['Personas'], { header: 1 }
  ) as any[][]
  await importPersons(personsSheet)

  console.log('📥 Importando juegos...')
  const gamesSheet = XLSX.utils.sheet_to_json(
    workbook.Sheets['Juegos de mesa'], { header: 1 }
  ) as any[][]
  await importGames(gamesSheet)

  console.log('✅ Importación completa')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Instalar xlsx:
```bash
npm install xlsx
```

Ejecutar:
```bash
mkdir -p data
cp /ruta/al/Base_de_Datos_JDM_Chilenos.xlsx ./data/
npx ts-node scripts/import-excel.ts
```

---

## TAREA 6 — Configurar Payload CMS v3

Crear `payload.config.ts` en la raíz:

```typescript
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { nextPayload } from '@payloadcms/next'
import path from 'path'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  editor: lexicalEditor({}),
  collections: [
    // Definir colecciones de Payload que mapean a las tablas Prisma
    // Ver: https://payloadcms.com/docs/configuration/collections
  ],
  admin: {
    user: 'users', // Colección de usuarios admin
  },
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
})
```

---

## TAREA 7 — Primera página pública: catálogo de juegos

Crear `app/(public)/juegos/page.tsx` con:
- Server Component que consulta Prisma directamente
- Filtros por: mecánica, categoría, año, estado, origen
- Paginación cursor-based
- Generación estática con `generateStaticParams` para las primeras páginas
- Metadata SEO dinámica

---

## Verificación de Fase 1 completada

- [ ] `npx prisma studio` muestra todas las tablas
- [ ] Seed ejecutado sin errores
- [ ] Al menos 100 juegos importados desde Excel
- [ ] Panel de Payload accesible en `/admin`
- [ ] `/juegos` muestra el catálogo con datos reales
- [ ] `/juegos/[slug]` muestra la ficha de un juego

---

*Ludoteca Chilena — Fase 1*
