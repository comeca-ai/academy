import type { Metadata, Viewport } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Começa.ai Academy — cursos de IA com Jhonata Emerick',
    template: '%s · Começa.ai Academy',
  },
  description:
    'Cursos de inteligência artificial de quem construiu, escalou e vendeu tecnologia. Sem hype, a partir da prática.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#15171e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* As fontes vêm por link, e não por next/font, para o build não
            depender de alcançar o Google em tempo de compilação. O preconnect
            recupera boa parte da latência que o next/font economizaria. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <style>{`
          :root {
            --fonte-display: 'Fraunces';
            --fonte-corpo: 'IBM Plex Sans';
            --fonte-mono: 'JetBrains Mono';
          }
        `}</style>
      </head>
      <body className="min-h-dvh antialiased">
        {/* Atalho para quem navega por teclado ou leitor de tela pular a
            navegação repetida em toda página. */}
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-marca-fundo focus:px-4 focus:py-2 focus:text-tinta"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  )
}
