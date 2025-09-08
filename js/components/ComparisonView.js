import SizeConverter from '../utils/sizeConverter.js';

export class ComparisonView {
    constructor() {
        this.container = document.getElementById('comparison-view');
        this.comparisonType = 'visual'; // Default to visual as it's checked in HTML
        this.showHuman = false;
        this.pokemonList = [];
        
        this.init();
    }

    init() {
        // Get the initial checked value
        const checkedRadio = document.querySelector('input[name="comparison-type"]:checked');
        if (checkedRadio) {
            this.comparisonType = checkedRadio.value;
        }
        
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
        
        // Initial render
        this.render();
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

    async renderVisualComparison() {
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
            getTypeColor: () => '#999999',
            isProcessed: true // Trainer sprite doesn't need processing
        };

        // Find the tallest item (including trainer) to use as reference
        const allItems = [...pokemonOnly, trainer];
        const actualMaxHeight = Math.max(...allItems.map(p => p.heightInMeters || p.height || 0));
        
        // Ensure the scale shows at least 6 meters for better visibility
        const minHeightInMeters = 6;
        const maxHeight = Math.max(actualMaxHeight, minHeightInMeters);
        
        // Get the container height to fit the visual stage properly
        const containerHeight = this.container.offsetHeight - 100; // Subtract legend height
        const minStageHeight = 400;
        const stageHeight = Math.max(containerHeight, minStageHeight);

        // Sort Pokemon by height (tallest first for z-index ordering)
        const sortedPokemon = [...pokemonOnly].sort((a, b) => {
            const aHeight = a.heightInMeters || a.height || 0;
            const bHeight = b.heightInMeters || b.height || 0;
            return bHeight - aHeight;
        });
        
        const html = `
            <div class="visual-comparison">
                <div class="visual-stage-container">
                    <div class="height-scale">
                        ${this.renderHeightMarkers(maxHeight, stageHeight)}
                    </div>
                    <div class="visual-stage" id="visual-stage">
                        ${this.renderGridLines(maxHeight, stageHeight)}
                        ${this.renderVisualSprite(trainer, maxHeight, stageHeight, 1000)}
                        ${sortedPokemon.map((item, index) => 
                            this.renderVisualSprite(item, maxHeight, stageHeight, 999 - index)
                        ).join('')}
                    </div>
                </div>
                <div class="visual-legend">
                    <h3>Visual Size Comparison</h3>
                    <p class="visual-note">Sprites are scaled relative to their actual heights (Trainer = 1.7m)</p>
                </div>
            </div>
        `;

        this.container.innerHTML = html;

        // Process sprites after rendering to detect and adjust for white space
        setTimeout(() => {
            this.processSpriteBounds();
        }, 100);

        // Animate sprites appearing
        setTimeout(() => {
            this.container.querySelectorAll('.visual-pokemon').forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('animate-in');
                }, index * 100);
            });
        }, 10);
    }

    processSpriteBounds() {
        const stage = document.getElementById('visual-stage');
        if (!stage) return;

        const sprites = stage.querySelectorAll('.scaled-sprite:not(.human-sprite .scaled-sprite)');
        
        sprites.forEach(img => {
            // Create a canvas to analyze the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            img.onload = function() {
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                
                try {
                    // Try to draw and analyze (will fail for CORS)
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const bounds = ComparisonView.findContentBounds(imageData);
                    
                    if (bounds) {
                        // Calculate crop percentages
                        const topCrop = bounds.top / canvas.height;
                        const bottomCrop = (canvas.height - bounds.bottom) / canvas.height;
                        
                        // Apply CSS clipping
                        img.style.clipPath = `inset(${topCrop * 100}% 0 ${bottomCrop * 100}% 0)`;
                        img.style.marginTop = `-${topCrop * 100}%`;
                        img.style.marginBottom = `-${bottomCrop * 100}%`;
                    }
                } catch (e) {
                    // CORS error - use CSS fallback
                    console.log('Using CSS fallback for sprite alignment');
                }
            };
            
            // Trigger load if image is already loaded
            if (img.complete) {
                img.onload();
            }
        });
    }

    static findContentBounds(imageData) {
        const pixels = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        let top = height;
        let bottom = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4;
                const alpha = pixels[idx + 3];
                
                // Check if pixel is not transparent
                if (alpha > 10) {
                    top = Math.min(top, y);
                    bottom = Math.max(bottom, y);
                }
            }
        }
        
        if (top > bottom) return null;
        
        return { top, bottom };
    }

    renderVisualSprite(item, maxHeight, stageHeight, zIndex = 2) {
        const height = item.heightInMeters || item.height || 0;
        const pixelsPerMeter = stageHeight / (maxHeight * 1.1); // Account for padding
        // Calculate sprite height based on actual height in meters
        const spriteHeight = Math.round(height * pixelsPerMeter);
        const isHuman = item.id === 'human';

        // Add margin for human trainer
        const marginStyle = isHuman ? 'margin-right: 20px;' : '';

        // Use a container div for proper alignment
        return `
            <div class="visual-pokemon ${isHuman ? 'human-sprite' : ''}" 
                 style="--sprite-height: ${spriteHeight}px; z-index: ${zIndex}; ${marginStyle}"
                 title="${item.formattedName || item.name} - ${SizeConverter.formatHeight(height, 'metric')}">
                <img src="${item.sprite}" 
                     alt="${item.formattedName || item.name}" 
                     class="scaled-sprite ${isHuman ? '' : 'pokemon-sprite'}"
                     style="height: ${spriteHeight}px; width: auto;"
                     data-pokemon-id="${item.id}">
            </div>
        `;
    }

    renderGridLines(maxHeight, stageHeight) {
        const gridLines = [];
        const pixelsPerMeter = stageHeight / (maxHeight * 1.1); // Account for padding
        
        // Determine appropriate step size based on max height
        let step;
        if (maxHeight <= 2) {
            step = 0.5;
        } else if (maxHeight <= 5) {
            step = 1;
        } else if (maxHeight <= 10) {
            step = 2;
        } else if (maxHeight <= 20) {
            step = 5;
        } else {
            step = 10;
        }
        
        // Generate grid lines from step to max height (skip 0 as that's the ground)
        const maxMarker = Math.ceil(maxHeight / step) * step;
        
        for (let i = step; i <= maxMarker; i += step) {
            // Don't show lines above the actual max height
            if (i > maxHeight) break;
            
            // Calculate pixel position from bottom using pixels per meter
            const pixelPosition = i * pixelsPerMeter;
            
            gridLines.push(`
                <div class="stage-grid-line" style="bottom: ${pixelPosition}px"></div>
            `);
        }
        
        return gridLines.join('');
    }

    renderHeightMarkers(maxHeight, stageHeight) {
        const markers = [];
        const pixelsPerMeter = stageHeight / (maxHeight * 1.1); // Account for padding
        
        // Determine appropriate step size based on max height
        let step;
        if (maxHeight <= 2) {
            step = 0.5;
        } else if (maxHeight <= 5) {
            step = 1;
        } else if (maxHeight <= 10) {
            step = 2;
        } else if (maxHeight <= 20) {
            step = 5;
        } else {
            step = 10;
        }
        
        // Generate markers from 0 to max height
        const maxMarker = Math.ceil(maxHeight / step) * step;
        
        for (let i = 0; i <= maxMarker; i += step) {
            // Don't show markers above the actual max height
            if (i > maxHeight) break;
            
            // Calculate pixel position from bottom using pixels per meter
            const pixelPosition = i * pixelsPerMeter;
            
            markers.push(`
                <div class="height-scale-marker" style="bottom: ${pixelPosition}px">
                    <span class="scale-label">${i}m</span>
                    <div class="scale-line"></div>
                </div>
            `);
        }
        
        return markers.join('');
    }

}