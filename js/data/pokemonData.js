class PokemonDataService {
    constructor() {
        this.pokemonList = null;
        this.loadPromise = null;
    }

    async loadPokemonList() {
        if (this.pokemonList) {
            return this.pokemonList;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = fetch('./data/pokemon-list.json')
            .then(response => response.json())
            .then(data => {
                this.pokemonList = data.pokemon;
                return this.pokemonList;
            })
            .catch(error => {
                console.error('Failed to load Pokemon list:', error);
                this.pokemonList = [];
                return this.pokemonList;
            });

        return this.loadPromise;
    }

    async searchPokemon(query) {
        const list = await this.loadPokemonList();
        
        if (!query || query.length < 1) {
            return [];
        }

        const lowerQuery = query.toLowerCase();
        
        // First, try exact match or ID match
        const exactMatches = list.filter(pokemon => 
            pokemon.name.toLowerCase() === lowerQuery ||
            pokemon.id.toString() === query
        );

        if (exactMatches.length > 0) {
            return exactMatches.slice(0, 10);
        }

        // Then, try starts with
        const startsWithMatches = list.filter(pokemon =>
            pokemon.name.toLowerCase().startsWith(lowerQuery)
        );

        if (startsWithMatches.length >= 5) {
            return startsWithMatches.slice(0, 10);
        }

        // Finally, try contains
        const containsMatches = list.filter(pokemon =>
            pokemon.name.toLowerCase().includes(lowerQuery)
        );

        // Combine and deduplicate
        const combined = [...new Set([...startsWithMatches, ...containsMatches])];
        return combined.slice(0, 10);
    }

    async getPokemonByNameOrId(nameOrId) {
        const list = await this.loadPokemonList();
        
        const lowerQuery = nameOrId.toString().toLowerCase();
        
        return list.find(pokemon => 
            pokemon.name.toLowerCase() === lowerQuery ||
            pokemon.id.toString() === nameOrId.toString()
        );
    }

    formatPokemonName(name) {
        // Handle special cases like "mr-mime" -> "Mr. Mime"
        return name.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

export default new PokemonDataService();