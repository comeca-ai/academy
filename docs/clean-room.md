# Origem do código: regra de sala limpa

Este projeto é proprietário e de código fechado. Para que continue assim, a
origem de cada linha importa.

## O problema concreto

Antes deste projeto, a Começa.ai avaliou adotar o **LearnHouse**, um LMS de
código aberto. Duas descobertas mudaram o plano:

1. O repositório `learnhouse/community-edition` traz apenas arquivos de
   implantação — nenhum código de aplicação, em nenhum ramo ou commit. Sua
   licença MIT cobre só esses arquivos.
2. A aplicação em si vive em `learnhouse/learnhouse` e é **AGPL-3.0**, com
   partes Enterprise sob licença comercial separada.

A AGPL-3.0 é copyleft de rede: quem modifica o software e o oferece a usuários
pela rede precisa disponibilizar a esses usuários o código-fonte da versão
modificada. Manter modificações fechadas exigiria licença comercial negociada.

Como a decisão foi ter plataforma própria e fechada, este código **não pode
derivar** daquele.

## O que é permitido

- Estudar produtos concorrentes, inclusive de código aberto, e usar o
  entendimento para decidir o que construir.
- Reproduzir **funcionalidade**. Ideias, fluxos, regras de negócio e a forma
  geral de um recurso não são protegidos por direito autoral.
- Observar produtos em funcionamento — a demonstração pública, a documentação,
  o comportamento da interface. Estudo de caixa-preta é a forma mais segura.
- Citar nomes de conceitos de domínio (curso, módulo, matrícula, progresso).
  São termos do ramo, não invenção de ninguém.

## O que não é permitido

- Copiar, colar ou adaptar código de projeto sob copyleft para cá.
- Traduzir código alheio linha a linha para outra linguagem ou framework —
  tradução é obra derivada.
- Escrever código deste repositório com o fonte de um projeto AGPL aberto ao
  lado, consultando-o enquanto implementa.
- Reproduzir textos, imagens ou identidade visual de terceiros.

## Como trabalhar na prática

A separação é entre **quem especifica** e **quem implementa**:

1. Quem estuda pode ver o que quiser — fonte aberto, documentação, produto
   rodando — e produz uma **especificação de comportamento em português**:
   o que o sistema faz, quais entidades existem, quais regras valem.
2. Quem implementa trabalha a partir dessa especificação, **sem o fonte alheio
   à vista**.

A especificação é o único artefato que atravessa a fronteira. Ela descreve
comportamento, nunca código.

## Se surgir dúvida

Não improvise: pergunte antes de escrever. Uma linha de origem duvidosa
contamina o repositório inteiro e é cara de remover depois — muito mais cara do
que a conversa que a teria evitado.

Este documento descreve a disciplina de engenharia adotada e não substitui
parecer jurídico. Decisões sobre licenciamento e sobre negociar licença
comercial passam pelo jurídico da empresa.
