import { jest } from '@jest/globals';
import { PokeAPIService } from '../js/api/pokeapi.js';

global.fetch = jest.fn();

describe('PokeAPIService', () => {
    let service;

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
        fetch.mockClear();
        service = new PokeAPIService();
        service.clearCache();
    });

    describe('getPokemon', () => {
        it('should fetch and transform Pokemon data correctly', async () => {
            const mockResponse = {
                id: 25,
                name: 'pikachu',
                height: 4,
                weight: 60,
                types: [{ type: { name: 'electric' } }],
                sprites: {
                    front_default: 'sprite.png',
                    other: {
                        'official-artwork': { front_default: 'artwork.png' },
                        showdown: { front_default: 'animated.gif' }
                    }
                },
                stats: [
                    { stat: { name: 'hp' }, base_stat: 35 },
                    { stat: { name: 'attack' }, base_stat: 55 }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await service.getPokemon('pikachu');

            expect(fetch).toHaveBeenCalledWith('https://pokeapi.co/api/v2/pokemon/pikachu');
            expect(result).toEqual({
                id: 25,
                name: 'pikachu',
                height: 0.4,
                weight: 6,
                types: ['electric'],
                sprite: 'artwork.png',
                animatedSprite: 'animated.gif',
                stats: { hp: 35, attack: 55 }
            });
        });

        it('should handle 404 errors correctly', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(service.getPokemon('fakemon')).rejects.toThrow('Pokemon "fakemon" not found');
        });

        it('should handle API errors correctly', async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            await expect(service.getPokemon('pikachu')).rejects.toThrow('API error: 500');
        });

        it('should handle network errors correctly', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(service.getPokemon('pikachu')).rejects.toThrow('Failed to fetch Pokemon: Network error');
        });

        it('should convert height and weight correctly', async () => {
            const mockResponse = {
                id: 1,
                name: 'bulbasaur',
                height: 7,
                weight: 69,
                types: [{ type: { name: 'grass' } }],
                sprites: {
                    front_default: 'sprite.png',
                    other: {
                        'official-artwork': { front_default: 'artwork.png' },
                        showdown: { front_default: null }
                    }
                },
                stats: []
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const result = await service.getPokemon('bulbasaur');

            expect(result.height).toBe(0.7);
            expect(result.weight).toBe(6.9);
        });
    });

    describe('searchPokemon', () => {
        it('should return filtered Pokemon results', async () => {
            const mockResponse = {
                results: [
                    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
                    { name: 'raichu', url: 'https://pokeapi.co/api/v2/pokemon/26/' },
                    { name: 'pikipek', url: 'https://pokeapi.co/api/v2/pokemon/731/' }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const results = await service.searchPokemon('pik');

            expect(results).toEqual([
                { name: 'pikachu', id: 25 },
                { name: 'pikipek', id: 731 }
            ]);
        });

        it('should return empty array for short queries', async () => {
            const results = await service.searchPokemon('p');
            expect(results).toEqual([]);
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should handle search by ID', async () => {
            const mockResponse = {
                results: [
                    { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
                    { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }
                ]
            };

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponse
            });

            const results = await service.searchPokemon('25');

            expect(results).toEqual([
                { name: 'pikachu', id: 25 }
            ]);
        });

        it('should limit results to 10', async () => {
            const mockResults = Array.from({ length: 20 }, (_, i) => ({
                name: `pokemon${i}`,
                url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`
            }));

            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ results: mockResults })
            });

            const results = await service.searchPokemon('pokemon');
            expect(results).toHaveLength(10);
        });

        it('should handle search errors gracefully', async () => {
            fetch.mockRejectedValueOnce(new Error('Network error'));

            const results = await service.searchPokemon('pikachu');
            expect(results).toEqual([]);
        });
    });

    describe('extractIdFromUrl', () => {
        it('should extract ID from Pokemon URL', () => {
            const id = service.extractIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/');
            expect(id).toBe(25);
        });

        it('should handle invalid URLs', () => {
            const id = service.extractIdFromUrl('invalid-url');
            expect(id).toBeNull();
        });
    });
});