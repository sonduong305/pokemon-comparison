import pokeAPIService from './api/pokeapi.js';
import { Pokemon } from './models/Pokemon.js';
import { SearchBar } from './components/SearchBar.js';
import { PokemonCard } from './components/PokemonCard.js';
import { ComparisonView } from './components/ComparisonView.js';
import cacheManager from './utils/cache.js';

class PokemonComparisonApp {
    constructor() {
        this.pokemonList = [];
        this.searchBar = null;
        this.comparisonView = null;
        this.pokemonListContainer = document.getElementById('pokemon-list');
        
        this.init();
    }

    async init() {
        this.loadSavedPokemon();
        
        this.searchBar = new SearchBar(async (query) => {
            await this.addPokemon(query);
        });
        
        this.comparisonView = new ComparisonView();
        this.comparisonView.updatePokemonList(this.pokemonList);
        
        this.renderPokemonList();
        
        window.addEventListener('beforeunload', () => {
            this.savePokemonList();
        });
    }

    async addPokemon(nameOrId) {
        if (this.pokemonList.length >= 10) {
            throw new Error('Maximum 10 Pokemon can be compared at once');
        }

        const existingPokemon = this.pokemonList.find(p => 
            p.name === nameOrId.toLowerCase() || 
            p.id.toString() === nameOrId
        );

        if (existingPokemon) {
            throw new Error('This Pokemon is already in the comparison');
        }

        const pokemonData = await pokeAPIService.getPokemon(nameOrId);
        const pokemon = new Pokemon(pokemonData);
        
        this.pokemonList.push(pokemon);
        this.renderPokemonList();
        this.comparisonView.updatePokemonList(this.pokemonList);
        this.savePokemonList();
    }

    removePokemon(id) {
        this.pokemonList = this.pokemonList.filter(p => p.id !== id);
        this.renderPokemonList();
        this.comparisonView.updatePokemonList(this.pokemonList);
        this.savePokemonList();
    }

    renderPokemonList() {
        if (this.pokemonList.length === 0) {
            this.pokemonListContainer.innerHTML = '<div class="empty-state">No Pokemon selected. Search and add Pokemon to compare!</div>';
            return;
        }

        this.pokemonListContainer.innerHTML = '';
        
        this.pokemonList.forEach(pokemon => {
            const card = new PokemonCard(pokemon, (id) => this.removePokemon(id));
            this.pokemonListContainer.appendChild(card.render());
        });
    }

    savePokemonList() {
        try {
            const data = this.pokemonList.map(p => p.toJSON());
            localStorage.setItem('selected-pokemon', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving Pokemon list:', error);
        }
    }

    async loadSavedPokemon() {
        try {
            const saved = localStorage.getItem('selected-pokemon');
            if (!saved) return;

            const data = JSON.parse(saved);
            this.pokemonList = data.map(item => Pokemon.fromJSON(item));
            
            this.pokemonList = this.pokemonList.slice(0, 10);
        } catch (error) {
            console.error('Error loading saved Pokemon:', error);
            localStorage.removeItem('selected-pokemon');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PokemonComparisonApp();
});