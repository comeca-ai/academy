/**
 * Duração em texto curto e legível: "1 h 20 min", "45 min", "menos de 1 min".
 *
 * Arredonda para baixo no minuto, porque prometer menos tempo do que o real é
 * pior do que prometer um pouco mais.
 */
export function duracaoHumana(segundos: number): string {
  if (!Number.isFinite(segundos) || segundos <= 0) return 'menos de 1 min'

  const totalDeMinutos = Math.floor(segundos / 60)
  if (totalDeMinutos < 1) return 'menos de 1 min'
  if (totalDeMinutos < 60) return `${totalDeMinutos} min`

  const horas = Math.floor(totalDeMinutos / 60)
  const minutos = totalDeMinutos % 60
  return minutos === 0 ? `${horas} h` : `${horas} h ${minutos} min`
}

/** Concorda o substantivo com o número: "1 aula", "4 aulas". */
export function plural(quantidade: number, singular: string, plural: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`
}
