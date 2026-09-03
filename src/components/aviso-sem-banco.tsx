/**
 * Estado mostrado quando a aplicação está no ar sem banco configurado.
 *
 * Existe para que uma implantação sem infraestrutura ainda comunique alguma
 * coisa. Uma página que estoura erro 500 não diz a quem abriu o link se o
 * problema é dele, do endereço ou do sistema.
 */
export function AvisoSemBanco() {
  return (
    <div className="rounded-lg border border-borda bg-papel-fundo p-6">
      <h2 className="font-semibold">Catálogo indisponível</h2>
      <p className="mt-2 text-tinta-media">
        Esta instalação ainda não tem banco de dados configurado, então não há
        cursos para listar. O restante da interface funciona normalmente.
      </p>
      <p className="mt-3 text-sm text-tinta-suave">
        Para quem administra: defina <code>DATABASE_URL</code> e rode as
        migrações e o conteúdo inicial.
      </p>
    </div>
  )
}
