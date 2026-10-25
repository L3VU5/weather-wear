import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import WeatherWear from "../app/components/WeatherWear";
import { fetchWeather, geocodeCity, locateMe, WeatherError, type Place, type Weather } from "../app/lib/weather";

jest.mock("../app/lib/weather", () => ({
  ...jest.requireActual("../app/lib/weather"),
  geocodeCity: jest.fn(),
  fetchWeather: jest.fn(),
  locateMe: jest.fn(),
}));

const krakow: Place = { name: "Krakow", country: "Poland", latitude: 50.06, longitude: 19.94 };
const oslo: Place = { name: "Oslo", country: "Norway", latitude: 59.91, longitude: 10.75 };

const weather = (overrides: Partial<Weather> = {}): Weather => ({
  temperature: 14.4,
  apparentTemperature: 12.7,
  rainIntensity: 0,
  snowIntensity: 0,
  uvIndex: 1.5,
  windSpeed: 1.4,
  weatherCode: 3,
  isDay: true,
  ...overrides,
});

const mocked = {
  geocodeCity: geocodeCity as jest.Mock,
  fetchWeather: fetchWeather as jest.Mock,
  locateMe: locateMe as jest.Mock,
};

beforeEach(() => {
  jest.resetAllMocks();
  mocked.geocodeCity.mockResolvedValue(krakow);
  mocked.fetchWeather.mockResolvedValue(weather());
});

test("loads the default city and suggests an outfit", async () => {
  render(<WeatherWear initialCity="Krakow" />);

  expect(screen.getByRole("status", { name: /loading the weather/i })).toBeInTheDocument();
  expect(await screen.findByRole("heading", { level: 2, name: /Krakow/ })).toBeInTheDocument();
  expect(screen.getByText("14°")).toBeInTheDocument();
  expect(screen.getByText("Overcast")).toBeInTheDocument();
  // 12.7 °C feels chilly: a hoodie for men
  expect(screen.getByText("Hoodie")).toBeInTheDocument();
  expect(mocked.geocodeCity).toHaveBeenCalledWith("Krakow");
});

test("switches the outfit between men and women", async () => {
  const user = userEvent.setup();
  render(<WeatherWear initialCity="Krakow" />);
  await screen.findByText("Hoodie");

  await user.click(screen.getByRole("radio", { name: /women/i }));

  expect(screen.getByText("Sweater")).toBeInTheDocument();
  expect(screen.queryByText("Hoodie")).not.toBeInTheDocument();
  expect(screen.getByRole("radio", { name: /women/i })).toHaveAttribute("aria-checked", "true");
});

test("recommends an umbrella and warns about wind", async () => {
  mocked.fetchWeather.mockResolvedValue(weather({ weatherCode: 63, windSpeed: 8 }));
  render(<WeatherWear initialCity="Krakow" />);

  expect(await screen.findByText("Umbrella")).toBeInTheDocument();
  expect(screen.getByText(/it.s windy/i)).toBeInTheDocument();
});

test("searches for another city", async () => {
  const user = userEvent.setup();
  render(<WeatherWear initialCity="Krakow" />);
  await screen.findByRole("heading", { level: 2, name: /Krakow/ });

  mocked.geocodeCity.mockResolvedValue(oslo);
  mocked.fetchWeather.mockResolvedValue(weather({ temperature: -4, apparentTemperature: -9, weatherCode: 73 }));
  const input = screen.getByRole("textbox", { name: /city/i });
  await user.clear(input);
  await user.type(input, "Oslo");
  await user.click(screen.getByRole("button", { name: /show weather/i }));

  expect(await screen.findByRole("heading", { level: 2, name: /Oslo/ })).toBeInTheDocument();
  expect(screen.getByText("-4°")).toBeInTheDocument();
  expect(screen.getByText("Winter jacket")).toBeInTheDocument();
  expect(mocked.geocodeCity).toHaveBeenLastCalledWith("Oslo");
});

test("keeps the previous result and explains an unknown city", async () => {
  const user = userEvent.setup();
  render(<WeatherWear initialCity="Krakow" />);
  await screen.findByRole("heading", { level: 2, name: /Krakow/ });

  mocked.geocodeCity.mockRejectedValue(new WeatherError("No city found for “zzzz”.", "not-found"));
  const input = screen.getByRole("textbox", { name: /city/i });
  await user.clear(input);
  await user.type(input, "zzzz");
  await user.click(screen.getByRole("button", { name: /show weather/i }));

  expect(await screen.findByRole("alert")).toHaveTextContent("No city found for “zzzz”.");
  expect(screen.getByRole("heading", { level: 2, name: /Krakow/ })).toBeInTheDocument();
});

test("shows an error when the first load fails", async () => {
  mocked.geocodeCity.mockRejectedValue(new WeatherError("Could not reach the weather service.", "network"));
  render(<WeatherWear initialCity="Krakow" />);

  expect(await screen.findByRole("alert")).toHaveTextContent(/could not reach/i);
  expect(screen.queryByRole("article")).not.toBeInTheDocument();
});

test("uses the browser location and fills in the city", async () => {
  const user = userEvent.setup();
  render(<WeatherWear initialCity="Krakow" />);
  await screen.findByRole("heading", { level: 2, name: /Krakow/ });

  mocked.locateMe.mockResolvedValue(oslo);
  await user.click(screen.getByRole("button", { name: /use my location/i }));

  expect(await screen.findByRole("heading", { level: 2, name: /Oslo/ })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: /city/i })).toHaveValue("Oslo");
});

test("disables the controls while a search is running", async () => {
  const user = userEvent.setup();
  render(<WeatherWear initialCity="Krakow" />);
  await screen.findByRole("heading", { level: 2, name: /Krakow/ });

  let finish!: (place: Place) => void;
  mocked.geocodeCity.mockReturnValueOnce(new Promise<Place>((resolve) => (finish = resolve)));
  await user.click(screen.getByRole("button", { name: /show weather/i }));

  expect(screen.getByRole("button", { name: /show weather/i })).toBeDisabled();
  expect(screen.getByRole("button", { name: /use my location/i })).toBeDisabled();
  // the previous result stays visible, marked as stale
  expect(screen.getByRole("article")).toHaveAttribute("aria-busy", "true");

  finish(oslo);
  expect(await screen.findByRole("heading", { level: 2, name: /Oslo/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /show weather/i })).toBeEnabled();
});
