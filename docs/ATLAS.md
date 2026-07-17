# Atlas CMS — Constituição

## Filosofia

O Atlas não cria conhecimento. O Atlas organiza, armazena, relaciona, compila e publica conhecimento.

## Regra 1 — Conteúdo tem pasta própria

Todo conteúdo vive dentro da própria pasta:

```txt
modules/<tipo>/<slug>/
├── data.json
├── index.html
└── img/
```

## Regra 2 — HTML chega pronto

O conteúdo principal é colado como HTML. O Atlas não é editor de blocos.

## Regra 3 — O Atlas nunca pergunta onde salvar duas vezes

A raiz do projeto é definida uma vez. Depois disso, o Atlas salva tudo por caminho relativo.

## Regra 4 — Templates cuidam da estrutura global

Header, footer, GTM, busca e compartilhamento pertencem aos templates, não ao conteúdo.

## Regra 5 — Solidez antes de inteligência

Primeiro publicar sem quebrar. Depois automatizar WebP, SEO, relações e multilíngue.

## Regra 6 — Nenhum preenchimento pode desaparecer

O Atlas mantém um rascunho automático local de todos os campos editáveis. O salvamento acontece durante a digitação, preserva a etapa atual e recupera o trabalho após atualização ou fechamento da página. Trocar categoria, idioma, atmosfera ou etapa não limpa o formulário. A remoção do rascunho só acontece por ação explícita no botão **Limpar rascunho local** e nunca apaga arquivos já publicados.

## Próxima fase — Atlas como central de publicação

O Atlas deverá publicar todo conteúdo no template oficial de artigos do Mente Crua. A estrutura permanece; a atmosfera muda.

### Campos editoriais obrigatórios

- título, subtítulo, slug, autor, data e tempo de leitura;
- categoria principal e categorias relacionadas;
- imagem do artigo, miniatura e texto alternativo;
- introdução, seções, citações, referências e encerramento;
- tags, conexões internas e páginas-base relacionadas;
- SEO, idioma original e estado da publicação.

### Direção visual por artigo

O editor escolherá um dos ambientes oficiais:

1. editorial claro;
2. editorial escuro;
3. denso cinematográfico.

A categoria poderá sugerir um ambiente, mas o artigo poderá substituí-lo. O tema deverá controlar cores, atmosfera, intensidade, posição focal do banner e aparência dos blocos sem alterar a estrutura do HTML.

### Lateral contextual

A lateral escura permanecerá contínua inclusive no ambiente editorial claro. Ela poderá reunir índice automático, conexões, páginas-base, livros, conteúdos complementares, ficha contextual e publicidade. Os blocos serão opcionais e ordenáveis no Atlas.

### Composição editorial oficial

O artigo deve se comportar como uma página de revista, não como uma pilha mecânica de blocos. O banner ocupa 100% da largura superior e funciona como uma tampa visual única. Somente abaixo dele começam a coluna principal e a lateral escura, que permanece visualmente contínua até o encerramento do conteúdo. O footer ocupa 100% da largura abaixo das duas colunas e funciona como a tampa inferior, encapsulando o conjunto inteiro.

O banner oficial de artigo mede **1900 × 420 px**. Ele é mais baixo que os banners de categoria, que permanecem em 1900 × 520 px. No desktop, sua altura responsiva fica aproximadamente entre **250 e 326 px**. O título e o subtítulo são desenhados na própria imagem, centralizados verticalmente e limitados à região segura central. O H1, a categoria e a descrição continuam no HTML com transparência visual, preservando semântica, acessibilidade, busca e SEO sem duplicar o texto na tela.

Cada artigo possui ainda um par visual de divulgação: uma imagem de chamada sem texto em 1200 × 675 px para cards e uma imagem OG com texto em 1200 × 630 px para compartilhamento. As duas utilizam a mesma cena e identidade; a versão OG não aparece no corpo do artigo. As imagens internas seguem ritmo de revista, alternando esquerda e direita, com imagens largas ocasionais somente em passagens de impacto.

As ilustrações dos grandes tópicos devem alternar sua posição:

- `.article-editorial-row`: imagem à esquerda e texto à direita;
- `.article-editorial-row.article-editorial-row--reverse`: texto à esquerda e imagem à direita;
- `.article-feature-figure`: imagem horizontal de impacto em largura completa.

Cada bloco editorial deve reunir título e parágrafos fluidos. A imagem participa do argumento e não precisa ficar acima do tópico. Em telas pequenas, os blocos são empilhados automaticamente sem perder a ordem de leitura.

### Publicidade

- nunca antes da introdução;
- primeiro espaço após conteúdo útil na lateral;
- segundo espaço aproximadamente entre 35% e 45% da leitura;
- terceiro espaço opcional antes dos relacionados em artigos longos;
- nunca no banner, junto a botões, no footer ou nas páginas de categoria.

### Publicação e atualização automática

Ao publicar, o Atlas deverá gerar a pasta do artigo, o `data.json`, o `index.html` e as imagens; atualizar a categoria correspondente; atualizar os quatro artigos recentes da Home; alimentar busca, índice geral, anterior/próximo e conexões relacionadas.

### Multilíngue

O conteúdo não será apenas traduzido literalmente. Cada versão deverá ser readaptada culturalmente para o idioma e a região. A primeira fase editorial trabalhará com português, inglês, espanhol e italiano. A arquitetura permanece preparada para expansão futura.

## Estado em 16/07/2026

- template oficial de artigo criado e integrado ao Atlas;
- rascunho local automático com recuperação após recarga e indicador visual de salvamento;
- botão para salvar `data.json` como rascunho sem publicar o artigo;
- biblioteca de imagens com atribuição direta de thumb, banner e imagem OG;
- publicador alinhado ao template oficial: banner superior e footer ocupam toda a largura sobre e sob artigo mais lateral;
- publicação unificada em `modules/artigos/<slug>/`, com categoria registrada como metadado;
- seleção de 10 categorias oficiais, 11 idiomas e três atmosferas visuais;
- foco vertical do banner configurável: topo, centro ou base;
- índice lateral automático, biblioteca complementar, conteúdos complementares e conexões futuras;
- publicidade opcional na lateral, no meio e no fim de artigos longos;
- card publicado automaticamente na categoria correspondente;
- Home limitada aos quatro artigos mais recentes;
- ambientes claro, escuro e cinematográfico definidos;
- banner de artigo compacto e footer oficial estabelecidos;
- dez categorias oficiais estruturadas;
- banners de Artigos e das dez categorias padronizados em WebP com 1900 × 520 px;
- próximos trabalhos concentrados em validar o fluxo completo com publicações reais e ampliar a edição visual sem alterar o template.
