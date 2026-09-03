import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="conteudo" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm font-medium text-tinta-suave hover:text-tinta">
        ← Começa.ai Academy
      </Link>
      <div className="mt-6">{children}</div>
    </main>
  )
}
