import SizeConverter from '../utils/sizeConverter.js';

export class ComparisonView {
    constructor() {
        this.container = document.getElementById('comparison-view');
        this.comparisonType = 'height';
        this.showHuman = false;
        this.pokemonList = [];
        
        this.init();
    }

    init() {
        document.querySelectorAll('input[name="comparison-type"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.comparisonType = e.target.value;
                this.render();
            });
        });

        document.getElementById('show-human-scale').addEventListener('change', (e) => {
            this.showHuman = e.target.checked;
            this.render();
        });
    }

    updatePokemonList(pokemonList) {
        this.pokemonList = pokemonList;
        this.render();
    }

    render() {
        if (this.pokemonList.length === 0) {
            this.container.innerHTML = '<div class="empty-state">Add Pokemon to start comparing sizes</div>';
            return;
        }

        if (this.comparisonType === 'visual') {
            this.renderVisualComparison();
            return;
        }

        const items = [...this.pokemonList];
        
        if (this.showHuman) {
            const humanScale = SizeConverter.getHumanScale();
            items.push({
                id: 'human',
                name: humanScale.name,
                formattedName: humanScale.name,
                heightInMeters: humanScale.height,
                weightInKg: humanScale.weight,
                sprite: humanScale.sprite,
                getTypeColor: () => '#999999'
            });
        }

        const scale = SizeConverter.calculateScale(items, false);
        const maxValue = this.comparisonType === 'height' ? scale.maxHeight : scale.maxWeight;

        const sortedItems = [...items].sort((a, b) => {
            const aValue = this.comparisonType === 'height' ? 
                (a.heightInMeters || a.height) : (a.weightInKg || a.weight);
            const bValue = this.comparisonType === 'height' ? 
                (b.heightInMeters || b.height) : (b.weightInKg || b.weight);
            return bValue - aValue;
        });

        const html = `
            <div class="comparison-chart">
                <div class="chart-grid">
                    ${this.renderGridLines()}
                </div>
                <div class="comparison-items">
                    ${sortedItems.map(item => this.renderComparisonItem(item, maxValue)).join('')}
                </div>
            </div>
            <div class="comparison-legend">
                <h3>${this.comparisonType === 'height' ? 'Height' : 'Weight'} Comparison</h3>
                <div class="legend-scale">
                    <span>0</span>
                    <span>${this.formatMaxValue(maxValue)}</span>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        
        setTimeout(() => {
            this.container.querySelectorAll('.comparison-item').forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate-in');
                }, index * 50);
            });
        }, 10);
    }

    renderComparisonItem(item, maxValue) {
        const value = this.comparisonType === 'height' ? 
            (item.heightInMeters || item.height) : 
            (item.weightInKg || item.weight);
        const percentage = (value / maxValue) * 100;
        const isHuman = item.id === 'human';

        const displayValue = this.comparisonType === 'height' ?
            SizeConverter.formatHeight(value, 'metric') :
            SizeConverter.formatWeight(value, 'metric');

        const altValue = this.comparisonType === 'height' ?
            SizeConverter.formatHeight(value, 'imperial') :
            SizeConverter.formatWeight(value, 'imperial');

        return `
            <div class="comparison-item ${isHuman ? 'human-scale' : ''}" 
                 style="--bar-width: ${percentage}%; --type-color: ${item.getTypeColor ? item.getTypeColor() : '#999'}">
                <div class="item-info">
                    <img src="${item.sprite}" alt="${item.formattedName || item.name}" class="item-sprite">
                    <div class="item-details">
                        <span class="item-name">${item.formattedName || item.name}</span>
                        <span class="item-value">${displayValue} (${altValue})</span>
                    </div>
                </div>
                <div class="item-bar">
                    <div class="bar-fill"></div>
                    <span class="bar-label">${percentage.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    renderGridLines() {
        const lines = [];
        for (let i = 0; i <= 10; i++) {
            const percentage = i * 10;
            lines.push(`<div class="grid-line" style="left: ${percentage}%"></div>`);
        }
        return lines.join('');
    }

    formatMaxValue(value) {
        if (this.comparisonType === 'height') {
            return `${value.toFixed(1)}m`;
        } else {
            return `${value.toFixed(1)}kg`;
        }
    }

    renderVisualComparison() {
        const pokemonOnly = [...this.pokemonList];
        
        // Always add human trainer for scale in visual mode
        const humanScale = SizeConverter.getHumanScale();
        const trainer = {
            id: 'human',
            name: humanScale.name,
            formattedName: humanScale.name,
            heightInMeters: humanScale.height,
            weightInKg: humanScale.weight,
            sprite: humanScale.sprite,
            getTypeColor: () => '#999999'
        };

        // Find the tallest item (including trainer) to use as reference
        const allItems = [...pokemonOnly, trainer];
        const maxHeight = Math.max(...allItems.map(p => p.heightInMeters || p.height || 0));
        const baseSize = 250; // Maximum sprite height in pixels for tallest Pokemon

        // Sort Pokemon by height (but not the trainer)
        const sortedPokemon = [...pokemonOnly].sort((a, b) => {
            const aHeight = a.heightInMeters || a.height || 0;
            const bHeight = b.heightInMeters || b.height || 0;
            return bHeight - aHeight;
        });

        const html = `
            <div class="visual-comparison">
                <div class="visual-stage">
                    ${this.renderVisualSprite(trainer, maxHeight, baseSize)}
                    ${sortedPokemon.map(item => this.renderVisualSprite(item, maxHeight, baseSize)).join('')}
                </div>
                <div class="visual-legend">
                    <h3>Visual Size Comparison</h3>
                    <p class="visual-note">Sprites are scaled relative to their actual heights (Trainer = 1.7m)</p>
                    <div class="height-markers">
                        ${this.renderHeightMarkers(maxHeight)}
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // Animate sprites appearing
        setTimeout(() => {
            this.container.querySelectorAll('.visual-pokemon').forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate-in');
                }, index * 100);
            });
        }, 10);
    }

    renderVisualSprite(item, maxHeight, baseSize) {
        const height = item.heightInMeters || item.height || 0;
        const scale = height / maxHeight;
        // Scale properly - no minimum that distorts proportions
        const spriteHeight = Math.round(baseSize * scale);
        const isHuman = item.id === 'human';

        // Use a container div for proper alignment
        return `
            <div class="visual-pokemon ${isHuman ? 'human-sprite' : ''}" 
                 style="--sprite-height: ${spriteHeight}px"
                 title="${item.formattedName || item.name} - ${SizeConverter.formatHeight(height, 'metric')}">
                <div class="sprite-wrapper" style="height: ${spriteHeight}px; width: ${spriteHeight}px;">
                    <img src="${item.sprite}" 
                         alt="${item.formattedName || item.name}" 
                         class="scaled-sprite">
                </div>
            </div>
        `;
    }

    renderHeightMarkers(maxHeight) {
        const markers = [];
        const step = maxHeight > 10 ? 2 : maxHeight > 5 ? 1 : 0.5;
        
        for (let i = 0; i <= Math.ceil(maxHeight); i += step) {
            const percentage = (i / maxHeight) * 100;
            markers.push(`
                <div class="height-marker" style="bottom: ${percentage}%">
                    <span class="marker-label">${i}m</span>
                    <div class="marker-line"></div>
                </div>
            `);
        }
        
        return markers.join('');
    }
}