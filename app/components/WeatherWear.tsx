"use client";

import { useState } from "react";

import Background from "./Background";
import Footer from "./Footer";
import SearchBar from "./SearchBar";
import WeatherCard from "./WeatherCard";
import WeatherSkeleton from "./WeatherSkeleton";
import useWeather from "../hooks/useWeather";
import { describeWeather, type ThemeId } from "../lib/conditions";
import type { Gender } from "../lib/outfit";

export default function WeatherWear({ initialCity }: { initialCity: string }) {
  const { state, searchCity, locate } = useWeather(initialCity);
  const [cityInput, setCityInput] = useState(initialCity);
  const [gender, setGender] = useState<Gender>("men");

  // Keep the last good result on screen while the next one loads or fails.
  const shown = state.status === "ready" ? state : state.previous;
  const loading = state.status === "loading";
  const theme: ThemeId = shown
    ? describeWeather(shown.weather.weatherCode, shown.weather.isDay).theme
    : "cloudy";

  const handleLocate = async () => {
    const place = await locate();
    if (place) setCityInput(place.name);
  };

  return (
    <>
      <Background theme={theme} />

      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-5 pb-8 pt-12 sm:pt-20">
        <header className="mb-8 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Weather <span className="gradient-text">Wear</span>
          </h1>
          <p className="mt-3 text-white/70">Not sure what to put on? Get an outfit for the weather outside right now.</p>
        </header>

        <SearchBar
          city={cityInput}
          onCityChange={setCityInput}
          onSearch={searchCity}
          onLocate={handleLocate}
          busy={loading}
        />

        <div className="mt-6 flex-1 space-y-4" aria-live="polite">
          {state.status === "error" && (
            <p role="alert" className="rounded-2xl border border-rose-300/30 bg-rose-500/15 px-5 py-4 text-rose-50">
              {state.message}
            </p>
          )}

          {shown ? (
            <WeatherCard
              place={shown.place}
              weather={shown.weather}
              gender={gender}
              onGenderChange={setGender}
              stale={loading}
            />
          ) : (
            loading && <WeatherSkeleton />
          )}
        </div>

        <Footer />
      </main>
    </>
  );
}
