# Tarefa: novo frontend da Começa.ai Academy

Você é um engenheiro de frontend sênior. Projete e escreva o novo frontend da
plataforma descrita abaixo. Você **não tem acesso ao repositório**, então tudo
que você precisa saber está neste documento. Siga as restrições literalmente —
elas vêm de bugs reais já corrigidos, não são preferência de estilo.

---

## 1. O produto

Plataforma de cursos de inteligência artificial, em **português do Brasil**.

- **Marca do produto:** começa.ai (wordmark: `começa` em tinta escura + `.ai` em
  azul de marca; tudo minúsculo).
- **Instrutor:** Jhonata Emerick — pessoa real, com página própria. A marca do
  produto e a pessoa do instrutor são **separadas de propósito**. O instrutor
  aparece como quem ensina (bio, trajetória, barra lateral do curso), nunca
  como o logotipo do produto.
- **Posicionamento / mote:** *"Toda grande jornada tem um começo. Começa.ai."*
  O trocadilho entre "começa aí" e "começa.ai" é o coração da marca — use-o,
  mas com parcimônia, sem repetir em toda tela.

### Os dois objetivos desta reformulação

1. **Navegação fácil.** A pessoa entra e sabe em um olhar onde parou e qual é o
   próximo passo. Zero becos sem saída.
2. **Sensação de pertencer a uma comunidade.** Esse é o pedido central e o que
   hoje falta por completo. A plataforma é solitária: a pessoa assiste vídeo
   sozinha e vai embora. Queremos que ela sinta que faz parte de uma turma.

---

## 2. Stack — obrigatório

- **Next.js 15** (App Router), **React 19**, **TypeScript**
- **Tailwind CSS v4** — tokens declarados via `@theme` no `globals.css`
- **Sem biblioteca de componentes externa.** Nada de shadcn/ui, MUI, Chakra,
  Radix, Headless UI. Só React + Tailwind escritos à mão.
- Sem CSS-in-JS, sem styled-components, sem arquivo `.css` por componente.
- Ícones: SVG inline escrito à mão. Não importe biblioteca de ícone.

---

## 3. Sistema de cor — use os TOKENS, nunca hex direto

A cor vive em duas camadas. Componente **nunca** usa a primitiva; usa só o papel
semântico, que no Tailwind vira classe utilitária (`bg-fundo`, `text-marca`,
`border-borda`, etc.).

### Papéis semânticos disponíveis (classe Tailwind → valor)

| Token | Classe | Valor | Papel |
|---|---|---|---|
| `--color-fundo` | `bg-fundo` | `#F2F2F2` | fundo da página |
| `--color-superficie` | `bg-superficie` | `#FFFFFF` | cartão, painel |
| `--color-superficie-alta` | `bg-superficie-alta` | `#E8E8EA` | trilho, barra vazia |
| `--color-borda` | `border-borda` | `#DCDCDE` | borda padrão |
| `--color-borda-forte` | `border-borda-forte` | `#8A8A90` | borda de destaque |
| `--color-tinta` | `text-tinta` | `#101014` | texto principal |
| `--color-tinta-media` | `text-tinta-media` | `#45454E` | texto secundário |
| `--color-tinta-suave` | `text-tinta-suave` | `#63636D` | texto de apoio |
| `--color-marca` | `text-marca` | `#1F1BE4` | azul da marca como TEXTO |
| `--color-marca-fundo` | `bg-marca-fundo` | `#1F1BE4` | preenchimento de botão |
| `--color-marca-fundo-forte` | `bg-marca-fundo-forte` | `#1815B8` | hover do botão |
| `--color-marca-tinta` | `text-marca-tinta` | `#FFFFFF` | texto SOBRE preenchimento azul |
| `--color-acento` | `bg-acento` | `#FAE047` | amarelo, só decorativo |

Se precisar de um papel novo, **proponha um token semântico novo** com nome em
português seguindo o padrão acima. Não use hex solto no componente.

---

## 4. Regras rígidas de acessibilidade — não negociáveis

Estas três vêm de defeitos medidos e corrigidos. Violá-las é regressão.

1. **O amarelo (`#FAE047`) NUNCA é texto, borda de foco, ou portador de
   informação.** Medido: ~1.2:1 de contraste sobre o fundo claro, muito abaixo
   do mínimo. Serve só como preenchimento decorativo (selo, marcador, realce)
   e sempre com texto escuro por cima. Se a informação só existe pelo amarelo,
   está errado.
2. **Texto sobre `bg-marca-fundo` é SEMPRE `text-marca-tinta` (branco), nunca
   `text-tinta`.** O papel de `tinta` é contrastar com o fundo da página, não
   com o preenchimento de um botão. Confundir os dois já produziu botão de
   texto quase invisível.
3. **Foco visível é requisito.** `outline: 3px solid` no azul da marca, com
   `outline-offset`. Nunca remover sem substituir por algo igualmente visível.
   Não use o amarelo para isso.

Além disso: respeite `prefers-reduced-motion`, use HTML semântico
(`<main>`, `<nav>`, `<section>`, hierarquia de heading correta), rotule toda
navegação com `aria-label`, e garanta alvo de toque confortável no mobile.

---

## 5. Tipografia

- **Host Grotesk** — corpo, títulos e o wordmark. Classes: `font-sans`,
  `font-display`, `font-marca`.
- **JetBrains Mono** — só rótulo técnico curto (contador de aula, duração).
  Classe: `font-mono`. Nunca para texto corrido.

---

## 6. Rotas que existem hoje

Pode redesenhar todas; pode propor rotas novas. Não remova nenhuma sem dizer
para onde o conteúdo dela vai.

```
/                          home / vitrine
/cursos                    catálogo (público)
/cursos/[slug]             página do curso        (exige login)
/cursos/[slug]/[aula]      player da aula         (exige login)
/entrar                    login
/cadastro                  criar conta
/esqueci-senha             pedir link de redefinição
/redefinir-senha           definir nova senha
/painel                    painel da pessoa logada
/instrutor                 bio e trajetória do instrutor
```

Componentes existentes hoje (nomes em português, pode reescrever):
`cabecalho`, `marca`, `cartao-de-curso`, `conteudo-do-curso`,
`conclusao-da-aula`, `materiais-da-aula`, `player-de-video`, `nav-da-conta`,
`aviso-sem-banco`.

---

## 7. Restrições de arquitetura — quebram o build se ignoradas

1. **Componente cliente (`'use client'`) não pode importar nada que puxe o
   módulo nativo de hash de senha** (`@node-rs/argon2`, alcançado via
   `@/lib/auth/password`). Isso já quebrou o build uma vez. Valor derivado
   disso (ex.: tamanho mínimo de senha) deve ser lido em **componente
   servidor** e descer por **prop**.
2. **`/cursos/[slug]` e `/cursos/[slug]/[aula]` são `force-dynamic` e exigem
   sessão.** A checagem de login roda por requisição. Não os transforme em
   estático nem em cliente.
3. **O conteúdo dos cursos é versionado em código** (`src/content/*.ts`), não
   vem de CMS nem de banco. O banco guarda só pessoa, sessão, matrícula e
   progresso de aula.
4. Não introduza dependência nova sem justificar. A régua é alta.

---

## 8. Estado do conteúdo

São **4 cursos** (a plataforma hoje mostra um só, e vai ser reorganizada):

1. **A história e o que dizem os dados** — teoria de abertura
2. **Uma aula prática** — mão na massa
3. **Algoritmos: como acontece essa mágica** — a mecânica por trás
4. Um quarto curso curto, derivado das sessões práticas

Cada curso tem módulos → aulas. Aula tem vídeo, resumo, materiais (PDF e link
externo), e marcação de concluída. Progresso e matrícula já existem no banco.

---

## 9. O pedido central: comunidade

Hoje não existe **nenhuma** feature de comunidade. Queremos que a pessoa sinta
que faz parte de uma turma, não que está num repositório de vídeo.

Proponha as mecânicas. Para **cada** uma, diga:

- o que a pessoa vê e faz;
- que dado novo precisa ser guardado (tabela/campo);
- o custo de moderação que ela cria;
- se dá para entregar uma versão boa **sem** backend novo.

Separe explicitamente em dois grupos:

- **Grupo A — só frontend**, com o que já existe (progresso, matrícula,
  nome da pessoa, quantidade de gente matriculada). Ex.: sinais de turma,
  marcos de jornada, celebração de conclusão, presença de colegas.
- **Grupo B — exige backend novo.** Ex.: comentário por aula, perguntas e
  respostas, mural da turma, perfil público.

Seja honesto sobre o Grupo B: comentário sem moderação é passivo, não ativo.

---

## 10. O que entregar

Nesta ordem:

1. **Arquitetura de informação e modelo de navegação.** Como a pessoa circula.
   Onde ela vê "onde parei" e "qual o próximo passo". Trate o mobile como
   caso principal, não como adaptação.
2. **Layout tela a tela**, para as rotas da seção 6. Descreva a hierarquia
   visual e o que ocupa o topo de cada tela.
3. **Mecânicas de comunidade**, no formato da seção 9.
4. **Código React + Tailwind** das telas-chave, nesta prioridade:
   `/` (home), `/cursos/[slug]` (página do curso), `/cursos/[slug]/[aula]`
   (player). Código completo e compilável, usando **só** os tokens da seção 3.
5. **Tokens novos que você propôs**, se houver, no formato `@theme` do
   Tailwind v4.

## Formato da resposta

- Português do Brasil, inclusive no texto de interface.
- Código em bloco marcado com a linguagem e com o caminho do arquivo no topo.
- Quando tomar uma decisão de design não óbvia, escreva **uma linha** dizendo
  por quê. Não escreva ensaio.
- Se alguma restrição deste documento impedir o que você faria, **diga isso
  explicitamente** em vez de ignorar a restrição em silêncio.
