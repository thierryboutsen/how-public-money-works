# Vocabulário editorial de status

Este documento define os status válidos por contexto. Um status descreve o estado editorial; nenhum status autoriza autopublicação.

## A) Article lifecycle

Usado para acompanhar o ciclo completo de uma pauta ou artigo:

```text
idea → brief → drafted → reviewed → approved → scheduled → published → archived
```

- `idea`: pauta candidata, ainda sem brief aprovado.
- `brief`: pauta com pergunta central, ângulo e estrutura em preparação ou revisão.
- `drafted`: draft completo, ainda não aprovado.
- `reviewed`: draft revisado, aguardando decisão final.
- `approved`: conteúdo aprovado por uma pessoa responsável.
- `scheduled`: conteúdo aprovado com slot ou data definida.
- `published`: conteúdo efetivamente publicado ou pronto em `content/posts/` para publicação controlada.
- `archived`: conteúdo retirado do ciclo ativo, sem ser apagado do histórico.

## B) Calendar slot status

Usado somente para os slots de cadência em `content/calendar/`:

- `open`: slot disponível; não representa um artigo.
- `selected`: uma pauta foi escolhida para o slot, mas ainda pode estar em desenvolvimento.
- `skipped`: slot deliberadamente não preenchido porque não houve qualidade suficiente ou aprovação.
- `filled`: slot associado a conteúdo aprovado e pronto para o fluxo manual de publicação.

`open` não é sinônimo de `idea`, e um slot `filled` não significa publicação automática.

## C) Topic registry status

Usado para o histórico e a taxonomia em `content/registry/topic-registry.yml`:

- `covered`: tema e ângulo já cobertos por conteúdo publicado.
- `seed`: sugestão de geração; não é compromisso editorial.
- `blocked`: tema ou combinação de tema e ângulo que deve ser evitada por repetição, risco ou decisão editorial.
- `retired`: item removido da rotação ativa, preservado apenas para histórico.

## D) Publication status

Usado para descrever a situação de publicação do conteúdo:

- `draft`: rascunho ainda em elaboração.
- `review`: conteúdo aguardando revisão ou aprovação humana.
- `approved`: conteúdo aprovado, mas ainda não publicado.
- `scheduled`: conteúdo aprovado com publicação planejada.
- `published`: conteúdo efetivamente publicado ou localizado em `content/posts/` como parte do conjunto público aprovado.

## Regras gerais

- `published` só pode aparecer para conteúdo efetivamente publicado ou pronto em `content/posts/`.
- `seed` não é compromisso editorial.
- `open` não é artigo.
- `skipped` é aceitável quando não houver qualidade suficiente.
- Nenhum status autoriza autopublicação.
- A aprovação humana continua obrigatória antes de mover conteúdo para `content/posts/`.
