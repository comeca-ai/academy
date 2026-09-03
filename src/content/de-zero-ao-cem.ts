import { arquivo } from './midia'
import { VIDEOS } from './midia'
import type { Curso } from './tipos'

/**
 * Curso "De Zero ao Cem".
 *
 * Os resumos abaixo foram escritos a partir do propósito declarado em cada
 * deck de slides. As chaves de arquivo no R2 seguem o nome original dos PDFs
 * — se algum link abrir em erro, corrija a chave aqui.
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
          video: VIDEOS['dados-conceitos-fundamentais'] ?? null,
          duracaoEmMinutos: 0,
          materiais: [
            {
              titulo: 'Slides da aula',
              tipo: 'slides',
              url: arquivo('dados_conceitos_fundamentais_1.pdf'),
            },
          ],
        },
        {
          slug: 'algoritmos',
          titulo: 'Algoritmos e modelos preditivos',
          resumo:
            'O que é um algoritmo, o que é um modelo preditivo e como os dois se conectam ao que veio antes. Os tipos de algoritmo, as modalidades de aprendizagem e exemplos de aprendizado de máquina que já fazem parte do cotidiano.',
          video: VIDEOS['algoritmos'] ?? null,
          duracaoEmMinutos: 0,
          materiais: [
            { titulo: 'Slides da aula', tipo: 'slides', url: arquivo('Algoritmos_1.pdf') },
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
          video: VIDEOS['de-zero-ao-cem-flix'] ?? null,
          duracaoEmMinutos: 0,
          materiais: [
            { titulo: 'Slides da aula', tipo: 'slides', url: arquivo('De0ao100Flix_1.pdf') },
          ],
        },
        {
          slug: 'privacidade-e-dados-pessoais',
          titulo: 'Precisamos falar sobre privacidade',
          resumo:
            'A contrapartida do que o curso ensina: se o dado é o combustível, entregá-lo tem consequência. O que está em jogo quando serviços registram comportamento, e o que isso significa para quem usa e para quem constrói.',
          video: VIDEOS['privacidade-e-dados-pessoais'] ?? null,
          duracaoEmMinutos: 0,
          materiais: [
            {
              titulo: 'Precisamos falar sobre privacidade',
              tipo: 'pdf',
              url: arquivo('Precisamos_falar_sobre_privacidade_2.pdf'),
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
          video: VIDEOS['quem-e-o-instrutor'] ?? null,
          duracaoEmMinutos: 0,
          materiais: [
            {
              titulo: 'Biografia do instrutor',
              tipo: 'pdf',
              url: arquivo('BiografiadoInstrutor_1.pdf'),
            },
          ],
        },
      ],
    },
  ],
}
