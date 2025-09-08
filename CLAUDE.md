# Claude Development Guide

## Project Overview
Pokemon Size Comparison is a web application that allows users to visually compare the sizes of different Pokemon. It uses the PokeAPI to fetch Pokemon data and provides multiple visualization modes including bar charts and scaled sprite comparisons.

## Architecture

### Frontend-Only Application
- No backend required
- Uses PokeAPI (free, no authentication needed)
- LocalStorage for caching and persistence
- ES6 modules for code organization

### Key Features
1. **Pokemon Search**: Search by name or ID with autocomplete
2. **Size Comparisons**: Height, weight, and visual sprite comparisons
3. **Human Scale Reference**: Always shows trainer silhouette (1.7m) in visual mode
4. **Responsive Design**: Works on mobile and desktop
5. **Data Persistence**: Saves selected Pokemon between sessions

## Project Structure
```
pokemon-comparison/
├── index.html           # Main HTML entry point
├── css/
│   └── style.css       # All styling and animations
├── js/
│   ├── api/
│   │   └── pokeapi.js  # PokeAPI service with caching
│   ├── models/
│   │   └── Pokemon.js  # Pokemon data model
│   ├── components/
│   │   ├── PokemonCard.js      # Pokemon display cards
│   │   ├── ComparisonView.js   # Size comparison visualizations
│   │   └── SearchBar.js        # Search functionality
│   ├── utils/
│   │   ├── sizeConverter.js    # Unit conversion helpers
│   │   ├── cache.js            # LocalStorage cache manager
│   │   └── imageCropper.js    # Sprite processing utilities
│   └── app.js          # Main application controller
└── tests/
    ├── api.test.js     # API service tests
    ├── models.test.js  # Model tests
    └── utils.test.js   # Utility tests
```

## Development Commands

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

### Start Development Server
```bash
npm run serve            # Starts Python HTTP server on port 8000
# OR
python3 -m http.server 8080
```

## API Details

### PokeAPI Endpoints
- Base URL: `https://pokeapi.co/api/v2/`
- Pokemon data: `/pokemon/{id-or-name}`
- No authentication required
- Rate limiting: Be reasonable (cached locally)

### Data Transformations
- **Height**: Stored in decimeters, divide by 10 for meters
- **Weight**: Stored in hectograms, divide by 10 for kilograms
- **Sprites**: Multiple versions available, we use `official-artwork` primarily

## Key Implementation Details

### Visual Size Comparison
- Sprites are scaled proportionally based on actual height
- All Pokemon sprites align at ground level (0m)
- Trainer silhouette (1.7m) always shown for reference
- Uses CSS `object-fit: contain` and `object-position: bottom center` for alignment

### Caching Strategy
- Memory cache (Map) for current session
- LocalStorage for persistence across sessions
- 1-hour expiration by default
- Automatic cleanup of old entries

### Error Handling
- Graceful fallbacks for failed API calls
- User-friendly error messages
- Loading states for all async operations
- Handles CORS limitations with CSS-based solutions

## Testing Approach

### Unit Tests
- Jest with ES modules support
- Mock fetch calls for API testing
- LocalStorage mocking for cache tests
- Coverage threshold: 80% for all metrics

### Manual Testing Checklist
- [ ] Search functionality with various inputs
- [ ] Adding/removing Pokemon
- [ ] All three comparison modes (height, weight, visual)
- [ ] Responsive design on different screen sizes
- [ ] LocalStorage persistence
- [ ] Error states (network failures, invalid Pokemon)

## Common Tasks

### Adding a New Comparison Mode
1. Add radio button in `index.html`
2. Update `ComparisonView.js` with new render method
3. Add corresponding CSS in `style.css`
4. Update tests

### Modifying Pokemon Data
1. Update transformation in `PokeAPIService.transformPokemonData()`
2. Update `Pokemon` model if new properties needed
3. Clear cache to fetch fresh data

### Changing Visual Scaling
1. Modify `baseSize` in `ComparisonView.renderVisualComparison()`
2. Adjust `min-height` in `.visual-stage` CSS
3. Update height marker generation if needed

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6 modules required
- LocalStorage support required
- CSS Grid and Flexbox support required

## Performance Considerations
- Lazy loading of Pokemon data
- Efficient caching to minimize API calls
- Debounced search input
- CSS animations for smooth transitions

## Future Enhancements
- Pokemon generation filtering
- Type-based comparisons
- Evolution chain visualizations
- Export comparison as image
- More detailed stats comparisons
- Sound effects using Pokemon cries

## Troubleshooting

### Images Not Aligning
- Check CSS `object-position: bottom center`
- Verify `.visual-stage` has `align-items: flex-end`
- Ensure sprites have proper height calculations

### Cache Issues
- Clear LocalStorage: `localStorage.clear()`
- Check cache size: Open DevTools > Application > Local Storage
- Verify cache expiration settings

### API Errors
- Check network connection
- Verify Pokemon name/ID is valid
- Check browser console for CORS issues
- Ensure PokeAPI is accessible

## Code Style Guidelines
- Use ES6 modules and classes
- Async/await for asynchronous operations
- Descriptive variable and function names
- Comment complex logic only
- Keep functions small and focused
- Use semantic HTML elements