import { arquivo, partesDe } from './midia'
import type { Curso } from './tipos'

/**
 * Curso "De Zero ao Cem".
 *
 * Os resumos abaixo foram escritos a partir do propósito declarado em cada
 * deck de slides. As chaves de arquivo são os nomes reais dos objetos no
 * bucket `slidesaulas`, conferidos na listagem — inclusive o que tem espaços.
 */
export const deZeroAoCem: Curso = {
  slug: 'de-zero-ao-cem',
  titulo: 'De Zero ao Cem',
  resumo:
    'Inteligência artificial do começo: o que são dados, como algoritmos aprendem com eles e onde isso já aparece no seu dia.',
  descricao:
    'Um curso de entrada em inteligência artificial, sem pré-requisito técnico.\n\nA sequência parte do material bruto — os dados — passa pelos algoritmos que aprendem com eles e chega a um estudo de caso completo, um serviço de streaming, onde cada conceito reaparece em uso real. Fecha tratando de privacidade, porque quem entende como os dados alimentam a máquina precisa entender também o que está em jogo ao entregá-los.',
  instrutor: {
    nome: 'Jhonata Emerick',
    bio: 'Cofundador da Datarisk. Engenheiro aeronáutico pela Escola de Engenharia de São Carlos (USP) e mestre em Finanças Quantitativas pela FGV. Trabalha com inovação, big data, internet das coisas e startups.',
  },
  modulos: [
    {
      titulo: 'Fundamentos',
      aulas: [
        {
          slug: 'dados-conceitos-fundamentais',
          titulo: 'Dados: conceitos fundamentais',
          resumo:
            'Os conceitos fundamentais de dados e por que eles são a base de tudo que a inteligência artificial faz. Como a IA se inspira no aprendizado humano e qual o papel dos dados para a máquina se adaptar e decidir.',
          partes: partesDe('dados-conceitos-fundamentais'),
          duracaoEmMinutos: 0,
          materiais: [
            {
              titulo: 'Slides da aula',
              tipo: 'slides',
              url: arquivo('dados_conceitos_fundamentais.pdf'),
            },
          ],
        },
        {
          slug: 'algoritmos',
          titulo: 'Algoritmos e modelos preditivos',
          resumo:
            'O que é um algoritmo, o que é um modelo preditivo e como os dois se conectam ao que veio antes. Os tipos de algoritmo, as modalidades de aprendizagem e exemplos de aprendizado de máquina que já fazem parte do cotidiano.',
          partes: partesDe('algoritmos'),
          duracaoEmMinutos: 0,
          materiais: [
            { titulo: 'Slides da aula', tipo: 'slides', url: arquivo('Algoritmos.pdf') },
          ],
        },
      ],
    },
    {
      titulo: 'Na prática',
      aulas: [
        {
          slug: 'de-zero-ao-cem-flix',
          titulo: 'DeZeroAo100Flix: construindo um streaming',
          resumo:
            'O estudo de caso que amarra o curso. Um serviço de streaming registra cada interação — categoria, gênero, ano, elenco, idioma, horário, aparelho e tempo de uso — e é sobre esse histórico que a recomendação é construída.',
          partes: partesDe('de-zero-ao-cem-flix'),
          duracaoEmMinutos: 0,
          materiais: [
            { titulo: 'Slides da aula', tipo: 'slides', url: arquivo('De0ao100Flix.pdf') },
          ],
        },
        {
          slug: 'privacidade-e-dados-pessoais',
          titulo: 'Precisamos falar sobre privacidade',
          resumo:
            'A contrapartida do que o curso ensina: se o dado é o combustível, entregá-lo tem consequência. O que está em jogo quando serviços registram comportamento, e o que isso significa para quem usa e para quem constrói.',
          partes: partesDe('privacidade-e-dados-pessoais'),
          duracaoEmMinutos: 0,
          materiais: [
            {
              titulo: 'Precisamos falar sobre privacidade',
              tipo: 'pdf',
              url: arquivo('Precisamos falar sobre privacidade.pdf'),
            },
          ],
        },
      ],
    },
    {
      titulo: 'Sobre o curso',
      aulas: [
        {
          slug: 'quem-e-o-instrutor',
          titulo: 'Quem conduz o curso',
          resumo:
            'Apresentação do instrutor e da bagagem que sustenta o conteúdo do curso.',
          partes: partesDe('quem-e-o-instrutor'),
          duracaoEmMinutos: 0,
          materiais: [
            {
              titulo: 'Biografia do instrutor',
              tipo: 'pdf',
              url: arquivo('BiografiadoInstrutor.pdf'),
            },
          ],
        },
      ],
    },
  ],
}
