import { useMemo } from "react";

type Glyph = {
  id: number;
  leftPct: number;
  sizePx: number;
  durationS: number;
  delayS: number;
  opacity: number;
  blurPx: number;
  char: string;
};

export function AnimatedBackground() {
  const glyphs = useMemo<Glyph[]>(() => {
    const chars = ["$", "%", "•", "$", "%", "•"];

    return Array.from({ length: 18 }, (_, id) => {
      const durationS = 14 + Math.random() * 18;
      // Negative delay so glyphs are already in motion on load.
      const delayS = -(Math.random() * durationS);

      return {
        id,
        leftPct: Math.random() * 100,
        sizePx: 12 + Math.random() * 18,
        durationS,
        delayS,
        opacity: 0.05 + Math.random() * 0.12,
        blurPx: Math.random() * 1.5,
        char: chars[Math.floor(Math.random() * chars.length)],
      };
    });
  }, []);

  return (
    <div className="commcalc-bg" aria-hidden="true">
      <div className="commcalc-bg__grid" />
      <div className="commcalc-bg__scanline" />
      <div className="commcalc-bg__glyphs">
        {glyphs.map((g) => (
          <span
            key={g.id}
            className="commcalc-bg__glyph"
            style={{
              left: `${g.leftPct}%`,
              fontSize: `${g.sizePx}px`,
              opacity: g.opacity,
              filter: g.blurPx ? `blur(${g.blurPx}px)` : undefined,
              animationDuration: `${g.durationS}s`,
              animationDelay: `${g.delayS}s`,
            }}
          >
            {g.char}
          </span>
        ))}
      </div>
    </div>
  );
}
