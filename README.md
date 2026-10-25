# Weather Wear

Not sure what to put on? Weather Wear checks the weather outside right now and suggests an outfit: umbrella, sunglasses, a hoodie or a winter coat. Pick a city or use your location, and switch between men's and women's suggestions.

## Features

- Current weather for any city: temperature, feels-like temperature, wind, UV index and rain, with an illustration for the conditions.
- Outfit suggestions based on the feels-like temperature, rain and UV, for men and for women.
- The page background follows the weather and the time of day (clear, night, cloudy, fog, rain, snow, storm).
- Works without any API key or account: data comes from [Open-Meteo](https://open-meteo.com/) and place names from [BigDataCloud](https://www.bigdatacloud.com/).
- Keeps the last result on screen while a new one loads, explains errors, and ignores answers that arrive out of order.

## Tech

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 3 · Jest 30 and Testing Library

## Setup

1. Clone the repository: `git clone https://github.com/L3VU5/weather-wear.git`
2. Install dependencies: `npm install`
3. Start the app: `npm run dev` and open http://localhost:3000

| Script              | What it does               |
| ------------------- | -------------------------- |
| `npm run dev`       | development server         |
| `npm run build`     | production build           |
| `npm start`         | serve the production build |
| `npm run lint`      | ESLint                     |
| `npm run typecheck` | TypeScript, no emit        |
| `npm test`          | Jest and Testing Library   |

## Project structure

```
app/
  components/   UI: search bar, weather card, skeleton, background, footer
  hooks/        useWeather: loading, error and "newest request wins" logic
  lib/
    weather.ts      Open-Meteo and BigDataCloud calls
    conditions.ts   weather code -> label, illustration and page theme
    outfit.ts       the outfit rules (pure functions)
public/assets/  outfit and weather illustrations
```

## Data and attribution

Weather data by [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0, free for non-commercial use). Reverse geocoding for the "Use my location" button by [BigDataCloud](https://www.bigdatacloud.com/).
