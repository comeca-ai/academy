import Link from 'next/link'

const PILARES = [
  {
    titulo: 'Cursos com estrutura clara',
    texto:
      'Curso, módulo e aula. Uma hierarquia previsível para quem ensina montar e para quem aprende se localizar.',
  },
  {
    titulo: 'Progresso que se retoma',
    texto:
      'Cada aula guarda onde a pessoa parou. Voltar depois de uma semana não custa procurar de novo.',
  },
  {
    titulo: 'Acessível por padrão',
    texto:
      'Contraste, foco visível, navegação por teclado e texto grande fazem parte da base, não de um ajuste posterior.',
  },
]

export default function Home() {
  return (
    <main id="conteudo" className="mx-auto max-w-3xl px-6 py-20">
      <p className="text-sm font-medium uppercase tracking-wide text-tinta-suave">
        Começa.ai
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance">
        Academy
      </h1>
      <p className="mt-5 text-lg text-tinta-suave text-pretty">
        A plataforma de aprendizado da Começa.ai. Em construção — a fundação já
        está de pé: modelo de domínio, autenticação e as decisões de arquitetura
        registradas em <code className="text-base">docs/adr</code>.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/cadastro"
          className="rounded-md bg-marca px-5 py-2.5 font-medium text-papel hover:bg-marca-forte"
        >
          Criar conta
        </Link>
        <Link
          href="/entrar"
          className="rounded-md border border-borda px-5 py-2.5 font-medium hover:bg-papel-fundo"
        >
          Entrar
        </Link>
      </div>

      <ul className="mt-12 grid gap-5 sm:grid-cols-3">
        {PILARES.map((pilar) => (
          <li
            key={pilar.titulo}
            className="rounded-lg border border-borda bg-papel-fundo p-5"
          >
            <h2 className="font-semibold">{pilar.titulo}</h2>
            <p className="mt-2 text-sm text-tinta-suave">{pilar.texto}</p>
          </li>
        ))}
      </ul>
    </main>
  )
}
