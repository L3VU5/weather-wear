const link = "underline decoration-white/30 underline-offset-4 transition hover:text-white hover:decoration-white";

export default function Footer() {
  return (
    <footer className="mt-12 flex flex-col gap-3 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Weather data by{" "}
        <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer" className={link}>
          Open-Meteo.com
        </a>
        , place names by{" "}
        <a href="https://www.bigdatacloud.com/" target="_blank" rel="noopener noreferrer" className={link}>
          BigDataCloud
        </a>
        .
      </p>
      <p>
        By{" "}
        <a href="https://github.com/L3VU5" target="_blank" rel="noopener noreferrer" className={link}>
          Paweł Jędrasik
        </a>{" "}
        &middot;{" "}
        <a
          href="https://github.com/L3VU5/weather-wear"
          target="_blank"
          rel="noopener noreferrer"
          className={link}
        >
          Source
        </a>
      </p>
    </footer>
  );
}
