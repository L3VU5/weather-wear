"use client";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CircularProgress,
  Divider,
  Image,
  Tooltip,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import queryString from "query-string";
import type { IWeatherCodes } from "./constants/weatherCodes";
import { weatherCodes } from "./constants/weatherCodes";

interface ICityData {
  latitude: string;
  longitude: string;
  country: string;
  name: string;
}
interface IWeather {
  temperature: number;
  temperatureApparent: number;
  rainIntensity: number;
  snowIntensity: number;
  uvIndex: number;
  windSpeed: number;
  weatherCode: number;
}

export default function Home() {
  const [weatherDesc] = useState<IWeatherCodes>(() => weatherCodes);
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const [cityInput, setCityInput] = useState<string>(() => "Krakow");
  const [cityData, setCityData] = useState<ICityData>({
    latitude: "",
    longitude: "",
    country: "",
    name: "",
  });
  const [weather, setWeather] = useState<IWeather>({
    temperature: 0,
    temperatureApparent: 0,
    rainIntensity: 0,
    snowIntensity: 0,
    uvIndex: 0,
    windSpeed: 0,
    weatherCode: 0,
  });
  const {
    temperature,
    temperatureApparent,
    rainIntensity,
    snowIntensity,
    uvIndex,
    windSpeed,
    weatherCode,
  } = weather;
  const [location, setLocation] = useState<string[]>(() => []);

  const apikey: string = "RwwoqaiNfeDTISgK9N3ZxEcVadsTvx52";
  const units: string = "metric";

  const memoizedParamsString = useMemo(
    (): string =>
      queryString.stringify(
        {
          apikey,
          location,
          units,
        },
        { arrayFormat: "comma" }
      ),
    [location]
  );

  const getWeather = async (): Promise<IWeather> => {
    const response = await fetch(
      `https://api.tomorrow.io/v4/weather/realtime?${memoizedParamsString}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }
    const parsedData = await response.json();
    const {
      temperature,
      temperatureApparent,
      rainIntensity,
      snowIntensity,
      windSpeed,
      uvIndex,
      weatherCode,
    } = parsedData?.data?.values || {};
    return {
      temperature: temperature.toFixed(1),
      temperatureApparent: temperatureApparent.toFixed(1),
      rainIntensity,
      snowIntensity,
      windSpeed,
      uvIndex,
      weatherCode,
    };
  };

  const getWeatherName = (code: number) => weatherDesc[code];

  const getLongLatFromCity = async (city: string): Promise<any> => {
    setIsLoading(true);
    const response = await fetch(
      `https://api.api-ninjas.com/v1/city?name=${city}`,
      {
        method: "GET",
        headers: { "X-Api-Key": "S0fG7E8kk2wbjxYWnimNug==iasyX3kCO3pxxNGO" },
      }
    );
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }
    const parsedData = await response.json();
    setIsLoading(false);
    return parsedData[0];
  };

  function onCitySet(): void {
    getLongLatFromCity(cityInput).then(
      ({ latitude, longitude, country, name }) => {
        setCityData({ latitude, longitude, country, name });
        setLocation([latitude, longitude]);
      }
    );
  }

  function success(position: any): void {
    const { latitude, longitude } = position.coords;
    setLocation([latitude, longitude]);
  }

  function error() {
    console.log("Unable to retrieve your location");
  }

  function getBrowserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }
  }

  function renderClothes() {
    const layers: string[] = [];
    let vibe = "medium";
    let isRaining = false;
    let isSunny = false;
    if (
      temperatureApparent === null ||
      rainIntensity === null ||
      snowIntensity === null
    ) {
      return;
    }
    if (rainIntensity > 5) {
      isRaining = true;
    }
    if (uvIndex > 5) {
      isRaining = true;
    }
    if (temperatureApparent > 25) {
      vibe = "hot";
    } else if (temperatureApparent > 20) {
      vibe = "warm";
    } else if (temperatureApparent > 15) {
      vibe = "medium";
    } else if (temperatureApparent > 10) {
      vibe = "chilly";
    } else if (temperatureApparent > 5) {
      vibe = "cold";
    } else {
      vibe = "freezing";
    }
    switch (vibe) {
      case "hot": {
        layers.push("jersey", "shorts", "sneaker");
        break;
      }
      case "warm": {
        layers.push("t-shirt", "shorts-jeans", "sneaker");
        break;
      }
      case "medium": {
        layers.push("t-shirt", "jeans", "sneaker");
        break;
      }
      case "chilly": {
        layers.push("hoodie", "jeans", "shoe");
        break;
      }
      case "cold": {
        layers.push("rain-jacket", "jeans", "shoe");
        break;
      }
      case "freezing": {
        layers.push(
          "scarf",
          "winter-hat",
          "gloves",
          "wind-jacket",
          "jeans",
          "shoe"
        );
        break;
      }
      default:
    }
    if (isRaining) {
      layers.push("umbrella");
    }
    if (isSunny) {
      layers.push("glasses");
    }
    return layers.map((layer, i) => (
      <>
        <Tooltip
          showArrow={true}
          content={layer}
          placement="bottom"
          color="secondary"
        >
          <Image
            className="hover:scale-110"
            width={200}
            key={layer}
            alt={layer}
            src={`/assets/${layer}.png`}
          />
        </Tooltip>
        {i < layers.length - 1 && (
          <Image
            width={100}
            key={`${layer}_add`}
            alt="add"
            src="/assets/add.png"
          />
        )}
      </>
    ));
  }

  function getIconFromWeatherName(name: string): string {
    const parsedName = name.toLowerCase();
    if (parsedName.includes("thunderstorm")) {
      return "storm";
    }
    if (parsedName.includes("rain")) {
      if (parsedName.includes("snow")) {
        return "snow-rain";
      }
      return "heavy-rain";
    }
    if (parsedName.includes("snow")) {
      return "snow";
    }

    if (parsedName.includes("cloudy")) {
      return "cloudy-sun";
    }
    return "sunny";
  }

  useEffect(() => {
    if (location) {
      setIsLoading(true);
      getWeather()
        .then((weatherData) => setWeather(weatherData))
        .finally(() => setIsLoading(false));
    }
  }, [location]);

  useEffect(() => {
    onCitySet();
  }, []);

  return (
    <main className="bg-slate-950 flex h-screen min-h-screen flex-col p-24 items-center ">
      <div className="w-full max-w-6xl">
        <div className="flex mb-32 text-center w-full gap-2">
          <Input
            type="text"
            size="lg"
            label="Select city"
            color="secondary"
            value={cityInput}
            onValueChange={setCityInput}
          />
          <Button className="h-16 px-8" onClick={onCitySet} color="secondary">
            Set
          </Button>
          <Button className="h-16 px-8" onClick={getBrowserLocation}>
            Get my location
          </Button>
        </div>
        <div className="flex w-full">
          {isLoading ? (
            <CircularProgress
              color="secondary"
              size="lg"
              aria-label="Loading..."
            />
          ) : (
            <Card className="flex w-full">
              <>
                <CardHeader className=" px-6 flex gap-4">
                  <div className="flex flex-col">
                    <p className="font-semibold text-md text-indigo-300">
                      {cityData?.name}, {cityData?.country}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    {windSpeed > 5 && (
                      <Image
                        width={64}
                        alt="windy-icon"
                        src={`/assets/windy.png`}
                      />
                    )}
                    <p className="text-small text-default-500">
                      {temperature !== null ? `${temperature} ℃` : "No data."}
                    </p>
                    <p className="font-semibold text-md text-indigo-300">
                      {getWeatherName(weatherCode)}
                    </p>
                  </div>
                  <Image
                    width={64}
                    alt="weather-icon"
                    src={`/assets/${getIconFromWeatherName(
                      getWeatherName(weatherCode)
                    )}.png`}
                  />
                </CardHeader>
                <Divider />
                <CardBody className="flex flex-row justify-around items-center">
                  {weather ? renderClothes() : <p>No data.</p>}
                </CardBody>
                <Divider />
                <CardFooter className="px-6">
                  {cityData && (
                    <p className="w-full text-right text-xs text-indigo-300">
                      Long: {cityData.longitude}, Lat: {cityData.latitude}
                    </p>
                  )}
                </CardFooter>
              </>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
