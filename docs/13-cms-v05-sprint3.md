# Atlas CMS v0.5 Sprint 3

Foco desta sprint: fundação do Builder e ajustes de template.

## Ajustes

- Adicionado botão `Compilar Projeto` no CMS.
- Busca deixa de depender só do último item publicado.
- `search/search-index.json` passa a ser recriado lendo os `data.json` em `modules/`.
- Busca agora encontra Jung e Nietzsche no índice inicial.
- Adicionado componente de compartilhamento com WhatsApp, Facebook e Copiar Link.
- Removido Instagram da área de compartilhamento de artigo.
- Criado CSS modular `assets/css/components/share.css`.
- Adicionado partial `templates/mente-crua/partials/share.html`.
- Builder passou a inserir share nas páginas geradas.
- Mantida correção de caminhos relativos para páginas internas.

## Próxima etapa

- Transformar Jung/Nietzsche no template mestre real.
- Regenerar todas as páginas usando templates/partials.
- Fazer Home, páginas de módulo, sitemap e relacionados serem saídas descartáveis do Builder.
