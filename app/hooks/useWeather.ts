import { useCallback, useEffect, useRef, useState } from "react";
import { fetchWeather, geocodeCity, locateMe, WeatherError, type Place, type Weather } from "../lib/weather";

export type ReadyState = { status: "ready"; place: Place; weather: Weather };

export type WeatherState =
  | ReadyState
  // `previous` keeps the last good result on screen while the next one loads or fails.
  | { status: "loading"; previous?: ReadyState }
  | { status: "error"; message: string; previous?: ReadyState };

function describeError(error: unknown): string {
  if (error instanceof WeatherError) return error.message;
  return "Something went wrong while loading the weather. Please try again.";
}

export default function useWeather(initialCity: string) {
  const [state, setState] = useState<WeatherState>({ status: "loading" });
  const latestRequest = useRef(0);

  // Resolves with the place when this request is still the newest one, otherwise with null.
  const run = useCallback((resolvePlace: () => Promise<Place>): Promise<Place | null> => {
    const id = ++latestRequest.current;
    const isLatest = () => id === latestRequest.current;

    return resolvePlace()
      .then(async (place) => ({ place, weather: await fetchWeather(place) }))
      .then(({ place, weather }) => {
        if (!isLatest()) return null;
        setState({ status: "ready", place, weather });
        return place;
      })
      .catch((error) => {
        if (isLatest()) {
          setState((current) => ({
            status: "error",
            message: describeError(error),
            previous: current.status === "ready" ? current : current.previous,
          }));
        }
        return null;
      });
  }, []);

  useEffect(() => {
    run(() => geocodeCity(initialCity));
  }, [run, initialCity]);

  const startLoading = () =>
    setState((current) => ({
      status: "loading",
      previous: current.status === "ready" ? current : current.previous,
    }));

  const searchCity = useCallback(
    (city: string) => {
      startLoading();
      return run(() => geocodeCity(city));
    },
    [run]
  );

  const locate = useCallback(() => {
    startLoading();
    return run(locateMe);
  }, [run]);

  return { state, searchCity, locate };
}
