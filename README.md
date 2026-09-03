# Começa.ai Academy

Plataforma de aprendizado da Começa.ai. Código proprietário.

## Estado

O que já existe:

- Catálogo, aulas, player de vídeo e materiais, com o conteúdo versionado em
  `src/content`
- Autenticação de ponta a ponta: cadastro, login, logout, sessão revogável no
  banco, proteção de rota e primeiro dono via `OWNER_EMAIL`
- Recuperação de senha por e-mail: link de uso único que expira em 30 minutos
  e revoga toda sessão ativa ao ser usado
- Defesas de login e de recuperação: limite de tentativas, resposta de tempo
  constante e bloqueio de redirecionamento aberto — todas com teste
- Curso fechado para quem não tem conta: abrir um curso ou uma aula exige
  sessão válida, checada no servidor a cada requisição. O catálogo (`/cursos`),
  a home e a página do instrutor continuam públicos — são vitrine, não conteúdo
- Matrícula e progresso: marcar aula concluída, barra de progresso, retomar de
  onde parou e um painel com os cursos em andamento
- Configuração validada de ambiente, com falha explícita no ponto de uso
- Acessibilidade na base: foco visível, contraste AA e navegação por teclado

O que ainda não existe: autoria pelo painel, certificado, avaliações e
relatórios de turma. A sequência está em `docs/adr/0001-stack.md`.

### Por que curso e aula não saem mais prontos do build

Até a matrícula existir, `/cursos/[slug]` e `/cursos/[slug]/[aula]` eram
estáticas — o conteúdo é código, então o HTML saía pronto do build, igual
para todo mundo. Fechar o curso para quem não tem conta exige o oposto: uma
checagem de sessão no servidor, a cada requisição, antes de decidir se a
página renderiza ou redireciona para `/entrar`. As duas rotas têm
`dynamic = 'force-dynamic'` por isso — não é acidente nem esquecimento.

O catálogo, a home e o instrutor não passam por essa checagem — não têm nada
que dependa de quem está olhando — e continuam estáticas. Foi medido, não
assumido: veja o `prerender-manifest.json` depois do build; a tabela de rotas
do Next marca `●`/`○` sem provar nada, porque já marcou estático uma página
que não emitia HTML nenhum.

### Por que o progresso é buscado pelo navegador

O cabeçalho aparece em toda página, inclusive nas que continuam estáticas. Uma
leitura de cookie ali bastaria para tirá-las do pré-render também — foi o que
aconteceu antes de existir `/api/sessao`. Medido: com a sessão lida no
cabeçalho, o build emitia 1 rota estática; sem ela, 13.

Por isso o que varia por pessoa nas páginas públicas — o menu da conta e o
progresso — é buscado depois da hidratação, em `/api/sessao` e
`/api/progresso/[curso]`. As duas respostas são `private, no-store`: o
conteúdo é de uma pessoa só e as rotas ficam atrás de CDN.

Ao mexer em `src/components/cabecalho.tsx`, confira o `prerender-manifest.json`
depois do build — não a tabela de rotas do `next build`, que já marcou
estático o que não tinha emitido HTML nenhum. `/`, `/cursos` e `/instrutor`
são o que pode voltar a quebrar; curso e aula já são dinâmicas por conta
própria, então uma leitura de cookie a mais ali não muda o resultado.

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
   - ou cole o conteúdo dos arquivos em `src/db/migrations/*.sql` no console
     SQL do provedor, em ordem — veja a seção abaixo para manter o Drizzle
     ciente de que já rodaram
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

## Ligando e-mail em produção

Sem isto, "esqueci a senha" continua funcionando — só que o link de
redefinição sai no log do servidor em vez do e-mail da pessoa. Serve para
testar o fluxo, não para uma instalação real.

Cloudflare, que hospeda vídeo e arquivo desta plataforma, não tem serviço de
e-mail transacional: Email Routing encaminha e-mail *recebido* para uma caixa
de entrada, não envia e-mail a partir do servidor. Por isso este é o único
pedaço da infraestrutura que não é Cloudflare — usamos [Resend](https://resend.com).

1. Crie uma conta no Resend e verifique um domínio de envio (registro DNS no
   provedor do domínio — leva minutos a se propagar).
2. Gere uma API key.
3. Na Vercel, defina em Production, Preview e Development:
   - `RESEND_API_KEY` — a chave gerada
   - `EMAIL_REMETENTE` — endereço no domínio verificado, formato
     `Nome <endereco@dominio>`
4. Redeploy.

As duas variáveis são exigidas juntas — falta uma, o envio real não acontece,
mesmo com a outra configurada.

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
