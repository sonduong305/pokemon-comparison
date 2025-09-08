export class PokemonCard {
    constructor(pokemon, onRemove) {
        this.pokemon = pokemon;
        this.onRemove = onRemove;
    }

    render() {
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.style.setProperty('--type-color', this.pokemon.getTypeColor());
        
        card.innerHTML = `
            <button class="remove-btn" aria-label="Remove ${this.pokemon.formattedName}">×</button>
            <div class="pokemon-image">
                <img src="${this.pokemon.sprite}" alt="${this.pokemon.formattedName}" loading="lazy">
            </div>
            <div class="pokemon-info">
                <h3 class="pokemon-name">
                    ${this.pokemon.formattedName}
                    <span class="pokemon-id">#${String(this.pokemon.id).padStart(3, '0')}</span>
                </h3>
                <div class="pokemon-types">
                    ${this.pokemon.types.map(type => 
                        `<span class="type-badge type-${type}">${type}</span>`
                    ).join('')}
                </div>
                <div class="pokemon-stats">
                    <div class="stat-item">
                        <span class="stat-label">Height:</span>
                        <span class="stat-value">${this.pokemon.heightDisplay.metric}</span>
                        <span class="stat-alt">(${this.pokemon.heightDisplay.imperial})</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Weight:</span>
                        <span class="stat-value">${this.pokemon.weightDisplay.metric}</span>
                        <span class="stat-alt">(${this.pokemon.weightDisplay.imperial})</span>
                    </div>
                </div>
            </div>
        `;

        card.querySelector('.remove-btn').addEventListener('click', () => {
            this.onRemove(this.pokemon.id);
        });

        return card;
    }

    update(pokemon) {
        this.pokemon = pokemon;
        return this.render();
    }
}