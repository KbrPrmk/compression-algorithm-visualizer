# 🗜️ Compression Algorithm Visualizer
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow?logo=javascript)
![SVG](https://img.shields.io/badge/Rendering-SVG-orange)
![Huffman](https://img.shields.io/badge/Algorithm-Huffman-darkgreen)
![LZW](https://img.shields.io/badge/Algorithm-LZW-blueviolet)
![License](https://img.shields.io/badge/License-MIT-yellow)

An interactive visualizer for two fundamental lossless compression algorithms — **Huffman Encoding** and **LZW (Lempel-Ziv-Welch)** — with a built-in comparison mode. Built with vanilla HTML, CSS, and JavaScript.

---

## ⚙️ Algorithms

| Algorithm | Type | Real-World Use Case |
|-----------|------|---------------------|
| **Huffman Encoding** | Entropy coding | ZIP, JPEG, MP3, PDF internals |
| **LZW** | Dictionary coding | GIF, TIFF, PDF, Unix `compress` |

---

## ✨ Features

### Huffman
- Character frequency analysis with bar chart
- Huffman tree rendered as animated SVG
- Full code table: character → binary code, bit length, savings per character
- Color-coded encoded output (0 = purple, 1 = green)
- Compression stats: original bits, encoded bits, compression ratio

### LZW
- Step-by-step encoding trace: buffer state → output code → new dictionary entry
- Full dictionary visualization with new entries highlighted
- Final output code sequence display

### Compare Mode
- Run both algorithms on the same input simultaneously
- Side-by-side metric comparison
- Automatic verdict: which algorithm wins for the given text and why

---

## 🔬 Key Insight

- **Huffman** performs better on low-entropy text (few unique characters, skewed frequencies)
- **LZW** performs better on repetitive patterns (e.g. `ABABABABAB`)
- Use the **Compare** tab to observe this behavior directly on any input

---

## 🎨 Stack

- Vanilla JavaScript — algorithm logic, SVG tree rendering, animation
- CSS custom properties — dark theme, animated stat cards
- No libraries or build tools required

---

## 🚀 Getting Started

```bash
open index.html
```

Or serve locally:

```bash
npx serve .
```

---

## 🗂️ File Structure

```bash
├── index.html   # Layout, panels, tab navigation
├── algo.css     # Styling and dark theme variables
└── algo.js      # Huffman + LZW logic, SVG rendering, compare engine
```

---

## 📄 License

MIT License. Feel free to use and modify.
