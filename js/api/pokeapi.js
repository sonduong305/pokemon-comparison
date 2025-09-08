import cacheManager from '../utils/cache.js';

export class PokeAPIService {
    constructor() {
        this.baseURL = 'https://pokeapi.co/api/v2';
    }

    async getPokemon(nameOrId) {
        const cacheKey = `pokemon-${nameOrId}`;
        
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
            return cachedData;
        }

        try {
            const response = await fetch(`${this.baseURL}/pokemon/${nameOrId.toLowerCase()}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Pokemon "${nameOrId}" not found`);
                }
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const pokemon = this.transformPokemonData(data);
            
            cacheManager.set(cacheKey, pokemon);
            
            return pokemon;
        } catch (error) {
            if (error.message.includes('not found')) {
                throw error;
            }
            throw new Error(`Failed to fetch Pokemon: ${error.message}`);
        }
    }

    async searchPokemon(query) {
        if (!query || query.length < 2) {
            return [];
        }

        try {
            const response = await fetch(`${this.baseURL}/pokemon?limit=1302`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const filteredResults = data.results
                .filter(pokemon => 
                    pokemon.name.toLowerCase().includes(query.toLowerCase()) ||
                    this.extractIdFromUrl(pokemon.url).toString() === query
                )
                .slice(0, 10)
                .map(pokemon => ({
                    name: pokemon.name,
                    id: this.extractIdFromUrl(pokemon.url)
                }));

            return filteredResults;
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    transformPokemonData(data) {
        return {
            id: data.id,
            name: data.name,
            height: data.height / 10,
            weight: data.weight / 10,
            types: data.types.map(t => t.type.name),
            sprite: data.sprites.other['official-artwork'].front_default || 
                    data.sprites.front_default,
            animatedSprite: data.sprites.other.showdown?.front_default || null,
            stats: data.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
            }, {})
        };
    }

    extractIdFromUrl(url) {
        const matches = url.match(/\/(\d+)\//);
        return matches ? parseInt(matches[1]) : null;
    }

    clearCache() {
        cacheManager.clear();
    }
}

export default new PokeAPIService();