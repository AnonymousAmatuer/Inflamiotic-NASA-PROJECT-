"use client";

import { useEffect, useState } from "react";

type PassingPlanet = {
  id: number;
  top: number;
  size: number;
  duration: number;
  direction: "forward" | "reverse";
  palette: "blue" | "violet" | "rust";
};

export default function PassingPlanets() {
  const [planet, setPlanet] = useState<PassingPlanet | null>(null);

  useEffect(() => {
    let launchTimer = 0;
    let nextTimer = 0;

    const launch = () => {
      setPlanet({
        id: Date.now(),
        top: 12 + Math.random() * 76,
        size: 30 + Math.random() * 52,
        duration: 3.2 + Math.random() * 2.4,
        direction: Math.random() > 0.5 ? "forward" : "reverse",
        palette: (["blue", "violet", "rust"] as const)[Math.floor(Math.random() * 3)],
      });
      nextTimer = window.setTimeout(launch, 6000 + Math.random() * 1000);
    };

    launchTimer = window.setTimeout(launch, 6000 + Math.random() * 1000);

    return () => {
      window.clearTimeout(launchTimer);
      window.clearTimeout(nextTimer);
    };
  }, []);

  if (!planet) return null;

  return (
    <span
      key={planet.id}
      aria-hidden="true"
      className={`passing-planet planet-${planet.direction} planet-${planet.palette}`}
      style={{
        top: `${planet.top}%`,
        width: `${planet.size}px`,
        height: `${planet.size}px`,
        animationDuration: `${planet.duration}s`,
      }}
      onAnimationEnd={() => setPlanet(null)}
    >
      <span className="planet-body" />
    </span>
  );
}
