# Dry Fire Scaler

A React-based utility application designed to help shooting sports enthusiasts and dry fire practitioners convert real-world target scenarios into scaled-down dry fire versions for home practice.

<img width="1494" height="962" alt="image" src="https://github.com/user-attachments/assets/a0874b45-3c8a-4915-a55c-c4bfeaf8a577" />


## Features

- Dual Modes:
  - Scale Down (Real → Dry): Input a real-world target size and distance (e.g., an IPSC target at 25 yards) and calculate the required scaled dimensions for your specific home practice distance (e.g., 10 feet).
  - Scale Up (Dry → Real): Input your current dry fire setup (e.g., a 1-inch sticker at 12 feet) and see what real-world targets that simulates at various distances (7, 10, 25, 50, 100+ yards).
- Target Presets: Built-in dimensions for common targets like IPSC (Classic/Metric), IDPA, NRA B-8, and Steel Plates.
- Visualizer: A dynamic CSS-based preview showing how the scaled target fits on a standard US Letter (8.5" x 11") sheet of paper.
- MOA Calculator: Automatically calculates the angular size (Minute of Angle) for precision reference.
- Flexible Units: Mix and match units seamlessly (Inches, Feet, Yards, Meters, cm, mm).
- Responsive Design: Optimized for mobile phones for range use, with an expanded layout for desktop/tablet use.

## Tech Stack

- Framework: React 18
- Build Tool: Vite
- Styling: Tailwind CSS
- Icons: Lucide React


## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone or Create Project Directory** If you haven't already, create a folder for the project and navigate into it.

2. **Install Dependencies** Run the following command to install React, Vite, Tailwind, and other required packages:
```bash
npm install
```

3. **Run Locally** Start the development server:
```bash
npm run dev
```
Open your browser and navigate to the URL shown (usually http://localhost:5173).

4. **Build for Production** To create a production-ready build (outputs to /dist folder):
```bash
npm run build
```

## Project Structure
```
dry-fire-scaler/
├── index.html              # Entry HTML file
├── package.json            # Project configuration and scripts
├── postcss.config.js       # PostCSS config for Tailwind
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.js          # Vite configuration
└── src/
    ├── App.jsx             # Main application component
    ├── main.jsx            # React entry point
    └── index.css           # Global styles & Tailwind directives
```

## Usage

1. Select Mode: Use the toggle at the top to switch between "Scale Down" and "Scale Up".
2. Set Dry Fire Environment: Enter the distance from your standing position to your wall/target stand (e.g., 10 ft).
3. Input Data:
  - In Scale Down, choose a target preset (e.g., "IPSC Classic") and the real-world distance you want to simulate (e.g., 25 yds).
  - In Scale Up, enter the size of the sticker/target you have on your wall.
4. View Results:
  - Scale Down shows you the exact dimensions to print or cut your target to, along with a visual preview.
  - Scale Up provides a table showing equivalent target sizes at standard range distances.

## License

MIT
