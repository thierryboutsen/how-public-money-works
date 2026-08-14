# Arquitetura bilíngue da homepage e de Insights

## Estado atual

- `/` é a canonical em inglês da homepage.
- `/insights` lista artigos publicados em inglês.
- A homepage oferece tradução client-side EN/PT-BR para a interface e, quando existe par publicado, troca texto e destino dos artigos dinâmicos.
- Artigos individuais usam URLs próprias, canonical próprio e relações `hreflang` EN/PT-BR.
- O seletor de idioma atualiza `html lang` e `localStorage`.

Esse modelo é compatível com o build atual, mas a tradução client-side não cria uma página PT-BR indexável separada.

## Arquitetura futura recomendada

- `/` → homepage EN canonical.
- `/pt-br/` → homepage PT-BR canonical.
- `/insights` → índice EN.
- `/pt-br/insights` → índice PT-BR.
- Cada rota deve ter HTML estático no idioma correto, canonical próprio, `hreflang` recíproco e `x-default` apontando para EN.
- O seletor de idioma deve navegar entre rotas equivalentes, não apenas trocar a copy no navegador.

## Regra de migração

A migração só deve ocorrer quando o build puder gerar e validar as quatro rotas como unidade. Até lá, preservar o modelo atual e não criar canonical PT-BR fictício para páginas que ainda não existem.
