/**
 * Cálculos de progresso, sem banco e sem interface.
 *
 * A regra de "quanto falta" e "por onde continuar" é a mesma no painel, na
 * página do curso e na página da aula. Isolada aqui, ela é testável direto e
 * não fica reescrita em três componentes com pequenas divergências.
 */

/** Percentual inteiro de 0 a 100. Curso sem aulas vale 0, não divisão por zero. */
export function percentualConcluido(concluidas: number, total: number): number {
  if (total <= 0) return 0
  const bruto = (concluidas / total) * 100
  // Arredondar para baixo evita mostrar 100% com uma aula ainda pendente,
  // que é a única imprecisão que a pessoa notaria como erro.
  return Math.min(100, Math.floor(bruto))
}

/**
 * Por onde continuar: a primeira aula da sequência que ainda não foi concluída.
 *
 * Deliberadamente não é "a aula seguinte à última concluída". Quem pula a
 * aula 3 e conclui a 4 continua devendo a 3, e é para lá que o botão leva —
 * senão a aula pulada nunca mais aparece no caminho.
 *
 * Devolve `null` quando o curso inteiro está concluído.
 */
export function proximaAulaPendente(
  ordem: readonly string[],
  concluidas: Iterable<string>,
): string | null {
  const feitas = new Set(concluidas)
  return ordem.find((slug) => !feitas.has(slug)) ?? null
}
