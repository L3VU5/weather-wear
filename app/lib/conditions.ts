// Turns a WMO weather code into a label, an illustration from /public/assets and a page theme.

export type ThemeId = "clear-day" | "clear-night" | "cloudy" | "fog" | "rain" | "snow" | "storm";

export type Condition = {
  label: string;
  /** file name (without extension) in /public/assets */
  icon: string;
  theme: ThemeId;
  precipitation: "none" | "rain" | "snow";
};

type Entry = { label: string; day: string; night?: string; theme: ThemeId; precipitation?: "rain" | "snow" };

const entries: Record<number, Entry> = {
  0: { label: "Clear sky", day: "sunny", night: "full-moon", theme: "clear-day" },
  1: { label: "Mainly clear", day: "sunny", night: "full-moon", theme: "clear-day" },
  2: { label: "Partly cloudy", day: "cloudy-sun", night: "full-moon", theme: "cloudy" },
  3: { label: "Overcast", day: "cloudy-sun", theme: "cloudy" },
  45: { label: "Fog", day: "wind", theme: "fog" },
  48: { label: "Rime fog", day: "wind", theme: "fog" },
  51: { label: "Light drizzle", day: "rain_sun", night: "rain-night", theme: "rain", precipitation: "rain" },
  53: { label: "Drizzle", day: "rain_sun", night: "rain-night", theme: "rain", precipitation: "rain" },
  55: { label: "Heavy drizzle", day: "heavy-rain", theme: "rain", precipitation: "rain" },
  56: { label: "Freezing drizzle", day: "snow-rain", theme: "rain", precipitation: "rain" },
  57: { label: "Heavy freezing drizzle", day: "snow-rain", theme: "rain", precipitation: "rain" },
  61: { label: "Light rain", day: "rain_sun", night: "rain-night", theme: "rain", precipitation: "rain" },
  63: { label: "Rain", day: "heavy-rain", theme: "rain", precipitation: "rain" },
  65: { label: "Heavy rain", day: "heavy-rain", theme: "rain", precipitation: "rain" },
  66: { label: "Freezing rain", day: "snow-rain", theme: "rain", precipitation: "rain" },
  67: { label: "Heavy freezing rain", day: "snow-rain", theme: "rain", precipitation: "rain" },
  71: { label: "Light snow", day: "snow", theme: "snow", precipitation: "snow" },
  73: { label: "Snow", day: "snow", theme: "snow", precipitation: "snow" },
  75: { label: "Heavy snow", day: "snow", theme: "snow", precipitation: "snow" },
  77: { label: "Snow grains", day: "snow", theme: "snow", precipitation: "snow" },
  80: { label: "Light showers", day: "rain_sun", night: "rain-night", theme: "rain", precipitation: "rain" },
  81: { label: "Showers", day: "heavy-rain", theme: "rain", precipitation: "rain" },
  82: { label: "Violent showers", day: "heavy-rain", theme: "rain", precipitation: "rain" },
  85: { label: "Snow showers", day: "snow", theme: "snow", precipitation: "snow" },
  86: { label: "Heavy snow showers", day: "snow", theme: "snow", precipitation: "snow" },
  95: { label: "Thunderstorm", day: "storm", theme: "storm", precipitation: "rain" },
  96: { label: "Thunderstorm with hail", day: "storm", theme: "storm", precipitation: "rain" },
  99: { label: "Severe thunderstorm", day: "storm", theme: "storm", precipitation: "rain" },
};

export function describeWeather(code: number, isDay: boolean): Condition {
  const entry = entries[code];
  if (!entry) {
    return { label: "Unknown", icon: isDay ? "cloudy-sun" : "full-moon", theme: isDay ? "cloudy" : "clear-night", precipitation: "none" };
  }

  // Clear and mostly clear skies look different after dark; every other theme stays the same.
  const theme: ThemeId = !isDay && entry.theme === "clear-day" ? "clear-night" : entry.theme;

  return {
    label: entry.label,
    icon: isDay ? entry.day : (entry.night ?? entry.day),
    theme,
    precipitation: entry.precipitation ?? "none",
  };
}

export type Theme = {
  /** CSS background of the whole page */
  background: string;
  /** accent for the aurora blobs */
  glow: [string, string];
};

export const themes: Record<ThemeId, Theme> = {
  "clear-day": {
    background: "linear-gradient(160deg, #0b3a8c 0%, #1d7fd6 55%, #f2b45a 130%)",
    glow: ["#38bdf8", "#fbbf24"],
  },
  "clear-night": {
    background: "linear-gradient(160deg, #050816 0%, #131a4d 60%, #2b1f63 120%)",
    glow: ["#6366f1", "#a78bfa"],
  },
  cloudy: {
    background: "linear-gradient(160deg, #1c2538 0%, #3b4a63 60%, #6b7a93 130%)",
    glow: ["#94a3b8", "#60a5fa"],
  },
  fog: {
    background: "linear-gradient(160deg, #202733 0%, #4a5361 60%, #8b93a1 130%)",
    glow: ["#cbd5e1", "#94a3b8"],
  },
  rain: {
    background: "linear-gradient(160deg, #0b1424 0%, #1c3557 60%, #2e5b82 130%)",
    glow: ["#38bdf8", "#6366f1"],
  },
  snow: {
    background: "linear-gradient(160deg, #1b2c46 0%, #3f6a93 60%, #a9d4ee 130%)",
    glow: ["#bae6fd", "#e0f2fe"],
  },
  storm: {
    background: "linear-gradient(160deg, #0a0816 0%, #261a4a 60%, #4b2f7e 130%)",
    glow: ["#a78bfa", "#facc15"],
  },
};
