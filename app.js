'use strict';

const TOTAL = 151;
const BATCH_SIZE = 12;
const TYPES = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', electric: 'Elétrico',
  grass: 'Planta', ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno',
  ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', steel: 'Aço', fairy: 'Fada',
};
const STAT_NAMES = { hp: 'HP', attack: 'Ataque', defense: 'Defesa',
  'special-attack': 'Atq. especial', 'special-defense': 'Def. especial', speed: 'Velocidade' };
const $ = (selector) => document.querySelector(selector);
const list = $('[data-js="pokedex"]');
const search = $('#search');
const typeFilter = $('#type');
const sort = $('#sort');
const dialog = $('#details');
const pokemonById = new Map();
let loading = false;
const formatId = (id) => String(id).padStart(3, '0');
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (char) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const typeName = (type) => Object.hasOwn(TYPES, type) ? type : 'normal';
const badges = (pokemon) => pokemon.types.map(({ type }) =>
  `<span class="badge ${typeName(type.name)}">${TYPES[typeName(type.name)]}</span>`).join('');
const artwork = (pokemon) => pokemon.sprites.other?.['official-artwork']?.front_default || pokemon.sprites.front_default;
const imageHTML = (pokemon, lazy = true) => {
  const source = artwork(pokemon);
  return source ? `<img class="pokemon-image" src="${escapeHTML(source)}" alt="${escapeHTML(pokemon.name)}" width="200" height="200" ${lazy ? 'loading="lazy"' : ''} decoding="async">` : '<span class="image-fallback">Imagem indisponível</span>';
};

Object.entries(TYPES).sort((a, b) => a[1].localeCompare(b[1], 'pt-BR')).forEach(([value, label]) => {
  typeFilter.add(new Option(label, value));
});

function render() {
  const query = search.value.trim().toLowerCase().replace(/^#/, '');
  const filtered = [...pokemonById.values()].filter((pokemon) =>
    (!query || (/^\d+$/.test(query) ? pokemon.id === Number(query) : pokemon.name.includes(query))) &&
    (!typeFilter.value || pokemon.types.some(({ type }) => type.name === typeFilter.value)));
  filtered.sort(sort.value === 'name' ? (a, b) => a.name.localeCompare(b.name) :
    sort.value === 'reverse' ? (a, b) => b.id - a.id : (a, b) => a.id - b.id);
  list.innerHTML = filtered.map((pokemon) => `<li class="card ${typeName(pokemon.types[0].type.name)}">
    <button class="card-button" type="button" data-id="${pokemon.id}" aria-label="Ver detalhes de ${escapeHTML(pokemon.name)}">
      <div class="card-top"><span class="pokemon-number">Nº ${formatId(pokemon.id)}</span><span class="card-arrow" aria-hidden="true">↗</span></div>
      <div class="artwork">${imageHTML(pokemon)}</div>
      <h3>${escapeHTML(pokemon.name)}</h3><div class="badges">${badges(pokemon)}</div>
    </button></li>`).join('');
  $('#count').textContent = loading ? `${pokemonById.size} de ${TOTAL} carregados…` : `${filtered.length} de ${pokemonById.size} Pokémon`;
  $('#empty').hidden = loading || filtered.length > 0 || pokemonById.size === 0;
}

async function fetchPokemon(id) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const pokemon = await response.json();
    if (pokemon.id !== id || !pokemon.name || !pokemon.types?.length || !pokemon.sprites || !Array.isArray(pokemon.stats)) {
      throw new Error('Dados inválidos');
    }
    pokemonById.set(id, pokemon);
  } finally {
    clearTimeout(timeout);
  }
}

async function loadPokemon() {
  if (loading) return;
  loading = true;
  list.setAttribute('aria-busy', 'true');
  $('#retry').hidden = true;
  $('#notice').hidden = false;
  $('#notice-text').textContent = 'Explorando Kanto… Os Pokémon aparecem conforme são encontrados.';
  render();
  const missing = Array.from({ length: TOTAL }, (_, index) => index + 1).filter((id) => !pokemonById.has(id));
  for (let index = 0; index < missing.length; index += BATCH_SIZE) {
    await Promise.allSettled(missing.slice(index, index + BATCH_SIZE).map(fetchPokemon));
    render();
  }
  loading = false;
  list.setAttribute('aria-busy', 'false');
  const failed = TOTAL - pokemonById.size;
  $('#notice').hidden = failed === 0;
  $('#retry').hidden = failed === 0;
  $('#notice-text').textContent = pokemonById.size
    ? `${failed} Pokémon não puderam ser carregados. Você pode tentar buscá-los novamente.`
    : 'Não foi possível carregar a Pokédex. Confira sua conexão e tente novamente.';
  render();
}

function showDetails(pokemon) {
  $('#detail-content').innerHTML = `<div class="detail-art ${typeName(pokemon.types[0].type.name)}"><span class="pokemon-number">Nº ${formatId(pokemon.id)}</span>${imageHTML(pokemon, false)}</div>
    <div class="detail-body"><p class="eyebrow">REGIÃO DE KANTO</p><h2 id="detail-name">${escapeHTML(pokemon.name)}</h2><div class="badges">${badges(pokemon)}</div>
    <dl class="measurements"><div><dt>Altura</dt><dd>${(pokemon.height / 10).toLocaleString('pt-BR')} m</dd></div><div><dt>Peso</dt><dd>${(pokemon.weight / 10).toLocaleString('pt-BR')} kg</dd></div></dl>
    <h3>Estatísticas base</h3><div class="stats">${pokemon.stats.map(({ base_stat, stat }) => `<div class="stat"><span>${escapeHTML(STAT_NAMES[stat.name] || stat.name)}</span><strong>${Number(base_stat)}</strong><meter min="0" max="255" value="${Number(base_stat)}" aria-label="${escapeHTML(STAT_NAMES[stat.name] || stat.name)}">${Number(base_stat)}</meter></div>`).join('')}</div></div>`;
  dialog.showModal();
}

search.addEventListener('input', render);
typeFilter.addEventListener('change', render);
sort.addEventListener('change', render);
$('#retry').addEventListener('click', loadPokemon);
$('#reset').addEventListener('click', () => { search.value = ''; typeFilter.value = ''; render(); search.focus(); });
list.addEventListener('click', (event) => {
  const button = event.target.closest('[data-id]');
  if (button) showDetails(pokemonById.get(Number(button.dataset.id)));
});
// A imagem ausente não deve deixar o ícone de imagem quebrada no cartão.
document.addEventListener('error', (event) => {
  if (event.target.matches?.('.pokemon-image')) {
    const fallback = document.createElement('span');
    fallback.className = 'image-fallback';
    fallback.textContent = 'Imagem indisponível';
    event.target.replaceWith(fallback);
  }
}, true);
$('#close-details').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) {
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
} });
loadPokemon();
