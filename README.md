# Começa.ai Academy

Plataforma de aprendizado da Começa.ai. Código proprietário.

## Estado

Fundação. O que já existe:

- Modelo de domínio completo do núcleo (organização, pessoas, catálogo, matrícula, progresso) em `src/db/schema.ts`
- Autenticação: hashing argon2id e sessões assinadas com revogação pelo banco
- Configuração validada de ambiente, com falha explícita no ponto de uso
- Esqueleto Next.js com acessibilidade na base

O que ainda não existe: telas de autenticação, área do aluno, autoria de curso,
player de vídeo, matrícula. A sequência está em `docs/adr/0001-stack.md`.

## Stack

Next.js 15 (App Router) · TypeScript · PostgreSQL com Drizzle ORM ·
Tailwind CSS v4 · argon2id + JWT em cookie `HttpOnly` · Vitest

O porquê de cada escolha está em [`docs/adr/0001-stack.md`](docs/adr/0001-stack.md).

## Rodando local

Requisitos: Node 22+ e um PostgreSQL acessível.

```bash
npm ci
cp .env.example .env          # preencha DATABASE_URL e APP_SECRET
openssl rand -base64 32       # valor para APP_SECRET
npm run db:push               # cria as tabelas (desenvolvimento)
npm run dev                   # http://localhost:3000
```

Sem `DATABASE_URL` o servidor sobe assim mesmo — só falha ao tocar o banco, com
a mensagem dizendo o que falta. Isso mantém `next dev` utilizável antes de o
banco existir.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run check` | Tipos, lint e testes — rode antes de todo commit |
| `npm test` | Só os testes |
| `npm run db:generate` | Gera migração a partir do schema |
| `npm run db:migrate` | Aplica migrações pendentes |
| `npm run db:push` | Sincroniza o schema direto no banco (só desenvolvimento) |
| `npm run db:studio` | Navegador visual do banco |

`db:push` altera o banco sem passar por migração versionada. Serve para iterar
schema em desenvolvimento; em qualquer ambiente compartilhado use
`db:generate` seguido de `db:migrate`.

## Convenções

- Domínio e interface em português; termos técnicos consagrados ficam em inglês.
- Migrações são versionadas e nunca editadas depois de aplicadas.
- Acessibilidade é requisito de aceite, não melhoria futura: foco visível,
  contraste AA, navegação completa por teclado.

## Origem do código

Este código é escrito do zero. Leia [`docs/clean-room.md`](docs/clean-room.md)
antes de contribuir — ele define de onde o código pode e não pode vir, e a
regra não é opcional.
