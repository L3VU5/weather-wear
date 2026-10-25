// Weather data comes from Open-Meteo (https://open-meteo.com), geocoding from Open-Meteo too and
// reverse geocoding (coordinates -> place name) from BigDataCloud. None of them needs an API key.

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const REVERSE_GEOCODING_URL = "https://api.bigdatacloud.net/data/reverse-geocode-client";

export type Place = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type Weather = {
  /** °C */
  temperature: number;
  /** °C */
  apparentTemperature: number;
  /** mm per hour */
  rainIntensity: number;
  /** cm per hour */
  snowIntensity: number;
  uvIndex: number;
  /** m/s */
  windSpeed: number;
  /** WMO weather interpretation code */
  weatherCode: number;
  isDay: boolean;
};

export type WeatherErrorKind = "not-found" | "network" | "geolocation";

export class WeatherError extends Error {
  readonly kind: WeatherErrorKind;

  constructor(message: string, kind: WeatherErrorKind) {
    super(message);
    this.name = "WeatherError";
    this.kind = kind;
  }
}

async function getJson<T>(url: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new WeatherError(
      "Could not reach the weather service. Check your connection and try again.",
      "network"
    );
  }
  if (!response.ok) {
    throw new WeatherError(
      `The weather service answered with an error (${response.status}). Please try again.`,
      "network"
    );
  }
  return response.json() as Promise<T>;
}

export async function geocodeCity(city: string): Promise<Place> {
  const name = city.trim();
  if (!name) {
    throw new WeatherError("Enter a city name.", "not-found");
  }

  const params = new URLSearchParams({ name, count: "1", language: "en", format: "json" });
  const data = await getJson<{
    results?: Array<{
      name: string;
      latitude: number;
      longitude: number;
      country?: string;
      country_code?: string;
    }>;
  }>(`${GEOCODING_URL}?${params}`);

  const match = data.results?.[0];
  if (!match) {
    throw new WeatherError(`No city found for “${name}”.`, "not-found");
  }

  return {
    name: match.name,
    country: match.country ?? match.country_code ?? "",
    latitude: match.latitude,
    longitude: match.longitude,
  };
}

/** Never fails: when the name lookup does not work the place is simply called "Your location". */
export async function reverseGeocode(latitude: number, longitude: number): Promise<Place> {
  const fallback: Place = { name: "Your location", country: "", latitude, longitude };

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      localityLanguage: "en",
    });
    const data = await getJson<{
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    }>(`${REVERSE_GEOCODING_URL}?${params}`);

    const name = data.city || data.locality || data.principalSubdivision;
    return name ? { name, country: data.countryName ?? "", latitude, longitude } : fallback;
  } catch {
    return fallback;
  }
}

export function locateMe(): Promise<Place> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new WeatherError("Your browser does not support geolocation.", "geolocation"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        reverseGeocode(coords.latitude, coords.longitude).then(resolve, reject);
      },
      () =>
        reject(
          new WeatherError(
            "Could not get your location. Allow location access or search for a city.",
            "geolocation"
          )
        ),
      { timeout: 10_000 }
    );
  });
}

type ForecastResponse = {
  current: {
    interval: number;
    temperature_2m: number;
    apparent_temperature: number;
    rain: number;
    showers: number;
    snowfall: number;
    wind_speed_10m: number;
    weather_code: number;
    uv_index: number;
    is_day: number;
  };
};

export async function fetchWeather({ latitude, longitude }: Pick<Place, "latitude" | "longitude">): Promise<Weather> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      "temperature_2m",
      "apparent_temperature",
      "rain",
      "showers",
      "snowfall",
      "wind_speed_10m",
      "weather_code",
      "uv_index",
      "is_day",
    ].join(","),
    wind_speed_unit: "ms",
    timezone: "auto",
  });
  const { current } = await getJson<ForecastResponse>(`${FORECAST_URL}?${params}`);

  // Rain and snow are sums over the preceding interval (15 minutes), so scale them to one hour.
  const perHour = 3600 / (current.interval || 900);

  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    rainIntensity: (current.rain + current.showers) * perHour,
    snowIntensity: current.snowfall * perHour,
    uvIndex: current.uv_index,
    windSpeed: current.wind_speed_10m,
    weatherCode: current.weather_code,
    isDay: current.is_day === 1,
  };
}
