# Pokédex · Explore Kanto

Uma Pokédex dos **151 Pokémon da primeira geração**, feita com HTML, CSS e JavaScript puro. Busque um Pokémon, explore seus tipos e abra seu cartão para conhecer suas estatísticas.

## Funcionalidades

- Busca por nome ou número (por exemplo: `pikachu`, `25` ou `#025`).
- Filtro por tipo com nomes em português e ordenação por nome ou número.
- Detalhes com altura, peso e as seis estatísticas base.
- Layout responsivo, cartões com cores por tipo e imagens carregadas sob demanda.
- Navegação por teclado, foco visível, mensagens de status e respeito à preferência de movimento reduzido.
- Carregamento progressivo em lotes de até 12 requisições, com limite de 12 segundos por requisição.
- Tratamento de falhas parciais: os Pokémon disponíveis continuam visíveis e o botão de nova tentativa busca somente os que faltaram.

## Executar localmente

Não é necessário instalar dependências nem realizar um build. Abra `index.html` em um navegador moderno ou use um servidor estático. Com Python 3 instalado, execute na pasta do projeto:

```bash
python3 -m http.server 8000
```

Acesse **http://localhost:8000**. Para encerrar o servidor, pressione `Ctrl+C`.

É necessária conexão com a internet para buscar os dados e as imagens. As fontes do Google Fonts são opcionais: se não carregarem, o navegador usa fontes locais. Os nomes dos Pokémon são apresentados conforme retornados pela API; os tipos e a interface estão em português.

## Estrutura

```text
pokedexJS/
├── index.html   # Estrutura semântica, controles e diálogo de detalhes
├── style.css    # Layout, cores por tipo e adaptação a telas menores
├── app.js       # Consulta à API, estado em memória, filtros e renderização
└── README.md
```

Os dados são consultados em `https://pokeapi.co/api/v2/pokemon/{id}`. A aplicação mantém os resultados em memória durante a sessão e reutiliza os dados carregados para filtrar e exibir detalhes, sem novas consultas. Ao recarregar a página, a coleção é buscada novamente.

Para alterar a quantidade de Pokémon ou o tamanho dos lotes, edite `TOTAL` e `BATCH_SIZE` em `app.js`. O conteúdo e os textos atuais são voltados à região de Kanto.

## Verificação manual

1. Confira o carregamento dos 151 Pokémon, incluindo Mew (nº 151).
2. Busque `pikachu`, `25` e `#025`; combine a busca com o filtro Elétrico.
3. Teste as três ordenações e uma busca sem resultados; use “Limpar filtros”.
4. Abra um cartão com clique ou teclado; confira os detalhes e feche com `Esc` ou o botão de fechar.
5. Simule uma conexão indisponível nas ferramentas do navegador e teste a nova tentativa após restaurá-la.
6. Confira a navegação com `Tab` e o layout em telas pequenas.

## Créditos

O projeto começou como exercício baseado no tutorial de Roger Melo: [Aplicação com JavaScript puro: Como desenvolver uma pokedex](https://www.youtube.com/watch?v=Uptu3NrBFBM).

Dados e imagens disponibilizados pela [PokéAPI](https://pokeapi.co/). Pokémon e os nomes dos personagens pertencem aos respectivos titulares. Projeto de estudo, sem afiliação oficial.
