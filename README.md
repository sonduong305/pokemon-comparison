# Pokemon Size Comparison

A visual web application for comparing the sizes of different Pokemon, built with vanilla JavaScript and the PokeAPI.

## 🎮 Live Demo

[View Live Demo](https://sonduong305.github.io/pokemon-comparison/)

## 📸 Screenshots

![Pokemon Size Comparison App](screenshot.png)

## ✨ Features

- **Visual Size Comparison**: See Pokemon sprites scaled to their actual relative sizes
- **Height & Weight Charts**: Compare Pokemon using bar charts for height and weight
- **Human Scale Reference**: Includes a 1.7m trainer silhouette for scale reference
- **Instant Search**: Fast, offline-capable Pokemon search with autocomplete
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Data Caching**: Efficient caching system for better performance
- **Clean UI**: Modern, intuitive interface with smooth animations

## 🚀 Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API**: [PokeAPI](https://pokeapi.co) for Pokemon data
- **Testing**: Jest with 52 comprehensive tests
- **Deployment**: GitHub Pages
- **No Framework Dependencies**: Pure JavaScript implementation

## 🛠️ Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/sonduong305/pokemon-comparison.git
cd pokemon-comparison
```

2. Install dependencies (for testing):
```bash
npm install
```

3. Run locally:
```bash
python3 -m http.server 8000
# or
npm run serve
```

4. Open in browser:
```
http://localhost:8000
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📁 Project Structure

```
pokemon-comparison/
├── index.html           # Main HTML file
├── css/
│   └── style.css       # All styles
├── js/
│   ├── app.js          # Main application
│   ├── api/
│   │   └── pokeapi.js  # API service
│   ├── components/
│   │   ├── ComparisonView.js
│   │   ├── PokemonCard.js
│   │   └── SearchBar.js
│   ├── data/
│   │   └── pokemonData.js
│   ├── models/
│   │   └── Pokemon.js
│   └── utils/
│       ├── cache.js
│       ├── imageCropper.js
│       └── sizeConverter.js
├── data/
│   └── pokemon-list.json  # Cached Pokemon names
└── tests/               # Test files
```

## 🎯 Key Features Explained

### Visual Size Comparison
- Sprites are scaled relative to their actual heights in meters
- Automatic sprite alignment and whitespace handling
- Ground-level alignment for accurate comparison

### Smart Search
- Local data for instant autocomplete (no API calls)
- Search by name or Pokemon ID
- Works offline after initial load

### Caching System
- LocalStorage caching with 1-hour expiration
- Reduces API calls significantly
- Clear cache button for troubleshooting

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## ⚖️ Legal Disclaimer

Pokémon and all respective names are trademark & © of Nintendo, Game Freak, and The Pokémon Company 1996-2024. This is an unofficial fan-made tool for educational purposes.

## 🙏 Acknowledgments

- [PokeAPI](https://pokeapi.co) for providing the Pokemon data
- All Pokemon fans who inspired this project

## 📧 Contact

Feel free to reach out if you have any questions or suggestions!

