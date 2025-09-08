export const SizeConverter = {
    metersToFeet(meters) {
        return meters * 3.28084;
    },

    feetToMeters(feet) {
        return feet / 3.28084;
    },

    kgToLbs(kg) {
        return kg * 2.20462;
    },

    lbsToKg(lbs) {
        return lbs / 2.20462;
    },

    formatHeight(meters, unit = 'metric') {
        if (unit === 'metric') {
            return `${meters.toFixed(1)}m`;
        } else {
            const totalFeet = this.metersToFeet(meters);
            const feet = Math.floor(totalFeet);
            const inches = Math.round((totalFeet - feet) * 12);
            return `${feet}'${inches}"`;
        }
    },

    formatWeight(kg, unit = 'metric') {
        if (unit === 'metric') {
            return `${kg.toFixed(1)}kg`;
        } else {
            return `${this.kgToLbs(kg).toFixed(1)}lbs`;
        }
    },

    getHumanScale() {
        return {
            height: 1.7,
            weight: 70,
            name: 'Trainer (1.7m)',
            sprite: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgNDAgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8IS0tIFNpbXBsZSBibGFjayBzaWxob3VldHRlIG9mIGEgcGVyc29uIC0tPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjEyIiByPSI4IiBmaWxsPSIjMDAwIi8+CjxyZWN0IHg9IjE1IiB5PSIyMCIgd2lkdGg9IjEwIiBoZWlnaHQ9IjI1IiByeD0iMiIgZmlsbD0iIzAwMCIvPgo8cmVjdCB4PSI5IiB5PSIyNSIgd2lkdGg9IjUiIGhlaWdodD0iMjAiIHJ4PSIyIiBmaWxsPSIjMDAwIi8+CjxyZWN0IHg9IjI2IiB5PSIyNSIgd2lkdGg9IjUiIGhlaWdodD0iMjAiIHJ4PSIyIiBmaWxsPSIjMDAwIi8+CjxyZWN0IHg9IjE2IiB5PSI0NSIgd2lkdGg9IjQiIGhlaWdodD0iNTIiIHJ4PSIyIiBmaWxsPSIjMDAwIi8+CjxyZWN0IHg9IjIwIiB5PSI0NSIgd2lkdGg9IjQiIGhlaWdodD0iNTIiIHJ4PSIyIiBmaWxsPSIjMDAwIi8+Cjwvc3ZnPg=='
        };
    },

    calculateScale(pokemonList, includeHuman = false) {
        const items = [...pokemonList];
        
        if (includeHuman) {
            items.push(this.getHumanScale());
        }

        const maxHeight = Math.max(...items.map(p => p.height || p.heightInMeters));
        const maxWeight = Math.max(...items.map(p => p.weight || p.weightInKg));

        return {
            maxHeight,
            maxWeight,
            heightScale: 100 / maxHeight,
            weightScale: 100 / maxWeight
        };
    }
};

export default SizeConverter;