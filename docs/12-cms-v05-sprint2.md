# Atlas CMS v0.5 Sprint 2

## Ajustes aplicados

- Removidas páginas duplicadas de artigos na raiz:
  - `artigo-certeza.html`
  - `artigo-crenca-vira-identidade.html`
  - `artigo-template.html`
- Removida a página `index-christian.html` da raiz.
- Criadas partials-base do template Mente Crua:
  - `templates/mente-crua/partials/header.html`
  - `templates/mente-crua/partials/footer.html`
  - `templates/mente-crua/partials/analytics.html`
- Busca pequena adicionada no header.
- Busca passou a funcionar em páginas internas usando caminho relativo automático.
- CMS agora tem botão `Definir raiz do projeto`.
- CMS agora tem botão `Criar estrutura` antes de editar/publicar.
- `Publicar Local` reaproveita a raiz definida e não pede a pasta toda vez.
- `Publicar Local` atualiza:
  - `index.html` do item
  - `data.json`
  - `draft.acf`
  - imagens em `img/`
  - `search/search-index.json`
  - Home, quando o conteúdo for artigo e os marcadores existirem.
- Template gerado pelo CMS agora inclui o Google tag `G-4HTMGLEHCF`.
- Footer gerado inclui link discreto `ADM`.

## Regra nova

Toda entidade nasce primeiro como estrutura física:

```txt
modules/<modulo>/<slug>/
  data.json
  draft.acf
  img/
```

Só depois ela é editada e publicada.
