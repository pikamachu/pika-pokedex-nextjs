import preferences from '../preferences';

const Pokedex = require('pokedex-promise-v2');

const P = new Pokedex({
  protocol: 'https',
  hostName: 'pokeapi.co',
  versionPath: '/api/v2/',
  cacheLimit: 100 * 1000, // 100s
  timeout: 5 * 1000 // 5s
});

const SEARCH_LIMIT = 893; // Excluding pokemons 100xx (No images available)
const LIST_CHUNK_SIZE = preferences.pageSize;
const DEFAULT_LANG = 'en';

export const getPokemons = async (query) => {
  let list;
  const params = parseParams(query);
  if (params?.q) {
    list = await searchListItems(params);
  } else {
    list = await getListItems(params);
  }
  return list ?? [];
};

export const getPokemonDetails = async (query) => {
  return getDetails(query?.id, query?.lang);
};

export const getListItems = async (params) => {
  const itemList = await loadPokemonList();
  let list = itemList.results;
  if (params.ids) {
    const idsArray = params.ids.split(',');
    list = list.filter((item) => idsArray.includes(item.name));
  }
  if (params.listType === 'random') {
    list = getRandomList(list);
  }
  list = getChunk(list, params.limit, params.offset);
  return getItems(list, params);
};

export const searchListItems = async (params, limit, offset) => {
  const itemList = await loadPokemonList();
  const results = itemList.results.filter((item) => item.name.includes(params.q));
  const list = getChunk(results, params.limit, params.offset);
  return getItems(list, params);
};

export const getDetails = async (id, lang) => {
  const [pokemon, species] = await Promise.all([P.getPokemonByName(id), P.getPokemonSpeciesByName(id)]);
  const code = formatCode(pokemon.id);
  return (
    pokemon && {
      id,
      code,
      name: pokemon.name,
      slug: pokemon.name,
      types: mapTypes(pokemon.types),
      image: getPokemonImage(code),
      tName: species && translateName(species.names, lang),
      color: species?.color?.name,
      evolvesFromId: species?.evolves_from_species && species?.evolves_from_species.name,
      abilities: pokemon.abilities && pokemon.abilities.map((item) => item.ability.name),
      weight: pokemon.weight,
      height: pokemon.height,
      stats: mapStats(pokemon.stats),
      category: '',
      description: ''
    }
  );
};

let pokemonList; // This data is reused between serverless functions invocations
const loadPokemonList = async () => {
  if (!pokemonList) {
    // Loading pokemon list. This is only run during cold start and then cached
    pokemonList = await P.getPokemonsList({
      limit: SEARCH_LIMIT
    });
  }
  return pokemonList;
};

const parseParams = (query) => {
  const params = { ...query };
  params.limit = query.limit ?? query.pageSize ?? LIST_CHUNK_SIZE;
  params.offset = query.offset ?? (query.pageIndex && params.limit * (query.pageIndex - 1)) ?? 0;
  return params;
};

const getItem = async (id) => {
  const pokemon = await P.getPokemonByName(id);
  const code = formatCode(pokemon.id);
  return {
    id,
    code,
    name: pokemon.name,
    slug: pokemon.name,
    types: mapTypes(pokemon.types),
    image: getPokemonImage(code)
  };
};

const getItems = async (list, params) => {
  const items = await Promise.all(
    list.map(async (item) => {
      return getItem(item.name, params?.lang || DEFAULT_LANG);
    })
  );
  return items.filter((pokemon) => !pokemon.evolvesFromId);
};

const getRandomList = (list) => {
  return list.slice().sort(() => Math.random() - Math.random());
};

const getChunk = (list, limit, offset) => {
  const chunkSize = limit || LIST_CHUNK_SIZE;
  const chunkOffset = offset ?? 0;
  return list.slice(chunkOffset, chunkSize + chunkOffset);
};

const formatCode = (code) => code && code.toString().padStart(3, '0');

const translateName = (translations, lang) => {
  const translation = translations && translations.filter((item) => item.language && item.language.name === lang);
  return translation && translation.length > 0 ? translation[0].name : null;
};

const mapTypes = (types) => {
  return (
    types &&
    types.map((item) => {
      return { id: item.type.name, name: item.type.name };
    })
  );
};

const mapStats = (stats) => {
  return (
    stats &&
    stats.map((item) => {
      return { name: item.stat.name, value: item.base_stat };
    })
  );
};

const getPokemonImage = (code) => `${preferences.pokemonImageUrlPrefix}/${code}.${preferences.pokemonImageType}`;
