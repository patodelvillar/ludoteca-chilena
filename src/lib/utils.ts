import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import slugifyLib from 'slugify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return slugifyLib(text, { lower: true, strict: true, locale: 'es' })
}

export function formatYear(
  year: number | null | undefined,
  certainty: string | null | undefined
): string {
  if (!year) return 'Año desconocido'
  switch (certainty) {
    case 'exact':
      return year.toString()
    case 'circa':
      return `~${year}`
    case 'decade':
      return `Años ${Math.floor(year / 10) * 10}`
    case 'unknown':
    default:
      return 'Año desconocido'
  }
}

export function formatPlayers(min: number | null, max: number | null): string {
  if (!min && !max) return ''
  if (min && max && min === max) return `${min} jugadores`
  if (min && max) return `${min}–${max} jugadores`
  if (min) return `${min}+ jugadores`
  return `Hasta ${max} jugadores`
}
