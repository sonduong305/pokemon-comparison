import pokeAPIService from '../api/pokeapi.js';

export class SearchBar {
    constructor(onPokemonSelect) {
        this.onPokemonSelect = onPokemonSelect;
        this.searchInput = document.getElementById('pokemon-search');
        this.suggestionsContainer = document.getElementById('search-suggestions');
        this.addButton = document.getElementById('add-pokemon');
        this.debounceTimer = null;
        
        this.init();
    }

    init() {
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        this.searchInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.addButton.addEventListener('click', () => this.handleAddPokemon());
        
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.suggestionsContainer.contains(e.target)) {
                this.hideSuggestions();
            }
        });
    }

    async handleSearch(event) {
        const query = event.target.value.trim();
        
        clearTimeout(this.debounceTimer);
        
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        this.debounceTimer = setTimeout(async () => {
            const suggestions = await pokeAPIService.searchPokemon(query);
            this.displaySuggestions(suggestions);
        }, 300);
    }

    displaySuggestions(suggestions) {
        if (suggestions.length === 0) {
            this.suggestionsContainer.innerHTML = '<div class="no-results">No Pokemon found</div>';
            this.suggestionsContainer.classList.add('active');
            return;
        }

        const html = suggestions.map((pokemon, index) => `
            <div class="suggestion-item" data-name="${pokemon.name}" data-index="${index}">
                <span class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</span>
                <span class="pokemon-name">${this.capitalize(pokemon.name)}</span>
            </div>
        `).join('');

        this.suggestionsContainer.innerHTML = html;
        this.suggestionsContainer.classList.add('active');
        
        this.suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSuggestion(item.dataset.name);
            });
        });
    }

    selectSuggestion(name) {
        this.searchInput.value = name;
        this.hideSuggestions();
        this.searchInput.focus();
    }

    hideSuggestions() {
        this.suggestionsContainer.classList.remove('active');
        this.suggestionsContainer.innerHTML = '';
    }

    async handleAddPokemon() {
        const query = this.searchInput.value.trim();
        
        if (!query) {
            this.showError('Please enter a Pokemon name or ID');
            return;
        }

        try {
            this.setLoading(true);
            await this.onPokemonSelect(query);
            this.searchInput.value = '';
            this.hideSuggestions();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.setLoading(false);
        }
    }

    handleKeyDown(event) {
        const suggestions = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (event.key === 'Enter') {
            event.preventDefault();
            const activeSuggestion = this.suggestionsContainer.querySelector('.suggestion-item.active');
            if (activeSuggestion) {
                this.selectSuggestion(activeSuggestion.dataset.name);
            } else {
                this.handleAddPokemon();
            }
        } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            this.navigateSuggestions(event.key === 'ArrowDown' ? 1 : -1, suggestions);
        } else if (event.key === 'Escape') {
            this.hideSuggestions();
        }
    }

    navigateSuggestions(direction, suggestions) {
        if (suggestions.length === 0) return;

        const currentActive = this.suggestionsContainer.querySelector('.suggestion-item.active');
        let nextIndex = 0;

        if (currentActive) {
            currentActive.classList.remove('active');
            const currentIndex = parseInt(currentActive.dataset.index);
            nextIndex = currentIndex + direction;
            
            if (nextIndex < 0) nextIndex = suggestions.length - 1;
            if (nextIndex >= suggestions.length) nextIndex = 0;
        }

        suggestions[nextIndex].classList.add('active');
    }

    showError(message) {
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 3000);
    }

    setLoading(isLoading) {
        const loadingElement = document.getElementById('loading');
        if (isLoading) {
            loadingElement.classList.remove('hidden');
            this.addButton.disabled = true;
        } else {
            loadingElement.classList.add('hidden');
            this.addButton.disabled = false;
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}