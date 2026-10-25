import Image from "next/image";
import { FiDroplet, FiSun, FiThermometer, FiWind } from "react-icons/fi";

import GenderIcon from "./GenderIcon";
import { describeWeather } from "../lib/conditions";
import { getOutfit, type Gender } from "../lib/outfit";
import type { Place, Weather } from "../lib/weather";

type WeatherCardProps = {
  place: Place;
  weather: Weather;
  gender: Gender;
  onGenderChange: (gender: Gender) => void;
  /** true while a newer result is loading */
  stale?: boolean;
};

const WINDY_FROM_MS = 5;
const genders: Array<{ id: Gender; label: string }> = [
  { id: "men", label: "Men" },
  { id: "women", label: "Women" },
];

export default function WeatherCard({ place, weather, gender, onGenderChange, stale = false }: WeatherCardProps) {
  const condition = describeWeather(weather.weatherCode, weather.isDay);
  const outfit = getOutfit(weather, condition, gender);

  const stats = [
    { icon: FiThermometer, label: "Feels like", value: `${Math.round(weather.apparentTemperature)}°` },
    { icon: FiWind, label: "Wind", value: `${weather.windSpeed.toFixed(1)} m/s` },
    { icon: FiSun, label: "UV index", value: weather.uvIndex.toFixed(1) },
    { icon: FiDroplet, label: "Rain", value: `${weather.rainIntensity.toFixed(1)} mm/h` },
  ];

  return (
    <article
      aria-busy={stale}
      className={`card animate-rise p-6 transition-opacity duration-300 sm:p-8 ${stale ? "opacity-60" : ""}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-white">
            {place.name}
            {place.country && <span className="text-white/60">, {place.country}</span>}
          </h2>
          <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-display text-7xl font-semibold leading-none tracking-tight text-white">
              {Math.round(weather.temperature)}°
            </span>
            <span className="text-xl text-white/80">{condition.label}</span>
          </p>
          {weather.windSpeed > WINDY_FROM_MS && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3 text-sm text-white">
              <Image src="/assets/windy.png" alt="" width={28} height={28} />
              It&rsquo;s windy!
            </p>
          )}
        </div>
        <Image
          src={`/assets/${condition.icon}.png`}
          alt={condition.label}
          width={104}
          height={104}
          priority
          className="h-20 w-20 shrink-0 drop-shadow-lg sm:h-[104px] sm:w-[104px]"
        />
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3">
            <dt className="flex items-center gap-2 text-xs text-white/60">
              <Icon aria-hidden="true" />
              {label}
            </dt>
            <dd className="mt-1 text-lg font-medium text-white">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8 border-t border-white/10 pt-6" aria-label="What to wear">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-white">What to wear</h3>
          <div role="radiogroup" aria-label="Outfit for" className="inline-flex rounded-full bg-white/10 p-1">
            {genders.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={gender === id}
                onClick={() => onGenderChange(id)}
                className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  gender === id ? "bg-white text-slate-900" : "text-white/70 hover:text-white"
                }`}
              >
                <GenderIcon gender={id} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-5 flex flex-wrap justify-center gap-3">
          {outfit.map((item) => (
            <li key={item.id} className="w-[calc(50%-0.375rem)] sm:w-36">
              <figure className="group flex h-full flex-col items-center rounded-2xl border border-white/10 bg-white/[0.07] p-4 transition hover:-translate-y-1 hover:bg-white/[0.12]">
                <Image
                  src={`/assets/${item.id}.png`}
                  alt=""
                  width={112}
                  height={112}
                  className="h-24 w-24 object-contain transition group-hover:scale-110"
                />
                <figcaption className="mt-3 text-center text-sm text-white/80">{item.label}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-right text-xs text-white/40">
        {place.latitude.toFixed(2)}, {place.longitude.toFixed(2)}
      </p>
    </article>
  );
}
