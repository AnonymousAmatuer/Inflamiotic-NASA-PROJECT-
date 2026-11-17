export type EnvKey = "spacecraft" | "station" | "lunar" | "mars" | "rover";

export interface Environment {
  key: EnvKey;
  label: string;
  short: string;
  blurb: string;
  o2: [number, number]; // % by volume
  p: [number, number]; // kPa
  gravity: "micro" | "partial";
  gLabel: string;
  risks: string[];
  color: string;
}

export const ENVIRONMENTS: Environment[] = [
  {
    key: "spacecraft",
    label: "Transit spacecraft",
    short: "Spacecraft",
    blurb: "Crew capsules and transit vehicles with small volume, limited escape options and possible reduced-pressure operations.",
    o2: [21, 34],
    p: [56, 101],
    gravity: "micro",
    gLabel: "~0 g",
    risks: ["Wire insulation & electronics", "No escape, no outside help", "Atmosphere changes for suit operations"],
    color: "#38bdf8",
  },
  {
    key: "station",
    label: "Space station",
    short: "Station",
    blurb: "ISS-like orbital stations with near-sea-level air, large modular volumes and a long fire history (Mir 1997).",
    o2: [20.9, 23.5],
    p: [95, 103],
    gravity: "micro",
    gLabel: "~0 g",
    risks: ["Racks & power equipment", "Air handling spreads smoke", "Oxygen generation hardware"],
    color: "#a78bfa",
  },
  {
    key: "lunar",
    label: "Lunar surface base",
    short: "Lunar base",
    blurb: "Surface habitats at 0.16 g, probably operated at oxygen-enriched, reduced-pressure atmospheres for EVA readiness.",
    o2: [26.5, 34],
    p: [56.5, 70.3],
    gravity: "partial",
    gLabel: "0.16 g",
    risks: ["Dust on equipment & seals", "Oxygen-enriched air", "Regolith/dust-laden smoke sensing"],
    color: "#fbbf24",
  },
  {
    key: "mars",
    label: "Mars surface base",
    short: "Mars base",
    blurb: "Long-duration surface habitats at 0.38 g with no resupply or rescue and full dependence on onboard fire safety.",
    o2: [26.5, 34],
    p: [56.5, 70.3],
    gravity: "partial",
    gLabel: "0.38 g",
    risks: ["No abort or rescue", "Limited extinguishing agent resupply", "Long-term material degradation"],
    color: "#fb7185",
  },
  {
    key: "rover",
    label: "Pressurized rover",
    short: "Rover",
    blurb: "Small mobile cabins with high-power batteries and motors, carrying crew away from the base for days.",
    o2: [26.5, 34],
    p: [55, 70.3],
    gravity: "partial",
    gLabel: "0.16–0.38 g",
    risks: ["Battery & motor fires in tiny volumes", "Very short escape time", "Vibration-induced wire damage"],
    color: "#34d399",
  },
];

export interface Incident {
  id: string;
  name: string;
  date: string;
  headline: string;
  cause: string;
  lesson: string;
  relevantTo: string;
}

export const INCIDENTS: Incident[] = [
  {
    id: "apollo1",
    name: "Apollo 1 cabin fire",
    date: "27 Jan 1967",
    headline: "A fire during a pre-launch test killed all three crew members.",
    cause:
      "A fast-spreading fire in a nearly pure-oxygen cabin atmosphere (about 100% O₂ at roughly 115 kPa) fueled by materials in the cabin; the hatch could not be opened quickly.",
    lesson:
      "Atmosphere composition and material flammability cannot be treated separately, and crews need a rapid escape. Led to flame-resistant materials, a redesigned hatch and revised cabin atmosphere practice.",
    relevantTo: "Oxygen-enriched exploration cabins and material qualification.",
  },
  {
    id: "apollo13",
    name: "Apollo 13 oxygen tank failure",
    date: "13–17 Apr 1970",
    headline: "An oxygen tank rupture crippled the service module on the way to the Moon.",
    cause:
      "Damaged wire insulation inside an oxygen tank is believed to have arced and ignited materials in the oxygen-rich tank, rupturing it.",
    lesson:
      "Electrical faults in oxygen-rich systems can cause catastrophic fires. Wire insulation and oxygen system design merit particular scrutiny.",
    relevantTo: "Wire/electrical ignition, oxygen systems, and no-abort transit missions.",
  },
  {
    id: "mir",
    name: "Mir oxygen-generator fire",
    date: "23 Feb 1997",
    headline: "A solid-fuel oxygen generator burned violently inside the station, filling it with smoke.",
    cause:
      "A solid-fuel oxygen generator (“oxygen candle”) malfunctioned, producing intense flame and molten metal; crew fought the fire and wore respirators for the smoke.",
    lesson:
      "Even life-support hardware is a fire source. Smoke spreads through the whole station quickly, and crew response (extinguishers, masks, communications) must be rehearsed.",
    relevantTo: "Station fire response, smoke detection and portable extinguishers.",
  },
];

export interface Spinoff {
  name: string;
  era: string;
  origin: string;
  application: string;
  linkedSlugs: string[];
}

export const SPINOFFS: Spinoff[] = [
  {
    name: "Firefighter air tanks and breathing gear",
    era: "1970s",
    origin: "Lightweight spacesuit life-support technology.",
    application: "Lighter, higher-capacity firefighter breathing equipment that extends working time and reduces fatigue.",
    linkedSlugs: ["same", "water-mist-suppression"],
  },
  {
    name: "Smoke detector with dust discrimination",
    era: "1970s",
    origin: "Detector developed for the Space Shuttle that distinguishes smoke from dust.",
    application: "Fewer nuisance alarms, with industrial uses such as mining. SAME and CSD smoke data continue to improve detection design.",
    linkedSlugs: ["same", "csd", "gas-jet"],
  },
  {
    name: "Protective fire attire",
    era: "1980s",
    origin: "Spacesuit thermal-protection technology.",
    application: "Improved firefighter clothing for heat and flame protection. Material flammability data drives ongoing improvements.",
    linkedSlugs: ["exploration-atmosphere-flammability", "saffire-iv-vi"],
  },
  {
    name: "Fine-water-mist extinguishers",
    era: "2010s",
    origin: "Developed for ISS use as a clean, low-toxicity alternative to CO₂ extinguishers.",
    application: "Compact water-based extinguishers for homes, ships, museums, data rooms and hospitals.",
    linkedSlugs: ["water-mist-suppression", "flex"],
  },
  {
    name: "Cleaner engines & burners",
    era: "Ongoing",
    origin: "Droplet, soot and cool-flame results from FLEX, FLEX-2, ACME.",
    application: "Lower-emission combustors, advanced engine concepts and soot control in industrial burners.",
    linkedSlugs: ["flex-2", "flame-design", "cld-flame", "s-flame"],
  },
];

export const MODELING_DATA_DESCRIPTIONS: Record<string, string> = {
  "Flame spread rate": "Speed at which a flame front advances across a fuel; input to fire growth models.",
  "Extinction limits (O₂ / flow)": "Oxygen and flow conditions at which a flame can no longer survive; defines flammability boundaries.",
  "Ignition delay & energy": "Time and energy needed to ignite a material; sets ignition-source risk.",
  "Heat release / burn rate": "Energy output of a fire, the key to predicting temperature and pressure rise.",
  "Temperature fields": "Measured gas and solid temperatures for validating CFD fire simulations.",
  "Flame images/video": "Images to validate flame shape, size and structure predictions.",
  "Gas species & pressure rise": "Combustion products (CO, CO₂, etc.) and cabin pressure effects.",
  "Soot / smoke yield": "Smoke generated per unit fuel; drives detection and visibility models.",
  "Smoke particle size distribution": "Particle sizes that determine how smoke detectors respond.",
  "Smoke / aerosol yield": "Aerosol production, relevant to toxicity and filtration.",
  "Radiative loss": "Heat radiated away from a flame, which sets low-flow extinction.",
  "Flame structure": "Detailed flame geometry and chemistry for kinetic model validation.",
  "Smolder propagation rate": "Speed of smoldering through porous fuels such as foam.",
  "Droplet burn rate": "Burning rate of fuel droplets, used in spray and droplet models.",
  "Suppressant concentration": "Concentration of agent needed to extinguish; design criterion for extinguishers.",
  "Droplet size distribution": "Size of water-mist droplets, which controls cooling and transport.",
  "Cool-flame chemistry": "Low-temperature chemistry that can persist after the visible flame is gone.",
};
