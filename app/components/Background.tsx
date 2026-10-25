import { themes, type ThemeId } from "../lib/conditions";

// Full-page gradient that follows the weather. Re-keyed on every theme so it fades in.
export default function Background({ theme }: { theme: ThemeId }) {
  const { background, glow } = themes[theme];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-950">
      <div key={theme} className="absolute inset-0 animate-fade" style={{ background }} />
      <div
        className="aurora left-1/2 top-[-12rem] h-[26rem] w-[50rem] -translate-x-1/2 opacity-40"
        style={{ background: glow[0] }}
      />
      <div
        className="aurora bottom-[-10rem] right-[-8rem] h-[24rem] w-[28rem] opacity-30 [animation-delay:-10s]"
        style={{ background: glow[1] }}
      />
    </div>
  );
}
