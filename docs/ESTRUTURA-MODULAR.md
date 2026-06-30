# Estrutura Modular — Mente Crua

Nova regra do projeto:

```txt
modules/
  artigos/
    nome-do-artigo/
      index.html
      data.json
      img/

  pensadores/
    nome-do-pensador/
      index.html
      data.json
      img/

  arte/
    nome-da-obra/
      index.html
      data.json
      img/

  antes-da-disney/
    nome-da-historia/
      index.html
      data.json
      img/
```

## Regra principal

Cada artigo, pensador, obra ou série editorial tem sua própria pasta com o HTML, o JSON e as imagens usadas nele.

## CSS

O CSS continua separado em `assets/css/` por base, layout, componentes e páginas.

## Por quê?

Assim fica fácil encontrar tudo daqui a meses: se o problema está no artigo, entra na pasta do artigo. Se está no pensador, entra na pasta do pensador.
