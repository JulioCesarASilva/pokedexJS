const getPokemonUrl = (id) => `https://pokeapi.co/api/v2/pokemon/${id}`;

const correctId = (id) => id.padStart(3, "0");

const generatePokemonPromises = () => Array(150).fill().map((_, index) =>
    fetch(getPokemonUrl(index + 1)).then((response) => response.json())
);

const urlImage = (id) => `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${correctId(id.toString())}.png`;

const generateHTML = (pokemons) =>
  pokemons.reduce((accumulator, { name, id, types }) => {
    const elementsTypes = types.map((typeInfo) => typeInfo.type.name);

    accumulator += `<li class="card ${elementsTypes[0]}">
        <img class="card-image" alt="${name}" src="${urlImage(id)}" >
            <h2 class="card-title">${id}. ${name}</h2>
            <p class="card-subtitle">${elementsTypes.join(" | ")}</p>
        </li>`;
    return accumulator;
  }, "");

const insertPokemonIntoPage = (pokemon) => document.querySelector("[data-js='pokedex']").innerHTML = pokemon;

const pokemonPromisses = generatePokemonPromises();

Promise.all(pokemonPromisses).then(generateHTML).then(insertPokemonIntoPage);
