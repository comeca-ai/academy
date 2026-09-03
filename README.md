# Começa.ai Academy

Plataforma de aprendizado da Começa.ai. Código proprietário.

## Estado

O que já existe:

- Catálogo, aulas, player de vídeo e materiais, com o conteúdo versionado em
  `src/content` e as páginas saindo prontas do build
- Autenticação de ponta a ponta: cadastro, login, logout, sessão revogável no
  banco, proteção de rota e primeiro dono via `OWNER_EMAIL`
- Defesas de login: limite de tentativas, resposta de tempo constante e
  bloqueio de redirecionamento aberto — todas com teste
- Matrícula e progresso: marcar aula concluída, barra de progresso, retomar de
  onde parou e um painel com os cursos em andamento
- Configuração validada de ambiente, com falha explícita no ponto de uso
- Acessibilidade na base: foco visível, contraste AA e navegação por teclado

O que ainda não existe: autoria pelo painel, certificado, avaliações e
relatórios de turma. A sequência está em `docs/adr/0001-stack.md`.

### Por que o progresso é buscado pelo navegador

As páginas do catálogo são estáticas — é o ponto de guardar o conteúdo em
código. Qualquer leitura de cookie no servidor dentro dessas páginas derruba o
pré-render inteiro, inclusive quando está escondida num componente comum como
o cabeçalho. Medido: com uma leitura de sessão no cabeçalho, o build emitia
1 rota estática; sem ela, 13.

Por isso o que varia por pessoa — o menu da conta e o progresso — é buscado
depois da hidratação, em `/api/sessao` e `/api/progresso/[curso]`. As duas
respostas são `private, no-store`: o conteúdo é de uma pessoa só e as rotas
ficam atrás de CDN.

Ao mexer em `src/components/cabecalho.tsx` ou em qualquer componente presente
nas páginas de curso, confira o `prerender-manifest.json` depois do build. A
tabela de rotas do Next marca `●` mesmo quando não emitiu HTML nenhum, então
ela não serve de prova.

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

## Ligando o banco em produção

O catálogo, as aulas e os materiais são conteúdo estático e funcionam sem
banco. Cadastro, login e progresso precisam de um Postgres.

O banco em uso é um **Prisma Postgres** (`db.prisma.io`, região us-east-1),
alcançado pela string de conexão direta — Postgres puro, sem Accelerate e sem
o cliente do Prisma. O ORM continua sendo o Drizzle; para a aplicação é um
Postgres como qualquer outro.

Para ligar o banco numa implantação:

1. Na Vercel, em Settings → Environment Variables, defina as duas em
   Production, Preview e Development:
   - `DATABASE_URL` — a string de conexão direta, terminando em `?sslmode=require`
   - `APP_SECRET` — gerada com `openssl rand -base64 32`
2. Aplique o schema, de um destes jeitos:
   - `DATABASE_URL='...' npm run db:migrate` de uma máquina que alcance o banco
   - ou cole o conteúdo de `src/db/migrations/0000_*.sql` no console SQL do
     provedor
3. Republique na Vercel (qualquer push serve, ou Redeploy no painel).

Sem `APP_SECRET` o login falha mesmo com banco configurado — as duas
variáveis são necessárias juntas.

`sslmode=require` é obrigatório: o Prisma Postgres só aceita conexão com TLS.
O driver interpreta esse modo como TLS sem verificação de CA, que é a
semântica padrão do Postgres para `require`.

### Se o schema for aplicado fora do `db:migrate`

Aplicar o SQL direto no console deixa o Drizzle sem saber que a migração já
rodou, e o próximo `db:migrate` tentaria recriar tudo. Para manter o controle
coerente, registre a migração junto:

```sql
CREATE SCHEMA IF NOT EXISTS "drizzle";
CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);
INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
VALUES ('<sha256 do arquivo .sql>', <campo "when" do _journal.json>);
```

O hash é o `sha256sum` do arquivo de migração inteiro, e `created_at` é o
`when` da entrada correspondente em `src/db/migrations/meta/_journal.json`.

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
