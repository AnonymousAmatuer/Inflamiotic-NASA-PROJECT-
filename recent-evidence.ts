/** Selected rows from the newly added NASA tables, kept with their source labels. */
export const RECENT_EVIDENCE = [
  {
    study: "BASS-II",
    title: "PMMA flame spread tests",
    source: "NASA/TM-20210011385, Table 5.1 (compiled in bass_II_PMMA_test_matrix_v0.2.csv)",
    note: "The source table reports test sequences. Rows below preserve the listed flow and spread-rate values; they are not pooled into a single material property.",
    rows: [
      { test: "M1", thickness: "1 mm", airflow: "9 cm/s", spread: "0.071 mm/s", oxygen: "22.2% → 21.9%", sides: "1" },
      { test: "M2", thickness: "3 mm", airflow: "20 → 15 cm/s", spread: "0.052 → 0.033 mm/s", oxygen: "22.2% → 21.2%", sides: "1" },
      { test: "M3", thickness: "5 mm", airflow: "10 → 20 cm/s", spread: "0.029 → 0.024 mm/s", oxygen: "20.8% → 19.7%", sides: "1" },
      { test: "M4", thickness: "5 mm", airflow: "5 → 3 cm/s", spread: "0.045 → 0.033 mm/s", oxygen: "21.8% → 19.8%", sides: "2" },
      { test: "M5", thickness: "3 mm", airflow: "10 cm/s", spread: "0.071 mm/s", oxygen: "22.2% → 19.0%", sides: "2" },
    ],
  },
  {
    study: "SAFFIRE-I",
    title: "SIBAL fabric flight tests",
    source: "NASA NTRS 2017 report, Table I (compiled in saffire_I_III_sample_matrix_v0.2.csv)",
    note: "Two large SIBAL samples burned in the listed airflow. The source records different burn durations for concurrent and opposed flow; these two tests alone do not establish a general comparison.",
    rows: [
      { test: "I-1 · concurrent", thickness: "0.37 mm", airflow: "20 cm/s", spread: "1.8 mm/s", oxygen: "21.7%", sides: "84 cm burned in 420 s" },
      { test: "I-2 · opposed", thickness: "0.37 mm", airflow: "20 cm/s", spread: "1.3 mm/s", oxygen: "21.5%", sides: "10 cm burned in 70 s" },
    ],
  },
] as const;

export const EVIDENCE_NOTES = [
  "BASS-II findings compilation: low-flow flame observations are specific to the reported fuels and apparatus.",
  "NASA PSI combustion findings compilation: catalogue-level entries are marked as pending where experiment-specific results were not verified.",
  "Additional files include SAFFIRE, BASS, ACME, CFI-G and flame-design tables. Their raw rows remain in the supplied source files; no unverified summaries are promoted as findings here.",
] as const;

export const NASA_FILES = [
  ["Findings compilation", "nasa_psi_combustion_findings_v0.1.csv"],
  ["Flame Design · normal flame", "PSI-10_Experimental%20table_Flame%20Design_Normal%20Flame.csv"],
  ["ACME · BRE", "PSI-20_Experimental%20table_ACME%20BRE.csv"],
  ["BASS", "PSI-26_Experimental%20table_BASS.csv"],
  ["SAFFIRE-I", "PSI-98_Experimental%20table_SAFFIRE-1.csv"],
  ["SAFFIRE-III", "PSI-100_Experimental%20table_SAFFIRE-3.csv"],
  ["Data summary", "PSI-142_Experimental%20table_Data%20Summary%20Table.csv"],
  ["CFI-G · normal flames", "PSI-159_Experimental%20table_CFI-G_Normal%20Flames.csv"],
  ["BASS-II · PMMA test matrix", "bass_II_PMMA_test_matrix_v0.2.csv"],
  ["SAFFIRE-I–III · sample matrix", "saffire_I_III_sample_matrix_v0.2.csv"],
].map(([label, file]) => ({ label, href: `/nasa-data/${file}` }));

export const VERIFIED_FINDINGS = [
  {
    study: "BASS-II",
    finding: "NASA's technical summary reports flames that remained stable below 1 cm/s in some tests; a sudden rise in airflow could make a low-flow flame flare up.",
    boundary: "Applies to the tested fuels and setup. It should not be read as a prediction for every cabin material or airflow change.",
  },
  {
    study: "FLEX",
    finding: "NASA summaries describe droplets that continued to vaporize after the visible flame went out, until a later cool-flame event in some conditions.",
    boundary: "FLEX summaries cover different campaigns and suppressant sets; the underlying test conditions need to stay attached to each result.",
  },
  {
    study: "DAFT",
    finding: "NASA describes DAFT as an instrument-feasibility test developed ahead of the Smoke Aerosol Measurement Experiment.",
    boundary: "This establishes the instrument's purpose, not a quantitative performance result.",
  },
] as const;
