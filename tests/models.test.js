import { jest } from '@jest/globals';
import { Pokemon } from '../js/models/Pokemon.js';

describe('Pokemon Model', () => {
    let pokemon;

    beforeEach(() => {
        pokemon = new Pokemon({
            id: 25,
            name: 'pikachu',
            height: 0.4,
            weight: 6,
            types: ['electric'],
            sprite: 'sprite.png',
            animatedSprite: 'animated.gif',
            stats: { hp: 35, attack: 55 }
        });
    });

    describe('Basic properties', () => {
        it('should initialize with correct properties', () => {
            expect(pokemon.id).toBe(25);
            expect(pokemon.name).toBe('pikachu');
            expect(pokemon.heightInMeters).toBe(0.4);
            expect(pokemon.weightInKg).toBe(6);
            expect(pokemon.types).toEqual(['electric']);
            expect(pokemon.sprite).toBe('sprite.png');
            expect(pokemon.animatedSprite).toBe('animated.gif');
            expect(pokemon.stats).toEqual({ hp: 35, attack: 55 });
        });

        it('should format name correctly', () => {
            expect(pokemon.formattedName).toBe('Pikachu');
        });
    });

    describe('Unit conversions', () => {
        it('should convert height to feet correctly', () => {
            expect(pokemon.heightInFeet).toBeCloseTo(1.312, 2);
        });

        it('should convert weight to pounds correctly', () => {
            expect(pokemon.weightInLbs).toBeCloseTo(13.228, 2);
        });

        it('should display height in both units', () => {
            const display = pokemon.heightDisplay;
            expect(display.metric).toBe('0.4m');
            expect(display.imperial).toBe('1\'4"');
            expect(display.raw).toBe(0.4);
        });

        it('should display weight in both units', () => {
            const display = pokemon.weightDisplay;
            expect(display.metric).toBe('6.0kg');
            expect(display.imperial).toBe('13.2lbs');
            expect(display.raw).toBe(6);
        });

        it('should handle large Pokemon sizes', () => {
            const largePokemon = new Pokemon({
                id: 384,
                name: 'rayquaza',
                height: 7,
                weight: 206.5,
                types: ['dragon', 'flying']
            });

            expect(largePokemon.heightDisplay.metric).toBe('7.0m');
            expect(largePokemon.heightDisplay.imperial).toBe('22\'12"');
            expect(largePokemon.weightDisplay.metric).toBe('206.5kg');
            expect(largePokemon.weightDisplay.imperial).toBe('455.3lbs');
        });
    });

    describe('Type colors', () => {
        it('should return correct color for electric type', () => {
            expect(pokemon.getTypeColor()).toBe('#F8D030');
        });

        it('should return correct color for water type', () => {
            const waterPokemon = new Pokemon({
                id: 7,
                name: 'squirtle',
                height: 0.5,
                weight: 9,
                types: ['water']
            });
            expect(waterPokemon.getTypeColor()).toBe('#6890F0');
        });

        it('should return default color for unknown type', () => {
            const unknownPokemon = new Pokemon({
                id: 999,
                name: 'unknown',
                height: 1,
                weight: 1,
                types: ['unknown']
            });
            expect(unknownPokemon.getTypeColor()).toBe('#68A090');
        });

        it('should use first type for dual-type Pokemon', () => {
            const dualTypePokemon = new Pokemon({
                id: 6,
                name: 'charizard',
                height: 1.7,
                weight: 90.5,
                types: ['fire', 'flying']
            });
            expect(dualTypePokemon.getTypeColor()).toBe('#F08030');
        });
    });

    describe('Comparison methods', () => {
        let otherPokemon;

        beforeEach(() => {
            otherPokemon = new Pokemon({
                id: 1,
                name: 'bulbasaur',
                height: 0.7,
                weight: 6.9,
                types: ['grass', 'poison']
            });
        });

        it('should compare height correctly', () => {
            expect(pokemon.compareHeight(otherPokemon)).toBeCloseTo(-0.3, 5);
            expect(otherPokemon.compareHeight(pokemon)).toBeCloseTo(0.3, 5);
        });

        it('should compare weight correctly', () => {
            expect(pokemon.compareWeight(otherPokemon)).toBeCloseTo(-0.9, 1);
            expect(otherPokemon.compareWeight(pokemon)).toBeCloseTo(0.9, 1);
        });

        it('should calculate scale percentage for height', () => {
            const percentage = pokemon.getScalePercentage(2, 'height');
            expect(percentage).toBe(20);
        });

        it('should calculate scale percentage for weight', () => {
            const percentage = pokemon.getScalePercentage(10, 'weight');
            expect(percentage).toBe(60);
        });
    });

    describe('Serialization', () => {
        it('should serialize to JSON correctly', () => {
            const json = pokemon.toJSON();
            expect(json).toEqual({
                id: 25,
                name: 'pikachu',
                height: 0.4,
                weight: 6,
                types: ['electric'],
                sprite: 'sprite.png',
                animatedSprite: 'animated.gif',
                stats: { hp: 35, attack: 55 }
            });
        });

        it('should deserialize from JSON correctly', () => {
            const json = {
                id: 150,
                name: 'mewtwo',
                height: 2,
                weight: 122,
                types: ['psychic'],
                sprite: 'mewtwo.png',
                animatedSprite: null,
                stats: { hp: 106, attack: 110 }
            };

            const mewtwo = Pokemon.fromJSON(json);
            expect(mewtwo.id).toBe(150);
            expect(mewtwo.name).toBe('mewtwo');
            expect(mewtwo.heightInMeters).toBe(2);
            expect(mewtwo.weightInKg).toBe(122);
            expect(mewtwo.formattedName).toBe('Mewtwo');
        });
    });
});