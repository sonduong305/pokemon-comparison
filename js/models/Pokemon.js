export class Pokemon {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.heightInMeters = data.height;
        this.weightInKg = data.weight;
        this.types = data.types || [];
        this.sprite = data.sprite;
        this.animatedSprite = data.animatedSprite;
        this.stats = data.stats || {};
    }

    get formattedName() {
        return this.name.charAt(0).toUpperCase() + this.name.slice(1);
    }

    get heightInFeet() {
        return this.heightInMeters * 3.28084;
    }

    get weightInLbs() {
        return this.weightInKg * 2.20462;
    }

    get heightDisplay() {
        const feet = Math.floor(this.heightInFeet);
        const inches = Math.round((this.heightInFeet - feet) * 12);
        return {
            metric: `${this.heightInMeters.toFixed(1)}m`,
            imperial: `${feet}'${inches}"`,
            raw: this.heightInMeters
        };
    }

    get weightDisplay() {
        return {
            metric: `${this.weightInKg.toFixed(1)}kg`,
            imperial: `${this.weightInLbs.toFixed(1)}lbs`,
            raw: this.weightInKg
        };
    }

    getTypeColor() {
        const typeColors = {
            normal: '#A8A878',
            fighting: '#C03028',
            flying: '#A890F0',
            poison: '#A040A0',
            ground: '#E0C068',
            rock: '#B8A038',
            bug: '#A8B820',
            ghost: '#705898',
            steel: '#B8B8D0',
            fire: '#F08030',
            water: '#6890F0',
            grass: '#78C850',
            electric: '#F8D030',
            psychic: '#F85888',
            ice: '#98D8D8',
            dragon: '#7038F8',
            dark: '#705848',
            fairy: '#EE99AC'
        };

        return typeColors[this.types[0]] || '#68A090';
    }

    compareHeight(otherPokemon) {
        return this.heightInMeters - otherPokemon.heightInMeters;
    }

    compareWeight(otherPokemon) {
        return this.weightInKg - otherPokemon.weightInKg;
    }

    getScalePercentage(maxValue, property = 'height') {
        const value = property === 'height' ? this.heightInMeters : this.weightInKg;
        return (value / maxValue) * 100;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            height: this.heightInMeters,
            weight: this.weightInKg,
            types: this.types,
            sprite: this.sprite,
            animatedSprite: this.animatedSprite,
            stats: this.stats
        };
    }

    static fromJSON(json) {
        return new Pokemon(json);
    }
}