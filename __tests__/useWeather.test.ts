import { act, renderHook, waitFor } from "@testing-library/react";

import useWeather from "../app/hooks/useWeather";
import { fetchWeather, geocodeCity, type Place, type Weather } from "../app/lib/weather";

jest.mock("../app/lib/weather", () => ({
  ...jest.requireActual("../app/lib/weather"),
  geocodeCity: jest.fn(),
  fetchWeather: jest.fn(),
  locateMe: jest.fn(),
}));

const place = (name: string): Place => ({ name, country: "", latitude: 0, longitude: 0 });
const weather: Weather = {
  temperature: 10,
  apparentTemperature: 9,
  rainIntensity: 0,
  snowIntensity: 0,
  uvIndex: 0,
  windSpeed: 0,
  weatherCode: 0,
  isDay: true,
};

beforeEach(() => {
  jest.resetAllMocks();
  (geocodeCity as jest.Mock).mockImplementation(async (city: string) => place(city));
  (fetchWeather as jest.Mock).mockResolvedValue(weather);
});

test("loads the initial city", async () => {
  const { result } = renderHook(() => useWeather("Krakow"));

  expect(result.current.state.status).toBe("loading");
  await waitFor(() => expect(result.current.state).toMatchObject({ status: "ready", place: { name: "Krakow" } }));
});

test("only the newest request wins, even when an older one answers last", async () => {
  const { result } = renderHook(() => useWeather("Krakow"));
  await waitFor(() => expect(result.current.state.status).toBe("ready"));

  let answerSlow!: (value: Place) => void;
  (geocodeCity as jest.Mock).mockReturnValueOnce(new Promise<Place>((resolve) => (answerSlow = resolve)));

  let slowResult: Place | null | undefined;
  await act(async () => {
    result.current.searchCity("slow").then((value) => (slowResult = value));
    await result.current.searchCity("fast");
  });
  expect(result.current.state).toMatchObject({ status: "ready", place: { name: "fast" } });

  await act(async () => {
    answerSlow(place("slow"));
  });

  expect(result.current.state).toMatchObject({ status: "ready", place: { name: "fast" } });
  expect(slowResult).toBeNull();
});

test("keeps the previous result when a search fails", async () => {
  const { result } = renderHook(() => useWeather("Krakow"));
  await waitFor(() => expect(result.current.state.status).toBe("ready"));

  (geocodeCity as jest.Mock).mockRejectedValueOnce(new Error("boom"));
  await act(async () => {
    await result.current.searchCity("nowhere");
  });

  expect(result.current.state).toMatchObject({
    status: "error",
    message: expect.stringMatching(/something went wrong/i),
    previous: { place: { name: "Krakow" } },
  });
});
