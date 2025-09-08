export class CacheManager {
    constructor(storageKey = 'pokemon-cache', maxAge = 3600000) {
        this.storageKey = storageKey;
        this.maxAge = maxAge;
        this.memoryCache = new Map();
    }

    get(key) {
        const memoryItem = this.memoryCache.get(key);
        if (memoryItem && !this.isExpired(memoryItem)) {
            return memoryItem.data;
        }

        const storageData = this.getFromStorage();
        const storageItem = storageData[key];
        
        if (storageItem && !this.isExpired(storageItem)) {
            this.memoryCache.set(key, storageItem);
            return storageItem.data;
        }

        if (storageItem) {
            this.remove(key);
        }

        return null;
    }

    set(key, data) {
        const item = {
            data,
            timestamp: Date.now()
        };

        this.memoryCache.set(key, item);
        
        const storageData = this.getFromStorage();
        storageData[key] = item;
        this.saveToStorage(storageData);
    }

    remove(key) {
        this.memoryCache.delete(key);
        
        const storageData = this.getFromStorage();
        delete storageData[key];
        this.saveToStorage(storageData);
    }

    clear() {
        this.memoryCache.clear();
        localStorage.removeItem(this.storageKey);
    }

    isExpired(item) {
        return Date.now() - item.timestamp > this.maxAge;
    }

    getFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return {};
        }
    }

    saveToStorage(data) {
        try {
            const validData = {};
            for (const [key, item] of Object.entries(data)) {
                if (!this.isExpired(item)) {
                    validData[key] = item;
                }
            }
            localStorage.setItem(this.storageKey, JSON.stringify(validData));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            
            if (error.name === 'QuotaExceededError') {
                this.clearOldest();
                try {
                    localStorage.setItem(this.storageKey, JSON.stringify(data));
                } catch (retryError) {
                    console.error('Still cannot save after clearing old entries:', retryError);
                }
            }
        }
    }

    clearOldest() {
        const storageData = this.getFromStorage();
        const entries = Object.entries(storageData);
        
        if (entries.length === 0) return;
        
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        
        const toRemove = Math.ceil(entries.length * 0.3);
        for (let i = 0; i < toRemove; i++) {
            delete storageData[entries[i][0]];
        }
        
        localStorage.setItem(this.storageKey, JSON.stringify(storageData));
    }

    getCacheSize() {
        const storageData = this.getFromStorage();
        return Object.keys(storageData).length;
    }

    getMemoryCacheSize() {
        return this.memoryCache.size;
    }
}

export default new CacheManager();