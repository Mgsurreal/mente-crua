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
