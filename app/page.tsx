"use client";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Skeleton,
  Divider,
  Image,
  Tooltip,
} from "@nextui-org/react";
import { useEffect, useMemo, useState, useCallback, ReactNode } from "react";
import queryString from "query-string";
import upperFirst from "lodash/upperFirst";
import { throttle } from "lodash";
import type { IWeatherCodes } from "./constants/weatherCodes";
import { weatherCodes } from "./constants/weatherCodes";
import { EXOAPI_KEY, TOMORROW_KEY, NINJA_KEY } from "./constants/environment";

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
  const units: string = "metric";
  const memoizedParamsString = useMemo(
    (): string =>
      queryString.stringify(
        {
          apikey: TOMORROW_KEY,
          location: [cityData.latitude, cityData.longitude],
          units,
        },
        { arrayFormat: "comma" }
      ),
    [cityData.latitude, cityData.longitude]
  );

  const getWeather = useCallback(async (): Promise<IWeather> => {
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
  }, [memoizedParamsString]);

  const getLongLatFromCity = async (city: string): Promise<ICityData> => {
    const headers: HeadersInit = { "X-Api-Key": NINJA_KEY! };
    const response = await fetch(
      `https://api.api-ninjas.com/v1/city?name=${city}`,
      {
        method: "GET",
        headers,
      }
    );
    if (!response.ok) {
      const message = `An error has occured: ${response.status}`;
      throw new Error(message);
    }
    const parsedData = await response.json();
    return parsedData[0];
  };

  const getCityFromLongLat = async (
    lat: Number,
    lon: Number
  ): Promise<ICityData> => {
    const response = await fetch("https://api.exoapi.dev/reverse-geocoding", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EXOAPI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lat,
        lon,
        locale: "en-GB",
      }),
    });
    const {
      lat: latitude,
      lon: longitude,
      city: name,
      countryCode: country,
    } = await response.json();
    return { latitude, longitude, name, country };
  };

  const onCitySet = useCallback((): void => {
    getLongLatFromCity(cityInput).then(
      ({ latitude, longitude, country, name }) => {
        setCityData({ latitude, longitude, country, name });
      }
    );
  }, [cityInput]);

  const throttledCitySet = throttle(onCitySet, 1000, { trailing: false });

  useEffect(() => {
    if (cityData?.latitude) {
      getWeather()
        .then((weatherData) => setWeather(weatherData))
        .finally(() => setIsLoading(false));
    }
  }, [cityData?.latitude, getWeather]);

  useEffect(() => {
    throttledCitySet();
  }, []);

  function success(position: any): void {
    const { latitude, longitude } = position.coords;
    getCityFromLongLat(latitude, longitude).then((data) => {
      setCityData(data);
      setCityInput(data.name);
    });
  }

  function error(): void {
    console.log("Unable to retrieve your location");
  }

  function getBrowserLocation(): void {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(success, error);
    } else {
      console.log("Geolocation not supported");
    }
  }

  const memoizedWeatherName = useMemo(
    (): string => weatherDesc[weatherCode],
    [weatherDesc, weatherCode]
  );

  function renderClothes(): ReactNode {
    const layers: string[] = [];
    type Vibe = "freezing" | "cold" | "chilly" | "medium" | "warm" | "hot";
    let vibe: Vibe = "medium";
    if (
      temperatureApparent === null ||
      rainIntensity === null ||
      snowIntensity === null
    ) {
      return;
    }
    if (rainIntensity > 5) {
      layers.push("umbrella");
    }
    if (uvIndex > 5) {
      layers.push("glasses");
    }
    if (temperatureApparent > 25) {
      vibe = "hot";
    } else if (temperatureApparent > 21) {
      vibe = "warm";
    } else if (temperatureApparent > 17) {
      vibe = "medium";
    } else if (temperatureApparent > 12) {
      vibe = "chilly";
    } else if (temperatureApparent > 6) {
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
    return layers.map((layer, i) => (
      <>
        <Tooltip
          showArrow={true}
          content={upperFirst(layer)}
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

  function renderSkeleton(): JSX.Element {
    return (
      <Card className="flex w-full space-y-5 p-1 sm:p-4" radius="lg">
        <div className="flex flex-row rounded-lg">
          <Skeleton className="w-1/5 rounded-lg">
            <div className="h-10 w-full rounded-lg bg-secondary"></div>
          </Skeleton>
          <Skeleton className="ml-auto w-1/5 rounded-lg">
            <div className="h-6 w-full rounded-lg bg-secondary"></div>
          </Skeleton>
          <Skeleton className="ml-6 flex rounded-full w-12 h-12" />
        </div>
        <div className="flex flex-col sm:flex-row justify-around rounded-lg gap-4">
          <Skeleton className="flex w-full h-64 rounded-lg">
            <div className="rounded-lg bg-secondary"></div>
          </Skeleton>
          <Skeleton className="flex w-full h-64 rounded-lg">
            <div className="rounded-lg bg-secondary"></div>
          </Skeleton>
          <Skeleton className="flex w-full h-64 rounded-lg">
            <div className="rounded-lg bg-secondary"></div>
          </Skeleton>
          <Skeleton className="flex w-full h-64 rounded-lg">
            <div className="rounded-lg bg-secondary"></div>
          </Skeleton>
        </div>
        <div className="space-y-3">
          <Skeleton className="ml-auto w-2/5 rounded-lg flex">
            <div className="h-4 w-full rounded-lg bg-secondary-200"></div>
          </Skeleton>
        </div>
      </Card>
    );
  }

  function onKeyDown(e: any) {
    if (e.code === "Enter") {
      onCitySet();
    }
    return false;
  }

  return (
    <main className="bg-slate-950">
      <div className="flex h-screen min-h-screen flex-col p-4 sm:p-24 items-center ">
        <div className="w-full max-w-6xl">
          <div className="flex mb-32 text-center w-full gap-2 flex-col sm:flex-row">
            <Input
              type="text"
              size="lg"
              label="City"
              color="secondary"
              value={cityInput}
              onValueChange={setCityInput}
              onKeyDown={onKeyDown}
            />
            <Button
              className="h-16 px-8 font-semibold"
              onClick={onCitySet}
              color="secondary"
            >
              Set
            </Button>
            <Button
              className="h-16 px-8 font-semibold"
              onClick={getBrowserLocation}
            >
              Get my location
            </Button>
          </div>
          <div className="flex w-full justify-center">
            {isLoading ? (
              renderSkeleton()
            ) : !!cityData?.country && !!weather?.temperature ? (
              <Card className="flex w-full">
                <CardHeader className=" px-6 flex gap-6">
                  <div className="flex flex-col">
                    <p className="font-semibold text-md text-indigo-300">
                      {cityData?.name}, {cityData?.country}
                    </p>
                  </div>
                  <div className="ml-auto flex flex-row items-center">
                    {windSpeed > 5 && (
                      <Tooltip
                        showArrow={true}
                        content="It's windy!"
                        placement="top"
                        color="secondary"
                      >
                        <Image
                          width={64}
                          alt="windy-icon"
                          src={`/assets/windy.png`}
                        />
                      </Tooltip>
                    )}
                    <div className="ml-6 text-right">
                      <Tooltip
                        showArrow={true}
                        content={`Feels like ${temperatureApparent}℃`}
                        placement="top"
                        color="secondary"
                      >
                        <p className="text-small text-default-500">
                          {temperature !== null
                            ? `${temperature} ℃`
                            : "No data."}
                        </p>
                      </Tooltip>
                      <p className="font-semibold text-md text-indigo-300">
                        {memoizedWeatherName}
                      </p>
                    </div>
                  </div>
                  <Tooltip
                    showArrow={true}
                    content={upperFirst(memoizedWeatherName)}
                    placement="top"
                    color="secondary"
                  >
                    <Image
                      width={64}
                      alt="weather-icon"
                      src={`/assets/${getIconFromWeatherName(
                        memoizedWeatherName
                      )}.png`}
                    />
                  </Tooltip>
                </CardHeader>
                <Divider />
                <CardBody className="flex flex-col sm:flex-row justify-around items-center p-8">
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
              </Card>
            ) : (
              <p>No data.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
