import { MATERIAIS_DO_CURSO, SEQUENCIA, arquivo, parteDe } from './midia'
import type { Aula, Curso } from './tipos'

/**
 * Curso "De Zero ao Cem".
 *
 * As aulas são geradas a partir de `SEQUENCIA` em `midia.ts` — aquela lista é
 * a fonte da verdade da ordem e dos vídeos. Aqui fica só o que envolve o
 * curso: identidade, descrição e instrutor.
 */

function paraSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const aulas: Aula[] = SEQUENCIA.map((item, indice) => {
  const numero = String(indice + 1).padStart(2, '0')
  const provisoria = item.titulo === null

  return {
    // Aula sem título ainda recebe endereço estável pela posição, para o link
    // não mudar quando o título chegar — só o rótulo visível muda.
    slug: item.titulo ? paraSlug(item.titulo) : `aula-${numero}`,
    titulo: item.titulo ?? `Aula ${numero}`,
    resumo: item.resumo ?? '',
    partes: parteDe(item.video),
    duracaoEmMinutos: 0,
    materiais: (item.materiais ?? []).map((material) => ({
      titulo: material.titulo,
      tipo: material.tipo,
      url: arquivo(material.chave),
    })),
    ...(provisoria ? { provisoria: true } : {}),
  }
})

export const deZeroAoCem: Curso = {
  slug: 'de-zero-ao-cem',
  titulo: 'De Zero ao Cem',
  resumo:
    'Inteligência artificial do começo: o que são dados, como algoritmos aprendem com eles e onde isso já aparece no seu dia.',
  descricao:
    'Um curso de entrada em inteligência artificial, sem pré-requisito técnico.\n\nA sequência parte do material bruto — os dados — passa pelos algoritmos que aprendem com eles e chega às sessões práticas, onde cada conceito reaparece em uso real.',
  instrutor: {
    nome: 'Jhonata Emerick',
    bio: 'Cofundador da Datarisk. Engenheiro aeronáutico pela Escola de Engenharia de São Carlos (USP) e mestre em Finanças Quantitativas pela FGV. Trabalha com inovação, big data, internet das coisas e startups.',
  },
  modulos: [{ titulo: 'Aulas', aulas }],
  materiais: MATERIAIS_DO_CURSO.map((material) => ({
    titulo: material.titulo,
    tipo: material.tipo,
    url: arquivo(material.chave),
  })),
}
