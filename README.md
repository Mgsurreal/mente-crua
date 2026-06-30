# Mente Crua — Clone Modular CMS v0.3

Base de trabalho segura para evoluir o Mente Crua sem mexer no original.

## Como testar

1. Abra `index.html` para conferir o site atual.
2. Abra `cms/index.html` para usar o CMS local.
3. Crie um conteúdo, importe imagens e clique em **Publicar Local**.
4. Escolha a pasta raiz do projeto quando o navegador pedir.
5. Teste o resultado no navegador.
6. Faça o commit manualmente.

## Fluxo oficial

CMS → Publicar Local → testar → commit manual.

## Estrutura editorial

Cada conteúdo importante é uma entidade:

```txt
modules/
  artigos/
  pensadores/
  conceitos/
  personagens/
  livros/
  arte-explica/
  antes-da-disney/
  mitologias/
  escolas-filosoficas/
```

Cada item deve ficar assim:

```txt
modules/pensadores/jung/
  index.html
  data.json
  img/
```

## CMS v0.3

Inclui:

- botão **Publicar Local**;
- módulos novos: conceitos, personagens, livros, mitologias e escolas filosóficas;
- campo de relacionamentos para todos os conteúdos;
- bloco de entidade linkada;
- importação de imagens do PC;
- biblioteca de imagens do item;
- suporte a SVG, WebP e demais imagens aceitas pelo navegador;
- geração de `index.html` e `data.json` diretamente na pasta correta quando o navegador permitir.

## Observação importante

O botão **Publicar Local** usa a File System Access API, que funciona melhor no Chrome/Edge. Se o navegador bloquear escrita em pastas, use os botões de baixar `index.html` e `data.json`.
