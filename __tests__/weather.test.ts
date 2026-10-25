import { fetchWeather, geocodeCity, locateMe, reverseGeocode, WeatherError } from "../app/lib/weather";

// jsdom has no Response class, and the code under test only needs ok, status and json().
const respond = (body: unknown, status = 200) =>
  Promise.resolve({ ok: status < 400, status, json: async () => body });

describe("weather API", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  describe("geocodeCity", () => {
    test("returns the best match", async () => {
      fetchMock.mockReturnValue(
        respond({ results: [{ name: "Krakow", latitude: 50.06, longitude: 19.94, country: "Poland", country_code: "PL" }] })
      );

      await expect(geocodeCity("  Krakow ")).resolves.toEqual({
        name: "Krakow",
        country: "Poland",
        latitude: 50.06,
        longitude: 19.94,
      });
      expect(fetchMock.mock.calls[0][0]).toContain("name=Krakow");
      expect(fetchMock.mock.calls[0][0]).toContain("count=1");
    });

    test("reports an unknown city", async () => {
      fetchMock.mockReturnValue(respond({}));

      await expect(geocodeCity("zzzzzz")).rejects.toMatchObject({ kind: "not-found", message: expect.stringContaining("zzzzzz") });
    });

    test("does not call the API for an empty name", async () => {
      await expect(geocodeCity("   ")).rejects.toBeInstanceOf(WeatherError);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    test("reports a network failure", async () => {
      fetchMock.mockRejectedValue(new TypeError("offline"));

      await expect(geocodeCity("Krakow")).rejects.toMatchObject({ kind: "network" });
    });

    test("reports an error status", async () => {
      fetchMock.mockReturnValue(respond({ reason: "limit" }, 429));

      await expect(geocodeCity("Krakow")).rejects.toMatchObject({ kind: "network", message: expect.stringContaining("429") });
    });
  });

  describe("fetchWeather", () => {
    const current = {
      interval: 900,
      temperature_2m: 14.4,
      apparent_temperature: 12.7,
      rain: 0.1,
      showers: 0.05,
      snowfall: 0.2,
      wind_speed_10m: 6.2,
      weather_code: 63,
      uv_index: 1.5,
      is_day: 1,
    };

    test("maps the response and scales rain and snow to one hour", async () => {
      fetchMock.mockReturnValue(respond({ current }));

      const weather = await fetchWeather({ latitude: 50.06, longitude: 19.94 });

      expect(weather).toMatchObject({
        temperature: 14.4,
        apparentTemperature: 12.7,
        windSpeed: 6.2,
        weatherCode: 63,
        uvIndex: 1.5,
        isDay: true,
      });
      expect(weather.rainIntensity).toBeCloseTo(0.6);
      expect(weather.snowIntensity).toBeCloseTo(0.8);
      expect(fetchMock.mock.calls[0][0]).toContain("wind_speed_unit=ms");
    });

    test("understands night time", async () => {
      fetchMock.mockReturnValue(respond({ current: { ...current, is_day: 0 } }));

      expect((await fetchWeather({ latitude: 0, longitude: 0 })).isDay).toBe(false);
    });
  });

  describe("reverseGeocode", () => {
    test("names the place", async () => {
      fetchMock.mockReturnValue(respond({ city: "Krakow", countryName: "Poland" }));

      await expect(reverseGeocode(50.06, 19.94)).resolves.toMatchObject({ name: "Krakow", country: "Poland", latitude: 50.06 });
    });

    test("falls back to the locality, then to a generic name", async () => {
      fetchMock.mockReturnValueOnce(respond({ locality: "Stare Miasto", countryName: "Poland" }));
      await expect(reverseGeocode(1, 2)).resolves.toMatchObject({ name: "Stare Miasto" });

      fetchMock.mockReturnValueOnce(respond({}));
      await expect(reverseGeocode(1, 2)).resolves.toMatchObject({ name: "Your location" });
    });

    test("never fails because the name lookup failed", async () => {
      fetchMock.mockRejectedValue(new TypeError("offline"));

      await expect(reverseGeocode(1, 2)).resolves.toEqual({ name: "Your location", country: "", latitude: 1, longitude: 2 });
    });
  });

  describe("locateMe", () => {
    const setGeolocation = (value: unknown) => Object.defineProperty(navigator, "geolocation", { value, configurable: true });

    test("resolves with the named place", async () => {
      setGeolocation({
        getCurrentPosition: (success: (position: unknown) => void) =>
          success({ coords: { latitude: 50.06, longitude: 19.94 } }),
      });
      fetchMock.mockReturnValue(respond({ city: "Krakow", countryName: "Poland" }));

      await expect(locateMe()).resolves.toMatchObject({ name: "Krakow", latitude: 50.06 });
    });

    test("explains a refused permission", async () => {
      setGeolocation({ getCurrentPosition: (_: unknown, failure: () => void) => failure() });

      await expect(locateMe()).rejects.toMatchObject({ kind: "geolocation" });
    });

    test("explains missing browser support", async () => {
      setGeolocation(undefined);

      await expect(locateMe()).rejects.toMatchObject({ kind: "geolocation" });
    });
  });
});
