export type FuelStudyId = "flame-design" | "cfi-g" | "bass";
export type FuelStudyKind = "flame" | "sample-index";

export interface FuelStudy {
  id: FuelStudyId;
  kind: FuelStudyKind;
  acronym: string;
  title: string;
  file: string;
  source: string;
  fuelColumn: string;
  oxygenColumn: string;
  temperatureColumn: string;
  flowColumn: string;
  testColumn: string;
  dateColumn?: string;
  resultColumn?: string;
}

export const FUEL_STUDIES: FuelStudy[] = [
  {
    id: "flame-design",
    kind: "flame",
    acronym: "PSI-10 · Flame Design",
    title: "Normal-flame test table",
    file: "/nasa-data/PSI-10_Experimental%20table_Flame%20Design_Normal%20Flame.csv",
    source: "PSI-10 experimental table provided with this project.",
    fuelColumn: "Fuel",
    oxygenColumn: "XO2 (init)",
    temperatureColumn: "Tad (K)",
    flowColumn: "mfuel (mg/s)",
    testColumn: "Test",
  },
  {
    id: "cfi-g",
    kind: "flame",
    acronym: "PSI-159 · CFI-G",
    title: "Normal-flame test table",
    file: "/nasa-data/PSI-159_Experimental%20table_CFI-G_Normal%20Flames.csv",
    source: "PSI-159 experimental table provided with this project.",
    fuelColumn: "Fuel",
    oxygenColumn: "XO2 before test",
    temperatureColumn: "Tad (K)",
    flowColumn: "mHC (mg/s)",
    testColumn: "Test",
    resultColumn: "Hot ignition",
  },
  {
    id: "bass",
    kind: "sample-index",
    acronym: "PSI-26 · BASS",
    title: "Sample and test index",
    file: "/nasa-data/PSI-26_Experimental%20table_BASS.csv",
    source: "PSI-26 experimental table provided with this project.",
    fuelColumn: "Fuel Sample Material",
    oxygenColumn: "",
    temperatureColumn: "",
    flowColumn: "",
    testColumn: "Test #",
    dateColumn: "Date",
  },
];

export function parseCsv(text: string): string[][] {
  const records: string[][] = [];
  let record: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      record.push(field.trim());
      field = "";
    } else if (char === "\n") {
      record.push(field.trim().replace(/\r$/, ""));
      if (record.some((value) => value.length > 0)) records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field.trim().replace(/\r$/, ""));
    if (record.some((value) => value.length > 0)) records.push(record);
  }
  return records;
}
