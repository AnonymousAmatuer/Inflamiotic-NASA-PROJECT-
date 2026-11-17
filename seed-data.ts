type Scores = [number, number, number, number, number, number, number, number];

interface Raw {
  slug: string;
  acronym: string;
  title: string;
  platform: string;
  era: string;
  status: string;
  category: string;
  gravity: "micro" | "partial" | "normal" | "micro+partial";
  fuels: string[];
  summary: string;
  findings: string[];
  fireSafetyInsight: string;
  modelingData: string[];
  modelingNotes: string;
  controlsNotes: string;
  earthNotes: string;
  incidents: string[];
  o2: [number, number];
  p: [number, number];
  flow: [number, number] | null;
  // spacecraft, station, lunar, mars, rover, modeling, controls, earth
  s: Scores;
}

const raw: Raw[] = [
  {
    slug: "saffire-i-iii",
    acronym: "Saffire-I/II/III",
    title: "Spacecraft Fire Safety Experiment (Saffire), first flights",
    platform: "Cygnus free-flyer (after ISS departure)",
    era: "2016–2017",
    status: "Complete",
    category: "Solid flame spread",
    gravity: "micro",
    fuels: ["Cotton-fiberglass fabric (SIBAL)", "Mixed spacecraft materials (Saffire-II/III)"],
    summary:
      "The first meter-scale fires ever lit in space. Remotely ignited samples burned inside a flow duct aboard an uncrewed Cygnus vehicle, so a large fire could be studied with no crew at risk.",
    findings: [
      "Provided the first large-scale microgravity flame-spread data, beyond the few-centimeter samples limited by drop towers and gloveboxes.",
      "Gave a direct check on whether small-sample ground tests scale up to a real spacecraft fire.",
      "Flame growth, heat release and the spacecraft-level response (pressure, temperature, gas species) were all recorded.",
    ],
    fireSafetyInsight:
      "Fire behavior at vehicle scale cannot be inferred from small samples alone. Saffire is the anchor data set for validating spacecraft fire models.",
    modelingData: ["Flame spread rate", "Flame images/video", "Temperature fields", "Heat release / burn rate", "Gas species & pressure rise"],
    modelingNotes:
      "Meter-scale, well-instrumented, with known boundary conditions (flow, O₂, pressure). Ideal for validating CFD fire models and scaling laws.",
    controlsNotes:
      "Informs required sensor placement, response times and the severity of fire a cabin must be designed to survive. It also defines the pressure rise a fire causes.",
    earthNotes:
      "Large-scale flame-spread data helps improve fire models for tunnels, aircraft cabins and other ventilation-limited enclosures.",
    incidents: ["apollo1", "mir"],
    o2: [21, 25],
    p: [70, 101],
    flow: [0, 40],
    s: [9, 9, 6, 6, 7, 9, 6, 4],
  },
  {
    slug: "saffire-iv-vi",
    acronym: "Saffire-IV/V/VI",
    title: "Saffire follow-on flights: exploration atmospheres and new materials",
    platform: "Cygnus free-flyer (after ISS departure)",
    era: "2019–2020",
    status: "Complete",
    category: "Solid flame spread",
    gravity: "micro",
    fuels: ["Spacecraft textiles & plastics", "Cotton-fiberglass fabric", "Cabin-representative material samples"],
    summary:
      "Later Saffire flights varied oxygen level, pressure and flow, including the oxygen-enriched, reduced-pressure atmospheres planned for future exploration vehicles and habitats. They also tested a wider set of crew-cabin materials.",
    findings: [
      "Extends large-scale microgravity flammability data into the O₂/pressure space of planned exploration cabins.",
      "Compares material ranking under microgravity with ranking from standard 1-g flammability tests.",
      "Adds data for how fire size and growth change with atmosphere composition and flow velocity.",
    ],
    fireSafetyInsight:
      "Lower pressure with higher O₂ does not make fire risk equivalent to air at 101 kPa. Materials must be qualified in the atmosphere where they will be used.",
    modelingData: ["Flame spread rate", "Extinction limits (O₂ / flow)", "Flame images/video", "Temperature fields", "Heat release / burn rate"],
    modelingNotes:
      "Directly relevant to calibrating flame-spread models for 56–70 kPa cabins at 26–34% O₂. Pairs with SoFIE for systematic variation.",
    controlsNotes:
      "Supports setting cabin atmosphere limits, material selection rules and the time budget for fire detection and suppression.",
    earthNotes:
      "Material flammability in oxygen-enriched settings applies to medical oxygen, hyperbaric chambers and industrial oxygen handling.",
    incidents: ["apollo1", "apollo13"],
    o2: [21, 34],
    p: [56, 101],
    flow: [0, 25],
    s: [10, 8, 8, 8, 8, 10, 7, 4],
  },
  {
    slug: "sofie-mist",
    acronym: "SoFIE-MIST",
    title: "Solid Fuel Ignition and Extinction – Material Ignition and Suppression Test",
    platform: "ISS – Combustion Integrated Rack (CIR)",
    era: "2020s",
    status: "Ongoing / recent",
    category: "Solid flame spread",
    gravity: "micro",
    fuels: ["PMMA", "Cotton-fiberglass & other spacecraft-relevant solids", "Cylindrical and flat samples"],
    summary:
      "A systematic matrix of ignition, flame spread and extinction tests on solids in a controlled chamber. O₂ concentration, pressure and flow velocity are varied in a single apparatus, and suppression by diluents is explored.",
    findings: [
      "Maps the microgravity flammability boundary for solids as a function of O₂, flow and pressure.",
      "Provides the controlled, repeatable matrix that large-scale tests such as Saffire cannot.",
      "Includes suppression/extinction behavior with changes in atmosphere composition and flow.",
    ],
    fireSafetyInsight:
      "In microgravity, slow flow can reduce flammability margins, because flames can survive in lower O₂ than expected from 1-g tests. The flammability map must be measured, not assumed.",
    modelingData: ["Extinction limits (O₂ / flow)", "Ignition delay & energy", "Flame spread rate", "Temperature fields", "Flame images/video"],
    modelingNotes:
      "Best-in-class for fitting flammability-boundary models: dense parametric coverage with consistent geometry and diagnostics.",
    controlsNotes:
      "Provides the O₂/flow envelope in which a fire is self-sustaining, which directly informs ventilation shutdown and atmosphere-dilution strategies.",
    earthNotes:
      "Flammability limits as functions of oxygen and flow velocity support fire-safe design of enclosures and flame-retardant material screening.",
    incidents: ["apollo1", "mir"],
    o2: [21, 40],
    p: [50, 101],
    flow: [0, 20],
    s: [9, 9, 7, 7, 8, 10, 6, 4],
  },
  {
    slug: "bass-ii",
    acronym: "BASS / BASS-II",
    title: "Burning and Suppression of Solids",
    platform: "ISS – Microgravity Science Glovebox",
    era: "2012–2013",
    status: "Complete",
    category: "Solid flame spread",
    gravity: "micro",
    fuels: ["PMMA (flat & cylindrical)", "Thin cellulosic/cotton-fiberglass", "Spacecraft-relevant polymers"],
    summary:
      "Flames on solid samples in low flow within the glovebox, measuring spread, flame structure and extinction, and testing how diluents suppress the flame.",
    findings: [
      "Showed that burning in microgravity depends strongly on forced-flow velocity: very low flow starves the flame while moderate flow sustains it.",
      "Provided benchmark data for sample geometry effects (flat vs. cylindrical).",
      "Evaluated how diluents (e.g., N₂/CO₂) extinguish solid-fuel flames in the absence of buoyancy.",
    ],
    fireSafetyInsight:
      "Ventilation is a lever. Controlling airflow in a cabin can change whether a fire grows, stalls or extinguishes.",
    modelingData: ["Flame spread rate", "Extinction limits (O₂ / flow)", "Flame images/video", "Temperature fields", "Burn rate / mass loss"],
    modelingNotes:
      "Rich geometry and flow-dependence data for opposed- and concurrent-flow flame-spread models.",
    controlsNotes:
      "Supports design of ventilation-based fire response and diluent-based suppression, e.g. when to shut down fans.",
    earthNotes:
      "Flow-dependent flame spread is relevant to compartment fires, ventilation-controlled burning and wildland-urban interface modeling.",
    incidents: ["mir"],
    o2: [21, 40],
    p: [101, 101],
    flow: [0, 20],
    s: [8, 8, 6, 6, 7, 8, 7, 4],
  },
  {
    slug: "ssce",
    acronym: "SSCE",
    title: "Solid Surface Combustion Experiment",
    platform: "Space Shuttle",
    era: "1990–1992",
    status: "Complete (historic)",
    category: "Solid flame spread",
    gravity: "micro",
    fuels: ["Ashless filter paper"],
    summary:
      "A pioneering Shuttle experiment that spread a flame across thin cellulose in a quiescent, buoyancy-free atmosphere, a classic benchmark case for flame-spread theory.",
    findings: [
      "Established that flame spread in quiescent microgravity is slower and more fragile than in normal gravity.",
      "Gave the community a clean benchmark that is still used to test flame-spread models.",
    ],
    fireSafetyInsight:
      "Without airflow a flame in microgravity weakens or dies, so air movement matters in cabin fire scenarios.",
    modelingData: ["Flame spread rate", "Temperature fields", "Flame images/video"],
    modelingNotes:
      "A simple, well-characterized geometry. Valuable as a verification case for new codes even though fewer variables were sampled than in modern experiments.",
    controlsNotes:
      "Limited direct controls guidance, but demonstrates the self-extinguishing tendency of quiescent microgravity fires.",
    earthNotes:
      "Fundamental thin-fuel flame-spread data supports models of paper and fabric fire spread.",
    incidents: [],
    o2: [20, 50],
    p: [35, 101],
    flow: [0, 0],
    s: [5, 5, 4, 4, 4, 8, 3, 3],
  },
  {
    slug: "dartfire",
    acronym: "DARTFire",
    title: "Diffusive and Radiative Transport in Fires",
    platform: "Space Shuttle / ground reduced-gravity",
    era: "1990s–2000s",
    status: "Complete (historic)",
    category: "Solid flame spread",
    gravity: "micro",
    fuels: ["PMMA slabs", "Thin solid fuel sheets"],
    summary:
      "Investigated how conduction, diffusion and radiation control flame spread over solids when buoyancy is absent, especially under slow imposed flows.",
    findings: [
      "Quantified the role of radiative heat loss in flame quenching at low flow.",
      "Provided data for the transition from diffusion-dominated to radiation-dominated flame spread.",
    ],
    fireSafetyInsight:
      "Radiative loss defines the lowest flows and sizes at which flames survive. It is critical for small, enclosed volumes like rovers.",
    modelingData: ["Radiative loss", "Flame spread rate", "Extinction limits (O₂ / flow)", "Temperature fields"],
    modelingNotes:
      "Useful for validating radiation sub-models, which are often the weakest part of fire simulations.",
    controlsNotes:
      "Informs which low-flow conditions produce self-extinction and where ventilation changes risk.",
    earthNotes:
      "Radiation-controlled flame spread underlies models of upward flame spread on facade and wall materials.",
    incidents: [],
    o2: [21, 50],
    p: [50, 101],
    flow: [0, 15],
    s: [6, 6, 5, 5, 6, 8, 4, 4],
  },
  {
    slug: "msc-smoldering",
    acronym: "MSC",
    title: "Microgravity Smoldering Combustion",
    platform: "Space Shuttle (STS-69, STS-77)",
    era: "1995–1996",
    status: "Complete (historic)",
    category: "Smoldering",
    gravity: "micro",
    fuels: ["Flexible polyurethane foam"],
    summary:
      "Smoldering propagation through porous foam (cushioning, insulation, bedding-like materials) in microgravity, including transition from smolder to flaming.",
    findings: [
      "Smolder propagation depends on how oxygen reaches the reaction zone, and without buoyancy that supply differs from Earth.",
      "Contributed data on conditions that lead to smolder-to-flame transition.",
    ],
    fireSafetyInsight:
      "Smoldering can hide inside cabin materials, producing toxic gas with little visible flame, so early detection must go beyond flame sensing.",
    modelingData: ["Smolder propagation rate", "Temperature fields", "Gas species & pressure rise", "Smoke / aerosol yield"],
    modelingNotes:
      "Rare microgravity porous-fuel data for smolder and transition models. Underrepresented relative to flaming data.",
    controlsNotes:
      "Argues for CO and particulate monitoring in addition to optical smoke detection, and for materials selection that avoids smolder-prone foams.",
    earthNotes:
      "Smolder physics applies to upholstered furniture fires, landfill/peat fires and warehouse insulation.",
    incidents: ["mir"],
    o2: [21, 30],
    p: [101, 101],
    flow: [0, 10],
    s: [7, 7, 6, 6, 7, 7, 6, 6],
  },
  {
    slug: "microgravity-flame-spread-baselines",
    acronym: "Drop-Tower Baselines",
    title: "Reduced-gravity flame spread baselines (drop towers, aircraft, sounding rockets)",
    platform: "Drop towers & parabolic flights",
    era: "1980s–present",
    status: "Ongoing literature base",
    category: "Solid flame spread",
    gravity: "micro",
    fuels: ["Thin cellulose", "PMMA", "Polymer films"],
    summary:
      "Seconds-long microgravity tests that established the flammability boundary concept: the lowest O₂ at which solids will burn under low flow differs from 1-g behavior.",
    findings: [
      "Established that the low-flow flammability boundary in microgravity can be more permissive than 1-g tests suggest.",
      "Provides the large body of small-scale data against which longer ISS experiments are compared.",
    ],
    fireSafetyInsight:
      "Standard 1-g material tests are not automatically conservative for microgravity. This is the original motivation for NASA's space-based fire research.",
    modelingData: ["Extinction limits (O₂ / flow)", "Flame spread rate", "Ignition delay & energy"],
    modelingNotes:
      "Short-duration limits mean steady state isn't always reached, so use with care and prefer ISS data for validation.",
    controlsNotes:
      "Underpins the rationale for material-screening standards that account for low-flow microgravity conditions.",
    earthNotes:
      "Baseline for flammability-limit models used in industrial safety.",
    incidents: [],
    o2: [15, 50],
    p: [35, 101],
    flow: [0, 30],
    s: [6, 6, 4, 4, 5, 6, 5, 4],
  },
  {
    slug: "partial-gravity-flammability",
    acronym: "Partial-g Flammability",
    title: "Lunar- and Mars-gravity flammability (partial-gravity flight profiles)",
    platform: "Reduced-gravity aircraft / ground partial-g facilities",
    era: "2010s–present",
    status: "Ongoing / limited data",
    category: "Solid flame spread",
    gravity: "partial",
    fuels: ["Thin cellulose", "PMMA", "Polymer sheets"],
    summary:
      "Tests whether microgravity is a conservative (worst-case) bound for fires at 0.16 g (Moon) and 0.38 g (Mars), the gravity levels in which habitats and pressurized rovers will actually operate.",
    findings: [
      "Partial gravity restores some buoyant flow, so flame behavior sits between microgravity and 1 g, but not necessarily in a simple way.",
      "Data are limited by test duration (tens of seconds) and sample size.",
    ],
    fireSafetyInsight:
      "This is the biggest evidence gap for surface habitats: almost all long-duration combustion data were taken near 0 g, and surface bases will be at 0.16 or 0.38 g.",
    modelingData: ["Flame spread rate", "Extinction limits (O₂ / flow)", "Flame images/video"],
    modelingNotes:
      "Essential for checking whether models calibrated at 0 g and 1 g interpolate correctly to 0.16–0.38 g.",
    controlsNotes:
      "Needed to decide if microgravity-derived detector and suppressant requirements transfer to surface bases.",
    earthNotes:
      "Gravity-dependent buoyant flow links directly to fire plume and ventilation behavior in tall or low-pressure structures.",
    incidents: [],
    o2: [21, 34],
    p: [56, 101],
    flow: [0, 25],
    s: [3, 3, 10, 10, 9, 8, 6, 3],
  },
  {
    slug: "exploration-atmosphere-flammability",
    acronym: "Exploration Atmospheres",
    title: "Material flammability in exploration cabin atmospheres (ground testing)",
    platform: "Ground: NASA test facilities (1 g)",
    era: "2000s–present",
    status: "Ongoing",
    category: "Material screening",
    gravity: "normal",
    fuels: ["Spacecraft textiles", "Wire insulation", "Foams & plastics", "Packaging"],
    summary:
      "Screening of the materials used in cabins at 26–34% O₂ and 56–70 kPa, the atmospheres under consideration for lunar and Mars surface systems and rovers.",
    findings: [
      "Many materials that are acceptable in air become flammable or burn much faster at elevated O₂ even at reduced pressure.",
      "Provides the practical material qualification evidence behind exploration atmosphere choices.",
    ],
    fireSafetyInsight:
      "The Apollo 1 lesson, fire in an oxygen-rich cabin, is relevant again. Atmosphere choice and material qualification are one design decision.",
    modelingData: ["Extinction limits (O₂ / flow)", "Ignition delay & energy", "Heat release / burn rate"],
    modelingNotes:
      "1-g data, so best used with microgravity and partial-g results to bound behavior.",
    controlsNotes:
      "Directly drives material selection lists and the choice of cabin O₂ and pressure.",
    earthNotes:
      "Applies to oxygen-enriched medical environments, hyperbaric chambers and flame-retardant material qualification.",
    incidents: ["apollo1", "apollo13"],
    o2: [21, 34],
    p: [56, 101],
    flow: [0, 20],
    s: [8, 7, 9, 9, 9, 7, 8, 7],
  },
  {
    slug: "flex",
    acronym: "FLEX",
    title: "Flame Extinguishment Experiment",
    platform: "ISS – Combustion Integrated Rack / Multi-user Droplet Combustion Apparatus",
    era: "2009–2012",
    status: "Complete",
    category: "Droplet combustion & suppression",
    gravity: "micro",
    fuels: ["Heptane, methanol and other fuel droplets"],
    summary:
      "Burned isolated fuel droplets in controlled atmospheres and measured how much CO₂ or N₂ is needed to extinguish them. The goal is to find suppressant requirements for spacecraft.",
    findings: [
      "Measured extinction boundaries as a function of O₂ and diluent type in microgravity.",
      "Compared CO₂ and N₂ as flame-suppressing diluents in a buoyancy-free environment.",
      "Showed that radiation and sooting influence droplet flames, which sets the limits at which they extinguish.",
    ],
    fireSafetyInsight:
      "Suppressant effectiveness must be quantified in microgravity. The data feed design criteria for extinguishing agent mass and concentration in enclosed cabins.",
    modelingData: ["Extinction limits (O₂ / flow)", "Droplet burn rate", "Radiative loss", "Soot / smoke yield", "Suppressant concentration"],
    modelingNotes:
      "Spherically symmetric flames make it ideal for validating detailed chemistry and radiation models.",
    controlsNotes:
      "Delivers suppressant (CO₂ vs. N₂) performance figures useful for sizing extinguishers and total-flooding strategies.",
    earthNotes:
      "Droplet and spray combustion insights help engine, burner and fire-suppression design.",
    incidents: ["mir"],
    o2: [10, 30],
    p: [50, 101],
    flow: null,
    s: [6, 7, 5, 5, 5, 9, 9, 6],
  },
  {
    slug: "flex-2",
    acronym: "FLEX-2 / Cool flames",
    title: "FLEX-2: sooting, radiative extinction and cool flames",
    platform: "ISS – Combustion Integrated Rack / MDCA",
    era: "2012–2013",
    status: "Complete",
    category: "Droplet combustion & suppression",
    gravity: "micro",
    fuels: ["Alkane droplets (e.g., heptane)", "Fuel blends"],
    summary:
      "Follow-on droplet campaign probing sooting, radiative extinction and, unexpectedly, low-temperature “cool flame” burning that continues after the visible flame goes out.",
    findings: [
      "Observed cool-flame combustion: droplets kept burning invisibly at low temperature after the hot flame went out.",
      "Shows that a fire that appears extinguished can continue to release fuel vapor and heat.",
    ],
    fireSafetyInsight:
      "Hot-flame extinction is not necessarily the end of the hazard. Invisible cool flames can persist and re-ignite, so suppression and ventilation after an event must be handled carefully.",
    modelingData: ["Cool-flame chemistry", "Extinction limits (O₂ / flow)", "Soot / smoke yield", "Radiative loss", "Droplet burn rate"],
    modelingNotes:
      "Unique constraint on low-temperature kinetic mechanisms, which are important to realistic ignition and re-ignition modeling.",
    controlsNotes:
      "Indicates post-suppression monitoring is needed to confirm that a fire is out, and informs re-ignition risk analysis.",
    earthNotes:
      "Cool-flame chemistry is central to advanced, cleaner and more efficient engine concepts, plus flammability assessments of fuels.",
    incidents: ["mir"],
    o2: [10, 30],
    p: [50, 101],
    flow: null,
    s: [6, 7, 5, 5, 5, 9, 8, 8],
  },
  {
    slug: "sofball",
    acronym: "SOFBALL",
    title: "Structure of Flame Balls at Low Lewis-number",
    platform: "Space Shuttle (STS-83, STS-94)",
    era: "1997",
    status: "Complete (historic)",
    category: "Gas-phase flames",
    gravity: "micro",
    fuels: ["Very lean hydrogen and light-hydrocarbon mixtures"],
    summary:
      "Studied stable, weakly burning spherical “flame balls” in extremely lean mixtures, which exist only without buoyancy and probe the ultimate limits of flammability.",
    findings: [
      "Flame balls burned stably for minutes, far longer than drop towers can observe (up to ~500 s).",
      "Gave data on flammability limits of lean gases that differ from standard 1-g tubes.",
    ],
    fireSafetyInsight:
      "Gas mixtures normally considered too lean to burn can sustain weak flames without buoyancy, which matters for hydrogen and leak hazards in closed habitats.",
    modelingData: ["Extinction limits (O₂ / flow)", "Flame structure", "Radiative loss", "Gas species & pressure rise"],
    modelingNotes:
      "Stringent test of kinetics and transport models at extreme dilution, with little other data of this type.",
    controlsNotes:
      "Relevant to leak-detection thresholds for fuel gases in life-support and propellant-handling areas of habitats.",
    earthNotes:
      "Lean-limit physics supports ultra-low-emission lean-burn engines and hydrogen safety.",
    incidents: [],
    o2: [5, 21],
    p: [101, 300],
    flow: [0, 0],
    s: [4, 4, 4, 4, 4, 8, 5, 6],
  },
  {
    slug: "cld-flame",
    acronym: "CLD Flame (ACME)",
    title: "Coflow Laminar Diffusion Flame",
    platform: "ISS – Combustion Integrated Rack (ACME)",
    era: "2017–2019",
    status: "Complete",
    category: "Gas-phase flames",
    gravity: "micro",
    fuels: ["Gaseous hydrocarbon fuels, e.g., ethylene, methane"],
    summary:
      "Studies flame shape, soot and extinction for laminar jet flames in coflowing air with varied O₂ and diluents, mimicking small gas-fed fire sources.",
    findings: [
      "Maps soot formation and flame-lift/blow-off limits without buoyancy-induced flow.",
      "Provides tight model validation data for coupled flow, chemistry and soot.",
    ],
    fireSafetyInsight:
      "Defines how flames from a gas leak behave and extinguish in cabins, and how much soot (smoke) they produce.",
    modelingData: ["Soot / smoke yield", "Flame structure", "Extinction limits (O₂ / flow)", "Temperature fields", "Flame images/video"],
    modelingNotes:
      "Axisymmetric, well-defined boundary conditions, ideal for CFD validation of soot and radiation models.",
    controlsNotes:
      "Informs smoke-production assumptions when sizing detectors and filtration.",
    earthNotes:
      "Soot-formation insight is used for cleaner burners, furnaces and combustors.",
    incidents: [],
    o2: [18, 30],
    p: [50, 101],
    flow: [0, 60],
    s: [5, 6, 4, 4, 5, 8, 5, 7],
  },
  {
    slug: "gas-jet",
    acronym: "Gas-Jet Flames (ACME)",
    title: "Gas-Jet Diffusion Flames: soot and smoke emission",
    platform: "ISS – Combustion Integrated Rack (ACME)",
    era: "2017–2019",
    status: "Complete",
    category: "Smoke & soot",
    gravity: "micro",
    fuels: ["Gaseous hydrocarbon jets"],
    summary:
      "Measures how soot builds up and escapes from jet flames in microgravity, including the smoke-point (when a flame starts emitting soot).",
    findings: [
      "Microgravity flames of the same fuel are sootier and emit smoke at lower fuel flow than in 1 g.",
      "Quantifies soot escape, directly tied to what a smoke detector will see.",
    ],
    fireSafetyInsight:
      "In microgravity, fires may produce more smoke for a given heat release, which impacts both detection (easier) and toxicity and visibility (harder).",
    modelingData: ["Soot / smoke yield", "Radiative loss", "Flame structure", "Flame images/video"],
    modelingNotes:
      "Constrains soot-yield parameters used in detector-response and visibility simulations.",
    controlsNotes:
      "Supports smoke-detector alarm thresholds and filtration sizing.",
    earthNotes:
      "Soot emission is a major concern for engine and flare design, and smoke visibility modeling in buildings.",
    incidents: ["mir"],
    o2: [18, 30],
    p: [50, 101],
    flow: [0, 40],
    s: [6, 7, 5, 5, 6, 8, 7, 7],
  },
  {
    slug: "s-flame",
    acronym: "s-Flame (ACME)",
    title: "Structure and Response of Spherical Diffusion Flames",
    platform: "ISS – Combustion Integrated Rack (ACME)",
    era: "2017–2019",
    status: "Complete",
    category: "Gas-phase flames",
    gravity: "micro",
    fuels: ["Gaseous fuels (e.g., methane, ethylene)"],
    summary:
      "Produces ideal one-dimensional spherical flames to quantify radiative extinction, soot and how flames respond to disturbances, the cleanest testbed for combustion chemistry in space.",
    findings: [
      "Identifies radiation-driven extinction limits at low flow.",
      "Provides the cleanest benchmark data for validating soot and chemistry models.",
    ],
    fireSafetyInsight:
      "Radiation-based extinction means small, slow flames can extinguish themselves, but only under specific conditions that can be mapped.",
    modelingData: ["Extinction limits (O₂ / flow)", "Radiative loss", "Soot / smoke yield", "Flame structure", "Temperature fields"],
    modelingNotes:
      "1-D geometry is ideal for detailed kinetics and radiation validation.",
    controlsNotes:
      "Indirect, as it helps define the limits of low-flow flammability that ventilation strategies rely on.",
    earthNotes:
      "Fundamental data improves engine and burner models.",
    incidents: [],
    o2: [18, 40],
    p: [50, 300],
    flow: [0, 0],
    s: [4, 5, 3, 3, 4, 9, 4, 6],
  },
  {
    slug: "e-field-flames",
    acronym: "E-FIELD Flames (ACME)",
    title: "Electric-field effects on flames",
    platform: "ISS – Combustion Integrated Rack (ACME)",
    era: "2017–2019",
    status: "Complete",
    category: "Flame control",
    gravity: "micro",
    fuels: ["Gaseous hydrocarbon jets"],
    summary:
      "Applies electric fields to flames to push, shape and stabilize them, and to reduce soot, which suggests low-power, no-agent methods for controlling flames.",
    findings: [
      "Electric fields can alter flame position, stability and soot output.",
      "Evidence for a consumable-free flame control and, potentially, suppression technology.",
    ],
    fireSafetyInsight:
      "Offers a route toward low-mass flame control that needs no agent resupply, which is attractive for long missions.",
    modelingData: ["Flame structure", "Soot / smoke yield", "Extinction limits (O₂ / flow)", "Flame images/video"],
    modelingNotes:
      "Ion-transport and flame coupling data for models of electrically influenced flames.",
    controlsNotes:
      "A possible basis for next-generation, agent-free flame control and suppression devices.",
    earthNotes:
      "Electric-field combustion control is being explored for cleaner burners, industrial furnaces and electrically assisted fire suppression.",
    incidents: [],
    o2: [18, 30],
    p: [50, 101],
    flow: [0, 30],
    s: [5, 6, 4, 4, 5, 6, 8, 7],
  },
  {
    slug: "flame-design",
    acronym: "Flame Design (ACME)",
    title: "Flame Design: soot-free flame engineering",
    platform: "ISS – Combustion Integrated Rack (ACME)",
    era: "2017–2019",
    status: "Complete",
    category: "Smoke & soot",
    gravity: "micro",
    fuels: ["Gaseous fuels (hydrocarbons, diluted)"],
    summary:
      "Uses flame geometry and dilution to design flames that produce little or no soot, with microgravity enabling clean tests of the concept.",
    findings: [
      "Tests how to shape and dilute flames to avoid soot formation.",
      "Provides data to sharpen soot predictions used across combustion engineering.",
    ],
    fireSafetyInsight:
      "Better understanding of soot reduces toxic smoke and visibility loss in a cabin fire, and helps refine smoke-yield predictions.",
    modelingData: ["Soot / smoke yield", "Flame structure", "Temperature fields"],
    modelingNotes:
      "Constrains soot-formation sub-models.",
    controlsNotes:
      "Indirect, as it informs smoke-production assumptions.",
    earthNotes:
      "Strongly applicable to cleaner industrial burners and low-emission engines.",
    incidents: [],
    o2: [18, 30],
    p: [50, 101],
    flow: [0, 30],
    s: [3, 4, 3, 3, 3, 6, 3, 8],
  },
  {
    slug: "bre",
    acronym: "BRE",
    title: "Burning Rate Emulator",
    platform: "ISS – Microgravity Science Glovebox",
    era: "2012–2013",
    status: "Complete",
    category: "Gas-phase flames",
    gravity: "micro",
    fuels: ["Gaseous fuel emulating solid-fuel burning rates"],
    summary:
      "A gas burner whose fuel flow emulates a burning solid, so that fire size and heat feedback can be tested in a controlled, repeatable way.",
    findings: [
      "Offers controlled burn-rate scaling for studying the growth and extinction of fire-like flames.",
      "Allows large flames without the variability of real materials.",
    ],
    fireSafetyInsight:
      "Gives a repeatable way to test detectors and suppression approaches against a defined fire size.",
    modelingData: ["Heat release / burn rate", "Flame structure", "Flame images/video", "Temperature fields"],
    modelingNotes:
      "Controlled fire source with known heat release, convenient for validating fire-plume models.",
    controlsNotes:
      "A potential standard fire source for qualifying detectors and suppressants in microgravity.",
    earthNotes:
      "Emulated-burner approaches are used for fire-model validation and fire-suppression test standards.",
    incidents: [],
    o2: [21, 30],
    p: [101, 101],
    flow: [0, 20],
    s: [6, 7, 5, 5, 6, 8, 6, 5],
  },
  {
    slug: "candle-flame",
    acronym: "CFM",
    title: "Candle Flame in Microgravity",
    platform: "ISS – Microgravity Science Glovebox",
    era: "2000s–2010s",
    status: "Complete",
    category: "Gas-phase flames",
    gravity: "micro",
    fuels: ["Candle wax (paraffin)"],
    summary:
      "Examined how candle flames burn and extinguish without buoyancy. The flame becomes a dim, spherical, nearly soot-free shape that is sustained by slow diffusion.",
    findings: [
      "Microgravity candle flames are spherical, weak and prone to extinguish if air supply stops.",
      "Dramatic confirmation that ventilation and gravity determine the flame's survival.",
    ],
    fireSafetyInsight:
      "Fires in microgravity can be oxygen-starved and self-extinguish in stagnant air. This is why fans and airflow are fire-risk factors.",
    modelingData: ["Flame structure", "Extinction limits (O₂ / flow)", "Flame images/video"],
    modelingNotes:
      "Excellent small-scale validation for diffusion-limited flame models.",
    controlsNotes:
      "Supports the principle of ventilation shutdown as a first-line response.",
    earthNotes:
      "Education and outreach value, plus fundamental diffusion flame validation.",
    incidents: ["mir"],
    o2: [21, 21],
    p: [101, 101],
    flow: [0, 0],
    s: [5, 6, 3, 3, 4, 6, 5, 4],
  },
  {
    slug: "same",
    acronym: "SAME",
    title: "Smoke Aerosol Measurement Experiment",
    platform: "ISS (Cygnus/ISS)",
    era: "2007–2010s",
    status: "Complete",
    category: "Smoke & soot",
    gravity: "micro",
    fuels: ["Overheated Teflon", "Kapton", "Cellulose", "Silicone rubber"],
    summary:
      "Measured the particle size distributions of smoke from overheated spacecraft materials in microgravity, to ensure spacecraft smoke detectors are designed for the smoke they will actually encounter.",
    findings: [
      "Particle size data from realistic pyrolysis smoke in microgravity, which determines detector response.",
      "Informs which detection principles (ionization vs. photoelectric) are best suited to which smoke types.",
    ],
    fireSafetyInsight:
      "Smoke from overheated wiring and polymers can differ from the test smoke detectors are certified with. Detectors must be matched to what actually burns.",
    modelingData: ["Smoke particle size distribution", "Smoke / aerosol yield", "Gas species & pressure rise"],
    modelingNotes:
      "Quantifies the smoke input to detector-response and transport models.",
    controlsNotes:
      "Directly supports spacecraft smoke detector design, alarm thresholds and false-alarm reduction.",
    earthNotes:
      "Applies to smoke-detector design for homes, aircraft, data centers and mines, where nuisance alarms are a problem.",
    incidents: ["apollo13", "mir"],
    o2: [21, 21],
    p: [101, 101],
    flow: [0, 10],
    s: [9, 9, 7, 7, 8, 8, 10, 9],
  },
  {
    slug: "csd",
    acronym: "CSD",
    title: "Comparative Soot Diagnostics",
    platform: "ISS",
    era: "2011",
    status: "Complete",
    category: "Smoke & soot",
    gravity: "micro",
    fuels: ["Gaseous hydrocarbon flames"],
    summary:
      "Compared several soot measurement techniques on the same microgravity flames to identify which diagnostics are best suited for spacecraft smoke and soot sensing.",
    findings: [
      "Cross-validated soot measurement methods in microgravity.",
      "Provides guidance on sensor technology choices for soot and smoke monitoring.",
    ],
    fireSafetyInsight:
      "Different smoke sensing methods can disagree. Knowing which is accurate in microgravity is crucial for dependable alarms.",
    modelingData: ["Soot / smoke yield", "Smoke particle size distribution", "Flame structure"],
    modelingNotes:
      "Helps quantify measurement uncertainty in soot data used for modeling.",
    controlsNotes:
      "Informs sensor technology selection for next-generation detection systems.",
    earthNotes:
      "Soot sensing methods carry over to emissions monitoring and air-quality instrumentation.",
    incidents: [],
    o2: [18, 30],
    p: [101, 101],
    flow: [0, 20],
    s: [6, 7, 5, 5, 6, 7, 8, 7],
  },
  {
    slug: "water-mist-suppression",
    acronym: "Water Mist",
    title: "Fine water mist fire suppression for crewed vehicles",
    platform: "ISS-derived technology development / ground & reduced-gravity tests",
    era: "2010s–present",
    status: "Technology development",
    category: "Suppression technology",
    gravity: "micro+partial",
    fuels: ["Solid and electrical-fire surrogates"],
    summary:
      "Fine water mist is cooling and oxygen-displacing, and has less toxicity and cleanup burden than gaseous agents such as CO₂ in a sealed cabin. Droplet behavior without buoyancy and with low pressure must be understood.",
    findings: [
      "Mist droplets act differently in microgravity: no sedimentation, so they stay suspended and can reach shielded areas.",
      "Technology has already spun back to Earth as compact extinguishers for homes and hospitals.",
    ],
    fireSafetyInsight:
      "Mist can serve as a lighter, less hazardous alternative to CO₂, but it must be proven against hidden electrical and rack fires.",
    modelingData: ["Suppressant concentration", "Droplet size distribution", "Temperature fields", "Extinction limits (O₂ / flow)"],
    modelingNotes:
      "Data on droplet transport and evaporation in low-g supports multiphase suppression models.",
    controlsNotes:
      "Core data for next-generation portable extinguishers and fixed systems for habitats and rovers.",
    earthNotes:
      "Fine-water-mist extinguishers are a direct terrestrial spinoff, valued for clean, water-based suppression in homes, museums, ships and hospitals.",
    incidents: ["mir", "apollo1"],
    o2: [21, 34],
    p: [56, 101],
    flow: null,
    s: [9, 9, 8, 8, 9, 6, 10, 10],
  },
];

export const seedInvestigations = raw.map((r) => ({
  slug: r.slug,
  acronym: r.acronym,
  title: r.title,
  platform: r.platform,
  era: r.era,
  status: r.status,
  category: r.category,
  gravity: r.gravity,
  fuels: r.fuels,
  summary: r.summary,
  findings: r.findings,
  fireSafetyInsight: r.fireSafetyInsight,
  modelingData: r.modelingData,
  modelingNotes: r.modelingNotes,
  controlsNotes: r.controlsNotes,
  earthNotes: r.earthNotes,
  incidents: r.incidents,
  o2Min: r.o2[0],
  o2Max: r.o2[1],
  pMin: r.p[0],
  pMax: r.p[1],
  flowMin: r.flow ? r.flow[0] : null,
  flowMax: r.flow ? r.flow[1] : null,
  scoreSpacecraft: r.s[0],
  scoreStation: r.s[1],
  scoreLunar: r.s[2],
  scoreMars: r.s[3],
  scoreRover: r.s[4],
  scoreModeling: r.s[5],
  scoreControls: r.s[6],
  scoreEarth: r.s[7],
}));

export type Investigation = (typeof seedInvestigations)[number];
