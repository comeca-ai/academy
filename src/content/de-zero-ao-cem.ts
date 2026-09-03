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
  // O arco abaixo é o da turma real, apurado no mural do Classroom — não uma
  // sequência suposta. A frase sobre ir além de digitar um prompt é do próprio
  // instrutor, na mensagem de abertura da turma.
  descricao:
    'Um curso de entrada em inteligência artificial, sem pré-requisito técnico. A proposta é uma formação leve e sólida, que vá além da simples digitação de um prompt.\n\nO curso percorre três frentes. Algoritmos e modelos preditivos, com os tipos de algoritmo, as modalidades de aprendizagem e exemplos práticos que evidenciam a presença do aprendizado de máquina no cotidiano. Uma sessão prática sobre casos reais — relatório, precificação e leilão de imóveis. E ética e privacidade no desenvolvimento e na aplicação de sistemas de inteligência artificial.',
  instrutor: {
    nome: 'Jhonata Emerick',
    titulo: 'Cofundador e CEO da Datarisk',
    resumo:
      'Constrói inteligência artificial aplicada no Brasil há mais de uma década — mais de 500 soluções entregues na América Latina. Preside a associação que organiza o setor no país e leciona a partir do que implantou, não do que leu.',
    credenciais: [
      'Cofundador e CEO da Datarisk, referência em soluções de inteligência artificial no Brasil, com mais de 500 soluções desenvolvidas e implantadas na América Latina.',
      'Cofundador e presidente da Associação Brasileira de Inteligência Artificial (ABRIA), à frente de iniciativas estratégicas para IA no país.',
      'Doutor em Engenharia da Computação pela Poli-USP, com tese voltada para automação em saúde.',
      'Mestre em Finanças Quantitativas pela FGV.',
      'Graduado em Engenharia Aeronáutica pela EESC-USP, em São Carlos.',
      'Cofundador do Rapiddo, startup de logística urbana vendida para o iFood em 2018.',
      'Cofundador da RadSquare, de aplicações médicas com inteligência artificial — spinoff do Hospital Israelita Albert Einstein, que é investidor.',
      'Autor de "Econometria com EViews — Guia Essencial de Conceitos e Aplicações".',
    ],
    handle: 'jhonataemck',
    site: 'https://www.jhonataemerick.com.br/',
  },
  modulos: [{ titulo: 'Aulas', aulas }],
  materiais: MATERIAIS_DO_CURSO.map((material) => ({
    titulo: material.titulo,
    tipo: material.tipo,
    url: 'chave' in material ? arquivo(material.chave) : material.url,
  })),
}
