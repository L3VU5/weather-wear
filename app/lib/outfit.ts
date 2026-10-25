import type { Condition } from "./conditions";
import type { Weather } from "./weather";

export type Gender = "men" | "women";

export type OutfitItem = {
  /** file name (without extension) in /public/assets */
  id: string;
  label: string;
};

const labels: Record<string, string> = {
  umbrella: "Umbrella",
  glasses: "Sunglasses",
  jersey: "Jersey",
  shorts: "Shorts",
  sneakers: "Sneakers",
  "t-shirt": "T-shirt",
  jeansShorts: "Jeans shorts",
  jeans: "Jeans",
  hoodie: "Hoodie",
  winterShoes: "Winter shoes",
  rainJacket: "Rain jacket",
  scarf: "Scarf",
  winterHat: "Winter hat",
  gloves: "Gloves",
  winterJacket: "Winter jacket",
  lightDress: "Light dress",
  flatShoes: "Flat shoes",
  dress: "Dress",
  longDress: "Long dress",
  sweater: "Sweater",
  coat: "Coat",
  boots: "Boots",
  mittens: "Mittens",
  winterCoat: "Winter coat",
  winterBoots: "Winter boots",
};

export type Vibe = "freezing" | "cold" | "chilly" | "medium" | "warm" | "hot";

/** How it feels outside, based on the apparent temperature in °C. */
export function getVibe(apparentTemperature: number): Vibe {
  if (apparentTemperature > 25) return "hot";
  if (apparentTemperature > 21) return "warm";
  if (apparentTemperature > 17) return "medium";
  if (apparentTemperature > 12) return "chilly";
  if (apparentTemperature > 6) return "cold";
  return "freezing";
}

const clothes: Record<Gender, Record<Vibe, string[]>> = {
  men: {
    hot: ["jersey", "shorts", "sneakers"],
    warm: ["t-shirt", "jeansShorts", "sneakers"],
    medium: ["t-shirt", "jeans", "sneakers"],
    chilly: ["hoodie", "jeans", "winterShoes"],
    cold: ["rainJacket", "jeans", "winterShoes"],
    freezing: ["scarf", "winterHat", "gloves", "winterJacket", "jeans", "winterShoes"],
  },
  women: {
    hot: ["lightDress", "flatShoes"],
    warm: ["dress", "flatShoes"],
    medium: ["longDress", "sneakers"],
    chilly: ["sweater", "jeans", "winterShoes"],
    cold: ["coat", "jeans", "boots"],
    freezing: ["scarf", "winterHat", "mittens", "winterCoat", "jeans", "winterBoots"],
  },
};

const UMBRELLA_RAIN_MM_PER_HOUR = 0.5;
const SUNGLASSES_UV_INDEX = 5;

export function getOutfit(
  weather: Pick<Weather, "apparentTemperature" | "rainIntensity" | "uvIndex">,
  condition: Pick<Condition, "precipitation">,
  gender: Gender
): OutfitItem[] {
  const ids: string[] = [];

  if (condition.precipitation === "rain" || weather.rainIntensity >= UMBRELLA_RAIN_MM_PER_HOUR) {
    ids.push("umbrella");
  }
  if (weather.uvIndex > SUNGLASSES_UV_INDEX) {
    ids.push("glasses");
  }
  ids.push(...clothes[gender][getVibe(weather.apparentTemperature)]);

  return ids.map((id) => ({ id, label: labels[id] ?? id }));
}
