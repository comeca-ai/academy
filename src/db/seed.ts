import { eq } from 'drizzle-orm'

import { getDb } from '@/db/client'
import { garantirOrganizacaoPadrao } from '@/db/queries/users'
import { courses, lessons, modules } from '@/db/schema'

/**
 * Conteúdo inicial da Academy.
 *
 * Idempotente: identifica curso por `slug` dentro da organização e pula o que
 * já existe, então rodar de novo não duplica nada. Serve para levantar um
 * ambiente novo e para dar conteúdo ao site de demonstração.
 */

type AulaSemente = { title: string; minutos: number; content: string }
type ModuloSemente = { title: string; lessons: AulaSemente[] }
type CursoSemente = {
  slug: string
  title: string
  summary: string
  description: string
  modules: ModuloSemente[]
}

const CURSOS: CursoSemente[] = [
  {
    slug: 'primeiros-passos-com-ia',
    title: 'Primeiros passos com inteligência artificial',
    summary:
      'O que a IA generativa faz, o que ela não faz, e como usar isso no seu trabalho já na primeira semana.',
    description:
      'Um curso de entrada, sem pré-requisito técnico. Você vai entender em que a tecnologia é boa, onde ela erra com confiança, e como escrever pedidos que produzem respostas úteis.\n\nAo final, você terá aplicado a ferramenta a uma tarefa real do seu dia.',
    modules: [
      {
        title: 'O que é, de verdade',
        lessons: [
          {
            title: 'Por que agora',
            minutos: 8,
            content:
              'O que mudou nos últimos anos e por que a conversa saiu do laboratório e chegou ao trabalho de todo mundo.',
          },
          {
            title: 'Como a máquina responde',
            minutos: 12,
            content:
              'Uma explicação sem matemática: o modelo prevê a continuação mais provável de um texto. Quase tudo o que surpreende decorre disso.',
          },
          {
            title: 'Onde ela erra com confiança',
            minutos: 10,
            content:
              'O erro mais caro não é a resposta errada — é a resposta errada dita com segurança. Como reconhecer e como se proteger.',
          },
        ],
      },
      {
        title: 'Pedindo bem',
        lessons: [
          {
            title: 'Contexto vale mais que capricho',
            minutos: 11,
            content:
              'Pedido bom não é pedido bonito: é pedido com contexto, exemplo e critério de aceite.',
          },
          {
            title: 'Peça para revisar, não só para produzir',
            minutos: 9,
            content:
              'O ganho maior costuma estar na revisão e na crítica do que você já fez.',
          },
        ],
      },
      {
        title: 'Levando para o trabalho',
        lessons: [
          {
            title: 'Escolhendo a primeira tarefa',
            minutos: 10,
            content:
              'Comece por algo repetitivo, de baixo risco e que você saiba avaliar. Assim o erro é barato e o aprendizado é rápido.',
          },
          {
            title: 'O que nunca colar numa ferramenta de terceiro',
            minutos: 13,
            content:
              'Dado pessoal, segredo de negócio e credencial. O que a LGPD exige de quem trata dado de cliente.',
          },
        ],
      },
    ],
  },
  {
    slug: 'automatizando-tarefas-repetitivas',
    title: 'Automatizando tarefas repetitivas',
    summary:
      'Identifique o trabalho manual que consome sua semana e monte automações simples, sem virar programador.',
    description:
      'Todo time carrega tarefas repetitivas que ninguém questiona. Este curso ensina a enxergá-las, medir quanto custam e automatizar as que valem a pena — começando pelas mais simples.',
    modules: [
      {
        title: 'Enxergando o desperdício',
        lessons: [
          {
            title: 'Mapeando a semana',
            minutos: 12,
            content:
              'Um exercício de registro que quase sempre revela horas escondidas em tarefas de cinco minutos.',
          },
          {
            title: 'O que vale automatizar',
            minutos: 10,
            content:
              'Frequência vezes duração menos o custo de manter. Nem toda tarefa chata compensa automatizar.',
          },
        ],
      },
      {
        title: 'Construindo a primeira automação',
        lessons: [
          {
            title: 'Do manual ao roteiro',
            minutos: 14,
            content:
              'Antes de automatizar, escreva o passo a passo como se fosse ensinar outra pessoa. A automação sai desse texto.',
          },
          {
            title: 'Quando a automação falha',
            minutos: 11,
            content:
              'Automação sem tratamento de erro vira problema silencioso. Como falhar de forma visível.',
          },
        ],
      },
    ],
  },
  {
    slug: 'dados-para-decidir',
    title: 'Dados para decidir',
    summary:
      'Leia números com desconfiança produtiva e transforme planilha em decisão defensável.',
    description:
      'Menos estatística, mais julgamento. O curso trata do que costuma dar errado antes da conta: a pergunta mal formulada, o recorte conveniente e a média que esconde o que importa.',
    modules: [
      {
        title: 'A pergunta antes do número',
        lessons: [
          {
            title: 'Que decisão esse dado muda?',
            minutos: 9,
            content:
              'Se nenhuma resposta muda a decisão, o levantamento não precisa existir.',
          },
          {
            title: 'A média que engana',
            minutos: 12,
            content:
              'Quando a média mente e o que olhar no lugar dela: mediana, dispersão e os extremos.',
          },
        ],
      },
      {
        title: 'Apresentando para decidir',
        lessons: [
          {
            title: 'Um gráfico, uma afirmação',
            minutos: 10,
            content:
              'Todo gráfico deve sustentar uma frase. Se você não consegue escrevê-la, o gráfico ainda não está pronto.',
          },
        ],
      },
    ],
  },
]

/**
 * Título para identificador de URL: sem acento, sem maiúscula, sem símbolo.
 * A decomposição NFD separa a letra do acento, e a faixa U+0300–U+036F remove
 * só os acentos, preservando a letra.
 */
function paraSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function semear(): Promise<void> {
  const db = getDb()
  const organizacao = await garantirOrganizacaoPadrao()
  console.log(`Organização: ${organizacao.name} (${organizacao.slug})`)

  for (const semente of CURSOS) {
    const existentes = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, semente.slug))
      .limit(1)

    if (existentes[0]) {
      console.log(`· ${semente.slug} já existe, pulando`)
      continue
    }

    const criados = await db
      .insert(courses)
      .values({
        organizationId: organizacao.id,
        slug: semente.slug,
        title: semente.title,
        summary: semente.summary,
        description: semente.description,
        status: 'published',
        publishedAt: new Date(),
      })
      .returning({ id: courses.id })

    const curso = criados[0]
    if (!curso) throw new Error(`Falha ao criar o curso ${semente.slug}`)

    for (const [indiceDoModulo, moduloSemente] of semente.modules.entries()) {
      const modulosCriados = await db
        .insert(modules)
        .values({
          courseId: curso.id,
          title: moduloSemente.title,
          position: indiceDoModulo + 1,
        })
        .returning({ id: modules.id })

      const modulo = modulosCriados[0]
      if (!modulo) throw new Error(`Falha ao criar módulo de ${semente.slug}`)

      await db.insert(lessons).values(
        moduloSemente.lessons.map((aula, indiceDaAula) => ({
          moduleId: modulo.id,
          slug: paraSlug(aula.title),
          title: aula.title,
          kind: 'text' as const,
          content: aula.content,
          durationSeconds: aula.minutos * 60,
          position: indiceDaAula + 1,
          status: 'published' as const,
        })),
      )
    }

    const totalDeAulas = semente.modules.reduce((s, m) => s + m.lessons.length, 0)
    console.log(
      `✓ ${semente.slug} — ${semente.modules.length} módulos, ${totalDeAulas} aulas`,
    )
  }

  console.log('Pronto.')
}

semear()
  .then(() => process.exit(0))
  .catch((erro) => {
    console.error('Falha ao semear:', erro)
    process.exit(1)
  })
