import { jest } from '@jest/globals';
import { SizeConverter } from '../js/utils/sizeConverter.js';
import { CacheManager } from '../js/utils/cache.js';

describe('SizeConverter', () => {
    describe('Unit conversions', () => {
        it('should convert meters to feet', () => {
            expect(SizeConverter.metersToFeet(1)).toBeCloseTo(3.28084, 4);
            expect(SizeConverter.metersToFeet(1.7)).toBeCloseTo(5.577, 2);
        });

        it('should convert feet to meters', () => {
            expect(SizeConverter.feetToMeters(3.28084)).toBeCloseTo(1, 4);
            expect(SizeConverter.feetToMeters(6)).toBeCloseTo(1.829, 2);
        });

        it('should convert kg to lbs', () => {
            expect(SizeConverter.kgToLbs(1)).toBeCloseTo(2.20462, 4);
            expect(SizeConverter.kgToLbs(70)).toBeCloseTo(154.324, 2);
        });

        it('should convert lbs to kg', () => {
            expect(SizeConverter.lbsToKg(2.20462)).toBeCloseTo(1, 4);
            expect(SizeConverter.lbsToKg(150)).toBeCloseTo(68.039, 2);
        });
    });

    describe('Formatting', () => {
        it('should format height in metric', () => {
            expect(SizeConverter.formatHeight(1.75, 'metric')).toBe('1.8m');
            expect(SizeConverter.formatHeight(0.4, 'metric')).toBe('0.4m');
        });

        it('should format height in imperial', () => {
            expect(SizeConverter.formatHeight(1.75, 'imperial')).toBe('5\'9"');
            expect(SizeConverter.formatHeight(0.4, 'imperial')).toBe('1\'4"');
        });

        it('should format weight in metric', () => {
            expect(SizeConverter.formatWeight(70.5, 'metric')).toBe('70.5kg');
            expect(SizeConverter.formatWeight(6, 'metric')).toBe('6.0kg');
        });

        it('should format weight in imperial', () => {
            expect(SizeConverter.formatWeight(70, 'imperial')).toBe('154.3lbs');
            expect(SizeConverter.formatWeight(6, 'imperial')).toBe('13.2lbs');
        });
    });

    describe('Human scale', () => {
        it('should return human scale data', () => {
            const human = SizeConverter.getHumanScale();
            expect(human.height).toBe(1.7);
            expect(human.weight).toBe(70);
            expect(human.name).toBe('Average Human');
            expect(human.sprite).toContain('data:image/svg+xml');
        });
    });

    describe('Scale calculation', () => {
        it('should calculate scale without human', () => {
            const pokemonList = [
                { heightInMeters: 0.4, weightInKg: 6 },
                { heightInMeters: 1.7, weightInKg: 90.5 },
                { heightInMeters: 0.7, weightInKg: 6.9 }
            ];

            const scale = SizeConverter.calculateScale(pokemonList, false);
            expect(scale.maxHeight).toBe(1.7);
            expect(scale.maxWeight).toBe(90.5);
            expect(scale.heightScale).toBeCloseTo(58.82, 1);
            expect(scale.weightScale).toBeCloseTo(1.10, 1);
        });

        it('should calculate scale with human', () => {
            const pokemonList = [
                { heightInMeters: 0.4, weightInKg: 6 },
                { heightInMeters: 0.7, weightInKg: 6.9 }
            ];

            const scale = SizeConverter.calculateScale(pokemonList, true);
            expect(scale.maxHeight).toBe(1.7);
            expect(scale.maxWeight).toBe(70);
            expect(scale.heightScale).toBeCloseTo(58.82, 1);
            expect(scale.weightScale).toBeCloseTo(1.43, 1);
        });

        it('should handle empty list', () => {
            const scale = SizeConverter.calculateScale([], false);
            expect(scale.maxHeight).toBe(-Infinity);
            expect(scale.maxWeight).toBe(-Infinity);
        });
    });
});

describe('CacheManager', () => {
    let cache;

    beforeEach(() => {
        localStorage.clear();
        cache = new CacheManager('test-cache', 1000);
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Basic operations', () => {
        it('should store and retrieve data', () => {
            const data = { id: 1, name: 'pikachu' };
            cache.set('test-key', data);
            
            const retrieved = cache.get('test-key');
            expect(retrieved).toEqual(data);
        });

        it('should return null for non-existent key', () => {
            expect(cache.get('non-existent')).toBeNull();
        });

        it('should remove data', () => {
            cache.set('test-key', { value: 'test' });
            cache.remove('test-key');
            expect(cache.get('test-key')).toBeNull();
        });

        it('should clear all data', () => {
            cache.set('key1', { value: 1 });
            cache.set('key2', { value: 2 });
            cache.clear();
            
            expect(cache.get('key1')).toBeNull();
            expect(cache.get('key2')).toBeNull();
        });
    });

    describe('Expiration', () => {
        it('should expire old data', (done) => {
            const shortCache = new CacheManager('short-cache', 100);
            shortCache.set('test-key', { value: 'test' });
            
            setTimeout(() => {
                expect(shortCache.get('test-key')).toBeNull();
                done();
            }, 150);
        });

        it('should not return expired data from storage', () => {
            const expiredItem = {
                data: { value: 'old' },
                timestamp: Date.now() - 2000
            };
            
            localStorage.setItem('test-cache', JSON.stringify({
                'expired-key': expiredItem
            }));
            
            expect(cache.get('expired-key')).toBeNull();
        });
    });

    describe('Storage interaction', () => {
        it('should persist to localStorage', () => {
            cache.set('persist-key', { value: 'persistent' });
            
            const stored = JSON.parse(localStorage.getItem('test-cache'));
            expect(stored['persist-key'].data).toEqual({ value: 'persistent' });
        });

        it('should load from localStorage', () => {
            const data = {
                'stored-key': {
                    data: { value: 'stored' },
                    timestamp: Date.now()
                }
            };
            localStorage.setItem('test-cache', JSON.stringify(data));
            
            const newCache = new CacheManager('test-cache', 1000);
            expect(newCache.get('stored-key')).toEqual({ value: 'stored' });
        });

        it('should handle localStorage errors gracefully', () => {
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = jest.fn(() => {
                throw new Error('Storage error');
            });
            
            expect(() => {
                cache.set('error-key', { value: 'test' });
            }).not.toThrow();
            
            Storage.prototype.setItem = originalSetItem;
        });
    });

    describe('Cache management', () => {
        it('should report cache size', () => {
            cache.set('key1', { value: 1 });
            cache.set('key2', { value: 2 });
            
            expect(cache.getCacheSize()).toBe(2);
            expect(cache.getMemoryCacheSize()).toBe(2);
        });

        it('should clear oldest entries on quota exceeded', () => {
            const originalSetItem = Storage.prototype.setItem;
            let callCount = 0;
            
            Storage.prototype.setItem = jest.fn((key, value) => {
                callCount++;
                if (callCount === 1) {
                    const error = new Error('QuotaExceededError');
                    error.name = 'QuotaExceededError';
                    throw error;
                }
                originalSetItem.call(localStorage, key, value);
            });
            
            for (let i = 0; i < 5; i++) {
                cache.set(`key${i}`, { value: i });
            }
            
            cache.set('new-key', { value: 'new' });
            
            expect(cache.get('new-key')).toEqual({ value: 'new' });
            
            Storage.prototype.setItem = originalSetItem;
        });
    });
});