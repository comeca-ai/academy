# ADR 0001 — Stack e arquitetura inicial

- **Status**: aceito
- **Data**: 2026-09-03

## Contexto

A Começa.ai vai construir plataforma própria de aprendizado, de código
fechado, depois de descartar a adoção do LearnHouse por incompatibilidade de
licença (ver `docs/clean-room.md`).

O produto precisa de páginas públicas encontráveis por busca, área autenticada
com papéis distintos, autoria de conteúdo, entrega de vídeo e registro de
progresso. A equipe é pequena, então cada peça de infraestrutura a mais é
custo permanente de manutenção.

## Decisão

**Next.js 15 com App Router, TypeScript estrito.** Um único artefato entrega
as páginas públicas renderizadas no servidor — o que resolve SEO sem stack
separada — e a área autenticada. Server Components deixam a maior parte das
consultas acontecer no servidor, sem API intermediária só para alimentar a
tela.

**PostgreSQL com Drizzle ORM.** O domínio é relacional de verdade: matrícula
liga pessoa e curso, progresso liga matrícula e aula, e as consultas que
importam são agregações sobre essas relações. Drizzle mantém o SQL visível e
gera tipos direto do schema, sem a camada de indireção de um ORM pesado.

**Autenticação própria.** Senha com argon2id, sessão assinada com JWT em
cookie `HttpOnly`, e o estado da sessão na tabela `sessions`. O token carrega
apenas o identificador; validade e revogação são decididas no banco. Isso dá
"sair de todos os aparelhos" e revogação imediata, que um JWT autocontido não
dá. Evita também acoplar identidade a fornecedor externo logo no início.

**Tailwind CSS v4.** Tokens de design no CSS, sem arquivo de configuração em
JavaScript. Escala tipográfica com base em 17px por decisão de legibilidade.

**Vitest.** Mesma cadeia de módulos ESM do resto do projeto, sem transpilador
adicional.

## Consequências

Aceitamos ficar presos ao ciclo de versões do Next.js e à sua forma de separar
servidor e cliente. Em troca, um repositório, um build, um deploy.

Autenticação própria significa que a responsabilidade por ela é nossa: as
rotinas de senha e sessão têm testes desde o primeiro commit e qualquer
mudança nelas passa por revisão atenta.

`noUncheckedIndexedAccess` está ligado. Acesso a índice de array vira
`T | undefined` e o código fica mais verboso — em troca some uma classe
inteira de erro em tempo de execução.

## Sequência de construção

Cada fatia entrega valor de ponta a ponta, em vez de camadas horizontais:

1. **Fundação** — modelo de domínio, ambiente, senha e sessão. *(feito)*
2. **Entrar e sair** — cadastro, login, sessão no banco, primeiro dono via
   `OWNER_EMAIL`, proteção das rotas.
3. **Catálogo lido** — listagem e página de curso públicas, a partir de dados
   semeados.
4. **Autoria** — criar e editar curso, módulo e aula; rascunho e publicação.
5. **Aprender** — matrícula, player de aula, marcação e retomada de progresso.
6. **Conclusão** — regra de curso concluído e comprovante verificável.

## Alternativas consideradas

**SPA com API separada** (Vite mais servidor próprio): dois artefatos, dois
deploys e SEO por resolver. Rejeitado — o custo não se paga num time pequeno.

**Serviço externo de identidade**: entrega mais rápido, mas coloca o dado mais
sensível do produto fora de casa e cobra por usuário ativo. Reavaliar se
surgir demanda de SSO corporativo.

**Prisma no lugar do Drizzle**: ergonomia melhor no começo, mas motor próprio
de consulta e passo de geração de código a mais. Drizzle deixa o SQL legível,
que é o que importa quando uma agregação de progresso ficar lenta.
