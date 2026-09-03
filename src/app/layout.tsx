import type { Metadata, Viewport } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Começa.ai Academy',
    template: '%s · Começa.ai Academy',
  },
  description: 'Plataforma de aprendizado da Começa.ai.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased">
        {/* Atalho para quem navega por teclado ou leitor de tela pular a
            navegação repetida em toda página. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-marca focus:px-4 focus:py-2 focus:text-papel"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  )
}
